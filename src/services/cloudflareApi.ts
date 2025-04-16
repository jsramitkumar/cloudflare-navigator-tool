import { toast } from "@/components/ui/use-toast";

// Define types for Cloudflare DNS records
export interface DnsRecord {
  id: string;
  name: string;
  type: string;
  content: string;
  ttl: number;
  proxied: boolean;
}

export interface CloudflareTunnel {
  id: string;
  name: string;
  status: string;
  created_at: string;
  deleted_at?: string;
}

export interface TunnelIngress {
  hostname: string;
  service: string;
  path?: string;
  originRequest?: {
    noTLSVerify?: boolean;
    originServerName?: string;
  };
}

export interface TunnelConfig {
  tunnel_id: string;
  config: {
    ingress: TunnelIngress[];
  };
}

// Interface for API credentials
export interface CloudflareCredentials {
  id: string;
  name: string;
  apiKey: string;
  email?: string;
  accountId: string;
  zoneId: string;
}

// Storage keys for credentials
const CREDENTIALS_STORAGE_KEY = 'cloudflare_credentials';
const ACTIVE_ACCOUNT_KEY = 'cloudflare_active_account';

// Helper function to save credentials to localStorage
export const saveCredentials = (credentials: Omit<CloudflareCredentials, 'id'>): CloudflareCredentials => {
  const accounts = getAccountsList() || [];
  
  // Generate a unique ID if this is a new account
  const newAccount = {
    ...credentials,
    id: crypto.randomUUID()
  };
  
  // Add the new account
  accounts.push(newAccount);
  
  // Save all accounts
  localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(accounts));
  
  // Set as active account if it's the first one
  if (accounts.length === 1) {
    setActiveAccount(newAccount.id);
  }
  
  toast({
    title: "Account added",
    description: `Cloudflare account "${credentials.name}" has been saved.`
  });
  
  return newAccount;
};

// Helper function to update an existing account
export const updateCredentials = (id: string, credentials: Partial<CloudflareCredentials>): void => {
  const accounts = getAccountsList() || [];
  const updatedAccounts = accounts.map(account => 
    account.id === id ? { ...account, ...credentials } : account
  );
  
  localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(updatedAccounts));
  
  toast({
    title: "Account updated",
    description: `Cloudflare account "${credentials.name || 'Unknown'}" has been updated.`
  });
};

// Helper function to retrieve all accounts from localStorage
export const getAccountsList = (): CloudflareCredentials[] | null => {
  const accountsString = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
  if (!accountsString) {
    return null;
  }
  
  try {
    return JSON.parse(accountsString) as CloudflareCredentials[];
  } catch (error) {
    console.error('Failed to parse accounts:', error);
    return null;
  }
};

// Set the active account
export const setActiveAccount = (id: string): void => {
  localStorage.setItem(ACTIVE_ACCOUNT_KEY, id);
};

// Get the ID of the active account
export const getActiveAccountId = (): string | null => {
  return localStorage.getItem(ACTIVE_ACCOUNT_KEY);
};

// Helper function to retrieve the active account from localStorage
export const getActiveAccount = (): CloudflareCredentials | null => {
  const accounts = getAccountsList();
  if (!accounts) return null;
  
  const activeId = getActiveAccountId();
  if (!activeId) {
    // If no active account is set but accounts exist, return the first one
    if (accounts.length > 0) {
      setActiveAccount(accounts[0].id);
      return accounts[0];
    }
    return null;
  }
  
  return accounts.find(account => account.id === activeId) || null;
};

// Get the credentials (backwards compatibility)
export const getCredentials = getActiveAccount;

// Helper function to delete an account
export const deleteAccount = (id: string): void => {
  const accounts = getAccountsList() || [];
  const updatedAccounts = accounts.filter(account => account.id !== id);
  
  localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(updatedAccounts));
  
  // If we deleted the active account, set a new active account
  const activeId = getActiveAccountId();
  if (activeId === id) {
    if (updatedAccounts.length > 0) {
      setActiveAccount(updatedAccounts[0].id);
    } else {
      localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
    }
  }
  
  toast({
    title: "Account removed",
    description: "Cloudflare account has been removed."
  });
};

// Helper function to clear all credentials from localStorage
export const clearCredentials = (): void => {
  localStorage.removeItem(CREDENTIALS_STORAGE_KEY);
  localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
  
  toast({
    title: "All accounts cleared",
    description: "All Cloudflare accounts have been removed."
  });
};

// Base API methods
const makeRequest = async (
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<any> => {
  const credentials = getActiveAccount();
  
  if (!credentials) {
    throw new Error('No Cloudflare credentials found. Please set your API credentials first.');
  }
  
  // Get the backend API URL from environment variable or use a dynamic approach
  let baseUrl;
  
  console.log("Available environment variables:", {
    VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    window_location: window.location.toString()
  });
  
  // Check for VITE_BACKEND_URL first
  if (import.meta.env.VITE_BACKEND_URL && typeof import.meta.env.VITE_BACKEND_URL === 'string' && import.meta.env.VITE_BACKEND_URL.trim() !== '') {
    baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/cloudflare`;
  }
  // Then check for VITE_API_URL for backward compatibility
  else if (import.meta.env.VITE_API_URL && typeof import.meta.env.VITE_API_URL === 'string' && import.meta.env.VITE_API_URL.trim() !== '') {
    baseUrl = import.meta.env.VITE_API_URL;
  }
  // If neither is available, try to determine the URL dynamically based on the current location
  else {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    // If port is 8080 (frontend), assume backend is on 3001, otherwise use the same port
    const port = window.location.port === '8080' ? '3001' : window.location.port;
    baseUrl = `${protocol}//${hostname}:${port}/api/cloudflare`;
  }
  
  console.log(`API request to: ${baseUrl}${endpoint}`);
  
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-CF-API-KEY': credentials.apiKey,
        'X-CF-EMAIL': credentials.email || '',
        'X-CF-ACCOUNT-ID': credentials.accountId,
        'X-CF-ZONE-ID': credentials.zoneId
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('API request failed:', {
        status: response.status,
        statusText: response.statusText,
        endpoint,
        data
      });
      
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    
    return data;
  } catch (error: any) {
    console.error('API request failed:', error);
    
    // If error is from fetch or JSON parsing
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error(`Network error: Could not connect to API server at ${baseUrl}. Please check your network connection and API server status.`);
    }
    
    throw error;
  }
};

