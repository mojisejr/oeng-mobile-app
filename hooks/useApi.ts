import { useState, useCallback } from 'react';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useApi<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const request = useCallback(async (url: string, options: ApiOptions = {}): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      const config: RequestInit = {
        method: options.method || 'GET',
        headers,
      };

      if (options.body && options.method !== 'GET') {
        config.body = JSON.stringify(options.body);
      }

      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url: string, headers?: Record<string, string>) => {
    return request(url, { method: 'GET', headers });
  }, [request]);

  const post = useCallback((url: string, body?: any, headers?: Record<string, string>) => {
    return request(url, { method: 'POST', body, headers });
  }, [request]);

  const put = useCallback((url: string, body?: any, headers?: Record<string, string>) => {
    return request(url, { method: 'PUT', body, headers });
  }, [request]);

  const del = useCallback((url: string, headers?: Record<string, string>) => {
    return request(url, { method: 'DELETE', headers });
  }, [request]);

  const patch = useCallback((url: string, body?: any, headers?: Record<string, string>) => {
    return request(url, { method: 'PATCH', body, headers });
  }, [request]);

  return {
    data,
    error,
    loading,
    request,
    get,
    post,
    put,
    delete: del,
    patch,
  };
}