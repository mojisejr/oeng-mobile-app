import { IncomingMessage, ServerResponse } from 'http';
import { RenderRequest, RenderResponse, enhanceResponse } from '../types/render';
import { setCorsHeaders, handleOptionsRequest } from '../utils/response';

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
    // Note: Authentication removed as part of Firebase Auth cleanup
    
    // TODO: Replace with new authentication system
    // For now, return mock credit balance
    const mockCreditBalance = 10;

    // Return mock credit balance and statistics
    return response.status(200).json({
      success: true,
      data: {
        creditBalance: mockCreditBalance,
        totalCreditsUsed: 0,
        totalCreditsPurchased: 10,
        lastCreditUsed: null,
        accountCreated: new Date().toISOString()
      },
      message: 'Credit balance retrieved successfully (mock data)'
    });

  } catch (error) {
    console.error('Get credit balance error:', error);

    // Handle general errors (Firebase removed)
    return response.status(500).json({
      success: false,
      error: 'Internal server error. Please try again.'
    });
  }
}