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

    // Get query parameters
    const limitParam = req.query.limit as string;
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    // Validate limit
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 100'
      });
    }

    // Get credit transactions
    const transactionsQuery = adminDb
      .collection(COLLECTION_PATHS.CREDIT_TRANSACTIONS)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit);

    const transactionsSnapshot = await transactionsQuery.get();

    const transactions = transactionsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type,
        amount: data.amount,
        description: data.description,
        relatedDocumentId: data.relatedDocumentId || null,
        createdAt: data.createdAt,
        balanceAfter: data.balanceAfter
      };
    });

    // Get total transaction count for pagination info
    const totalQuery = adminDb
      .collection(COLLECTION_PATHS.CREDIT_TRANSACTIONS)
      .where('userId', '==', userId);
    
    const totalSnapshot = await totalQuery.count().get();
    const totalTransactions = totalSnapshot.data().count;

    // Calculate pagination info
    const hasMore = transactions.length === limit && totalTransactions > limit;

    // Return transaction history
    return res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          limit,
          total: totalTransactions,
          hasMore,
          returned: transactions.length
        }
      },
      message: 'Credit history retrieved successfully'
    });

  } catch (error) {
    console.error('Get credit history error:', error);

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

      if (error.message.includes('index')) {
        return res.status(500).json({
          success: false,
          error: 'Database index required. Please contact support.'
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