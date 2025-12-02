
// Base URL for API requests
export const getApiBaseUrl = () => {
  // 1. Check for Vite environment variable (Highest priority)
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }

  // 2. Check if we have a custom hostname set in localStorage
  const customHostname = localStorage.getItem('backendHostname');

  // 3. During development, default to localhost:3001 if no env var
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001/api';
  }

  // 4. Production fallback
  const hostname = customHostname || 'localhost:3001';
  if (hostname.startsWith('http')) {
    return `${hostname}/api`;
  }
  return `http://${hostname}/api`;
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

// Save the hostname to localStorage
export const saveHostname = (hostname: string) => {
  localStorage.setItem('backendHostname', hostname);
};

// Get the current hostname from localStorage
export const getCurrentHostname = (): string => {
  return localStorage.getItem('backendHostname') || 'cdm-api-server.endusercompute.in';
};

// Test the connection to the backend
export const testBackendConnection = async (hostname: string): Promise<boolean> => {
  try {
    // For development, test against localhost proxy
    let testUrl = `/api/cloudflare/test-connection`;

    // For production or when testing custom hostname, use full URL
    if (process.env.NODE_ENV !== 'development' || hostname !== 'cdm-api-server.endusercompute.in') {
      testUrl = `https://${hostname}/api/cloudflare/test-connection`;
    }

    const response = await fetch(testUrl);
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
