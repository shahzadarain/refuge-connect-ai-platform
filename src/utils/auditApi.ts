
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

const checkTokenValidity = () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < currentTime) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_log_user');
      throw new Error('Authentication token has expired. Please log in again.');
    }
    
    return token;
  } catch (error) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_log_user');
    throw new Error('Invalid authentication token. Please log in again.');
  }
};

export const fetchAuditLogs = async (filters?: AuditLogFilters): Promise<AuditLog[]> => {
  console.log('Fetching audit logs from API...');
  
  // Validate token before making request
  checkTokenValidity();
  
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
  }
  
  const url = buildApiUrl(`/api/admin/audit-logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getApiHeaders(true) // Include auth headers
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Clear invalid session
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_log_user');
      throw new Error('Session expired. Please log in again.');
    }
    throw new Error(`Failed to fetch audit logs: ${response.status}`);
  }

  const data = await response.json();
  console.log('Audit logs data received:', data);
  return data;
};

export const fetchCompanyAuditLogs = async (companyId: string): Promise<AuditLog[]> => {
  console.log('Fetching company audit logs for:', companyId);
  
  // Validate token before making request
  checkTokenValidity();
  
  // Use the general audit logs endpoint with company filtering
  const queryParams = new URLSearchParams();
  queryParams.append('record_id', companyId);
  queryParams.append('table_name', 'companies');
  
  const url = buildApiUrl(`/api/admin/audit-logs?${queryParams.toString()}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getApiHeaders(true) // Include auth headers
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Clear invalid session
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_log_user');
      throw new Error('Session expired. Please log in again.');
    }
    throw new Error(`Failed to fetch company audit logs: ${response.status}`);
  }

  const data = await response.json();
  console.log('Company audit logs data received:', data);
  return data;
};
