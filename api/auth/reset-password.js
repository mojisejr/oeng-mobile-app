"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const auth_1 = require("firebase/auth");
const firebase_sdk_1 = require("../../firebase-sdk");
const response_1 = require("../utils/response");
async function handler(req, res) {
    (0, response_1.setCorsHeaders)(res);
    if (req.method === 'OPTIONS') {
        return (0, response_1.handleOptionsRequest)(res);
    }
    if (req.method !== 'POST') {
        return (0, response_1.createErrorResponse)(res, 'Method not allowed', 405);
    }
    try {
        const { email } = req.body;
        const validation = (0, response_1.validateRequiredFields)(req.body, ['email']);
        if (!validation.isValid) {
            return (0, response_1.createErrorResponse)(res, `Missing required fields: ${validation.missingFields.join(', ')}`, 400);
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return (0, response_1.createErrorResponse)(res, 'Invalid email format', 400);
        }
        await (0, auth_1.sendPasswordResetEmail)(firebase_sdk_1.auth, email, {
            url: process.env.EXPO_PUBLIC_APP_URL || 'https://oeng-app.com',
            handleCodeInApp: false,
        });
        return (0, response_1.createSuccessResponse)(res, { email }, 'Password reset email sent successfully');
    }
    catch (error) {
        console.error('Password reset error:', error);
        if (error.code) {
            switch (error.code) {
                case 'auth/user-not-found':
                    return (0, response_1.createSuccessResponse)(res, { email: req.body.email }, 'If this email is registered, a password reset link has been sent');
                case 'auth/invalid-email':
                    return (0, response_1.createErrorResponse)(res, 'Invalid email address', 400);
                case 'auth/too-many-requests':
                    return (0, response_1.createErrorResponse)(res, 'Too many requests. Please try again later', 429);
                case 'auth/network-request-failed':
                    return (0, response_1.createErrorResponse)(res, 'Network error. Please try again', 500);
                default:
                    return (0, response_1.createErrorResponse)(res, `Password reset error: ${error.message}`, 500);
            }
        }
        return (0, response_1.createErrorResponse)(res, 'Password reset failed. Please try again', 500);
    }
}
