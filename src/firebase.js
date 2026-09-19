// Firebase SDK initialisation for ORVEXI
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

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

// Initialize Analytics (only in browser environments)
const analytics = getAnalytics(app);

export { app, analytics };
