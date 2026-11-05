// Firebase SDK initialisation for ORVEXI
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes,
  uploadBytesResumable, 
  uploadString,
  getDownloadURL, 
  deleteObject, 
  listAll 
} from 'firebase/storage';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBY2FIon_CM0mFqCfXyLkDtl2rtTCKTKPI",
  authDomain: "orvexi-b1253.firebaseapp.com",
  projectId: "orvexi-b1253",
  storageBucket: "orvexi-b1253.firebasestorage.app",
  messagingSenderId: "561743520575",
  appId: "1:561743520575:web:fdca482e902c056624698a",
  measurementId: "G-BJM220HBHM"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) analytics = getAnalytics(app);
  }).catch(() => {});
}

let db = null;
try {
  db = getFirestore(app);
} catch (e) {
  console.warn('Firestore initialization failed:', e);
}

let auth = null;
let googleProvider = null;
try {
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} catch (e) {
  console.warn('Firebase Auth initialization failed:', e);
}

let storage = null;
try {
  storage = getStorage(app);
} catch (e) {
  console.warn('Firebase Storage initialization failed:', e);
}

export { 
  app, 
  analytics, 
  db, 
  auth, 
  googleProvider, 
  storage,
  storageRef,
  uploadBytes,
  uploadBytesResumable,
  uploadString,
  getDownloadURL,
  deleteObject,
  listAll,
  signInWithPopup, 
  firebaseSignOut, 
  sendPasswordResetEmail,
  onAuthStateChanged 
};
