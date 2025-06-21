
import React, { useState, useMemo } from 'react';
import { Users, CheckCircle, Eye } from 'lucide-react';
import { User } from '@/utils/adminApi';
import SearchAndFilters from './SearchAndFilters';

interface UsersTabProps {
  users: User[];
  onActivate: (userId: string) => void;
}

const UsersTab: React.FC<UsersTabProps> = ({ users, onActivate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');

  console.log('UsersTab: Rendering with users:', users);
  console.log('UsersTab: Users array length:', users ? users.length : 'users is null/undefined');

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.company_name && user.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && user.is_active) ||
        (statusFilter === 'inactive' && !user.is_active);
      
      const matchesVerified = verifiedFilter === 'all' ||
        (verifiedFilter === 'verified' && user.is_verified) ||
        (verifiedFilter === 'unverified' && !user.is_verified);
      
      const matchesCompany = companyFilter === 'all' ||
        user.user_type === companyFilter;

      return matchesSearch && matchesStatus && matchesVerified && matchesCompany;
    });
  }, [users, searchTerm, statusFilter, verifiedFilter, companyFilter]);

  return (
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
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-small-mobile">
            Total: {users.length}
          </span>
        </div>
      </div>

      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        verifiedFilter={verifiedFilter}
        onVerifiedFilterChange={setVerifiedFilter}
        showCompanyFilter={true}
        companyFilter={companyFilter}
        onCompanyFilterChange={setCompanyFilter}
        type="users"
      />

      {filteredUsers.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-neutral-gray/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-neutral-gray/50" />
          </div>
          <h3 className="text-lg font-medium text-neutral-gray mb-2">
            {users.length === 0 ? 'No Users Found' : 'No Matching Users'}
          </h3>
          <p className="text-neutral-gray/70">
            {users.length === 0 
              ? 'No users are currently registered in the system, or the users endpoint is not available.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
        </div>
      ) : (
        filteredUsers.map((user) => (
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
                <p className="text-small-mobile text-neutral-gray/70">Company</p>
                <p className="text-body-mobile">{user.company_name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-small-mobile text-neutral-gray/70">Verified</p>
                <p className="text-body-mobile">{user.is_verified ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onActivate(user.id)}
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
        ))
      )}
    </div>
  );
};

export default UsersTab;
