import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import ProgressIndicator from './ProgressIndicator';
import FormField from './FormField';

interface CompanyData {
  legal_name: string;
  country_of_registration: string;
  registration_number: string;
  website: string;
  number_of_employees: string;
  about_company: string;
}

interface AdminData {
  email: string;
  phone: string;
  preferred_language: string;
  password: string;
  confirm_password: string;
}

interface EmployerRegistrationProps {
  onBack: () => void;
}

const EmployerRegistration: React.FC<EmployerRegistrationProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [companyData, setCompanyData] = useState<CompanyData>({
    legal_name: '',
    country_of_registration: 'Jordan',
    registration_number: '',
    website: '',
    number_of_employees: '',
    about_company: ''
  });

  const [adminData, setAdminData] = useState<AdminData>({
    email: '',
    phone: '',
    preferred_language: 'en',
    password: '',
    confirm_password: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const employeeOptions = [
    { value: '1-10', label: t('employees.1-10') },
    { value: '11-50', label: t('employees.11-50') },
    { value: '51-200', label: t('employees.51-200') },
    { value: '201-500', label: t('employees.201-500') },
    { value: '500+', label: t('employees.500+') }
  ];

  const countryOptions = [
    { value: 'Jordan', label: 'Jordan' },
    { value: 'Syria', label: 'Syria' },
    { value: 'Lebanon', label: 'Lebanon' },
    { value: 'Turkey', label: 'Turkey' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية' }
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!companyData.legal_name) newErrors.legal_name = t('validation.required');
      if (!companyData.country_of_registration) newErrors.country_of_registration = t('validation.required');
      if (!companyData.registration_number) newErrors.registration_number = t('validation.required');
    }

    if (step === 2) {
      if (!adminData.email) {
        newErrors.email = t('validation.required');
      } else if (!/\S+@\S+\.\S+/.test(adminData.email)) {
        newErrors.email = t('validation.email');
      }
      
      if (!adminData.phone) newErrors.phone = t('validation.required');
      if (!adminData.password) {
        newErrors.password = t('validation.required');
      } else if (adminData.password.length < 8) {
        newErrors.password = t('validation.password');
      }
      
      if (adminData.password !== adminData.confirm_password) {
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
      console.log('Starting registration request...');
      console.log('Company data:', companyData);
      console.log('Admin data:', { ...adminData, password: '[HIDDEN]', confirm_password: '[HIDDEN]' });

      const response = await fetch('https://ab93e9536acd.ngrok.app/api/employer/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          company: companyData,
          admin: adminData
        })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          console.log('Error response data:', errorData);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response as JSON');
          const errorText = await response.text();
          console.log('Error response text:', errorText);
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Registration successful:', result);
      setCurrentStep(3); // Success step
    } catch (error) {
      console.error('Registration error details:', error);
      
      let errorMessage = 'Registration failed';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection and try again.';
        } else if (error.message.includes('NetworkError')) {
          errorMessage = 'Network error: The server may be temporarily unavailable. Please try again later.';
        } else if (error.message.includes('CORS')) {
          errorMessage = 'Server configuration error: Cross-origin request blocked. Please contact support.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = [
    t('register.company_info'),
    t('register.personal_info'),
    t('register.verification')
  ];

  const renderStep1 = () => (
    <div className="form-card">
      <h2 className="text-h1-mobile font-semibold text-neutral-gray mb-6">
        {t('register.company_info')}
      </h2>

      <FormField
        label={t('form.company_name')}
        name="legal_name"
        value={companyData.legal_name}
        onChange={(value) => setCompanyData({ ...companyData, legal_name: value })}
        placeholder={t('form.company_name.placeholder')}
        required
        error={errors.legal_name}
      />

      <FormField
        label={t('form.country')}
        name="country_of_registration"
        type="select"
        value={companyData.country_of_registration}
        onChange={(value) => setCompanyData({ ...companyData, country_of_registration: value })}
        options={countryOptions}
        required
        error={errors.country_of_registration}
      />

      <FormField
        label={t('form.registration_number')}
        name="registration_number"
        value={companyData.registration_number}
        onChange={(value) => setCompanyData({ ...companyData, registration_number: value })}
        required
        error={errors.registration_number}
      />

      <FormField
        label={t('form.website')}
        name="website"
        type="url"
        value={companyData.website}
        onChange={(value) => setCompanyData({ ...companyData, website: value })}
        placeholder={t('form.website.placeholder')}
      />

      <FormField
        label={t('form.employees')}
        name="number_of_employees"
        type="select"
        value={companyData.number_of_employees}
        onChange={(value) => setCompanyData({ ...companyData, number_of_employees: value })}
        options={employeeOptions}
      />

      <FormField
        label={t('form.about_company')}
        name="about_company"
        type="textarea"
        value={companyData.about_company}
        onChange={(value) => setCompanyData({ ...companyData, about_company: value })}
        placeholder={t('form.about_company.placeholder')}
        rows={4}
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="form-card">
      <h2 className="text-h1-mobile font-semibold text-neutral-gray mb-6">
        {t('register.personal_info')}
      </h2>

      <FormField
        label={t('form.email')}
        name="email"
        type="email"
        value={adminData.email}
        onChange={(value) => setAdminData({ ...adminData, email: value })}
        required
        error={errors.email}
      />

      <FormField
        label={t('form.phone')}
        name="phone"
        type="tel"
        value={adminData.phone}
        onChange={(value) => setAdminData({ ...adminData, phone: value })}
        placeholder="+962791234567"
        required
        error={errors.phone}
      />

      <FormField
        label={t('form.preferred_language')}
        name="preferred_language"
        type="select"
        value={adminData.preferred_language}
        onChange={(value) => setAdminData({ ...adminData, preferred_language: value })}
        options={languageOptions}
        required
      />

      <FormField
        label={t('form.password')}
        name="password"
        type="password"
        value={adminData.password}
        onChange={(value) => setAdminData({ ...adminData, password: value })}
        required
        error={errors.password}
      />

      <FormField
        label={t('form.confirm_password')}
        name="confirm_password"
        type="password"
        value={adminData.confirm_password}
        onChange={(value) => setAdminData({ ...adminData, confirm_password: value })}
        required
        error={errors.confirm_password}
      />

      {errors.submit && (
        <div className="bg-error-red/10 border border-error-red rounded-md p-4 mb-4">
          <p className="text-error-red text-body-mobile font-medium mb-2">Registration Error:</p>
          <p className="text-error-red text-small-mobile">{errors.submit}</p>
          <details className="mt-2">
            <summary className="text-error-red text-small-mobile cursor-pointer">Show technical details</summary>
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600 font-mono overflow-auto">
              <p>Timestamp: {new Date().toISOString()}</p>
              <p>Endpoint: POST https://ab93e9536acd.ngrok.app/api/employer/register</p>
              <p>Check browser console for more details</p>
            </div>
          </details>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="form-card text-center">
      <div className="w-16 h-16 bg-success-green rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>

      <h2 className="text-h1-mobile font-semibold text-neutral-gray mb-4">
        {t('status.pending_approval')}
      </h2>

      <p className="text-body-mobile text-neutral-gray/80 mb-6">
        We will review your application and contact you within 2-3 business days.
      </p>

      <button
        onClick={onBack}
        className="btn-primary w-full"
      >
        {t('button.continue')}
      </button>
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
        <div className="flex gap-4 p-4">
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
              {t('button.next')}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : t('button.submit')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployerRegistration;
