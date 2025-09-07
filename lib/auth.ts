/**
 * Authentication Utilities
 * Centralized authentication helper functions for the AI English Coach app
 */

import { User } from 'firebase/auth';

// Email validation regex pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirements
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns boolean indicating if email is valid
 */
export const validateEmail = (email: string): boolean => {
  if (!email || email.trim() === '') return false;
  return EMAIL_REGEX.test(email.trim().toLowerCase());
};

/**
 * Validates password strength
 * @param password - Password string to validate
 * @returns object with isValid boolean and error message in Thai
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  error?: string;
} => {
  if (!password) {
    return {
      isValid: false,
      error: 'กรุณากรอกรหัสผ่าน'
    };
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      error: `รหัสผ่านต้องมีอย่างน้อย ${PASSWORD_MIN_LENGTH} ตัวอักษร`
    };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return {
      isValid: false,
      error: 'รหัสผ่านต้องประกอบด้วยตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลขอย่างน้อย 1 ตัว'
    };
  }

  return { isValid: true };
};

/**
 * Validates password confirmation
 * @param password - Original password
 * @param confirmPassword - Confirmation password
 * @returns object with isValid boolean and error message in Thai
 */
export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string
): {
  isValid: boolean;
  error?: string;
} => {
  if (!confirmPassword) {
    return {
      isValid: false,
      error: 'กรุณายืนยันรหัสผ่าน'
    };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: 'รหัสผ่านไม่ตรงกัน'
    };
  }

  return { isValid: true };
};

/**
 * Validates complete registration form
 * @param email - Email string
 * @param password - Password string
 * @param confirmPassword - Password confirmation string
 * @returns object with isValid boolean and errors object
 */
export const validateRegistrationForm = (
  email: string,
  password: string,
  confirmPassword: string
): {
  isValid: boolean;
  errors: {
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
} => {
  const errors: {
    email?: string;
    password?: string;
    confirmPassword?: string;
  } = {};

  // Validate email
  if (!validateEmail(email)) {
    errors.email = 'กรุณากรอกอีเมลที่ถูกต้อง';
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
  }

  // Validate password confirmation
  const confirmValidation = validatePasswordConfirmation(password, confirmPassword);
  if (!confirmValidation.isValid) {
    errors.confirmPassword = confirmValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates login form
 * @param email - Email string
 * @param password - Password string
 * @returns object with isValid boolean and errors object
 */
export const validateLoginForm = (
  email: string,
  password: string
): {
  isValid: boolean;
  errors: {
    email?: string;
    password?: string;
  };
} => {
  const errors: {
    email?: string;
    password?: string;
  } = {};

  // Validate email
  if (!validateEmail(email)) {
    errors.email = 'กรุณากรอกอีเมลที่ถูกต้อง';
  }

  // Validate password presence
  if (!password || password.trim() === '') {
    errors.password = 'กรุณากรอกรหัสผ่าน';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Converts Firebase Auth error codes to Thai error messages
 * @param errorCode - Firebase Auth error code
 * @returns Thai error message string
 */
export const getFirebaseErrorMessage = (errorCode: string): string => {
  const errorMessages: { [key: string]: string } = {
    'auth/user-not-found': 'ไม่พบผู้ใช้งานนี้ในระบบ',
    'auth/wrong-password': 'รหัสผ่านไม่ถูกต้อง',
    'auth/email-already-in-use': 'อีเมลนี้ถูกใช้งานแล้ว',
    'auth/weak-password': 'รหัสผ่านไม่ปลอดภัย กรุณาใช้รหัสผ่านที่แข็งแกร่งกว่านี้',
    'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง',
    'auth/user-disabled': 'บัญชีผู้ใช้นี้ถูกปิดใช้งาน',
    'auth/too-many-requests': 'มีการพยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่ในภายหลัง',
    'auth/network-request-failed': 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย',
    'auth/invalid-credential': 'ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง',
    'auth/operation-not-allowed': 'การดำเนินการนี้ไม่ได้รับอนุญาต',
    'auth/requires-recent-login': 'กรุณาเข้าสู่ระบบใหม่เพื่อดำเนินการต่อ'
  };

  return errorMessages[errorCode] || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง';
};

/**
 * Checks if user is authenticated
 * @param user - Firebase User object or null
 * @returns boolean indicating authentication status
 */
export const isAuthenticated = (user: User | null): boolean => {
  return user !== null && user !== undefined;
};

/**
 * Gets user display name or email
 * @param user - Firebase User object
 * @returns display name or email string
 */
export const getUserDisplayName = (user: User): string => {
  return user.displayName || user.email || 'ผู้ใช้งาน';
};

/**
 * Formats user data for display
 * @param user - Firebase User object
 * @returns formatted user data object
 */
export const formatUserData = (user: User) => {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    creationTime: user.metadata.creationTime,
    lastSignInTime: user.metadata.lastSignInTime
  };
};

/**
 * Storage keys for authentication data
 */
export const AUTH_STORAGE_KEYS = {
  USER_TOKEN: '@auth_user_token',
  USER_DATA: '@auth_user_data',
  REMEMBER_EMAIL: '@auth_remember_email'
} as const;

/**
 * Authentication state types
 */
export type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

/**
 * Login form data type
 */
export type LoginFormData = {
  email: string;
  password: string;
};

/**
 * Registration form data type
 */
export type RegistrationFormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

/**
 * Form validation result type
 */
export type ValidationResult = {
  isValid: boolean;
  errors: { [key: string]: string };
};