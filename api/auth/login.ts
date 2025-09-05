import { VercelRequest, VercelResponse } from '@vercel/node';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase-sdk';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { createSuccessResponse, createErrorResponse, setCorsHeaders, handleOptionsRequest, validateRequiredFields } from '../utils/response';
import { COLLECTION_PATHS, DEFAULT_VALUES, ERROR_CODES } from '../utils/db-schema';
import type { UserDocument } from '../utils/db-schema';

interface LoginRequest {
  email: string;
  password: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest(res);
  }

  // Set CORS headers
  setCorsHeaders(res);

  if (req.method !== 'POST') {
    return createErrorResponse(res, 'Method not allowed', 405);
  }

  try {
    // Validate required fields
    const validation = validateRequiredFields(req.body, ['email', 'password']);
    if (!validation.isValid) {
      return createErrorResponse(
        res,
        `Missing required fields: ${validation.missingFields.join(', ')}`,
        400
      );
    }

    const { email, password }: LoginRequest = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createErrorResponse(res, 'Invalid email format', 400);
    }

    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get or create user document in Firestore
    const userDocRef = doc(db, COLLECTION_PATHS.USERS, user.uid);
    const userDocSnap = await getDoc(userDocRef);

    let userData: any;

    if (!userDocSnap.exists()) {
      // Create new user document if it doesn't exist
      const newUserData: any = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || email.split('@')[0],
        ...DEFAULT_VALUES.USER,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      };

      await setDoc(userDocRef, newUserData);
      userData = { id: user.uid, ...newUserData };
    } else {
      // Update last login time for existing user
      await updateDoc(userDocRef, {
        lastLoginAt: serverTimestamp(),
        emailVerified: user.emailVerified, // Update email verification status
      });

      userData = { id: userDocSnap.id, ...userDocSnap.data() };
    }

    // Return success response with user data (excluding sensitive info)
    const responseData = {
      uid: userData.uid,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      emailVerified: userData.emailVerified,
      credits: userData.credits,
      lastLoginAt: userData.lastLoginAt,
    };

    return createSuccessResponse(res, responseData, 'Login successful');
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Handle Firebase Auth errors
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          return createErrorResponse(res, 'Invalid email or password', 401);
        case 'auth/user-disabled':
          return createErrorResponse(res, 'User account has been disabled', 403);
        case 'auth/too-many-requests':
          return createErrorResponse(res, 'Too many failed attempts. Please try again later', 429);
        case 'auth/network-request-failed':
          return createErrorResponse(res, 'Network error. Please try again', 500);
        default:
          return createErrorResponse(res, `Authentication error: ${error.message}`, 500);
      }
    }

    // Handle Firestore errors
    if (error.message?.includes('firestore')) {
      return createErrorResponse(res, 'Database error. Please try again', 500);
    }

    return createErrorResponse(res, 'Login failed. Please try again', 500);
  }
}
