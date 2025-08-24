
import React from 'react';
import { CloudflareCredentials } from '@/services/cloudflareApi';
import { Button } from '@/components/ui/button';
import { Check, Edit, Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AccountSelectorProps {
  accounts: CloudflareCredentials[];
  activeAccountId: string | null;
  onSelect: (accountId: string) => void;
  onAddNew?: () => void;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  activeAccountId,
  onSelect,
  onAddNew,
}) => {
  if (accounts.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground mb-4">No Cloudflare accounts configured</p>
        {onAddNew && (
          <Button onClick={onAddNew} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        )}
      </div>
    );
  }

  const activeAccount = accounts.find(account => account.id === activeAccountId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Select
            value={activeAccountId || undefined}
            onValueChange={onSelect}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Cloudflare account" />
            </SelectTrigger>
            <SelectContent className="bg-background border z-50">
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      <span className="font-medium">{account.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {account.accountId.substring(0, 8)}...
                      </span>
                    </div>
                    {account.id === activeAccountId && (
                      <Check className="h-4 w-4 ml-2 text-primary" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {onAddNew && (
          <Button onClick={onAddNew} variant="outline" size="sm" className="ml-2">
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {activeAccount && (
        <div className="text-sm text-muted-foreground">
          <p><strong>Active:</strong> {activeAccount.name}</p>
          <p><strong>Account ID:</strong> {activeAccount.accountId.substring(0, 12)}...</p>
          <p><strong>Zone ID:</strong> {activeAccount.zoneId.substring(0, 12)}...</p>
        </div>
      )}
    </div>
  );
};

export default AccountSelector;
