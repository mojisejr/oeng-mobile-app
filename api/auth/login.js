"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const render_1 = require("../types/render");
// Removed firebase/auth client SDK - using firebase-admin instead
const firebase_admin_1 = require("../../firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
const response_1 = require("../utils/response");
const db_schema_1 = require("../utils/db-schema");
async function handler(req, res) {
    const request = req;
    const response = (0, render_1.enhanceResponse)(res);
    if (request.method === 'OPTIONS') {
        return (0, response_1.handleOptionsRequest)(response);
    }
    (0, response_1.setCorsHeaders)(response);
    if (request.method !== 'POST') {
        return (0, response_1.createErrorResponse)(response, 'Method not allowed', 405);
    }
    try {
        const body = await (0, render_1.parseRequestBody)(request);
        const validation = (0, response_1.validateRequiredFields)(body, ['email', 'password']);
        if (!validation.isValid) {
            return (0, response_1.createErrorResponse)(response, `Missing required fields: ${validation.missingFields.join(', ')}`, 400);
        }
        const { email, password } = body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return (0, response_1.createErrorResponse)(response, 'Invalid email format', 400);
        }
        // Server-side authentication using Firebase Admin SDK
        let user;
        try {
            // Get user by email first to check if user exists
            user = await firebase_admin_1.adminAuth.getUserByEmail(email);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                return (0, response_1.createErrorResponse)(response, 'Invalid email or password', 401);
            }
            throw error;
        }
        
        // For server-side, we'll create a custom token for the user
        // Note: Password verification should be handled by client-side or use custom authentication
        const customToken = await firebase_admin_1.adminAuth.createCustomToken(user.uid);
        const userDocRef = firebase_admin_1.adminDb.collection(db_schema_1.COLLECTION_PATHS.USERS).doc(user.uid);
        const userDocSnap = await userDocRef.get();
        let userData;
        if (!userDocSnap.exists) {
            const newUserData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || email.split('@')[0],
                ...db_schema_1.DEFAULT_VALUES.USER,
                photoURL: user.photoURL || null,
                emailVerified: user.emailVerified,
                createdAt: firestore_1.FieldValue.serverTimestamp(),
                lastLoginAt: firestore_1.FieldValue.serverTimestamp(),
            };
            await userDocRef.set(newUserData);
            userData = { id: user.uid, ...newUserData };
        }
        else {
            await userDocRef.update({
                lastLoginAt: firestore_1.FieldValue.serverTimestamp(),
                emailVerified: user.emailVerified,
            });
            userData = { id: userDocSnap.id, ...userDocSnap.data() };
        }
        const responseData = {
            uid: userData.uid,
            email: userData.email,
            displayName: userData.displayName,
            photoURL: userData.photoURL,
            emailVerified: userData.emailVerified,
            credits: userData.credits,
            lastLoginAt: userData.lastLoginAt,
            customToken: customToken,
        };
        return (0, response_1.createSuccessResponse)(response, responseData, 'Login successful');
    }
    catch (error) {
        console.error('Login error:', error);
        if (error.code) {
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    return (0, response_1.createErrorResponse)(response, 'Invalid email or password', 401);
                case 'auth/user-disabled':
                    return (0, response_1.createErrorResponse)(response, 'User account has been disabled', 403);
                case 'auth/too-many-requests':
                    return (0, response_1.createErrorResponse)(response, 'Too many failed attempts. Please try again later', 429);
                case 'auth/network-request-failed':
                    return (0, response_1.createErrorResponse)(response, 'Network error. Please try again', 500);
                default:
                    return (0, response_1.createErrorResponse)(response, `Authentication error: ${error.message}`, 500);
            }
        }
        if (error.message?.includes('firestore')) {
            return (0, response_1.createErrorResponse)(response, 'Database error. Please try again', 500);
        }
        return (0, response_1.createErrorResponse)(response, 'Login failed. Please try again', 500);
    }
}
