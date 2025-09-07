/**
 * Clerk Authentication Components
 * Pre-built UI components for Clerk authentication flows
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-expo';
import { SSOProviderDisplay, availableProviders, SSOErrorHandling } from '@/config/clerk-sso';
import type { SSOProvider } from '@/config/clerk-sso';
import { useClerkAuth } from '@/hooks/useClerkAuth';

/**
 * Authentication Status Wrapper
 * Shows different content based on authentication state
 */
export const AuthWrapper: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>{fallback}</SignedOut>
    </>
  );
};

/**
 * SSO Provider Button
 * Individual button for each OAuth provider with OAuth integration
 */
export const SSOProviderButton: React.FC<{
  provider: SSOProvider;
  onPress?: (provider: SSOProvider) => void;
  disabled?: boolean;
}> = ({ provider, onPress, disabled = false }) => {
  const config = SSOProviderDisplay[provider];
  const { signInWithOAuth } = useClerkAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const handlePress = async () => {
    if (disabled || isLoading) return;
    
    // Validate OAuth configuration first
    const validation = SSOErrorHandling.validateOAuthConfig(provider);
    if (!validation.isValid) {
      Alert.alert('ไม่สามารถเข้าสู่ระบบได้', validation.message || 'เกิดข้อผิดพลาด');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use custom onPress if provided, otherwise use built-in OAuth
      if (onPress) {
        onPress(provider);
      } else {
        await signInWithOAuth(provider);
      }
    } catch (error: any) {
      const errorResult = SSOErrorHandling.handleOAuthError(error, provider);
      
      Alert.alert(
        'เกิดข้อผิดพลาด',
        errorResult.error,
        [
          { text: 'ตกลง', style: 'default' },
          ...(errorResult.fallbackProviders.length > 0 ? [
             {
               text: 'ลองวิธีอื่น',
               onPress: () => {
                 // Could implement fallback provider selection here
                 console.log('Fallback providers:', errorResult.fallbackProviders);
               }
             }
           ] : [])
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.providerButton,
        { borderColor: config.color },
        (disabled || isLoading) && styles.providerButtonDisabled
      ]}
      onPress={handlePress}
      disabled={disabled || isLoading}
    >
      <Text style={[
        styles.providerButtonText,
        { color: config.color },
        (disabled || isLoading) && styles.providerButtonTextDisabled
      ]}>
        {isLoading ? 'กำลังเข้าสู่ระบบ...' : config.buttonText}
      </Text>
    </TouchableOpacity>
  );
};

/**
 * SSO Providers List
 * Renders all available OAuth providers
 */
export const SSOProvidersList: React.FC<{
  onProviderSelect: (provider: SSOProvider) => void;
  disabled?: boolean;
}> = ({ onProviderSelect, disabled = false }) => {
  return (
    <View style={styles.providersContainer}>
      <Text style={styles.providersTitle}>เข้าสู่ระบบด้วย</Text>
      {availableProviders.map((provider) => (
        <SSOProviderButton
          key={provider}
          provider={provider}
          onPress={onProviderSelect}
          disabled={disabled}
        />
      ))}
    </View>
  );
};

/**
 * Authentication Loading State
 * Shows loading indicator while Clerk is initializing
 */
export const AuthLoadingState: React.FC = () => {
  const { isLoaded } = useAuth();
  
  if (isLoaded) return null;
  
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>กำลังโหลด...</Text>
    </View>
  );
};

/**
 * User Profile Display
 * Shows basic user information when signed in
 */
export const UserProfileDisplay: React.FC<{
  user: any; // Will be properly typed in Phase 2.1b
}> = ({ user }) => {
  if (!user) return null;
  
  return (
    <View style={styles.profileContainer}>
      <Text style={styles.profileName}>
        {user.fullName || user.firstName || 'ผู้ใช้'}
      </Text>
      <Text style={styles.profileEmail}>
        {user.primaryEmailAddress?.emailAddress}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  providerButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    alignItems: 'center',
  },
  providerButtonDisabled: {
    opacity: 0.5,
    borderColor: '#ccc',
  },
  providerButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  providerButtonTextDisabled: {
    color: '#ccc',
  },
  providersContainer: {
    padding: 16,
  },
  providersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  profileContainer: {
    padding: 16,
    alignItems: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
});