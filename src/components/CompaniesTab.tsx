
import React, { useState, useMemo } from 'react';
import { Building2, CheckCircle, XCircle, Eye, History } from 'lucide-react';
import { Company } from '@/utils/adminApi';
import CompanyActionDialog from './CompanyActionDialog';
import CompanyAuditLogs from './CompanyAuditLogs';
import SearchAndFilters from './SearchAndFilters';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CompaniesTabProps {
  companies: Company[];
  isLoading: boolean;
  onApprove: (companyId: string, comment: string) => void;
  onReject: (companyId: string, comment: string) => void;
}

const CompaniesTab: React.FC<CompaniesTabProps> = ({
  companies,
  isLoading,
  onApprove,
  onReject
}) => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');

  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const matchesSearch = 
        company.legal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.country_of_registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.registration_number.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'approved' && company.is_approved) ||
        (statusFilter === 'pending' && !company.is_approved);

      return matchesSearch && matchesStatus;
    });
  }, [companies, searchTerm, statusFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleApprove = (companyId: string, comment: string) => {
    onApprove(companyId, comment);
  };

  const handleReject = (companyId: string, comment: string) => {
    onReject(companyId, comment);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-h2-mobile font-semibold text-neutral-gray">
          Company Applications
        </h2>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-small-mobile">
            {companies.filter(c => !c.is_approved).length} Pending
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-small-mobile">
            {companies.filter(c => c.is_approved).length} Approved
          </span>
        </div>
      </div>

      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        verifiedFilter={verifiedFilter}
        onVerifiedFilterChange={setVerifiedFilter}
        type="companies"
      />

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-neutral-gray">Loading companies...</p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-neutral-gray">
            {companies.length === 0 ? 'No companies found' : 'No matching companies found'}
          </p>
        </div>
      ) : (
        filteredCompanies.map((company) => (
          <div key={company.id} className="form-card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-un-blue/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-un-blue" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-gray">{company.legal_name}</h3>
                  <p className="text-small-mobile text-neutral-gray/70">
                    {company.country_of_registration} • {company.registration_number}
                  </p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-small-mobile ${
                company.is_approved 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {company.is_approved ? 'Approved' : 'Pending'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-small-mobile text-neutral-gray/70">Website</p>
                <p className="text-body-mobile">{company.website || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-small-mobile text-neutral-gray/70">Employees</p>
                <p className="text-body-mobile">{company.number_of_employees || 'Not specified'}</p>
              </div>
            </div>

            {company.about_company && (
              <div className="mb-4">
                <p className="text-small-mobile text-neutral-gray/70 mb-1">About Company</p>
                <p className="text-body-mobile">{company.about_company}</p>
              </div>
            )}

            {company.admin_comment && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-small-mobile text-neutral-gray/70 mb-1">Admin Comment</p>
                <p className="text-body-mobile">{company.admin_comment}</p>
              </div>
            )}

            <div className="flex gap-3">
              <CompanyActionDialog
                action="approve"
                companyName={company.legal_name}
                onConfirm={(comment) => handleApprove(company.id, comment)}
                disabled={company.is_approved}
              >
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-success-green text-white rounded-md hover:bg-success-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={company.is_approved}
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
              </CompanyActionDialog>

              <CompanyActionDialog
                action="reject"
                companyName={company.legal_name}
                onConfirm={(comment) => handleReject(company.id, comment)}
              >
                <button className="flex items-center gap-2 px-4 py-2 bg-error-red text-white rounded-md hover:bg-error-red/90 transition-colors">
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </CompanyActionDialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <button 
                    className="flex items-center gap-2 px-4 py-2 border border-border text-neutral-gray rounded-md hover:bg-light-gray transition-colors"
                    onClick={() => setSelectedCompany(company)}
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <Building2 className="w-6 h-6 text-un-blue" />
                      {company.legal_name}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h3 className="font-semibold text-neutral-gray mb-3">Basic Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-small-mobile text-neutral-gray/70">Legal Name</p>
                          <p className="text-body-mobile font-medium">{company.legal_name}</p>
                        </div>
                        <div>
                          <p className="text-small-mobile text-neutral-gray/70">Registration Number</p>
                          <p className="text-body-mobile">{company.registration_number}</p>
                        </div>
                        <div>
                          <p className="text-small-mobile text-neutral-gray/70">Country of Registration</p>
                          <p className="text-body-mobile">{company.country_of_registration}</p>
                        </div>
                        <div>
                          <p className="text-small-mobile text-neutral-gray/70">Number of Employees</p>
                          <p className="text-body-mobile">{company.number_of_employees || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <h3 className="font-semibold text-neutral-gray mb-3">Contact Information</h3>
                      <div>
                        <p className="text-small-mobile text-neutral-gray/70">Website</p>
                        <p className="text-body-mobile">
                          {company.website ? (
                            <a 
                              href={company.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-un-blue hover:underline"
                            >
                              {company.website}
                            </a>
                          ) : (
                            'Not provided'
                          )}
                        </p>
                      </div>
                    </div>

                    {/* About Company */}
                    {company.about_company && (
                      <div>
                        <h3 className="font-semibold text-neutral-gray mb-3">About Company</h3>
                        <p className="text-body-mobile leading-relaxed">{company.about_company}</p>
                      </div>
                    )}

                    {/* Admin Comment */}
                    {company.admin_comment && (
                      <div>
                        <h3 className="font-semibold text-neutral-gray mb-3">Admin Comment</h3>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-body-mobile leading-relaxed">{company.admin_comment}</p>
                        </div>
                      </div>
                    )}

                    {/* Status Information */}
                    <div>
                      <h3 className="font-semibold text-neutral-gray mb-3">Status Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-small-mobile text-neutral-gray/70">Approval Status</p>
                          <div className={`inline-flex px-3 py-1 rounded-full text-small-mobile ${
                            company.is_approved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {company.is_approved ? 'Approved' : 'Pending'}
                          </div>
                        </div>
                        <div>
                          <p className="text-small-mobile text-neutral-gray/70">Registration Date</p>
                          <p className="text-body-mobile">{formatDate(company.created_at)}</p>
                        </div>
                        {company.approved_by && (
                          <div>
                            <p className="text-small-mobile text-neutral-gray/70">Approved By</p>
                            <p className="text-body-mobile">{company.approved_by}</p>
                          </div>
                        )}
                        {company.approved_at && (
                          <div>
                            <p className="text-small-mobile text-neutral-gray/70">Approved At</p>
                            <p className="text-body-mobile">{formatDate(company.approved_at)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 border border-border text-neutral-gray rounded-md hover:bg-light-gray transition-colors">
                    <History className="w-4 h-4" />
                    Audit History
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <History className="w-6 h-6 text-un-blue" />
                      Audit History - {company.legal_name}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <CompanyAuditLogs 
                    companyId={company.id} 
                    companyName={company.legal_name}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CompaniesTab;
