import { useState, useEffect, useCallback, useRef } from 'react';

export interface AutoRefreshOptions {
  interval?: number; // in milliseconds
  enabled?: boolean;
  onRefresh?: () => Promise<void> | void;
}

export const useAutoRefresh = ({
  interval = 30000, // 30 seconds default
  enabled = false,
  onRefresh
}: AutoRefreshOptions) => {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!onRefresh || isRefreshingRef.current) return;
    
    isRefreshingRef.current = true;
    try {
      await onRefresh();
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Auto-refresh failed:', error);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [onRefresh]);

  const toggleAutoRefresh = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  const setAutoRefreshEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
  }, []);

  // Setup/cleanup interval
  useEffect(() => {
    if (isEnabled && onRefresh) {
      intervalRef.current = setInterval(refresh, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isEnabled, interval, refresh, onRefresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isEnabled,
    lastRefresh,
    toggleAutoRefresh,
    setAutoRefreshEnabled,
    manualRefresh: refresh
  };
};