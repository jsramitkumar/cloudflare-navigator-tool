
// Base URL for API requests
export const getApiBaseUrl = () => {
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
