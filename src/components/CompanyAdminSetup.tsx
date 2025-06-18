
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Building, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CompanyAdminSetupProps {
  onBack: () => void;
  onSetupSuccess: () => void;
  email: string;
}

const CompanyAdminSetup: React.FC<CompanyAdminSetupProps> = ({ 
  onBack, 
  onSetupSuccess,
  email 
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Setting up company admin account for:', email);

      const response = await fetch('https://ab93e9536acd.ngrok.app/api/setup-admin-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          email: email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          password: formData.password
        })
      });

      console.log('Setup response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Failed to setup admin account';
        
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
      console.log('Admin setup successful:', result);

      toast({
        title: "Account Setup Complete!",
        description: "Your admin account has been created successfully. You can now log in.",
      });

      onSetupSuccess();
    } catch (error) {
      console.error('Setup error:', error);
      
      let errorMessage = 'Failed to setup admin account';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection and try again.';
        } else if (error.message.includes('NetworkError')) {
          errorMessage = 'Network error: The server may be temporarily unavailable. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Setup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-neutral-gray hover:text-un-blue transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="form-card">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-un-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-un-blue" />
              </div>
              <h1 className="text-h2-mobile font-bold text-neutral-gray mb-2">
                Setup Admin Account
              </h1>
              <p className="text-body-mobile text-neutral-gray/70 mb-2">
                Complete your company administrator account setup
              </p>
              <p className="text-body-mobile font-medium text-un-blue">
                {email}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-small-mobile font-medium text-neutral-gray mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-un-blue/20 focus:border-un-blue"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-small-mobile font-medium text-neutral-gray mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-un-blue/20 focus:border-un-blue"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-small-mobile font-medium text-neutral-gray mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-un-blue/20 focus:border-un-blue"
                  placeholder="Enter your password (min 6 characters)"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-small-mobile font-medium text-neutral-gray mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-un-blue/20 focus:border-un-blue"
                  placeholder="Confirm your password"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !formData.firstName || !formData.lastName || !formData.password || !formData.confirmPassword}
                className="btn-primary w-full disabled:opacity-50"
              >
                {isSubmitting ? 'Setting up Account...' : 'Complete Setup'}
              </button>
            </form>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-small-mobile font-medium text-blue-800 mb-1">
                    Admin Account
                  </p>
                  <p className="text-xs text-blue-700">
                    You are setting up an administrator account for your company. This will give you access to manage jobs, users, and company settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyAdminSetup;
