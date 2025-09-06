import React from 'react';
import { ScrollView } from 'react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button, Card } from '@/components/ui';

export default function DynamicTestScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ThemedView className="flex-1">
      <ScrollView className="flex-1 p-4">
        <ThemedText type="title" className="mb-6">
          🔗 Dynamic Route Test
        </ThemedText>

        <Card variant="elevated" padding="md" className="mb-4">
          <ThemedText type="subtitle" className="mb-4">
            Dynamic Parameter Success!
          </ThemedText>
          
          <ThemedText type="default" className="mb-4">
            Dynamic routing is working correctly. The parameter value is:
          </ThemedText>
          
          <Card variant="filled" padding="sm" className="mb-4">
            <ThemedText type="defaultSemiBold" className="text-center">
              ID: {id || 'No ID provided'}
            </ThemedText>
          </Card>
          
          <Button
            onPress={() => router.back()}
            variant="outline"
            className="mb-2"
          >
            ← Go Back
          </Button>
          
          <Link href="/test" asChild>
            <Button variant="secondary" className="mb-2">
              🧭 Test Page
            </Button>
          </Link>
          
          <Link href="/" asChild>
            <Button variant="ghost">
              🏠 Home
            </Button>
          </Link>
        </Card>

        <Card variant="outlined" padding="md" className="mb-4">
          <ThemedText type="subtitle" className="mb-4">
            Route Information
          </ThemedText>
          
          <ThemedText type="default" className="mb-2">
            • Current Route: /test/dynamic/[id]
          </ThemedText>
          
          <ThemedText type="default" className="mb-2">
            • Parameter: id = {id}
          </ThemedText>
          
          <ThemedText type="default">
            • Route Pattern: /test/dynamic/[id]
          </ThemedText>
        </Card>

        <Card variant="outlined" padding="md">
          <ThemedText type="subtitle" className="mb-4">
            Test Other IDs
          </ThemedText>
          
          <Link href="/test/dynamic/456" asChild>
            <Button variant="outline" className="mb-2">
              Test ID: 456
            </Button>
          </Link>
          
          <Link href="/test/dynamic/hello-world" asChild>
            <Button variant="outline" className="mb-2">
              Test ID: hello-world
            </Button>
          </Link>
          
          <Link href="/test/dynamic/test-param" asChild>
            <Button variant="outline">
              Test ID: test-param
            </Button>
          </Link>
        </Card>
      </ScrollView>
    </ThemedView>
  );
}