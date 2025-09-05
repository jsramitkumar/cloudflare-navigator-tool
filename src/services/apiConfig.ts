
// Base URL for API requests
export const getApiBaseUrl = () => {
  // Check if we have a custom API URL set in localStorage
  const customApiUrl = localStorage.getItem('backendApiUrl');
  if (customApiUrl) {
    return customApiUrl;
  }

  // During development with Vite, use the proxy
  if (process.env.NODE_ENV === 'development') {
    return '/api';
  }

  // In production, use the hardcoded path
  return '/api';
};

// Default headers for API requests
export const getDefaultHeaders = (credentials: any) => {
  return {
    'Content-Type': 'application/json',
    'X-CF-API-KEY': credentials?.apiKey || '',
    'X-CF-EMAIL': credentials?.email || '',
    'X-CF-ACCOUNT-ID': credentials?.accountId || '',
    'X-CF-ZONE-ID': credentials?.zoneId || '',
  };
};

// Save the API URL to localStorage
export const saveApiUrl = (url: string) => {
  localStorage.setItem('backendApiUrl', url);
};

// Get the current API URL from localStorage
export const getCurrentApiUrl = (): string => {
  return localStorage.getItem('backendApiUrl') || '/api';
};

// Test the connection to the backend
export const testBackendConnection = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(`${url}/cloudflare/test-connection`);
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Failed to connect to backend:', error);
    return false;
  }
};
