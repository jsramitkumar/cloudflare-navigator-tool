
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TunnelIngressForm from './TunnelIngressForm';
import { TunnelIngress } from '@/services/cloudflareApi';

interface EditIngressDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  ingress: TunnelIngress;
  tunnelName: string;
}

const EditIngressDialog: React.FC<EditIngressDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  ingress,
  tunnelName,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Public Hostname</DialogTitle>
          <DialogDescription>
            Update public hostname configuration for tunnel "{tunnelName}".
          </DialogDescription>
        </DialogHeader>
        <TunnelIngressForm 
          initialValues={ingress}
          onSubmit={onSubmit} 
          submitButtonText="Update Hostname" 
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditIngressDialog;
