import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RefreshCw, Pause, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AutoRefreshToggleProps {
  isEnabled: boolean;
  lastRefresh: Date | null;
  onToggle: () => void;
  onManualRefresh: () => void;
  isLoading?: boolean;
  interval?: number; // in milliseconds
}

export const AutoRefreshToggle: React.FC<AutoRefreshToggleProps> = ({
  isEnabled,
  lastRefresh,
  onToggle,
  onManualRefresh,
  isLoading = false,
  interval = 30000
}) => {
  const formatInterval = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={onManualRefresh}
        disabled={isLoading}
        title="Manual refresh"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
      
      <div className="flex items-center gap-2">
        <Switch
          id="auto-refresh"
          checked={isEnabled}
          onCheckedChange={onToggle}
          disabled={isLoading}
        />
        <Label htmlFor="auto-refresh" className="text-sm">
          <div className="flex items-center gap-1">
            {isEnabled ? (
              <Play className="h-3 w-3 text-green-500" />
            ) : (
              <Pause className="h-3 w-3 text-muted-foreground" />
            )}
            Auto-refresh ({formatInterval(interval)})
          </div>
        </Label>
      </div>
      
      {lastRefresh && (
        <span className="text-xs text-muted-foreground">
          Last: {formatDistanceToNow(lastRefresh, { addSuffix: true })}
        </span>
      )}
    </div>
  );
};