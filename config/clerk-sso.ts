/**
 * Clerk SSO Configuration
 * Configuration for Social Sign-On providers (Line, Google, Facebook)
 */

export const ClerkSSOConfig = {
  // Line Login Configuration
  line: {
    provider: 'oauth_line',
    enabled: true,
    // Line Channel ID will be configured in Clerk Dashboard
    // Redirect URIs: 
    // - https://thankful-dog-62.clerk.accounts.dev/v1/oauth_callback
    // - oeng:///(tabs)
  },

  // Google OAuth Configuration
  google: {
    provider: 'oauth_google',
    enabled: true,
    // Google Client ID will be configured in Clerk Dashboard
    // Authorized redirect URIs:
    // - https://thankful-dog-62.clerk.accounts.dev/v1/oauth_callback
    // - oeng:///(tabs)
  },

  // Facebook Login Configuration
  facebook: {
    provider: 'oauth_facebook',
    enabled: true,
    // Facebook App ID will be configured in Clerk Dashboard
    // Valid OAuth Redirect URIs:
    // - https://thankful-dog-62.clerk.accounts.dev/v1/oauth_callback
    // - oeng:///(tabs)
  },
};

/**
 * SSO Provider Display Configuration
 * Used for UI components and user-facing text
 */
export const SSOProviderDisplay = {
  line: {
    name: 'Line',
    icon: 'line', // For icon libraries
    color: '#00B900',
    buttonText: 'เข้าสู่ระบบด้วย Line',
  },
  google: {
    name: 'Google',
    icon: 'google',
    color: '#4285F4',
    buttonText: 'เข้าสู่ระบบด้วย Google',
  },
  facebook: {
    name: 'Facebook',
    icon: 'facebook',
    color: '#1877F2',
    buttonText: 'เข้าสู่ระบบด้วย Facebook',
  },
};

/**
 * Available SSO Providers List
 * Used for iteration and dynamic rendering
 */
export const availableProviders = ['line', 'google', 'facebook'] as const;
export type SSOProvider = typeof availableProviders[number];

/**
 * Clerk OAuth Strategy Names
 * Maps to Clerk's OAuth strategy identifiers
 */
export const ClerkOAuthStrategies = {
  line: 'oauth_line',
  google: 'oauth_google', 
  facebook: 'oauth_facebook',
} as const;

/**
 * Error Handling and Fallback Mechanisms
 */
export const SSOErrorHandling = {
  // Check if provider is supported
  isProviderSupported: (provider: string): provider is SSOProvider => {
    return availableProviders.includes(provider as SSOProvider);
  },

  // Get fallback providers if primary fails
  getFallbackProviders: (failedProvider: SSOProvider): SSOProvider[] => {
    return availableProviders.filter(provider => provider !== failedProvider);
  },

  // Error messages for unsupported providers
  getUnsupportedProviderMessage: (provider: string): string => {
    return `การเข้าสู่ระบบด้วย ${provider} ยังไม่รองรับในขณะนี้ กรุณาเลือกวิธีอื่น`;
  },

  // Check if OAuth strategy exists in Clerk
  isOAuthStrategyValid: (strategy: string): boolean => {
    return Object.values(ClerkOAuthStrategies).includes(strategy as any);
  },

  // Default error handling for OAuth failures
  handleOAuthError: (error: any, provider: SSOProvider) => {
    console.error(`OAuth error for ${provider}:`, error);
    
    // Determine error type and provide specific message
    let errorMessage = `เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย ${SSOProviderDisplay[provider]?.name || provider}`;
    
    if (error?.code === 'oauth_access_denied') {
      errorMessage = 'การเข้าสู่ระบบถูกยกเลิก กรุณาลองใหม่อีกครั้ง';
    } else if (error?.code === 'oauth_callback_error') {
      errorMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
    } else if (error?.code === 'oauth_email_domain_reserved_by_saml') {
      errorMessage = 'อีเมลนี้ถูกจำกัดการใช้งาน กรุณาใช้อีเมลอื่น';
    }
    
    return {
      success: false,
      error: errorMessage,
      errorCode: error?.code || 'unknown_error',
      fallbackProviders: SSOErrorHandling.getFallbackProviders(provider),
    };
  },

  // Validate OAuth configuration before attempting sign-in
  validateOAuthConfig: (provider: SSOProvider): { isValid: boolean; message?: string } => {
    const config = ClerkSSOConfig[provider];
    
    if (!config.enabled) {
      return {
        isValid: false,
        message: `การเข้าสู่ระบบด้วย ${SSOProviderDisplay[provider]?.name} ถูกปิดใช้งานชั่วคราว`,
      };
    }
    
    if (!SSOErrorHandling.isOAuthStrategyValid(config.provider)) {
      return {
        isValid: false,
        message: `การกำหนดค่า OAuth สำหรับ ${SSOProviderDisplay[provider]?.name} ไม่ถูกต้อง`,
      };
    }
    
    return { isValid: true };
  },

  // Get user-friendly error message based on error type
  getUserFriendlyErrorMessage: (error: any): string => {
    const commonErrors: Record<string, string> = {
      'network_error': 'ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
      'timeout_error': 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง',
      'invalid_request': 'คำขอไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง',
      'server_error': 'เซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่ในภายหลัง',
    };
    
    return commonErrors[error?.type] || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง';
  },
};