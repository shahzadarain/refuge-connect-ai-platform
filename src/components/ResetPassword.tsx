import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { sendForgotPasswordEmail } from '@/utils/emailApi';
import { API_CONFIG, buildApiUrl } from '../config/api'; // ✅ added this

const ResetPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) setEmail(emailParam);
  }, [location]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({ title: "Email Required", description: "Email address is required for password reset.", variant: "destructive" });
      return;
    }

    if (verificationCode.length !== 6) {
      toast({ title: "Invalid Code", description: "Please enter the complete 6-digit verification code.", variant: "destructive" });
      return;
    }

    if (newPassword.length < 6) {
      toast({ title: "Password Too Short", description: "Password must be at least 6 characters long.", variant: "destructive" });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords Don't Match", description: "Please ensure both password fields match.", variant: "destructive" });
      return;
    }

    setIsResetting(true);

    try {
      const response = await fetch(buildApiUrl('/api/reset-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ email, verification_code: verificationCode, new_password: newPassword })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to reset password';

        try {
          const errorData = await response.json();

          if (response.status === 400) {
            errorMessage = 'Invalid or expired verification code. Please request a new code.';
          } else if (response.status === 403) {
            errorMessage = 'Account is deactivated. Please contact support.';
          } else if (response.status === 404) {
            errorMessage = 'User not found. Please check your email address.';
          } else {
            errorMessage = errorData.detail || errorData.message || errorMessage;
          }
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      await response.json();

      toast({
        title: "Password Reset Successful",
        description: "Your password has been reset successfully. You can now login with your new password.",
      });

      navigate('/?action=login&reset=success');

    } catch (error) {
      let errorMessage = 'Failed to reset password';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Unable to connect to the server.';
        } else if (error.message.includes('NetworkError')) {
          errorMessage = 'Network error: The server may be temporarily unavailable.';
        } else {
          errorMessage = error.message;
        }
      }

      toast({ title: "Reset Failed", description: errorMessage, variant: "destructive" });

    } finally {
      setIsResetting(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Email address is required to resend verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsResendingCode(true);

    try {
      await sendForgotPasswordEmail({ email });
      toast({ title: "Code Sent", description: "A new verification code has been sent to your email." });
    } catch (error) {
      let errorMessage = 'Failed to resend verification code';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Unable to connect to the server.';
        } else if (error.message.includes('NetworkError')) {
          errorMessage = 'Server may be temporarily unavailable.';
        } else {
          errorMessage = error.message;
        }
      }

      toast({ title: "Resend Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsResendingCode(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-neutral-gray hover:text-un-blue transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <div className="form-card">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-un-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-un-blue" />
              </div>
              <h1 className="text-h2-mobile font-bold text-neutral-gray mb-2">Reset Your Password</h1>
              <p className="text-body-mobile text-neutral-gray/70">
                Enter the verification code sent to your email and create a new password
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-small-mobile font-medium text-neutral-gray mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input bg-gray-50"
                  placeholder="Enter your email"
                  required
                  readOnly={!!new URLSearchParams(location.search).get('email')}
                />
              </div>

              <div>
                <label className="block text-small-mobile font-medium text-neutral-gray mb-2">Verification Code *</label>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode}>
                    <InputOTPGroup>
                      {[...Array(6)].map((_, index) => <InputOTPSlot key={index} index={index} />)}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <div className="text-center mt-2">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isResendingCode}
                    className="text-un-blue hover:text-un-blue/80 text-small-mobile font-medium disabled:opacity-50"
                  >
                    {isResendingCode ? 'Sending...' : 'Resend Code'}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-small-mobile font-medium text-neutral-gray mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input pr-10"
                    placeholder="Enter new password (min 6 characters)"
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
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-small-mobile font-medium text-neutral-gray mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input pr-10"
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
              </div>

              <button type="submit" disabled={isResetting} className="btn-primary w-full">
                {isResetting ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
