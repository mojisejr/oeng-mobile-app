import React, { useState } from 'react';
import { View, ScrollView, Alert, Modal } from 'react-native';
import { router } from 'expo-router';
import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import { FileText, Settings, LogOut } from 'lucide-react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useClerkAuth } from '@/hooks/useClerkAuth';
import { UserProfileDisplay } from '@/components/auth/ClerkAuthComponents';
import { CreditBalance } from '@/components/profile/CreditBalance';
import { Settings as SettingsComponent } from '@/components/profile/Settings';

export default function ProfileScreen() {
  const { user, signOut } = useClerkAuth();
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'ออกจากระบบ',
      'คุณต้องการออกจากระบบหรือไม่?',
      [
        {
          text: 'ยกเลิก',
          style: 'cancel'
        },
        {
          text: 'ออกจากระบบ',
          style: 'destructive',
          onPress: () => {
            signOut();
          }
        }
      ]
    );
  };

  const navigateToSavedSentences = () => {
    // TODO: Navigate to saved sentences screen when implemented
    Alert.alert('ประโยคที่บันทึกไว้', 'ฟีเจอร์นี้จะเปิดให้ใช้งานเร็วๆ นี้');
  };



  return (
    <ThemedView className="flex-1">
      <SignedIn>
        <ScrollView className="flex-1 p-4">
          {/* User Profile Section */}
          <Card className="mb-4">
            <CardHeader>
              <ThemedText className="text-xl font-bold text-center mb-2">
                โปรไฟล์ของฉัน
              </ThemedText>
            </CardHeader>
            <CardContent>
              <UserProfileDisplay user={user} />
            </CardContent>
          </Card>

          {/* Credit Balance Section */}
          <CreditBalance 
            showBuyButton={true}
            showRefreshButton={true}
          />

          {/* Quick Actions Section */}
          <Card className="mb-4">
            <CardHeader>
              <ThemedText className="text-lg font-semibold">
                เมนูหลัก
              </ThemedText>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="secondary"
                onPress={navigateToSavedSentences}
                className="flex-row items-center justify-start p-4"
              >
                <FileText size={20} className="mr-3" />
                <View className="flex-1">
                  <ThemedText className="font-medium">
                    ประโยคที่บันทึกไว้
                  </ThemedText>
                  <ThemedText className="text-sm text-gray-500">
                    ดูประโยคและผลการวิเคราะห์ทั้งหมด
                  </ThemedText>
                </View>
              </Button>

              <Button
                variant="secondary"
                onPress={() => setShowSettings(true)}
                className="flex-row items-center justify-start p-4"
              >
                <Settings size={20} className="mr-3" />
                <View className="flex-1">
                  <ThemedText className="font-medium">
                    การตั้งค่า
                  </ThemedText>
                  <ThemedText className="text-sm text-gray-500">
                    ภาษา, การแจ้งเตือน, และอื่นๆ
                  </ThemedText>
                </View>
              </Button>
            </CardContent>
          </Card>

          {/* Logout Section */}
          <Card className="mb-6">
            <CardContent className="pt-4">
              <Button
                variant="secondary"
                onPress={handleLogout}
                className="flex-row items-center justify-center p-4 border-red-200"
              >
                <LogOut size={20} className="mr-2 text-red-500" />
                <ThemedText className="font-medium text-red-500">
                  ออกจากระบบ
                </ThemedText>
              </Button>
            </CardContent>
          </Card>
        </ScrollView>

        {/* Settings Modal */}
        <Modal
          visible={showSettings}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowSettings(false)}
        >
          <SettingsComponent onClose={() => setShowSettings(false)} />
        </Modal>
      </SignedIn>

      <SignedOut>
        <View className="flex-1 justify-center items-center p-4">
          <ThemedText className="text-lg text-center mb-4">
            กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์
          </ThemedText>
          <Button
            variant="primary"
            onPress={() => router.push('/sign-in')}
          >
            <ThemedText className="text-white font-medium">
              เข้าสู่ระบบ
            </ThemedText>
          </Button>
        </View>
      </SignedOut>
    </ThemedView>
  );
}