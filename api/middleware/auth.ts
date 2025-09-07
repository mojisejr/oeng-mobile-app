// Authentication middleware for API routes

import { adminAuth, adminDb } from "../../firebase-admin";
import { FieldValue } from 'firebase-admin/firestore';
import { createErrorResponse } from "../utils/response";
import { COLLECTION_PATHS, DEFAULT_VALUES } from "../utils/db-schema";
import { grantFreeCredits } from "../utils/credit-operations";

export interface AuthenticatedRequest {
  method?: string;
  body?: any;
  query?: any;
  headers?: any;
  user?: {
    id: string;
    email: string;
    role?: string;
    uid: string;
    authProvider?: string;
    isGoogleSignIn?: boolean;
    name?: string;
    picture?: string;
  };
}

export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

export async function verifyToken(token: string): Promise<any> {
  try {
    // Verify Firebase ID token using Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Extract additional Google Sign-In information if available
    const authProvider = decodedToken.firebase?.sign_in_provider;
    const isGoogleSignIn = authProvider === 'google.com';
    
    return {
      id: decodedToken.uid,
      email: decodedToken.email || '',
      role: decodedToken.role || 'user',
      uid: decodedToken.uid,
      authProvider: authProvider || 'email',
      isGoogleSignIn,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: any
): Promise<boolean> {
  const authHeader = req.headers?.authorization;
  const token = extractBearerToken(authHeader);

  if (!token) {
    createErrorResponse(res, "Authorization token required", 401);
    return false;
  }

  const user = await verifyToken(token);
  if (!user) {
    createErrorResponse(res, "Invalid or expired token", 401);
    return false;
  }

  // Handle Google Sign-In user profile creation/update
  if (user.isGoogleSignIn) {
    await ensureGoogleUserProfile(user);
  }

  req.user = user;
  return true;
}

/**
 * Create or update Google user profile in Firestore
 */
export async function ensureGoogleUserProfile(user: any): Promise<void> {
  try {
    const userDocRef = adminDb.collection(COLLECTION_PATHS.USERS).doc(user.uid);
    const userDocSnap = await userDocRef.get();

    if (!userDocSnap.exists) {
      // Create new user document for Google Sign-In user
      const newUserData: any = {
        uid: user.uid,
        email: user.email,
        displayName: user.name || user.email?.split('@')[0] || 'Google User',
        ...DEFAULT_VALUES.USER,
        photoURL: user.picture || null,
        emailVerified: true, // Google accounts are pre-verified
        authProvider: 'google.com',
        createdAt: FieldValue.serverTimestamp(),
        lastLoginAt: FieldValue.serverTimestamp(),
      };

      await userDocRef.set(newUserData);
      
      // Grant free credits to new Google user
      const creditResult = await grantFreeCredits(user.uid, 3);
      if (!creditResult.success) {
        console.warn('Failed to grant free credits to new Google user:', user.uid, creditResult.error);
      }
    } else {
      // Update existing user with Google Sign-In data
      const updateData: any = {
        lastLoginAt: FieldValue.serverTimestamp(),
        emailVerified: true,
      };
      
      // Update profile picture if available and not already set
      if (user.picture && !userDocSnap.data()?.photoURL) {
        updateData.photoURL = user.picture;
      }
      
      // Update display name if available and not already set
      if (user.name && !userDocSnap.data()?.displayName) {
        updateData.displayName = user.name;
      }
      
      await userDocRef.update(updateData);
    }
  } catch (error) {
    console.error('Error ensuring Google user profile:', error);
    // Don't throw error to avoid breaking authentication flow
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: any): boolean => {
    if (!req.user) {
      createErrorResponse(res, "Authentication required", 401);
      return false;
    }

    if (!allowedRoles.includes(req.user.role || "user")) {
      createErrorResponse(res, "Insufficient permissions", 403);
      return false;
    }

    return true;
  };
}
