
import React, { useState, useEffect } from 'react';
import { useSession } from '@/hooks/useSession';
import { useToast } from '@/hooks/use-toast';
import { CompanyUser } from './types/companyUser';
import { fetchCompanyUsers, toggleUserStatus, deleteUser } from '@/utils/companyUserApi';
import UserManagementHeader from './company-user-management/UserManagementHeader';
import CreateUserDialog from './company-user-management/CreateUserDialog';
import UsersTable from './company-user-management/UsersTable';

const CompanyUserManagement: React.FC = () => {
  const { currentUser } = useSession();
  const { toast } = useToast();
  
  // Check if user has admin privileges - return null immediately if not
  const hasAdminAccess = currentUser?.role === 'company_admin' || currentUser?.user_type === 'employer_admin';

  console.log('CompanyUserManagement - Current user:', currentUser);
  console.log('CompanyUserManagement - Has admin access:', hasAdminAccess);

  // If user doesn't have admin access, don't render anything at all
  if (!hasAdminAccess) {
    console.log('CompanyUserManagement - Access denied, returning null');
    return null;
  }

  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    // Only load data if user has admin access
    if (hasAdminAccess) {
      loadCompanyUsers();
    }
  }, [hasAdminAccess]);

  const loadCompanyUsers = async () => {
    try {
      console.log('Loading company users...');
      const userData = await fetchCompanyUsers();
      setUsers(userData);
    } catch (error) {
      console.error('Error fetching company users:', error);
      toast({
        title: "Error",
        description: "An error occurred while loading users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserStatus(userId, currentStatus);
      toast({
        title: "Success",
        description: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
      loadCompanyUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while updating user status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      loadCompanyUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while deleting the user",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <UserManagementHeader onCreateUser={() => setIsCreateDialogOpen(true)} />
      
      <CreateUserDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onUserCreated={loadCompanyUsers}
      />

      <UsersTable
        users={users}
        isLoading={isLoading}
        onToggleStatus={handleToggleUserStatus}
        onDeleteUser={handleDeleteUser}
      />
    </div>
  );
};

export default CompanyUserManagement;
