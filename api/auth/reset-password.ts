import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase-sdk';
import { createSuccessResponse, createErrorResponse, setCorsHeaders, handleOptionsRequest, validateRequiredFields } from '../utils/response';

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
    const { email } = req.body;

    // Validate required fields
    const validation = validateRequiredFields(req.body, ['email']);
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

    // Send password reset email
    await sendPasswordResetEmail(auth, email, {
      url: process.env.EXPO_PUBLIC_APP_URL || 'https://oeng-app.com',
      handleCodeInApp: false,
    });

    return createSuccessResponse(
      res,
      { email },
      'Password reset email sent successfully'
    );

  } catch (error: any) {
    console.error('Password reset error:', error);

    // Handle Firebase Auth errors
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          // For security reasons, don't reveal if email exists
          return createSuccessResponse(
            res,
            { email: req.body.email },
            'If this email is registered, a password reset link has been sent'
          );
        case 'auth/invalid-email':
          return createErrorResponse(res, 'Invalid email address', 400);
        case 'auth/too-many-requests':
          return createErrorResponse(res, 'Too many requests. Please try again later', 429);
        case 'auth/network-request-failed':
          return createErrorResponse(res, 'Network error. Please try again', 500);
        default:
          return createErrorResponse(res, `Password reset error: ${error.message}`, 500);
      }
    }

    return createErrorResponse(res, 'Password reset failed. Please try again', 500);
  }
}