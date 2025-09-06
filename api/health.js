"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const firebase_admin_1 = require("../firebase-admin");
const response_1 = require("./utils/response");
const render_1 = require("./types/render");
async function handler(req, res) {
    const request = req;
    const response = res;
    // Set CORS headers
    (0, response_1.setCorsHeaders)(response);
    if (request.method !== 'GET') {
        response.statusCode = 405;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({
            success: false,
            error: 'Method not allowed. Use GET.'
        }));
        return;
    }
    try {
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
        let firebaseStatus = 'connected';
        let firebaseError = null;
        try {
            await firebase_admin_1.adminDb.collection('_health_check').limit(1).get();
        }
        catch (error) {
            firebaseStatus = 'error';
            firebaseError = error instanceof Error ? error.message : 'Unknown Firebase error';
        }
        const envVars = {
            NODE_ENV: process.env.NODE_ENV || 'not_set',
            FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'set' : 'not_set',
            FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 'set' : 'not_set',
            FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? 'set' : 'not_set',
            GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 'set' : 'not_set'
        };
        const isHealthy = firebaseStatus === 'connected' &&
            envVars.FIREBASE_PROJECT_ID === 'set' &&
            envVars.FIREBASE_PRIVATE_KEY === 'set' &&
            envVars.FIREBASE_CLIENT_EMAIL === 'set' &&
            envVars.GOOGLE_GENERATIVE_AI_API_KEY === 'set';
        const statusCode = isHealthy ? 200 : 503;
        const responseData = {
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
        };
        response.statusCode = statusCode;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(responseData));
        return;
    }
    catch (error) {
        console.error('Health check error:', error);
        const errorData = {
            success: false,
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Unknown health check error',
            timestamp: new Date().toISOString()
        };
        response.statusCode = 503;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(errorData));
        return;
    }
}
