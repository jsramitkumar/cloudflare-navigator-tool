
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TunnelIngress } from '@/services/cloudflareApi';
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

const tunnelIngressSchema = z.object({
  hostname: z.string().min(1, 'Hostname is required'),
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
  // Transform the initial values to match the form schema
  const defaultValues: Partial<TunnelIngressFormValues> = {
    hostname: initialValues?.hostname || '',
    service: initialValues?.service || '',
    path: initialValues?.path || '',
    noTLSVerify: initialValues?.originRequest?.noTLSVerify || false,
    originServerName: initialValues?.originRequest?.originServerName || '',
  };

  const form = useForm<TunnelIngressFormValues>({
    resolver: zodResolver(tunnelIngressSchema),
    defaultValues,
  });

  const handleSubmit = (values: TunnelIngressFormValues) => {
    // Transform the form values back to the TunnelIngress format
    const formattedValues: Partial<TunnelIngress> = {
      hostname: values.hostname,
      service: values.service,
      path: values.path || undefined,
      originRequest: {
        noTLSVerify: values.noTLSVerify,
        originServerName: values.originServerName || undefined,
      },
    };

    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="hostname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hostname</FormLabel>
              <FormControl>
                <Input placeholder="example.com" {...field} />
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
