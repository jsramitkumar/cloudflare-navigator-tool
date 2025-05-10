
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';
import { 
  saveCredentials, 
  updateCredentials,
  getAccountsList,
  getActiveAccount,
  deleteAccount,
  setActiveAccount,
  clearCredentials,
  testCredentials,
  CloudflareCredentials
} from '@/services/cloudflareApi';
import { 
  getCurrentApiUrl, 
  saveApiUrl, 
  testBackendConnection 
} from '@/services/apiConfig';
import AccountSelector from '@/components/AccountSelector';

const formSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  apiKey: z.string().min(1, 'API key is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  accountId: z.string().min(1, 'Account ID is required'),
  zoneId: z.string().min(1, 'Zone ID is required'),
});

const apiUrlFormSchema = z.object({
  apiUrl: z.string().url('Must be a valid URL'),
});

type FormValues = z.infer<typeof formSchema>;
type ApiUrlFormValues = z.infer<typeof apiUrlFormSchema>;

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingBackend, setIsTestingBackend] = useState(false);
  const [accounts, setAccounts] = useState<CloudflareCredentials[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      apiKey: '',
      email: '',
      accountId: '',
      zoneId: '',
    },
  });
  
  const apiUrlForm = useForm<ApiUrlFormValues>({
    resolver: zodResolver(apiUrlFormSchema),
    defaultValues: {
      apiUrl: getCurrentApiUrl(),
    },
  });
  
  // Load accounts on mount
  useEffect(() => {
    loadAccounts();
  }, []);
  
  // When currentAccountId changes, load that account's data
  useEffect(() => {
    if (currentAccountId) {
      const account = accounts.find(acc => acc.id === currentAccountId);
      if (account) {
        form.reset({
          name: account.name,
          apiKey: account.apiKey,
          email: account.email || '',
          accountId: account.accountId,
          zoneId: account.zoneId,
        });
        setEditMode(true);
      }
    } else {
      form.reset({
        name: '',
        apiKey: '',
        email: '',
        accountId: '',
        zoneId: '',
      });
      setEditMode(false);
    }
  }, [currentAccountId, accounts, form]);
  
  const loadAccounts = () => {
    const accountsList = getAccountsList() || [];
    setAccounts(accountsList);
    
    const activeAccount = getActiveAccount();
    if (activeAccount) {
      setCurrentAccountId(activeAccount.id);
    } else {
      setCurrentAccountId(null);
    }
  };
  
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      // Ensure data is properly typed for the API functions
      const credentialData: Omit<CloudflareCredentials, 'id'> = {
        name: data.name,
        apiKey: data.apiKey,
        email: data.email || undefined, // Convert empty string to undefined
        accountId: data.accountId,
        zoneId: data.zoneId,
      };
      
      await testCredentials(credentialData);
      
      if (editMode && currentAccountId) {
        // Update existing account
        updateCredentials(currentAccountId, credentialData);
      } else {
        // Create new account
        saveCredentials(credentialData);
      }
      
      loadAccounts();
      setEditMode(false);
      setCurrentAccountId(null);
      form.reset({
        name: '',
        apiKey: '',
        email: '',
        accountId: '',
        zoneId: '',
      });
      
      toast({
        title: editMode ? "Account updated" : "Account added",
        description: `${data.name} has been ${editMode ? 'updated' : 'added'} successfully.`,
      });
      
      // Navigate to dashboard after adding first account
      if (accounts.length === 0) {
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect to Cloudflare. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteAccount = () => {
    if (currentAccountId) {
      deleteAccount(currentAccountId);
      loadAccounts();
      setCurrentAccountId(null);
      setEditMode(false);
      form.reset({
        name: '',
        apiKey: '',
        email: '',
        accountId: '',
        zoneId: '',
      });
    }
  };
  
  const handleClearAll = () => {
    clearCredentials();
    loadAccounts();
    setCurrentAccountId(null);
    setEditMode(false);
    form.reset({
      name: '',
      apiKey: '',
      email: '',
      accountId: '',
      zoneId: '',
    });
  };
  
  const handleAccountSelect = (accountId: string) => {
    setActiveAccount(accountId);
    setCurrentAccountId(accountId);
  };
  
  const handleCancelEdit = () => {
    setEditMode(false);
    setCurrentAccountId(null);
    form.reset({
      name: '',
      apiKey: '',
      email: '',
      accountId: '',
      zoneId: '',
    });
  };

  const onApiUrlSubmit = async (data: ApiUrlFormValues) => {
    setIsTestingBackend(true);
    try {
      // Test connection to backend
      const isConnected = await testBackendConnection(data.apiUrl);
      
      if (isConnected) {
        // Save API URL to localStorage
        saveApiUrl(data.apiUrl);
        
        toast({
          title: "Backend URL updated",
          description: "Connection to backend successful. URL has been saved.",
        });
      } else {
        toast({
          title: "Connection failed",
          description: "Failed to connect to backend. Please check the URL.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect to backend. Please check the URL.",
        variant: "destructive",
      });
    } finally {
      setIsTestingBackend(false);
    }
  };
  
  return (
    <div className="container max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Backend API Configuration</CardTitle>
          <CardDescription>
            Configure the URL for the backend API server.
          </CardDescription>
        </CardHeader>
        <Form {...apiUrlForm}>
          <form onSubmit={apiUrlForm.handleSubmit(onApiUrlSubmit)}>
            <CardContent>
              <FormField
                control={apiUrlForm.control}
                name="apiUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Backend API URL</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="http://localhost:3001/api" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isTestingBackend}>
                {isTestingBackend ? 'Testing connection...' : 'Save and Test Connection'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      {accounts.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cloudflare Accounts</CardTitle>
            <CardDescription>
              Manage your Cloudflare accounts or add a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccountSelector 
              accounts={accounts} 
              activeAccountId={currentAccountId} 
              onSelect={handleAccountSelect} 
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="destructive" 
              onClick={handleClearAll}
            >
              Clear All Accounts
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>{editMode ? 'Edit Account' : 'Add New Cloudflare Account'}</CardTitle>
          <CardDescription>
            {editMode 
              ? 'Edit your Cloudflare API credentials for this account.' 
              : 'Enter your Cloudflare API credentials to add a new account.'}
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="My Cloudflare Account" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Cloudflare API Key" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Your Cloudflare email" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account ID</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="Cloudflare Account ID" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="zoneId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zone ID</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="Cloudflare Zone ID" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            
            <CardFooter className="flex justify-between">
              {editMode ? (
                <>
                  <div>
                    <Button 
                      type="button" 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                    >
                      Delete Account
                    </Button>
                  </div>
                  <div className="space-x-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Update Account'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div></div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Testing connection...' : 'Add Account'}
                  </Button>
                </>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;
