
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from '@/hooks/useSession';
import { Building, Users, Briefcase, Settings, LogOut } from 'lucide-react';
import CompanyUserManagement from './CompanyUserManagement';
import { canManageUsers } from '@/utils/permissions';

const CompanyDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { currentUser, logout } = useSession();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    logout();
  };

  const displayName = currentUser?.first_name || currentUser?.email?.split('@')[0] || 'User';
  
  // Use the new permission function with detailed logging
  const hasUserManagementAccess = canManageUsers(currentUser);

  console.log('CompanyDashboard - Raw currentUser from session:', JSON.stringify(currentUser, null, 2));
  console.log('CompanyDashboard - localStorage current_log_user:', localStorage.getItem('current_log_user'));
  console.log('CompanyDashboard - Has user management access:', hasUserManagementAccess);
  console.log('CompanyDashboard - Active tab:', activeTab);

  // If user doesn't have access and tries to access user management, redirect to dashboard
  React.useEffect(() => {
    if (!hasUserManagementAccess && activeTab === 'user-management') {
      console.log('CompanyDashboard - Non-admin user tried to access user management, redirecting to dashboard');
      setActiveTab('dashboard');
    }
  }, [hasUserManagementAccess, activeTab]);

  // Force redirect if no access but somehow on user management tab
  if (!hasUserManagementAccess && activeTab === 'user-management') {
    setActiveTab('dashboard');
  }

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

      {/* Navigation Tabs - Only show User Management for users with proper access */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'dashboard' 
                  ? 'text-un-blue border-b-2 border-un-blue' 
                  : 'text-neutral-gray hover:text-un-blue'
              }`}
            >
              Dashboard
            </button>
            {hasUserManagementAccess && (
              <button 
                onClick={() => setActiveTab('user-management')}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'user-management' 
                    ? 'text-un-blue border-b-2 border-un-blue' 
                    : 'text-neutral-gray hover:text-un-blue'
                }`}
              >
                User Management
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && (
            <>
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
                      Your {hasUserManagementAccess ? 'admin' : 'user'} account has been successfully set up. You can now {hasUserManagementAccess ? 'manage your company\'s job postings, review applications, and configure settings' : 'view job postings and manage your profile'}.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-small-mobile font-medium text-blue-800">
                          Account Status: Active
                        </span>
                      </div>
                      <p className="text-xs text-blue-700 mt-1">
                        Your company {hasUserManagementAccess ? 'admin' : 'user'} account is fully activated and ready to use.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className={`grid gap-6 mb-8 ${hasUserManagementAccess ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'}`}>
                {/* Post a Job - Only for admin users */}
                {hasUserManagementAccess && (
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
                )}

                {/* Manage Applications */}
                <div className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-h3-mobile font-semibold text-neutral-gray">
                      {hasUserManagementAccess ? 'Applications' : 'My Applications'}
                    </h3>
                  </div>
                  <p className="text-body-mobile text-neutral-gray/70 mb-4">
                    {hasUserManagementAccess ? 'Review and manage job applications from candidates.' : 'View and manage your job applications.'}
                  </p>
                  <button className="btn-secondary w-full">
                    View Applications
                  </button>
                </div>

                {/* Company Settings */}
                <div className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-h3-mobile font-semibold text-neutral-gray">
                      {hasUserManagementAccess ? 'Company Settings' : 'Profile Settings'}
                    </h3>
                  </div>
                  <p className="text-body-mobile text-neutral-gray/70 mb-4">
                    {hasUserManagementAccess ? 'Configure your company profile and account preferences.' : 'Update your profile and account preferences.'}
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
                    {hasUserManagementAccess ? 'No recent activity. Start by posting your first job!' : 'No recent activity. Check back later for updates.'}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* User Management Tab - Only render if user has proper access */}
          {activeTab === 'user-management' && hasUserManagementAccess && (
            <CompanyUserManagement />
          )}
        </div>
      </main>
    </div>
  );
};

export default CompanyDashboard;
