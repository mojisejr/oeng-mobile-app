import React from 'react';
import { View, Text, ScrollView } from 'react-native';

/**
 * Test component to validate Nativewind functionality
 * This component tests various Tailwind CSS classes to ensure they work properly
 */
export function NativewindTest() {
  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4 space-y-4">
        
        {/* Header Section */}
        <View className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Nativewind Test Component
          </Text>
          <Text className="text-gray-600 dark:text-gray-300">
            Testing various Tailwind CSS classes
          </Text>
        </View>

        {/* Color Tests */}
        <View className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Color Tests
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <View className="bg-red-500 p-3 rounded">
              <Text className="text-white text-sm">Red</Text>
            </View>
            <View className="bg-blue-500 p-3 rounded">
              <Text className="text-white text-sm">Blue</Text>
            </View>
            <View className="bg-green-500 p-3 rounded">
              <Text className="text-white text-sm">Green</Text>
            </View>
            <View className="bg-yellow-500 p-3 rounded">
              <Text className="text-white text-sm">Yellow</Text>
            </View>
          </View>
        </View>

        {/* Layout Tests */}
        <View className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Layout Tests
          </Text>
          
          {/* Flex Row */}
          <View className="flex-row justify-between items-center bg-blue-100 dark:bg-blue-900 p-3 rounded mb-2">
            <Text className="text-blue-800 dark:text-blue-200">Left</Text>
            <Text className="text-blue-800 dark:text-blue-200">Center</Text>
            <Text className="text-blue-800 dark:text-blue-200">Right</Text>
          </View>

          {/* Grid-like layout */}
          <View className="flex-row flex-wrap gap-2">
            <View className="flex-1 bg-purple-100 dark:bg-purple-900 p-2 rounded min-w-0">
              <Text className="text-purple-800 dark:text-purple-200 text-sm text-center">Box 1</Text>
            </View>
            <View className="flex-1 bg-purple-100 dark:bg-purple-900 p-2 rounded min-w-0">
              <Text className="text-purple-800 dark:text-purple-200 text-sm text-center">Box 2</Text>
            </View>
          </View>
        </View>

        {/* Spacing & Sizing Tests */}
        <View className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Spacing & Sizing Tests
          </Text>
          <View className="space-y-2">
            <View className="h-8 bg-indigo-200 dark:bg-indigo-800 rounded">
              <Text className="text-indigo-800 dark:text-indigo-200 text-center py-1 text-sm">
                Height: h-8
              </Text>
            </View>
            <View className="h-12 bg-indigo-300 dark:bg-indigo-700 rounded">
              <Text className="text-indigo-800 dark:text-indigo-200 text-center py-2 text-sm">
                Height: h-12
              </Text>
            </View>
            <View className="h-16 bg-indigo-400 dark:bg-indigo-600 rounded">
              <Text className="text-indigo-800 dark:text-indigo-200 text-center py-4 text-sm">
                Height: h-16
              </Text>
            </View>
          </View>
        </View>

        {/* Typography Tests */}
        <View className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Typography Tests
          </Text>
          <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Extra Small Text (text-xs)
          </Text>
          <Text className="text-sm text-gray-700 dark:text-gray-300 mb-1">
            Small Text (text-sm)
          </Text>
          <Text className="text-base text-gray-800 dark:text-gray-200 mb-1">
            Base Text (text-base)
          </Text>
          <Text className="text-lg text-gray-900 dark:text-white mb-1">
            Large Text (text-lg)
          </Text>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            Extra Large Bold (text-xl font-bold)
          </Text>
        </View>

        {/* Border & Shadow Tests */}
        <View className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Border & Shadow Tests
          </Text>
          <View className="space-y-3">
            <View className="border border-gray-300 dark:border-gray-600 rounded p-3">
              <Text className="text-gray-700 dark:text-gray-300">Border: border</Text>
            </View>
            <View className="border-2 border-blue-500 rounded p-3">
              <Text className="text-blue-700 dark:text-blue-300">Border: border-2 border-blue-500</Text>
            </View>
            <View className="bg-gray-100 dark:bg-gray-700 shadow-lg rounded-lg p-3">
              <Text className="text-gray-700 dark:text-gray-300">Shadow: shadow-lg</Text>
            </View>
          </View>
        </View>

        {/* Success Message */}
        <View className="bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg p-4">
          <Text className="text-green-800 dark:text-green-200 font-medium text-center">
            ✅ If you can see all these styled elements, Nativewind is working correctly!
          </Text>
        </View>

      </View>
    </ScrollView>
  );
}

export default NativewindTest;