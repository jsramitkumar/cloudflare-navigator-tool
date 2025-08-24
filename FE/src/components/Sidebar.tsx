
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Globe, 
  Network, 
  Settings, 
  LogOut,
  Users,
  Cloud
} from 'lucide-react';
import { 
  getActiveAccount, 
  CloudflareCredentials 
} from '@/services/cloudflareApi';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [activeAccount, setActiveAccount] = useState<CloudflareCredentials | null>(null);
  
  // Function to update active account
  const updateActiveAccount = () => {
    const account = getActiveAccount();
    setActiveAccount(account);
  };
  
  useEffect(() => {
    // Update active account on mount and location changes
    updateActiveAccount();
  }, [location.pathname]);
  
  useEffect(() => {
    // Listen for storage events to update when account switches
    const handleStorageChange = () => {
      updateActiveAccount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for account switching within the same tab
    const handleAccountSwitch = () => {
      updateActiveAccount();
    };
    
    window.addEventListener('accountSwitch', handleAccountSwitch);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('accountSwitch', handleAccountSwitch);
    };
  }, []);
  
  const hasCredentials = !!activeAccount;
  
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/', disabled: false },
    { icon: Globe, label: 'DNS Records', path: '/dns', disabled: !hasCredentials },
    { icon: Network, label: 'Tunnels', path: '/tunnels', disabled: !hasCredentials },
    { icon: Settings, label: 'Settings', path: '/settings', disabled: false },
  ];
  
  return (
    <div className="w-64 h-full bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Cloud className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold">Cloudflare DNS Manager</h1>
        </div>
        <ThemeSwitcher />
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.disabled ? '#' : item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  location.pathname === item.path 
                    ? "bg-primary/20 text-primary" 
                    : "hover:bg-secondary/80",
                  item.disabled && "opacity-50 pointer-events-none"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-border">
        {activeAccount ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm truncate" title={activeAccount.name}>
                  {activeAccount.name}
                </span>
              </div>
              <Link 
                to="/settings" 
                className="text-xs text-primary hover:underline"
              >
                Switch
              </Link>
            </div>
            <div className="text-xs text-muted-foreground truncate" title={activeAccount.accountId}>
              Account: {activeAccount.accountId.substring(0, 8)}...
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              No account connected
            </span>
            <Link 
              to="/settings" 
              className="text-sm text-primary hover:underline"
            >
              Connect
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
