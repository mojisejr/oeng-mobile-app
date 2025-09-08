import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { cn } from '@/lib/utils';

export interface AuthButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  textClassName?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  type?: 'button' | 'submit';
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = true,
  className,
  textClassName,
  icon,
  iconPosition = 'left',
  type = 'button',
}) => {
  const isDisabled = disabled || loading;
  const isLoading = loading;

  const handlePress = () => {
    if (isDisabled) return;
    onPress?.();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: 'bg-blue-600 border-blue-600',
          containerPressed: 'bg-blue-700 border-blue-700',
          containerDisabled: 'bg-gray-300 border-gray-300',
          text: 'text-white',
          textDisabled: 'text-gray-500',
        };
      case 'secondary':
        return {
          container: 'bg-gray-600 border-gray-600',
          containerPressed: 'bg-gray-700 border-gray-700',
          containerDisabled: 'bg-gray-300 border-gray-300',
          text: 'text-white',
          textDisabled: 'text-gray-500',
        };
      case 'outline':
        return {
          container: 'bg-transparent border-blue-600',
          containerPressed: 'bg-blue-50 border-blue-700',
          containerDisabled: 'bg-transparent border-gray-300',
          text: 'text-blue-600',
          textDisabled: 'text-gray-400',
        };
      case 'ghost':
        return {
          container: 'bg-transparent border-transparent',
          containerPressed: 'bg-gray-100 border-transparent',
          containerDisabled: 'bg-transparent border-transparent',
          text: 'text-blue-600',
          textDisabled: 'text-gray-400',
        };
      default:
        return {
          container: 'bg-blue-600 border-blue-600',
          containerPressed: 'bg-blue-700 border-blue-700',
          containerDisabled: 'bg-gray-300 border-gray-300',
          text: 'text-white',
          textDisabled: 'text-gray-500',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'py-2 px-3 min-h-[36px]',
          text: 'text-sm',
          icon: 16,
        };
      case 'md':
        return {
          container: 'py-3 px-4 min-h-[44px]',
          text: 'text-base',
          icon: 18,
        };
      case 'lg':
        return {
          container: 'py-4 px-6 min-h-[52px]',
          text: 'text-lg',
          icon: 20,
        };
      default:
        return {
          container: 'py-3 px-4 min-h-[44px]',
          text: 'text-base',
          icon: 18,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const finalDisabled = isDisabled;

  const renderIcon = () => {
    if (isLoading) {
      return (
        <ActivityIndicator 
          size="small" 
          color={finalDisabled ? '#9ca3af' : (variant === 'primary' || variant === 'secondary' ? '#ffffff' : '#2563eb')} 
          className="mr-2"
        />
      );
    }
    
    if (icon) {
      return (
        <View className={iconPosition === 'left' ? 'mr-2' : 'ml-2'}>
          {icon}
        </View>
      );
    }
    
    return null;
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={finalDisabled}
      activeOpacity={finalDisabled ? 1 : 0.8}
      className={cn(
        'border rounded-lg flex-row items-center justify-center',
        'transition-colors duration-200',
        sizeStyles.container,
        finalDisabled ? variantStyles.containerDisabled : variantStyles.container,
        fullWidth && 'w-full',
        className
      )}
    >
      {iconPosition === 'left' && renderIcon()}
      
      <Text 
        className={cn(
          'font-medium text-center',
          sizeStyles.text,
          finalDisabled ? variantStyles.textDisabled : variantStyles.text,
          textClassName
        )}
      >
        {isLoading ? 'กำลังดำเนินการ...' : title}
      </Text>
      
      {iconPosition === 'right' && renderIcon()}
    </TouchableOpacity>
  );
};

export default AuthButton;