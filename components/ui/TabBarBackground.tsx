import { View, StyleSheet } from 'react-native';

export default function TabBarBackground() {
  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: 'rgba(255, 255, 255, 0.95)' }
      ]}
    />
  );
}