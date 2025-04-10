
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowUpDown,
  Plus,
  Search,
  Trash2,
  Edit,
  EyeOff,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { dnsRecordsApi, DnsRecord, getCredentials } from '@/services/cloudflareApi';

const recordFormSchema = z.object({
  type: z.string().min(1, 'Record type is required'),
  name: z.string().min(1, 'Name is required'),
  content: z.string().min(1, 'Content is required'),
  ttl: z.coerce.number().int().min(60).or(z.literal(1)),
  proxied: z.boolean().default(false),
});

type RecordFormValues = z.infer<typeof recordFormSchema>;

const DnsRecords: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<DnsRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DnsRecord | null>(null);
  const [filter, setFilter] = useState<string>('all');
  
  const form = useForm<RecordFormValues>({
    resolver: zodResolver(recordFormSchema),
    defaultValues: {
      type: 'A',
      name: '',
      content: '',
      ttl: 1,
      proxied: false,
    },
  });
  
  const editForm = useForm<RecordFormValues>({
    resolver: zodResolver(recordFormSchema),
    defaultValues: {
      type: 'A',
      name: '',
      content: '',
      ttl: 1,
      proxied: false,
    },
  });
  
  // Record types for the dropdown
  const recordTypes = [
    'A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV', 'CAA'
  ];
  
  // Load records on component mount
  useEffect(() => {
    const credentials = getCredentials();
    if (!credentials) {
      toast({
        title: "No credentials found",
        description: "Please set your Cloudflare API credentials first.",
        variant: "destructive",
      });
      navigate('/settings');
      return;
    }
    
    fetchRecords();
  }, [navigate]);
  
  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const data = await dnsRecordsApi.listRecords();
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch DNS records:', error);
      toast({
        title: "Failed to load records",
        description: "There was an error loading your DNS records.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const onSubmit = async (data: RecordFormValues) => {
    try {
      // Fixed: Explicitly cast the form data to the required type structure
      await dnsRecordsApi.createRecord({
        type: data.type,
        name: data.name,
        content: data.content,
        ttl: data.ttl,
        proxied: data.proxied
      });
      
      await fetchRecords();
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Record created",
        description: `${data.type} record "${data.name}" has been created.`,
      });
    } catch (error) {
      console.error('Failed to create DNS record:', error);
      toast({
        title: "Failed to create record",
        description: "There was an error creating your DNS record.",
        variant: "destructive",
      });
    }
  };
  
  const onEdit = (record: DnsRecord) => {
    setEditingRecord(record);
    editForm.reset({
      type: record.type,
      name: record.name,
      content: record.content,
      ttl: record.ttl,
      proxied: record.proxied,
    });
    setIsEditDialogOpen(true);
  };
  
  const onEditSubmit = async (data: RecordFormValues) => {
    if (!editingRecord) return;
    
    try {
      // Fixed: Explicitly cast the form data to the required type structure
      await dnsRecordsApi.updateRecord(editingRecord.id, {
        type: data.type,
        name: data.name,
        content: data.content,
        ttl: data.ttl,
        proxied: data.proxied
      });
      
      await fetchRecords();
      setIsEditDialogOpen(false);
      toast({
        title: "Record updated",
        description: `${data.type} record "${data.name}" has been updated.`,
      });
    } catch (error) {
      console.error('Failed to update DNS record:', error);
      toast({
        title: "Failed to update record",
        description: "There was an error updating your DNS record.",
        variant: "destructive",
      });
    }
  };
  
  const onDelete = async (id: string) => {
    try {
      await dnsRecordsApi.deleteRecord(id);
      setRecords(records.filter(record => record.id !== id));
      toast({
        title: "Record deleted",
        description: "The DNS record has been deleted.",
      });
    } catch (error) {
      console.error('Failed to delete DNS record:', error);
      toast({
        title: "Failed to delete record",
        description: "There was an error deleting your DNS record.",
        variant: "destructive",
      });
    }
  };
  
  // Filter and search records
  const filteredRecords = records.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.content.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = filter === 'all' || 
      (filter === 'proxied' && record.proxied) ||
      (filter === 'unproxied' && !record.proxied) ||
      filter === record.type;
      
    return matchesSearch && matchesFilter;
  });
  
  const filterOptions = [
    { value: 'all', label: 'All Records' },
    { value: 'proxied', label: 'Proxied Only' },
    { value: 'unproxied', label: 'Unproxied Only' },
    ...recordTypes.map(type => ({ value: type, label: `${type} Records` }))
  ];
  
  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">DNS Records</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Record
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add DNS Record</DialogTitle>
              <DialogDescription>
                Create a new DNS record for your domain.
              </DialogDescription>
            </DialogHeader>
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
                  <Button type="submit">Create Record</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex justify-between mb-4 gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={filter}
          onValueChange={setFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter records" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          onClick={fetchRecords}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Content</TableHead>
              <TableHead className="w-[100px]">TTL</TableHead>
              <TableHead className="w-[100px]">Proxied</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Loading records...
                </TableCell>
              </TableRow>
            ) : filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.type}</TableCell>
                  <TableCell>{record.name}</TableCell>
                  <TableCell className="font-mono text-sm">{record.content}</TableCell>
                  <TableCell>{record.ttl === 1 ? 'Auto' : record.ttl}</TableCell>
                  <TableCell>
                    {record.proxied ? 
                      <Eye className="h-4 w-4 text-primary" /> : 
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEdit(record)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete DNS Record</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the {record.type} record "{record.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(record.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit DNS Record</DialogTitle>
            <DialogDescription>
              Update this DNS record.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
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
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="ttl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TTL</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
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
                control={editForm.control}
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
                <Button type="submit">Update Record</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DnsRecords;
