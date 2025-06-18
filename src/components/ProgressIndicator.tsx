
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProgressIndicatorProps {
  steps: number;
  currentStep: number;
  stepLabels?: string[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  steps, 
  currentStep, 
  stepLabels = [] 
}) => {
  const { isRTL } = useLanguage();

  return (
    <div className="w-full py-6">
      <div className={`flex items-center justify-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
        {Array.from({ length: steps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isInactive = stepNumber > currentStep;

          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center">
                <div
                  className={`progress-step ${
                    isActive ? 'active' : isCompleted ? 'completed' : 'inactive'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepLabels[index] && (
                  <span className="text-small-mobile text-center mt-2 text-neutral-gray">
                    {stepLabels[index]}
                  </span>
                )}
              </div>
              
              {stepNumber < steps && (
                <div
                  className={`flex-1 h-0.5 ${
                    stepNumber < currentStep ? 'bg-success-green' : 'bg-gray-200'
                  }`}
                  style={{ minWidth: '24px' }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;
