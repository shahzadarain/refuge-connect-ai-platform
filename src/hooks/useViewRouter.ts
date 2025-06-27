import { useState, useEffect } from 'react';
import { useSession } from '@/hooks/useSession';

type ViewState = 'landing' | 'employer-registration' | 'refugee-registration' | 'super-admin-dashboard' | 'employer-admin-dashboard' | 'refugee-dashboard' | 'job-board' | 'unified-login' | 'email-verification' | 'unhcr-validation';

export const useViewRouter = () => {
  const { currentUser, isLoggedIn, isLoading } = useSession();
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [verificationEmail, setVerificationEmail] = useState<string>('');

  // Check for existing session on mount and when auth state changes
  useEffect(() => {
    // Don't redirect while session is still loading
    if (isLoading) {
      console.log('ViewRouter - Session still loading, waiting...');
      return;
    }

    console.log('ViewRouter - Checking session:', { isLoggedIn, currentUser: currentUser?.user_type });
    
    if (isLoggedIn && currentUser && currentUser.id) {
      console.log('ViewRouter - User authenticated, routing based on type:', currentUser.user_type);
      
      switch (currentUser.user_type) {
        case 'super_admin':
          console.log('ViewRouter - Routing super admin to dashboard');
          setCurrentView('super-admin-dashboard');
          break;
        case 'employer_admin':
        case 'company_user':
          console.log('ViewRouter - Routing company user to dashboard');
          setCurrentView('employer-admin-dashboard');
          break;
        case 'refugee':
          console.log('ViewRouter - Routing refugee to dashboard');
          setCurrentView('refugee-dashboard');
          break;
        default:
          console.log('ViewRouter - Unknown user type, staying on landing');
          setCurrentView('landing');
      }
    } else {
      console.log('ViewRouter - User not authenticated, checking if should redirect to landing');
      // Only redirect to landing if currently on a dashboard view
      if (currentView.includes('dashboard')) {
        console.log('ViewRouter - Redirecting from dashboard to landing');
        setCurrentView('landing');
      }
    }
  }, [isLoggedIn, currentUser, isLoading]);

  // Check for email verification links on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const action = urlParams.get('action');
    
    console.log('ViewRouter - URL params check:', { email, action });
    
    if (email && action === 'verify') {
      console.log('ViewRouter - Email verification link detected');
      setVerificationEmail(email);
      setCurrentView('email-verification');
      window.history.replaceState({}, document.title, '/');
    }
    
    if (email && action === 'unhcr-validate') {
      console.log('ViewRouter - UNHCR validation link detected');
      setVerificationEmail(email);
      setCurrentView('unhcr-validation');
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  const handleLoginSuccess = (userType: string) => {
    console.log('ViewRouter - Login success, routing user type:', userType);
    
    switch (userType) {
      case 'super_admin':
        setCurrentView('super-admin-dashboard');
        break;
      case 'employer_admin':
      case 'company_user':
        setCurrentView('employer-admin-dashboard');
        break;
      case 'refugee':
        setCurrentView('refugee-dashboard');
        break;
      default:
        console.log('ViewRouter - Unknown user type after login, staying on landing');
        setCurrentView('landing');
    }
  };

  const handleVerificationSuccess = () => {
    window.location.href = `/company-setup?email=${verificationEmail}&action=setup`;
  };

  const handleUNHCRValidationSuccess = () => {
    setCurrentView('unified-login');
    setVerificationEmail('');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setVerificationEmail('');
  };

  const handleUNHCRValidationRequest = (email: string) => {
    setVerificationEmail(email);
    setCurrentView('unhcr-validation');
  };

  return {
    currentView,
    setCurrentView,
    verificationEmail,
    handleLoginSuccess,
    handleVerificationSuccess,
    handleUNHCRValidationSuccess,
    handleBackToLanding,
    handleUNHCRValidationRequest
  };
};
