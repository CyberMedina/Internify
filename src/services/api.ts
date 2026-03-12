import { authEvents } from '../utils/authEvents';
import { ENV } from '../config/env';

export const BASE_URL = ENV.API_URL;

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...customConfig } = options;

  const isFormData = customConfig.body instanceof FormData;

  const defaultHeaders: Record<string, string> = {
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...(headers || {}),
    },
  };

  // Ensure endpoint starts with / if not present
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  try {
    const response = await fetch(`${BASE_URL}${normalizedEndpoint}`, config);

    if (response.status === 401) {
      authEvents.emit('UNAUTHORIZED');
      throw new Error('Sesión expirada o no autorizada');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Error ${response.status}`);
    }

    // Handle empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error(`API Error [${options.method || 'GET'} ${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T>(endpoint: string, body: any, options?: RequestOptions) => {
    const isFormData = body instanceof FormData;
    return request<T>(endpoint, { 
      ...options, 
      method: 'POST', 
      body: isFormData ? body : JSON.stringify(body) 
    });
  },
  
  put: <T>(endpoint: string, body: any, options?: RequestOptions) => {
    const isFormData = body instanceof FormData;
    return request<T>(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: isFormData ? body : JSON.stringify(body) 
    });
  },
  
  delete: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: 'DELETE' }),
    
  patch: <T>(endpoint: string, body: any, options?: RequestOptions) => {
    const isFormData = body instanceof FormData;
    return request<T>(endpoint, { 
      ...options, 
      method: 'PATCH', 
      body: isFormData ? body : JSON.stringify(body) 
    });
  },
};
