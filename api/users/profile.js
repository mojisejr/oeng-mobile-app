"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
const auth_middleware_1 = require("../utils/auth-middleware");
const db_schema_1 = require("../utils/db-schema");
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};
const app = (0, app_1.initializeApp)(firebaseConfig);
const db = (0, firestore_1.getFirestore)(app);
async function getUserProfile(clerkUserId) {
    try {
        const userRef = (0, firestore_1.doc)(db, db_schema_1.COLLECTION_PATHS.USERS, clerkUserId);
        const userSnap = await (0, firestore_1.getDoc)(userRef);
        if (userSnap.exists()) {
            return userSnap.data();
        }
        return null;
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}
async function createUserProfile(clerkUserId, userData) {
    try {
        const newUser = {
            uid: clerkUserId,
            clerkUserId: clerkUserId,
            email: userData.emailAddress || '',
            displayName: userData.fullName || userData.firstName || 'User',
            photoURL: userData.imageUrl || null,
            emailVerified: userData.emailVerified || false,
            credits: db_schema_1.DEFAULT_VALUES.USER.credits,
            totalCreditsUsed: 0,
            totalCreditsPurchased: 0,
            createdAt: firestore_1.Timestamp.now(),
            lastLoginAt: firestore_1.Timestamp.now(),
            isActive: true,
            authProvider: 'clerk',
            preferences: {
                language: 'th',
                notifications: true,
                theme: 'auto'
            }
        };
        const userRef = (0, firestore_1.doc)(db, db_schema_1.COLLECTION_PATHS.USERS, clerkUserId);
        await (0, firestore_1.setDoc)(userRef, newUser);
        return newUser;
    }
    catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
    }
}
async function updateUserProfile(clerkUserId, updateData) {
    try {
        const userRef = (0, firestore_1.doc)(db, db_schema_1.COLLECTION_PATHS.USERS, clerkUserId);
        const updates = {
            ...updateData,
            lastLoginAt: firestore_1.Timestamp.now()
        };
        await (0, firestore_1.updateDoc)(userRef, updates);
        const updatedUser = await getUserProfile(clerkUserId);
        if (!updatedUser) {
            throw new Error('Failed to retrieve updated user profile');
        }
        return updatedUser;
    }
    catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}
async function profileHandler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    const clerkUserId = (0, auth_middleware_1.getUserId)(req);
    if (!clerkUserId) {
        return res.status(401).json({
            success: false,
            error: 'User not authenticated'
        });
    }
    if (req.method === "GET") {
        try {
            let userProfile = await getUserProfile(clerkUserId);
            if (!userProfile && req.user) {
                userProfile = await createUserProfile(clerkUserId, req.user);
            }
            if (!userProfile) {
                res.status(404).json({
                    success: false,
                    error: 'User profile not found'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: "User profile retrieved successfully",
                data: userProfile,
            });
            return;
        }
        catch (error) {
            console.error('Profile GET error:', error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch user profile",
            });
            return;
        }
    }
    if (req.method === "PUT") {
        try {
            const updateData = req.body;
            const allowedFields = ['displayName', 'preferences'];
            const sanitizedData = {};
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    sanitizedData[field] = updateData[field];
                }
            }
            const updatedProfile = await updateUserProfile(clerkUserId, sanitizedData);
            res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                data: updatedProfile,
            });
            return;
        }
        catch (error) {
            console.error('Profile PUT error:', error);
            res.status(500).json({
                success: false,
                error: "Failed to update profile",
            });
            return;
        }
    }
    res.status(405).json({ error: "Method not allowed" });
    return;
}
exports.default = (0, auth_middleware_1.withAuth)(profileHandler);
