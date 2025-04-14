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
  
  const baseUrl = 'https://api-cloudflare.endusercompute.in/api/cloudflare'; // Updated backend URL
  
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
      throw new Error(data.message || 'An error occurred');
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
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
    localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify([tempAccount]));
    setActiveAccount(tempAccount.id);
    
    // Try to list DNS records as a test
    await dnsRecordsApi.listRecords();
    
    // Restore original active account and remove temp account
    localStorage.removeItem(CREDENTIALS_STORAGE_KEY);
    if (currentActiveId) {
      setActiveAccount(currentActiveId);
    } else {
      localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
    }
    
    return true;
  } catch (error) {
    // Restore original active account and cleanup
    localStorage.removeItem(CREDENTIALS_STORAGE_KEY);
    const currentActiveId = getActiveAccountId();
    if (currentActiveId === 'temp-test-account') {
      localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
    }
    throw error;
  }
};
