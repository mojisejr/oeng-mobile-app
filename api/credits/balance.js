"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const render_1 = require("../types/render");
const response_1 = require("../utils/response");
const auth_middleware_1 = require("../utils/auth-middleware");
const credit_operations_1 = require("../utils/credit-operations");
const firebase_1 = require("../utils/firebase");
async function balanceHandler(req, res) {
    const request = req;
    const response = (0, render_1.enhanceResponse)(res);
    if (request.method === 'OPTIONS') {
        return (0, response_1.handleOptionsRequest)(response);
    }
    (0, response_1.setCorsHeaders)(response);
    if (request.method !== 'GET') {
        return response.status(405).json({
            success: false,
            error: 'Method not allowed. Use GET.'
        });
    }
    try {
        const clerkUserId = request.user?.id;
        if (!clerkUserId) {
            return response.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }
        const creditBalance = await (0, credit_operations_1.getCreditBalance)(clerkUserId);
        const userData = await firebase_1.userOperations.getById(clerkUserId);
        return response.status(200).json({
            success: true,
            data: {
                creditBalance,
                totalCreditsUsed: userData?.totalCreditsUsed || 0,
                totalCreditsPurchased: userData?.totalCreditsPurchased || 0,
                accountCreated: userData?.createdAt || new Date().toISOString()
            },
            message: 'Credit balance retrieved successfully'
        });
    }
    catch (error) {
        console.error('Get credit balance error:', error);
        return response.status(500).json({
            success: false,
            error: 'Internal server error. Please try again.'
        });
    }
}
exports.default = (0, auth_middleware_1.withAuth)(balanceHandler);
