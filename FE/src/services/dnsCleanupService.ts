import { dnsRecordsApi, tunnelsApi, CloudflareTunnel, DnsRecord } from './cloudflareApi';
import { toast } from '@/components/ui/use-toast';

/**
 * Service to handle DNS record cleanup and synchronization with tunnel configurations
 */
export class DnsCleanupService {
  
  /**
   * Find DNS records that are orphaned (CNAME records pointing to tunnels that no longer exist)
   */
  static async findOrphanedDnsRecords(): Promise<DnsRecord[]> {
    try {
      const [dnsRecords, tunnels] = await Promise.all([
        dnsRecordsApi.listRecords(),
        tunnelsApi.listTunnels()
      ]);

      // Get all active tunnel IDs
      const activeTunnelIds = new Set(tunnels.map(tunnel => tunnel.id));

      // Find CNAME records that point to cfargotunnel.com but reference non-existent tunnels
      const orphanedRecords = dnsRecords.filter(record => {
        if (record.type !== 'CNAME' || !record.content.includes('.cfargotunnel.com')) {
          return false;
        }

        // Extract tunnel ID from content (format: {tunnel-id}.cfargotunnel.com)
        const tunnelId = record.content.split('.cfargotunnel.com')[0];
        return !activeTunnelIds.has(tunnelId);
      });

      return orphanedRecords;
    } catch (error) {
      console.error('Failed to find orphaned DNS records:', error);
      return [];
    }
  }

  /**
   * Clean up orphaned DNS records
   */
  static async cleanupOrphanedDnsRecords(): Promise<{ cleaned: number; errors: number }> {
    const orphanedRecords = await this.findOrphanedDnsRecords();
    let cleaned = 0;
    let errors = 0;

    for (const record of orphanedRecords) {
      try {
        await dnsRecordsApi.deleteRecord(record.id);
        cleaned++;
      } catch (error) {
        console.error(`Failed to delete orphaned DNS record ${record.name}:`, error);
        errors++;
      }
    }

    if (cleaned > 0) {
      toast({
        title: "DNS cleanup completed",
        description: `Cleaned up ${cleaned} orphaned DNS records.`,
      });
    }

    if (errors > 0) {
      toast({
        title: "DNS cleanup warnings",
        description: `${errors} orphaned records could not be deleted.`,
        variant: "destructive",
      });
    }

    return { cleaned, errors };
  }

  /**
   * Find tunnel ingress rules that reference non-existent DNS records
   */
  static async findOrphanedIngressRules(): Promise<{ tunnel: CloudflareTunnel; orphanedHostnames: string[] }[]> {
    try {
      const [dnsRecords, tunnels] = await Promise.all([
        dnsRecordsApi.listRecords(),
        tunnelsApi.listTunnels()
      ]);

      // Create a map of existing DNS record names for reference
      const dnsRecordSet = new Set(dnsRecords.map(record => record.name));

      const orphanedResults: { tunnel: CloudflareTunnel; orphanedHostnames: string[] }[] = [];

      for (const tunnel of tunnels) {
        try {
          const config = await tunnelsApi.getTunnelConfig(tunnel.id);
          const orphanedHostnames: string[] = [];

          for (const ingress of config.config.ingress) {
            if (!ingress.hostname) continue; // Skip catch-all rules

            // Extract the subdomain part from the hostname
            const hostnameParts = ingress.hostname.split('.');
            const subdomainPart = hostnameParts[0];

            // Check if there's a corresponding DNS record
            const hasMatchingDnsRecord = dnsRecords.some(record => 
              record.type === 'CNAME' && 
              (record.name === subdomainPart || record.name === ingress.hostname) &&
              record.content.includes(tunnel.id)
            );

            if (!hasMatchingDnsRecord) {
              orphanedHostnames.push(ingress.hostname);
            }
          }

          if (orphanedHostnames.length > 0) {
            orphanedResults.push({ tunnel, orphanedHostnames });
          }
        } catch (error) {
          console.error(`Failed to check tunnel ${tunnel.name} config:`, error);
        }
      }

      return orphanedResults;
    } catch (error) {
      console.error('Failed to find orphaned ingress rules:', error);
      return [];
    }
  }

  /**
   * Safely delete a DNS record and check for dependent tunnel ingress rules
   */
  static async safeDeleteDnsRecord(recordId: string): Promise<{ success: boolean; warnings: string[] }> {
    const warnings: string[] = [];

    try {
      // First, get the record details
      const record = await dnsRecordsApi.getRecord(recordId);
      
      // If it's a CNAME record pointing to a tunnel, check for dependent ingress rules
      if (record.type === 'CNAME' && record.content.includes('.cfargotunnel.com')) {
        const tunnelId = record.content.split('.cfargotunnel.com')[0];
        
        try {
          const tunnels = await tunnelsApi.listTunnels();
          const tunnel = tunnels.find(t => t.id === tunnelId);
          
          if (tunnel) {
            const config = await tunnelsApi.getTunnelConfig(tunnel.id);
            const dependentIngress = config.config.ingress.filter(ingress => {
              if (!ingress.hostname) return false;
              const subdomainPart = ingress.hostname.split('.')[0];
              return subdomainPart === record.name || ingress.hostname === record.name;
            });

            if (dependentIngress.length > 0) {
              warnings.push(`This DNS record is used by ${dependentIngress.length} tunnel ingress rule(s) in tunnel "${tunnel.name}". You may need to update the tunnel configuration.`);
            }
          }
        } catch (error) {
          console.error('Failed to check tunnel dependencies:', error);
        }
      }

      // Delete the DNS record
      await dnsRecordsApi.deleteRecord(recordId);
      return { success: true, warnings };
    } catch (error) {
      console.error('Failed to delete DNS record:', error);
      return { success: false, warnings: [`Failed to delete DNS record: ${error}`] };
    }
  }

  /**
   * Perform a comprehensive cleanup of both DNS records and tunnel configurations
   */
  static async performFullCleanup(): Promise<void> {
    toast({
      title: "Starting cleanup",
      description: "Checking for orphaned DNS records and tunnel configurations...",
    });

    const [dnsCleanup, orphanedIngress] = await Promise.all([
      this.cleanupOrphanedDnsRecords(),
      this.findOrphanedIngressRules()
    ]);

    let totalIssues = dnsCleanup.cleaned + orphanedIngress.length;

    if (orphanedIngress.length > 0) {
      const hostnames = orphanedIngress.flatMap(result => result.orphanedHostnames);
      toast({
        title: "Tunnel configuration issues found",
        description: `Found ${hostnames.length} tunnel hostnames without corresponding DNS records across ${orphanedIngress.length} tunnels.`,
        variant: "destructive",
      });
    }

    if (totalIssues === 0) {
      toast({
        title: "No issues found",
        description: "Your DNS records and tunnel configurations are in sync.",
      });
    }
  }
}