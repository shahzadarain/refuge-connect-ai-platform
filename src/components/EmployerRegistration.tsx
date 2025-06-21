
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import ProgressIndicator from './ProgressIndicator';
import FormField from './FormField';
import { ArrowLeft, Building, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
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
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '500+', label: '500+ employees' }
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
      if (!companyData.legal_name) newErrors.legal_name = 'Company name is required';
      if (!companyData.country_of_registration) newErrors.country_of_registration = 'Country is required';
      if (!companyData.registration_number) newErrors.registration_number = 'Registration number is required';
    }

    if (step === 2) {
      if (!adminData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(adminData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      
      if (!adminData.phone) newErrors.phone = 'Phone number is required';
      if (!adminData.password) {
        newErrors.password = 'Password is required';
      } else if (adminData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      
      if (adminData.password !== adminData.confirm_password) {
        newErrors.confirm_password = 'Passwords do not match';
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

      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (parseError) {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Registration successful:', result);
      
      toast({
        title: "Registration Successful!",
        description: "Your application has been submitted for review.",
      });
      
      setCurrentStep(3);
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to the server. Please check your connection and try again.';
        } else if (error.message.includes('NetworkError')) {
          errorMessage = 'Network error. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = [
    'Company Information',
    'Administrator Details',
    'Review & Submit'
  ];

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building className="w-8 h-8 text-blue-500" />
        </div>
        <h1 className="text-display text-gray-900 mb-2">Company Information</h1>
        <p className="text-body text-gray-500">Tell us about your organization</p>
      </div>

      <FormField
        label="Company Name"
        name="legal_name"
        value={companyData.legal_name}
        onChange={(value) => setCompanyData({ ...companyData, legal_name: value })}
        placeholder="Enter your company name"
        required
        error={errors.legal_name}
      />

      <FormField
        label="Country of Registration"
        name="country_of_registration"
        type="select"
        value={companyData.country_of_registration}
        onChange={(value) => setCompanyData({ ...companyData, country_of_registration: value })}
        options={countryOptions}
        required
        error={errors.country_of_registration}
      />

      <FormField
        label="Registration Number"
        name="registration_number"
        value={companyData.registration_number}
        onChange={(value) => setCompanyData({ ...companyData, registration_number: value })}
        placeholder="Enter registration number"
        required
        error={errors.registration_number}
      />

      <FormField
        label="Website (Optional)"
        name="website"
        type="url"
        value={companyData.website}
        onChange={(value) => setCompanyData({ ...companyData, website: value })}
        placeholder="https://www.example.com"
      />

      <FormField
        label="Number of Employees"
        name="number_of_employees"
        type="select"
        value={companyData.number_of_employees}
        onChange={(value) => setCompanyData({ ...companyData, number_of_employees: value })}
        options={employeeOptions}
      />

      <FormField
        label="About Your Company (Optional)"
        name="about_company"
        type="textarea"
        value={companyData.about_company}
        onChange={(value) => setCompanyData({ ...companyData, about_company: value })}
        placeholder="Brief description of your company and mission"
        rows={4}
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building className="w-8 h-8 text-blue-500" />
        </div>
        <h1 className="text-display text-gray-900 mb-2">Administrator Details</h1>
        <p className="text-body text-gray-500">Create your admin account</p>
      </div>

      <FormField
        label="Email Address"
        name="email"
        type="email"
        value={adminData.email}
        onChange={(value) => setAdminData({ ...adminData, email: value })}
        placeholder="admin@company.com"
        required
        error={errors.email}
      />

      <FormField
        label="Phone Number"
        name="phone"
        type="tel"
        value={adminData.phone}
        onChange={(value) => setAdminData({ ...adminData, phone: value })}
        placeholder="+962791234567"
        required
        error={errors.phone}
      />

      <FormField
        label="Preferred Language"
        name="preferred_language"
        type="select"
        value={adminData.preferred_language}
        onChange={(value) => setAdminData({ ...adminData, preferred_language: value })}
        options={languageOptions}
        required
      />

      <FormField
        label="Password"
        name="password"
        type="password"
        value={adminData.password}
        onChange={(value) => setAdminData({ ...adminData, password: value })}
        placeholder="Create a secure password"
        required
        error={errors.password}
      />

      <FormField
        label="Confirm Password"
        name="confirm_password"
        type="password"
        value={adminData.confirm_password}
        onChange={(value) => setAdminData({ ...adminData, confirm_password: value })}
        placeholder="Confirm your password"
        required
        error={errors.confirm_password}
      />
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>

      <div>
        <h1 className="text-display text-gray-900 mb-4">Application Submitted!</h1>
        <p className="text-body text-gray-500 mb-6">
          Thank you for your application. We'll review your information and contact you within 2-3 business days.
        </p>
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            You'll receive an email confirmation shortly with next steps.
          </p>
        </div>
      </div>

      <button
        onClick={onBack}
        className="btn-primary w-full"
      >
        Return to Home
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="container-mobile py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        {/* Progress Indicator */}
        {currentStep < 3 && (
          <ProgressIndicator 
            steps={2} 
            currentStep={currentStep}
            stepLabels={stepLabels.slice(0, 2)}
          />
        )}

        {/* Content */}
        <div className="space-y-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Navigation */}
        {currentStep < 3 && (
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleBack}
              className="btn-secondary flex-1"
            >
              Back
            </button>
            
            {currentStep === 1 ? (
              <button
                onClick={handleNext}
                className="btn-primary flex-1"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerRegistration;
