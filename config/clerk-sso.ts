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
    // Redirect URI: https://your-app.clerk.accounts.dev/v1/oauth_callback
  },

  // Google OAuth Configuration
  google: {
    provider: 'oauth_google',
    enabled: true,
    // Google Client ID will be configured in Clerk Dashboard
    // Authorized redirect URIs: https://your-app.clerk.accounts.dev/v1/oauth_callback
  },

  // Facebook Login Configuration
  facebook: {
    provider: 'oauth_facebook',
    enabled: true,
    // Facebook App ID will be configured in Clerk Dashboard
    // Valid OAuth Redirect URIs: https://your-app.clerk.accounts.dev/v1/oauth_callback
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
    return {
      success: false,
      error: `เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย ${SSOProviderDisplay[provider]?.name || provider}`,
      fallbackProviders: SSOErrorHandling.getFallbackProviders(provider),
    };
  },
};