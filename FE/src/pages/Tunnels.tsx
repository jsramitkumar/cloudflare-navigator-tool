
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus, 
  Search, 
  Trash2,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Network,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import { tunnelsApi, CloudflareTunnel, getCredentials } from '@/services/cloudflareApi';
import { Badge } from '@/components/ui/badge';
import TunnelDetails from '@/components/tunnels/TunnelDetails';

const tunnelFormSchema = z.object({
  name: z.string().min(1, 'Tunnel name is required'),
});

type TunnelFormValues = z.infer<typeof tunnelFormSchema>;

const Tunnels: React.FC = () => {
  const navigate = useNavigate();
  const [tunnels, setTunnels] = useState<CloudflareTunnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTunnelId, setSelectedTunnelId] = useState<string | null>(null);
  
  const form = useForm<TunnelFormValues>({
    resolver: zodResolver(tunnelFormSchema),
    defaultValues: {
      name: '',
    },
  });
  
  // Load tunnels on component mount
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
    
    fetchTunnels();
  }, [navigate]);
  
  const fetchTunnels = async () => {
    setIsLoading(true);
    try {
      const data = await tunnelsApi.listTunnels();
      // Filter out deleted tunnels (tunnelsApi.listTunnels already does this now)
      setTunnels(data);
    } catch (error) {
      console.error('Failed to fetch tunnels:', error);
      toast({
        title: "Failed to load tunnels",
        description: "There was an error loading your Cloudflare tunnels.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const onSubmit = async (data: TunnelFormValues) => {
    try {
      await tunnelsApi.createTunnel({ name: data.name });
      await fetchTunnels();
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Tunnel created",
        description: `Tunnel "${data.name}" has been created.`,
      });
    } catch (error) {
      console.error('Failed to create tunnel:', error);
      toast({
        title: "Failed to create tunnel",
        description: "There was an error creating your Cloudflare tunnel.",
        variant: "destructive",
      });
    }
  };
  
  const onDelete = async (id: string) => {
    try {
      await tunnelsApi.deleteTunnel(id);
      setTunnels(tunnels.filter(tunnel => tunnel.id !== id));
      toast({
        title: "Tunnel deleted",
        description: "The Cloudflare tunnel has been deleted.",
      });
    } catch (error) {
      console.error('Failed to delete tunnel:', error);
      toast({
        title: "Failed to delete tunnel",
        description: "There was an error deleting your Cloudflare tunnel.",
        variant: "destructive",
      });
    }
  };
  
  // Filter tunnels by search term
  const filteredTunnels = tunnels.filter(tunnel => 
    searchTerm === '' || tunnel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Helper function to render status badge
  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500"><XCircle className="h-3 w-3 mr-1" /> Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      default:
        return <Badge className="bg-blue-500">{status}</Badge>;
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // If a tunnel is selected, show its details
  if (selectedTunnelId) {
    return (
      <TunnelDetails 
        tunnelId={selectedTunnelId}
        onBack={() => setSelectedTunnelId(null)}
      />
    );
  }
  
  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cloudflare Tunnels</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Tunnel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Tunnel</DialogTitle>
              <DialogDescription>
                Create a new Cloudflare Tunnel to expose your local services to the internet.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tunnel Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., my-app-tunnel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Create Tunnel</Button>
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
            placeholder="Search tunnels..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          onClick={fetchTunnels}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  Loading tunnels...
                </TableCell>
              </TableRow>
            ) : filteredTunnels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  No tunnels found
                </TableCell>
              </TableRow>
            ) : (
              filteredTunnels.map((tunnel) => (
                <TableRow key={tunnel.id}>
                  <TableCell className="font-medium">{tunnel.name}</TableCell>
                  <TableCell>{getStatusBadge(tunnel.status)}</TableCell>
                  <TableCell>{formatDate(tunnel.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setSelectedTunnelId(tunnel.id)}
                    >
                      <Network className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => window.open(`https://dash.cloudflare.com/tunnels/${tunnel.id}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Tunnel</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the tunnel "{tunnel.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(tunnel.id)}>
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
    </div>
  );
};

export default Tunnels;
