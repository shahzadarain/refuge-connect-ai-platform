
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/useSession';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CompaniesTab from './CompaniesTab';
import UsersTab from './UsersTab';
import AdminHeader from './AdminHeader';
import AdminStats from './AdminStats';
import {
  Company,
  User as UserType,
  fetchCompanies,
  fetchUsers,
  approveCompany,
  rejectCompany,
  activateUser
} from '@/utils/adminApi';
import { sendCompanyApprovalEmail } from '@/utils/emailApi';

interface SuperAdminDashboardProps {
  onBack?: () => void;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { currentUser, logout, isLoggedIn } = useSession();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Check if user is still logged in on component mount
  useEffect(() => {
    if (!isLoggedIn || !currentUser) {
      console.log('No valid session found, redirecting to login');
      toast({
        title: "Session Expired",
        description: "Please log in again",
        variant: "destructive",
      });
      if (onBack) {
        onBack();
      }
      return;
    }
  }, [isLoggedIn, currentUser, onBack, toast]);

  const loadCompanies = async () => {
    setIsLoadingCompanies(true);
    try {
      const data = await fetchCompanies();
      console.log('Loaded companies:', data);
      if (Array.isArray(data)) {
        setCompanies(data);
      } else {
        console.error('Companies data is not an array:', data);
        setCompanies([]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
      toast({
        title: "Error",
        description: "Failed to fetch companies data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const loadUsers = async () => {
    console.log('SuperAdminDashboard: Starting to load users...');
    setIsLoadingUsers(true);
    try {
      const data = await fetchUsers();
      console.log('SuperAdminDashboard: Loaded users data:', data);
      console.log('SuperAdminDashboard: Users data type:', typeof data);
      console.log('SuperAdminDashboard: Users data length:', Array.isArray(data) ? data.length : 'not an array');
      
      if (Array.isArray(data)) {
        setUsers(data);
        console.log('SuperAdminDashboard: Set users state with', data.length, 'users');
      } else {
        console.error('SuperAdminDashboard: Users data is not an array:', data);
        setUsers([]);
      }
    } catch (error) {
      console.error('SuperAdminDashboard: Error fetching users:', error);
      setUsers([]);
      toast({
        title: "Error",
        description: "Failed to fetch users data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUsers(false);
      console.log('SuperAdminDashboard: Finished loading users');
    }
  };

  useEffect(() => {
    console.log('SuperAdminDashboard: Component mounted, loading data...');
    loadCompanies();
    loadUsers();
  }, []);

  const handleApproveCompany = async (companyId: string, comment: string) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "No admin user found",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Starting company approval process...');
      
      const currentCompanies = Array.isArray(companies) ? [...companies] : [];
      const company = currentCompanies.find(c => c.id === companyId);
      
      if (!company) {
        console.error('Company not found in current list:', companyId);
        toast({
          title: "Error", 
          description: "Company not found. Please refresh the page.",
          variant: "destructive",
        });
        return;
      }

      const approvalResponse = await approveCompany(companyId, currentUser.id, comment);
      console.log('Backend approval response:', approvalResponse);
      
      if (approvalResponse.verification_details && approvalResponse.verification_details.email) {
        console.log('Sending approval email using verification details...');
        
        const emailData = {
          to: approvalResponse.verification_details.email,
          company_name: approvalResponse.verification_details.company_name || company.legal_name,
          verification_code: approvalResponse.verification_details.verification_code,
          expires_in_days: approvalResponse.verification_details.expires_in_days || 7
        };
        
        try {
          const emailResponse = await sendCompanyApprovalEmail(emailData);
          console.log('Email sent successfully:', emailResponse);
          
          toast({
            title: "Success",
            description: "Company approved successfully and verification email sent!",
          });
        } catch (emailError) {
          console.error('Email process failed:', emailError);
          toast({
            title: "Partial Success",
            description: "Company approved but email could not be sent. Please contact the company manually.",
            variant: "destructive",
          });
        }
      } else {
        console.log('No verification details found in approval response');
        toast({
          title: "Partial Success",
          description: "Company approved but no verification details found. Please contact the company manually.",
          variant: "destructive",
        });
      }
      
      await loadCompanies();
    } catch (error) {
      console.error('Error approving company:', error);
      toast({
        title: "Error",
        description: "Failed to approve company",
        variant: "destructive",
      });
    }
  };

  const handleRejectCompany = async (companyId: string, comment: string) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "No admin user found",
        variant: "destructive",
      });
      return;
    }

    try {
      await rejectCompany(companyId, currentUser.id, comment);
      toast({
        title: "Success",
        description: "Company rejected successfully",
      });
      await loadCompanies();
    } catch (error) {
      console.error('Error rejecting company:', error);
      toast({
        title: "Error",
        description: "Failed to reject company",
        variant: "destructive",
      });
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      await activateUser(userId);
      toast({
        title: "Success",
        description: "User activated successfully",
      });
      await loadUsers();
    } catch (error) {
      console.error('Error activating user:', error);
      toast({
        title: "Error",
        description: "Failed to activate user",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    if (onBack) {
      onBack();
    }
  };

  // Don't render if not logged in
  if (!isLoggedIn || !currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="container mx-auto px-4 py-8">
        <AdminHeader 
          currentUser={currentUser} 
          onBack={onBack} 
          onLogout={handleLogout} 
        />
        
        <AdminStats companies={companies} users={users} />

        <Tabs defaultValue="companies" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="companies" className="mt-6">
            <CompaniesTab
              companies={companies}
              isLoading={isLoadingCompanies}
              onApprove={handleApproveCompany}
              onReject={handleRejectCompany}
            />
          </TabsContent>
          
          <TabsContent value="users" className="mt-6">
            <UsersTab
              users={users}
              onActivate={handleActivateUser}
              onRefresh={loadUsers}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
