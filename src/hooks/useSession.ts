
import { useState, useEffect } from 'react';
import { sessionStore, CurrentUser } from '@/stores/sessionStore';

export const useSession = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(
    sessionStore.getCurrentUser()
  );
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    sessionStore.isLoggedIn()
  );
  const [needsTokenRefresh, setNeedsTokenRefresh] = useState<boolean>(
    sessionStore.needsTokenRefresh()
  );

  useEffect(() => {
    const unsubscribe = sessionStore.subscribe((user) => {
      console.log('Session state change - user:', user);
      setCurrentUser(user);
      
      // Immediately update isLoggedIn based on user presence
      const loggedIn = !!user && !!user.id;
      console.log('Setting isLoggedIn to:', loggedIn);
      setIsLoggedIn(loggedIn);
      
      // Check if token refresh is needed
      setNeedsTokenRefresh(sessionStore.needsTokenRefresh());
    });
    return unsubscribe;
  }, []);

  const login = (user: CurrentUser) => {
    console.log('Login called with user:', user);
    sessionStore.setCurrentUser(user);
    // Force immediate state update
    setCurrentUser(user);
    setIsLoggedIn(true);
    setNeedsTokenRefresh(sessionStore.needsTokenRefresh());
  };

  const logout = () => {
    console.log('Logout called from useSession');
    sessionStore.clearCurrentUser();
    // Force immediate state update
    setCurrentUser(null);
    setIsLoggedIn(false);
    setNeedsTokenRefresh(false);
    // Force a page reload to ensure clean state
    window.location.href = '/';
  };

  return {
    currentUser,
    login,
    logout,
    isLoggedIn,
    needsTokenRefresh
  };
};
