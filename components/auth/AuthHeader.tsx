import React from 'react';
import { View, Text, Image } from 'react-native';
import { cn } from '@/lib/utils';

export interface AuthHeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  logoSource?: any;
  logoSize?: number;
  titleSize?: 'sm' | 'md' | 'lg' | 'xl';
  alignment?: 'left' | 'center' | 'right';
  className?: string;
  logoClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title = 'AI English Coach',
  subtitle,
  showLogo = true,
  logoSource,
  logoSize = 80,
  titleSize = 'lg',
  alignment = 'center',
  className,
  logoClassName,
  titleClassName,
  subtitleClassName,
  spacing = 'md',
}) => {
  const getAlignmentStyles = () => {
    switch (alignment) {
      case 'left':
        return 'items-start text-left';
      case 'center':
        return 'items-center text-center';
      case 'right':
        return 'items-end text-right';
      default:
        return 'items-center text-center';
    }
  };

  const getTitleSizeStyles = () => {
    switch (titleSize) {
      case 'sm':
        return 'text-xl';
      case 'md':
        return 'text-2xl';
      case 'lg':
        return 'text-3xl';
      case 'xl':
        return 'text-4xl';
      default:
        return 'text-3xl';
    }
  };

  const getSpacingStyles = () => {
    switch (spacing) {
      case 'sm':
        return {
          container: 'mb-4',
          logoToTitle: 'mt-2',
          titleToSubtitle: 'mt-1',
        };
      case 'md':
        return {
          container: 'mb-6',
          logoToTitle: 'mt-3',
          titleToSubtitle: 'mt-2',
        };
      case 'lg':
        return {
          container: 'mb-8',
          logoToTitle: 'mt-4',
          titleToSubtitle: 'mt-3',
        };
      default:
        return {
          container: 'mb-6',
          logoToTitle: 'mt-3',
          titleToSubtitle: 'mt-2',
        };
    }
  };

  const alignmentStyles = getAlignmentStyles();
  const titleSizeStyles = getTitleSizeStyles();
  const spacingStyles = getSpacingStyles();

  const renderLogo = () => {
    if (!showLogo) return null;

    // Default logo placeholder if no logoSource provided
    if (!logoSource) {
      return (
        <View 
          className={cn(
            'bg-blue-600 rounded-full items-center justify-center',
            logoClassName
          )}
          style={{ width: logoSize, height: logoSize }}
        >
          <Text className="text-white font-bold text-2xl">
            AI
          </Text>
        </View>
      );
    }

    return (
      <Image
        source={logoSource}
        className={cn('rounded-full', logoClassName)}
        style={{ width: logoSize, height: logoSize }}
        resizeMode="contain"
      />
    );
  };

  const renderTitle = () => {
    if (!title) return null;

    return (
      <Text 
        className={cn(
          'font-bold text-gray-900',
          titleSizeStyles,
          alignment === 'center' && 'text-center',
          alignment === 'left' && 'text-left',
          alignment === 'right' && 'text-right',
          titleClassName
        )}
      >
        {title}
      </Text>
    );
  };

  const renderSubtitle = () => {
    if (!subtitle) return null;

    return (
      <Text 
        className={cn(
          'text-gray-600 text-base',
          alignment === 'center' && 'text-center',
          alignment === 'left' && 'text-left',
          alignment === 'right' && 'text-right',
          spacingStyles.titleToSubtitle,
          subtitleClassName
        )}
      >
        {subtitle}
      </Text>
    );
  };

  return (
    <View 
      className={cn(
        'flex-col',
        alignmentStyles,
        spacingStyles.container,
        className
      )}
    >
      {renderLogo()}
      
      {title && (
        <View className={showLogo ? spacingStyles.logoToTitle : ''}>
          {renderTitle()}
        </View>
      )}
      
      {renderSubtitle()}
    </View>
  );
};

export default AuthHeader;