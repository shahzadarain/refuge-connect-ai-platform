import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/useSession';
import CompaniesTab from './CompaniesTab';
import UsersTab from './UsersTab';
import AuditLogsTab from './AuditLogsTab';
import {
  Company,
  User as UserType,
  fetchCompanies,
  fetchUsers,
  approveCompany,
  rejectCompany,
  activateUser
} from '@/utils/adminApi';
import {
  AuditLog,
  AuditLogFilters,
  fetchAuditLogs
} from '@/utils/auditApi';

interface SuperAdminDashboardProps {
  onBack?: () => void;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { currentUser, logout, isLoggedIn } = useSession();
  const [activeTab, setActiveTab] = useState<'companies' | 'users' | 'audit-logs'>('companies');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);

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

  const loadAuditLogs = async (filters?: AuditLogFilters) => {
    setAuditLogsLoading(true);
    try {
      const data = await fetchAuditLogs(filters);
      setAuditLogs(data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch audit logs",
        variant: "destructive",
      });
    } finally {
      setAuditLogsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
    loadUsers();
    loadAuditLogs();
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
      await approveCompany(companyId, currentUser.id, comment);
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
                Manage company applications, user accounts, and view audit logs
              </p>
            </div>
            
            {currentUser && (
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
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-error-red hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
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
            <button
              onClick={() => setActiveTab('audit-logs')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'audit-logs'
                  ? 'text-un-blue border-b-2 border-un-blue'
                  : 'text-neutral-gray/70 hover:text-neutral-gray'
              }`}
            >
              Audit Logs
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
        {activeTab === 'audit-logs' && (
          <AuditLogsTab
            auditLogs={auditLogs}
            isLoading={auditLogsLoading}
            onFiltersChange={loadAuditLogs}
          />
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
