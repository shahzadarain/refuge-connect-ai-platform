
import React from 'react';
import { useSession } from '@/hooks/useSession';
import { useViewRouter } from '@/hooks/useViewRouter';
import LandingHero from '@/components/landing/LandingHero';
import EmployerRegistration from '@/components/EmployerRegistration';
import RefugeeRegistration from '@/components/RefugeeRegistration';
import SuperAdminDashboard from '@/components/SuperAdminDashboard';
import EmployerAdminDashboard from '@/components/EmployerAdminDashboard';
import RefugeeDashboard from '@/components/RefugeeDashboard';
import JobBoard from '@/components/JobBoard';
import UnifiedLogin from '@/components/UnifiedLogin';
import EmailVerification from '@/components/EmailVerification';
import UNHCRValidation from '@/components/UNHCRValidation';

const Index = () => {
  const { currentUser, isLoggedIn, needsTokenRefresh, logout } = useSession();
  const {
    currentView,
    setCurrentView,
    verificationEmail,
    handleLoginSuccess,
    handleVerificationSuccess,
    handleUNHCRValidationSuccess,
    handleBackToLanding,
    handleUNHCRValidationRequest
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
    return (
      <UnifiedLogin 
        onBack={handleBackToLanding} 
        onLoginSuccess={handleLoginSuccess}
        onUNHCRValidationRequest={handleUNHCRValidationRequest}
      />
    );
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

  if (currentView === 'unhcr-validation') {
    return (
      <UNHCRValidation
        onBack={handleBackToLanding}
        onValidationSuccess={handleUNHCRValidationSuccess}
        userEmail={verificationEmail}
      />
    );
  }

  return (
    <LandingHero 
      onFindJobClick={handleFindJobClick}
      onEmployerClick={handleEmployerClick}
      onLoginClick={handleLoginClick}
    />
  );
};

export default Index;
