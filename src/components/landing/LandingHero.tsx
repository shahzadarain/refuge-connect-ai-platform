
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
            onClick={onFindJobClick}
            className="w-full sm:w-auto bg-un-blue hover:bg-un-blue/90 text-white px-8 py-4 rounded-lg text-lg font-semibold mb-6 transition-colors shadow-lg hover:shadow-xl"
          >
            Find a Job
          </button>
          
          {/* Secondary CTA - Employer */}
          <div className="mb-6">
            <button
              onClick={onEmployerClick}
              className="text-un-blue hover:text-un-blue/80 font-medium border-b border-un-blue/30 hover:border-un-blue transition-colors"
            >
              I am an Employer
            </button>
          </div>
          
          {/* Login Link */}
          <p className="text-neutral-gray/70">
            Already have an account?{' '}
            <button
              onClick={onLoginClick}
              className="text-un-blue hover:text-un-blue/80 font-medium underline"
            >
              Log In
            </button>
          </p>
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
  );
};

export default LandingHero;
