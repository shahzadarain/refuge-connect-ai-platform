
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import ProgressIndicator from './ProgressIndicator';
import FormField from './FormField';
import { Button } from './ui/button';
import { Shield, UserCheck, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
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

  const isValidDate = (dateString: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!refugeeData.individual_id) newErrors.individual_id = t('validation.required');
      if (!refugeeData.date_of_birth) {
        newErrors.date_of_birth = t('validation.required');
      } else if (!isValidDate(refugeeData.date_of_birth)) {
        newErrors.date_of_birth = 'Please enter date in format YYYY-MM-DD';
      }
      if (!refugeeData.date_of_arrival) {
        newErrors.date_of_arrival = t('validation.required');
      } else if (!isValidDate(refugeeData.date_of_arrival)) {
        newErrors.date_of_arrival = 'Please enter date in format YYYY-MM-DD';
      }
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
      } else if (refugeeData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      if (refugeeData.password !== refugeeData.confirm_password) {
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

  const highlightField = (fieldName: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: prev[fieldName] || 'Please check this field'
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    // Frontend validation for password match
    if (refugeeData.password !== refugeeData.confirm_password) {
      setErrors({ confirm_password: 'Passwords do not match' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Starting refugee registration with validation...');
      
      // Prepare data - remove confirm_password before sending to API
      const registrationData = { ...refugeeData };
      delete registrationData.confirm_password;
      
      console.log('Registration data:', { ...registrationData, password: '[HIDDEN]' });

      const response = await fetch('https://ab93e9536acd.ngrok.app/api/refugee/register-with-validation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(registrationData)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          console.log('Error response data:', errorData);
          
          if (response.status === 400) {
            // UNHCR validation failed
            errorMessage = 'UNHCR validation failed. Please check your UNHCR ID and dates.';
            highlightField('individual_id');
            highlightField('date_of_birth');
            highlightField('date_of_arrival');
          } else if (response.status === 409) {
            // Email already exists
            errorMessage = 'This email is already registered.';
            highlightField('email');
          } else {
            errorMessage = errorData.detail || errorData.message || errorMessage;
          }
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
      
      if (result.status === "success") {
        // User is already validated and active
        toast({
          title: "Registration Successful!",
          description: "Your account has been created and validated. Redirecting to login...",
        });
        
        // Store email for login page (optional)
        localStorage.setItem('registeredEmail', result.user.email);
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = '/?action=login';
        }, 2000);
      }
      
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
    'UNHCR Verification',
    'Account Setup'
  ];

  const renderStep1 = () => (
    <div className="max-w-2xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Register as a Refugee
        </h1>
        <p className="text-lg text-gray-600 max-w-lg mx-auto">
          Welcome to Refugee Connect. We need to verify your UNHCR information to ensure you have access to the right opportunities and support.
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">UNHCR Validation Required</h3>
            <p className="text-blue-800 text-sm leading-relaxed">
              To ensure the safety and integrity of our platform, we validate your information against UNHCR records during registration. 
              This information is kept confidential and is only used for verification purposes.
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          UNHCR Verification Details
        </h2>

        <div className="space-y-6">
          <FormField
            label="UNHCR Individual ID"
            name="individual_id"
            value={refugeeData.individual_id}
            onChange={(value) => setRefugeeData({ ...refugeeData, individual_id: value })}
            placeholder="REF123456"
            required
            error={errors.individual_id}
            helpText="Enter your UNHCR registration number exactly as shown on your card"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              value={refugeeData.date_of_birth}
              onChange={(value) => setRefugeeData({ ...refugeeData, date_of_birth: value })}
              required
              error={errors.date_of_birth}
            />

            <FormField
              label="Date of Arrival in Jordan"
              name="date_of_arrival"
              type="date"
              value={refugeeData.date_of_arrival}
              onChange={(value) => setRefugeeData({ ...refugeeData, date_of_arrival: value })}
              required
              error={errors.date_of_arrival}
            />
          </div>

          <FormField
            label="Full Name"
            name="full_name"
            value={refugeeData.full_name}
            onChange={(value) => setRefugeeData({ ...refugeeData, full_name: value })}
            placeholder="Enter your full name as on UNHCR card"
            required
            error={errors.full_name}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-2xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Create Your Account
        </h1>
        <p className="text-lg text-gray-600 max-w-lg mx-auto">
          Set up your account details to start exploring job opportunities and connecting with employers.
        </p>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Account Information
        </h2>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Email Address"
              name="email"
              type="email"
              value={refugeeData.email}
              onChange={(value) => setRefugeeData({ ...refugeeData, email: value })}
              required
              error={errors.email}
            />

            <FormField
              label="Phone Number"
              name="phone"
              type="tel"
              value={refugeeData.phone}
              onChange={(value) => setRefugeeData({ ...refugeeData, phone: value })}
              placeholder="+962781234567"
              required
              error={errors.phone}
            />
          </div>

          <FormField
            label="Preferred Language"
            name="preferred_language"
            type="select"
            value={refugeeData.preferred_language}
            onChange={(value) => setRefugeeData({ ...refugeeData, preferred_language: value })}
            options={languageOptions}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Password"
              name="password"
              type="password"
              value={refugeeData.password}
              onChange={(value) => setRefugeeData({ ...refugeeData, password: value })}
              required
              error={errors.password}
              helpText="Minimum 6 characters"
            />

            <FormField
              label="Confirm Password"
              name="confirm_password"
              type="password"
              value={refugeeData.confirm_password}
              onChange={(value) => setRefugeeData({ ...refugeeData, confirm_password: value })}
              required
              error={errors.confirm_password}
            />
          </div>
        </div>

        {errors.submit && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-red-800 mb-1">Registration Error</h3>
                <p className="text-red-700 text-sm">{errors.submit}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <ProgressIndicator 
            steps={2} 
            currentStep={currentStep}
            stepLabels={stepLabels}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12 px-4">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
      </div>

      {/* Navigation */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-2xl mx-auto flex gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1 md:flex-none md:px-8"
          >
            {t('button.back')}
          </Button>
          
          {currentStep === 1 ? (
            <Button
              onClick={handleNext}
              className="flex-1 md:flex-none md:px-8"
            >
              Continue to Account Setup
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 md:flex-none md:px-8"
            >
              {isSubmitting ? 'Creating Account & Validating...' : 'Create Account'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RefugeeRegistration;
