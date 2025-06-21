
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LandingHeroProps {
  onFindJobClick: () => void;
  onEmployerClick: () => void;
  onLoginClick: () => void;
}

const LandingHero: React.FC<LandingHeroProps> = ({ 
  onFindJobClick, 
  onEmployerClick, 
  onLoginClick 
}) => {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-white">
      <div className="container-mobile py-8 min-h-screen flex flex-col">
        {/* Header with Login */}
        <div className="flex justify-end mb-8">
          <button
            onClick={onLoginClick}
            className="btn-ghost"
          >
            Log In
          </button>
        </div>

        {/* Hero Content */}
        <div className="flex-1 flex flex-col justify-center space-y-8">
          {/* Icon/Logo Area */}
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            </div>
          </div>

          {/* Main Heading */}
          <div className="text-center space-y-4">
            <h1 className="text-display text-gray-900">
              Find Your Next
              <br />
              <span className="text-blue-500">Opportunity</span>
            </h1>
            <p className="text-body text-gray-500 max-w-sm mx-auto">
              Connecting you with trusted employers in Jordan using smart AI matching
            </p>
          </div>
          
          {/* Primary Actions */}
          <div className="space-y-4">
            <button
              onClick={onFindJobClick}
              className="btn-primary w-full"
            >
              Find a Job
            </button>
            
            <div className="divider">
              <span>or</span>
            </div>
            
            <button
              onClick={onEmployerClick}
              className="btn-secondary w-full"
            >
              I'm an Employer
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-4 pt-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-caption text-gray-400">
              Trusted by humanitarian organizations
            </span>
          </div>
          <p className="text-caption text-gray-400">
            Powered by UN Refugee Connect Platform
          </p>
        </div>
      </div>
    </main>
  );
};

export default LandingHero;
