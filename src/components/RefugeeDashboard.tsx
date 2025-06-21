
import React, { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from '@/hooks/useSession';
import { useToast } from '@/hooks/use-toast';
import { useValidationStatus } from '@/hooks/useValidationStatus';
import ValidationStatusCard from '@/components/ValidationStatusCard';
import { User, Search, FileText, Heart, LogOut, Briefcase } from 'lucide-react';

const RefugeeDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { currentUser, logout } = useSession();
  const { toast } = useToast();
  const { validationStatus, isLoading, refetch } = useValidationStatus(currentUser?.email);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const handleValidateClick = () => {
    if (currentUser?.email) {
      localStorage.setItem('refugee_validation_email', currentUser.email);
      window.location.href = `/?email=${encodeURIComponent(currentUser.email)}&action=unhcr-validate`;
    }
  };

  const displayName = currentUser?.first_name || currentUser?.email?.split('@')[0] || 'User';
  const fullName = currentUser?.first_name && currentUser?.last_name 
    ? `${currentUser.first_name} ${currentUser.last_name}` 
    : displayName;

  return (
    <div className="min-h-screen bg-light-gray">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-un-blue rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-h3-mobile font-bold text-neutral-gray">
                  Refugee Portal
                </h1>
                <p className="text-small-mobile text-neutral-gray/70">
                  Welcome, {displayName}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-neutral-gray hover:text-un-blue transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Validation Status Card */}
          {validationStatus && (
            <div className="mb-8">
              <ValidationStatusCard
                isValidated={validationStatus.is_validated}
                isVerified={validationStatus.is_verified}
                unhcrId={validationStatus.unhcr_id}
                onValidateClick={handleValidateClick}
              />
            </div>
          )}

          {/* Welcome Section */}
          <div className="bg-white rounded-lg border border-border p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-un-blue/10 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-un-blue" />
              </div>
              <div>
                <h2 className="text-h2-mobile font-bold text-neutral-gray mb-2">
                  Welcome {fullName}
                </h2>
                <p className="text-body-mobile text-neutral-gray/70 mb-4">
                  You're part of the UN Refugee Connect Platform. Find job opportunities, manage your applications, and access support resources designed to help you build a new life.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-small-mobile font-medium text-blue-800">
                      Account Status: Active Refugee Profile
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    {validationStatus?.is_verified 
                      ? "Your profile is verified and you can start applying for jobs."
                      : "Complete UNHCR validation to access all features."
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {/* Search Jobs */}
            <div className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Search className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-h3-mobile font-semibold text-neutral-gray">
                  Find Jobs
                </h3>
              </div>
              <p className="text-body-mobile text-neutral-gray/70 mb-4">
                Browse available job opportunities that match your skills and interests.
              </p>
              <button className="btn-primary w-full">
                Search Jobs
              </button>
            </div>

            {/* My Applications */}
            <div className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-h3-mobile font-semibold text-neutral-gray">
                  My Applications
                </h3>
              </div>
              <p className="text-body-mobile text-neutral-gray/70 mb-4">
                Track the status of your job applications and manage your submissions.
              </p>
              <button className="btn-secondary w-full">
                View Applications
              </button>
            </div>

            {/* Profile Settings */}
            <div className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-h3-mobile font-semibold text-neutral-gray">
                  My Profile
                </h3>
              </div>
              <p className="text-body-mobile text-neutral-gray/70 mb-4">
                Update your profile information, skills, and preferences.
              </p>
              <button className="btn-secondary w-full">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Recent Activity & Resources */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Applications */}
            <div className="bg-white rounded-lg border border-border p-6">
              <h3 className="text-h3-mobile font-semibold text-neutral-gray mb-4">
                Recent Applications
              </h3>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-neutral-gray/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-neutral-gray/50" />
                </div>
                <p className="text-body-mobile text-neutral-gray/70">
                  No applications yet. Start by browsing available jobs!
                </p>
              </div>
            </div>

            {/* Support Resources */}
            <div className="bg-white rounded-lg border border-border p-6">
              <h3 className="text-h3-mobile font-semibold text-neutral-gray mb-4">
                Support Resources
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Heart className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-small-mobile font-medium text-blue-800">Job Search Tips</p>
                    <p className="text-xs text-blue-600">Learn how to improve your applications</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-small-mobile font-medium text-green-800">Resume Builder</p>
                    <p className="text-xs text-green-600">Create a professional resume</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <User className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-small-mobile font-medium text-purple-800">Career Support</p>
                    <p className="text-xs text-purple-600">Connect with career counselors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RefugeeDashboard;
