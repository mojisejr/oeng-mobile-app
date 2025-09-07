import { View, type ViewProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'card' | 'container' | 'surface' | 'elevated';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  flex?: boolean;
  center?: boolean;
  row?: boolean;
  className?: string; // Support for Nativewind className
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  variant = 'default',
  spacing,
  padding,
  margin,
  flex,
  center,
  row,
  className,
  ...otherProps 
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  // Support both traditional styles and Nativewind className
  const viewProps: any = {
    style: [
      { backgroundColor: className ? undefined : backgroundColor }, // Don't override backgroundColor if using className
      variant === 'card' ? styles.card : undefined,
      variant === 'container' ? styles.container : undefined,
      variant === 'surface' ? styles.surface : undefined,
      variant === 'elevated' ? styles.elevated : undefined,
      spacing ? styles[`spacing_${spacing}`] : undefined,
      padding ? styles[`padding_${padding}`] : undefined,
      margin ? styles[`margin_${margin}`] : undefined,
      flex ? styles.flex : undefined,
      center ? styles.center : undefined,
      row ? styles.row : undefined,
      style
    ],
    ...otherProps
  };

  // Add className if provided (for Nativewind support)
  if (className) {
    viewProps.className = className;
  }

  return <View {...viewProps} />;
}

const styles = StyleSheet.create({
  // Variants
  card: {
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  surface: {
    borderRadius: 8,
    padding: 12,
  },
  elevated: {
    borderRadius: 16,
    padding: 20,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
    elevation: 6,
  },
  
  // Layout utilities
  flex: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  
  // Spacing utilities
  spacing_none: {
    gap: 0,
  },
  spacing_xs: {
    gap: 4,
  },
  spacing_sm: {
    gap: 8,
  },
  spacing_md: {
    gap: 16,
  },
  spacing_lg: {
    gap: 24,
  },
  spacing_xl: {
    gap: 32,
  },
  
  // Padding utilities
  padding_none: {
    padding: 0,
  },
  padding_xs: {
    padding: 4,
  },
  padding_sm: {
    padding: 8,
  },
  padding_md: {
    padding: 16,
  },
  padding_lg: {
    padding: 24,
  },
  padding_xl: {
    padding: 32,
  },
  
  // Margin utilities
  margin_none: {
    margin: 0,
  },
  margin_xs: {
    margin: 4,
  },
  margin_sm: {
    margin: 8,
  },
  margin_md: {
    margin: 16,
  },
  margin_lg: {
    margin: 24,
  },
  margin_xl: {
    margin: 32,
  },
});
