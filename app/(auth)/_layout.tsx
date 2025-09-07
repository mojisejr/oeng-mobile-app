import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/**
 * Authentication Layout
 * Stack navigation for authentication screens (login, signup)
 */
export default function AuthLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false, // Hide headers for clean auth UI
          contentStyle: {
            backgroundColor: '#ffffff', // White background
          },
          animation: 'slide_from_right', // Smooth transitions
        }}
      >
        <Stack.Screen
          name="login"
          options={{
            title: 'เข้าสู่ระบบ',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            title: 'สมัครสมาชิก',
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="dark" backgroundColor="#ffffff" />
    </>
  );
}