import React from 'react';
import { Badge } from '@/components/ui/badge';

const VersionDisplay: React.FC = () => {
  // Generate version in MMDDYYYY.HHMM format
  const generateVersion = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${month}${day}${year}.${hours}${minutes}`;
  };

  const version = import.meta.env.VITE_VERSION || generateVersion();
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge variant="secondary" className="text-xs font-mono">
        v{version}
      </Badge>
    </div>
  );
};

export default VersionDisplay;