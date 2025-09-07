// User profile management with Clerk authentication
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { withAuth, AuthenticatedRequest, getUserId } from '../utils/auth-middleware';
import { UserDocument, COLLECTION_PATHS, DEFAULT_VALUES } from '../utils/db-schema';
import { Response } from 'express';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Get user profile by Clerk user ID
 */
async function getUserProfile(clerkUserId: string): Promise<UserDocument | null> {
  try {
    const userRef = doc(db, COLLECTION_PATHS.USERS, clerkUserId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserDocument;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Create new user profile for Clerk user
 */
async function createUserProfile(clerkUserId: string, userData: any): Promise<UserDocument> {
  try {
    const newUser: UserDocument = {
      uid: clerkUserId, // Use Clerk ID as primary identifier
      clerkUserId: clerkUserId,
      email: userData.emailAddress || '',
      displayName: userData.fullName || userData.firstName || 'User',
      photoURL: userData.imageUrl || null,
      emailVerified: userData.emailVerified || false,
      credits: DEFAULT_VALUES.USER.credits,
      totalCreditsUsed: 0,
      totalCreditsPurchased: 0,
      createdAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      isActive: true,
      authProvider: 'clerk',
      preferences: {
        language: 'th',
        notifications: true,
        theme: 'auto'
      }
    };
    
    const userRef = doc(db, COLLECTION_PATHS.USERS, clerkUserId);
    await setDoc(userRef, newUser);
    
    return newUser;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
async function updateUserProfile(clerkUserId: string, updateData: Partial<UserDocument>): Promise<UserDocument> {
  try {
    const userRef = doc(db, COLLECTION_PATHS.USERS, clerkUserId);
    
    // Update lastLoginAt and merge with provided data
    const updates = {
      ...updateData,
      lastLoginAt: Timestamp.now()
    };
    
    await updateDoc(userRef, updates);
    
    // Return updated user data
    const updatedUser = await getUserProfile(clerkUserId);
    if (!updatedUser) {
      throw new Error('Failed to retrieve updated user profile');
    }
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Profile API handler with Clerk authentication
 */
async function profileHandler(req: AuthenticatedRequest, res: Response) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const clerkUserId = getUserId(req);
  if (!clerkUserId) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
  }

  if (req.method === "GET") {
    try {
      let userProfile = await getUserProfile(clerkUserId);
      
      // If user doesn't exist, create profile from Clerk data
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
    } catch (error) {
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
      
      // Validate and sanitize update data
      const allowedFields = ['displayName', 'preferences'];
      const sanitizedData: Partial<UserDocument> = {};
      
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          sanitizedData[field as keyof UserDocument] = updateData[field];
        }
      }
      
      const updatedProfile = await updateUserProfile(clerkUserId, sanitizedData);

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedProfile,
      });
      return;
    } catch (error) {
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

// Export the handler wrapped with authentication middleware
export default withAuth(profileHandler);
