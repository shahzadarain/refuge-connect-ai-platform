
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './ui/button';
import FormField from './FormField';
import { Shield, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UNHCRValidationProps {
  onBack: () => void;
  onValidationSuccess: () => void;
  userEmail?: string;
}

interface ValidationData {
  email: string;
  unhcr_id: string;
  date_of_birth: string;
  date_of_arrival: string;
}

const UNHCRValidation: React.FC<UNHCRValidationProps> = ({ 
  onBack, 
  onValidationSuccess, 
  userEmail 
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validatedUserInfo, setValidatedUserInfo] = useState<any>(null);
  
  const [validationData, setValidationData] = useState<ValidationData>({
    email: userEmail || '',
    unhcr_id: '',
    date_of_birth: '',
    date_of_arrival: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get email from localStorage if not provided as prop
  useEffect(() => {
    if (!userEmail) {
      const storedEmail = localStorage.getItem('refugee_validation_email');
      if (storedEmail) {
        setValidationData(prev => ({ ...prev, email: storedEmail }));
      }
    }
  }, [userEmail]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validationData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(validationData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!validationData.unhcr_id) {
      newErrors.unhcr_id = 'UNHCR Individual ID is required';
    } else if (validationData.unhcr_id.length < 6) {
      newErrors.unhcr_id = 'Please enter a valid UNHCR ID';
    }

    if (!validationData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    }

    if (!validationData.date_of_arrival) {
      newErrors.date_of_arrival = 'Date of arrival is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});
    
    try {
      console.log('Starting UNHCR validation request...');
      console.log('Validation data:', validationData);

      const response = await fetch('https://ab93e9536acd.ngrok.app/api/refugee/validate-unhcr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(validationData)
      });

      console.log('Validation response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'UNHCR validation failed. Please check your information and try again.';
        
        try {
          const errorData = await response.json();
          console.log('Error response data:', errorData);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response as JSON');
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Validation successful:', result);
      
      setValidatedUserInfo(result.user);
      setIsSuccess(true);
      
      toast({
        title: "Validation Successful!",
        description: "Your UNHCR information has been verified. Your account is now active.",
      });

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        onValidationSuccess();
      }, 3000);

    } catch (error) {
      console.error('Validation error:', error);
      
      let errorMessage = 'Validation failed. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors({ submit: errorMessage });
      
      toast({
        title: "Validation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Validation Successful!
          </h1>

          <p className="text-lg text-gray-600 mb-6">
            Your UNHCR information has been verified. Your account is now active.
          </p>

          {validatedUserInfo && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-green-900 mb-3">Verified Information:</h3>
              <div className="space-y-2 text-sm text-green-800">
                <p><strong>UNHCR ID:</strong> {validatedUserInfo.unhcr_id}</p>
                {validatedUserInfo.nationality && (
                  <p><strong>Nationality:</strong> {validatedUserInfo.nationality}</p>
                )}
                {validatedUserInfo.location && (
                  <div>
                    <strong>Location:</strong>
                    <div className="ml-2">
                      {validatedUserInfo.location.level1 && <p>• {validatedUserInfo.location.level1}</p>}
                      {validatedUserInfo.location.level2 && <p>• {validatedUserInfo.location.level2}</p>}
                      {validatedUserInfo.location.level3 && <p>• {validatedUserInfo.location.level3}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <Button onClick={onValidationSuccess} className="w-full mb-4">
            Continue to Login
          </Button>

          <p className="text-sm text-gray-500">
            You will be redirected automatically in a few seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              UNHCR Account Validation
            </h1>
            <p className="text-gray-600">
              Please verify your UNHCR information to activate your account
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">UNHCR Validation Required</h3>
                <p className="text-blue-800 text-sm leading-relaxed mb-3">
                  To ensure the security and integrity of our platform, we need to verify your UNHCR registration information. 
                  This process replaces email verification for refugee users.
                </p>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Make sure your UNHCR ID matches exactly as shown on your card</li>
                  <li>• Use the exact dates from your official documents</li>
                  <li>• All information is kept confidential and secure</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Verify Your UNHCR Information
            </h2>

            <div className="space-y-6">
              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={validationData.email}
                onChange={(value) => setValidationData({ ...validationData, email: value })}
                required
                error={errors.email}
                helpText="The email address you used during registration"
              />

              <FormField
                label="UNHCR Individual ID"
                name="unhcr_id"
                value={validationData.unhcr_id}
                onChange={(value) => setValidationData({ ...validationData, unhcr_id: value })}
                placeholder="Enter your UNHCR ID"
                required
                error={errors.unhcr_id}
                helpText="Your unique UNHCR identification number as shown on your registration card"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Date of Birth"
                  name="date_of_birth"
                  type="date"
                  value={validationData.date_of_birth}
                  onChange={(value) => setValidationData({ ...validationData, date_of_birth: value })}
                  required
                  error={errors.date_of_birth}
                  helpText="Format: YYYY-MM-DD"
                />

                <FormField
                  label="Date of Arrival in Jordan"
                  name="date_of_arrival"
                  type="date"
                  value={validationData.date_of_arrival}
                  onChange={(value) => setValidationData({ ...validationData, date_of_arrival: value })}
                  required
                  error={errors.date_of_arrival}
                  helpText="Format: YYYY-MM-DD"
                />
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-800 mb-1">Validation Error</h3>
                    <p className="text-red-700 text-sm mb-3">{errors.submit}</p>
                    <div className="text-red-700 text-sm">
                      <p className="font-medium mb-1">Helpful tips:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Make sure your UNHCR ID matches exactly as shown on your card</li>
                        <li>• Date format should be YYYY-MM-DD</li>
                        <li>• Double-check your date of birth and arrival dates</li>
                        <li>• Contact support if you continue having issues</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-8">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Validating...' : 'Validate UNHCR Information'}
              </Button>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• If validation fails, please double-check all information matches your UNHCR documents</p>
              <p>• Make sure dates are in YYYY-MM-DD format</p>
              <p>• Contact our support team if you continue experiencing issues</p>
              <p>• Your information is securely processed and kept confidential</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UNHCRValidation;
