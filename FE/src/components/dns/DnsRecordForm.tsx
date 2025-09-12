
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';


export const recordFormSchema = z.object({
  type: z.string().min(1, 'Record type is required'),
  name: z.string().min(1, 'Name is required'),
  content: z.string().min(1, 'Content is required'),
  ttl: z.coerce.number().int().min(60).or(z.literal(1)),
  proxied: z.boolean().default(false),
});

export type RecordFormValues = z.infer<typeof recordFormSchema>;

// Record types for the dropdown
export const recordTypes = [
  'A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV', 'CAA'
];

interface DnsRecordFormProps {
  defaultValues?: RecordFormValues;
  onSubmit: (data: RecordFormValues) => void;
  submitButtonText: string;
}

const DnsRecordForm: React.FC<DnsRecordFormProps> = ({ 
  defaultValues = {
    type: 'A',
    name: '',
    content: '',
    ttl: 1,
    proxied: false,
  }, 
  onSubmit,
  submitButtonText
}) => {
  const form = useForm<RecordFormValues>({
    resolver: zodResolver(recordFormSchema),
    defaultValues,
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select record type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {recordTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 192.168.1.1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ttl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>TTL</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1"
                  placeholder="1 = Auto" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Time to live in seconds. Use 1 for auto.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="proxied"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Proxy through Cloudflare</FormLabel>
                <FormDescription>
                  Enable Cloudflare proxying for this record.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit">{submitButtonText}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default DnsRecordForm;
