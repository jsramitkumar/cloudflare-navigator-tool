
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Network, Settings, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCredentials } from '@/services/cloudflareApi';
import Footer from '@/components/ui/footer';


const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [hasCredentials, setHasCredentials] = useState(false);
  
  useEffect(() => {
    const credentials = getCredentials();
    setHasCredentials(!!credentials);
  }, []);
  
  const cards = [
    {
      title: "DNS Records",
      description: "Manage your domain's DNS records",
      icon: Globe,
      path: "/dns",
      requiresCredentials: true,
    },
    {
      title: "Tunnels",
      description: "Manage Cloudflare Tunnels to expose local services",
      icon: Network,
      path: "/tunnels",
      requiresCredentials: true,
    },
    {
      title: "Settings",
      description: "Configure your Cloudflare API credentials",
      icon: Settings,
      path: "/settings",
      requiresCredentials: false,
    },
  ];
  
  return (
    <div className="container">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Cloudflare&reg; Navigator</h1>
        <p className="text-muted-foreground text-lg">
          Manage your Cloudflare&reg; DNS records and Tunnels
        </p>
      </div>
      
      {!hasCredentials && (
        <Card className="mb-8 border-dashed border-yellow-600/30 bg-yellow-600/10">
          <CardHeader>
            <CardTitle>Set Up Your Cloudflare API Credentials</CardTitle>
            <CardDescription>
              You need to configure your Cloudflare API credentials to get started.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/settings')}>
              Configure Settings
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Card 
            key={card.title} 
            className={card.requiresCredentials && !hasCredentials ? "opacity-50" : ""}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium">{card.title}</CardTitle>
              <card.icon className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{card.description}</p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 hover:gap-2 transition-all"
                onClick={() => navigate(card.path)}
                disabled={card.requiresCredentials && !hasCredentials}
              >
                {card.requiresCredentials && !hasCredentials ? "Credentials Required" : "Manage"}
                {!(card.requiresCredentials && !hasCredentials) && (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
