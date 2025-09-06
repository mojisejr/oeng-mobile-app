import React from 'react';
import { Pressable, Text, ActivityIndicator, PressableProps } from 'react-native';
import { cn } from '@/lib/utils';

interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

const buttonVariants = {
  primary: 'bg-blue-600 active:bg-blue-700',
  secondary: 'bg-gray-600 active:bg-gray-700',
  outline: 'border border-gray-300 bg-transparent active:bg-gray-50',
  ghost: 'bg-transparent active:bg-gray-100',
  destructive: 'bg-red-600 active:bg-red-700',
};

const buttonSizes = {
  sm: 'px-3 py-2 min-h-[36px]',
  md: 'px-4 py-3 min-h-[44px]',
  lg: 'px-6 py-4 min-h-[52px]',
};

const textVariants = {
  primary: 'text-white font-semibold',
  secondary: 'text-white font-semibold',
  outline: 'text-gray-900 font-semibold',
  ghost: 'text-gray-900 font-semibold',
  destructive: 'text-white font-semibold',
};

const textSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={cn(
        'rounded-lg items-center justify-center flex-row',
        buttonVariants[variant],
        buttonSizes[size],
        isDisabled && 'opacity-50',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? '#374151' : '#ffffff'}
          className="mr-2"
        />
      )}
      <Text
        className={cn(
          textVariants[variant],
          textSizes[size],
          loading && 'ml-2'
        )}
      >
        {children}
      </Text>
    </Pressable>
  );
}