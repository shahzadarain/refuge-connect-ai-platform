
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
    
    // Clear any cached API data
    localStorage.removeItem('api_cache');
    
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

  const refreshToken = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('No token to refresh');
      return false;
    }

    try {
      // Check if token is expired by trying to decode it
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        console.log('Token is expired, logging out');
        logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking token validity:', error);
      logout();
      return false;
    }
  };

  return {
    currentUser,
    login,
    logout,
    updateConsent,
    refreshToken,
    isLoggedIn,
    isLoading,
    needsTokenRefresh: false
  };
};
