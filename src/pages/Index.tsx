
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from '@/hooks/useSession';
import Header from '@/components/Header';
import RoleCard from '@/components/RoleCard';
import EmployerRegistration from '@/components/EmployerRegistration';
import RefugeeRegistration from '@/components/RefugeeRegistration';
import SuperAdminDashboard from '@/components/SuperAdminDashboard';
import EmployerAdminDashboard from '@/components/EmployerAdminDashboard';
import RefugeeDashboard from '@/components/RefugeeDashboard';
import JobBoard from '@/components/JobBoard';
import UnifiedLogin from '@/components/UnifiedLogin';
import EmailVerification from '@/components/EmailVerification';

type ViewState = 'landing' | 'employer-registration' | 'refugee-registration' | 'super-admin-dashboard' | 'employer-admin-dashboard' | 'refugee-dashboard' | 'job-board' | 'unified-login' | 'email-verification';

const Index = () => {
  const { t } = useLanguage();
  const { currentUser, isLoggedIn, needsTokenRefresh, logout } = useSession();
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string>('');

  // Check for existing session on mount and when auth state changes
  useEffect(() => {
    console.log('Index component checking session:', { isLoggedIn, currentUser });
    
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
  }, [isLoggedIn, currentUser]); // React to changes in both isLoggedIn AND currentUser

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
  }, []);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole === 'employer') {
      setCurrentView('employer-registration');
    } else if (selectedRole === 'refugee') {
      setCurrentView('refugee-registration');
    } else if (selectedRole === 'login') {
      setCurrentView('unified-login');
    }
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setSelectedRole(null);
    setVerificationEmail('');
  };

  const handleNavigateToJobBoard = () => {
    setCurrentView('job-board');
  };

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

  // Add debug logging for current view
  console.log('Current view state:', currentView);
  console.log('Authentication state:', { isLoggedIn, currentUser: currentUser?.user_type, needsTokenRefresh });

  if (currentView === 'employer-registration') {
    return <EmployerRegistration onBack={handleBackToLanding} />;
  }

  if (currentView === 'refugee-registration') {
    return <RefugeeRegistration onBack={handleBackToLanding} />;
  }

  if (currentView === 'unified-login') {
    return <UnifiedLogin onBack={handleBackToLanding} onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentView === 'super-admin-dashboard') {
    console.log('Rendering SuperAdminDashboard component');
    return <SuperAdminDashboard onBack={handleBackToLanding} />;
  }

  if (currentView === 'employer-admin-dashboard') {
    return <EmployerAdminDashboard />;
  }

  if (currentView === 'refugee-dashboard') {
    return <RefugeeDashboard />;
  }

  if (currentView === 'job-board') {
    return <JobBoard />;
  }

  if (currentView === 'email-verification') {
    return (
      <EmailVerification 
        onBack={handleBackToLanding} 
        onVerificationSuccess={handleVerificationSuccess}
        email={verificationEmail}
      />
    );
  }

  return (
    <div className="min-h-screen bg-light-gray">
      <Header />
      
      {/* Token Refresh Warning Banner */}
      {needsTokenRefresh && currentUser && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-yellow-800 text-sm font-bold">!</span>
                </div>
                <div>
                  <p className="text-yellow-800 font-medium">
                    Your session needs to be updated to access all features.
                  </p>
                  <p className="text-yellow-700 text-sm">
                    Please log out and log in again to refresh your permissions.
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Log Out Now
              </button>
            </div>
          </div>
        </div>
      )}
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-h1-mobile font-bold text-neutral-gray mb-4">
              {t('landing.welcome')}
            </h1>
            <p className="text-body-mobile text-neutral-gray/80 leading-relaxed">
              {t('landing.description')}
            </p>
          </div>
        </div>

        {/* Role Selection */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-h2-mobile font-semibold text-neutral-gray text-center mb-6">
            {t('landing.select_role')}
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {/* Employer Role */}
            <RoleCard
              role="employer"
              icon={
                <svg className="w-8 h-8 text-un-blue" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
                </svg>
              }
              onClick={() => handleRoleSelect('employer')}
              selected={selectedRole === 'employer'}
            />

            {/* Refugee Role */}
            <RoleCard
              role="refugee"
              icon={
                <svg className="w-8 h-8 text-un-blue" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              }
              onClick={() => handleRoleSelect('refugee')}
              selected={selectedRole === 'refugee'}
            />

            {/* Login Option */}
            <RoleCard
              role="admin"
              icon={
                <svg className="w-8 h-8 text-un-blue" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L9 7V9C9 10.1 9.9 11 11 11V22H13V11C14.1 11 15 10.1 15 9Z"/>
                </svg>
              }
              onClick={() => handleRoleSelect('login')}
              selected={selectedRole === 'login'}
            />
          </div>

          {/* Continue Button */}
          {selectedRole && (
            <div className="text-center animate-fade-in">
              <button
                onClick={handleContinue}
                className="btn-primary w-full max-w-md mx-auto"
              >
                {selectedRole === 'login' ? 'Login to Account' : t('landing.continue')}
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <footer className="mt-16 pt-8 border-t border-border">
          <div className="text-center">
            <p className="text-small-mobile text-neutral-gray/70">
              Powered by UN Refugee Connect Platform
            </p>
            <div className="flex justify-center items-center space-x-4 mt-4">
              <div className="w-6 h-6 bg-un-blue rounded-full"></div>
              <span className="text-small-mobile text-neutral-gray/70">
                Trusted by humanitarian organizations worldwide
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
