
// Base URL for API requests
export const getApiBaseUrl = () => {
  // Check if we have a custom hostname set in localStorage
  const customHostname = localStorage.getItem('backendHostname');

  // During development with Vite, point directly to backend
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001/api';
  }

  // Use custom hostname or default to production hostname
  const hostname = customHostname || 'localhost:3001';
  // If hostname already includes protocol, don't add https://
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
