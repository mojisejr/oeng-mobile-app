/**
 * Custom hook for Clerk Authentication
 * Provides authentication state and methods for the app
 */

import { useAuth, useUser, useOAuth } from '@clerk/clerk-expo';
import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import type { SSOProvider } from '@/config/clerk-sso';
import { ClerkOAuthStrategies } from '@/config/clerk-sso';

export const useClerkAuth = () => {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startFacebookOAuth } = useOAuth({ strategy: 'oauth_facebook' });
  const { startOAuthFlow: startLineOAuth } = useOAuth({ strategy: 'oauth_line' });

  /**
   * Sign in with OAuth provider
   */
  const signInWithOAuth = useCallback(async (provider: SSOProvider) => {
    try {
      const strategy = ClerkOAuthStrategies[provider];
      
      let startOAuthFlow;
      switch (provider) {
        case 'google':
          startOAuthFlow = startGoogleOAuth;
          break;
        case 'facebook':
          startOAuthFlow = startFacebookOAuth;
          break;
        case 'line':
          startOAuthFlow = startLineOAuth;
          break;
        default:
          throw new Error(`Unsupported OAuth provider: ${provider}`);
      }

      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: 'oeng:///(tabs)',
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        
        // Enhanced post-login navigation with delay to ensure session is fully established
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 100);
        
        return { success: true, sessionId: createdSessionId };
      } else {
        throw new Error('Failed to create session or set active session');
      }
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      throw error;
    }
  }, [startGoogleOAuth, startFacebookOAuth, startLineOAuth]);

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