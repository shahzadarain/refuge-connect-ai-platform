
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';

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
        {/* Header with Language Toggle */}
        <div className="flex justify-end mb-8">
          <LanguageToggle />
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
              {t('landing.hero.title')}
              <br />
              <span className="text-blue-500">{t('landing.hero.subtitle')}</span>
            </h1>
            <p className="text-body text-gray-500 max-w-sm mx-auto">
              {t('landing.hero.description')}
            </p>
          </div>
          
          {/* Primary Login Action */}
          <div className="space-y-6">
            <button
              onClick={onLoginClick}
              className="btn-primary w-full text-lg py-4"
            >
              {t('landing.login_link')}
            </button>
            
            {/* First Time Users Section */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div className="text-center">
                <h3 className="text-heading text-gray-900 mb-2">
                  {t('landing.first_time')}
                </h3>
                <p className="text-body-sm text-gray-600">
                  {t('landing.select_role')}
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={onFindJobClick}
                  className="btn-secondary w-full"
                >
                  {t('landing.cta.refugee')}
                </button>
                
                <button
                  onClick={onEmployerClick}
                  className="btn-secondary w-full"
                >
                  {t('landing.cta.employer')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-4 pt-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-caption text-gray-400">
              {t('landing.trust.indicator')}
            </span>
          </div>
          <p className="text-caption text-gray-400">
            {t('landing.powered_by')}
          </p>
        </div>
      </div>
    </main>
  );
};

export default LandingHero;
