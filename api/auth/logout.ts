import { signOut } from 'firebase/auth';
import { auth } from '../../firebase-sdk';
import { createSuccessResponse, createErrorResponse, setCorsHeaders, handleOptionsRequest } from '../utils/response';

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
    // Sign out from Firebase Auth
    await signOut(auth);

    return createSuccessResponse(
      res,
      null,
      'User logged out successfully'
    );

  } catch (error: any) {
    console.error('Logout error:', error);

    // Handle Firebase Auth errors
    if (error.code) {
      switch (error.code) {
        case 'auth/network-request-failed':
          return createErrorResponse(res, 'Network error. Please try again', 500);
        default:
          return createErrorResponse(res, `Logout error: ${error.message}`, 500);
      }
    }

    return createErrorResponse(res, 'Logout failed. Please try again', 500);
  }
}