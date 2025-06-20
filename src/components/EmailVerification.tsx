import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Mail, Shield, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';

interface EmailVerificationProps {
  onBack: () => void;
  onVerificationSuccess: () => void;
  email?: string;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ 
  onBack, 
  onVerificationSuccess,
  email 
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handleVerifyCode = async () => {
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
      console.log('Verifying email with code:', verificationCode);

      const response = await fetch('https://ab93e9536acd.ngrok.app/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          verification_code: verificationCode,
          email: email
        })
      });

      console.log('Verification response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Verification failed';
        
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
      console.log('Verification successful:', result);

      toast({
        title: "Email Verified!",
        description: "Your account has been verified successfully. You can now log in.",
      });

      onVerificationSuccess();
    } catch (error) {
      console.error('Verification error:', error);
      
      let errorMessage = 'Verification failed';
      
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

  const handleResendCode = async () => {
    try {
      console.log('Resending verification code for:', email);
      
      const response = await fetch('https://ab93e9536acd.ngrok.app/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ email })
      });

      console.log('Resend verification response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Failed to resend code';
        
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
      console.log('Resend verification successful:', result);

      toast({
        title: "Code Resent",
        description: "A new verification code has been sent to your email. The code will expire in 3 hours.",
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      
      let errorMessage = 'Failed to resend verification code';
      
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
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Email address is required for password reset.",
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
                We've sent a 6-digit verification code to:
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
                    onChange={setVerificationCode}
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
              </div>

              <button
                onClick={handleVerifyCode}
                disabled={isVerifying || verificationCode.length !== 6}
                className="btn-primary w-full disabled:opacity-50"
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
                    className="btn-secondary w-full text-small-mobile font-medium"
                  >
                    Resend Code
                  </button>
                  <button
                    onClick={handleForgotPassword}
                    disabled={isSendingReset}
                    className="btn-secondary w-full text-small-mobile font-medium disabled:opacity-50"
                  >
                    {isSendingReset ? 'Sending Reset Link...' : 'Forgot Password?'}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-small-mobile font-medium text-blue-800 mb-1">
                      Security Note
                    </p>
                    <p className="text-xs text-blue-700">
                      The verification code expires in 3 hours. If you don't verify your email within this time, you'll need to request a new code.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
