
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TunnelIngressForm from './TunnelIngressForm';

interface AddIngressDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  tunnelName: string;
}

const AddIngressDialog: React.FC<AddIngressDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  tunnelName,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Public Hostname</DialogTitle>
          <DialogDescription>
            Create a new public hostname for tunnel "{tunnelName}".
          </DialogDescription>
        </DialogHeader>
        <TunnelIngressForm 
          onSubmit={onSubmit} 
          submitButtonText="Add Hostname" 
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddIngressDialog;
