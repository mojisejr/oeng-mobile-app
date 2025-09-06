import { IncomingMessage, ServerResponse } from 'http';
import { RenderRequest, RenderResponse, enhanceResponse } from '../types/render';
import { adminAuth, adminDb } from '../../firebase-admin';
import { setCorsHeaders, handleOptionsRequest } from '../utils/response';
import { COLLECTION_PATHS } from '../utils/db-schema';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const request = req as RenderRequest;
  const response = enhanceResponse(res);
  // Handle CORS
  if (request.method === 'OPTIONS') {
    return handleOptionsRequest(response);
  }

  // Set CORS headers
  setCorsHeaders(response);

  // Only allow GET method
  if (request.method !== 'GET') {
    return response.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET.'
    });
  }

  try {
    // Get authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.status(401).json({
        success: false,
        error: 'Authorization header required'
      });
    }

    // Verify Firebase token
    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (authError) {
      console.error('Auth verification failed:', authError);
      return response.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    const userId = decodedToken.uid;

    // Get user document
    const userDoc = await adminDb.collection(COLLECTION_PATHS.USERS).doc(userId).get();

    if (!userDoc.exists) {
      return response.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userData = userDoc.data();
    if (!userData) {
      return response.status(404).json({
        success: false,
        error: 'User data not found'
      });
    }

    const creditBalance = userData.creditBalance || 0;
    const totalCreditsUsed = userData.totalCreditsUsed || 0;
    const totalCreditsPurchased = userData.totalCreditsPurchased || 0;

    // Return credit balance and statistics
    return response.status(200).json({
      success: true,
      data: {
        creditBalance,
        totalCreditsUsed,
        totalCreditsPurchased,
        lastCreditUsed: userData.lastCreditUsed || null,
        accountCreated: userData.createdAt || null
      },
      message: 'Credit balance retrieved successfully'
    });

  } catch (error) {
    console.error('Get credit balance error:', error);

    // Handle Firestore errors
    if (error instanceof Error) {
      if (error.message.includes('permission-denied')) {
        return response.status(403).json({
          success: false,
          error: 'Permission denied. Please check your authentication.'
        });
      }

      if (error.message.includes('not-found')) {
        return response.status(404).json({
          success: false,
          error: 'Resource not found'
        });
      }

      if (error.message.includes('network')) {
        return response.status(503).json({
          success: false,
          error: 'Network error. Please try again.'
        });
      }
    }

    // Generic server error
    return response.status(500).json({
      success: false,
      error: 'Internal server error. Please try again.'
    });
  }
}