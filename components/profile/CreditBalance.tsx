import React, { useState, useEffect } from 'react';
import { View, Alert, ActivityIndicator } from 'react-native';
import { CreditCard, Plus, RefreshCw } from 'lucide-react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useClerkAuth } from '@/hooks/useClerkAuth';

interface CreditBalanceProps {
  showBuyButton?: boolean;
  showRefreshButton?: boolean;
  compact?: boolean;
  onBuyCredits?: () => void;
}

interface CreditData {
  balance: number;
  loading: boolean;
  error: string | null;
}

export const CreditBalance: React.FC<CreditBalanceProps> = ({
  showBuyButton = true,
  showRefreshButton = false,
  compact = false,
  onBuyCredits
}) => {
  const { user } = useClerkAuth();
  const [creditData, setCreditData] = useState<CreditData>({
    balance: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (user) {
      fetchCreditBalance();
    }
  }, [user]);

  const fetchCreditBalance = async () => {
    try {
      setCreditData(prev => ({ ...prev, loading: true, error: null }));
      
      // Call the existing credit balance API
      const response = await fetch('/api/credits/balance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCreditData({
          balance: data.balance || 0,
          loading: false,
          error: null
        });
      } else {
        throw new Error('Failed to fetch credit balance');
      }
    } catch (error) {
      console.error('Error fetching credit balance:', error);
      setCreditData({
        balance: 0,
        loading: false,
        error: 'ไม่สามารถโหลดข้อมูลเครดิตได้'
      });
    }
  };

  const handleBuyCredits = () => {
    if (onBuyCredits) {
      onBuyCredits();
    } else {
      // Default behavior - show coming soon alert
      Alert.alert('ซื้อเครดิต', 'ฟีเจอร์นี้จะเปิดให้ใช้งานเร็วๆ นี้');
    }
  };

  const handleRefresh = () => {
    fetchCreditBalance();
  };

  if (compact) {
    return (
      <View className="flex-row items-center justify-between p-3 bg-blue-50 rounded-lg">
        <View className="flex-row items-center">
          <CreditCard size={16} className="mr-2 text-blue-600" />
          <ThemedText className="text-sm font-medium text-blue-800">
            เครดิต: {creditData.loading ? '...' : creditData.balance}
          </ThemedText>
        </View>
        {showBuyButton && (
          <Button
            variant="primary"
            size="sm"
            onPress={handleBuyCredits}
            className="px-3 py-1"
          >
            <Plus size={12} className="mr-1" />
            <ThemedText className="text-xs text-white">
              ซื้อ
            </ThemedText>
          </Button>
        )}
      </View>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <View className="flex-row items-center justify-between">
          <ThemedText className="text-lg font-semibold flex-row items-center">
            <CreditCard size={20} className="mr-2" />
            เครดิตคงเหลือ
          </ThemedText>
          {showRefreshButton && (
            <Button
              variant="secondary"
              size="sm"
              onPress={handleRefresh}
              disabled={creditData.loading}
              className="p-2"
            >
              {creditData.loading ? (
                <ActivityIndicator size="small" />
              ) : (
                <RefreshCw size={16} />
              )}
            </Button>
          )}
        </View>
      </CardHeader>
      <CardContent>
        {creditData.error ? (
          <View className="items-center py-4">
            <ThemedText className="text-red-500 text-center mb-3">
              {creditData.error}
            </ThemedText>
            <Button
              variant="secondary"
              size="sm"
              onPress={handleRefresh}
            >
              <ThemedText className="font-medium">
                ลองใหม่
              </ThemedText>
            </Button>
          </View>
        ) : (
          <>
            <View className="flex-row items-center justify-between">
              <View>
                <ThemedText className="text-3xl font-bold text-blue-600">
                  {creditData.loading ? (
                    <ActivityIndicator size="large" color="#2563eb" />
                  ) : (
                    creditData.balance
                  )}
                </ThemedText>
                <ThemedText className="text-sm text-gray-500">
                  เครดิต
                </ThemedText>
              </View>
              {showBuyButton && (
                <Button
                  variant="primary"
                  size="sm"
                  onPress={handleBuyCredits}
                  className="flex-row items-center"
                >
                  <Plus size={16} className="mr-1" />
                  <ThemedText className="text-white font-medium">
                    ซื้อเครดิต
                  </ThemedText>
                </Button>
              )}
            </View>
            <ThemedText className="text-xs text-gray-400 mt-2">
              ใช้ 1 เครดิตต่อการวิเคราะห์ประโยค
            </ThemedText>
            
            {/* Credit Status Indicator */}
            <View className="mt-3">
              {creditData.balance === 0 && (
                <View className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <ThemedText className="text-red-600 text-sm font-medium text-center">
                    ⚠️ เครดิตหมดแล้ว - กรุณาซื้อเครดิตเพื่อใช้งานต่อ
                  </ThemedText>
                </View>
              )}
              {creditData.balance > 0 && creditData.balance <= 5 && (
                <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <ThemedText className="text-yellow-600 text-sm font-medium text-center">
                    ⚡ เครดิตเหลือน้อย - แนะนำให้ซื้อเครดิตเพิ่ม
                  </ThemedText>
                </View>
              )}
              {creditData.balance > 5 && (
                <View className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <ThemedText className="text-green-600 text-sm font-medium text-center">
                    ✅ เครดิตเพียงพอสำหรับการใช้งาน
                  </ThemedText>
                </View>
              )}
            </View>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CreditBalance;