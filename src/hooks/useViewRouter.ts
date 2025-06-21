
import { useState, useEffect } from 'react';
import { useSession } from '@/hooks/useSession';

type ViewState = 'landing' | 'employer-registration' | 'refugee-registration' | 'super-admin-dashboard' | 'employer-admin-dashboard' | 'refugee-dashboard' | 'job-board' | 'unified-login' | 'email-verification' | 'unhcr-validation';

export const useViewRouter = () => {
  const { currentUser, isLoggedIn } = useSession();
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [verificationEmail, setVerificationEmail] = useState<string>('');

  // Check for existing session on mount and when auth state changes
  useEffect(() => {
    console.log('ViewRouter checking session:', { isLoggedIn, currentUser });
    
    // Only redirect if we have both a logged in user AND a current user object
    if (isLoggedIn && currentUser && currentUser.id) {
      console.log('User is authenticated, routing based on user type:', currentUser.user_type);
      
      // Route users based on their type
      switch (currentUser.user_type) {
        case 'super_admin':
          console.log('Routing super admin to dashboard');
          setCurrentView('super-admin-dashboard');
          break;
        case 'employer_admin':
        case 'company_user': // Both employer_admin and company_user go to the same dashboard
          console.log('Routing company user to dashboard');
          setCurrentView('employer-admin-dashboard');
          break;
        case 'refugee':
          console.log('Routing refugee to dashboard');
          setCurrentView('refugee-dashboard');
          break;
        default:
          console.log('Unknown user type or no user type, staying on landing:', currentUser.user_type);
          setCurrentView('landing');
      }
    } else {
      console.log('User not authenticated or no user data, staying on landing');
      // Only set to landing if we're currently on a dashboard view
      if (currentView.includes('dashboard')) {
        setCurrentView('landing');
      }
    }
  }, [isLoggedIn, currentUser]);

  // Check for email verification links on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const action = urlParams.get('action');
    
    console.log('URL params - email:', email, 'action:', action);
    
    // Handle email verification
    if (email && action === 'verify') {
      console.log('Email verification link detected for:', email);
      setVerificationEmail(email);
      setCurrentView('email-verification');
      // Clean up URL
      window.history.replaceState({}, document.title, '/');
    }
    
    // Handle UNHCR validation
    if (email && action === 'unhcr-validate') {
      console.log('UNHCR validation link detected for:', email);
      setVerificationEmail(email);
      setCurrentView('unhcr-validation');
      // Clean up URL
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  const handleLoginSuccess = (userType: string) => {
    console.log('Login success callback triggered with userType:', userType);
    // Route users to their appropriate dashboard after login
    switch (userType) {
      case 'super_admin':
        console.log('Setting view to super-admin-dashboard');
        setCurrentView('super-admin-dashboard');
        break;
      case 'employer_admin':
      case 'company_user': // Both employer_admin and company_user go to the same dashboard
        console.log('Setting view to employer-admin-dashboard');
        setCurrentView('employer-admin-dashboard');
        break;
      case 'refugee':
        console.log('Setting view to refugee-dashboard');
        setCurrentView('refugee-dashboard');
        break;
      default:
        console.log('Unknown user type, staying on landing');
        setCurrentView('landing');
    }
  };

  const handleVerificationSuccess = () => {
    // After email verification, user should be redirected to company activation page
    window.location.href = `/company-setup?email=${verificationEmail}&action=setup`;
  };

  const handleUNHCRValidationSuccess = () => {
    // After UNHCR validation, redirect to login
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
