// Utility functions for API responses

export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
  timestamp?: string;
}

export function createSuccessResponse(
  data?: any,
  message?: string
): ApiResponse {
  return {
    success: true,
    message: message || "Operation successful",
    data,
    timestamp: new Date().toISOString(),
  };
}

export function createErrorResponse(error: string, data?: any): ApiResponse {
  return {
    success: false,
    error,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function setCorsHeaders(res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export function handleOptionsRequest(res: any) {
  setCorsHeaders(res);
  return res.status(200).end();
}

export function validateRequiredFields(
  body: any,
  requiredFields: string[]
): string | null {
  for (const field of requiredFields) {
    if (!body[field]) {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}
