
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import FormField from './FormField';
import { ArrowLeft, Building, CheckCircle, Shield, User, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from './ui/checkbox';

interface CompanyData {
  legal_name: string;
  country_of_registration: string;
  registration_number: string;
  website: string;
  number_of_employees: string;
  about_company: string;
}

interface AdminData {
  full_name: string;
  email: string;
  phone: string;
  preferred_language: string;
  password: string;
  confirm_password: string;
}

interface EmployerRegistrationProps {
  onBack: () => void;
}

const EmployerRegistration: React.FC<EmployerRegistrationProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const [companyData, setCompanyData] = useState<CompanyData>({
    legal_name: '',
    country_of_registration: 'Jordan',
    registration_number: '',
    website: '',
    number_of_employees: '',
    about_company: ''
  });

  const [adminData, setAdminData] = useState<AdminData>({
    full_name: '',
    email: '',
    phone: '',
    preferred_language: 'en',
    password: '',
    confirm_password: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const employeeOptions = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '500+', label: '500+ employees' }
  ];

  const countryOptions = [
    { value: 'Jordan', label: 'Jordan' },
    { value: 'Syria', label: 'Syria' },
    { value: 'Lebanon', label: 'Lebanon' },
    { value: 'Turkey', label: 'Turkey' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Company validation
    if (!companyData.legal_name) newErrors.legal_name = 'Company name is required';
    if (!companyData.country_of_registration) newErrors.country_of_registration = 'Country is required';
    if (!companyData.registration_number) newErrors.registration_number = 'Registration number is required';
    if (!companyData.number_of_employees) newErrors.number_of_employees = 'Number of employees is required';

    // Admin validation
    if (!adminData.full_name) newErrors.full_name = 'Full name is required';
    if (!adminData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(adminData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!adminData.phone) newErrors.phone = 'Phone number is required';
    if (!adminData.password) {
      newErrors.password = 'Password is required';
    } else if (adminData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (adminData.password !== adminData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the Terms of Service and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (password: string): { strength: number; text: string; color: string } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { text: 'Very Weak', color: 'text-red-500' },
      { text: 'Weak', color: 'text-red-400' },
      { text: 'Fair', color: 'text-yellow-500' },
      { text: 'Good', color: 'text-blue-500' },
      { text: 'Strong', color: 'text-green-500' }
    ];

    return { strength, ...levels[strength] };
  };

  const passwordStrength = getPasswordStrength(adminData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      console.log('Starting registration request...');

      const response = await fetch('https://ab93e9536acd.ngrok.app/api/employer/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          company: companyData,
          admin: adminData
        })
      });

      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (parseError) {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Registration successful:', result);
      
      toast({
        title: "Application Submitted!",
        description: "We'll review your application and contact you within 2-3 business days.",
      });
      
      setIsSuccess(true);
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to the server. Please check your connection and try again.';
        } else if (error.message.includes('NetworkError')) {
          errorMessage = 'Network error. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container-mobile py-8">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>

            <div>
              <h1 className="text-display text-gray-900 mb-4">Application Submitted!</h1>
              <p className="text-body text-gray-500 mb-6">
                Thank you for your application. We'll review your information and contact you within 2-3 business days.
              </p>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  You'll receive an email confirmation shortly with next steps.
                </p>
              </div>
            </div>

            <button
              onClick={onBack}
              className="btn-primary w-full"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container-mobile py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-display text-gray-900 mb-2">Register Your Company</h1>
          <p className="text-body text-gray-500">
            Join Refugee Connect to post jobs and connect with qualified candidates. Registration is free.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: About Your Organization */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-heading text-gray-900">About Your Organization</h2>
            </div>

            <FormField
              label="Company Name"
              name="legal_name"
              value={companyData.legal_name}
              onChange={(value) => setCompanyData({ ...companyData, legal_name: value })}
              placeholder="Enter your company name"
              required
              error={errors.legal_name}
            />

            <FormField
              label="Country of Registration"
              name="country_of_registration"
              type="select"
              value={companyData.country_of_registration}
              onChange={(value) => setCompanyData({ ...companyData, country_of_registration: value })}
              options={countryOptions}
              required
              error={errors.country_of_registration}
            />

            <FormField
              label="Company Registration Number"
              name="registration_number"
              value={companyData.registration_number}
              onChange={(value) => setCompanyData({ ...companyData, registration_number: value })}
              placeholder="Enter registration number"
              required
              error={errors.registration_number}
              helpText="This is used to verify your company's legitimacy and ensure a safe platform for all users. It will not be displayed publicly."
            />

            <FormField
              label="Website (Optional)"
              name="website"
              type="url"
              value={companyData.website}
              onChange={(value) => setCompanyData({ ...companyData, website: value })}
              placeholder="https://www.example.com"
            />

            <FormField
              label="Number of Employees"
              name="number_of_employees"
              type="select"
              value={companyData.number_of_employees}
              onChange={(value) => setCompanyData({ ...companyData, number_of_employees: value })}
              options={employeeOptions}
              required
              error={errors.number_of_employees}
            />

            <FormField
              label="About Your Company (Optional)"
              name="about_company"
              type="textarea"
              value={companyData.about_company}
              onChange={(value) => setCompanyData({ ...companyData, about_company: value })}
              placeholder="Brief description of your company and mission"
              rows={4}
            />
          </div>

          {/* Section 2: Primary Contact Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-heading text-gray-900">Your Primary Contact Details</h2>
                <p className="text-sm text-gray-500">This is the person who will manage the account.</p>
              </div>
            </div>

            <FormField
              label="Full Name"
              name="full_name"
              value={adminData.full_name}
              onChange={(value) => setAdminData({ ...adminData, full_name: value })}
              placeholder="Enter your full name"
              required
              error={errors.full_name}
            />

            <FormField
              label="Email Address"
              name="email"
              type="email"
              value={adminData.email}
              onChange={(value) => setAdminData({ ...adminData, email: value })}
              placeholder="admin@company.com"
              required
              error={errors.email}
            />

            <FormField
              label="Phone Number"
              name="phone"
              type="tel"
              value={adminData.phone}
              onChange={(value) => setAdminData({ ...adminData, phone: value })}
              placeholder="+962791234567"
              required
              error={errors.phone}
            />

            <FormField
              label="Preferred Language"
              name="preferred_language"
              type="select"
              value={adminData.preferred_language}
              onChange={(value) => setAdminData({ ...adminData, preferred_language: value })}
              options={languageOptions}
              required
            />
          </div>

          {/* Section 3: Account Security */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-heading text-gray-900">Account Security</h2>
            </div>

            <div className="space-y-2">
              <FormField
                label="Password"
                name="password"
                type="password"
                value={adminData.password}
                onChange={(value) => setAdminData({ ...adminData, password: value })}
                placeholder="Create a secure password"
                required
                error={errors.password}
              />
              {adminData.password && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.strength <= 1 ? 'bg-red-500' :
                        passwordStrength.strength <= 2 ? 'bg-yellow-500' :
                        passwordStrength.strength <= 3 ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${passwordStrength.color}`}>
                    {passwordStrength.text}
                  </span>
                </div>
              )}
            </div>

            <FormField
              label="Confirm Password"
              name="confirm_password"
              type="password"
              value={adminData.confirm_password}
              onChange={(value) => setAdminData({ ...adminData, confirm_password: value })}
              placeholder="Confirm your password"
              required
              error={errors.confirm_password}
            />
          </div>

          {/* Terms Agreement */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                By creating an account, I agree to the{' '}
                <button type="button" className="text-blue-500 hover:text-blue-600 underline">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-blue-500 hover:text-blue-600 underline">
                  Privacy Policy
                </button>
                .
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-600">{errors.terms}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting Application...' : 'Submit Application for Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployerRegistration;
