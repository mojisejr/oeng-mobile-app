import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../contexts/AuthContext';
import { validateRegistrationForm, getFirebaseErrorMessage } from '../../lib/auth';
import type { RegistrationFormData } from '../../lib/auth';

/**
 * Sign Up Screen
 * Handles user registration with Firebase Auth
 */
export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState<RegistrationFormData>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<RegistrationFormData>>({});

  const handleInputChange = (field: keyof RegistrationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);
      setErrors({});

      // Validate form
      const validation = validateRegistrationForm(
        formData.email,
        formData.password,
        formData.confirmPassword
      );
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      // Attempt registration
      await signUp(formData.email, formData.password);
      
      // Success - navigation will be handled by AuthContext
      router.replace('/explore' as any);
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      Alert.alert('สมัครสมาชิกไม่สำเร็จ', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 bg-white px-6 pt-16">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              สร้างบัญชีใหม่
            </Text>
            <Text className="text-gray-600 text-base">
              เริ่มต้นการเรียนรู้ภาษาอังกฤษกับ AI Coach
            </Text>
          </View>

          {/* Registration Form */}
          <View className="space-y-4">
            {/* Email Input */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">
                อีเมล
              </Text>
              <TextInput
                className={`border rounded-lg px-4 py-3 text-base ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="กรุณาใส่อีเมลของคุณ"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              {errors.email && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.email}
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">
                รหัสผ่าน
              </Text>
              <TextInput
                className={`border rounded-lg px-4 py-3 text-base ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="กรุณาใส่รหัสผ่านของคุณ"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              {errors.password && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.password}
                </Text>
              )}
              <Text className="text-gray-500 text-xs mt-1">
                รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร ประกอบด้วยตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลข
              </Text>
            </View>

            {/* Confirm Password Input */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">
                ยืนยันรหัสผ่าน
              </Text>
              <TextInput
                className={`border rounded-lg px-4 py-3 text-base ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="กรุณายืนยันรหัสผ่านของคุณ"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              {errors.confirmPassword && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </Text>
              )}
            </View>

            {/* Terms and Conditions */}
            <View className="mt-4">
              <Text className="text-gray-600 text-sm text-center">
                การสมัครสมาชิกแสดงว่าคุณยอมรับ{' '}
                <Text className="text-blue-600 underline">
                  เงื่อนไขการใช้งาน
                </Text>{' '}
                และ{' '}
                <Text className="text-blue-600 underline">
                  นโยบายความเป็นส่วนตัว
                </Text>
              </Text>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              className={`rounded-lg py-4 mt-6 ${
                loading ? 'bg-blue-300' : 'bg-blue-600'
              }`}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-semibold text-base">
                  สร้างบัญชี
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View className="flex-1 justify-end pb-8">
            <View className="flex-row justify-center items-center">
              <Text className="text-gray-600 text-base">
                มีบัญชีอยู่แล้ว?
              </Text>
              <Link href={"/(auth)/login" as any} asChild>
                <TouchableOpacity className="ml-2">
                  <Text className="text-blue-600 font-semibold text-base">
                    เข้าสู่ระบบ
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}