import { IncomingMessage, ServerResponse } from 'http';
import { RenderRequest, RenderResponse, enhanceResponse, parseQuery } from '../types/render';
import { setCorsHeaders, handleOptionsRequest } from '../utils/response';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const request = req as RenderRequest;
  const response = enhanceResponse(res);
  const query = parseQuery(request.url || '');
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
    // TODO: Replace with new authentication system
    // Mock user ID for now
    const userId = 'mock-user-id';

    // Get query parameters
    const limitParam = query.limit as string;
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    // Validate limit
    if (limit < 1 || limit > 100) {
      return response.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 100'
      });
    }

    // TODO: Replace with new database implementation
    // Mock credit transactions for now
    const transactions = [
      {
        id: 'mock-transaction-1',
        type: 'purchase',
        amount: 10,
        description: 'Credit purchase',
        relatedDocumentId: null,
        createdAt: new Date().toISOString(),
        balanceAfter: 10
      }
    ];

    const totalTransactions = 1;

    // Calculate pagination info
    const hasMore = transactions.length === limit && totalTransactions > limit;

    // Return transaction history
    return response.status(200).json({
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

      if (error.message.includes('index')) {
        return response.status(500).json({
          success: false,
          error: 'Database index required. Please contact support.'
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