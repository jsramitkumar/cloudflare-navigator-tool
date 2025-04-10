
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DnsRecordForm, { RecordFormValues } from './DnsRecordForm';
import { DnsRecord } from '@/services/cloudflareApi';

interface EditDnsRecordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  record: DnsRecord | null;
  onSubmit: (data: RecordFormValues) => void;
}

const EditDnsRecordDialog: React.FC<EditDnsRecordDialogProps> = ({
  isOpen,
  onOpenChange,
  record,
  onSubmit,
}) => {
  // Only prepare form values if we have a record
  const defaultValues = record ? {
    type: record.type,
    name: record.name,
    content: record.content,
    ttl: record.ttl,
    proxied: record.proxied,
  } : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit DNS Record</DialogTitle>
          <DialogDescription>
            Update this DNS record.
          </DialogDescription>
        </DialogHeader>
        {record && (
          <DnsRecordForm 
            defaultValues={defaultValues} 
            onSubmit={onSubmit} 
            submitButtonText="Update Record" 
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditDnsRecordDialog;
