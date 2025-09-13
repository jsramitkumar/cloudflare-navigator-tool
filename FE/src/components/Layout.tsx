
import React from 'react';
import Sidebar from './Sidebar';
import VersionDisplay from './VersionDisplay';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
      <VersionDisplay />
    </div>
  );
};

export default Layout;
