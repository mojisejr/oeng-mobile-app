// Utility functions for API responses

export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
  timestamp?: string;
}

export interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
}

export function createSuccessResponse(
  res: any,
  data?: any,
  message?: string
): void {
  res.status(200).json({
    success: true,
    message: message || "Operation successful",
    data,
    timestamp: new Date().toISOString(),
  });
}

export function createErrorResponse(
  res: any,
  error: string,
  statusCode: number = 400,
  data?: any
): void {
  res.status(statusCode).json({
    success: false,
    error,
    data,
    timestamp: new Date().toISOString(),
  });
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
): ValidationResult {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (!body || !body[field]) {
      missingFields.push(field);
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}
