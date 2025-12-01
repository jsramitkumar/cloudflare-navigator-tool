import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { getApiBaseUrl } from '@/services/apiConfig';

const VersionDisplay: React.FC = () => {
  const [versionInfo, setVersionInfo] = useState({ version: '1.0.0', buildTime: '' });
  const [userIp, setUserIp] = useState<string>('');

  useEffect(() => {
    // Try to fetch version info from version.json
    fetch('/version.json')
      .then(res => res.json())
      .then(data => setVersionInfo(data))
      .catch(() => {
        // Fallback to generated timestamp
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        setVersionInfo({
          version: '1.0.0',
          buildTime: `${month}${day}${year}.${hours}${minutes}`
        });
      });

    // Fetch user IP
    const baseUrl = getApiBaseUrl();
    fetch(`${baseUrl}/my-ip`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUserIp(data.ip);
        }
      })
      .catch(err => console.error('Failed to fetch IP:', err));
  }, []);

  const displayVersion = versionInfo.buildTime || versionInfo.version;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {userIp && (
        <Badge variant="outline" className="text-xs font-mono bg-background/80 backdrop-blur-sm border-primary/20">
          IP: {userIp}
        </Badge>
      )}
      <Badge variant="secondary" className="text-xs font-mono bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
        v{displayVersion}
      </Badge>
    </div>
  );
};

export default VersionDisplay;