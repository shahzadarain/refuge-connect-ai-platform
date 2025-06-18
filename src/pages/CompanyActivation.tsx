
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Building, User, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CompanyActivation = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState<string>('');
  const [step, setStep] = useState<'verification' | 'setup'>('verification');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const actionParam = searchParams.get('action');
    
    console.log('Company activation page - email:', emailParam, 'action:', actionParam);
    
    if (emailParam) {
      setEmail(emailParam);
      
      // If action is setup, skip verification and go directly to setup
      if (actionParam === 'setup') {
        setStep('setup');
      }
    } else {
      // No email provided, redirect to home
      navigate('/');
    }
  }, [searchParams, navigate]);

  const handleEmailVerification = async () => {
    if (!email) return;
    
    setIsVerifying(true);
    
    try {
      console.log('Verifying email for company activation:', email);
      
      const response = await fetch('https://ab93e9536acd.ngrok.app/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ email })
      });

      console.log('Email verification response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Failed to verify email';
        
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
      console.log('Email verification successful:', result);

      toast({
        title: "Email Verified!",
        description: "Your email has been verified successfully. You can now set up your admin account.",
      });

      setStep('setup');
    } catch (error) {
      console.error('Email verification error:', error);
      
      let errorMessage = 'Failed to verify email';
      
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
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
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
        description: "Your admin account has been created successfully. Redirecting to login...",
      });

      // Redirect to home page after a brief delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
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

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-2 text-neutral-gray hover:text-un-blue transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <div className="form-card">
            {step === 'verification' ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-un-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="w-8 h-8 text-un-blue" />
                  </div>
                  <h1 className="text-h2-mobile font-bold text-neutral-gray mb-2">
                    Verify Your Email
                  </h1>
                  <p className="text-body-mobile text-neutral-gray/70 mb-4">
                    Please verify your email address to activate your company account
                  </p>
                  <p className="text-body-mobile font-medium text-un-blue bg-blue-50 px-4 py-2 rounded-lg">
                    {email}
                  </p>
                </div>

                <button
                  onClick={handleEmailVerification}
                  disabled={isVerifying}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {isVerifying ? 'Verifying Email...' : 'Verify Email'}
                </button>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-small-mobile font-medium text-blue-800 mb-1">
                        Email Verification Required
                      </p>
                      <p className="text-xs text-blue-700">
                        This step ensures that your company email is valid and you have access to it.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-un-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-un-blue" />
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

                <form onSubmit={handleSetupSubmit} className="space-y-6">
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
                        Admin Account Setup
                      </p>
                      <p className="text-xs text-blue-700">
                        You are setting up an administrator account for your company. This will give you access to manage jobs, users, and company settings.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyActivation;
