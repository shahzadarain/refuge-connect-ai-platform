
import React from 'react';
import { useSession } from '@/hooks/useSession';
import { useViewRouter } from '@/hooks/useViewRouter';
import Header from '@/components/Header';
import TokenRefreshBanner from '@/components/landing/TokenRefreshBanner';
import LandingHero from '@/components/landing/LandingHero';
import EmployerRegistration from '@/components/EmployerRegistration';
import RefugeeRegistration from '@/components/RefugeeRegistration';
import SuperAdminDashboard from '@/components/SuperAdminDashboard';
import EmployerAdminDashboard from '@/components/EmployerAdminDashboard';
import RefugeeDashboard from '@/components/RefugeeDashboard';
import JobBoard from '@/components/JobBoard';
import UnifiedLogin from '@/components/UnifiedLogin';
import EmailVerification from '@/components/EmailVerification';

const Index = () => {
  const { currentUser, isLoggedIn, needsTokenRefresh, logout } = useSession();
  const {
    currentView,
    setCurrentView,
    verificationEmail,
    handleLoginSuccess,
    handleVerificationSuccess,
    handleBackToLanding
  } = useViewRouter();

  const handleFindJobClick = () => {
    setCurrentView('refugee-registration');
  };

  const handleEmployerClick = () => {
    setCurrentView('employer-registration');
  };

  const handleLoginClick = () => {
    setCurrentView('unified-login');
  };

  const handleNavigateToJobBoard = () => {
    setCurrentView('job-board');
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
        <TokenRefreshBanner 
          currentUser={currentUser} 
          onLogout={logout} 
        />
      )}
      
      <LandingHero 
        onFindJobClick={handleFindJobClick}
        onEmployerClick={handleEmployerClick}
        onLoginClick={handleLoginClick}
      />
    </div>
  );
};

export default Index;
