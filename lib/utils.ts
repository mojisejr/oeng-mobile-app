import { type ClassValue, clsx } from 'clsx';

/**
 * Utility function to merge class names
 * Combines clsx for conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format date to Thai locale
 */
export function formatThaiDate(date: Date): string {
  return date.toLocaleDateString('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    calendar: 'gregory',
  });
}

/**
 * Format date and time to Thai locale
 */
export function formatThaiDateTime(date: Date): string {
  return date.toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    calendar: 'gregory',
  });
}

/**
 * Get current Thailand date and time
 */
export function getThailandDateTime(): Date {
  return new Date();
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}