
import React from 'react';
import { ArrowLeft, LogOut, User } from 'lucide-react';

interface User {
  id: string;
  email: string;
  user_type: string;
}

interface AdminHeaderProps {
  currentUser: User;
  onBack?: () => void;
  onLogout: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ currentUser, onBack, onLogout }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-start mb-4">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-neutral-gray hover:text-un-blue transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          )}
          <h1 className="text-h1-mobile font-bold text-neutral-gray mb-2">
            Super Admin Dashboard
          </h1>
          <p className="text-body-mobile text-neutral-gray/80">
            Manage company applications and users
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-border">
            <User className="w-4 h-4 text-un-blue" />
            <div className="text-right">
              <p className="text-small-mobile font-medium text-neutral-gray">
                {currentUser.email}
              </p>
              <p className="text-xs text-neutral-gray/70">
                {currentUser.user_type.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-error-red hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
