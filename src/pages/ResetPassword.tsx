import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  console.log('ResetPassword component mounted');
  
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    console.log('Current URL search params:', window.location.search);
    console.log('Search params:', searchParams.toString());
    
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');
    
    console.log('Email param:', emailParam);
    console.log('Token param:', tokenParam);
    
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
    
    if (tokenParam) {
      setToken(tokenParam);
    }
    
    // If no email or token, redirect to home
    if (!emailParam || !tokenParam || tokenParam === 'SECURE_TOKEN_HERE') {
      console.log('Invalid reset link detected, redirecting to home');
      toast({
        title: "Invalid Reset Link",
        description: "This password reset link is invalid or has expired. Please request a new one.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [searchParams, navigate, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both password fields match.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);

    try {
      console.log('Resetting password for:', email);
      
      // In a real implementation, you would validate the token with your backend
      // For now, we'll use Supabase's built-in password reset
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated successfully. You can now log in with your new password.",
      });

      // Redirect to login page
      navigate('/?action=login');
    } catch (error) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'Failed to reset password';
      
      if (error instanceof Error) {
        errorMessage = error.message;
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
                Enter your new password below
              </p>
              {email && (
                <p className="text-body-mobile font-medium text-un-blue bg-blue-50 px-4 py-2 rounded-lg">
                  {email}
                </p>
              )}
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
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

              <button
                type="submit"
                disabled={isResetting || !newPassword || !confirmPassword}
                className="btn-primary w-full disabled:opacity-50"
              >
                {isResetting ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>

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
