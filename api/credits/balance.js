"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const render_1 = require("../types/render");
const response_1 = require("../utils/response");
async function handler(req, res) {
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
        const mockCreditBalance = 10;
        return response.status(200).json({
            success: true,
            data: {
                creditBalance: mockCreditBalance,
                totalCreditsUsed: 0,
                totalCreditsPurchased: 10,
                lastCreditUsed: null,
                accountCreated: new Date().toISOString()
            },
            message: 'Credit balance retrieved successfully (mock data)'
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
