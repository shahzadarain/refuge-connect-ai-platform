
import React from 'react';
import { Users, CheckCircle, Eye } from 'lucide-react';
import { User } from '@/utils/adminApi';

interface UsersTabProps {
  users: User[];
  onActivate: (userId: string) => void;
}

const UsersTab: React.FC<UsersTabProps> = ({ users, onActivate }) => {
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
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-neutral-gray">No users found</p>
        </div>
      ) : (
        users.map((user) => (
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
