import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text, ActivityIndicator } from "react-native";
import "react-native-reanimated";
import "./global.css";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

import { useColorScheme } from "@/hooks/useColorScheme";

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch {
      return;
    }
  },
};

const publishableKey = Constants.expoConfig?.extra?.clerkPublishableKey || process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
  );
}

// Loading component for Clerk initialization
const ClerkLoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
    <ActivityIndicator size="large" color="#0066cc" />
    <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>กำลังเตรียมระบบ...</Text>
  </View>
);

// Error component for Clerk initialization failures
const ClerkErrorScreen = (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#d32f2f', marginBottom: 8 }}>เกิดข้อผิดพลาด</Text>
    <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 16 }}>
      ไม่สามารถเชื่อมต่อระบบการยืนยันตัวตนได้
    </Text>
    <Text style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
      กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง
    </Text>
  </View>
);

// Main app content with auth state handling
function AppContent() {
  const { isLoaded } = useAuth();
  const colorScheme = useColorScheme();

  if (!isLoaded) {
    return <ClerkLoadingScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary fallback={ClerkErrorScreen}>
      <ClerkProvider
        publishableKey={publishableKey}
        tokenCache={tokenCache}
      >
        <AppContent />
      </ClerkProvider>
    </ErrorBoundary>
  );
}
