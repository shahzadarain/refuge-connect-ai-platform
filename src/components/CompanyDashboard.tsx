
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from '@/hooks/useSession';
import { Building, Users, Briefcase, Settings, LogOut } from 'lucide-react';

const CompanyDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { currentUser, logout } = useSession();

  const handleLogout = () => {
    logout();
  };

  const displayName = currentUser?.first_name || currentUser?.email?.split('@')[0] || 'User';
  
  // Check if user has admin privileges for user management
  const hasAdminAccess = currentUser?.role === 'company_admin' || currentUser?.user_type === 'employer_admin';

  return (
    <div className="min-h-screen bg-light-gray">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-un-blue rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-h3-mobile font-bold text-neutral-gray">
                  Company Dashboard
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
          {/* Welcome Section */}
          <div className="bg-white rounded-lg border border-border p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-un-blue/10 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-un-blue" />
              </div>
              <div>
                <h2 className="text-h2-mobile font-bold text-neutral-gray mb-2">
                  Welcome to Your Company Dashboard
                </h2>
                <p className="text-body-mobile text-neutral-gray/70 mb-4">
                  Your admin account has been successfully set up. You can now manage your company's job postings, review applications, and configure settings.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-small-mobile font-medium text-blue-800">
                      Account Status: Active
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    Your company admin account is fully activated and ready to use.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className={`grid gap-6 mb-8 ${hasAdminAccess ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'}`}>
            {/* Post a Job */}
            <div className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-h3-mobile font-semibold text-neutral-gray">
                  Post a Job
                </h3>
              </div>
              <p className="text-body-mobile text-neutral-gray/70 mb-4">
                Create and publish new job opportunities for refugees and other candidates.
              </p>
              <button className="btn-primary w-full">
                Create Job Posting
              </button>
            </div>

            {/* Manage Applications */}
            <div className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-h3-mobile font-semibold text-neutral-gray">
                  Applications
                </h3>
              </div>
              <p className="text-body-mobile text-neutral-gray/70 mb-4">
                Review and manage job applications from candidates.
              </p>
              <button className="btn-secondary w-full">
                View Applications
              </button>
            </div>

            {/* User Management - Only show for admin users */}
            {hasAdminAccess && (
              <div className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-h3-mobile font-semibold text-neutral-gray">
                    User Management
                  </h3>
                </div>
                <p className="text-body-mobile text-neutral-gray/70 mb-4">
                  Manage company users and their access permissions.
                </p>
                <button className="btn-secondary w-full">
                  Manage Users
                </button>
              </div>
            )}

            {/* Company Settings */}
            <div className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-h3-mobile font-semibold text-neutral-gray">
                  Settings
                </h3>
              </div>
              <p className="text-body-mobile text-neutral-gray/70 mb-4">
                Configure your company profile and account preferences.
              </p>
              <button className="btn-secondary w-full">
                Manage Settings
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="text-h3-mobile font-semibold text-neutral-gray mb-4">
              Recent Activity
            </h3>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-neutral-gray/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-neutral-gray/50" />
              </div>
              <p className="text-body-mobile text-neutral-gray/70">
                No recent activity. Start by posting your first job!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyDashboard;
