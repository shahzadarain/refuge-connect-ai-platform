
import React from 'react';
import { useSession } from '@/hooks/useSession';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { TableCell, TableRow } from '@/components/ui/table';
import { Trash2, Power, PowerOff } from 'lucide-react';
import { CompanyUser } from '../types/companyUser';

interface UserRowProps {
  user: CompanyUser;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
  onDeleteUser: (userId: string) => void;
}

const UserRow: React.FC<UserRowProps> = ({ user, onToggleStatus, onDeleteUser }) => {
  const { currentUser } = useSession();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TableRow key={user.id}>
      <TableCell>
        <div>
          <div className="font-medium">
            {user.first_name} {user.last_name}
          </div>
          <div className="text-sm text-neutral-gray/70">
            {user.email}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-sm text-neutral-gray/70">
        {user.phone || 'Not provided'}
      </TableCell>
      <TableCell>
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          user.role === 'company_admin' 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {user.role === 'company_admin' ? 'Admin' : 'User'}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            user.is_active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {user.is_active ? 'Active' : 'Inactive'}
          </span>
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            user.is_verified 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {user.is_verified ? 'Verified' : 'Unverified'}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-sm text-neutral-gray/70">
        {formatDate(user.created_at)}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          {user.role !== 'company_admin' && user.id !== currentUser?.id && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleStatus(user.id, user.is_active)}
                className={user.is_active ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
              >
                {user.is_active ? (
                  <>
                    <PowerOff className="w-3 h-3 mr-1" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Power className="w-3 h-3 mr-1" />
                    Activate
                  </>
                )}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {user.first_name} {user.last_name}? 
                      This action will deactivate the user and mark them as unverified.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteUser(user.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete User
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          {(user.role === 'company_admin' || user.id === currentUser?.id) && (
            <span className="text-xs text-neutral-gray/50 px-2 py-1">
              {user.id === currentUser?.id ? 'You' : 'Admin (Protected)'}
            </span>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default UserRow;
