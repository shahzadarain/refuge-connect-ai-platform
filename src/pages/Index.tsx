import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from '@/hooks/useSession';
import Header from '@/components/Header';
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

  const handleFindJobClick = () => {
    setCurrentView('refugee-registration');
  };

  const handleEmployerClick = () => {
    setCurrentView('employer-registration');
  };

  const handleLoginClick = () => {
    setCurrentView('unified-login');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
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
        {/* Hero Section - Mobile First */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="max-w-lg mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-gray mb-4">
              Find Your Next Opportunity in Jordan
            </h1>
            <p className="text-lg text-neutral-gray/80 leading-relaxed mb-8">
              Connecting you with jobs from trusted companies using AI-powered matching.
            </p>
            
            {/* Primary CTA - Find a Job */}
            <button
              onClick={handleFindJobClick}
              className="w-full sm:w-auto bg-un-blue hover:bg-un-blue/90 text-white px-8 py-4 rounded-lg text-lg font-semibold mb-6 transition-colors shadow-lg hover:shadow-xl"
            >
              Find a Job
            </button>
            
            {/* Secondary CTA - Employer */}
            <div className="mb-6">
              <button
                onClick={handleEmployerClick}
                className="text-un-blue hover:text-un-blue/80 font-medium border-b border-un-blue/30 hover:border-un-blue transition-colors"
              >
                I am an Employer
              </button>
            </div>
            
            {/* Login Link */}
            <p className="text-neutral-gray/70">
              Already have an account?{' '}
              <button
                onClick={handleLoginClick}
                className="text-un-blue hover:text-un-blue/80 font-medium underline"
              >
                Log In
              </button>
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-un-blue/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-un-blue" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L9 7V9C9 10.1 9.9 11 11 11V22H13V11C14.1 11 15 10.1 15 9Z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-neutral-gray mb-2">AI-Powered Matching</h3>
              <p className="text-sm text-neutral-gray/70">Smart algorithms connect you with the right opportunities</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-success-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-success-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-neutral-gray mb-2">Trusted Companies</h3>
              <p className="text-sm text-neutral-gray/70">Work with verified employers committed to inclusion</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-warning-orange/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-warning-orange" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-neutral-gray mb-2">Local Support</h3>
              <p className="text-sm text-neutral-gray/70">Dedicated support for refugees in Jordan</p>
            </div>
          </div>
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
