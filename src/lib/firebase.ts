import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyBVGZoypPOM9cEyhGku4QmofYZPn8ZiVnI",
  authDomain: "kisanai-8b20e.firebaseapp.com",
  projectId: "kisanai-8b20e",
  storageBucket: "kisanai-8b20e.firebasestorage.app",
  messagingSenderId: "579292163737",
  appId: "1:579292163737:web:92ca4316bf88858f5e5208",
};

export const FIRESTORE_DATABASE_ID = "ai-studio-kisanaiaifarming-1ebfe0b4-8be6-44b0-ae71-fcb122310002";

// Initialize Firebase App singleton
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

// Initialize Cloud Firestore with dedicated project database
let firestoreDb: Firestore;
try {
  firestoreDb = getFirestore(app, FIRESTORE_DATABASE_ID);
} catch (e) {
  console.warn('Falling back to default Firestore instance', e);
  firestoreDb = getFirestore(app);
}

export const db: Firestore = firestoreDb;

// Initialize Google OAuth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
