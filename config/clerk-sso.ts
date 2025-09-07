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