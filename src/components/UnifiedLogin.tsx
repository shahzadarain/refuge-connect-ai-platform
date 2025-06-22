import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, User, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/useSession';
import { sendForgotPasswordEmail } from '@/utils/emailApi';
import { useLocation } from 'react-router-dom';
import LanguageToggle from '@/components/LanguageToggle';

interface UnifiedLoginProps {
  onBack: () => void;
  onLoginSuccess: (userType: string) => void;
  onUNHCRValidationRequest?: (email: string) => void;
}

const UnifiedLogin: React.FC<UnifiedLoginProps> = ({ onBack, onLoginSuccess, onUNHCRValidationRequest }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { login } = useSession();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check for password reset success message
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const resetSuccess = urlParams.get('reset');
    
    if (resetSuccess === 'success') {
      toast({
        title: t('login.password.reset.success.title'),
        description: t('login.password.reset.success.description'),
      });
    }
  }, [location, toast, t]);

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
            title: t('login.error.session.title'),
            description: t('login.error.session.description'),
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
            last_login: new Date().toISOString(),
            has_consented_data_protection: true // Super admin doesn't need consent
          });

          localStorage.setItem('access_token', result.access_token);

          toast({
            title: t('login.success.title'),
            description: t('login.success.admin.description'),
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
            role: role,
            has_consented_data_protection: true // Employers don't need consent
          });

          localStorage.setItem('access_token', result.access_token);

          toast({
            title: t('login.success.title'),
            description: t('login.success.user.description').replace('{name}', result.first_name || t('login.success.user.fallback')),
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
            last_login: new Date().toISOString(),
            has_consented_data_protection: false // Refugees need to consent on first login
          });

          localStorage.setItem('access_token', result.access_token);

          toast({
            title: t('login.success.title'),
            description: t('login.success.user.description').replace('{name}', result.first_name || t('login.success.user.fallback')),
          });
          
          onLoginSuccess('refugee');
          return;
        }
      }

      // If all login attempts fail
      toast({
        title: t('login.failed.title'),
        description: t('login.failed.description'),
        variant: "destructive",
      });

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: t('login.error.title'),
        description: t('login.error.description'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast({
        title: t('login.forgot.email.required.title'),
        description: t('login.forgot.email.required.description'),
        variant: "destructive",
      });
      return;
    }

    setIsSendingReset(true);

    try {
      console.log('Sending password reset for:', formData.email);
      
      await sendForgotPasswordEmail({ email: formData.email });

      toast({
        title: t('login.forgot.success.title'),
        description: t('login.forgot.success.description'),
      });
    } catch (error) {
      console.error('Password reset error:', error);
      
      let errorMessage = t('login.forgot.error.default');
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = t('refugee.error.network');
        } else if (error.message.includes('NetworkError')) {
          errorMessage = t('refugee.error.server');
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: t('login.error.title'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="container-mobile py-6 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="btn-ghost p-2 -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <LanguageToggle />
        </div>

        {/* Login Form */}
        <div className="flex-1 flex flex-col justify-center space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-title text-gray-900 mb-2">
                {t('login.welcome.back')}
              </h1>
              <p className="text-body-sm text-gray-500">
                {t('login.welcome.subtitle')}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="label-modern">
                  {t('form.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-modern"
                  placeholder={t('login.email.placeholder')}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="label-modern">
                  {t('form.password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input-modern pr-12"
                    placeholder={t('login.password.placeholder')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="spinner"></div>
                    <span>{t('login.signing.in')}</span>
                  </div>
                ) : (
                  t('login.sign.in')
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isSendingReset}
                  className="btn-ghost"
                >
                  {isSendingReset ? t('login.forgot.sending') : t('login.forgot.password')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default UnifiedLogin;
