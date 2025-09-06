import { IncomingMessage, ServerResponse } from 'http';
import { adminDb } from '../firebase-admin';
import { setCorsHeaders } from './utils/response';
import { RenderRequest, RenderResponse, enhanceResponse, parseQuery } from './types/render';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const request = req as RenderRequest;
  const response = enhanceResponse(res);
  
  // Parse query parameters
  if (request.url) {
    request.query = parseQuery(request.url);
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
    // Get current timestamp
    const timestamp = new Date().toISOString();
    const thailandTime = new Date().toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Test Firebase connection
    let firebaseStatus = 'connected';
    let firebaseError = null;
    
    try {
      // Simple test to check Firebase connection
      await adminDb.collection('_health_check').limit(1).get();
    } catch (error) {
      firebaseStatus = 'error';
      firebaseError = error instanceof Error ? error.message : 'Unknown Firebase error';
    }

    // Check environment variables
    const envVars = {
      NODE_ENV: process.env.NODE_ENV || 'not_set',
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'set' : 'not_set',
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 'set' : 'not_set',
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? 'set' : 'not_set',
      GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 'set' : 'not_set'
    };

    // Determine overall health status
    const isHealthy = firebaseStatus === 'connected' && 
                     envVars.FIREBASE_PROJECT_ID === 'set' &&
                     envVars.FIREBASE_PRIVATE_KEY === 'set' &&
                     envVars.FIREBASE_CLIENT_EMAIL === 'set' &&
                     envVars.GOOGLE_GENERATIVE_AI_API_KEY === 'set';

    const statusCode = isHealthy ? 200 : 503;

    return response.status(statusCode).json({
      success: isHealthy,
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp,
      thailandTime,
      services: {
        firebase: {
          status: firebaseStatus,
          error: firebaseError
        },
        environment: {
          status: Object.values(envVars).every(v => v === 'set' || v === 'production' || v === 'development') ? 'configured' : 'missing_vars',
          variables: envVars
        }
      },
      version: '1.0.0',
      deployment: {
        platform: 'render',
        region: process.env.RENDER_REGION || 'unknown',
        service: process.env.RENDER_SERVICE_NAME || 'oeng-app-api'
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    
    return response.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown health check error',
      timestamp: new Date().toISOString()
    });
  }
}