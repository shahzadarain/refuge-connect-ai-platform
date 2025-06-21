
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { fetchUserLastLogin } from '@/utils/adminApi';

interface UserLastLoginInfoProps {
  userId: string;
  initialLastLogin?: string;
}

const UserLastLoginInfo: React.FC<UserLastLoginInfoProps> = ({ userId, initialLastLogin }) => {
  const [lastLogin, setLastLogin] = useState<string | undefined>(initialLastLogin);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLastLogin = async () => {
      setIsLoading(true);
      try {
        const data = await fetchUserLastLogin(userId);
        if (data.last_login) {
          setLastLogin(data.last_login);
        }
      } catch (error) {
        console.error('Error fetching last login:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we don't have initial data
    if (!initialLastLogin) {
      fetchLastLogin();
    }
  }, [userId, initialLastLogin]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-neutral-gray/50" />
        <span className="text-body-mobile text-neutral-gray/70">Loading...</span>
      </div>
    );
  }

  return (
    <div>
      <p className="text-small-mobile text-neutral-gray/70">Last Login</p>
      <p className="text-body-mobile">
        {lastLogin ? new Date(lastLogin).toLocaleDateString() : 'Never'}
      </p>
    </div>
  );
};

export default UserLastLoginInfo;
