/**
 * API Client with Clerk Authentication Integration
 * Handles all HTTP requests with automatic token management
 */

import { useAuth } from '@clerk/clerk-expo';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://oeng-mobile-app.onrender.com';
const API_TIMEOUT = 30000; // 30 seconds

// Request/Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

/**
 * Custom hook for authenticated API requests
 * Automatically includes Clerk authentication token
 */
export const useApiClient = () => {
  const { getToken, isSignedIn } = useAuth();

  const makeRequest = async <T = any>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> => {
    try {
      // Ensure user is authenticated
      if (!isSignedIn) {
        throw new Error('User not authenticated');
      }

      // Get authentication token
      const token = await getToken();
      if (!token) {
        throw new Error('Failed to get authentication token');
      }

      // Prepare request configuration
      const {
        method = 'GET',
        headers = {},
        body,
        timeout = API_TIMEOUT
      } = config;

      // Build request headers
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...headers
      };

      // Build request URL
      const url = `${API_BASE_URL}${endpoint}`;

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Make the request
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Parse response
      const responseData = await response.json();

      // Handle HTTP errors
      if (!response.ok) {
        throw new Error(
          responseData.message || 
          responseData.error || 
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return {
        success: true,
        data: responseData.data || responseData,
        message: responseData.message
      };

    } catch (error: any) {
      console.error('API Request Error:', {
        endpoint,
        error: error.message,
        config
      });

      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  };

  // Convenience methods
  const get = <T = any>(endpoint: string, headers?: Record<string, string>) => 
    makeRequest<T>(endpoint, { method: 'GET', headers });

  const post = <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) => 
    makeRequest<T>(endpoint, { method: 'POST', body, headers });

  const put = <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) => 
    makeRequest<T>(endpoint, { method: 'PUT', body, headers });

  const patch = <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) => 
    makeRequest<T>(endpoint, { method: 'PATCH', body, headers });

  const del = <T = any>(endpoint: string, headers?: Record<string, string>) => 
    makeRequest<T>(endpoint, { method: 'DELETE', headers });

  return {
    makeRequest,
    get,
    post,
    put,
    patch,
    delete: del
  };
};

/**
 * API Endpoints for the application
 */
export const API_ENDPOINTS = {
  // User Management
  USER_PROFILE: '/api/users/profile',
  
  // Sentence Management
  SENTENCES_LIST: '/api/sentences/list',
  SENTENCES_CREATE: '/api/sentences/create',
  SENTENCES_UPDATE: '/api/sentences/update',
  SENTENCES_DELETE: '/api/sentences/delete',
  SENTENCES_ANALYZE: '/api/sentences/analyze',
  
  // Credits Management
  CREDITS_BALANCE: '/api/credits/balance',
  CREDITS_HISTORY: '/api/credits/history',
  
  // Payment System
  PAYMENTS_STRIPE: '/api/payments/stripe',
  
  // AI Analysis
  AI_ANALYZE: '/api/ai/gemini-endpoint',
  
  // Health Check
  HEALTH: '/api/health'
} as const;

/**
 * Type-safe API client functions for specific endpoints
 */
export const createApiClient = () => {
  const { makeRequest } = useApiClient();

  return {
    // User Profile
    getUserProfile: () => makeRequest(API_ENDPOINTS.USER_PROFILE),
    updateUserProfile: (data: any) => 
      makeRequest(API_ENDPOINTS.USER_PROFILE, { method: 'PUT', body: data }),

    // Sentences
    getSentences: (params?: any) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return makeRequest(`${API_ENDPOINTS.SENTENCES_LIST}${query}`);
    },
    createSentence: (data: any) => 
      makeRequest(API_ENDPOINTS.SENTENCES_CREATE, { method: 'POST', body: data }),
    updateSentence: (id: string, data: any) => 
      makeRequest(`${API_ENDPOINTS.SENTENCES_UPDATE}?id=${id}`, { method: 'PUT', body: data }),
    deleteSentence: (id: string) => 
      makeRequest(`${API_ENDPOINTS.SENTENCES_DELETE}?id=${id}`, { method: 'DELETE' }),
    analyzeSentence: (data: any) => 
      makeRequest(API_ENDPOINTS.SENTENCES_ANALYZE, { method: 'POST', body: data }),

    // Credits
    getCreditsBalance: () => makeRequest(API_ENDPOINTS.CREDITS_BALANCE),
    getCreditsHistory: () => makeRequest(API_ENDPOINTS.CREDITS_HISTORY),

    // Payments
    processPayment: (data: any) => 
      makeRequest(API_ENDPOINTS.PAYMENTS_STRIPE, { method: 'POST', body: data }),

    // Health Check
    healthCheck: () => makeRequest(API_ENDPOINTS.HEALTH)
  };
};

/**
 * Error handling utilities
 */
export const handleApiError = (error: ApiResponse) => {
  if (error.error) {
    console.error('API Error:', error.error);
    return error.error;
  }
  return 'An unexpected error occurred';
};

export const isApiSuccess = <T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true; data: T } => {
  return response.success === true;
};

// Types are already exported above