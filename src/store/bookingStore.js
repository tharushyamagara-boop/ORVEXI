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
  writeBatch,
  updateDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

const STORAGE_KEY = 'orvexi_bookings_v1';
const DELETED_BOOKINGS_STORAGE_KEY = 'orvexi_deleted_bookings_v1';
const BOOKINGS_INITIALIZED_KEY = 'orvexi_bookings_initialized_v1';

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
    id: 'req-sample-default-081',
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
    createdAt: '2026-11-01T10:00:00.000Z',
    createdAtFormatted: '11/1/2026'
  }
];

class BookingStore {
  constructor() {
    this.deletedBookingIds = this.loadDeletedIds();
    this.bookings = this.loadLocal();
    this.listeners = [];
    this.initFirestoreSync();
  }

  loadDeletedIds() {
    try {
      const stored = localStorage.getItem(DELETED_BOOKINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch (e) {}
    return new Set();
  }

  saveDeletedIds() {
    try {
      localStorage.setItem(DELETED_BOOKINGS_STORAGE_KEY, JSON.stringify(Array.from(this.deletedBookingIds)));
    } catch (e) {}
  }

  loadLocal() {
    try {
      const isInit = localStorage.getItem(BOOKINGS_INITIALIZED_KEY);
      const stored = localStorage.getItem(STORAGE_KEY);
      // If initialized before, honor stored array (even if empty `[]` when all records were deleted)
      if (isInit === 'true' && stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter(b => b && b.id && !this.deletedBookingIds.has(b.id));
        }
      }
    } catch (e) {}

    // First time visit / brand new storage: seed initial samples
    const seeded = DEFAULT_BOOKINGS.filter(b => !this.deletedBookingIds.has(b.id));
    try {
      localStorage.setItem(BOOKINGS_INITIALIZED_KEY, 'true');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    } catch (e) {}
    return seeded;
  }

  saveLocal(bookings) {
    this.bookings = (bookings || []).filter(b => b && b.id && !this.deletedBookingIds.has(b.id));
    try {
      localStorage.setItem(BOOKINGS_INITIALIZED_KEY, 'true');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.bookings));
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
          const id = docSnap.id;
          // If deleted by admin locally, ensure it is NOT resurrected and cleanup Firestore doc
          if (this.deletedBookingIds.has(id)) {
            deleteDoc(docSnap.ref).catch(() => {});
            return;
          }
          remote.push({ id: docSnap.id, ...docSnap.data() });
        });

        const map = new Map(this.bookings.filter(b => !this.deletedBookingIds.has(b.id)).map(b => [b.id, b]));
        remote.forEach(r => {
          if (!this.deletedBookingIds.has(r.id)) {
            const existing = map.get(r.id);
            map.set(r.id, existing ? { ...r, ...existing } : r);
          }
        });
        const merged = Array.from(map.values()).filter(b => !this.deletedBookingIds.has(b.id));
        merged.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        this.saveLocal(merged);
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

    if (this.deletedBookingIds.has(id)) {
      this.deletedBookingIds.delete(id);
      this.saveDeletedIds();
    }

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
   * Permanently delete a booking from Firestore & LocalStorage
   */
  async deleteBooking(id) {
    if (!id) return;
    this.deletedBookingIds.add(id);
    this.saveDeletedIds();

    const filtered = this.bookings.filter(b => b.id !== id);
    this.saveLocal(filtered);

    if (db) {
      try {
        await deleteDoc(doc(db, 'service_requests', id));
      } catch (e) {
        console.warn('Firestore delete skipped:', e.message || e);
      }
    }
  }

  /**
   * Permanently delete multiple bookings
   */
  async deleteBookings(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return;
    ids.forEach(id => this.deletedBookingIds.add(id));
    this.saveDeletedIds();

    const idSet = new Set(ids);
    const filtered = this.bookings.filter(b => !idSet.has(b.id));
    this.saveLocal(filtered);

    if (db) {
      try {
        const batch = writeBatch(db);
        ids.forEach(id => batch.delete(doc(db, 'service_requests', id)));
        await batch.commit();
      } catch (e) {
        console.warn('Firestore batch delete skipped:', e.message || e);
      }
    }
  }

  /**
   * Permanently purge all service requests and bookings
   */
  async purgeAll() {
    this.bookings.forEach(b => {
      if (b && b.id) this.deletedBookingIds.add(b.id);
    });
    this.saveDeletedIds();
    this.bookings = [];
    this.saveLocal([]);

    if (db) {
      try {
        const snapshot = await getDocs(collection(db, 'service_requests'));
        const batch = writeBatch(db);
        snapshot.forEach(docSnap => batch.delete(docSnap.ref));
        await batch.commit();
      } catch (e) {
        console.warn('Firestore bookings purge skipped:', e.message || e);
      }
    }
  }

  /**
   * Sync all local active bookings to Firestore
   */
  async syncAllToFirestore() {
    if (!db) return 0;
    try {
      const active = this.bookings.filter(b => b && b.id && !this.deletedBookingIds.has(b.id));
      if (active.length === 0) return 0;
      const cleanBookings = JSON.parse(JSON.stringify(active));
      const batch = writeBatch(db);
      cleanBookings.forEach(b => {
        batch.set(doc(db, 'service_requests', b.id), b, { merge: true });
      });
      await batch.commit();
      return cleanBookings.length;
    } catch (e) {
      console.warn('Could not sync all bookings to Firestore:', e.message || e);
      return 0;
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

