import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            AI English Coach
          </Text>
          <Text className="text-lg text-gray-600">
            ยินดีต้อนรับ {user?.displayName || user?.email}
          </Text>
        </View>

        {/* Quick Actions */}
        <View className="mb-8">
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            เริ่มต้นใช้งาน
          </Text>
          
          <View className="space-y-4">
            <Button
              className="w-full"
              onPress={() => {
                // Navigate to add sentence screen
                console.log('Navigate to add sentence');
              }}
            >
              เพิ่มประโยคใหม่
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onPress={() => {
                // Navigate to sentence list
                console.log('Navigate to sentence list');
              }}
            >
              ดูประโยคที่บันทึกไว้
            </Button>
          </View>
        </View>

        {/* User Info */}
        <View className="mb-8">
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            ข้อมูลผู้ใช้
          </Text>
          
          <View className="bg-gray-50 rounded-lg p-4">
            <Text className="text-gray-700 mb-2">
              อีเมล: {user?.email}
            </Text>
            <Text className="text-gray-700 mb-2">
              ชื่อ: {user?.displayName || 'ไม่ระบุ'}
            </Text>
            <Text className="text-gray-700">
              สถานะ: เข้าสู่ระบบแล้ว
            </Text>
          </View>
        </View>

        {/* Sign Out */}
        <Button
          variant="destructive"
          onPress={handleSignOut}
          className="w-full"
        >
          ออกจากระบบ
        </Button>
      </View>
    </ScrollView>
  );
}