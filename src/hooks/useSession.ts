
import { useState, useEffect } from 'react';
import { sessionStore, CurrentUser } from '@/stores/sessionStore';

export const useSession = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(
    sessionStore.getCurrentUser()
  );

  useEffect(() => {
    const unsubscribe = sessionStore.subscribe(setCurrentUser);
    return unsubscribe;
  }, []);

  const login = (user: CurrentUser) => {
    sessionStore.setCurrentUser(user);
  };

  const logout = () => {
    sessionStore.clearCurrentUser();
  };

  const isLoggedIn = sessionStore.isLoggedIn();

  return {
    currentUser,
    login,
    logout,
    isLoggedIn
  };
};
