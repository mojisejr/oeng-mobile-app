import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Button } from './Button';
import { Card } from './Card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to crash reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View className="flex-1 bg-gray-50 p-4 justify-center">
          <Card variant="elevated" padding="lg">
            <View className="items-center">
              <Text className="text-6xl mb-4">😵</Text>
              <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
                เกิดข้อผิดพลาด
              </Text>
              <Text className="text-gray-600 text-center mb-6">
                ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง
              </Text>
              
              <Button
                onPress={this.handleReset}
                className="mb-4"
              >
                ลองใหม่
              </Button>
              
              {__DEV__ && this.state.error && (
                <ScrollView className="max-h-40 w-full">
                  <Card variant="filled" padding="sm">
                    <Text className="text-xs font-mono text-red-600">
                      {this.state.error.toString()}
                    </Text>
                    {this.state.errorInfo && (
                      <Text className="text-xs font-mono text-red-500 mt-2">
                        {this.state.errorInfo.componentStack}
                      </Text>
                    )}
                  </Card>
                </ScrollView>
              )}
            </View>
          </Card>
        </View>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };

// Hook version for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    // You can integrate with crash reporting services here
  };
}

// Simple error display component
export function ErrorMessage({ 
  error, 
  onRetry, 
  className 
}: { 
  error: string; 
  onRetry?: () => void; 
  className?: string; 
}) {
  return (
    <Card variant="outlined" padding="md" className={className}>
      <View className="items-center">
        <Text className="text-red-500 font-medium mb-2">
          เกิดข้อผิดพลาด
        </Text>
        <Text className="text-gray-600 text-center mb-4">
          {error}
        </Text>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onPress={onRetry}
          >
            ลองใหม่
          </Button>
        )}
      </View>
    </Card>
  );
}