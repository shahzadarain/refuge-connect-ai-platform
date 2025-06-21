
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, ArrowRight, User, FileText, MapPin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface RefugeeRegistrationProps {
  onBack: () => void;
}

const RefugeeRegistration: React.FC<RefugeeRegistrationProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Form state
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    
    // Professional Information
    education: '',
    workExperience: '',
    skills: '',
    languages: '',
    professionalSummary: '',
    
    // Location & Preferences
    currentLocation: '',
    preferredWorkLocation: '',
    jobType: '',
    salaryExpectation: '',
    canRelocate: false,
    
    // Account Security
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Handle form submission logic here
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return User;
      case 2: return FileText;
      case 3: return MapPin;
      default: return User;
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Personal Information';
      case 2: return 'Professional Background';
      case 3: return 'Preferences & Security';
      default: return '';
    }
  };

  const renderProgressIndicator = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        {[1, 2, 3].map((step) => {
          const Icon = getStepIcon(step);
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          
          return (
            <div key={step} className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-200 ${
                isCompleted 
                  ? 'bg-blue-500 text-white' 
                  : isActive 
                    ? 'bg-blue-100 text-blue-500 border-2 border-blue-500' 
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
              </div>
              <span className={`text-xs text-center font-medium ${
                isActive ? 'text-blue-500' : isCompleted ? 'text-blue-500' : 'text-gray-400'
              }`}>
                {getStepTitle(step)}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
      <p className="text-sm text-gray-500 text-center">
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  );

  const renderPersonalInformation = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-heading font-semibold text-gray-900 mb-2">
          Personal Information
        </h2>
        <p className="text-body-sm text-gray-500">
          Let's start with your basic information
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name*</Label>
          <Input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="Enter first name"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name*</Label>
          <Input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Enter last name"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email Address*</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="your.email@example.com"
        />
      </div>

      <div>
        <Label htmlFor="phoneNumber">Phone Number*</Label>
        <Input
          id="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
          placeholder="+962 7X XXX XXXX"
        />
      </div>

      <div>
        <Label htmlFor="dateOfBirth">Date of Birth*</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="gender">Gender*</Label>
        <select
          id="gender"
          value={formData.gender}
          onChange={(e) => handleInputChange('gender', e.target.value)}
          className="input-modern"
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer-not-to-say">Prefer not to say</option>
        </select>
      </div>

      <div>
        <Label htmlFor="nationality">Nationality*</Label>
        <Input
          id="nationality"
          type="text"
          value={formData.nationality}
          onChange={(e) => handleInputChange('nationality', e.target.value)}
          placeholder="e.g., Syrian, Iraqi, Palestinian"
        />
      </div>
    </div>
  );

  const renderProfessionalBackground = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-heading font-semibold text-gray-900 mb-2">
          Professional Background
        </h2>
        <p className="text-body-sm text-gray-500">
          Tell us about your education and experience
        </p>
      </div>

      <div>
        <Label htmlFor="education">Education Level*</Label>
        <select
          id="education"
          value={formData.education}
          onChange={(e) => handleInputChange('education', e.target.value)}
          className="input-modern"
        >
          <option value="">Select education level</option>
          <option value="high-school">High School</option>
          <option value="diploma">Diploma</option>
          <option value="bachelor">Bachelor's Degree</option>
          <option value="master">Master's Degree</option>
          <option value="phd">PhD</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <Label htmlFor="workExperience">Work Experience*</Label>
        <select
          id="workExperience"
          value={formData.workExperience}
          onChange={(e) => handleInputChange('workExperience', e.target.value)}
          className="input-modern"
        >
          <option value="">Select experience level</option>
          <option value="entry">Entry Level (0-1 years)</option>
          <option value="junior">Junior (1-3 years)</option>
          <option value="mid">Mid-level (3-5 years)</option>
          <option value="senior">Senior (5-10 years)</option>
          <option value="expert">Expert (10+ years)</option>
        </select>
      </div>

      <div>
        <Label htmlFor="skills">Skills*</Label>
        <Input
          id="skills"
          type="text"
          value={formData.skills}
          onChange={(e) => handleInputChange('skills', e.target.value)}
          placeholder="e.g., Microsoft Office, Customer Service, Arabic, English"
        />
        <p className="text-xs text-gray-500 mt-1">
          Separate skills with commas
        </p>
      </div>

      <div>
        <Label htmlFor="languages">Languages*</Label>
        <Input
          id="languages"
          type="text"
          value={formData.languages}
          onChange={(e) => handleInputChange('languages', e.target.value)}
          placeholder="e.g., Arabic (Native), English (Fluent), French (Basic)"
        />
      </div>

      <div>
        <Label htmlFor="professionalSummary">Professional Summary (Optional)</Label>
        <Textarea
          id="professionalSummary"
          value={formData.professionalSummary}
          onChange={(e) => handleInputChange('professionalSummary', e.target.value)}
          placeholder="Brief description of your professional background and career goals..."
          rows={4}
        />
        <p className="text-xs text-gray-500 mt-1">
          This will help employers understand your background better
        </p>
      </div>
    </div>
  );

  const renderPreferencesAndSecurity = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-heading font-semibold text-gray-900 mb-2">
          Job Preferences & Account Security
        </h2>
        <p className="text-body-sm text-gray-500">
          Final step to complete your profile
        </p>
      </div>

      <div>
        <Label htmlFor="currentLocation">Current Location*</Label>
        <Input
          id="currentLocation"
          type="text"
          value={formData.currentLocation}
          onChange={(e) => handleInputChange('currentLocation', e.target.value)}
          placeholder="City, Country"
        />
      </div>

      <div>
        <Label htmlFor="preferredWorkLocation">Preferred Work Location*</Label>
        <select
          id="preferredWorkLocation"
          value={formData.preferredWorkLocation}
          onChange={(e) => handleInputChange('preferredWorkLocation', e.target.value)}
          className="input-modern"
        >
          <option value="">Select preferred location</option>
          <option value="amman">Amman</option>
          <option value="irbid">Irbid</option>
          <option value="zarqa">Zarqa</option>
          <option value="aqaba">Aqaba</option>
          <option value="remote">Remote Work</option>
          <option value="flexible">Flexible</option>
        </select>
      </div>

      <div>
        <Label htmlFor="jobType">Preferred Job Type*</Label>
        <select
          id="jobType"
          value={formData.jobType}
          onChange={(e) => handleInputChange('jobType', e.target.value)}
          className="input-modern"
        >
          <option value="">Select job type</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
          <option value="flexible">Flexible</option>
        </select>
      </div>

      <div>
        <Label htmlFor="salaryExpectation">Salary Expectation (JOD/month)</Label>
        <select
          id="salaryExpectation"
          value={formData.salaryExpectation}
          onChange={(e) => handleInputChange('salaryExpectation', e.target.value)}
          className="input-modern"
        >
          <option value="">Select salary range</option>
          <option value="200-400">200-400 JOD</option>
          <option value="400-600">400-600 JOD</option>
          <option value="600-800">600-800 JOD</option>
          <option value="800-1000">800-1000 JOD</option>
          <option value="1000-1500">1000-1500 JOD</option>
          <option value="1500+">1500+ JOD</option>
        </select>
      </div>

      <div className="flex items-center space-x-3">
        <Checkbox
          id="canRelocate"
          checked={formData.canRelocate}
          onCheckedChange={(checked) => handleInputChange('canRelocate', checked)}
        />
        <Label htmlFor="canRelocate" className="text-sm">
          I am willing to relocate for the right opportunity
        </Label>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Security</h3>
        
        <div>
          <Label htmlFor="password">Password*</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="Create a strong password"
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password*</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            placeholder="Confirm your password"
          />
        </div>

        <div className="flex items-start space-x-3 mt-6">
          <Checkbox
            id="agreeToTerms"
            checked={formData.agreeToTerms}
            onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
            className="mt-1"
          />
          <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed">
            By creating an account, I agree to the{' '}
            <a href="#" className="text-blue-500 hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>
          </Label>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderPersonalInformation();
      case 2: return renderProfessionalBackground();
      case 3: return renderPreferencesAndSecurity();
      default: return renderPersonalInformation();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-mobile py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="btn-ghost mb-4 -ml-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          
          <div className="text-center">
            <h1 className="text-display font-bold text-gray-900 mb-2">
              Find Your Next Job
            </h1>
            <p className="text-body text-gray-500">
              Create your profile and get matched with opportunities in Jordan
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        {renderProgressIndicator()}

        {/* Form Card */}
        <div className="card-modern p-6">
          {renderCurrentStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-6">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          )}
          
          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              className="flex-1"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!formData.agreeToTerms}
              className="flex-1"
            >
              Create My Profile
            </Button>
          )}
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-caption text-gray-400">
            Need help? Contact our support team
          </p>
        </div>
      </div>
    </div>
  );
};

export default RefugeeRegistration;
