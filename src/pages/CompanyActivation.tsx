import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Building, CheckCircle, Mail, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sessionStore } from '@/stores/sessionStore';
import { supabase } from '@/supabase';

const CompanyActivation = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [step, setStep] = useState<'email-input' | 'verification' | 'login' | 'setup'>('email-input');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  
  const [loginData, setLoginData] = useState({
    password: ''
  });

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const actionParam = searchParams.get('action');
    const codeParam = searchParams.get('code');
    
    console.log('Company activation page - email:', emailParam, 'action:', actionParam, 'code:', codeParam);
    
    if (emailParam) {
      setEmail(emailParam);
      
      // If we have a verification code, store it
      if (codeParam) {
        setVerificationCode(codeParam);
      }
      
      // If action is setup, skip to verification step (no password needed for new users)
      if (actionParam === 'setup') {
        setStep('verification');
      } else {
        setStep('verification');
      }
    } else {
      // No email provided, show email input form
      setStep('email-input');
    }
  }, [searchParams]);

  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const emailInput = formData.get('email') as string;
    
    if (emailInput) {
      setEmail(emailInput);
      setStep('verification');
    }
  };

  const handleEmailVerification = async () => {
    if (!email) return;
    
    setIsVerifying(true);
    
    try {
      console.log('Verifying email for company activation:', email);
      
      const requestBody: any = { email };
      
      if (verificationCode) {
        requestBody.verification_code = verificationCode;
      }
      
      const response = await fetch('https://ab93e9536acd.ngrok.app/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(requestBody)
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

      // Check if this is a new user (needs setup) or existing user (needs login)
      if (result.is_new_user || result.requires_setup) {
        toast({
          title: "Email Verified!",
          description: "Your email has been verified successfully. You can now access your company dashboard.",
        });
        
        // For new users, store session and redirect to dashboard
        if (result.user) {
          sessionStore.setCurrentUser(result.user);
          localStorage.setItem('access_token', result.access_token);
        }
        
        navigate('/company-dashboard');
      } else {
        toast({
          title: "Email Verified!",
          description: "Your email has been verified successfully. Please log in with your password.",
        });
        
        setStep('login');
      }
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.password) {
      toast({
        title: "Password Required",
        description: "Please enter your password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoggingIn(true);

    try {
      console.log('Logging in company admin:', email);

      const response = await fetch('https://ab93e9536acd.ngrok.app/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          email: email,
          password: loginData.password,
          user_type: 'employer_admin'
        })
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Login failed';
        
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
      console.log('Login successful:', result);

      // Store user session
      if (result.user) {
        sessionStore.setCurrentUser(result.user);
        localStorage.setItem('access_token', result.access_token);
      }

      toast({
        title: "Login Successful!",
        description: "Welcome to your company dashboard.",
      });

      navigate('/company-dashboard');
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed';
      
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
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingReset(true);

    try {
      console.log('Sending password reset for:', email);
      
      // Generate a secure reset URL
      const resetUrl = `${window.location.origin}/reset-password?email=${encodeURIComponent(email)}&token=SECURE_TOKEN_HERE`;
      
      const { data, error } = await supabase.functions.invoke('send-password-reset-email', {
        body: { 
          email,
          reset_url: resetUrl
        }
      });

      console.log('Password reset response:', { data, error });

      if (error) {
        throw new Error(error.message || 'Failed to send password reset email');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send password reset email');
      }

      toast({
        title: "Reset Link Sent",
        description: "Please check your email for password reset instructions. The link will expire in 3 hours.",
      });
      setShowForgotPassword(false);
    } catch (error) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'Failed to send password reset link';
      
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
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
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
            {step === 'email-input' ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-un-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-un-blue" />
                  </div>
                  <h1 className="text-h2-mobile font-bold text-neutral-gray mb-2">
                    Company Login
                  </h1>
                  <p className="text-body-mobile text-neutral-gray/70">
                    Enter your company email address to continue
                  </p>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-small-mobile font-medium text-neutral-gray mb-2">
                      Company Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-un-blue/20 focus:border-un-blue"
                      placeholder="Enter your company email"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full"
                  >
                    Continue
                  </button>
                </form>

                <div className="text-center mt-6">
                  <button
                    onClick={handleForgotPassword}
                    disabled={isSendingReset}
                    className="btn-secondary w-full disabled:opacity-50"
                  >
                    {isSendingReset ? 'Sending Reset Link...' : 'Forgot Password?'}
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-small-mobile font-medium text-blue-800 mb-1">
                        Company Access
                      </p>
                      <p className="text-xs text-blue-700">
                        Use your company email address that was approved by the administrator.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : step === 'verification' ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-un-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="w-8 h-8 text-un-blue" />
                  </div>
                  <h1 className="text-h2-mobile font-bold text-neutral-gray mb-2">
                    Verify Your Email
                  </h1>
                  <p className="text-body-mobile text-neutral-gray/70 mb-4">
                    {verificationCode ? 
                      'We have received your verification code. Click verify to continue.' :
                      'Please verify your email address to access your company account'
                    }
                  </p>
                  <p className="text-body-mobile font-medium text-un-blue bg-blue-50 px-4 py-2 rounded-lg">
                    {email}
                  </p>
                  {verificationCode && (
                    <p className="text-body-mobile font-mono text-green-600 bg-green-50 px-4 py-2 rounded-lg mt-2">
                      Verification Code: {verificationCode}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleEmailVerification}
                  disabled={isVerifying}
                  className="btn-primary w-full disabled:opacity-50 mb-4"
                >
                  {isVerifying ? 'Verifying Email...' : 'Verify Email'}
                </button>

                <div className="text-center mb-6">
                  <button
                    onClick={handleForgotPassword}
                    disabled={isSendingReset}
                    className="btn-secondary w-full disabled:opacity-50"
                  >
                    {isSendingReset ? 'Sending Reset Link...' : 'Forgot Password?'}
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-small-mobile font-medium text-blue-800 mb-1">
                        Email Verification Required
                      </p>
                      <p className="text-xs text-blue-700">
                        This step ensures that your company email is valid and you have access to it. Verification codes expire in 3 hours.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-un-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="w-8 h-8 text-un-blue" />
                  </div>
                  <h1 className="text-h2-mobile font-bold text-neutral-gray mb-2">
                    Welcome Back
                  </h1>
                  <p className="text-body-mobile text-neutral-gray/70 mb-2">
                    Enter your password to access your company dashboard
                  </p>
                  <p className="text-body-mobile font-medium text-un-blue">
                    {email}
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label htmlFor="password" className="block text-small-mobile font-medium text-neutral-gray mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={loginData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-un-blue/20 focus:border-un-blue"
                      placeholder="Enter your password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn || !loginData.password}
                    className="btn-primary w-full disabled:opacity-50"
                  >
                    {isLoggingIn ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>

                <div className="text-center mt-6">
                  <button
                    onClick={handleForgotPassword}
                    disabled={isSendingReset}
                    className="btn-secondary w-full disabled:opacity-50"
                  >
                    {isSendingReset ? 'Sending Reset Link...' : 'Forgot Password?'}
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <KeyRound className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-small-mobile font-medium text-blue-800 mb-1">
                        Secure Access
                      </p>
                      <p className="text-xs text-blue-700">
                        Use the password you set during company registration to access your dashboard.
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
