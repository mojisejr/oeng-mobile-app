import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import { Button } from '@/components/ui/Button';

export default function ExploreScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            สำรวจ
          </Text>
          <Text className="text-lg text-gray-600">
            ค้นหาและเรียนรู้เพิ่มเติม
          </Text>
        </View>

        {/* Features */}
        <View className="mb-8">
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            ฟีเจอร์ที่จะมาเร็วๆ นี้
          </Text>
          
          <View className="space-y-4">
            <View className="bg-gray-50 rounded-lg p-4">
              <Text className="text-lg font-medium text-gray-900 mb-2">
                📚 คลังประโยคตัวอย่าง
              </Text>
              <Text className="text-gray-600">
                ประโยคภาษาอังกฤษที่ใช้บ่อยในชีวิตประจำวัน
              </Text>
            </View>
            
            <View className="bg-gray-50 rounded-lg p-4">
              <Text className="text-lg font-medium text-gray-900 mb-2">
                🎯 แบบฝึกหัด
              </Text>
              <Text className="text-gray-600">
                แบบฝึกหัดไวยากรณ์และคำศัพท์
              </Text>
            </View>
            
            <View className="bg-gray-50 rounded-lg p-4">
              <Text className="text-lg font-medium text-gray-900 mb-2">
                📊 สถิติการเรียนรู้
              </Text>
              <Text className="text-gray-600">
                ติดตามความก้าวหน้าในการเรียนรู้
              </Text>
            </View>
            
            <View className="bg-gray-50 rounded-lg p-4">
              <Text className="text-lg font-medium text-gray-900 mb-2">
                🏆 ระบบคะแนน
              </Text>
              <Text className="text-gray-600">
                สะสมคะแนนและปลดล็อกความสำเร็จ
              </Text>
            </View>
          </View>
        </View>

        {/* Coming Soon */}
        <View className="bg-blue-50 rounded-lg p-6">
          <Text className="text-xl font-semibold text-blue-900 mb-2">
            🚀 เร็วๆ นี้
          </Text>
          <Text className="text-blue-700 mb-4">
            เรากำลังพัฒนาฟีเจอร์ใหม่ๆ เพื่อให้การเรียนรู้ภาษาอังกฤษของคุณสนุกและมีประสิทธิภาพมากขึ้น
          </Text>
          
          <Button
            variant="outline"
            className="w-full border-blue-300 text-blue-700"
            onPress={() => {
              console.log('Coming soon features');
            }}
          >
            แจ้งเตือนเมื่อพร้อมใช้งาน
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}