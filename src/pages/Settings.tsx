
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
import AccountSelector from '@/components/AccountSelector';

const formSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  apiKey: z.string().min(1, 'API key is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  accountId: z.string().min(1, 'Account ID is required'),
  zoneId: z.string().min(1, 'Zone ID is required'),
});

type FormValues = z.infer<typeof formSchema>;

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
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
      await testCredentials(data);
      
      if (editMode && currentAccountId) {
        // Update existing account
        updateCredentials(currentAccountId, data);
      } else {
        // Create new account
        saveCredentials(data);
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
  
  return (
    <div className="container max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
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
