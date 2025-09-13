import React from 'react';
import { Badge } from '@/components/ui/badge';

const VersionDisplay: React.FC = () => {
  // Get version from environment variables injected at build time
  const version = import.meta.env.VITE_VERSION || 'dev';
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge variant="secondary" className="text-xs font-mono">
        v{version}
      </Badge>
    </div>
  );
};

export default VersionDisplay;