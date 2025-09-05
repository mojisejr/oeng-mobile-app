import { VercelRequest, VercelResponse } from '@vercel/node';
import { adminAuth, adminDb } from '../../firebase-admin';
import { setCorsHeaders, handleOptionsRequest } from '../utils/response';
import { COLLECTION_PATHS } from '../utils/db-schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest(res);
  }

  // Set CORS headers
  setCorsHeaders(res);

  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET.'
    });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
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
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    const userId = decodedToken.uid;

    // Get user document
    const userDoc = await adminDb.collection(COLLECTION_PATHS.USERS).doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userData = userDoc.data();
    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'User data not found'
      });
    }

    const creditBalance = userData.creditBalance || 0;
    const totalCreditsUsed = userData.totalCreditsUsed || 0;
    const totalCreditsPurchased = userData.totalCreditsPurchased || 0;

    // Return credit balance and statistics
    return res.status(200).json({
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
        return res.status(403).json({
          success: false,
          error: 'Permission denied. Please check your authentication.'
        });
      }

      if (error.message.includes('not-found')) {
        return res.status(404).json({
          success: false,
          error: 'Resource not found'
        });
      }

      if (error.message.includes('network')) {
        return res.status(503).json({
          success: false,
          error: 'Network error. Please try again.'
        });
      }
    }

    // Generic server error
    return res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again.'
    });
  }
}