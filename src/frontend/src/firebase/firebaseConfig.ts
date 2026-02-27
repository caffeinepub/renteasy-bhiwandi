// ============================================================
// FIREBASE SETUP INSTRUCTIONS
// ============================================================
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project (or use existing)
// 3. Click "Add app" → Web → Register app
// 4. Copy the firebaseConfig object and paste it below
//
// ENABLE AUTHENTICATION:
// Firebase Console → Authentication → Sign-in method → Email/Password → Enable
//
// ENABLE FIRESTORE:
// Firebase Console → Firestore Database → Create database → Start in test mode
// (Switch to production rules before going live)
//
// ============================================================

import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBNFG_nw1uj3EzPPDP1-J6aeGKmyhW-FzI",
  authDomain: "renteasy-bhiwandi.firebaseapp.com",
  projectId: "renteasy-bhiwandi",
  storageBucket: "renteasy-bhiwandi.firebasestorage.app",
  messagingSenderId: "62193100123",
  appId: "1:62193100123:web:10f59cf2a06f28bde5667e",
  measurementId: "G-9CCX0MNR6N",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
