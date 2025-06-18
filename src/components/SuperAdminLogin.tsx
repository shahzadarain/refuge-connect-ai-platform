import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Shield, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/useSession';

interface SuperAdminLoginProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

const SuperAdminLogin: React.FC<SuperAdminLoginProps> = ({ onBack, onLoginSuccess }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { login } = useSession();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Attempting super admin login with:', formData);

      const response = await fetch('https://ab93e9536acd.ngrok.app/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      console.log('Super admin login response:', result);

      if (response.ok && result.access_token) {
        // Store user session based on actual API response structure
        login({
          id: result.user_id,
          email: formData.email, // Use email from form since API doesn't return it
          user_type: result.user_type,
          phone: formData.phone, // Use phone from form since API doesn't return it
          is_active: true, // Assume active if login successful
          is_verified: true, // Assume verified if login successful
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        });

        // Store access token for future API calls
        localStorage.setItem('access_token', result.access_token);

        toast({
          title: "Login Successful",
          description: "Welcome to Super Admin Dashboard",
        });
        onLoginSuccess();
      } else {
        toast({
          title: "Login Failed",
          description: result.message || result.detail || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Super admin login error:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
                <Shield className="w-8 h-8 text-un-blue" />
              </div>
              <h1 className="text-h2-mobile font-bold text-neutral-gray mb-2">
                Super Admin Login
              </h1>
              <p className="text-body-mobile text-neutral-gray/70">
                Access the admin dashboard
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
                  placeholder="Enter admin email"
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

              <div>
                <label htmlFor="phone" className="block text-small-mobile font-medium text-neutral-gray mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? 'Logging in...' : 'Login to Dashboard'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
