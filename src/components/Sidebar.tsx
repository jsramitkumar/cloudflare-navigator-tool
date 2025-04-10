
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Globe, 
  Network, 
  Settings, 
  LogOut,
  Shield
} from 'lucide-react';
import { getCredentials } from '@/services/cloudflareApi';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const hasCredentials = !!getCredentials();
  
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/', disabled: false },
    { icon: Globe, label: 'DNS Records', path: '/dns', disabled: !hasCredentials },
    { icon: Network, label: 'Tunnels', path: '/tunnels', disabled: !hasCredentials },
    { icon: Settings, label: 'Settings', path: '/settings', disabled: false },
  ];
  
  return (
    <div className="w-64 h-full bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-cloudflare-blue" />
          <h1 className="text-lg font-bold">Cloudflare Navigator</h1>
        </div>
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
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {hasCredentials ? 'Connected' : 'Not connected'}
          </span>
          {hasCredentials && (
            <Link 
              to="/settings" 
              className="flex items-center text-sm text-destructive hover:underline"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Disconnect
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
