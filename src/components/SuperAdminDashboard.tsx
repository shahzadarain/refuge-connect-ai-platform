
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/useSession';
import CompaniesTab from './CompaniesTab';
import {
  Company,
  fetchCompanies,
  approveCompany,
  rejectCompany,
  fetchCompanyAdmin
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
  const [isLoading, setIsLoading] = useState(false);

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
      console.log('Loaded companies:', data);
      // Ensure we have an array
      if (Array.isArray(data)) {
        setCompanies(data);
      } else {
        console.error('Companies data is not an array:', data);
        setCompanies([]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]); // Set to empty array on error
      toast({
        title: "Error",
        description: "Failed to fetch companies data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
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
      
      // Step 1: Get company details from current state - ensure we have a fresh copy
      const currentCompanies = Array.isArray(companies) ? [...companies] : [];
      console.log('Current companies array:', currentCompanies);
      
      const company = currentCompanies.find(c => c.id === companyId);
      if (!company) {
        console.error('Company not found in current list:', companyId);
        // Try to reload companies and find again
        await loadCompanies();
        const refreshedCompanies = await fetchCompanies();
        const refreshedCompany = refreshedCompanies.find(c => c.id === companyId);
        
        if (!refreshedCompany) {
          toast({
            title: "Error", 
            description: "Company not found. Please refresh the page.",
            variant: "destructive",
          });
          return;
        }
      }

      // Step 2: Approve company via backend API
      const approvalResponse = await approveCompany(companyId, currentUser.id, comment);
      console.log('Backend approval response:', approvalResponse);
      
      // Step 3: Fetch the company admin's email and send approval email
      console.log('Fetching company admin email...');
      try {
        const companyAdmin = await fetchCompanyAdmin(companyId);
        console.log('Company admin response:', companyAdmin);
        
        if (companyAdmin && companyAdmin.email) {
          console.log('Sending approval email to:', companyAdmin.email);
          
          // Generate a verification code
          const verificationCode = Math.random().toString(36).substring(2, 15).toUpperCase();
          
          const emailData = {
            to: companyAdmin.email,
            company_name: company?.legal_name || 'Company',
            verification_code: verificationCode,
            expires_in_days: 7
          };
          
          const emailResponse = await sendCompanyApprovalEmail(emailData);
          console.log('Email sent successfully:', emailResponse);
          
          toast({
            title: "Success",
            description: "Company approved successfully and verification email sent!",
          });
        } else {
          console.log('No company admin found or email missing:', companyAdmin);
          toast({
            title: "Partial Success",
            description: "Company approved but no admin email found. Please contact the company manually.",
            variant: "destructive",
          });
        }
      } catch (emailError) {
        console.error('Email process failed:', emailError);
        toast({
          title: "Partial Success",
          description: "Company approved but email could not be sent. Please contact the company manually.",
          variant: "destructive",
        });
      }
      
      // Step 4: Reload companies to get the updated state
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
      // Reload companies to get the updated state
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
                Manage company applications
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

        <CompaniesTab
          companies={companies}
          isLoading={isLoading}
          onApprove={handleApproveCompany}
          onReject={handleRejectCompany}
        />
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
