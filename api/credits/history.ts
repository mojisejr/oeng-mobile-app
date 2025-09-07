import { IncomingMessage, ServerResponse } from 'http';
import { RenderRequest, RenderResponse, enhanceResponse, parseQuery } from '../types/render';
import { setCorsHeaders, handleOptionsRequest } from '../utils/response';
import { withAuth } from '../utils/auth-middleware';
import { db } from '../../firebase-sdk';
import { collection, query, where, orderBy, limit as firestoreLimit, getDocs } from 'firebase/firestore';
import { COLLECTION_PATHS } from '../utils/db-schema';

async function historyHandler(req: IncomingMessage, res: ServerResponse) {
  const request = req as RenderRequest;
  const response = enhanceResponse(res);
  const queryParams = parseQuery(request.url || '');
  
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
    // Get Clerk user ID from authenticated request
    const clerkUserId = (request as any).user?.id;
    
    if (!clerkUserId) {
      return response.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Get query parameters
    const limitParam = queryParams.limit as string;
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    // Validate limit
    if (limit < 1 || limit > 100) {
      return response.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 100'
      });
    }

    // Query credit transactions from Firestore
    const transactionsRef = collection(db, COLLECTION_PATHS.CREDIT_TRANSACTIONS);
    const q = query(
      transactionsRef,
      where('clerkUserId', '==', clerkUserId),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    const transactions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
    }));

    // Calculate pagination info
    const hasMore = transactions.length === limit;

    // Return transaction history
    return response.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          limit,
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

    // Handle general errors
    return response.status(500).json({
      success: false,
      error: 'Internal server error. Please try again.'
    });
  }
}

export default withAuth(historyHandler);