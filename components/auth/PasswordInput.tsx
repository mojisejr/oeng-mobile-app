import React, { useState } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { AuthInput, AuthInputProps } from './AuthInput';
import { useAuthForm } from './AuthForm';
import { cn } from '@/lib/utils';

export interface PasswordInputProps extends Omit<AuthInputProps, 'secureTextEntry'> {
  showToggle?: boolean;
  toggleSize?: number;
  toggleColor?: string;
  toggleActiveColor?: string;
  onTogglePress?: (isVisible: boolean) => void;
  strengthIndicator?: boolean;
  strengthLevel?: 'weak' | 'medium' | 'strong';
  strengthColors?: {
    weak: string;
    medium: string;
    strong: string;
  };
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  showToggle = true,
  toggleSize = 20,
  toggleColor = '#6B7280',
  toggleActiveColor = '#3B82F6',
  onTogglePress,
  strengthIndicator = false,
  strengthLevel = 'weak',
  strengthColors = {
    weak: '#EF4444',
    medium: '#F59E0B',
    strong: '#10B981',
  },
  className,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleTogglePress = () => {
    const newVisibility = !isPasswordVisible;
    setIsPasswordVisible(newVisibility);
    onTogglePress?.(newVisibility);
  };

  const getStrengthColor = () => {
    return strengthColors[strengthLevel];
  };

  const getStrengthText = () => {
    switch (strengthLevel) {
      case 'weak':
        return 'รหัสผ่านอ่อน';
      case 'medium':
        return 'รหัสผ่านปานกลาง';
      case 'strong':
        return 'รหัสผ่านแข็งแกร่ง';
      default:
        return '';
    }
  };

  const renderToggleIcon = () => {
    if (!showToggle) return null;

    const IconComponent = isPasswordVisible ? EyeOff : Eye;
    const iconColor = isPasswordVisible ? toggleActiveColor : toggleColor;

    return (
      <TouchableOpacity
        onPress={handleTogglePress}
        className="p-1"
        activeOpacity={0.7}
        accessibilityLabel={isPasswordVisible ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
        accessibilityRole="button"
      >
        <IconComponent
          size={toggleSize}
          color={iconColor}
        />
      </TouchableOpacity>
    );
  };

  const renderStrengthIndicator = () => {
    const { fields } = useAuthForm();
    const currentValue = fields[props.name]?.value || '';
    
    if (!strengthIndicator || !currentValue) return null;

    return (
      <View className="mt-2 flex-row items-center space-x-2">
        <View className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
          <View 
            className={cn(
              'h-full transition-all duration-300 rounded-full',
              strengthLevel === 'weak' && 'w-1/3',
              strengthLevel === 'medium' && 'w-2/3',
              strengthLevel === 'strong' && 'w-full'
            )}
            style={{ backgroundColor: getStrengthColor() }}
          />
        </View>
        <Text 
          className="text-xs font-medium"
          style={{ color: getStrengthColor() }}
        >
          {getStrengthText()}
        </Text>
      </View>
    );
  };

  return (
    <View className={cn('w-full', className)}>
      <View className="relative">
        <AuthInput
          {...props}
          secureTextEntry={!isPasswordVisible}
          autoComplete="current-password"
          autoCapitalize="none"
        />
        {showToggle && (
          <View className="absolute right-3 top-1/2" style={{ transform: [{ translateY: -10 }] }}>
            {renderToggleIcon()}
          </View>
        )}
      </View>
      {renderStrengthIndicator()}
    </View>
  );
};

// Helper function to calculate password strength
export const calculatePasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (!password) return 'weak';
  
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 1; // lowercase
  if (/[A-Z]/.test(password)) score += 1; // uppercase
  if (/[0-9]/.test(password)) score += 1; // numbers
  if (/[^A-Za-z0-9]/.test(password)) score += 1; // special characters
  
  // Return strength based on score
  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
};

export default PasswordInput;