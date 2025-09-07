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
import { validateLoginForm, getFirebaseErrorMessage } from '../../lib/auth';
import type { LoginFormData } from '../../lib/auth';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Ionicons } from '@expo/vector-icons';

/**
 * Login Screen
 * Handles user authentication with Firebase Auth
 */
export default function LoginScreen() {
  const { signIn, signInWithGoogle } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setErrors({});

      // Validate form
      const validation = validateLoginForm(formData.email, formData.password);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      // Attempt login
      await signIn(formData.email, formData.password);
      
      // Success - navigation will be handled by AuthContext
      router.replace('/explore' as any);
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      Alert.alert('เข้าสู่ระบบไม่สำเร็จ', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      router.replace('/explore' as any);
    } catch (error: any) {
      Alert.alert('เข้าสู่ระบบด้วย Google ไม่สำเร็จ', error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
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
              ยินดีต้อนรับกลับ
            </Text>
            <Text className="text-gray-600 text-base">
              เข้าสู่ระบบเพื่อใช้งาน AI English Coach
            </Text>
          </View>

          {/* Login Form */}
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
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className={`rounded-lg py-4 mt-6 ${
                loading ? 'bg-blue-300' : 'bg-blue-600'
              }`}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-semibold text-base">
                  เข้าสู่ระบบ
                </Text>
              )}
            </TouchableOpacity>

            {/* Forgot Password Link */}
            <TouchableOpacity className="mt-4">
              <Text className="text-blue-600 text-center text-base">
                ลืมรหัสผ่าน?
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="mx-4 text-gray-500 text-sm">
                หรือ
              </Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            {/* Google Sign-In Button */}
            <TouchableOpacity
              className={`border border-gray-300 rounded-lg py-4 flex-row items-center justify-center ${
                loading ? 'opacity-50' : ''
              }`}
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              <Ionicons name="logo-google" size={20} color="#4285F4" />
              <Text className="ml-3 text-gray-700 font-medium text-base">
                เข้าสู่ระบบด้วย Google
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View className="flex-1 justify-end pb-8">
            <View className="flex-row justify-center items-center">
              <Text className="text-gray-600 text-base">
                ยังไม่มีบัญชี?
              </Text>
              <Link href={"/(auth)/signup" as any} asChild>
                <TouchableOpacity className="ml-2">
                  <Text className="text-blue-600 font-semibold text-base">
                    สมัครสมาชิก
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