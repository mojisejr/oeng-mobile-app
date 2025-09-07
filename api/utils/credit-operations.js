"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deductCredits = deductCredits;
exports.addCredits = addCredits;
exports.getCreditBalance = getCreditBalance;
exports.grantFreeCredits = grantFreeCredits;
const firebase_1 = require("./firebase");
async function deductCredits(clerkUserId, amount, description, relatedDocumentId) {
    try {
        const currentBalance = await firebase_1.creditOperations.getBalance(clerkUserId);
        if (currentBalance < amount) {
            return {
                success: false,
                newBalance: currentBalance,
                error: 'Insufficient credits'
            };
        }
        await firebase_1.creditOperations.deduct(clerkUserId, amount, description, relatedDocumentId);
        const newBalance = await firebase_1.creditOperations.getBalance(clerkUserId);
        return {
            success: true,
            newBalance,
            transactionId: `deduct-${Date.now()}`
        };
    }
    catch (error) {
        console.error('Deduct credits error:', error);
        return {
            success: false,
            newBalance: 0,
            error: error instanceof Error ? error.message : 'Failed to deduct credits'
        };
    }
}
async function addCredits(clerkUserId, amount, description, type = 'add', relatedDocumentId) {
    try {
        const currentBalance = await firebase_1.creditOperations.getBalance(clerkUserId);
        if (type === 'purchase' && relatedDocumentId) {
            await firebase_1.creditOperations.add(clerkUserId, amount, relatedDocumentId);
        }
        else {
            const transactionId = `${type}-${Date.now()}`;
            await firebase_1.creditOperations.add(clerkUserId, amount, transactionId);
        }
        const newBalance = await firebase_1.creditOperations.getBalance(clerkUserId);
        return {
            success: true,
            newBalance,
            transactionId: `add-${Date.now()}`
        };
    }
    catch (error) {
        console.error('Add credits error:', error);
        return {
            success: false,
            newBalance: 0,
            error: error instanceof Error ? error.message : 'Failed to add credits'
        };
    }
}
async function getCreditBalance(clerkUserId) {
    try {
        return await firebase_1.creditOperations.getBalance(clerkUserId);
    }
    catch (error) {
        console.error('Get credit balance error:', error);
        return 0;
    }
}
async function grantFreeCredits(clerkUserId, amount = 3) {
    return addCredits(clerkUserId, amount, 'Free credits for new user', 'add');
}
