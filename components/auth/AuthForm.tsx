import React, { useState, useCallback } from 'react';
import { View, Alert } from 'react-native';
import { cn } from '@/lib/utils';

export interface FormField {
  name: string;
  value: string;
  error?: string;
  touched?: boolean;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | undefined;
}

export interface FormConfig {
  [fieldName: string]: ValidationRule;
}

export interface AuthFormProps {
  children: React.ReactNode;
  onSubmit: (formData: Record<string, string>) => Promise<void> | void;
  validationConfig?: FormConfig;
  className?: string;
  disabled?: boolean;
}

export interface AuthFormContextType {
  fields: Record<string, FormField>;
  updateField: (name: string, value: string) => void;
  validateField: (name: string) => void;
  validateForm: () => boolean;
  isSubmitting: boolean;
  hasErrors: boolean;
}

const AuthFormContext = React.createContext<AuthFormContextType | null>(null);

export const useAuthForm = () => {
  const context = React.useContext(AuthFormContext);
  if (!context) {
    throw new Error('useAuthForm must be used within an AuthForm');
  }
  return context;
};

export const AuthForm: React.FC<AuthFormProps> = ({
  children,
  onSubmit,
  validationConfig = {},
  className,
  disabled = false,
}) => {
  const [fields, setFields] = useState<Record<string, FormField>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (name: string): string | undefined => {
      const field = fields[name];
      const rules = validationConfig[name];

      if (!field || !rules) return undefined;

      const { value } = field;

      // Required validation
      if (rules.required && (!value || value.trim() === '')) {
        return 'ฟิลด์นี้จำเป็นต้องกรอก';
      }

      // Skip other validations if field is empty and not required
      if (!value || value.trim() === '') {
        return undefined;
      }

      // Min length validation
      if (rules.minLength && value.length < rules.minLength) {
        return `ต้องมีอย่างน้อย ${rules.minLength} ตัวอักษร`;
      }

      // Max length validation
      if (rules.maxLength && value.length > rules.maxLength) {
        return `ต้องไม่เกิน ${rules.maxLength} ตัวอักษร`;
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        return 'รูปแบบไม่ถูกต้อง';
      }

      // Custom validation
      if (rules.custom) {
        return rules.custom(value);
      }

      return undefined;
    },
    [fields, validationConfig]
  );

  const updateField = useCallback((name: string, value: string) => {
    setFields((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        name,
        value,
        touched: true,
      },
    }));
  }, []);

  const validateFieldAndUpdate = useCallback(
    (name: string) => {
      const error = validateField(name);
      setFields((prev) => ({
        ...prev,
        [name]: {
          ...prev[name],
          error,
        },
      }));
    },
    [validateField]
  );

  const validateForm = useCallback((): boolean => {
    let isValid = true;
    const updatedFields = { ...fields };

    // Validate all configured fields
    Object.keys(validationConfig).forEach((fieldName) => {
      const error = validateField(fieldName);
      if (error) {
        isValid = false;
      }
      updatedFields[fieldName] = {
        ...updatedFields[fieldName],
        error,
        touched: true,
      };
    });

    setFields(updatedFields);
    return isValid;
  }, [fields, validationConfig, validateField]);

  const hasErrors = Object.values(fields).some((field) => field.error);

  const handleSubmit = async () => {
    if (disabled || isSubmitting) return;

    const isValid = validateForm();
    if (!isValid) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาตรวจสอบข้อมูลที่กรอกให้ถูกต้อง');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = Object.keys(fields).reduce(
        (acc, key) => {
          acc[key] = fields[key].value;
          return acc;
        },
        {} as Record<string, string>
      );

      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      Alert.alert(
        'เกิดข้อผิดพลาด',
        'ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่อีกครั้ง'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const contextValue: AuthFormContextType = {
    fields,
    updateField,
    validateField: validateFieldAndUpdate,
    validateForm,
    isSubmitting,
    hasErrors,
  };

  return (
    <AuthFormContext.Provider value={contextValue}>
      <View className={cn('flex-1', className)}>
        {children}
      </View>
    </AuthFormContext.Provider>
  );
};

export default AuthForm;