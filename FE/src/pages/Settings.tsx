
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
  getCurrentHostname, 
  saveHostname, 
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

const hostnameFormSchema = z.object({
  hostname: z.string().min(1, 'Hostname is required').regex(/^[a-zA-Z0-9.-]+$/, 'Must be a valid hostname'),
});

type FormValues = z.infer<typeof formSchema>;
type HostnameFormValues = z.infer<typeof hostnameFormSchema>;

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingBackend, setIsTestingBackend] = useState(false);
  const [accounts, setAccounts] = useState<CloudflareCredentials[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [activeAccountId, setActiveAccountIdState] = useState<string | null>(null);
  const [showAccountForm, setShowAccountForm] = useState(false);
  
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
  
  const hostnameForm = useForm<HostnameFormValues>({
    resolver: zodResolver(hostnameFormSchema),
    defaultValues: {
      hostname: getCurrentHostname(),
    },
  });
  
  // Load accounts on mount
  useEffect(() => {
    loadAccounts();
  }, []);
  
  // When activeAccountId changes, load that account's data
  useEffect(() => {
    if (editMode && activeAccountId) {
      const account = accounts.find(acc => acc.id === activeAccountId);
      if (account) {
        form.reset({
          name: account.name,
          apiKey: account.apiKey,
          email: account.email || '',
          accountId: account.accountId,
          zoneId: account.zoneId,
        });
      }
    } else if (!editMode) {
      form.reset({
        name: '',
        apiKey: '',
        email: '',
        accountId: '',
        zoneId: '',
      });
    }
  }, [activeAccountId, accounts, form, editMode]);
  
  const loadAccounts = () => {
    const accountsList = getAccountsList() || [];
    setAccounts(accountsList);
    
    const activeAccount = getActiveAccount();
    setActiveAccountIdState(activeAccount?.id || null);
    
    // Show account form if no accounts exist
    setShowAccountForm(accountsList.length === 0);
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
      
      if (editMode && activeAccountId) {
        // Update existing account
        updateCredentials(activeAccountId, credentialData);
        toast({
          title: "Account updated",
          description: `${data.name} has been updated successfully.`,
        });
      } else {
        // Create new account
        const newAccount = saveCredentials(credentialData);
        // Set the new account as active
        setActiveAccount(newAccount.id);
        toast({
          title: "Account added",
          description: `${data.name} has been added successfully.`,
        });
      }
      
      loadAccounts();
      setEditMode(false);
      setShowAccountForm(false);
      form.reset({
        name: '',
        apiKey: '',
        email: '',
        accountId: '',
        zoneId: '',
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
    if (activeAccountId) {
      deleteAccount(activeAccountId);
      loadAccounts();
      setEditMode(false);
      setShowAccountForm(accounts.length <= 1); // Show form if this was the last account
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
    setEditMode(false);
    setShowAccountForm(true);
    form.reset({
      name: '',
      apiKey: '',
      email: '',
      accountId: '',
      zoneId: '',
    });
  };
  
  const handleAccountSelect = (accountId: string) => {
    console.log('Switching to account:', accountId);
    setActiveAccount(accountId);
    setActiveAccountIdState(accountId);
    
    // Refresh the sidebar by triggering a storage event
    window.dispatchEvent(new Event('storage'));
    
    toast({
      title: "Account switched",
      description: `Switched to ${accounts.find(acc => acc.id === accountId)?.name || 'selected account'}`,
    });
  };
  
  const handleEditAccount = () => {
    if (activeAccountId) {
      setEditMode(true);
      setShowAccountForm(true);
    }
  };
  
  const handleAddNewAccount = () => {
    setEditMode(false);
    setShowAccountForm(true);
    form.reset({
      name: '',
      apiKey: '',
      email: '',
      accountId: '',
      zoneId: '',
    });
  };
  
  const handleCancelEdit = () => {
    setEditMode(false);
    setShowAccountForm(accounts.length === 0); // Only hide if we have accounts
    form.reset({
      name: '',
      apiKey: '',
      email: '',
      accountId: '',
      zoneId: '',
    });
  };

  const onHostnameSubmit = async (data: HostnameFormValues) => {
    setIsTestingBackend(true);
    try {
      // Test connection to backend
      const isConnected = await testBackendConnection(data.hostname);
      
      if (isConnected) {
        // Save hostname to localStorage
        saveHostname(data.hostname);
        
        toast({
          title: "Backend hostname updated",
          description: "Connection to backend successful. Hostname has been saved.",
        });
      } else {
        toast({
          title: "Connection failed",
          description: "Failed to connect to backend. Please check the hostname.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect to backend. Please check the hostname.",
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
            Configure the hostname for the backend API server. Defaults to cdm-api-server.endusercompute.in
          </CardDescription>
        </CardHeader>
        <Form {...hostnameForm}>
          <form onSubmit={hostnameForm.handleSubmit(onHostnameSubmit)}>
            <CardContent>
              <FormField
                control={hostnameForm.control}
                name="hostname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Backend Hostname</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="cdm-api-server.endusercompute.in" 
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
              Switch between your Cloudflare accounts or manage them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccountSelector 
              accounts={accounts} 
              activeAccountId={activeAccountId} 
              onSelect={handleAccountSelect}
              onAddNew={handleAddNewAccount}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="destructive" 
              onClick={handleClearAll}
            >
              Clear All Accounts
            </Button>
            <Button 
              variant="outline" 
              onClick={handleEditAccount}
              disabled={!activeAccountId}
            >
              Edit Selected Account
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {showAccountForm && (
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
                    <div>
                      {accounts.length > 0 && (
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Testing connection...' : 'Add Account'}
                    </Button>
                  </>
                )}
              </CardFooter>
            </form>
          </Form>
        </Card>
      )}
    </div>
  );
};

export default Settings;
