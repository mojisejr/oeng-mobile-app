import { AuthContainer } from "@/components/auth/AuthContainer";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { SSOProvidersList } from "@/components/auth/ClerkAuthComponents";
import type { SSOProvider } from "@/config/clerk-sso";
import { useClerkAuth } from "@/hooks/useClerkAuth";
import { useRouter } from "expo-router";
import React from "react";

export default function SignInScreen() {
  const { signInWithOAuth } = useClerkAuth();
  const router = useRouter();

  const handleProviderSelect = async (provider: SSOProvider) => {
    try {
      await signInWithOAuth(provider);
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  return (
    <AuthContainer>
      <AuthHeader
        title="เข้าสู่ระบบ"
        subtitle="เข้าสู่ระบบเพื่อใช้งาน AI English Coach"
        showLogo={true}
      />

      <SSOProvidersList onProviderSelect={handleProviderSelect} />

      {/* <TouchableOpacity 
        onPress={() => router.push('/(auth)/sign-up')}
        className="mt-6 flex-row justify-center items-center"
      >
        <Text className="text-sm text-gray-600">ยังไม่มีบัญชี? </Text>
        <Text className="text-sm text-blue-600 font-medium">สมัครสมาชิก</Text>
      </TouchableOpacity> */}
    </AuthContainer>
  );
}

// Styles are now handled by the new auth components
