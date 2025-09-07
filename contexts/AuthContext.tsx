import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '@/firebase-sdk';
import { signInWithGoogle, signOutFromGoogle, configureGoogleSignIn, AuthMethod } from '@/lib/auth';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  authMethod: AuthMethod | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);

  // Configure Google Sign-In on component mount
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setAuthMethod(AuthMethod.EMAIL_PASSWORD);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setAuthMethod(AuthMethod.EMAIL_PASSWORD);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Step 1: Get Google ID token from Google Sign-In
      const result = await signInWithGoogle();
      if (!result.success || !result.user) {
        throw new Error(result.error || 'Google Sign-In failed');
      }

      // Step 2: Send Google ID token to our backend for processing
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/google-signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: result.user.idToken,
          accessToken: result.user.accessToken,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Backend authentication failed');
      }

      // Step 3: Sign in to Firebase with the custom token from backend
      if (data.customToken) {
        const credential = GoogleAuthProvider.credential(result.user.idToken);
        await signInWithCredential(auth, credential);
        setAuthMethod(AuthMethod.GOOGLE);
      } else {
        throw new Error('No authentication token received from backend');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Sign out from Google if user signed in with Google
      if (authMethod === AuthMethod.GOOGLE) {
        await signOutFromGoogle();
      }
      // Always sign out from Firebase
      await signOut(auth);
      setAuthMethod(null);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle: handleGoogleSignIn,
    logout,
    isAuthenticated: !!user,
    authMethod,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}