import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cn } from '@/lib/utils';

export interface AuthContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  safeArea?: boolean;
  className?: string;
  contentClassName?: string;
  scrollViewClassName?: string;
  keyboardOffset?: number;
  showsVerticalScrollIndicator?: boolean;
  centerContent?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const AuthContainer: React.FC<AuthContainerProps> = ({
  children,
  scrollable = true,
  keyboardAvoiding = true,
  safeArea = true,
  className,
  contentClassName,
  scrollViewClassName,
  keyboardOffset = 0,
  showsVerticalScrollIndicator = false,
  centerContent = true,
  padding = 'md',
}) => {
  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'sm':
        return 'px-4 py-4';
      case 'md':
        return 'px-6 py-6';
      case 'lg':
        return 'px-8 py-8';
      default:
        return 'px-6 py-6';
    }
  };

  const baseContainerStyles = cn(
    'flex-1 bg-white',
    className
  );

  const contentStyles = cn(
    'flex-1',
    getPaddingStyles(),
    centerContent && 'justify-center',
    contentClassName
  );

  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView
          className={cn('flex-1', scrollViewClassName)}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: centerContent ? 'center' : 'flex-start',
          }}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View className={contentStyles}>
            {children}
          </View>
        </ScrollView>
      );
    }

    return (
      <View className={contentStyles}>
        {children}
      </View>
    );
  };

  const renderWithKeyboardAvoiding = (content: React.ReactNode) => {
    if (!keyboardAvoiding) {
      return content;
    }

    return (
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardOffset}
      >
        {content}
      </KeyboardAvoidingView>
    );
  };

  const renderWithSafeArea = (content: React.ReactNode) => {
    if (!safeArea) {
      return (
        <View className={baseContainerStyles}>
          {content}
        </View>
      );
    }

    return (
      <SafeAreaView className={baseContainerStyles} edges={['top', 'bottom']}>
        {content}
      </SafeAreaView>
    );
  };

  const content = renderContent();
  const contentWithKeyboard = renderWithKeyboardAvoiding(content);
  const finalContent = renderWithSafeArea(contentWithKeyboard);

  return finalContent;
};

export default AuthContainer;