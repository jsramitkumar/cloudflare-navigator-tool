
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
  getCredentials, 
  clearCredentials, 
  testCredentials,
  CloudflareCredentials
} from '@/services/cloudflareApi';

const formSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  accountId: z.string().min(1, 'Account ID is required'),
  zoneId: z.string().min(1, 'Zone ID is required'),
});

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  
  const form = useForm<CloudflareCredentials>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: '',
      email: '',
      accountId: '',
      zoneId: '',
    },
  });
  
  useEffect(() => {
    const credentials = getCredentials();
    if (credentials) {
      setHasCredentials(true);
      form.reset(credentials);
    }
  }, [form]);
  
  const onSubmit = async (data: CloudflareCredentials) => {
    setIsLoading(true);
    try {
      await testCredentials(data);
      toast({
        title: "Connection successful",
        description: "Your Cloudflare credentials are valid and have been saved.",
      });
      setHasCredentials(true);
      navigate('/');
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
  
  const handleClearCredentials = () => {
    clearCredentials();
    setHasCredentials(false);
    form.reset({
      apiKey: '',
      email: '',
      accountId: '',
      zoneId: '',
    });
    toast({
      title: "Credentials cleared",
      description: "Your Cloudflare credentials have been removed.",
    });
  };
  
  return (
    <div className="container max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Cloudflare API Credentials</CardTitle>
          <CardDescription>
            Enter your Cloudflare API credentials to connect to your account.
            These credentials are stored securely in your browser.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
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
              {hasCredentials && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleClearCredentials}
                >
                  Clear Credentials
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Testing connection...' : hasCredentials ? 'Update Credentials' : 'Save Credentials'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;
