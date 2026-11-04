// Service Requests & Bookings Store
// Handles client service requests, appointment scheduling,
// Firestore persistence (service_requests collection), and LocalStorage backup.

import { db } from '../firebase.js';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

const STORAGE_KEY = 'orvexi_bookings_v1';

export const SERVICE_CATEGORIES = [
  'Software Publishing & Custom Development',
  'Computer Programming Activities',
  'IT Consultancy & Systems Advisory',
  'Data Processing & Cloud Infrastructure',
  'Web Portals & Enterprise Platforms',
  'Mobile Apps & Digital Architecture',
  'General Technical Consultation'
];

export const TIME_SLOTS = [
  'Morning (09:00 - 12:00)',
  'Afternoon (12:00 - 16:00)',
  'Late Afternoon (16:00 - 18:00)',
  'Flexible / Any Time'
];

export const ATTRIBUTION_CHANNELS = [
  'Website Direct',
  'Google Search',
  'LinkedIn',
  'Referral / Partner',
  'Client Recommendation',
  'Direct Email / Call'
];

// Seed sample request inspired by the SANEX booking system
const DEFAULT_BOOKINGS = [
  {
    id: 'req-' + Date.now(),
    reference: 'ORV-2026-081',
    customerName: 'Theophile Harushyamagara',
    email: 'orvexi@gmail.com',
    phone: '+250788810675',
    service: 'Software Publishing & Custom Development',
    preferredDate: '2026-11-11',
    preferredDateFormatted: 'Wed, Nov 11, 2026',
    timeSlot: 'Afternoon (12:00 - 16:00)',
    channel: 'Google Search',
    status: 'Pending', // Pending | Confirmed | Completed | Cancelled
    notes: 'Inquiry regarding enterprise digital architecture and software publishing deployment.',
    locationUrl: '',
    createdAt: new Date().toISOString(),
    createdAtFormatted: new Date().toLocaleDateString('en-US')
  }
];

class BookingStore {
  constructor() {
    this.bookings = this.loadLocal();
    this.listeners = [];
    this.initFirestoreSync();
  }

