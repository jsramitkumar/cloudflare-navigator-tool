
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit2, EyeOff, Eye, Trash2 } from 'lucide-react';
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
import { DnsRecord } from '@/services/cloudflareApi';
import { DnsCleanupService } from '@/services/dnsCleanupService';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

interface DnsRecordListProps {
  records: DnsRecord[];
  isLoading: boolean;
  onEdit: (record: DnsRecord) => void;
  onDelete: (id: string) => void;
}

const DnsRecordList: React.FC<DnsRecordListProps> = ({ 
  records, 
  isLoading,
  onEdit,
  onDelete
}) => {
  // Helper function to check if a DNS record is managed by a tunnel
  const isTunnelManaged = (record: DnsRecord): boolean => {
    return record.type === 'CNAME' && record.content.endsWith('.cfargotunnel.com');
  };
  return (
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
          ) : records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10">
                No records found
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => {
              const tunnelManaged = isTunnelManaged(record);
              
              return (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.type}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {record.name}
                      {tunnelManaged && (
                        <Badge variant="secondary" className="text-xs">
                          Tunnel Managed
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{record.content}</TableCell>
                  <TableCell>{record.ttl === 1 ? 'Auto' : record.ttl}</TableCell>
                  <TableCell>
                    {record.proxied ? 
                      <Eye className="h-4 w-4 text-primary" /> : 
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    {tunnelManaged ? (
                      <span className="text-xs text-muted-foreground italic">
                        Manage from Tunnels section
                      </span>
                    ) : (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onEdit(record)}
                        >
                          <Edit2 className="h-4 w-4" />
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
                              <AlertDialogAction onClick={async () => {
                                try {
                                  const result = await DnsCleanupService.safeDeleteDnsRecord(record.id);
                                  if (result.success) {
                                    if (result.warnings.length > 0) {
                                      result.warnings.forEach(warning => {
                                        toast({
                                          title: "Warning",
                                          description: warning,
                                          variant: "destructive",
                                        });
                                      });
                                    }
                                    onDelete(record.id);
                                    toast({
                                      title: "DNS Record Deleted",
                                      description: `${record.type} record "${record.name}" has been deleted successfully.`,
                                    });
                                  } else {
                                    toast({
                                      title: "Failed to delete record",
                                      description: "There was an error deleting the DNS record.",
                                      variant: "destructive",
                                    });
                                  }
                                } catch (error) {
                                  console.error('Delete error:', error);
                                  toast({
                                    title: "Failed to delete record",
                                    description: "There was an error deleting the DNS record.",
                                    variant: "destructive",
                                  });
                                }
                              }}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DnsRecordList;
