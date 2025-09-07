import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { SSOProvidersList } from '@/components/auth/ClerkAuthComponents';
import { useClerkAuth } from '@/hooks/useClerkAuth';
import type { SSOProvider } from '@/config/clerk-sso';

export default function SignUpScreen() {
  const { signInWithOAuth } = useClerkAuth();

  const handleProviderSelect = async (provider: SSOProvider) => {
    try {
      await signInWithOAuth(provider);
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.headerTitle}>สมัครสมาชิก</Text>
        <Text style={styles.subtitle}>
          สร้างบัญชีใหม่เพื่อเริ่มใช้งาน AI English Coach
        </Text>
        
        <SSOProvidersList 
          onProviderSelect={handleProviderSelect}
        />
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>มีบัญชีอยู่แล้ว? </Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>เข้าสู่ระบบ</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
  },
  footerLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});