import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, User, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/useSession';

interface UnifiedLoginProps {
  onBack: () => void;
  onLoginSuccess: (userType: string) => void;
}

const UnifiedLogin: React.FC<UnifiedLoginProps> = ({ onBack, onLoginSuccess }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { login } = useSession();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateTokenPayload = (token: string, userType: string) => {
    try {
      // Basic JWT decode (without verification - just for checking payload)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decoded = JSON.parse(jsonPayload);
      console.log('Token payload validation:', decoded);
      
      // Check if employer_admin has required fields
      if (userType === 'employer_admin') {
        if (!decoded.company_id || !decoded.role) {
          console.warn('Token missing required fields for employer_admin:', {
            has_company_id: !!decoded.company_id,
            has_role: !!decoded.role
          });
          
          toast({
            title: "Session Error",
            description: "Your login token is missing required company information. Please contact support if this persists.",
            variant: "destructive",
          });
          
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error validating token payload:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Attempting unified login with:', formData);

      // Try super admin login first
      const adminResponse = await fetch('https://ab93e9536acd.ngrok.app/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(formData)
      });

      if (adminResponse.ok) {
        const result = await adminResponse.json();
        console.log('Super admin login successful:', result);

        if (result.access_token) {
          // Validate token payload
          if (!validateTokenPayload(result.access_token, 'super_admin')) {
            return;
          }

          login({
            id: result.user_id,
            email: formData.email,
            user_type: 'super_admin',
            phone: '',
            is_active: true,
            is_verified: true,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
          });

          localStorage.setItem('access_token', result.access_token);

          toast({
            title: "Login Successful",
            description: `Welcome Super Admin`,
          });
          
          onLoginSuccess('super_admin');
          return;
        }
      }

      // If admin login fails, try employer login
      const employerResponse = await fetch('https://ab93e9536acd.ngrok.app/api/employer/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (employerResponse.ok) {
        const result = await employerResponse.json();
        console.log('Employer login successful:', result);

        if (result.access_token) {
          // Decode token to extract user details including correct user_type
          let companyId = undefined;
          let role = undefined;
          let userType = 'employer_admin'; // default fallback
          
          try {
            const base64Url = result.access_token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const decoded = JSON.parse(jsonPayload);
            console.log('Decoded token payload:', decoded);
            
            companyId = decoded.company_id;
            role = decoded.role;
            userType = decoded.user_type || 'employer_admin'; // Use actual user_type from token
          } catch (error) {
            console.error('Error extracting token data:', error);
          }

          // Validate token payload with the correct user_type
          if (!validateTokenPayload(result.access_token, userType)) {
            return;
          }

          login({
            id: result.user_id,
            email: formData.email,
            user_type: userType as 'employer_admin' | 'company_user', // Use the actual user_type from token
            first_name: result.first_name,
            last_name: result.last_name,
            phone: '',
            is_active: true,
            is_verified: true,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            company_id: companyId,
            role: role
          });

          localStorage.setItem('access_token', result.access_token);

          toast({
            title: "Login Successful",
            description: `Welcome ${result.first_name || 'User'}`,
          });
          
          onLoginSuccess(userType);
          return;
        }
      }

      // If both fail, try refugee login
      const refugeeResponse = await fetch('https://ab93e9536acd.ngrok.app/api/refugee/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (refugeeResponse.ok) {
        const result = await refugeeResponse.json();
        console.log('Refugee login successful:', result);

        if (result.access_token) {
          // Validate token payload
          if (!validateTokenPayload(result.access_token, 'refugee')) {
            return;
          }

          login({
            id: result.user_id,
            email: formData.email,
            user_type: 'refugee',
            first_name: result.first_name,
            last_name: result.last_name,
            phone: '',
            is_active: true,
            is_verified: true,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
          });

          localStorage.setItem('access_token', result.access_token);

          toast({
            title: "Login Successful",
            description: `Welcome ${result.first_name || 'User'}`,
          });
          
          onLoginSuccess('refugee');
          return;
        }
      }

      // If all login attempts fail
      toast({
        title: "Login Failed",
        description: "Invalid credentials or account not found",
        variant: "destructive",
      });

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingReset(true);

    try {
      console.log('Sending password reset for:', formData.email);
      
      // Generate a secure reset URL (this would typically come from your backend)
      const resetUrl = `${window.location.origin}/reset-password?email=${encodeURIComponent(formData.email)}&token=SECURE_TOKEN_HERE`;
      
      const { data, error } = await supabase.functions.invoke('send-password-reset-email', {
        body: { 
          email: formData.email,
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
            Back to Home
          </button>

          <div className="form-card">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-un-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-un-blue" />
              </div>
              <h1 className="text-h2-mobile font-bold text-neutral-gray mb-2">
                Login to Your Account
              </h1>
              <p className="text-body-mobile text-neutral-gray/70">
                Enter your credentials to access the platform
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-small-mobile font-medium text-neutral-gray mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-small-mobile font-medium text-neutral-gray mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input pr-10"
                    placeholder="Enter password"
                    required
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

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isSendingReset}
                  className="text-un-blue hover:text-un-blue/80 text-small-mobile font-medium disabled:opacity-50"
                >
                  {isSendingReset ? 'Sending Reset Link...' : 'Forgot Password?'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogin;
