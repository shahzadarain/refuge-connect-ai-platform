
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Building, User, CheckCircle } from 'lucide-react';
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
        description: "Your admin account has been created successfully. Welcome to your company dashboard!",
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
    <div className="min-h-screen bg-white">
      <div className="container-mobile py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-display text-gray-900 mb-2">Setup Admin Account</h1>
            <p className="text-body text-gray-500 mb-4">
              Complete your company administrator account setup
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">{email}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="label-modern">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="input-modern"
                  placeholder="Enter your first name"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="label-modern">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="input-modern"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label-modern">
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
                className="input-modern"
                placeholder="Create a secure password (min 6 characters)"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label-modern">
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
                className="input-modern"
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

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">
                  Admin Account Setup
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
  );
};

export default CompanyAdminSetup;
