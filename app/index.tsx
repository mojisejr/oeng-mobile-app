import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';

/**
 * Root index route that handles initial navigation
 * Redirects users based on authentication state
 */
export default function IndexScreen() {
  const { isLoaded, isSignedIn } = useAuth();

  // Show loading screen while Clerk is initializing
  if (!isLoaded) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#fff' 
      }}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={{ 
          marginTop: 16, 
          fontSize: 16, 
          color: '#666' 
        }}>
          กำลังเตรียมระบบ...
        </Text>
      </View>
    );
  }

  // Redirect based on authentication state
  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/(auth)/sign-in" />;
  }
}