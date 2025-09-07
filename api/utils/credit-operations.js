"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deductCredits = deductCredits;
exports.addCredits = addCredits;
exports.getCreditBalance = getCreditBalance;
exports.grantFreeCredits = grantFreeCredits;
async function deductCredits(userId, amount, description, relatedDocumentId) {
    try {
        const mockBalance = 10;
        const newBalance = Math.max(0, mockBalance - amount);
        return {
            success: true,
            newBalance,
            transactionId: 'mock-transaction-id'
        };
    }
    catch (error) {
        console.error('Deduct credits error:', error);
        return {
            success: false,
            newBalance: 0,
            error: 'Failed to deduct credits'
        };
    }
}
async function addCredits(userId, amount, description, type = 'add', relatedDocumentId) {
    try {
        const mockBalance = 10;
        const newBalance = mockBalance + amount;
        return {
            success: true,
            newBalance,
            transactionId: 'mock-transaction-id'
        };
    }
    catch (error) {
        console.error('Add credits error:', error);
        return {
            success: false,
            newBalance: 0,
            error: 'Failed to add credits'
        };
    }
}
async function getCreditBalance(userId) {
    try {
        return 10;
    }
    catch (error) {
        console.error('Get credit balance error:', error);
        return 0;
    }
}
async function grantFreeCredits(userId, amount = 3) {
    return addCredits(userId, amount, 'Free credits for new user', 'add');
}
