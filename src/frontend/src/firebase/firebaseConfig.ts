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
// ENABLE STORAGE:
// Firebase Console → Storage → Get started → Start in test mode
// (Switch to production rules before going live)
// ============================================================

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
