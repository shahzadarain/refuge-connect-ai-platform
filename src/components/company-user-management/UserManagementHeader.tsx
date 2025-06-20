
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, UserPlus } from 'lucide-react';

interface UserManagementHeaderProps {
  onCreateUser: () => void;
}

const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({ onCreateUser }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-h2-mobile font-bold text-neutral-gray">
            User Management
          </h2>
          <p className="text-body-mobile text-neutral-gray/70">
            Manage your company users and their permissions
          </p>
        </div>
      </div>

      <Button className="btn-primary" onClick={onCreateUser}>
        <UserPlus className="w-4 h-4 mr-2" />
        Create User
      </Button>
    </div>
  );
};

export default UserManagementHeader;
