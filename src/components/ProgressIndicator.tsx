
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Check } from 'lucide-react';

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
      <div className={`flex items-center justify-center ${isRTL ? 'space-x-reverse' : ''}`}>
        {Array.from({ length: steps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isInactive = stepNumber > currentStep;

          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100 text-gray-400'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepLabels[index] && (
                  <span className={`text-xs text-center mt-2 max-w-20 leading-tight ${
                    isActive ? 'text-blue-600 font-medium' : 'text-gray-500'
                  }`}>
                    {stepLabels[index]}
                  </span>
                )}
              </div>
              
              {stepNumber < steps && (
                <div
                  className={`flex-1 h-0.5 mx-4 transition-all duration-200 ${
                    stepNumber < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                  style={{ minWidth: '40px' }}
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
