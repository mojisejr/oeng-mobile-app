/**
 * Custom hook for Clerk Authentication
 * Provides authentication state and methods for the app
 */

import { useAuth, useUser } from '@clerk/clerk-expo';
import { useCallback } from 'react';
import type { SSOProvider } from '@/config/clerk-sso';
import { ClerkOAuthStrategies } from '@/config/clerk-sso';

export const useClerkAuth = () => {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  /**
   * Sign in with OAuth provider
   */
  const signInWithOAuth = useCallback(async (provider: SSOProvider) => {
    try {
      // This will be implemented in Phase 2.1b
      // For now, we're just preparing the structure
      console.log(`Preparing to sign in with ${provider}`);
      
      // Future implementation:
      // const strategy = ClerkOAuthStrategies[provider];
      // await signIn.authenticateWithRedirect({
      //   strategy,
      //   redirectUrl: '/dashboard',
      //   redirectUrlComplete: '/dashboard'
      // });
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      throw error;
    }
  }, []);

  /**
   * Sign out user
   */
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, [signOut]);

  /**
   * Get user profile information
   */
  const getUserProfile = useCallback(() => {
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
    };
  }, [user]);

  return {
    // Auth state
    isLoaded,
    isSignedIn,
    user,
    
    // Auth methods
    signInWithOAuth,
    signOut: handleSignOut,
    
    // User data
    userProfile: getUserProfile(),
  };
};

export type ClerkAuthHook = ReturnType<typeof useClerkAuth>;