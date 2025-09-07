import { IncomingMessage, ServerResponse } from 'http';
import { RenderRequest, RenderResponse, enhanceResponse, parseRequestBody } from '../types/render';
import { adminAuth, adminDb } from '../../firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { createSuccessResponse, createErrorResponse, setCorsHeaders, handleOptionsRequest, validateRequiredFields } from '../utils/response';
import { COLLECTION_PATHS, DEFAULT_VALUES, ERROR_CODES } from '../utils/db-schema';
import { grantFreeCredits } from '../utils/credit-operations';
import type { UserDocument } from '../utils/db-schema';

interface GoogleSignInRequest {
  idToken: string;
  accessToken?: string;
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
    const validation = validateRequiredFields(body, ['idToken']);
    if (!validation.isValid) {
      return createErrorResponse(
        response,
        `Missing required fields: ${validation.missingFields.join(', ')}`,
        400
      );
    }

    const { idToken }: GoogleSignInRequest = body;

    // Verify Google ID token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    if (!decodedToken) {
      return createErrorResponse(response, 'Invalid Google ID token', 401, ERROR_CODES.UNAUTHORIZED);
    }

    // Check if this is a Google Sign-In
    const authProvider = decodedToken.firebase?.sign_in_provider;
    if (authProvider !== 'google.com') {
      return createErrorResponse(response, 'Token is not from Google Sign-In', 400);
    }

    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;
    const userName = decodedToken.name;
    const userPicture = decodedToken.picture;

    // Get or create user document in Firestore
    const userDocRef = adminDb.collection(COLLECTION_PATHS.USERS).doc(userId);
    const userDocSnap = await userDocRef.get();

    let userData: any;
    let isNewUser = false;

    if (!userDocSnap.exists) {
      // Create new user document for Google Sign-In
      isNewUser = true;
      const newUserData: any = {
        uid: userId,
        email: userEmail!,
        displayName: userName || userEmail!.split('@')[0],
        ...DEFAULT_VALUES.USER,
        photoURL: userPicture || null,
        emailVerified: true, // Google accounts are pre-verified
        authProvider: 'google.com',
        createdAt: FieldValue.serverTimestamp(),
        lastLoginAt: FieldValue.serverTimestamp(),
      };

      await userDocRef.set(newUserData);
      userData = { id: userId, ...newUserData };

      // Grant free credits to new Google user
      const creditResult = await grantFreeCredits(userId, 3);
      if (!creditResult.success) {
        console.warn('Failed to grant free credits to new Google user:', userId, creditResult.error);
      }
    } else {
      // Update existing user with Google Sign-In data
      const existingData = userDocSnap.data();
      const updateData: any = {
        lastLoginAt: FieldValue.serverTimestamp(),
        emailVerified: true,
      };
      
      // Update profile picture if available and not already set
      if (userPicture && !existingData?.photoURL) {
        updateData.photoURL = userPicture;
      }
      
      // Update display name if available and not already set
      if (userName && !existingData?.displayName) {
        updateData.displayName = userName;
      }
      
      // Update auth provider if not already set
      if (!existingData?.authProvider) {
        updateData.authProvider = 'google.com';
      }
      
      await userDocRef.update(updateData);
      userData = { id: userDocSnap.id, ...existingData, ...updateData };
    }

    // Generate a fresh Firebase ID token for API authentication
    const customToken = await adminAuth.createCustomToken(userId);

    // Return success response with user data
    const responseData = {
      uid: userData.uid,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      emailVerified: userData.emailVerified,
      credits: userData.credits,
      authProvider: userData.authProvider,
      isNewUser,
      customToken, // Custom token for subsequent API calls
      idToken, // Original Google ID token
    };

    return createSuccessResponse(
      response, 
      responseData, 
      isNewUser ? 'Google Sign-In successful - New user created' : 'Google Sign-In successful'
    );

  } catch (error: any) {
    console.error('Google Sign-In error:', error);

    // Handle Firebase Auth errors
    if (error.code) {
      switch (error.code) {
        case 'auth/id-token-expired':
          return createErrorResponse(response, 'Google ID token has expired', 401);
        case 'auth/id-token-revoked':
          return createErrorResponse(response, 'Google ID token has been revoked', 401);
        case 'auth/invalid-id-token':
          return createErrorResponse(response, 'Invalid Google ID token', 401);
        case 'auth/user-disabled':
          return createErrorResponse(response, 'User account has been disabled', 403);
        case 'auth/user-not-found':
          return createErrorResponse(response, 'User not found', 404);
        default:
          return createErrorResponse(response, `Authentication error: ${error.message}`, 500);
      }
    }

    // Handle Firestore errors
    if (error.message?.includes('firestore')) {
      return createErrorResponse(response, 'Database error. Please try again', 500);
    }

    return createErrorResponse(response, 'Google Sign-In failed. Please try again', 500);
  }
}