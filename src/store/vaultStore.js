// Cloud Source Code Vault Store
// Manages project source code uploads, storage in Google Cloud / Firebase Storage,
// and metadata records in Firestore & LocalStorage.

import { 
  storage, 
  storageRef, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject, 
  db 
} from '../firebase.js';

import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

const STORAGE_KEY = 'orvexi_backup_vault_v1';

export const SUPPORTED_PROJECTS = [
  { id: 'orvexi-corporate', name: 'ORVEXI Corporate Website', repo: 'github.com/orvexi/corporate' },
  { id: 'loprok', name: 'LopRok (Music Creator Platform)', repo: 'loprok.com' },
  { id: 'sanex-core', name: 'SANEX Core (Sanitation Systems)', repo: 'sanex.rw' },
  { id: 'asserwa', name: 'ASSERWA (Forum of Sewage Emptiers)', repo: 'asserwa.com' },
  { id: 'equiterra', name: 'Equiterra Consulting Dashboard', repo: 'equiterraconsulting.com' },
  { id: 'scdt-tontine', name: 'Ikimina (SCDT Tontine Microfinance)', repo: 'hosted.app' },
  { id: 'client-custom', name: 'Other / Custom Client Project', repo: 'client' }
];

// Initial default seed backups if empty (so user sees sample structure immediately)
const DEFAULT_BACKUPS = [
  {
    id: 'backup-orvexi-initial',
    projectId: 'orvexi-corporate',
    projectName: 'ORVEXI Corporate Website',
    versionTag: 'v1.0.0-stable',
    fileName: 'orvexi-corporate-v1.0.0.zip',
    fileSize: 4820000,
    fileSizeFormatted: '4.8 MB',
    notes: 'Initial production codebase with Hero Slider, Admin CMS, and Portfolio 1920x1090 landscape screenshots.',
    downloadUrl: '#',
    storagePath: 'source-vault/orvexi-corporate/orvexi-corporate-v1.0.0.zip',
    timestamp: new Date().toISOString(),
    author: 'System Admin'
  }
];

class VaultStore {
  constructor() {
    this.backups = this.loadLocal();
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
    return DEFAULT_BACKUPS;
  }

  saveLocal(backups) {
    this.backups = backups;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(backups));
    } catch (e) {}
    this.notify();
  }

  async initFirestoreSync() {
    if (!db) return;
    try {
      const q = query(collection(db, 'project_backups'), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const remote = [];
        snapshot.forEach(docSnap => {
          remote.push({ id: docSnap.id, ...docSnap.data() });
        });
        if (remote.length > 0) {
          this.saveLocal(remote);
        }
      }
    } catch (e) {
      console.warn('Could not sync remote backups from Firestore:', e);
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
      try { fn(this.backups); } catch (e) {}
    });
  }

  getBackups(projectFilter = 'all') {
    if (projectFilter === 'all') return this.backups;
    return this.backups.filter(b => b.projectId === projectFilter);
  }

  formatBytes(bytes, decimals = 1) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Upload a source code bundle to Google Cloud / Firebase Storage
   * and record its metadata in Firestore & LocalStorage.
   */
  async uploadBackup({ file, projectId, customProjectName, versionTag, notes, onProgress }) {
    if (!file) throw new Error('No file provided for upload.');

    const project = SUPPORTED_PROJECTS.find(p => p.id === projectId) || {
      id: projectId || 'custom',
      name: customProjectName || 'Custom Project'
    };

    const projectName = (projectId === 'client-custom' && customProjectName) 
      ? customProjectName 
      : project.name;

    const timestampStr = new Date().toISOString();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `source-vault/${project.id}/${Date.now()}_${safeFileName}`;
    const backupId = 'backup-' + Date.now();

    let downloadUrl = '#';

    // 1. If Firebase Storage is active, perform resumable upload with real-time progress
    if (storage) {
      try {
        const fileRef = storageRef(storage, storagePath);
        const uploadTask = uploadBytesResumable(fileRef, file, {
          contentType: file.type || 'application/zip',
          customMetadata: {
            projectId: project.id,
            projectName,
            versionTag: versionTag || 'v1.0.0',
            uploadedAt: timestampStr
          }
        });

        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              if (onProgress) {
                onProgress(progress, snapshot.bytesTransferred, snapshot.totalBytes);
              }
            },
            (error) => reject(error),
            async () => {
              downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      } catch (err) {
        console.warn('Storage upload encountered an issue, storing offline record:', err);
        // Fallback: create an object URL for this local session if storage failed
        downloadUrl = URL.createObjectURL(file);
      }
    } else {
      // Offline fallback: simulate progress
      if (onProgress) {
        for (let p = 10; p <= 100; p += 30) {
          onProgress(p, (file.size * p) / 100, file.size);
          await new Promise(r => setTimeout(r, 60));
        }
      }
      downloadUrl = URL.createObjectURL(file);
    }

    const backupRecord = {
      id: backupId,
      projectId: project.id,
      projectName,
      versionTag: versionTag || `v${new Date().toISOString().slice(0, 10)}`,
      fileName: file.name,
      fileSize: file.size,
      fileSizeFormatted: this.formatBytes(file.size),
      notes: notes || 'Source code backup snapshot.',
      downloadUrl,
      storagePath,
      timestamp: timestampStr,
      author: 'Admin'
    };

    // 2. Save in Firestore if available
    if (db) {
      try {
        await setDoc(doc(db, 'project_backups', backupId), {
          ...backupRecord,
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.warn('Firestore backup record save failed:', e);
      }
    }

    // 3. Save locally
    const updated = [backupRecord, ...this.backups.filter(b => b.id !== backupId)];
    this.saveLocal(updated);

    return backupRecord;
  }

  /**
   * Delete a backup archive from Storage and metadata DB
   */
  async deleteBackup(backupId) {
    const target = this.backups.find(b => b.id === backupId);
    if (!target) return;

    // Delete from Firebase Storage if path exists
    if (storage && target.storagePath && !target.storagePath.startsWith('http')) {
      try {
        const fileRef = storageRef(storage, target.storagePath);
        await deleteObject(fileRef);
      } catch (e) {
        console.warn('Storage file deletion error:', e);
      }
    }

    // Delete from Firestore
    if (db) {
      try {
        await deleteDoc(doc(db, 'project_backups', backupId));
      } catch (e) {}
    }

    // Delete locally
    const filtered = this.backups.filter(b => b.id !== backupId);
    this.saveLocal(filtered);
  }
}

export const vaultStore = new VaultStore();

