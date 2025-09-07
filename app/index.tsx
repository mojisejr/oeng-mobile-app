import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../contexts/AuthContext';
import { isAuthenticated } from '../lib/auth';

export default function IndexScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated(user)) {
        // User is authenticated, redirect to main app
        router.push('/explore' as any);
      } else {
        // User is not authenticated, redirect to login
        router.push('/(auth)/login' as any);
      }
    }
  }, [user, loading, router]);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="text-gray-600 mt-4 text-base">
          กำลังตรวจสอบสถานะการเข้าสู่ระบบ...
        </Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  // This should not be reached as useEffect will redirect
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#007AFF" />
      <StatusBar style="auto" />
    </View>
  );
}
