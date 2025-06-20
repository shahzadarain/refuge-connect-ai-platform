
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users } from 'lucide-react';
import { CompanyUser } from '../types/companyUser';
import UserRow from './UserRow';

interface UsersTableProps {
  users: CompanyUser[];
  isLoading: boolean;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
  onDeleteUser: (userId: string) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  isLoading,
  onToggleStatus,
  onDeleteUser,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-un-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <Users className="w-8 h-8 text-neutral-gray/50" />
                  <p className="text-body-mobile text-neutral-gray/70">
                    No company users found. Create your first user to get started.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onToggleStatus={onToggleStatus}
                onDeleteUser={onDeleteUser}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
