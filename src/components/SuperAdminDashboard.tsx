
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CompaniesTab from './CompaniesTab';
import UsersTab from './UsersTab';
import {
  Company,
  User,
  fetchCompanies,
  fetchUsers,
  approveCompany,
  rejectCompany,
  activateUser
} from '@/utils/adminApi';

interface SuperAdminDashboardProps {
  onBack?: () => void;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'companies' | 'users'>('companies');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Error",
        description: "Failed to fetch companies data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    loadCompanies();
    loadUsers();
  }, []);

  const handleApproveCompany = async (companyId: string) => {
    try {
      await approveCompany(companyId);
      toast({
        title: "Success",
        description: "Company approved successfully",
      });
      loadCompanies();
    } catch (error) {
      console.error('Error approving company:', error);
      toast({
        title: "Error",
        description: "Failed to approve company",
        variant: "destructive",
      });
    }
  };

  const handleRejectCompany = async (companyId: string) => {
    try {
      await rejectCompany(companyId);
      toast({
        title: "Success",
        description: "Company rejected successfully",
      });
      loadCompanies();
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
      loadUsers();
    } catch (error) {
      console.error('Error activating user:', error);
      toast({
        title: "Error",
        description: "Failed to activate user",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
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

        {activeTab === 'companies' && (
          <CompaniesTab
            companies={companies}
            isLoading={isLoading}
            onApprove={handleApproveCompany}
            onReject={handleRejectCompany}
          />
        )}
        {activeTab === 'users' && (
          <UsersTab
            users={users}
            onActivate={handleActivateUser}
          />
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
