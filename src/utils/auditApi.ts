
import { buildApiUrl, getApiHeaders } from '@/config/api';

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  changed_by: string;
  changed_by_email?: string;
  changed_at: string;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  admin_comment: string | null;
}

export interface AuditLogFilters {
  table_name?: string;
  action?: string;
  changed_by?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export const fetchAuditLogs = async (filters?: AuditLogFilters): Promise<AuditLog[]> => {
  console.log('Fetching audit logs from API...');
  
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
  }
  
  const url = buildApiUrl(`/api/audit-logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getApiHeaders(true) // Include auth headers
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch audit logs: ${response.status}`);
  }

  const data = await response.json();
  console.log('Audit logs data received:', data);
  return data;
};

export const fetchCompanyAuditLogs = async (companyId: string): Promise<AuditLog[]> => {
  console.log('Fetching company audit logs for:', companyId);
  
  const url = buildApiUrl(`/api/audit-logs/companies/${companyId}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getApiHeaders(true) // Include auth headers
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch company audit logs: ${response.status}`);
  }

  const data = await response.json();
  console.log('Company audit logs data received:', data);
  return data;
};
