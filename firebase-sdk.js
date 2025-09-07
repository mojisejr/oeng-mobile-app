// Firebase SDK Configuration for AI English Coach App
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Development environment setup
if (process.env.NODE_ENV === 'development' && process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  // Connect to Firebase emulators in development
  const EMULATOR_HOST = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST || 'localhost';
  
  // Auth emulator
  connectAuthEmulator(auth, `http://${EMULATOR_HOST}:9099`, {
    disableWarnings: true,
  });
  
  // Firestore emulator
  connectFirestoreEmulator(db, EMULATOR_HOST, 8080);
  
  // Functions emulator
  connectFunctionsEmulator(functions, EMULATOR_HOST, 5001);
  
  console.log('🔥 Firebase emulators connected');
}

// Export the Firebase app instance
export default app;

// Firestore collections references
export const COLLECTIONS = {
  USERS: 'users',
  SENTENCES: 'sentences',
  PAYMENTS: 'payments',
  CREDIT_TRANSACTIONS: 'creditTransactions',
};

// Helper function to check if Firebase is properly configured
export const isFirebaseConfigured = () => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
};

// Helper function to get current user ID
export const getCurrentUserId = () => {
  return auth.currentUser?.uid || null;
};

console.log('🔥 Firebase SDK initialized successfully');
console.log('📊 Project ID:', firebaseConfig.projectId);
console.log('🔐 Auth Domain:', firebaseConfig.authDomain);