
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TunnelIngress, domainsApi } from '@/services/cloudflareApi';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const tunnelIngressSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
  subdomain: z.string().optional(),
  service: z.string().min(1, 'Service is required'),
  path: z.string().optional(),
  noTLSVerify: z.boolean().default(false),
  originServerName: z.string().optional(),
});

type TunnelIngressFormValues = z.infer<typeof tunnelIngressSchema>;

interface TunnelIngressFormProps {
  initialValues?: Partial<TunnelIngress>;
  onSubmit: (data: TunnelIngressFormValues) => void;
  submitButtonText?: string;
  onCancel?: () => void;
}

const TunnelIngressForm: React.FC<TunnelIngressFormProps> = ({
  initialValues,
  onSubmit,
  submitButtonText = 'Save',
  onCancel,
}) => {
  const [domains, setDomains] = useState<string[]>([]);
  const [isLoadingDomains, setIsLoadingDomains] = useState(true);

  // Parse hostname into domain and subdomain parts
  const parseHostname = (hostname: string) => {
    if (!hostname) return { domain: '', subdomain: '' };
    
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      const domain = parts.slice(-2).join('.');
      const subdomain = parts.length > 2 ? parts.slice(0, -2).join('.') : '';
      return { domain, subdomain };
    }
    return { domain: hostname, subdomain: '' };
  };

  const { domain: initialDomain, subdomain: initialSubdomain } = parseHostname(initialValues?.hostname || '');

  // Transform the initial values to match the form schema
  const defaultValues: Partial<TunnelIngressFormValues> = {
    domain: initialDomain,
    subdomain: initialSubdomain,
    service: initialValues?.service || '',
    path: initialValues?.path || '',
    noTLSVerify: initialValues?.originRequest?.noTLSVerify || false,
    originServerName: initialValues?.originRequest?.originServerName || '',
  };

  // Load available domains
  useEffect(() => {
    const loadDomains = async () => {
      try {
        const availableDomains = await domainsApi.listDomains();
        setDomains(availableDomains);
      } catch (error) {
        console.error('Failed to load domains:', error);
      } finally {
        setIsLoadingDomains(false);
      }
    };

    loadDomains();
  }, []);

  const form = useForm<TunnelIngressFormValues>({
    resolver: zodResolver(tunnelIngressSchema),
    defaultValues,
  });

  const handleSubmit = (values: TunnelIngressFormValues) => {

    // Transform the form values back to the required format
    const formattedValues = {
      domain: values.domain,
      service: values.service,
      noTLSVerify: values.noTLSVerify,
      path: values.path || undefined,
      subdomain: values.subdomain || undefined,
      originServerName: values.originServerName || undefined,
    };

    onSubmit(formattedValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="domain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Domain</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingDomains ? "Loading domains..." : "Select a domain"} />
                  </SelectTrigger>
                  <SelectContent>
                    {domains.map((domain) => (
                      <SelectItem key={domain} value={domain}>
                        {domain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subdomain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subdomain (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="www, api, app" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="service"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service</FormLabel>
              <FormControl>
                <Input placeholder="http://localhost:8080" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="path"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Path (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="/api" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="noTLSVerify"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Disable TLS Verification</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="originServerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Origin Server Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="internal-server.local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">{submitButtonText}</Button>
        </div>
      </form>
    </Form>
  );
};

export default TunnelIngressForm;
