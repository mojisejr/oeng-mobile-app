import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SSOProvidersList } from '@/components/auth/ClerkAuthComponents';
import { useClerkAuth } from '@/hooks/useClerkAuth';
import { AuthContainer } from '@/components/auth/AuthContainer';
import { AuthHeader } from '@/components/auth/AuthHeader';
import type { SSOProvider } from '@/config/clerk-sso';

export default function SignUpScreen() {
  const { signInWithOAuth } = useClerkAuth();
  const router = useRouter();

  const handleProviderSelect = async (provider: SSOProvider) => {
    try {
      await signInWithOAuth(provider);
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  return (
    <AuthContainer>
      <AuthHeader 
        title="สมัครสมาชิก"
        subtitle="สร้างบัญชีใหม่เพื่อเริ่มใช้งาน AI English Coach"
        showLogo={true}
      />
      
      <SSOProvidersList 
        onProviderSelect={handleProviderSelect}
      />
      
      <TouchableOpacity 
        onPress={() => router.push('/(auth)/sign-in')}
        className="mt-6 flex-row justify-center items-center"
      >
        <Text className="text-sm text-gray-600">มีบัญชีอยู่แล้ว? </Text>
        <Text className="text-sm text-blue-600 font-medium">เข้าสู่ระบบ</Text>
      </TouchableOpacity>
    </AuthContainer>
  );
}

// Styles are now handled by the new auth components