// Authentication middleware for API routes

import { adminAuth } from "../../firebase-admin";
import { createErrorResponse } from "../utils/response";

export interface AuthenticatedRequest {
  method?: string;
  body?: any;
  query?: any;
  headers?: any;
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

export async function verifyToken(token: string): Promise<any> {
  try {
    // Verify Firebase ID token using Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    return {
      id: decodedToken.uid,
      email: decodedToken.email || '',
      role: decodedToken.role || 'user',
      uid: decodedToken.uid,
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: any
): Promise<boolean> {
  const authHeader = req.headers?.authorization;
  const token = extractBearerToken(authHeader);

  if (!token) {
    createErrorResponse(res, "Authorization token required", 401);
    return false;
  }

  const user = await verifyToken(token);
  if (!user) {
    createErrorResponse(res, "Invalid or expired token", 401);
    return false;
  }

  req.user = user;
  return true;
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: any): boolean => {
    if (!req.user) {
      createErrorResponse(res, "Authentication required", 401);
      return false;
    }

    if (!allowedRoles.includes(req.user.role || "user")) {
      createErrorResponse(res, "Insufficient permissions", 403);
      return false;
    }

    return true;
  };
}
