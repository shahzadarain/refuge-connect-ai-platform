
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LanguageToggle from '@/components/LanguageToggle';

interface RefugeeRegistrationProps {
  onBack: () => void;
}

const RefugeeRegistration: React.FC<RefugeeRegistrationProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    
    // Refugee-specific Information
    refugeeId: '',
    unhcrId: '',
    countryOfOrigin: '',
    currentLocation: '',
    
    // Account Security
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for refugee ID formatting
    if (name === 'refugeeId') {
      let formattedValue = value.replace(/[^\d]/g, ''); // Remove non-digits
      
      // Auto-format with 199- prefix
      if (formattedValue.length > 0) {
        if (formattedValue.length <= 8) {
          formattedValue = '199-' + formattedValue;
        } else {
          formattedValue = '199-' + formattedValue.slice(0, 8);
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateRefugeeId = (refugeeId: string): boolean => {
    const refugeeIdRegex = /^199-\d{8}$/;
    return refugeeIdRegex.test(refugeeId);
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('form.validation.required');
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('form.validation.required');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('form.validation.required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('form.validation.email');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('form.validation.required');
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = t('form.validation.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.refugeeId.trim()) {
      newErrors.refugeeId = t('form.validation.required');
    } else if (!validateRefugeeId(formData.refugeeId)) {
      newErrors.refugeeId = 'Refugee ID must be in format 199-######## (199 followed by exactly 8 digits)';
    }

    if (!formData.unhcrId.trim()) {
      newErrors.unhcrId = t('form.validation.required');
    }

    if (!formData.countryOfOrigin.trim()) {
      newErrors.countryOfOrigin = t('form.validation.required');
    }

    if (!formData.currentLocation.trim()) {
      newErrors.currentLocation = t('form.validation.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = t('form.validation.required');
    } else if (formData.password.length < 8) {
      newErrors.password = t('form.validation.password.length');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('form.validation.required');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('form.validation.password.match');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
    }

    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else if (isValid && currentStep === 3) {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setIsLoading(true);

    try {
      console.log('Submitting refugee registration:', formData);

      const response = await fetch('https://ab93e9536acd.ngrok.app/api/refugee/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          date_of_birth: formData.dateOfBirth,
          refugee_id: formData.refugeeId,
          unhcr_id: formData.unhcrId,
          country_of_origin: formData.countryOfOrigin,
          current_location: formData.currentLocation,
          password: formData.password
        })
      });

      const result = await response.json();
      console.log('Registration response:', result);

      if (response.ok) {
        toast({
          title: t('refugee.registration.success.title'),
          description: t('refugee.registration.success.description'),
        });
        onBack();
      } else {
        toast({
          title: t('refugee.registration.failed.title'),
          description: result.detail || result.message || t('refugee.registration.failed.description'),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: t('refugee.error.title'),
        description: t('refugee.error.description'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="firstName" className="label-modern">
          {t('form.first.name')} *
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          className={`input-modern ${errors.firstName ? 'border-red-300 focus:border-red-500' : ''}`}
          placeholder={t('refugee.form.first.name.placeholder')}
        />
        {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
      </div>

      <div>
        <label htmlFor="lastName" className="label-modern">
          {t('form.last.name')} *
        </label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          className={`input-modern ${errors.lastName ? 'border-red-300 focus:border-red-500' : ''}`}
          placeholder={t('refugee.form.last.name.placeholder')}
        />
        {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
      </div>

      <div>
        <label htmlFor="email" className="label-modern">
          {t('form.email')} *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={`input-modern ${errors.email ? 'border-red-300 focus:border-red-500' : ''}`}
          placeholder={t('refugee.form.email.placeholder')}
        />
        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="label-modern">
          {t('form.phone')} *
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className={`input-modern ${errors.phone ? 'border-red-300 focus:border-red-500' : ''}`}
          placeholder={t('refugee.form.phone.placeholder')}
        />
        {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="dateOfBirth" className="label-modern">
          {t('form.date.of.birth')} *
        </label>
        <input
          type="date"
          id="dateOfBirth"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleInputChange}
          className={`input-modern ${errors.dateOfBirth ? 'border-red-300 focus:border-red-500' : ''}`}
        />
        {errors.dateOfBirth && <p className="text-red-600 text-sm mt-1">{errors.dateOfBirth}</p>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="refugeeId" className="label-modern">
          {t('refugee.form.refugee.id')} *
        </label>
        <input
          type="text"
          id="refugeeId"
          name="refugeeId"
          value={formData.refugeeId}
          onChange={handleInputChange}
          className={`input-modern ${errors.refugeeId ? 'border-red-300 focus:border-red-500' : ''}`}
          placeholder="199-########"
          maxLength={12}
        />
        <p className="text-xs text-gray-500 mt-1">Format: 199-######## (199 followed by exactly 8 digits)</p>
        {errors.refugeeId && <p className="text-red-600 text-sm mt-1">{errors.refugeeId}</p>}
      </div>

      <div>
        <label htmlFor="unhcrId" className="label-modern">
          {t('refugee.form.unhcr.id')} *
        </label>
        <input
          type="text"
          id="unhcrId"
          name="unhcrId"
          value={formData.unhcrId}
          onChange={handleInputChange}
          className={`input-modern ${errors.unhcrId ? 'border-red-300 focus:border-red-500' : ''}`}
          placeholder={t('refugee.form.unhcr.id.placeholder')}
        />
        {errors.unhcrId && <p className="text-red-600 text-sm mt-1">{errors.unhcrId}</p>}
      </div>

      <div>
        <label htmlFor="countryOfOrigin" className="label-modern">
          {t('refugee.form.country.of.origin')} *
        </label>
        <input
          type="text"
          id="countryOfOrigin"
          name="countryOfOrigin"
          value={formData.countryOfOrigin}
          onChange={handleInputChange}
          className={`input-modern ${errors.countryOfOrigin ? 'border-red-300 focus:border-red-500' : ''}`}
          placeholder={t('refugee.form.country.of.origin.placeholder')}
        />
        {errors.countryOfOrigin && <p className="text-red-600 text-sm mt-1">{errors.countryOfOrigin}</p>}
      </div>

      <div>
        <label htmlFor="currentLocation" className="label-modern">
          {t('refugee.form.current.location')} *
        </label>
        <input
          type="text"
          id="currentLocation"
          name="currentLocation"
          value={formData.currentLocation}
          onChange={handleInputChange}
          className={`input-modern ${errors.currentLocation ? 'border-red-300 focus:border-red-500' : ''}`}
          placeholder={t('refugee.form.current.location.placeholder')}
        />
        {errors.currentLocation && <p className="text-red-600 text-sm mt-1">{errors.currentLocation}</p>}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="password" className="label-modern">
          {t('form.password')} *
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`input-modern pr-12 ${errors.password ? 'border-red-300 focus:border-red-500' : ''}`}
            placeholder={t('refugee.form.password.placeholder')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="label-modern">
          {t('form.confirm.password')} *
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`input-modern pr-12 ${errors.confirmPassword ? 'border-red-300 focus:border-red-500' : ''}`}
            placeholder={t('refugee.form.confirm.password.placeholder')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white">
      <div className="container-mobile py-4 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="btn-ghost p-2 -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <LanguageToggle />
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">
              {t('refugee.step')} {currentStep} {t('refugee.of')} 3
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / 3) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex flex-col">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {currentStep === 1 && t('refugee.personal.information')}
              {currentStep === 2 && t('refugee.refugee.information')}
              {currentStep === 3 && t('refugee.account.security')}
            </h1>
            <p className="text-sm text-gray-500">
              {currentStep === 1 && t('refugee.personal.description')}
              {currentStep === 2 && t('refugee.refugee.description')}
              {currentStep === 3 && t('refugee.security.description')}
            </p>
          </div>

          <div className="flex-1">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>

          {/* Navigation Buttons */}
          <div className="pt-6 space-y-3">
            <button
              onClick={handleNext}
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="spinner"></div>
                  <span>{t('refugee.creating.account')}</span>
                </div>
              ) : (
                currentStep === 3 ? t('refugee.create.account') : t('refugee.continue')
              )}
            </button>

            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="btn-ghost w-full"
              >
                {t('refugee.previous')}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default RefugeeRegistration;
