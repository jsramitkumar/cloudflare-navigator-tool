
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { 
  Plus, 
  Trash2, 
  Link2,
  Pencil,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { CloudflareTunnel, TunnelConfig, TunnelIngress, tunnelsApi, dnsRecordsApi } from '@/services/cloudflareApi';
import AddIngressDialog from './AddIngressDialog';
import EditIngressDialog from './EditIngressDialog';

interface TunnelDetailsProps {
  tunnelId: string;
  onBack: () => void;
}

const TunnelDetails: React.FC<TunnelDetailsProps> = ({ tunnelId, onBack }) => {
  const navigate = useNavigate();
  const [tunnel, setTunnel] = useState<CloudflareTunnel | null>(null);
  const [config, setConfig] = useState<TunnelConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editIngress, setEditIngress] = useState<TunnelIngress | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Load tunnel details and configuration
  useEffect(() => {
    const fetchTunnelDetails = async () => {
      setIsLoading(true);
      try {
        const tunnelData = await tunnelsApi.getTunnel(tunnelId);
        
        // Check if tunnel is deleted
        if (tunnelData.deleted_at) {
          toast({
            title: "Tunnel deleted",
            description: "This tunnel has been deleted and is no longer available.",
            variant: "destructive",
          });
          onBack(); // Go back to tunnels list
          return;
        }
        
        setTunnel(tunnelData);
        
        try {
          const configData = await tunnelsApi.getTunnelConfig(tunnelId);
          setConfig(configData);
        } catch (configError) {
          console.error('Failed to fetch tunnel configuration:', configError);
          toast({
            title: "Configuration not available",
            description: "This tunnel might not have been properly configured yet.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Failed to fetch tunnel details:', error);
        toast({
          title: "Failed to load tunnel",
          description: "There was an error loading the tunnel details.",
          variant: "destructive",
        });
        onBack();
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTunnelDetails();
  }, [tunnelId, navigate, onBack]);
  
  const handleAddIngress = async (data: any) => {
    if (!config || !tunnel) return;
    
    try {
      // Format the ingress entry
      const newIngress: TunnelIngress = {
        hostname: data.hostname,
        service: data.service,
      };
      
      if (data.path) {
        newIngress.path = data.path;
      }
      
      if (data.noTLSVerify || data.originServerName) {
        newIngress.originRequest = {};
        if (data.noTLSVerify) {
          newIngress.originRequest.noTLSVerify = data.noTLSVerify;
        }
        if (data.originServerName) {
          newIngress.originRequest.originServerName = data.originServerName;
        }
      }
      
      // Create a new configuration object
      const updatedConfig = {
        ...config,
        config: {
          ...config.config,
          ingress: [
            // Add the new ingress at the beginning 
            // (before the catch-all rule which is typically last)
            newIngress,
            ...config.config.ingress.filter((_, index) => 
              index < config.config.ingress.length - 1
            ),
            // Keep the catch-all rule at the end
            config.config.ingress[config.config.ingress.length - 1]
          ]
        }
      };
      
      // Update the tunnel configuration
      await tunnelsApi.updateTunnelConfig(tunnelId, updatedConfig);
      setConfig(updatedConfig);
      
      // Create a corresponding CNAME DNS record
      try {
        // Create a CNAME record pointing to the tunnel
        await dnsRecordsApi.createRecord({
          type: 'CNAME',
          name: data.hostname.split('.')[0], // Extract subdomain part
          content: `${tunnel.id}.cfargotunnel.com`, // Standard Cloudflare Argo tunnel format
          ttl: 1, // Auto TTL (Cloudflare managed)
          proxied: true // Enable Cloudflare proxy
        });
        
        toast({
          title: "Hostname and DNS record added",
          description: `Public hostname "${data.hostname}" has been added with a CNAME DNS record.`,
        });
      } catch (dnsError) {
        console.error('Failed to create DNS record:', dnsError);
        toast({
          title: "Hostname added, DNS record failed",
          description: `Public hostname added, but DNS CNAME record creation failed. You may need to create it manually.`,
          variant: "destructive",
        });
      }
      
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to add hostname:', error);
      toast({
        title: "Failed to add hostname",
        description: "There was an error adding the public hostname.",
        variant: "destructive",
      });
    }
  };
  
  const handleEditIngress = async (data: any) => {
    if (!config || !editIngress || !tunnel) return;
    
    try {
      // Find the index of the ingress to update
      const ingressIndex = config.config.ingress.findIndex(
        ing => ing.hostname === editIngress.hostname && ing.service === editIngress.service
      );
      
      if (ingressIndex === -1) {
        throw new Error("Hostname configuration not found");
      }
      
      // Format the updated ingress entry
      const updatedIngress: TunnelIngress = {
        hostname: data.hostname,
        service: data.service,
      };
      
      if (data.path) {
        updatedIngress.path = data.path;
      }
      
      if (data.noTLSVerify || data.originServerName) {
        updatedIngress.originRequest = {};
        if (data.noTLSVerify) {
          updatedIngress.originRequest.noTLSVerify = data.noTLSVerify;
        }
        if (data.originServerName) {
          updatedIngress.originRequest.originServerName = data.originServerName;
        }
      }
      
      // Create a new ingress array with the updated entry
      const updatedIngresses = [...config.config.ingress];
      updatedIngresses[ingressIndex] = updatedIngress;
      
      // Create a new configuration object
      const updatedConfig = {
        ...config,
        config: {
          ...config.config,
          ingress: updatedIngresses
        }
      };
      
      // Update the tunnel configuration
      await tunnelsApi.updateTunnelConfig(tunnelId, updatedConfig);
      setConfig(updatedConfig);
      
      // If hostname changed, update the DNS record too
      if (editIngress.hostname !== data.hostname) {
        try {
          // First try to find if there's an existing CNAME record for the old hostname
          const records = await dnsRecordsApi.listRecords();
          const oldHostnamePrefix = editIngress.hostname.split('.')[0];
          const existingRecord = records.find(
            record => record.type === 'CNAME' && record.name === oldHostnamePrefix
          );
          
          if (existingRecord) {
            // Update the existing record
            await dnsRecordsApi.updateRecord(existingRecord.id, {
              name: data.hostname.split('.')[0], // Extract subdomain part
              content: `${tunnel.id}.cfargotunnel.com`, // Standard Cloudflare Argo tunnel format
              ttl: 1,
              proxied: true
            });
            
            toast({
              title: "Hostname and DNS record updated",
              description: `Public hostname "${data.hostname}" has been updated with its CNAME DNS record.`,
            });
          } else {
            // Create a new record
            await dnsRecordsApi.createRecord({
              type: 'CNAME',
              name: data.hostname.split('.')[0],
              content: `${tunnel.id}.cfargotunnel.com`,
              ttl: 1,
              proxied: true
            });
            
            toast({
              title: "Hostname updated and DNS record created",
              description: `Public hostname "${data.hostname}" has been updated and a new CNAME DNS record has been created.`,
            });
          }
        } catch (dnsError) {
          console.error('Failed to update DNS record:', dnsError);
          toast({
            title: "Hostname updated, DNS record failed",
            description: `Hostname updated, but DNS CNAME record update failed. You may need to update it manually.`,
            variant: "destructive", // Changed from "warning" to "destructive"
          });
        }
      } else {
        toast({
          title: "Hostname updated",
          description: `Public hostname "${data.hostname}" has been updated.`,
        });
      }
      
      setIsEditDialogOpen(false);
      setEditIngress(null);
    } catch (error) {
      console.error('Failed to update hostname:', error);
      toast({
        title: "Failed to update hostname",
        description: "There was an error updating the public hostname.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteIngress = async (ingress: TunnelIngress) => {
    if (!config) return;
    
    try {
      // Filter out the ingress to delete
      const updatedIngresses = config.config.ingress.filter(
        ing => !(ing.hostname === ingress.hostname && ing.service === ingress.service)
      );
      
      // Create a new configuration object
      const updatedConfig = {
        ...config,
        config: {
          ...config.config,
          ingress: updatedIngresses
        }
      };
      
      // Update the tunnel configuration using the correct cfd_tunnel endpoint
      await tunnelsApi.updateTunnelConfig(tunnelId, updatedConfig);
      setConfig(updatedConfig);
      
      // Also delete the corresponding DNS record if it exists
      try {
        const records = await dnsRecordsApi.listRecords();
        const hostnamePrefix = ingress.hostname.split('.')[0];
        const existingRecord = records.find(
          record => record.type === 'CNAME' && record.name === hostnamePrefix
        );
        
        if (existingRecord) {
          await dnsRecordsApi.deleteRecord(existingRecord.id);
          toast({
            title: "Hostname and DNS record deleted",
            description: `Public hostname "${ingress.hostname}" and its CNAME DNS record have been deleted.`,
          });
        } else {
          toast({
            title: "Hostname deleted",
            description: `Public hostname "${ingress.hostname}" has been deleted.`,
          });
        }
      } catch (dnsError) {
        console.error('Error checking/deleting DNS record:', dnsError);
        toast({
          title: "Hostname deleted",
          description: `Public hostname "${ingress.hostname}" deleted, but could not check for corresponding DNS record.`,
        });
      }
    } catch (error) {
      console.error('Failed to delete hostname:', error);
      toast({
        title: "Failed to delete hostname",
        description: "There was an error deleting the public hostname.",
        variant: "destructive",
      });
    }
  };
  
  // New function to delete entire tunnel configuration
  const handleDeleteTunnelConfig = async () => {
    try {
      await tunnelsApi.deleteTunnelConfig(tunnelId);
      toast({
        title: "Configuration deleted",
        description: "The tunnel configuration has been deleted successfully.",
      });
      onBack(); // Return to tunnels list
    } catch (error) {
      console.error('Failed to delete tunnel configuration:', error);
      toast({
        title: "Failed to delete configuration",
        description: "There was an error deleting the tunnel configuration.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">{tunnel?.name || 'Tunnel Details'}</h2>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <p>Loading tunnel details...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tunnel details card */}
          <Card>
            <CardHeader>
              <CardTitle>Tunnel Information</CardTitle>
              <CardDescription>Details about this Cloudflare Tunnel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID</p>
                  <p className="text-sm font-mono">{tunnel?.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="text-sm">{tunnel?.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-sm">
                    {tunnel?.created_at && new Date(tunnel.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open(`https://dash.cloudflare.com/tunnels/${tunnel?.id}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" /> View in Cloudflare
              </Button>
            </CardFooter>
          </Card>
          
          {/* Public hostnames card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Public Hostnames</CardTitle>
                <CardDescription>Manage ingress rules for this tunnel</CardDescription>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Hostname
              </Button>
            </CardHeader>
            <CardContent>
              {config ? (
                config.config.ingress.length > 1 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hostname</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Path</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {config.config.ingress.map((ingress, index) => {
                        // Skip the catch-all rule (usually the last one)
                        if (index === config.config.ingress.length - 1 && !ingress.hostname) {
                          return null;
                        }
                        
                        return (
                          <TableRow key={`${ingress.hostname}-${index}`}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <Link2 className="h-4 w-4 mr-2 text-muted-foreground" />
                                {ingress.hostname}
                              </div>
                            </TableCell>
                            <TableCell>{ingress.service}</TableCell>
                            <TableCell>{ingress.path || '/'}</TableCell>
                            <TableCell className="text-right space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setEditIngress(ingress);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Public Hostname</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{ingress.hostname}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteIngress(ingress)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <p>No public hostnames configured for this tunnel.</p>
                    <p className="text-sm mt-2">Click "Add Hostname" to create one.</p>
                  </div>
                )
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>Configuration not available or could not be loaded.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Add Ingress Dialog */}
      <AddIngressDialog 
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddIngress}
        tunnelName={tunnel?.name || ''}
      />
      
      {/* Edit Ingress Dialog */}
      {editIngress && (
        <EditIngressDialog 
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleEditIngress}
          ingress={editIngress}
          tunnelName={tunnel?.name || ''}
        />
      )}
    </div>
  );
};

export default TunnelDetails;
