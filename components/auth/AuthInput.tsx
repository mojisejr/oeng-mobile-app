import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { useAuthForm } from './AuthForm';

export interface AuthInputProps {
  name: string;
  placeholder?: string;
  label?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'name' | 'email' | 'password' | 'new-password' | 'current-password' | 'username' | 'off';
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  showValidationIcon?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onChangeText?: (text: string) => void;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  name,
  placeholder,
  label,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
  maxLength,
  multiline = false,
  numberOfLines = 1,
  editable = true,
  className,
  inputClassName,
  labelClassName,
  errorClassName,
  showValidationIcon = true,
  onFocus,
  onBlur,
  onChangeText,
}) => {
  const { fields, updateField, validateField, isSubmitting } = useAuthForm();
  const [isFocused, setIsFocused] = useState(false);
  
  const field = fields[name] || { name, value: '', error: undefined, touched: false };
  const { value, error, touched } = field;
  
  const hasError = touched && error;
  const hasValue = value && value.trim() !== '';
  const isValid = touched && hasValue && !error;
  const isDisabled = !editable || isSubmitting;

  useEffect(() => {
    // Initialize field if it doesn't exist
    if (!fields[name]) {
      updateField(name, '');
    }
  }, [name, fields, updateField]);

  const handleChangeText = (text: string) => {
    updateField(name, text);
    onChangeText?.(text);
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    validateField(name);
    onBlur?.();
  };

  const getInputBorderStyle = () => {
    if (hasError) {
      return 'border-red-500 bg-red-50';
    }
    if (isValid) {
      return 'border-green-500 bg-green-50';
    }
    if (isFocused) {
      return 'border-blue-500 bg-blue-50';
    }
    return 'border-gray-300 bg-white';
  };

  const getValidationIcon = () => {
    if (!showValidationIcon || !touched) return null;
    
    if (hasError) {
      return (
        <AlertCircle 
          size={20} 
          color="#ef4444" 
          className="ml-2" 
        />
      );
    }
    
    if (isValid) {
      return (
        <CheckCircle2 
          size={20} 
          color="#22c55e" 
          className="ml-2" 
        />
      );
    }
    
    return null;
  };

  return (
    <View className={cn('mb-4', className)}>
      {label && (
        <Text 
          className={cn(
            'text-sm font-medium text-gray-700 mb-2',
            labelClassName
          )}
        >
          {label}
        </Text>
      )}
      
      <View className="relative">
        <View 
          className={cn(
            'flex-row items-center border rounded-lg px-3 py-3',
            'transition-colors duration-200',
            getInputBorderStyle(),
            isDisabled && 'opacity-60',
            inputClassName
          )}
        >
          <TextInput
            value={value}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoComplete={autoComplete}
            maxLength={maxLength}
            multiline={multiline}
            numberOfLines={numberOfLines}
            editable={editable && !isSubmitting}
            className={cn(
              'flex-1 text-base text-gray-900',
              'android:py-0', // Remove default padding on Android
              multiline && 'min-h-[80px] text-top'
            )}
            style={{
              textAlignVertical: multiline ? 'top' : 'center',
            }}
          />
          
          {getValidationIcon()}
        </View>
      </View>
      
      {hasError && (
        <Text 
          className={cn(
            'text-sm text-red-600 mt-1 ml-1',
            errorClassName
          )}
        >
          {error}
        </Text>
      )}
      
      {maxLength && hasValue && (
        <Text className="text-xs text-gray-500 mt-1 ml-1 text-right">
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
};

export default AuthInput;