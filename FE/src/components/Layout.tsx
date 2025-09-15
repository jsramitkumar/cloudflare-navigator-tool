
import React from 'react';
import Sidebar from './Sidebar';
import VersionDisplay from './VersionDisplay';
import UserCounter from './UserCounter';

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
      <UserCounter />
      <VersionDisplay />
    </div>
  );
};

export default Layout;
