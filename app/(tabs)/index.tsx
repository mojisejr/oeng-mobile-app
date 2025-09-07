import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import { Button } from '@/components/ui/Button';

export default function HomeScreen() {

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            AI English Coach
          </Text>
          <Text className="text-lg text-gray-600">
            ยินดีต้อนรับสู่แอปฝึกภาษาอังกฤษ
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

        {/* App Info */}
        <View className="mb-8">
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            เกี่ยวกับแอป
          </Text>
          
          <View className="bg-gray-50 rounded-lg p-4">
            <Text className="text-gray-700 mb-2">
              ✨ วิเคราะห์ประโยคภาษาอังกฤษด้วย AI
            </Text>
            <Text className="text-gray-700 mb-2">
              📚 เรียนรู้จากคำแนะนำที่ละเอียด
            </Text>
            <Text className="text-gray-700">
              🎯 พัฒนาทักษะภาษาอังกฤษอย่างมีประสิทธิภาพ
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}