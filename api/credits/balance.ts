import { IncomingMessage, ServerResponse } from 'http';
import { RenderRequest, RenderResponse, enhanceResponse } from '../types/render';
import { setCorsHeaders, handleOptionsRequest } from '../utils/response';
import { withAuth } from '../utils/auth-middleware';
import { getCreditBalance } from '../utils/credit-operations';
import { userOperations } from '../utils/firebase';

async function balanceHandler(req: IncomingMessage, res: ServerResponse) {
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
    // Get Clerk user ID from authenticated request
    const clerkUserId = (request as any).user?.id;
    
    if (!clerkUserId) {
      return response.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Get credit balance using Clerk user ID
    const creditBalance = await getCreditBalance(clerkUserId);
    
    // Get user data for additional statistics
    const userData = await userOperations.getById(clerkUserId);
    
    // Return credit balance and statistics
    return response.status(200).json({
      success: true,
      data: {
        creditBalance,
        totalCreditsUsed: userData?.totalCreditsUsed || 0,
        totalCreditsPurchased: userData?.totalCreditsPurchased || 0,
        accountCreated: userData?.createdAt || new Date().toISOString()
      },
      message: 'Credit balance retrieved successfully'
    });

  } catch (error) {
    console.error('Get credit balance error:', error);

    return response.status(500).json({
      success: false,
      error: 'Internal server error. Please try again.'
    });
  }
}

export default withAuth(balanceHandler);