import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCx6Yi5bu5WTzf7AuvZgTLiQ1FdXqT4MmA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "iceu-songpa05.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "iceu-songpa05",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "iceu-songpa05.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "307601624742",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:307601624742:web:f1a4a61a02026f77b5ee67"
};

// Initialize Firebase App
export const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

export const auth: Auth = getAuth(app);

// 지정된 Firestore Database ID: 'cafe-app'
const firestoreDbId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || 'cafe-app';
export const db: Firestore = getFirestore(app, firestoreDbId);
