import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Mail, Shield, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface EmailVerificationProps {
  onBack: () => void;
  onVerificationSuccess: () => void;
  onForgotPassword: (email: string) => void;
  email?: string;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ 
  onBack, 
  onVerificationSuccess,
  onForgotPassword,
  email 
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerifyCode = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Email address is required for verification",
        variant: "destructive",
      });
      return;
    }

    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    try {
      console.log('Verifying email:', email, 'with code:', verificationCode);

      const response = await fetch('https://ab93e9536acd.ngrok.app/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          email: email,
          verification_code: verificationCode
        })
      });

      console.log('Verification response status:', response.status);
      const responseData = await response.json();
      console.log('Verification response:', responseData);

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 404) {
          throw new Error('User not found. Please check your email address.');
        } else if (response.status === 403) {
          if (responseData.detail?.includes('pending approval')) {
            throw new Error('Your company registration is pending approval. You will receive an email once approved.');
          } else if (responseData.detail?.includes('deactivated')) {
            throw new Error('This account is deactivated. Please contact support.');
          }
        } else if (response.status === 400) {
          if (responseData.detail?.includes('Invalid or expired')) {
            throw new Error('Invalid or expired verification code. Please check the code or request a new one.');
          }
        }
        
        throw new Error(responseData.detail || responseData.message || 'Verification failed');
      }

      // Check if already verified
      if (responseData.already_verified) {
        toast({
          title: "Already Verified",
          description: "Your email is already verified. You can now log in.",
        });
      } else {
        toast({
          title: "Email Verified!",
          description: "Your account has been verified successfully. You can now log in.",
        });
      }

      // Small delay before redirecting
      setTimeout(() => {
        onVerificationSuccess();
      }, 1500);
      
    } catch (error) {
      console.error('Verification error:', error);
      
      let errorMessage = 'Verification failed';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
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

  const handleResendCode = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Email address is required to resend verification code",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);

    try {
      console.log('Requesting new verification code for:', email);
      
      // Use the forgot-password endpoint to get a new verification code
      const response = await fetch('https://ab93e9536acd.ngrok.app/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ email })
      });

      console.log('Resend code response status:', response.status);
      const responseData = await response.json();
      console.log('Resend code response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.detail || responseData.message || 'Failed to send verification code');
      }

      // Clear the current code
      setVerificationCode('');

      toast({
        title: "Verification Code Sent",
        description: "A new verification code has been sent to your email. The code will expire in 3 hours.",
      });

      // In debug mode, show the code if available
      if (responseData.verification_code && responseData.debug_note) {
        toast({
          title: "Debug Mode - Verification Code",
          description: `Your code is: ${responseData.verification_code}`,
        });
      }
      
    } catch (error) {
      console.error('Resend code error:', error);
      
      let errorMessage = 'Failed to send verification code';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
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
      setIsResending(false);
    }
  };

  const handleForgotPasswordClick = () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Email address is required for password reset.",
        variant: "destructive",
      });
      return;
    }

    onForgotPassword(email);
  };

  const handleCodeChange = (value: string) => {
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, '');
    setVerificationCode(digitsOnly.slice(0, 6));
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
                <Mail className="w-8 h-8 text-un-blue" />
              </div>
              <h1 className="text-h2-mobile font-bold text-neutral-gray mb-2">
                Verify Your Email
              </h1>
              <p className="text-body-mobile text-neutral-gray/70 mb-2">
                {email ? 'We\'ve sent a 6-digit verification code to:' : 'Enter the 6-digit verification code sent to your email'}
              </p>
              {email && (
                <p className="text-body-mobile font-medium text-un-blue">
                  {email}
                </p>
              )}
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <label className="block text-small-mobile font-medium text-neutral-gray mb-4">
                  Enter Verification Code
                </label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={verificationCode}
                    onChange={handleCodeChange}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-xs text-neutral-gray/60 mt-2">
                  Enter the 6-digit code from your email
                </p>
              </div>

              <button
                onClick={handleVerifyCode}
                disabled={isVerifying || verificationCode.length !== 6 || !email}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? 'Verifying...' : 'Verify Email'}
              </button>

              <div className="text-center space-y-4">
                <p className="text-small-mobile text-neutral-gray/70">
                  Didn't receive the code?
                </p>
                <div className="space-y-2">
                  <button
                    onClick={handleResendCode}
                    disabled={isResending || !email}
                    className="btn-secondary w-full text-small-mobile font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending ? 'Sending...' : 'Resend Code'}
                  </button>
                  <button
                    onClick={handleForgotPasswordClick}
                    disabled={!email}
                    className="btn-secondary w-full text-small-mobile font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Use for Password Reset Instead
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-small-mobile font-medium text-blue-800 mb-1">
                      Important Information
                    </p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• The verification code expires in 3 hours</li>
                      <li>• Check your spam folder if you don't see the email</li>
                      <li>• You can use the same code for password reset</li>
                      <li>• Each code can only be used once</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                  <p className="text-xs text-yellow-800">
                    <strong>Debug Info:</strong> If emails aren't working, check the API response for verification_code in debug mode.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;