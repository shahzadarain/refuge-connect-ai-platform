import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/useSession';
import { sendForgotPasswordEmail } from '@/utils/emailApi';
import { useLocation } from 'react-router-dom';
import LanguageToggle from '@/components/LanguageToggle';
import { API_CONFIG, buildApiUrl } from '../config/apiConfig'; // ✅ FIXED: relative import

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
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateTokenPayload = (token: string, userType: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);

      if (userType === 'employer_admin' && (!decoded.company_id || !decoded.role)) {
        toast({
          title: t('login.error.session.title'),
          description: t('login.error.session.description'),
          variant: 'destructive',
        });
        return false;
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
      // Super admin login
      const adminResponse = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.LOGIN_ADMIN), {
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
        if (result.access_token && validateTokenPayload(result.access_token, 'super_admin')) {
          login({
            id: result.user_id,
            email: formData.email,
            user_type: 'super_admin',
            phone: '',
            is_active: true,
            is_verified: true,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            has_consented_data_protection: true
          });
          localStorage.setItem('access_token', result.access_token);
          toast({ title: t('login.success.title'), description: t('login.success.admin.description') });
          onLoginSuccess('super_admin');
          return;
        }
      }

      // Employer login
      const employerResponse = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.LOGIN_EMPLOYER), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(formData)
      });

      if (employerResponse.ok) {
        const result = await employerResponse.json();
        if (result.access_token) {
          let companyId, role, userType = 'employer_admin';
          try {
            const base64Url = result.access_token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const decoded = JSON.parse(jsonPayload);
            companyId = decoded.company_id;
            role = decoded.role;
            userType = decoded.user_type || 'employer_admin';
          } catch (error) {
            console.error('Error extracting token data:', error);
          }

          if (validateTokenPayload(result.access_token, userType)) {
            login({
              id: result.user_id,
              email: formData.email,
              user_type: userType as 'employer_admin' | 'company_user',
              first_name: result.first_name,
              last_name: result.last_name,
              phone: '',
              is_active: true,
              is_verified: true,
              created_at: new Date().toISOString(),
              last_login: new Date().toISOString(),
              company_id: companyId,
              role: role,
              has_consented_data_protection: true
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
      }

      // Refugee login
      const refugeeResponse = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.LOGIN_REFUGEE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(formData)
      });

      if (refugeeResponse.ok) {
        const result = await refugeeResponse.json();
        if (result.access_token && validateTokenPayload(result.access_token, 'refugee')) {
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
            has_consented_data_protection: false
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

      // All login attempts failed
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
      await sendForgotPasswordEmail({ email: formData.email });
      toast({
        title: t('login.forgot.success.title'),
        description: t('login.forgot.success.description'),
      });
    } catch (error: any) {
      let errorMessage = t('login.forgot.error.default');
      if (error.message?.includes('Failed to fetch')) {
        errorMessage = t('refugee.error.network');
      } else if (error.message?.includes('NetworkError')) {
        errorMessage = t('refugee.error.server');
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
      <div className="container-mobile py-4 min-h-screen flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="btn-ghost p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <LanguageToggle />
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-6">
          <div className="text-center space-y-3">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {t('login.welcome.back')}
            </h1>
            <p className="text-sm text-gray-500">
              {t('login.welcome.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="label-modern">{t('form.email')}</label>
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
                <label htmlFor="password" className="label-modern">{t('form.password')}</label>
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

            <div className="space-y-3">
              <button type="submit" disabled={isLoading} className="btn-primary w-full">
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
                  className="btn-ghost text-sm"
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
