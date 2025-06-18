import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from '@/hooks/useSession';
import Header from '@/components/Header';
import RoleCard from '@/components/RoleCard';
import EmployerRegistration from '@/components/EmployerRegistration';
import RefugeeRegistration from '@/components/RefugeeRegistration';
import SuperAdminDashboard from '@/components/SuperAdminDashboard';
import JobBoard from '@/components/JobBoard';
import SuperAdminLogin from '@/components/SuperAdminLogin';

type ViewState = 'landing' | 'employer-registration' | 'refugee-registration' | 'super-admin-dashboard' | 'job-board' | 'super-admin-login';

const Index = () => {
  const { t } = useLanguage();
  const { currentUser, isLoggedIn } = useSession();
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    console.log('Index component checking session:', { isLoggedIn, currentUser });
    if (isLoggedIn && currentUser) {
      if (currentUser.user_type === 'super_admin') {
        console.log('Found super admin session, navigating to dashboard');
        setCurrentView('super-admin-dashboard');
      }
      // Add other user types here if needed in the future
    }
  }, [isLoggedIn, currentUser]);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole === 'employer') {
      setCurrentView('employer-registration');
    } else if (selectedRole === 'refugee') {
      setCurrentView('refugee-registration');
    } else if (selectedRole === 'admin') {
      setCurrentView('super-admin-login');
    }
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setSelectedRole(null);
  };

  const handleNavigateToJobBoard = () => {
    setCurrentView('job-board');
  };

  const handleSuperAdminLoginSuccess = () => {
    setCurrentView('super-admin-dashboard');
  };

  if (currentView === 'employer-registration') {
    return <EmployerRegistration onBack={handleBackToLanding} />;
  }

  if (currentView === 'refugee-registration') {
    return <RefugeeRegistration onBack={handleBackToLanding} />;
  }

  if (currentView === 'super-admin-login') {
    return <SuperAdminLogin onBack={handleBackToLanding} onLoginSuccess={handleSuperAdminLoginSuccess} />;
  }

  if (currentView === 'super-admin-dashboard') {
    return <SuperAdminDashboard onBack={handleBackToLanding} />;
  }

  if (currentView === 'job-board') {
    return <JobBoard />;
  }

  return (
    <div className="min-h-screen bg-light-gray">
      <Header />
      
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

            {/* Admin Role */}
            <RoleCard
              role="admin"
              icon={
                <svg className="w-8 h-8 text-un-blue" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C14.8,11.78 14.58,12 14.3,12H9.7C9.42,12 9.2,11.78 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.4,8.7 10.4,10V10.8H13.6V10C13.6,8.7 12.8,8.2 12,8.2Z"/>
                </svg>
              }
              onClick={() => handleRoleSelect('admin')}
              selected={selectedRole === 'admin'}
            />
          </div>

          {/* Continue Button */}
          {selectedRole && (
            <div className="text-center animate-fade-in">
              <button
                onClick={handleContinue}
                className="btn-primary w-full max-w-md mx-auto"
              >
                {t('landing.continue')}
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
