import React, { useState, useEffect } from 'react';
import { History, ChevronDown, ChevronRight, CheckCircle, XCircle, Edit } from 'lucide-react';
import { AuditLog, fetchCompanyAuditLogs } from '@/utils/auditApi';
import { useToast } from '@/hooks/use-toast';

interface CompanyAuditLogsProps {
  companyId: string;
  companyName: string;
}

const CompanyAuditLogs: React.FC<CompanyAuditLogsProps> = ({ companyId, companyName }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchCompanyAuditLogs(companyId);
      setLogs(data);
    } catch (error) {
      console.error('Error fetching company audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch audit logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [companyId]);

  const toggleExpanded = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (log: AuditLog) => {
    const actionType = log.new_values?.action_type;
    if (actionType === 'COMPANY_APPROVED') {
      return <CheckCircle className="w-5 h-5 text-success-green" />;
    } else if (actionType === 'COMPANY_REJECTED') {
      return <XCircle className="w-5 h-5 text-error-red" />;
    }
    return <Edit className="w-5 h-5 text-un-blue" />;
  };

  const getActionText = (log: AuditLog) => {
    const actionType = log.new_values?.action_type;
    if (actionType === 'COMPANY_APPROVED') {
      return 'Approved';
    } else if (actionType === 'COMPANY_REJECTED') {
      return 'Rejected';
    }
    return log.action;
  };

  const getActionColor = (log: AuditLog) => {
    const actionType = log.new_values?.action_type;
    if (actionType === 'COMPANY_APPROVED') {
      return 'text-success-green';
    } else if (actionType === 'COMPANY_REJECTED') {
      return 'text-error-red';
    }
    return 'text-un-blue';
  };

  const formatStateValues = (values: Record<string, any> | null, log: AuditLog) => {
    if (!values) return 'No data';

    const formatted = { ...values };
    
    // Replace approved_by ID with email if available
    if (formatted.approved_by && log.changed_by_email) {
      formatted.approved_by = `${log.changed_by_email} (${formatted.approved_by.substring(0, 8)}...)`;
    }

    // Format boolean values
    if (typeof formatted.is_approved === 'boolean') {
      formatted.is_approved = formatted.is_approved ? 'Yes' : 'No';
    } else if (formatted.is_approved === 1) {
      formatted.is_approved = 'Yes';
    } else if (formatted.is_approved === 0) {
      formatted.is_approved = 'No';
    }

    // Format status to be more readable
    if (formatted.status) {
      formatted.status = formatted.status.charAt(0).toUpperCase() + formatted.status.slice(1);
    }

    // Format dates
    if (formatted.approved_at && formatted.approved_at !== 'CURRENT_TIMESTAMP') {
      try {
        formatted.approved_at = new Date(formatted.approved_at).toLocaleString();
      } catch (e) {
        // Keep original if parsing fails
      }
    }

    return formatted;
  };

  const renderFormattedJson = (values: Record<string, any> | null, log: AuditLog, title: string) => {
    const formatted = formatStateValues(values, log);
    
    if (typeof formatted === 'string') {
      return <p className="text-neutral-gray/70">{formatted}</p>;
    }

    return (
      <div className="space-y-2">
        {Object.entries(formatted).map(([key, value]) => (
          <div key={key} className="flex justify-between items-start">
            <span className="font-medium text-neutral-gray/70 capitalize">
              {key.replace(/_/g, ' ')}:
            </span>
            <span className="text-right max-w-xs break-words">
              {value === null || value === undefined ? 'N/A' : String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-neutral-gray">Loading audit history...</div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8">
        <History className="w-12 h-12 text-neutral-gray/50 mx-auto mb-3" />
        <p className="text-neutral-gray/70">No audit history found for this company.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-un-blue" />
        <h3 className="font-semibold text-neutral-gray">Audit History for {companyName}</h3>
        <span className="px-2 py-1 bg-un-blue/10 text-un-blue rounded-full text-small-mobile">
          {logs.length} entries
        </span>
      </div>

      {logs.map((log) => (
        <div key={log.id} className="border border-border rounded-lg bg-white">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getActionIcon(log)}
                <div>
                  <span className={`font-medium ${getActionColor(log)}`}>
                    {getActionText(log)}
                  </span>
                  <p className="text-small-mobile text-neutral-gray/70">
                    by {log.changed_by_email || 'Unknown'} • {formatDate(log.changed_at)}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => toggleExpanded(log.id)}
                className="flex items-center gap-1 text-small-mobile text-un-blue hover:text-un-blue/80 transition-colors"
              >
                View Details
                {expandedLogs.has(log.id) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>

            {log.admin_comment && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-small-mobile text-neutral-gray/70 mb-1">Admin Comment:</p>
                <p className="text-body-mobile">{log.admin_comment}</p>
              </div>
            )}

            {expandedLogs.has(log.id) && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {log.old_values && (
                    <div>
                      <p className="text-small-mobile font-medium text-neutral-gray mb-3">Previous State:</p>
                      <div className="bg-red-50 p-3 rounded border">
                        {renderFormattedJson(log.old_values, log, 'Previous')}
                      </div>
                    </div>
                  )}
                  {log.new_values && (
                    <div>
                      <p className="text-small-mobile font-medium text-neutral-gray mb-3">New State:</p>
                      <div className="bg-green-50 p-3 rounded border">
                        {renderFormattedJson(log.new_values, log, 'New')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CompanyAuditLogs;
