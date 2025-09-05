import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../../firebase-sdk';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createSuccessResponse, createErrorResponse, setCorsHeaders, handleOptionsRequest, validateRequiredFields } from '../utils/response';
import { COLLECTION_PATHS, DEFAULT_VALUES, ERROR_CODES } from '../utils/db-schema';
import { grantFreeCredits } from '../utils/credit-operations';
import type { UserDocument } from '../utils/db-schema';

export default async function handler(req: any, res: any) {
  // Handle CORS
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest(res);
  }

  if (req.method !== 'POST') {
    return createErrorResponse(res, 'Method not allowed', 405);
  }

  try {
    const { email, password, displayName } = req.body;

    // Validate required fields
    const validation = validateRequiredFields(req.body, ['email', 'password', 'displayName']);
    if (!validation.isValid) {
      return createErrorResponse(
        res,
        `Missing required fields: ${validation.missingFields.join(', ')}`,
        400
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createErrorResponse(res, 'Invalid email format', 400);
    }

    // Validate password strength
    if (password.length < 6) {
      return createErrorResponse(res, 'Password must be at least 6 characters long', 400);
    }

    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile with display name
    await updateProfile(user, {
      displayName: displayName
    });

    // Create user document in Firestore
    const userDoc: any = {
      uid: user.uid,
      email: user.email!,
      displayName: displayName,
      ...DEFAULT_VALUES.USER,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };

    await setDoc(doc(db, COLLECTION_PATHS.USERS, user.uid), userDoc);

    // Grant free credits to new user
    const creditResult = await grantFreeCredits(user.uid, 3);
    if (!creditResult.success) {
      console.warn('Failed to grant free credits to new user:', user.uid, creditResult.error);
    }

    // Return success response with user data (excluding sensitive info)
    const responseData = {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      credits: DEFAULT_VALUES.USER.credits,
    };

    return createSuccessResponse(
      res,
      responseData,
      'User registered successfully'
    );

  } catch (error: any) {
    console.error('Registration error:', error);

    // Handle Firebase Auth errors
    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          return createErrorResponse(res, 'Email is already registered', 409);
        case 'auth/invalid-email':
          return createErrorResponse(res, 'Invalid email address', 400);
        case 'auth/operation-not-allowed':
          return createErrorResponse(res, 'Email/password accounts are not enabled', 500);
        case 'auth/weak-password':
          return createErrorResponse(res, 'Password is too weak', 400);
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

    return createErrorResponse(res, 'Registration failed. Please try again', 500);
  }
}