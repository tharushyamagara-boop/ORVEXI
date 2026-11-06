// Contact Directory & Audience Groups Store
// Handles contact lists, group segmentation, recipients management,
// CSV exports/imports, Firestore persistence (crm_contacts / crm_groups), and LocalStorage fallback.

import { db } from '../firebase.js';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  writeBatch,
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

const CONTACTS_STORAGE_KEY = 'orvexi_contacts_v1';
const GROUPS_STORAGE_KEY = 'orvexi_groups_v1';
const DELETED_CONTACTS_STORAGE_KEY = 'orvexi_deleted_contacts_v1';
const DELETED_GROUPS_STORAGE_KEY = 'orvexi_deleted_groups_v1';
const CONTACTS_INITIALIZED_KEY = 'orvexi_contacts_initialized_v1';

export const DEFAULT_GROUPS = [
  'Enterprise & Corporate',
  'Campuses & Universities',
  'Financial & Fintech',
  'Schools & Academies',
  'Government & Public',
  'Tech Partners & Startups',
  'Admin'
];

export const INITIAL_CONTACTS = [
  {
    id: 'cnt-1',
    name: 'Aline Ikibasumba',
    email: 'aline.ikibasumba@oneandonlyresorts.com',
    phone: '+250 788 123 456',
    organization: 'One&Only Gorilla\'s Nest',
    group: 'Enterprise & Corporate',
    createdAt: '2026-10-15T08:30:00Z'
  },
  {
    id: 'cnt-2',
    name: 'Dr. Nathan Chiroma',
    email: 'nathan.chiroma@act.ac.rw',
    phone: '+250 788 987 654',
    organization: 'African College of Technology',
    group: 'Campuses & Universities',
    createdAt: '2026-10-18T10:15:00Z'
  },
  {
    id: 'cnt-3',
    name: 'ICT Department',
    email: 'info@ur.ac.rw',
    phone: '+250 252 530 028',
    organization: 'University of Rwanda (UR)',
    group: 'Campuses & Universities',
    createdAt: '2026-10-20T14:00:00Z'
  },
  {
    id: 'cnt-4',
    name: 'Direction Pédagogique',
    email: 'ecolelespionniers@gmail.com',
    phone: '+250 788 345 678',
    organization: 'École Les Pionniers Kigali',
    group: 'Schools & Academies',
    createdAt: '2026-10-22T09:20:00Z'
  },
  {
    id: 'cnt-5',
    name: 'Administration TTCR',
    email: 'ttcrubengera3@gmail.com',
    phone: '+250 788 234 567',
    organization: 'TTC Rubengera Education Hub',
    group: 'Schools & Academies',
    createdAt: '2026-10-24T11:45:00Z'
  },
  {
    id: 'cnt-6',
    name: 'Kigali Innovation City Desk',
    email: 'partnerships@kic.rw',
    phone: '+250 788 456 789',
    organization: 'Rwanda Development Board (RDB)',
    group: 'Government & Public',
    createdAt: '2026-10-26T16:10:00Z'
  },
  {
    id: 'cnt-7',
    name: 'Fintech Operations Lead',
    email: 'engineering@bk.rw',
    phone: '+250 788 567 890',
    organization: 'Bank of Kigali Tech & Digital',
    group: 'Financial & Fintech',
    createdAt: '2026-10-28T13:30:00Z'
  },
  {
    id: 'cnt-8',
    name: 'Theophile Harushyamagara',
    email: 'ceo@orvexi.rw',
    phone: '+250 788 810 675',
    organization: 'ORVEXI LTD Core',
    group: 'Admin',
    createdAt: '2026-10-01T08:00:00Z'
  }
];

class ContactStore {
  constructor() {
    this.deletedContactIds = this.loadDeletedIds(DELETED_CONTACTS_STORAGE_KEY);
    this.deletedGroups = this.loadDeletedIds(DELETED_GROUPS_STORAGE_KEY);
    this.groups = this.loadGroups();
    this.contacts = this.loadContacts();
    this.listeners = [];
    this.initFirestoreSync();
  }

  loadDeletedIds(key) {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch (e) {}
    return new Set();
  }

