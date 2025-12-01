import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getApiBaseUrl } from '@/services/apiConfig';

const UserCounter: React.FC = () => {
  const [userCount, setUserCount] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Generate a unique session ID for this user
    const sessionId = Date.now() + Math.random().toString(36).substr(2, 9);
    const baseUrl = getApiBaseUrl();

    // Function to update user presence
    const updatePresence = async () => {
      try {
        const response = await fetch(`${baseUrl}/users/presence`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId })
        });

        if (response.ok) {
          const data = await response.json();
          setUserCount(data.activeUsers || 0);
          setIsOnline(true);
        }
      } catch (error) {
        console.error('Failed to update presence:', error);
        setIsOnline(false);
      }
    };

    // Function to get current user count
    const getUserCount = async () => {
      try {
        const response = await fetch(`${baseUrl}/users/count`);
        if (response.ok) {
          const data = await response.json();
          setUserCount(data.activeUsers || 0);
          setIsOnline(true);
        }
      } catch (error) {
        console.error('Failed to get user count:', error);
        setIsOnline(false);
      }
    };

    // Initial presence update
    updatePresence();

    // Update presence every 30 seconds
    const presenceInterval = setInterval(updatePresence, 30000);

    // Get user count every 10 seconds
    const countInterval = setInterval(getUserCount, 10000);

    // Cleanup on unmount
    return () => {
      clearInterval(presenceInterval);
      clearInterval(countInterval);

      // Send offline status
      fetch(`${baseUrl}/users/presence`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId })
      }).catch(() => { });
    };
  }, []);

  return (
    <div className="fixed bottom-16 right-4 z-50">
      <Badge
        variant={isOnline ? "default" : "secondary"}
        className="flex items-center gap-2 px-3 py-1 bg-background/80 backdrop-blur-sm border"
      >
        <Users className="h-4 w-4" />
        <span className="text-sm font-medium">
          {userCount} {userCount === 1 ? 'user' : 'users'} online
        </span>
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
      </Badge>
    </div>
  );
};

export default UserCounter;