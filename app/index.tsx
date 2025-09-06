import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { NativewindTest } from "@/components/NativewindTest";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";

export default function MainScreen() {
  const [showNativewindTest, setShowNativewindTest] = useState(false);

  if (showNativewindTest) {
    return (
      <View className="flex-1">
        <View className="bg-white dark:bg-gray-800 p-4 pt-12 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity 
            className="bg-blue-500 px-4 py-2 rounded-lg"
            onPress={() => setShowNativewindTest(false)}
          >
            <Text className="text-white font-medium text-center">
              ← Back to Main Screen
            </Text>
          </TouchableOpacity>
        </View>
        <NativewindTest />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Oeng App
          </ThemedText>
          <ThemedText type="subtitle" style={styles.subtitle}>
            Welcome to your mobile application
          </ThemedText>
        </ThemedView>

        {/* Nativewind Test Button */}
        <ThemedView style={styles.section}>
          <TouchableOpacity 
            className="bg-purple-500 p-4 rounded-lg mb-4"
            onPress={() => setShowNativewindTest(true)}
          >
            <Text className="text-white font-bold text-center text-lg">
              🧪 Test Nativewind Configuration
            </Text>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Getting Started
          </ThemedText>
          <ThemedText style={styles.description}>
            This is your main application screen. The project has been cleaned
            up and is ready for development.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Features Ready
          </ThemedText>
          <ThemedText style={styles.description}>
            • Clean project structure{"\n"}• Serverless API endpoints in /api
            folder{"\n"}• Firebase integration ready{"\n"}• Stripe payment
            processing ready{"\n"}• TypeScript configuration
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Next Steps
          </ThemedText>
          <ThemedText style={styles.description}>
            Start building your app features by modifying this screen or adding
            new screens to the app directory.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    opacity: 0.8,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
});