// DNS Records API
export const dnsRecordsApi = {
  listRecords: async (): Promise<DnsRecord[]> => {
    const response = await makeRequest('/dns');
    return response.result;
  },
  
  getRecord: async (recordId: string): Promise<DnsRecord> => {
    const response = await makeRequest(`/dns/${recordId}`);
    return response.result;
  },
  
  createRecord: async (record: Omit<DnsRecord, 'id'>): Promise<DnsRecord> => {
    const response = await makeRequest('/dns', 'POST', record);
    return response.result;
  },
  
  updateRecord: async (recordId: string, record: Partial<DnsRecord>): Promise<DnsRecord> => {
    const response = await makeRequest(`/dns/${recordId}`, 'PUT', record);
    return response.result;
  },
  
  deleteRecord: async (recordId: string): Promise<{ id: string }> => {
    const response = await makeRequest(`/dns/${recordId}`, 'DELETE');
    return response.result;
  }
};

// Tunnels API
export const tunnelsApi = {
  listTunnels: async (): Promise<CloudflareTunnel[]> => {
    const response = await makeRequest('/tunnels');
    // Filter out deleted tunnels
    return response.result.filter((tunnel: CloudflareTunnel) => !tunnel.deleted_at);
  },
  
  getTunnel: async (tunnelId: string): Promise<CloudflareTunnel> => {
    const response = await makeRequest(`/tunnels/${tunnelId}`);
    return response.result;
  },
  
  createTunnel: async (tunnel: { name: string }): Promise<CloudflareTunnel> => {
    const response = await makeRequest('/tunnels', 'POST', tunnel);
    return response.result;
  },
  
  deleteTunnel: async (tunnelId: string): Promise<{ id: string }> => {
    const response = await makeRequest(`/tunnels/${tunnelId}`, 'DELETE');
    return response.result;
  },
  
  // Tunnel configurations
  getTunnelConfig: async (tunnelId: string): Promise<TunnelConfig> => {
    const response = await makeRequest(`/tunnels/${tunnelId}/configurations`);
    return response.result;
  },
  
  updateTunnelConfig: async (tunnelId: string, config: any): Promise<TunnelConfig> => {
    const response = await makeRequest(`/tunnels/${tunnelId}/configurations`, 'PUT', config);
    return response.result;
  },
  
  patchTunnelConfig: async (tunnelId: string, config: any): Promise<TunnelConfig> => {
    const response = await makeRequest(`/tunnels/${tunnelId}/configurations`, 'PATCH', config);
    return response.result;
  },
  
  deleteTunnelConfig: async (tunnelId: string): Promise<any> => {
    const response = await makeRequest(`/tunnels/${tunnelId}/configurations`, 'DELETE');
    return response.result;
  }
};

// Test if credentials are valid
export const testCredentials = async (credentials: Omit<CloudflareCredentials, 'id'>): Promise<boolean> => {
  try {
    // Create a temporary account without saving it
    const tempAccount: CloudflareCredentials = {
      ...credentials,
      id: 'temp-test-account'
    };
    
    // Temporarily set it as active account
    const currentActiveId = getActiveAccountId();
    const currentAccounts = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
    
    // Save the temporary account
    localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify([tempAccount]));
    setActiveAccount(tempAccount.id);
    
    // Try to connect using the test-connection endpoint
    const response = await makeRequest('/test-connection');
    console.log('Test connection response:', response);
    
    if (response.serverInfo) {
      console.log('Server info:', response.serverInfo);
    }
    
    // Restore original active account and accounts
    if (currentAccounts) {
      localStorage.setItem(CREDENTIALS_STORAGE_KEY, currentAccounts);
    } else {
      localStorage.removeItem(CREDENTIALS_STORAGE_KEY);
    }
    
    if (currentActiveId) {
      setActiveAccount(currentActiveId);
    } else {
      localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
    }
    
    return response.success === true;
  } catch (error) {
    console.error('Test connection failed:', error);
    
    // Restore original state and cleanup
    const currentActiveId = getActiveAccountId();
    const currentAccounts = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
    
    if (currentAccounts && currentActiveId !== 'temp-test-account') {
      localStorage.setItem(CREDENTIALS_STORAGE_KEY, currentAccounts);
    } else {
      localStorage.removeItem(CREDENTIALS_STORAGE_KEY);
    }
    
    if (currentActiveId && currentActiveId !== 'temp-test-account') {
      setActiveAccount(currentActiveId);
    } else {
      localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
    }
    
    throw error;
  }
};
