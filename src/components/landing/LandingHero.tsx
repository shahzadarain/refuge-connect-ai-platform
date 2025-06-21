
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
      <div className="container mx-auto px-6 py-12 max-w-md">
        {/* Hero Section */}
        <div className="text-center space-y-8">
          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              Find Your Next Opportunity in Jordan
            </h1>
            <p className="text-base text-gray-600 leading-relaxed">
              Connecting you with jobs from trusted companies using AI-powered matching.
            </p>
          </div>
          
          {/* Primary CTA Button */}
          <button
            onClick={onFindJobClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg text-base transition-colors duration-200 shadow-sm"
          >
            Find a Job
          </button>
          
          {/* Secondary Actions */}
          <div className="space-y-6">
            {/* Employer Link */}
            <button
              onClick={onEmployerClick}
              className="text-blue-600 hover:text-blue-700 font-medium text-base transition-colors duration-200"
            >
              I am an Employer
            </button>
            
            {/* Login Link */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <button
                  onClick={onLoginClick}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  Log In
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 text-center">
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              Powered by UN Refugee Connect Platform
            </p>
            <div className="flex justify-center items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-xs text-gray-500">
                Trusted by humanitarian organizations worldwide
              </span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default LandingHero;
