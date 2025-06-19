
import { useState, useEffect } from 'react';
import { sessionStore, CurrentUser } from '@/stores/sessionStore';

export const useSession = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(
    sessionStore.getCurrentUser()
  );
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    sessionStore.isLoggedIn()
  );

  useEffect(() => {
    const unsubscribe = sessionStore.subscribe((user) => {
      setCurrentUser(user);
      setIsLoggedIn(sessionStore.isLoggedIn());
    });
    return unsubscribe;
  }, []);

  const login = (user: CurrentUser) => {
    sessionStore.setCurrentUser(user);
  };

  const logout = () => {
    console.log('Logout called from useSession');
    sessionStore.clearCurrentUser();
    // Force a page reload to ensure clean state
    window.location.href = '/';
  };

  return {
    currentUser,
    login,
    logout,
    isLoggedIn
  };
};
