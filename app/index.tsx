import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScrollView, StyleSheet } from "react-native";

export default function MainScreen() {
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
