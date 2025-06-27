
import { useState, useEffect } from 'react';
import { sessionStore, CurrentUser } from '@/stores/sessionStore';

export const useSession = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log('useSession - Setting up subscription');
    
    const unsubscribe = sessionStore.subscribe((user) => {
      console.log('useSession - Session change received:', user?.email || 'null');
      
      setCurrentUser(user);
      setIsLoggedIn(sessionStore.isLoggedIn());
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (user: CurrentUser) => {
    console.log('useSession - Login called with user:', user.email);
    sessionStore.setCurrentUser(user);
  };

  const logout = () => {
    console.log('useSession - Logout called');
    sessionStore.clearCurrentUser();
    
    // Simple redirect without forcing reload
    setTimeout(() => {
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }, 100);
  };

  const updateConsent = (hasConsented: boolean) => {
    sessionStore.updateUserConsent(hasConsented);
  };

  return {
    currentUser,
    login,
    logout,
    updateConsent,
    isLoggedIn,
    isLoading,
    needsTokenRefresh: false // Simplified - remove complex token refresh logic
  };
};
