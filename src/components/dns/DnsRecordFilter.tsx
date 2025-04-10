
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { recordTypes } from './DnsRecordForm';

interface FilterOption {
  value: string;
  label: string;
}

interface DnsRecordFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const DnsRecordFilter: React.FC<DnsRecordFilterProps> = ({
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  onRefresh,
  isLoading,
}) => {
  const filterOptions: FilterOption[] = [
    { value: 'all', label: 'All Records' },
    { value: 'proxied', label: 'Proxied Only' },
    { value: 'unproxied', label: 'Unproxied Only' },
    ...recordTypes.map(type => ({ value: type, label: `${type} Records` }))
  ];

  return (
    <div className="flex justify-between mb-4 gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search records..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select
        value={filter}
        onValueChange={onFilterChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter records" />
        </SelectTrigger>
        <SelectContent>
          {filterOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button 
        variant="outline" 
        onClick={onRefresh}
        disabled={isLoading}
      >
        Refresh
      </Button>
    </div>
  );
};

export default DnsRecordFilter;
