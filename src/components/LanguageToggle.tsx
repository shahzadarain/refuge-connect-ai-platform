
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="lang-toggle" role="group" aria-label="Language selection">
      <button
        className={`lang-option ${language === 'en' ? 'active' : 'inactive'}`}
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
      >
        {t('language.english')}
      </button>
      <button
        className={`lang-option ${language === 'ar' ? 'active' : 'inactive'}`}
        onClick={() => setLanguage('ar')}
        aria-pressed={language === 'ar'}
      >
        {t('language.arabic')}
      </button>
    </div>
  );
};

export default LanguageToggle;
