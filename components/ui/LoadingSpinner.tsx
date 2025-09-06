import React from 'react';
import { View, ActivityIndicator, Text, ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps extends ViewProps {
  size?: 'small' | 'large' | number;
  color?: string;
  text?: string;
  variant?: 'default' | 'overlay' | 'inline';
  className?: string;
}

const variantStyles = {
  default: 'items-center justify-center',
  overlay: 'absolute inset-0 bg-white/80 items-center justify-center z-50',
  inline: 'flex-row items-center',
};

export function LoadingSpinner({
  size = 'large',
  color = '#3B82F6',
  text,
  variant = 'default',
  className,
  ...props
}: LoadingSpinnerProps) {
  return (
    <View
      className={cn(
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <ActivityIndicator
        size={size}
        color={color}
        className={variant === 'inline' && text ? 'mr-2' : ''}
      />
      {text && (
        <Text className={cn(
          'text-gray-600 font-medium',
          variant === 'inline' ? 'ml-2' : 'mt-2'
        )}>
          {text}
        </Text>
      )}
    </View>
  );
}

// Preset loading components for common use cases
export function FullScreenLoader({ text = 'กำลังโหลด...' }: { text?: string }) {
  return (
    <LoadingSpinner
      variant="overlay"
      text={text}
      className="bg-white"
    />
  );
}

export function InlineLoader({ text }: { text?: string }) {
  return (
    <LoadingSpinner
      variant="inline"
      size="small"
      text={text}
      className="py-2"
    />
  );
}

export function ButtonLoader() {
  return (
    <ActivityIndicator
      size="small"
      color="#ffffff"
    />
  );
}