
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Building2, Users, CheckCircle, XCircle, Eye } from 'lucide-react';

interface Company {
  id: string;
  legal_name: string;
  country_of_registration: string;
  registration_number: string;
  website?: string;
  number_of_employees?: number;
  about_company?: string;
  is_approved: boolean;
  created_at: string;
}

interface User {
  id: string;
  user_type: 'employer_admin' | 'refugee';
  email: string;
  phone?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
}

const SuperAdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'companies' | 'users'>('companies');
  const [companies] = useState<Company[]>([
    {
      id: '1',
      legal_name: 'Tech Solutions Jordan',
      country_of_registration: 'Jordan',
      registration_number: 'COM123456',
      website: 'https://techsolutions.jo',
      number_of_employees: 50,
      about_company: 'Leading technology company in Jordan',
      is_approved: false,
      created_at: '2024-01-15T10:30:00Z'
    }
  ]);

  const [users] = useState<User[]>([
    {
      id: '1',
      user_type: 'employer_admin',
      email: 'admin@techsolutions.jo',
      phone: '+962791234567',
      is_active: true,
      is_verified: false,
      created_at: '2024-01-15T10:30:00Z'
    }
  ]);

  const handleApproveCompany = async (companyId: string) => {
    console.log('Approving company:', companyId);
    // API call would go here
  };

  const handleRejectCompany = async (companyId: string) => {
    console.log('Rejecting company:', companyId);
    // API call would go here
  };

  const handleActivateUser = async (userId: string) => {
    console.log('Activating user:', userId);
    // API call would go here
  };

  const renderCompaniesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-h2-mobile font-semibold text-neutral-gray">
          Company Applications
        </h2>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-small-mobile">
            {companies.filter(c => !c.is_approved).length} Pending
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-small-mobile">
            {companies.filter(c => c.is_approved).length} Approved
          </span>
        </div>
      </div>

      {companies.map((company) => (
        <div key={company.id} className="form-card">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-un-blue/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-un-blue" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-gray">{company.legal_name}</h3>
                <p className="text-small-mobile text-neutral-gray/70">
                  {company.country_of_registration} • {company.registration_number}
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-small-mobile ${
              company.is_approved 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {company.is_approved ? 'Approved' : 'Pending'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-small-mobile text-neutral-gray/70">Website</p>
              <p className="text-body-mobile">{company.website || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-small-mobile text-neutral-gray/70">Employees</p>
              <p className="text-body-mobile">{company.number_of_employees || 'Not specified'}</p>
            </div>
          </div>

          {company.about_company && (
            <div className="mb-4">
              <p className="text-small-mobile text-neutral-gray/70 mb-1">About Company</p>
              <p className="text-body-mobile">{company.about_company}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => handleApproveCompany(company.id)}
              className="flex items-center gap-2 px-4 py-2 bg-success-green text-white rounded-md hover:bg-success-green/90 transition-colors"
              disabled={company.is_approved}
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={() => handleRejectCompany(company.id)}
              className="flex items-center gap-2 px-4 py-2 bg-error-red text-white rounded-md hover:bg-error-red/90 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-border text-neutral-gray rounded-md hover:bg-light-gray transition-colors">
              <Eye className="w-4 h-4" />
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-h2-mobile font-semibold text-neutral-gray">
          User Management
        </h2>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-small-mobile">
            {users.filter(u => u.user_type === 'employer_admin').length} Employers
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-small-mobile">
            {users.filter(u => u.user_type === 'refugee').length} Refugees
          </span>
        </div>
      </div>

      {users.map((user) => (
        <div key={user.id} className="form-card">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-un-blue/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-un-blue" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-gray">{user.email}</h3>
                <p className="text-small-mobile text-neutral-gray/70">
                  {user.user_type.replace('_', ' ').toUpperCase()}
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-small-mobile ${
              user.is_active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {user.is_active ? 'Active' : 'Inactive'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-small-mobile text-neutral-gray/70">Phone</p>
              <p className="text-body-mobile">{user.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-small-mobile text-neutral-gray/70">Verified</p>
              <p className="text-body-mobile">{user.is_verified ? 'Yes' : 'No'}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleActivateUser(user.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                user.is_active
                  ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                  : 'bg-success-green text-white hover:bg-success-green/90'
              }`}
              disabled={user.is_active}
            >
              <CheckCircle className="w-4 h-4" />
              {user.is_active ? 'Active' : 'Activate'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-border text-neutral-gray rounded-md hover:bg-light-gray transition-colors">
              <Eye className="w-4 h-4" />
              View Profile
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-h1-mobile font-bold text-neutral-gray mb-2">
            Super Admin Dashboard
          </h1>
          <p className="text-body-mobile text-neutral-gray/80">
            Manage company applications and user accounts
          </p>
        </div>

        <div className="mb-6">
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('companies')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'companies'
                  ? 'text-un-blue border-b-2 border-un-blue'
                  : 'text-neutral-gray/70 hover:text-neutral-gray'
              }`}
            >
              Companies
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'users'
                  ? 'text-un-blue border-b-2 border-un-blue'
                  : 'text-neutral-gray/70 hover:text-neutral-gray'
              }`}
            >
              Users
            </button>
          </div>
        </div>

        {activeTab === 'companies' && renderCompaniesTab()}
        {activeTab === 'users' && renderUsersTab()}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
