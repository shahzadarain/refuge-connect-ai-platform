
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { buildApiUrl } from '@/config/api';
import { sendForgotPasswordEmail } from '@/utils/emailApi';

interface UseEmailVerificationProps {
  email?: string;
  onVerificationSuccess: () => void;
}

export const useEmailVerification = ({ email, onVerificationSuccess }: UseEmailVerificationProps) => {
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

      const response = await fetch(buildApiUrl('/api/verify-email'), {
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
      
      const response = await fetch(buildApiUrl('/api/resend-verification'), {
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
      await sendForgotPasswordEmail({ email });
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

  return {
    verificationCode,
    setVerificationCode,
    isVerifying,
    isSendingReset,
    handleVerifyCode,
    handleResendCode,
    handleForgotPassword
  };
};
