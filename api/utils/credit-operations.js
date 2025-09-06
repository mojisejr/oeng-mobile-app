"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deductCredits = deductCredits;
exports.addCredits = addCredits;
exports.getCreditBalance = getCreditBalance;
exports.grantFreeCredits = grantFreeCredits;
const firebase_admin_1 = require("../../firebase-admin");
const db_schema_1 = require("./db-schema");
const firestore_1 = require("firebase-admin/firestore");
async function deductCredits(userId, amount, description, relatedDocumentId) {
    const batch = firebase_admin_1.adminDb.batch();
    try {
        const userRef = firebase_admin_1.adminDb.collection(db_schema_1.COLLECTION_PATHS.USERS).doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return {
                success: false,
                newBalance: 0,
                error: 'User not found'
            };
        }
        const userData = userDoc.data();
        if (!userData) {
            return {
                success: false,
                newBalance: 0,
                error: 'User data not found'
            };
        }
        const currentBalance = userData.creditBalance || 0;
        if (currentBalance < amount) {
            return {
                success: false,
                newBalance: currentBalance,
                error: 'Insufficient credits'
            };
        }
        const newBalance = currentBalance - amount;
        const totalCreditsUsed = (userData.totalCreditsUsed || 0) + amount;
        batch.update(userRef, {
            creditBalance: newBalance,
            totalCreditsUsed,
            lastCreditUsed: firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp()
        });
        const transactionRef = firebase_admin_1.adminDb.collection(db_schema_1.COLLECTION_PATHS.CREDIT_TRANSACTIONS).doc();
        const transactionData = {
            userId,
            type: 'deduct',
            amount,
            description,
            relatedDocumentId,
            balanceAfter: newBalance,
            createdAt: firestore_1.FieldValue.serverTimestamp()
        };
        batch.set(transactionRef, transactionData);
        await batch.commit();
        return {
            success: true,
            newBalance,
            transactionId: transactionRef.id
        };
    }
    catch (error) {
        console.error('Credit deduction error:', error);
        return {
            success: false,
            newBalance: 0,
            error: 'Failed to deduct credits'
        };
    }
}
async function addCredits(userId, amount, description, type = 'add', relatedDocumentId) {
    const batch = firebase_admin_1.adminDb.batch();
    try {
        const userRef = firebase_admin_1.adminDb.collection(db_schema_1.COLLECTION_PATHS.USERS).doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return {
                success: false,
                newBalance: 0,
                error: 'User not found'
            };
        }
        const userData = userDoc.data();
        if (!userData) {
            return {
                success: false,
                newBalance: 0,
                error: 'User data not found'
            };
        }
        const currentBalance = userData.creditBalance || 0;
        const newBalance = currentBalance + amount;
        const updateData = {
            creditBalance: newBalance,
            updatedAt: firestore_1.FieldValue.serverTimestamp()
        };
        if (type === 'purchase') {
            updateData.totalCreditsPurchased = (userData.totalCreditsPurchased || 0) + amount;
        }
        batch.update(userRef, updateData);
        const transactionRef = firebase_admin_1.adminDb.collection(db_schema_1.COLLECTION_PATHS.CREDIT_TRANSACTIONS).doc();
        const transactionData = {
            userId,
            type,
            amount,
            description,
            relatedDocumentId,
            balanceAfter: newBalance,
            createdAt: firestore_1.FieldValue.serverTimestamp()
        };
        batch.set(transactionRef, transactionData);
        await batch.commit();
        return {
            success: true,
            newBalance,
            transactionId: transactionRef.id
        };
    }
    catch (error) {
        console.error('Credit addition error:', error);
        return {
            success: false,
            newBalance: 0,
            error: 'Failed to add credits'
        };
    }
}
async function getCreditBalance(userId) {
    try {
        const userDoc = await firebase_admin_1.adminDb.collection(db_schema_1.COLLECTION_PATHS.USERS).doc(userId).get();
        if (!userDoc.exists) {
            return 0;
        }
        const userData = userDoc.data();
        return userData?.creditBalance || 0;
    }
    catch (error) {
        console.error('Get credit balance error:', error);
        return 0;
    }
}
async function grantFreeCredits(userId, amount = 3) {
    return addCredits(userId, amount, `Free credits for new user (${amount} credits)`, 'add');
}
