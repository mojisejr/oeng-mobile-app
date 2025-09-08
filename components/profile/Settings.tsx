import React, { useState } from 'react';
import { View, Switch, Alert } from 'react-native';
import { Settings as SettingsIcon, Globe, Bell, Palette, Info, HelpCircle } from 'lucide-react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

interface SettingsProps {
  onClose?: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const [language, setLanguage] = useState<'th' | 'en'>('th');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

  const handleLanguageChange = () => {
    const newLanguage = language === 'th' ? 'en' : 'th';
    setLanguage(newLanguage);
    Alert.alert(
      'ภาษา / Language',
      `ภาษาได้เปลี่ยนเป็น ${newLanguage === 'th' ? 'ไทย' : 'English'} แล้ว\nLanguage changed to ${newLanguage === 'th' ? 'Thai' : 'English'}`
    );
  };

  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
    Alert.alert(
      'การแจ้งเตือน',
      notificationsEnabled ? 'ปิดการแจ้งเตือนแล้ว' : 'เปิดการแจ้งเตือนแล้ว'
    );
  };

  const handleThemeChange = () => {
    const themes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
    
    const themeNames = {
      light: 'สว่าง',
      dark: 'มืด',
      auto: 'อัตโนมัติ'
    };
    
    Alert.alert('ธีม', `เปลี่ยนเป็นธีม${themeNames[nextTheme]}แล้ว`);
  };

  const handleAbout = () => {
    Alert.alert(
      'เกี่ยวกับแอป',
      'AI English Coach v1.0\n\nแอปพลิเคชันช่วยฝึกภาษาอังกฤษด้วย AI\nพัฒนาโดยทีม OENG\n\n© 2025 All rights reserved'
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'ความช่วยเหลือ',
      '1. พิมพ์ประโยคภาษาอังกฤษที่ต้องการตรวจสอบ\n2. เพิ่มคำแปลและบริบท (ถ้ามี)\n3. กดวิเคราะห์เพื่อรับคำแนะนำจาก AI\n4. ดูผลการวิเคราะห์และปรับปรุงประโยค\n\nหากมีปัญหาติดต่อทีมสนับสนุน'
    );
  };

  return (
    <ThemedView className="flex-1">
      <Card variant="elevated" padding="none" className="m-4">
        <CardHeader className="pb-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <SettingsIcon size={24} className="text-blue-600 mr-3" />
              <ThemedText type="subtitle" className="text-gray-900">
                การตั้งค่า
              </ThemedText>
            </View>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onPress={onClose}
                className="px-2"
              >
                <ThemedText className="text-gray-600">ปิด</ThemedText>
              </Button>
            )}
          </View>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Language Settings */}
          <View className="space-y-3">
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center flex-1">
                <Globe size={20} className="text-gray-600 mr-3" />
                <View className="flex-1">
                  <ThemedText type="defaultSemiBold" className="text-gray-900">
                    ภาษา / Language
                  </ThemedText>
                  <ThemedText type="caption" className="text-gray-500">
                    {language === 'th' ? 'ไทย (Thai)' : 'English'}
                  </ThemedText>
                </View>
              </View>
              <Button
                variant="outline"
                size="sm"
                onPress={handleLanguageChange}
                className="ml-2"
              >
                <ThemedText className="text-blue-600">
                  {language === 'th' ? 'EN' : 'TH'}
                </ThemedText>
              </Button>
            </View>

            {/* Notification Settings */}
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center flex-1">
                <Bell size={20} className="text-gray-600 mr-3" />
                <View className="flex-1">
                  <ThemedText type="defaultSemiBold" className="text-gray-900">
                    การแจ้งเตือน
                  </ThemedText>
                  <ThemedText type="caption" className="text-gray-500">
                    รับการแจ้งเตือนจากแอป
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                thumbColor={notificationsEnabled ? '#ffffff' : '#f3f4f6'}
              />
            </View>

            {/* Theme Settings */}
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center flex-1">
                <Palette size={20} className="text-gray-600 mr-3" />
                <View className="flex-1">
                  <ThemedText type="defaultSemiBold" className="text-gray-900">
                    ธีม
                  </ThemedText>
                  <ThemedText type="caption" className="text-gray-500">
                    {theme === 'light' ? 'สว่าง' : theme === 'dark' ? 'มืด' : 'อัตโนมัติ'}
                  </ThemedText>
                </View>
              </View>
              <Button
                variant="outline"
                size="sm"
                onPress={handleThemeChange}
                className="ml-2"
              >
                <ThemedText className="text-blue-600">
                  {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '🔄'}
                </ThemedText>
              </Button>
            </View>
          </View>

          {/* App Information */}
          <View className="space-y-3 pt-4">
            <ThemedText type="subtitle" className="text-gray-700 mb-2">
              เกี่ยวกับแอป
            </ThemedText>

            <Button
              variant="ghost"
              onPress={handleHelp}
              className="flex-row items-center justify-start p-3 rounded-lg"
            >
              <HelpCircle size={20} className="text-gray-600 mr-3" />
              <View className="flex-1">
                <ThemedText type="defaultSemiBold" className="text-gray-900">
                  ความช่วยเหลือ
                </ThemedText>
                <ThemedText type="caption" className="text-gray-500">
                  วิธีใช้งานและคำถามที่พบบ่อย
                </ThemedText>
              </View>
            </Button>

            <Button
              variant="ghost"
              onPress={handleAbout}
              className="flex-row items-center justify-start p-3 rounded-lg"
            >
              <Info size={20} className="text-gray-600 mr-3" />
              <View className="flex-1">
                <ThemedText type="defaultSemiBold" className="text-gray-900">
                  เกี่ยวกับแอป
                </ThemedText>
                <ThemedText type="caption" className="text-gray-500">
                  เวอร์ชันและข้อมูลแอป
                </ThemedText>
              </View>
            </Button>
          </View>
        </CardContent>
      </Card>
    </ThemedView>
  );
}

export default Settings;