import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { Button } from '@/components/ui';
import { db, isFirebaseConfigured, COLLECTIONS } from '@/firebase-sdk';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';

export default function FirebaseTestScreen() {
  const [status, setStatus] = useState<{
    config: boolean;
    firestore: string;
    error?: string;
  }>({
    config: false,
    firestore: 'Not tested'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check Firebase configuration on mount
    const configStatus = isFirebaseConfigured();
    setStatus(prev => ({ ...prev, config: configStatus }));
    
    if (!configStatus) {
      setStatus(prev => ({ 
        ...prev, 
        error: 'Firebase configuration is incomplete. Check environment variables.' 
      }));
    }
  }, []);



  const testFirestore = async () => {
    try {
      setLoading(true);
      
      // Test writing to Firestore
      const testDoc = {
        message: 'Firebase test from mobile app',
        timestamp: new Date(),
        platform: 'React Native Expo'
      };
      
      const docRef = await addDoc(collection(db, 'test'), testDoc);
      
      // Test reading from Firestore
      const testQuery = query(collection(db, 'test'), limit(1));
      const querySnapshot = await getDocs(testQuery);
      
      if (!querySnapshot.empty) {
        setStatus(prev => ({ 
          ...prev, 
          firestore: `✅ Success - Doc ID: ${docRef.id.substring(0, 8)}...` 
        }));
      } else {
        setStatus(prev => ({ ...prev, firestore: '❌ Failed - No documents found' }));
      }
    } catch (error: any) {
      setStatus(prev => ({ 
        ...prev, 
        firestore: `❌ Failed - ${error.message}`,
        error: error.message 
      }));
    } finally {
      setLoading(false);
    }
  };



  const runAllTests = async () => {
    if (!status.config) {
      Alert.alert('Configuration Error', 'Firebase is not properly configured. Please check your environment variables.');
      return;
    }
    
    await testFirestore();
  };

  const getStatusColor = (statusText: string) => {
    if (statusText.includes('✅')) return 'text-green-600';
    if (statusText.includes('❌')) return 'text-red-600';
    if (statusText.includes('⏳')) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-6 text-center">Firebase Configuration Test</Text>
      
      {/* Configuration Status */}
      <View className="mb-6 p-4 bg-gray-50 rounded-lg">
        <Text className="text-lg font-semibold mb-2">Configuration Status</Text>
        <Text className={`text-base ${status.config ? 'text-green-600' : 'text-red-600'}`}>
          {status.config ? '✅ Firebase Configured' : '❌ Firebase Not Configured'}
        </Text>
        
        {/* Environment Variables Check */}
        <View className="mt-3">
          <Text className="text-sm font-medium text-gray-700">Environment Variables:</Text>
          <Text className="text-xs text-gray-600 mt-1">
            FIREBASE_API_KEY: {process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing'}
          </Text>
          <Text className="text-xs text-gray-600">
            FIREBASE_PROJECT_ID: {process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing'}
          </Text>
          <Text className="text-xs text-gray-600">
            FIREBASE_AUTH_DOMAIN: {process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing'}
          </Text>
        </View>
      </View>

      {/* Test Results */}
      <View className="mb-6 p-4 bg-gray-50 rounded-lg">
        <Text className="text-lg font-semibold mb-3">Test Results</Text>
        
        <View className="space-y-2">
          <View>
            <Text className="text-sm font-medium text-gray-700">Firestore Database:</Text>
            <Text className={`text-sm ${getStatusColor(status.firestore)}`}>{status.firestore}</Text>
          </View>
        </View>
      </View>

      {/* Error Display */}
      {status.error && (
        <View className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <Text className="text-sm font-medium text-red-800 mb-1">Error Details:</Text>
          <Text className="text-xs text-red-600">{status.error}</Text>
        </View>
      )}

      {/* Test Buttons */}
      <View className="space-y-3">
        <Button 
          onPress={runAllTests}
          disabled={loading || !status.config}
          className="w-full"
        >
          {loading ? 'Testing...' : 'Run All Tests'}
        </Button>
        
        <Button 
          variant="outline" 
          onPress={testFirestore}
          disabled={loading || !status.config}
          className="w-full"
        >
          Test Firestore
        </Button>
      </View>

      {/* Collections Info */}
      <View className="mt-6 p-4 bg-blue-50 rounded-lg">
        <Text className="text-sm font-medium text-blue-800 mb-2">Available Collections:</Text>
        {Object.entries(COLLECTIONS).map(([key, value]) => (
          <Text key={key} className="text-xs text-blue-600">
            {key}: {value}
          </Text>
        ))}
      </View>

      {/* Instructions */}
      <View className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <Text className="text-sm font-medium text-yellow-800 mb-2">Setup Instructions:</Text>
        <Text className="text-xs text-yellow-700">
          1. Copy .env.example to .env{"\n"}
          2. Fill in your Firebase configuration values{"\n"}
          3. Restart the development server{"\n"}
          4. Run tests to verify connection
        </Text>
      </View>
    </ScrollView>
  );
}