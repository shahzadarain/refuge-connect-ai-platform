
import React, { useState } from 'react';
import { Building2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Company } from '@/utils/adminApi';
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
  onApprove: (companyId: string) => void;
  onReject: (companyId: string) => void;
}

const CompaniesTab: React.FC<CompaniesTabProps> = ({
  companies,
  isLoading,
  onApprove,
  onReject
}) => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-neutral-gray">Loading companies...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-neutral-gray">No companies found</p>
        </div>
      ) : (
        companies.map((company) => (
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

            <div className="flex gap-3">
              <button
                onClick={() => onApprove(company.id)}
                className="flex items-center gap-2 px-4 py-2 bg-success-green text-white rounded-md hover:bg-success-green/90 transition-colors"
                disabled={company.is_approved}
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => onReject(company.id)}
                className="flex items-center gap-2 px-4 py-2 bg-error-red text-white rounded-md hover:bg-error-red/90 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              
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
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CompaniesTab;
