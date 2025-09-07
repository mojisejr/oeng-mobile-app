import { clerkClient } from '@clerk/clerk-sdk-node';
import { Request, Response } from 'express';

// Extend the Express Request interface to include user information
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    emailAddress?: string;
    firstName?: string;
    lastName?: string;
  };
}

/**
 * Authentication middleware for Clerk
 * Verifies the session token and adds user information to the request
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: () => void
) {
  try {
    // Get the session token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header'
      });
    }

    const sessionToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the session token with Clerk
    if (!process.env.CLERK_SECRET_KEY) {
      throw new Error('CLERK_SECRET_KEY environment variable is not set');
    }

    const session = await clerkClient.sessions.verifySession(sessionToken, process.env.CLERK_SECRET_KEY);

    if (!session || session.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session'
      });
    }

    // Get user information from Clerk
    const user = await clerkClient.users.getUser(session.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Add user information to the request object
    req.user = {
      id: user.id,
      emailAddress: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined
    };

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}

/**
 * Higher-order function to wrap API routes with authentication
 */
export function withAuth(
  handler: (req: AuthenticatedRequest, res: Response) => Promise<any> | any
) {
  return async (req: AuthenticatedRequest, res: Response) => {
    return new Promise<void>((resolve, reject) => {
      authMiddleware(req, res, async () => {
        try {
          await handler(req, res);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  };
}

/**
 * Utility function to get Clerk user ID from request
 */
export function getUserId(req: AuthenticatedRequest): string | null {
  return req.user?.id || null;
}

/**
 * Utility function to get user email from request
 */
export function getUserEmail(req: AuthenticatedRequest): string | null {
  return req.user?.emailAddress || null;
}