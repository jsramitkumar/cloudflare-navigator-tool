
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-border py-6 bg-card/50 fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full">
      <div className="max-w-4xl mx-auto px-5 text-center text-sm text-muted-foreground">
        <p>Cloudflare DNS Manager &copy; 2025. For UAT Purpose only, PLEASE DO NOT USE IN PRODUCTION</p>
        <p className="mt-1">Running on mini K3S Cluster on RPi4.</p>
      </div>
    </footer>
  );
};

export default Footer;
