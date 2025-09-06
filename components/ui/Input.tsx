import React from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';
import { cn } from '@/lib/utils';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

const inputVariants = {
  default: 'border border-gray-300 bg-white',
  filled: 'bg-gray-100 border-0',
  outline: 'border-2 border-gray-300 bg-transparent',
};

const inputSizes = {
  sm: 'px-3 py-2 min-h-[36px] text-sm',
  md: 'px-4 py-3 min-h-[44px] text-base',
  lg: 'px-4 py-4 min-h-[52px] text-lg',
};

export function Input({
  label,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  leftIcon,
  rightIcon,
  className,
  containerClassName,
  ...props
}: InputProps) {
  const hasError = !!error;

  return (
    <View className={cn('w-full', containerClassName)}>
      {label && (
        <Text className="text-gray-700 font-medium mb-2 text-sm">
          {label}
        </Text>
      )}
      
      <View className="relative">
        {leftIcon && (
          <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            {leftIcon}
          </View>
        )}
        
        <TextInput
          className={cn(
            'rounded-lg',
            inputVariants[variant],
            inputSizes[size],
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            hasError && 'border-red-500',
            props.editable === false && 'opacity-50 bg-gray-100',
            className
          )}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
        
        {rightIcon && (
          <View className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            {rightIcon}
          </View>
        )}
      </View>
      
      {(error || helperText) && (
        <Text className={cn(
          'mt-1 text-xs',
          hasError ? 'text-red-500' : 'text-gray-500'
        )}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
}