import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  className?: string;
}

const cardVariants = {
  default: 'bg-white border border-gray-200',
  elevated: 'bg-white shadow-lg shadow-gray-200/50',
  outlined: 'bg-white border-2 border-gray-300',
  filled: 'bg-gray-50 border-0',
};

const cardPadding = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

export function Card({
  variant = 'default',
  padding = 'md',
  children,
  className,
  ...props
}: CardProps) {
  return (
    <View
      className={cn(
        'rounded-lg',
        cardVariants[variant],
        cardPadding[padding],
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}

// Card sub-components for better composition
export function CardHeader({
  children,
  className,
  ...props
}: ViewProps & { children: React.ReactNode; className?: string }) {
  return (
    <View className={cn('mb-4', className)} {...props}>
      {children}
    </View>
  );
}

export function CardContent({
  children,
  className,
  ...props
}: ViewProps & { children: React.ReactNode; className?: string }) {
  return (
    <View className={cn('flex-1', className)} {...props}>
      {children}
    </View>
  );
}

export function CardFooter({
  children,
  className,
  ...props
}: ViewProps & { children: React.ReactNode; className?: string }) {
  return (
    <View className={cn('mt-4 flex-row justify-end', className)} {...props}>
      {children}
    </View>
  );
}