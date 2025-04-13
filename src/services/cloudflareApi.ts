
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
  apiKey: string;
  email?: string;
  accountId: string;
  zoneId: string;
}

// Storage key for credentials
const CREDENTIALS_STORAGE_KEY = 'cloudflare_credentials';

// Helper function to save credentials to localStorage
export const saveCredentials = (credentials: CloudflareCredentials): void => {
  localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(credentials));
  toast({
    title: "Credentials saved",
    description: "Your Cloudflare credentials have been saved successfully."
  });
};

// Helper function to retrieve credentials from localStorage
export const getCredentials = (): CloudflareCredentials | null => {
  const credentialsString = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
  if (!credentialsString) {
    return null;
  }
  
  try {
    return JSON.parse(credentialsString) as CloudflareCredentials;
  } catch (error) {
    console.error('Failed to parse credentials:', error);
    return null;
  }
};

// Helper function to clear credentials from localStorage
export const clearCredentials = (): void => {
  localStorage.removeItem(CREDENTIALS_STORAGE_KEY);
  toast({
    title: "Credentials cleared",
    description: "Your Cloudflare credentials have been removed."
  });
};

// Base API methods
const makeRequest = async (
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<any> => {
  const credentials = getCredentials();
  
  if (!credentials) {
    throw new Error('No Cloudflare credentials found. Please set your API credentials first.');
  }
  
  const baseUrl = 'http://localhost:3001/api/cloudflare'; // Point to our Express backend
  
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
    return response.result;
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
  
  // New methods for tunnel configurations
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
  }
};

// Test if credentials are valid
export const testCredentials = async (credentials: CloudflareCredentials): Promise<boolean> => {
  try {
    // Save credentials temporarily
    saveCredentials(credentials);
    // Try to list DNS records as a test
    await dnsRecordsApi.listRecords();
    return true;
  } catch (error) {
    clearCredentials();
    throw error;
  }
};
