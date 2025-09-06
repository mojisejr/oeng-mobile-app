import React from 'react';
import { ScrollView, Text } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button, Card, Input, LoadingSpinner } from '@/components/ui';

export default function TestScreen() {
  const router = useRouter();
  const [inputValue, setInputValue] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleTestNavigation = () => {
    router.push('/test/nested');
  };

  const handleTestLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <ThemedView className="flex-1">
      <ScrollView className="flex-1 p-4">
        <ThemedText type="title" className="mb-6">
          🧭 Expo Router Test Page
        </ThemedText>

        {/* Navigation Tests */}
        <Card variant="elevated" padding="md" className="mb-4">
          <ThemedText type="subtitle" className="mb-4">
            Navigation Tests
          </ThemedText>
          
          <Link href="/" className="mb-2">
            <Text className="text-blue-600 underline">← Back to Home</Text>
          </Link>
          
          <Button
            onPress={handleTestNavigation}
            className="mb-2"
          >
            Test Nested Route
          </Button>
          
          <Link href="/test/dynamic/123" asChild>
            <Button variant="outline">
              Test Dynamic Route
            </Button>
          </Link>
        </Card>

        {/* UI Components Tests */}
        <Card variant="elevated" padding="md" className="mb-4">
          <ThemedText type="subtitle" className="mb-4">
            UI Components Tests
          </ThemedText>
          
          <Input
            label="Test Input"
            placeholder="Type something..."
            value={inputValue}
            onChangeText={setInputValue}
            helperText="This is a helper text"
            className="mb-4"
          />
          
          <Button
            onPress={handleTestLoading}
            loading={loading}
            className="mb-2"
          >
            Test Loading Button
          </Button>
          
          {loading && (
            <LoadingSpinner
              text="Testing loading..."
              variant="inline"
              className="mb-4"
            />
          )}
        </Card>

        {/* Theme Tests */}
        <Card variant="filled" padding="md" className="mb-4">
          <ThemedText type="subtitle" className="mb-4">
            Theme Tests
          </ThemedText>
          
          <ThemedText type="default" className="mb-2">
            Default themed text
          </ThemedText>
          
          <ThemedText type="defaultSemiBold" className="mb-2">
            Semi-bold themed text
          </ThemedText>
          
          <ThemedText type="link">
            Link styled text
          </ThemedText>
        </Card>

        {/* TypeScript Integration Test */}
        <Card variant="outlined" padding="md">
          <ThemedText type="subtitle" className="mb-4">
            TypeScript Integration
          </ThemedText>
          
          <Text className="text-gray-600 text-sm">
            Input value: {inputValue || 'Empty'}
          </Text>
          
          <Text className="text-gray-600 text-sm">
            Loading state: {loading ? 'True' : 'False'}
          </Text>
        </Card>
      </ScrollView>
    </ThemedView>
  );
}