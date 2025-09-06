import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastOptions {
  duration?: number;
  title?: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = useCallback(() => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }, []);

  const addToast = useCallback((message: string, type: ToastType, options: ToastOptions = {}) => {
    const id = generateId();
    const toast: Toast = {
      id,
      message,
      type,
      duration: options.duration || 3000,
    };

    setToasts(prev => [...prev, toast]);

    // Auto remove toast after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }

    return id;
  }, [generateId]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback((message: string, options: ToastOptions = {}) => {
    return addToast(message, 'success', options);
  }, [addToast]);

  const error = useCallback((message: string, options: ToastOptions = {}) => {
    return addToast(message, 'error', options);
  }, [addToast]);

  const warning = useCallback((message: string, options: ToastOptions = {}) => {
    return addToast(message, 'warning', options);
  }, [addToast]);

  const info = useCallback((message: string, options: ToastOptions = {}) => {
    return addToast(message, 'info', options);
  }, [addToast]);

  // Alert methods for native alerts
  const alert = useCallback((title: string, message: string, type: ToastType = 'info') => {
    Alert.alert(title, message, [{ text: 'OK' }]);
  }, []);

  const confirm = useCallback((title: string, message: string, onConfirm: () => void, onCancel?: () => void) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: 'OK',
          onPress: onConfirm,
        },
      ]
    );
  }, []);

  const errorAlert = useCallback((message: string, title: string = 'Error') => {
    Alert.alert(title, message, [{ text: 'OK' }]);
  }, []);

  const successAlert = useCallback((message: string, title: string = 'Success') => {
    Alert.alert(title, message, [{ text: 'OK' }]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
    alert,
    confirm,
    errorAlert,
    successAlert,
  };
}