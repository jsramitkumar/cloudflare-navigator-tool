
import React from 'react';
import { CloudflareCredentials } from '@/services/cloudflareApi';
import { Button } from '@/components/ui/button';
import { Check, Edit } from 'lucide-react';
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
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  activeAccountId,
  onSelect,
}) => {
  if (accounts.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex-1">
        <Select
          value={activeAccountId || undefined}
          onValueChange={onSelect}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Cloudflare account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{account.name}</span>
                  {account.id === activeAccountId && (
                    <Check className="h-4 w-4 ml-2 text-primary" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default AccountSelector;