  loadLocal() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_BOOKINGS;
  }

  saveLocal(bookings) {
    this.bookings = bookings;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    } catch (e) {}
    this.notify();
  }

  async initFirestoreSync() {
    if (!db) return;
    try {
      const q = query(collection(db, 'service_requests'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const remote = [];
        snapshot.forEach(docSnap => {
          remote.push({ id: docSnap.id, ...docSnap.data() });
        });
        if (remote.length > 0) {
          // Merge remote into local by ID so locally added/updated bookings are preserved
          const map = new Map(this.bookings.map(b => [b.id, b]));
          remote.forEach(r => {
            const existing = map.get(r.id);
            map.set(r.id, existing ? { ...r, ...existing } : r);
          });
          const merged = Array.from(map.values());
          merged.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          this.saveLocal(merged);
        }
      }
    } catch (e) {
      console.warn('Could not sync service requests from Firestore:', e.message || e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => {
      try { fn(this.bookings); } catch (e) {}
    });
  }

  formatDate(dateStr) {
    if (!dateStr) return 'Not specified';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  }

  /**
   * Add a new service request from the public website or admin
   */
  addBooking(data) {
    const id = 'req-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const reference = 'ORV-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);
    const dateFormatted = this.formatDate(data.preferredDate);
    const nowIso = new Date().toISOString();

    const booking = {
      id,
      reference,
      customerName: (data.customerName || 'Anonymous Client').trim(),
      email: (data.email || '').trim(),
      phone: (data.phone || '').trim(),
      service: data.service || 'General Technical Consultation',
      preferredDate: data.preferredDate || nowIso.slice(0, 10),
      preferredDateFormatted: dateFormatted,
      timeSlot: data.timeSlot || 'Flexible / Any Time',
      channel: data.channel || 'Website Direct',
      status: 'Pending',
      notes: (data.notes || '').trim(),
      locationUrl: (data.locationUrl || '').trim(),
      createdAt: nowIso,
      createdAtFormatted: new Date().toLocaleDateString('en-US')
    };

    // 1. Immediately persist locally (instant UI feedback, never blocked by network)
    const updated = [booking, ...this.bookings];
    this.saveLocal(updated);

    // 2. Sync to Firestore in background without blocking
    if (db) {
      try {
        setDoc(doc(db, 'service_requests', id), booking, { merge: true })
          .catch(e => console.warn('Firestore service request save skipped:', e.message || e));
      } catch (e) {
        console.warn('Firestore service request error:', e.message || e);
      }
    }

    return booking;
  }

  /**
   * Update request status (e.g. Pending -> Confirmed -> Completed / Cancelled)
   */
  updateStatus(id, newStatus) {
    const booking = this.bookings.find(b => b.id === id);
    if (!booking) return null;

    booking.status = newStatus;
    const nowIso = new Date().toISOString();
    booking.updatedAt = nowIso;

    // 1. Immediately persist locally
    this.saveLocal([...this.bookings]);

    // 2. Sync to Firestore in background without blocking
    if (db) {
      try {
        setDoc(doc(db, 'service_requests', id), {
          status: newStatus,
          updatedAt: nowIso
        }, { merge: true }).catch(e => console.warn('Firestore status update skipped:', e.message || e));
      } catch (e) {
        console.warn('Firestore status update error:', e.message || e);
      }
    }

    return booking;
  }

  /**
   * Delete a booking from Firestore & LocalStorage
   */
  deleteBooking(id) {
    const filtered = this.bookings.filter(b => b.id !== id);
    this.saveLocal(filtered);

    if (db) {
      try {
        deleteDoc(doc(db, 'service_requests', id))
          .catch(e => console.warn('Firestore delete skipped:', e.message || e));
      } catch (e) {
        console.warn('Firestore delete error:', e.message || e);
      }
    }
  }

  /**
   * Filter bookings based on status, search string, and channel
   */
  getBookings({ status = 'All', search = '', channel = 'All' } = {}) {
    return this.bookings.filter(b => {
      // 1. Status Filter
      if (status !== 'All' && b.status.toLowerCase() !== status.toLowerCase()) {
        return false;
      }

      // 2. Channel Filter
      if (channel !== 'All' && channel !== 'All Channels') {
        if (!b.channel || b.channel.toLowerCase() !== channel.toLowerCase()) {
          return false;
        }
      }

      // 3. Search query
      if (search) {
        const q = search.toLowerCase();
        const matchName = (b.customerName || '').toLowerCase().includes(q);
        const matchEmail = (b.email || '').toLowerCase().includes(q);
        const matchPhone = (b.phone || '').toLowerCase().includes(q);
        const matchService = (b.service || '').toLowerCase().includes(q);
        const matchRef = (b.reference || '').toLowerCase().includes(q);
        const matchNotes = (b.notes || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchService && !matchRef && !matchNotes) {
          return false;
        }
      }

      return true;
    });
  }

  getPendingCount() {
    return this.bookings.filter(b => b.status === 'Pending').length;
  }

  getStats() {
    const total = this.bookings.length;
    const pending = this.bookings.filter(b => b.status === 'Pending').length;
    const confirmed = this.bookings.filter(b => b.status === 'Confirmed').length;
    const completed = this.bookings.filter(b => b.status === 'Completed').length;
    const cancelled = this.bookings.filter(b => b.status === 'Cancelled').length;

    // Channel breakdown
    const channelMap = {};
    this.bookings.forEach(b => {
      const ch = b.channel || 'Website Direct';
      channelMap[ch] = (channelMap[ch] || 0) + 1;
    });

    return { total, pending, confirmed, completed, cancelled, channelMap };
  }

  /**
   * Export all bookings as CSV spreadsheet file
   */
  exportCSV() {
    const headers = ['Reference', 'Status', 'Date Submitted', 'Customer Name', 'Email', 'Phone', 'Requested Service', 'Appointment Date', 'Time Window', 'Attribution Channel', 'Notes', 'Location URL'];
    
    const rows = this.bookings.map(b => [
      `"${b.reference || ''}"`,
      `"${b.status || ''}"`,
      `"${b.createdAtFormatted || ''}"`,
      `"${(b.customerName || '').replace(/"/g, '""')}"`,
      `"${b.email || ''}"`,
      `"${b.phone || ''}"`,
      `"${(b.service || '').replace(/"/g, '""')}"`,
      `"${b.preferredDateFormatted || ''}"`,
      `"${b.timeSlot || ''}"`,
      `"${b.channel || ''}"`,
      `"${(b.notes || '').replace(/"/g, '""')}"`,
      `"${b.locationUrl || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orvexi-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

export const bookingStore = new BookingStore();

