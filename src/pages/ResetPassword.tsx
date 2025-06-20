
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  email: string;
  verification_code: string;
  new_password: string;
  confirm_password: string;
}

interface ValidationErrors {
  email?: string;
  verification_code?: string;
  new_password?: string;
  confirm_password?: string;
}

const ResetPassword = () => {
  console.log('ResetPassword component mounted');
  
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    verification_code: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    console.log('ResetPassword useEffect - checking for stored email or URL params');
    
    // Try to get email from localStorage (from forgot password flow)
    const storedEmail = localStorage.getItem('resetEmail');
    
    // Also check URL params (from email links)
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');
    
    console.log('Stored email:', storedEmail);
    console.log('Email param:', emailParam);
    console.log('Token param:', tokenParam);
    
    if (emailParam) {
      setFormData(prev => ({
        ...prev,
        email: decodeURIComponent(emailParam),
        verification_code: tokenParam || ''
      }));
    } else if (storedEmail) {
      setFormData(prev => ({
        ...prev,
        email: storedEmail
      }));
    }
  }, [searchParams]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.verification_code) {
      errors.verification_code = 'Verification code is required';
    } else if (formData.verification_code.length !== 6) {
      errors.verification_code = 'Code must be 6 digits';
    }
    
    if (!formData.new_password) {
      errors.new_password = 'Password is required';
    } else if (formData.new_password.length < 6) {
      errors.new_password = 'Password must be at least 6 characters';
    }
    
    if (formData.new_password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsResetting(true);

    try {
      console.log('Processing password reset for:', formData.email);
      console.log('Verification code length:', formData.verification_code.length);
      
      const response = await fetch('https://ab93e9536acd.ngrok.app/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          verification_code: formData.verification_code.trim(),
          new_password: formData.new_password
        })
      });

      console.log('Backend API response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = 'Failed to reset password';
        
        try {
          const errorData = await response.json();
          console.log('Error response data:', errorData);
          errorMessage = errorData.detail || errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response as JSON');
          const errorText = await response.text();
          console.log('Error response text:', errorText);
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Password reset successful:', result);
      
      // Clear stored email
      localStorage.removeItem('resetEmail');
      
      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated successfully. You can now log in with your new password.",
      });

      // Redirect based on user type or default to login
      const redirectPath = {
        'employer_admin': '/?action=login',
        'company_user': '/?action=login',
        'refugee': '/?action=login',
        'admin': '/?action=login',
        'super_admin': '/?action=login'
      }[result.user_type] || '/?action=login';
      
      setTimeout(() => {
        navigate(redirectPath);
      }, 2000);
    } catch (error) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'Failed to reset password';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection and try again.';
        } else if (error.message.includes('NetworkError')) {
          errorMessage = 'Network error: The server may be temporarily unavailable. Please try again later.';
        } else if (error.message.toLowerCase().includes('cors')) {
          errorMessage = 'CORS error: The server is not configured to allow requests from this domain. Please contact support.';
        } else if (error.message.toLowerCase().includes('expired')) {
          errorMessage = 'This reset code has expired. Please request a new password reset.';
        } else if (error.message.toLowerCase().includes('invalid reset code')) {
          errorMessage = 'Invalid reset code. Please check the code and try again.';
        } else if (error.message.toLowerCase().includes('already been used')) {
          errorMessage = 'This reset code has already been used. Please request a new password reset.';
        } else if (error.message.toLowerCase().includes('deactivated')) {
          errorMessage = 'This account is deactivated. Please contact support.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleRequestNewCode = () => {
    navigate('/?action=forgot-password');
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleVerificationCodeChange = (value: string) => {
    // Only allow digits and limit to 6 characters
    const cleanValue = value.replace(/\D/g, '').slice(0, 6);
    handleInputChange('verification_code', cleanValue);
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
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-un-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-un-blue" />
              </div>
              <h1 className="text-h2-mobile font-bold text-neutral-gray mb-2">
                Reset Your Password
              </h1>
              <p className="text-body-mobile text-neutral-gray/70 mb-2">
                Enter the verification code sent to your email and your new password
              </p>
              {formData.email && (
                <p className="text-body-mobile font-medium text-un-blue bg-blue-50 px-4 py-2 rounded-lg">
                  {formData.email}
                </p>
              )}
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-small-mobile font-medium text-neutral-gray mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`form-input ${validationErrors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter your email"
                  required
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="verificationCode" className="block text-small-mobile font-medium text-neutral-gray mb-2">
                  Verification Code *
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  value={formData.verification_code}
                  onChange={(e) => handleVerificationCodeChange(e.target.value)}
                  className={`form-input text-center text-lg font-mono ${validationErrors.verification_code ? 'border-red-500' : ''}`}
                  placeholder="123456"
                  maxLength={6}
                  required
                />
                <p className="text-small-mobile text-neutral-gray/70 mt-1">
                  Enter the 6-digit code from your email
                </p>
                {validationErrors.verification_code && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.verification_code}</p>
                )}
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-small-mobile font-medium text-neutral-gray mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    value={formData.new_password}
                    onChange={(e) => handleInputChange('new_password', e.target.value)}
                    className={`form-input pr-10 ${validationErrors.new_password ? 'border-red-500' : ''}`}
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-gray/50 hover:text-neutral-gray"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {validationErrors.new_password && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.new_password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-small-mobile font-medium text-neutral-gray mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData.confirm_password}
                    onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                    className={`form-input pr-10 ${validationErrors.confirm_password ? 'border-red-500' : ''}`}
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-gray/50 hover:text-neutral-gray"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {validationErrors.confirm_password && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.confirm_password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isResetting}
                className="btn-primary w-full disabled:opacity-50"
              >
                {isResetting ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-small-mobile text-neutral-gray/70 mb-3">
                Didn't receive the code or code expired?
              </p>
              <button
                onClick={handleRequestNewCode}
                className="btn-secondary w-full text-small-mobile font-medium"
              >
                Request New Code
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <KeyRound className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-small-mobile font-medium text-blue-800 mb-1">
                    Password Requirements
                  </p>
                  <p className="text-xs text-blue-700">
                    Your new password must be at least 6 characters long.
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

export default ResetPassword;
