
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
import { Edit, EyeOff, Eye, Trash2 } from 'lucide-react';
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
            records.map((record) => (
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
  );
};

export default DnsRecordList;
