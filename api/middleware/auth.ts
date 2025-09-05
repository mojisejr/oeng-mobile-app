// Authentication middleware for API routes

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
  // TODO: Implement JWT token verification
  // This is a placeholder for token verification logic
  // You would typically use a library like 'jsonwebtoken' here

  try {
    // Placeholder verification
    if (token === "valid-token") {
      return {
        id: "user-123",
        email: "user@example.com",
        role: "user",
      };
    }
    return null;
  } catch (error) {
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
    res.status(401).json(createErrorResponse("Authorization token required"));
    return false;
  }

  const user = await verifyToken(token);
  if (!user) {
    res.status(401).json(createErrorResponse("Invalid or expired token"));
    return false;
  }

  req.user = user;
  return true;
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: any): boolean => {
    if (!req.user) {
      res.status(401).json(createErrorResponse("Authentication required"));
      return false;
    }

    if (!allowedRoles.includes(req.user.role || "user")) {
      res.status(403).json(createErrorResponse("Insufficient permissions"));
      return false;
    }

    return true;
  };
}
