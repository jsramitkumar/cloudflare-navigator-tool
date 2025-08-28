
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { dnsRecordsApi, DnsRecord, getCredentials, getActiveAccountId } from '@/services/cloudflareApi';
import AddDnsRecordDialog from '@/components/dns/AddDnsRecordDialog';
import EditDnsRecordDialog from '@/components/dns/EditDnsRecordDialog';
import DnsRecordList from '@/components/dns/DnsRecordList';
import DnsRecordFilter from '@/components/dns/DnsRecordFilter';
import { RecordFormValues } from '@/components/dns/DnsRecordForm';
import { DnsCleanupService } from '@/services/dnsCleanupService';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { AutoRefreshToggle } from '@/components/ui/auto-refresh-toggle';

const DnsRecords: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<DnsRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DnsRecord | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  
  // Initialize active account ID and listen for changes
  useEffect(() => {
    const currentAccountId = getActiveAccountId();
    setActiveAccountId(currentAccountId);
    
    // Listen for account changes (custom event or window focus)
    const handleAccountChange = () => {
      const newAccountId = getActiveAccountId();
      if (newAccountId !== activeAccountId) {
        setActiveAccountId(newAccountId);
      }
    };
    
    // Listen for window focus (in case account was changed in another tab)
    window.addEventListener('focus', handleAccountChange);
    
    // Listen for custom account change events
    window.addEventListener('accountChanged', handleAccountChange);
    
    return () => {
      window.removeEventListener('focus', handleAccountChange);
      window.removeEventListener('accountChanged', handleAccountChange);
    };
  }, [activeAccountId]);
  
  // Load records when active account changes
  useEffect(() => {
    if (!activeAccountId) return;
    
    const credentials = getCredentials();
    if (!credentials) {
      toast({
        title: "No credentials found",
        description: "Please set your Cloudflare API credentials first.",
        variant: "destructive",
      });
      navigate('/settings');
      return;
    }
    
    // Clear previous records and fetch new ones
    setRecords([]);
    fetchRecords();
  }, [activeAccountId, navigate]);

  const fetchRecords = async () => {
    if (!activeAccountId) return; // Don't fetch if no active account
    
    setIsLoading(true);
    try {
      const data = await dnsRecordsApi.listRecords();
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch DNS records:', error);
      toast({
        title: "Failed to load records",
        description: "There was an error loading your DNS records.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh functionality
  const autoRefresh = useAutoRefresh({
    interval: 30000, // 30 seconds
    enabled: false, // Start disabled
    onRefresh: fetchRecords
  });
  
  const onSubmit = async (data: RecordFormValues) => {
    try {
      await dnsRecordsApi.createRecord({
        type: data.type,
        name: data.name,
        content: data.content,
        ttl: data.ttl,
        proxied: data.proxied
      });
      
      await fetchRecords();
      setIsAddDialogOpen(false);
      toast({
        title: "Record created",
        description: `${data.type} record "${data.name}" has been created.`,
      });
    } catch (error) {
      console.error('Failed to create DNS record:', error);
      toast({
        title: "Failed to create record",
        description: "There was an error creating your DNS record.",
        variant: "destructive",
      });
    }
  };
  
  const onEdit = (record: DnsRecord) => {
    setEditingRecord(record);
    setIsEditDialogOpen(true);
  };
  
  const onEditSubmit = async (data: RecordFormValues) => {
    if (!editingRecord) return;
    
    try {
      await dnsRecordsApi.updateRecord(editingRecord.id, {
        type: data.type,
        name: data.name,
        content: data.content,
        ttl: data.ttl,
        proxied: data.proxied
      });
      
      await fetchRecords();
      setIsEditDialogOpen(false);
      toast({
        title: "Record updated",
        description: `${data.type} record "${data.name}" has been updated.`,
      });
    } catch (error) {
      console.error('Failed to update DNS record:', error);
      toast({
        title: "Failed to update record",
        description: "There was an error updating your DNS record.",
        variant: "destructive",
      });
    }
  };
  
  const onDelete = async (id: string) => {
    try {
      await dnsRecordsApi.deleteRecord(id);
      setRecords(records.filter(record => record.id !== id));
      toast({
        title: "Record deleted",
        description: "The DNS record has been deleted.",
      });
    } catch (error) {
      console.error('Failed to delete DNS record:', error);
      toast({
        title: "Failed to delete record",
        description: "There was an error deleting your DNS record.",
        variant: "destructive",
      });
    }
  };
  
  // Filter and search records
  const filteredRecords = records.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.content.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = filter === 'all' || 
      (filter === 'proxied' && record.proxied) ||
      (filter === 'unproxied' && !record.proxied) ||
      filter === record.type;
      
    return matchesSearch && matchesFilter;
  });
  
  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">DNS Records</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => DnsCleanupService.performFullCleanup()}
            title="Clean up orphaned DNS records and check tunnel synchronization"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Cleanup
          </Button>
          <AddDnsRecordDialog 
            isOpen={isAddDialogOpen} 
            onOpenChange={setIsAddDialogOpen} 
            onSubmit={onSubmit} 
          />
        </div>
      </div>
      
      <DnsRecordFilter 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filter={filter}
        onFilterChange={setFilter}
        onRefresh={autoRefresh.manualRefresh}
        isLoading={isLoading}
      />

      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-muted-foreground">
          {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''} found
        </span>
        <AutoRefreshToggle
          isEnabled={autoRefresh.isEnabled}
          lastRefresh={autoRefresh.lastRefresh}
          onToggle={autoRefresh.toggleAutoRefresh}
          onManualRefresh={autoRefresh.manualRefresh}
          isLoading={isLoading}
          interval={30000}
        />
      </div>
      
      <DnsRecordList 
        records={filteredRecords}
        isLoading={isLoading}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      
      <EditDnsRecordDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        record={editingRecord}
        onSubmit={onEditSubmit}
      />
    </div>
  );
};

export default DnsRecords;
