"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const render_1 = require("../types/render");
const response_1 = require("../utils/response");
async function handler(req, res) {
    const request = req;
    const response = (0, render_1.enhanceResponse)(res);
    const query = (0, render_1.parseQuery)(request.url || '');
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
        const userId = 'mock-user-id';
        const limitParam = query.limit;
        const limit = limitParam ? parseInt(limitParam, 10) : 20;
        if (limit < 1 || limit > 100) {
            return response.status(400).json({
                success: false,
                error: 'Limit must be between 1 and 100'
            });
        }
        const transactions = [
            {
                id: 'mock-transaction-1',
                type: 'purchase',
                amount: 10,
                description: 'Credit purchase',
                relatedDocumentId: null,
                createdAt: new Date().toISOString(),
                balanceAfter: 10
            }
        ];
        const totalTransactions = 1;
        const hasMore = transactions.length === limit && totalTransactions > limit;
        return response.status(200).json({
            success: true,
            data: {
                transactions,
                pagination: {
                    limit,
                    total: totalTransactions,
                    hasMore,
                    returned: transactions.length
                }
            },
            message: 'Credit history retrieved successfully'
        });
    }
    catch (error) {
        console.error('Get credit history error:', error);
        if (error instanceof Error) {
            if (error.message.includes('permission-denied')) {
                return response.status(403).json({
                    success: false,
                    error: 'Permission denied. Please check your authentication.'
                });
            }
            if (error.message.includes('not-found')) {
                return response.status(404).json({
                    success: false,
                    error: 'Resource not found'
                });
            }
            if (error.message.includes('network')) {
                return response.status(503).json({
                    success: false,
                    error: 'Network error. Please try again.'
                });
            }
            if (error.message.includes('index')) {
                return response.status(500).json({
                    success: false,
                    error: 'Database index required. Please contact support.'
                });
            }
        }
        return response.status(500).json({
            success: false,
            error: 'Internal server error. Please try again.'
        });
    }
}
