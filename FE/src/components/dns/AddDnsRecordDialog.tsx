
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import DnsRecordForm, { RecordFormValues } from './DnsRecordForm';

interface AddDnsRecordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RecordFormValues) => void;
}

const AddDnsRecordDialog: React.FC<AddDnsRecordDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
        <DnsRecordForm onSubmit={onSubmit} submitButtonText="Create Record" />
      </DialogContent>
    </Dialog>
  );
};

export default AddDnsRecordDialog;
