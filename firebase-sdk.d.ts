// Type declarations for firebase-sdk.js
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { Functions } from 'firebase/functions';
import { FirebaseApp } from 'firebase/app';

declare const app: FirebaseApp;
declare const auth: Auth;
declare const db: Firestore;
declare const functions: Functions;

declare const COLLECTIONS: {
  USERS: string;
  SENTENCES: string;
  PAYMENTS: string;
  CREDIT_TRANSACTIONS: string;
};

declare const isFirebaseConfigured: () => boolean;
declare const getCurrentUserId: () => string | null;

export { auth, db, functions, COLLECTIONS, isFirebaseConfigured, getCurrentUserId };
export default app;