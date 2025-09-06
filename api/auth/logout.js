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
        await (0, auth_1.signOut)(firebase_sdk_1.auth);
        return (0, response_1.createSuccessResponse)(res, null, 'User logged out successfully');
    }
    catch (error) {
        console.error('Logout error:', error);
        if (error.code) {
            switch (error.code) {
                case 'auth/network-request-failed':
                    return (0, response_1.createErrorResponse)(res, 'Network error. Please try again', 500);
                default:
                    return (0, response_1.createErrorResponse)(res, `Logout error: ${error.message}`, 500);
            }
        }
        return (0, response_1.createErrorResponse)(res, 'Logout failed. Please try again', 500);
    }
}
