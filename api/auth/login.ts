import { IncomingMessage, ServerResponse } from 'http';
import { RenderRequest, RenderResponse, enhanceResponse, parseRequestBody } from '../types/render';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase-sdk';
import { adminDb } from '../../firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { createSuccessResponse, createErrorResponse, setCorsHeaders, handleOptionsRequest, validateRequiredFields } from '../utils/response';
import { COLLECTION_PATHS, DEFAULT_VALUES, ERROR_CODES } from '../utils/db-schema';
import type { UserDocument } from '../utils/db-schema';

interface LoginRequest {
  email: string;
  password: string;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const request = req as RenderRequest;
  const response = enhanceResponse(res);
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleOptionsRequest(response);
  }

  // Set CORS headers
  setCorsHeaders(response);

  if (request.method !== 'POST') {
    return createErrorResponse(response, 'Method not allowed', 405);
  }

  try {
    // Parse request body
    const body = await parseRequestBody(request);
    
    // Validate required fields
    const validation = validateRequiredFields(body, ['email', 'password']);
    if (!validation.isValid) {
      return createErrorResponse(
        response,
        `Missing required fields: ${validation.missingFields.join(', ')}`,
        400
      );
    }

    const { email, password }: LoginRequest = body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createErrorResponse(response, 'Invalid email format', 400);
    }

    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user) {
      return createErrorResponse(response, 'Authentication failed', 401, ERROR_CODES.UNAUTHORIZED);
    }

    // Get Firebase ID token
    const idToken = await user.getIdToken();

    // Get or create user document in Firestore using Admin SDK
    const userDocRef = adminDb.collection(COLLECTION_PATHS.USERS).doc(user.uid);
    const userDocSnap = await userDocRef.get();

    let userData: any;

    if (!userDocSnap.exists) {
      // Create new user document if it doesn't exist
      const newUserData: any = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || email.split('@')[0],
        ...DEFAULT_VALUES.USER,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        createdAt: FieldValue.serverTimestamp(),
        lastLoginAt: FieldValue.serverTimestamp(),
      };

      await userDocRef.set(newUserData);
      userData = { id: user.uid, ...newUserData };
    } else {
      // Update last login time for existing user
      await userDocRef.update({
        lastLoginAt: FieldValue.serverTimestamp(),
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
      idToken: idToken, // Include Firebase ID token for API authentication
    };

    return createSuccessResponse(response, responseData, 'Login successful');
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Handle Firebase Auth errors
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          return createErrorResponse(response, 'Invalid email or password', 401);
        case 'auth/user-disabled':
          return createErrorResponse(response, 'User account has been disabled', 403);
        case 'auth/too-many-requests':
          return createErrorResponse(response, 'Too many failed attempts. Please try again later', 429);
        case 'auth/network-request-failed':
          return createErrorResponse(response, 'Network error. Please try again', 500);
        default:
          return createErrorResponse(response, `Authentication error: ${error.message}`, 500);
      }
    }

    // Handle Firestore errors
    if (error.message?.includes('firestore')) {
      return createErrorResponse(response, 'Database error. Please try again', 500);
    }

    return createErrorResponse(response, 'Login failed. Please try again', 500);
  }
}
