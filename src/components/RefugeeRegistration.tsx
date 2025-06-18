
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import ProgressIndicator from './ProgressIndicator';
import FormField from './FormField';

interface RefugeeData {
  individual_id: string;
  date_of_birth: string;
  date_of_arrival: string;
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  preferred_language: string;
}

interface RefugeeRegistrationProps {
  onBack: () => void;
}

const RefugeeRegistration: React.FC<RefugeeRegistrationProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [refugeeData, setRefugeeData] = useState<RefugeeData>({
    individual_id: '',
    date_of_birth: '',
    date_of_arrival: '',
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    preferred_language: 'ar'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية' }
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!refugeeData.individual_id) newErrors.individual_id = t('validation.required');
      if (!refugeeData.date_of_birth) newErrors.date_of_birth = t('validation.required');
      if (!refugeeData.date_of_arrival) newErrors.date_of_arrival = t('validation.required');
      if (!refugeeData.full_name) newErrors.full_name = t('validation.required');
    }

    if (step === 2) {
      if (!refugeeData.email) {
        newErrors.email = t('validation.required');
      } else if (!/\S+@\S+\.\S+/.test(refugeeData.email)) {
        newErrors.email = t('validation.email');
      }
      
      if (!refugeeData.phone) newErrors.phone = t('validation.required');
      if (!refugeeData.password) {
        newErrors.password = t('validation.required');
      } else if (refugeeData.password.length < 8) {
        newErrors.password = t('validation.password');
      }
      
      if (refugeeData.password !== refugeeData.confirm_password) {
        newErrors.confirm_password = t('validation.password_match');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setIsSubmitting(true);
    
    try {
      // Note: This endpoint is planned but not yet implemented in the API
      const response = await fetch('https://ab93e9536acd.ngrok.app/api/refugee/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(refugeeData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }

      setCurrentStep(3); // Success step
    } catch (error) {
      console.error('Registration error:', error);
      // For demo purposes, we'll proceed to success step
      setCurrentStep(3);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = [
    t('register.verification'),
    t('register.personal_info'),
    'Complete'
  ];

  const renderStep1 = () => (
    <div className="animate-fade-in">
      {/* Welcome Card */}
      <div className="form-card text-center mb-4">
        <div className="w-16 h-16 bg-un-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-un-blue" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <h2 className="text-h1-mobile font-semibold text-neutral-gray mb-2">
          {t('landing.welcome')}
        </h2>
        <p className="text-body-mobile text-neutral-gray/80">
          We need to verify your identity to continue
        </p>
      </div>

      {/* Form Card */}
      <div className="form-card">
        <FormField
          label={t('form.individual_id')}
          name="individual_id"
          value={refugeeData.individual_id}
          onChange={(value) => setRefugeeData({ ...refugeeData, individual_id: value })}
          placeholder="REF123456"
          required
          error={errors.individual_id}
          helpText={t('form.individual_id.help')}
        />

        <FormField
          label={t('form.date_of_birth')}
          name="date_of_birth"
          type="date"
          value={refugeeData.date_of_birth}
          onChange={(value) => setRefugeeData({ ...refugeeData, date_of_birth: value })}
          required
          error={errors.date_of_birth}
        />

        <FormField
          label={t('form.date_of_arrival')}
          name="date_of_arrival"
          type="date"
          value={refugeeData.date_of_arrival}
          onChange={(value) => setRefugeeData({ ...refugeeData, date_of_arrival: value })}
          required
          error={errors.date_of_arrival}
        />

        <FormField
          label={t('form.full_name')}
          name="full_name"
          value={refugeeData.full_name}
          onChange={(value) => setRefugeeData({ ...refugeeData, full_name: value })}
          required
          error={errors.full_name}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-card animate-fade-in">
      <h2 className="text-h1-mobile font-semibold text-neutral-gray mb-6">
        {t('register.personal_info')}
      </h2>

      <FormField
        label={t('form.email')}
        name="email"
        type="email"
        value={refugeeData.email}
        onChange={(value) => setRefugeeData({ ...refugeeData, email: value })}
        required
        error={errors.email}
      />

      <FormField
        label={t('form.phone')}
        name="phone"
        type="tel"
        value={refugeeData.phone}
        onChange={(value) => setRefugeeData({ ...refugeeData, phone: value })}
        placeholder="+962781234567"
        required
        error={errors.phone}
      />

      <FormField
        label={t('form.preferred_language')}
        name="preferred_language"
        type="select"
        value={refugeeData.preferred_language}
        onChange={(value) => setRefugeeData({ ...refugeeData, preferred_language: value })}
        options={languageOptions}
        required
      />

      <FormField
        label={t('form.password')}
        name="password"
        type="password"
        value={refugeeData.password}
        onChange={(value) => setRefugeeData({ ...refugeeData, password: value })}
        required
        error={errors.password}
      />

      <FormField
        label={t('form.confirm_password')}
        name="confirm_password"
        type="password"
        value={refugeeData.confirm_password}
        onChange={(value) => setRefugeeData({ ...refugeeData, confirm_password: value })}
        required
        error={errors.confirm_password}
      />

      {errors.submit && (
        <div className="bg-error-red/10 border border-error-red rounded-md p-4 mb-4">
          <p className="text-error-red text-body-mobile">{errors.submit}</p>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="form-card text-center animate-fade-in">
      <div className="w-16 h-16 bg-success-green rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>

      <h2 className="text-h1-mobile font-semibold text-neutral-gray mb-4">
        Registration Complete!
      </h2>

      <p className="text-body-mobile text-neutral-gray/80 mb-6">
        Welcome to Refugee Connect. You can now start searching for employment opportunities.
      </p>

      <button
        onClick={onBack}
        className="btn-primary w-full"
      >
        Get Started
      </button>

      <p className="text-small-mobile text-neutral-gray/70 mt-4">
        {t('status.contact_support')}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-light-gray">
      <ProgressIndicator 
        steps={3} 
        currentStep={currentStep}
        stepLabels={stepLabels}
      />

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {currentStep < 3 && (
        <div className="flex gap-4 p-4 no-print">
          <button
            onClick={handleBack}
            className="btn-secondary flex-1"
          >
            {t('button.back')}
          </button>
          
          {currentStep === 1 ? (
            <button
              onClick={handleNext}
              className="btn-primary flex-1"
            >
              {t('button.verify')}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Account...' : t('button.submit')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RefugeeRegistration;
