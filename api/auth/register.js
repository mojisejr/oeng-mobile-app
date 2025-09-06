"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const firebase_admin_1 = require("../../firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
const response_1 = require("../utils/response");
const db_schema_1 = require("../utils/db-schema");
const credit_operations_1 = require("../utils/credit-operations");
async function handler(req, res) {
    (0, response_1.setCorsHeaders)(res);
    if (req.method === 'OPTIONS') {
        return (0, response_1.handleOptionsRequest)(res);
    }
    if (req.method !== 'POST') {
        return (0, response_1.createErrorResponse)(res, 'Method not allowed', 405);
    }
    try {
        const { email, password, displayName } = req.body;
        const validation = (0, response_1.validateRequiredFields)(req.body, ['email', 'password', 'displayName']);
        if (!validation.isValid) {
            return (0, response_1.createErrorResponse)(res, `Missing required fields: ${validation.missingFields.join(', ')}`, 400);
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return (0, response_1.createErrorResponse)(res, 'Invalid email format', 400);
        }
        if (password.length < 6) {
            return (0, response_1.createErrorResponse)(res, 'Password must be at least 6 characters long', 400);
        }
        const userRecord = await firebase_admin_1.adminAuth.createUser({
            email: email,
            password: password,
            displayName: displayName
        });
        const userDoc = {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: displayName,
            ...db_schema_1.DEFAULT_VALUES.USER,
            photoURL: userRecord.photoURL || null,
            emailVerified: userRecord.emailVerified,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            lastLoginAt: firestore_1.FieldValue.serverTimestamp(),
        };
        await firebase_admin_1.adminDb.collection(db_schema_1.COLLECTION_PATHS.USERS).doc(userRecord.uid).set(userDoc);
        const creditResult = await (0, credit_operations_1.grantFreeCredits)(userRecord.uid, 3);
        if (!creditResult.success) {
            console.warn('Failed to grant free credits to new user:', userRecord.uid, creditResult.error);
        }
        const responseData = {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: displayName,
            photoURL: userRecord.photoURL || null,
            emailVerified: userRecord.emailVerified,
            credits: db_schema_1.DEFAULT_VALUES.USER.credits,
        };
        return (0, response_1.createSuccessResponse)(res, responseData, 'User registered successfully');
    }
    catch (error) {
        console.error('Registration error:', error);
        if (error.code) {
            switch (error.code) {
                case 'auth/email-already-in-use':
                    return (0, response_1.createErrorResponse)(res, 'Email is already registered', 409);
                case 'auth/invalid-email':
                    return (0, response_1.createErrorResponse)(res, 'Invalid email address', 400);
                case 'auth/operation-not-allowed':
                    return (0, response_1.createErrorResponse)(res, 'Email/password accounts are not enabled', 500);
                case 'auth/weak-password':
                    return (0, response_1.createErrorResponse)(res, 'Password is too weak', 400);
                case 'auth/network-request-failed':
                    return (0, response_1.createErrorResponse)(res, 'Network error. Please try again', 500);
                default:
                    return (0, response_1.createErrorResponse)(res, `Authentication error: ${error.message}`, 500);
            }
        }
        if (error.message?.includes('firestore')) {
            return (0, response_1.createErrorResponse)(res, 'Database error. Please try again', 500);
        }
        return (0, response_1.createErrorResponse)(res, 'Registration failed. Please try again', 500);
    }
}