  saveDeletedIds(key, idSet) {
    try {
      localStorage.setItem(key, JSON.stringify(Array.from(idSet)));
    } catch (e) {}
  }

  loadGroups() {
    try {
      const stored = localStorage.getItem(GROUPS_STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter(g => !this.deletedGroups.has(g));
        }
      }
    } catch (e) {}
    return DEFAULT_GROUPS.filter(g => !this.deletedGroups.has(g));
  }

  loadContacts() {
    try {
      const isInit = localStorage.getItem(CONTACTS_INITIALIZED_KEY);
      const stored = localStorage.getItem(CONTACTS_STORAGE_KEY);
      // If initialized before, honor stored array (even if empty `[]` when purged)
      if (isInit === 'true' && stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter(c => c && c.id && !this.deletedContactIds.has(c.id));
        }
      }
    } catch (e) {}

    // First time initializing: seed sample contacts excluding any tombstones
    const seeded = INITIAL_CONTACTS.filter(c => !this.deletedContactIds.has(c.id));
    try {
      localStorage.setItem(CONTACTS_INITIALIZED_KEY, 'true');
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(seeded));
    } catch (e) {}
    return seeded;
  }

  saveLocal() {
    try {
      this.contacts = (this.contacts || []).filter(c => c && c.id && !this.deletedContactIds.has(c.id));
      this.groups = (this.groups || []).filter(g => !this.deletedGroups.has(g));
      localStorage.setItem(CONTACTS_INITIALIZED_KEY, 'true');
      localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(this.groups));
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(this.contacts));
    } catch (e) {}
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => {
      try { fn({ contacts: this.contacts, groups: this.groups }); } catch (e) {}
    });
  }

  async initFirestoreSync() {
    if (!db) return;
    try {
      // 1. Fetch remote groups
      const gSnap = await getDocs(collection(db, 'crm_groups'));
      if (!gSnap.empty) {
        const remoteGroups = [];
        gSnap.forEach(d => {
          const data = d.data();
          const name = data.name;
          if (name) {
            if (this.deletedGroups.has(name)) {
              deleteDoc(d.ref).catch(() => {});
              return;
            }
            remoteGroups.push(name);
          }
        });
        if (remoteGroups.length > 0) {
          this.groups = Array.from(new Set([...this.groups, ...remoteGroups])).filter(g => !this.deletedGroups.has(g));
        }
      }

      // 2. Fetch remote contacts & safely merge
      const cSnap = await getDocs(query(collection(db, 'crm_contacts'), orderBy('name', 'asc')));
      if (!cSnap.empty) {
        const remoteContacts = [];
        cSnap.forEach(d => {
          const id = d.id;
          if (this.deletedContactIds.has(id)) {
            // Document was deleted by admin locally; clean up remote Firestore doc
            deleteDoc(d.ref).catch(() => {});
            return;
          }
          remoteContacts.push({ id: d.id, ...d.data() });
        });

        const map = new Map(this.contacts.filter(c => !this.deletedContactIds.has(c.id)).map(c => [c.id, c]));
        remoteContacts.forEach(r => {
          if (!this.deletedContactIds.has(r.id)) {
            const existing = map.get(r.id);
            map.set(r.id, existing ? { ...r, ...existing } : r);
          }
        });
        this.contacts = Array.from(map.values()).filter(c => !this.deletedContactIds.has(c.id));
      }
      this.saveLocal();
    } catch (e) {
      console.warn('Could not sync contacts from Firestore:', e.message || e);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Group Management                                                         */
  /* ------------------------------------------------------------------------ */
  getGroups() {
    return this.groups;
  }

  addGroup(groupName) {
    const trimmed = (groupName || '').trim();
    if (!trimmed) throw new Error('Group name cannot be empty');
    if (this.groups.some(g => g.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error(`Group "${trimmed}" already exists.`);
    }

    if (this.deletedGroups.has(trimmed)) {
      this.deletedGroups.delete(trimmed);
      this.saveDeletedIds(DELETED_GROUPS_STORAGE_KEY, this.deletedGroups);
    }

    this.groups.push(trimmed);
    this.saveLocal();

    if (db) {
      try {
        const gid = 'grp-' + trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-');
        setDoc(doc(db, 'crm_groups', gid), {
          name: trimmed,
          createdAt: new Date().toISOString()
        }, { merge: true }).catch(err => console.warn('Firestore group sync skipped:', err.message || err));
      } catch (e) {}
    }
    return trimmed;
  }

  renameGroup(oldName, newName) {
    const trimmed = (newName || '').trim();
    if (!trimmed) throw new Error('Group name cannot be empty');
    if (oldName === trimmed) return;

    this.groups = this.groups.map(g => g === oldName ? trimmed : g);
    // Update all contacts that belong to oldName
    this.contacts = this.contacts.map(c => {
      if (c.group === oldName) {
        return { ...c, group: trimmed };
      }
      return c;
    });

    this.saveLocal();

    if (db) {
      try {
        const batch = writeBatch(db);
        this.contacts.filter(c => c.group === trimmed).forEach(c => {
          batch.set(doc(db, 'crm_contacts', c.id), { ...c, group: trimmed }, { merge: true });
        });
        batch.commit().catch(err => console.warn('Firestore group rename sync skipped:', err.message || err));
      } catch (e) {}
    }
  }

  async deleteGroup(groupName) {
    this.deletedGroups.add(groupName);
    this.saveDeletedIds(DELETED_GROUPS_STORAGE_KEY, this.deletedGroups);

    this.groups = this.groups.filter(g => g !== groupName);
    // Reassign contacts to fallback or keep unassigned
    const fallbackGroup = this.groups[0] || 'General';
    this.contacts = this.contacts.map(c => {
      if (c.group === groupName) {
        return { ...c, group: fallbackGroup };
      }
      return c;
    });

    this.saveLocal();

    if (db) {
      try {
        const gid = 'grp-' + groupName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        await deleteDoc(doc(db, 'crm_groups', gid));
      } catch (e) {
        console.warn('Firestore group delete skipped:', e.message || e);
      }
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Contact / Recipient Management                                           */
  /* ------------------------------------------------------------------------ */
  getContacts({ group = 'All', search = '' } = {}) {
    return this.contacts.filter(c => {
      if (group !== 'All' && group !== 'All Contacts') {
        if (!c.group || c.group.toLowerCase() !== group.toLowerCase()) {
          return false;
        }
      }

      if (search) {
        const q = search.toLowerCase();
        const matchName = (c.name || '').toLowerCase().includes(q);
        const matchEmail = (c.email || '').toLowerCase().includes(q);
        const matchPhone = (c.phone || '').toLowerCase().includes(q);
        const matchOrg = (c.organization || '').toLowerCase().includes(q);
        const matchGroup = (c.group || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchOrg && !matchGroup) {
          return false;
        }
      }

      return true;
    });
  }

  addContact({ name, email, phone = '', organization = '', group = '' }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) throw new Error('Email address is required');

    // Duplicate check
    const existing = this.contacts.find(c => c.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error(`A contact with email "${cleanEmail}" already exists.`);
    }

    const assignedGroup = group || this.groups[0] || 'General';
    const id = 'cnt-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    if (this.deletedContactIds.has(id)) {
      this.deletedContactIds.delete(id);
      this.saveDeletedIds(DELETED_CONTACTS_STORAGE_KEY, this.deletedContactIds);
    }

    const newContact = {
      id,
      name: (name || '').trim() || cleanEmail.split('@')[0],
      email: cleanEmail,
      phone: (phone || '').trim(),
      organization: (organization || '').trim(),
      group: assignedGroup,
      createdAt: new Date().toISOString()
    };

    this.contacts.unshift(newContact);
    this.saveLocal();

    if (db) {
      try {
        setDoc(doc(db, 'crm_contacts', id), newContact, { merge: true })
          .catch(err => console.warn('Firestore contact save skipped:', err.message || err));
      } catch (e) {}
    }

    return newContact;
  }

  updateContact(id, updatedFields) {
    const idx = this.contacts.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Contact not found');

    const updated = {
      ...this.contacts[idx],
      ...updatedFields,
      updatedAt: new Date().toISOString()
    };

    this.contacts[idx] = updated;
    this.saveLocal();

    if (db) {
      try {
        setDoc(doc(db, 'crm_contacts', id), updated, { merge: true })
          .catch(err => console.warn('Firestore contact update skipped:', err.message || err));
      } catch (e) {}
    }

    return updated;
  }

  async deleteContact(id) {
    if (!id) return;
    this.deletedContactIds.add(id);
    this.saveDeletedIds(DELETED_CONTACTS_STORAGE_KEY, this.deletedContactIds);

    this.contacts = this.contacts.filter(c => c.id !== id);
    this.saveLocal();

    if (db) {
      try {
        await deleteDoc(doc(db, 'crm_contacts', id));
      } catch (err) {
        console.warn('Firestore contact delete skipped:', err.message || err);
      }
    }
  }

  async deleteContacts(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return;
    ids.forEach(id => this.deletedContactIds.add(id));
    this.saveDeletedIds(DELETED_CONTACTS_STORAGE_KEY, this.deletedContactIds);

    const idSet = new Set(ids);
    this.contacts = this.contacts.filter(c => !idSet.has(c.id));
    this.saveLocal();

    if (db) {
      try {
        const batch = writeBatch(db);
        ids.forEach(id => {
          batch.delete(doc(db, 'crm_contacts', id));
        });
        await batch.commit();
      } catch (err) {
        console.warn('Firestore batch delete skipped:', err.message || err);
      }
    }
  }

  async purgeAll() {
    this.contacts.forEach(c => {
      if (c && c.id) this.deletedContactIds.add(c.id);
    });
    this.saveDeletedIds(DELETED_CONTACTS_STORAGE_KEY, this.deletedContactIds);

    this.contacts = [];
    this.saveLocal();

    if (db) {
      try {
        const snap = await getDocs(collection(db, 'crm_contacts'));
        const batch = writeBatch(db);
        snap.forEach(d => batch.delete(d.ref));
        await batch.commit();
      } catch (err) {
        console.warn('Firestore purge skipped:', err.message || err);
      }
    }
  }

  /**
   * Sync all local active contacts & groups to Firestore
   */
  async syncAllToFirestore() {
    if (!db) return 0;
    try {
      const batch = writeBatch(db);
      const activeGroups = this.groups.filter(g => !this.deletedGroups.has(g));
      activeGroups.forEach(g => {
        const gid = 'grp-' + g.toLowerCase().replace(/[^a-z0-9]/g, '-');
        batch.set(doc(db, 'crm_groups', gid), { name: g, updatedAt: new Date().toISOString() }, { merge: true });
      });

      const activeContacts = this.contacts.filter(c => c && c.id && !this.deletedContactIds.has(c.id));
      const cleanContacts = JSON.parse(JSON.stringify(activeContacts));
      cleanContacts.slice(0, 450).forEach(c => {
        batch.set(doc(db, 'crm_contacts', c.id), c, { merge: true });
      });

      await batch.commit();
      return cleanContacts.length;
    } catch (e) {
      console.warn('Could not sync all contacts to Firestore:', e.message || e);
      return 0;
    }
  }

  /**
   * Download a ready-to-use CSV template for bulk contact import.
   * Can be downloaded either populated with realistic sample rows or blank.
   */
  downloadTemplate({ populated = true } = {}) {
    const headers = ['Contact Name', 'Email Address', 'Phone Number', 'Organization', 'Group / Sector'];
    const sampleRows = populated ? [
      ['Theophile Harushyamagara', 'ceo@orvexi.rw', '+250 788 810 675', 'ORVEXI LTD', 'Technology & Startups'],
      ['Dr. Nathan Chiroma', 'nathan.chiroma@act.ac.rw', '+250 788 123 456', 'Adventist University of Central Africa', 'Education & Academic'],
      ['Aline Ikibasumba', 'aline.ikibasumba@oneandonlyresorts.com', '+250 788 234 567', 'One&Only Nyungwe House', 'Hotels & Hospitality'],
      ['Jean Bosco', 'bosco@bankofkigali.rw', '+250 788 345 678', 'Bank of Kigali', 'Financial & Fintech'],
      ['Clarisse Umutoni', 'clarisse@rbc.gov.rw', '+250 788 456 789', 'Rwanda Biomedical Centre', 'Healthcare & Medical'],
      ['Emmanuel Gasana', 'gasana@rdb.rw', '+250 788 567 890', 'Rwanda Development Board', 'Government & Public Sector']
    ] : [];

    const lines = [
      headers.join(','),
      ...sampleRows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
    ];

    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = populated ? 'orvexi_contacts_populated_template.csv' : 'orvexi_contacts_blank_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Parse a single row of CSV/TSV/delimited text respecting quoted values
   */
  parseCSVRow(row) {
    if (!row) return [];
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"' || char === "'") {
        if (inQuotes && row[i + 1] === char) {
          current += char;
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if ((char === ',' || char === '\t' || char === ';') && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result.map(s => s.replace(/^["']|["']$/g, '').trim());
  }

  /**
   * Parse contacts from raw CSV text or an attached populated template file.
   * Detects header columns dynamically, validates emails, and identifies duplicates.
   */
  parseContactsFromText(rawText, defaultGroup = '') {
    if (!rawText || !rawText.trim()) {
      return { totalLines: 0, contacts: [], duplicates: [], invalid: [], headersDetected: false };
    }

    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      return { totalLines: 0, contacts: [], duplicates: [], invalid: [], headersDetected: false };
    }

    // Check first line for column headers
    const firstRowParts = this.parseCSVRow(lines[0]);
    const lowerFirst = firstRowParts.map(p => p.toLowerCase());
    const hasHeaderSignature = lowerFirst.some(p => 
      p.includes('name') || p.includes('email') || p.includes('phone') || 
      p.includes('org') || p.includes('company') || p.includes('group') || p.includes('sector')
    );
    const firstHasNoEmail = !firstRowParts.some(p => p.includes('@'));
    const headersDetected = hasHeaderSignature && firstHasNoEmail;

    let nameIdx = 0;
    let emailIdx = 1;
    let phoneIdx = 2;
    let orgIdx = 3;
    let groupIdx = 4;

    if (headersDetected) {
      const nIdx = lowerFirst.findIndex(h => h.includes('name'));
      const eIdx = lowerFirst.findIndex(h => h.includes('email') || h.includes('mail') || h.includes('address'));
      const pIdx = lowerFirst.findIndex(h => h.includes('phone') || h.includes('tel') || h.includes('mobile'));
      const oIdx = lowerFirst.findIndex(h => h.includes('org') || h.includes('company') || h.includes('firm') || h.includes('institution'));
      const gIdx = lowerFirst.findIndex(h => h.includes('group') || h.includes('sector') || h.includes('category'));

      if (nIdx !== -1) nameIdx = nIdx;
      if (eIdx !== -1) emailIdx = eIdx;
      if (pIdx !== -1) phoneIdx = pIdx;
      if (oIdx !== -1) orgIdx = oIdx;
      if (gIdx !== -1) groupIdx = gIdx;
    }

    const dataLines = headersDetected ? lines.slice(1) : lines;
    const validContacts = [];
    const duplicates = [];
    const invalid = [];
    const seenInBatch = new Set();
    const existingEmails = new Set(this.contacts.map(c => (c.email || '').toLowerCase().trim()));

    const fallbackGroup = (defaultGroup && defaultGroup !== '__AUTO__') ? defaultGroup : (this.groups[0] || 'General');

    dataLines.forEach((line, lineIndex) => {
      const parts = this.parseCSVRow(line);
      if (parts.length === 0 || (parts.length === 1 && !parts[0])) return;

      let email = '';
      let name = '';
      let phone = '';
      let organization = '';
      let rowGroup = '';

      // Direct column lookup
      if (parts[emailIdx] && parts[emailIdx].includes('@')) {
        email = parts[emailIdx].toLowerCase().trim();
      } else {
        // Fallback: search all columns for the first cell containing '@'
        const foundIdx = parts.findIndex(p => p.includes('@'));
        if (foundIdx !== -1) {
          email = parts[foundIdx].toLowerCase().trim();
        }
      }

      if (!email || !email.includes('@')) {
        invalid.push({ line: lineIndex + 1, raw: line, reason: 'Missing or invalid email address' });
        return;
      }

      // Extract Name
      if (nameIdx < parts.length && nameIdx !== emailIdx && parts[nameIdx]) {
        name = parts[nameIdx];
      } else if (parts[0] && parts[0] !== email) {
        name = parts[0];
      } else {
        name = email.split('@')[0];
      }

      // Extract Phone
      if (phoneIdx < parts.length && phoneIdx !== emailIdx && parts[phoneIdx]) {
        phone = parts[phoneIdx];
      }

      // Extract Organization
      if (orgIdx < parts.length && orgIdx !== emailIdx && parts[orgIdx]) {
        organization = parts[orgIdx];
      }

      // Extract Group / Sector
      if (groupIdx < parts.length && groupIdx !== emailIdx && parts[groupIdx]) {
        rowGroup = parts[groupIdx];
      }

      const assignedGroup = (defaultGroup && defaultGroup !== '__AUTO__')
        ? defaultGroup
        : (rowGroup || fallbackGroup);

      if (existingEmails.has(email) || seenInBatch.has(email)) {
        duplicates.push({ name, email, organization, group: assignedGroup });
        return;
      }

      seenInBatch.add(email);
      validContacts.push({
        id: 'cnt-' + Date.now() + '-' + Math.floor(Math.random() * 100000) + '-' + validContacts.length,
        name: name || email.split('@')[0],
        email,
        phone,
        organization,
        group: assignedGroup,
        createdAt: new Date().toISOString()
      });
    });

    return {
      totalLines: lines.length,
      dataRowsCount: dataLines.length,
      headersDetected,
      contacts: validContacts,
      duplicates,
      invalid
    };
  }

  /**
   * Import contacts from raw CSV text or an attached populated template
   */
  async importContacts(rawText, defaultGroup = '') {
    if (!rawText) return 0;
    const parsed = this.parseContactsFromText(rawText, defaultGroup);
    const newItems = parsed.contacts || [];

    if (newItems.length > 0) {
      // Auto-create any new groups present in the template rows
      newItems.forEach(item => {
        if (item.group && !this.groups.includes(item.group)) {
          this.groups.push(item.group);
        }
      });

      newItems.forEach(item => {
        if (this.deletedContactIds.has(item.id)) {
          this.deletedContactIds.delete(item.id);
        }
      });
      this.saveDeletedIds(DELETED_CONTACTS_STORAGE_KEY, this.deletedContactIds);

      this.contacts = [...newItems, ...this.contacts];
      this.saveLocal();

      if (db) {
        try {
          const batch = writeBatch(db);
          newItems.slice(0, 450).forEach(item => {
            batch.set(doc(db, 'crm_contacts', item.id), item);
          });
          await batch.commit();
        } catch (e) {}
      }
    }

    return newItems.length;
  }

  /**
   * Export contacts as CSV file
   */
  exportCSV(selectedGroup = 'All') {
    const list = this.getContacts({ group: selectedGroup });
    const headers = ['Contact Name', 'Email Address', 'Phone Number', 'Organization', 'Group / Sector', 'Date Added'];
    const rows = list.map(c => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${c.email || ''}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.organization || '').replace(/"/g, '""')}"`,
      `"${(c.group || '').replace(/"/g, '""')}"`,
      `"${(c.createdAt || '').slice(0, 10)}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orvexi-contacts-${selectedGroup.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  getStats() {
    const total = this.contacts.length;
    const groupCounts = {};
    this.groups.forEach(g => {
      groupCounts[g] = 0;
    });

    this.contacts.forEach(c => {
      const g = c.group || 'Other';
      groupCounts[g] = (groupCounts[g] || 0) + 1;
    });

    return { total, groupCounts };
  }

  getEmailsByGroup(groupName) {
    if (groupName === 'All' || groupName === 'All Contacts' || groupName === 'All Saved') {
      return this.contacts.map(c => c.email).filter(Boolean);
    }
    return this.contacts.filter(c => (c.group || '').toLowerCase() === groupName.toLowerCase()).map(c => c.email).filter(Boolean);
  }
}

export const contactStore = new ContactStore();

