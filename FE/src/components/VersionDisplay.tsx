import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

const VersionDisplay: React.FC = () => {
  const [versionInfo, setVersionInfo] = useState({ version: '1.0.0', buildTime: '' });

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
  }, []);

  const displayVersion = versionInfo.buildTime || versionInfo.version;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge variant="secondary" className="text-xs font-mono">
        v{displayVersion}
      </Badge>
    </div>
  );
};

export default VersionDisplay;