import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyBB9DO8ksQ7jxeAIRWJvfwtit3e1wQSKaQ",
  authDomain: "jomi-porimap.firebaseapp.com",
  projectId: "jomi-porimap",
  storageBucket: "jomi-porimap.firebasestorage.app",
  messagingSenderId: "42464460059",
  appId: "1:42464460059:web:8df40835227bc1ab5667be",
  measurementId: "G-G7F3DNQ819",
};

// Initialize Firebase safely
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export type { FirebaseUser };
export {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
};
