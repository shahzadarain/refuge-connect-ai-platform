
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
    sessionStore.clearCurrentUser();
  };

  return {
    currentUser,
    login,
    logout,
    isLoggedIn
  };
};
