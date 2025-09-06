"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractBearerToken = extractBearerToken;
exports.verifyToken = verifyToken;
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const firebase_admin_1 = require("../../firebase-admin");
const response_1 = require("../utils/response");
function extractBearerToken(authHeader) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    return authHeader.substring(7);
}
async function verifyToken(token) {
    try {
        const decodedToken = await firebase_admin_1.adminAuth.verifyIdToken(token);
        return {
            id: decodedToken.uid,
            email: decodedToken.email || '',
            role: decodedToken.role || 'user',
            uid: decodedToken.uid,
        };
    }
    catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}
async function requireAuth(req, res) {
    const authHeader = req.headers?.authorization;
    const token = extractBearerToken(authHeader);
    if (!token) {
        (0, response_1.createErrorResponse)(res, "Authorization token required", 401);
        return false;
    }
    const user = await verifyToken(token);
    if (!user) {
        (0, response_1.createErrorResponse)(res, "Invalid or expired token", 401);
        return false;
    }
    req.user = user;
    return true;
}
function requireRole(allowedRoles) {
    return (req, res) => {
        if (!req.user) {
            (0, response_1.createErrorResponse)(res, "Authentication required", 401);
            return false;
        }
        if (!allowedRoles.includes(req.user.role || "user")) {
            (0, response_1.createErrorResponse)(res, "Insufficient permissions", 403);
            return false;
        }
        return true;
    };
}
