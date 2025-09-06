import React from 'react';
import { ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button, Card } from '@/components/ui';

export default function NestedTestScreen() {
  const router = useRouter();

  return (
    <ThemedView className="flex-1">
      <ScrollView className="flex-1 p-4">
        <ThemedText type="title" className="mb-6">
          🎯 Nested Route Test
        </ThemedText>

        <Card variant="elevated" padding="md" className="mb-4">
          <ThemedText type="subtitle" className="mb-4">
            Navigation Success!
          </ThemedText>
          
          <ThemedText type="default" className="mb-4">
            This page demonstrates that nested routing is working correctly.
            The route structure is: /test/nested
          </ThemedText>
          
          <Button
            onPress={() => router.back()}
            variant="outline"
            className="mb-2"
          >
            ← Go Back
          </Button>
          
          <Link href="/" asChild>
            <Button variant="secondary">
              🏠 Home
            </Button>
          </Link>
        </Card>

        <Card variant="outlined" padding="md">
          <ThemedText type="subtitle" className="mb-4">
            Route Information
          </ThemedText>
          
          <ThemedText type="default" className="mb-2">
            • Current Route: /test/nested
          </ThemedText>
          
          <ThemedText type="default" className="mb-2">
            • Parent Route: /test
          </ThemedText>
          
          <ThemedText type="default">
            • Root Route: /
          </ThemedText>
        </Card>
      </ScrollView>
    </ThemedView>
  );
}