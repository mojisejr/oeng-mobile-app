import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect directly to main app (authentication removed)
    router.push('/explore' as any);
  }, [router]);

  // Show loading screen while redirecting
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#007AFF" />
      <Text className="text-gray-600 mt-4 text-base">
        กำลังเข้าสู่แอปพลิเคชัน...
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}
