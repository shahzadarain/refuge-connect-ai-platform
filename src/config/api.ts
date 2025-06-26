// Centralized API configuration
// Update this URL when your backend endpoint changes
export const API_CONFIG = {
  BASE_URL: 'https://77cac04c3be3.ngrok.app/',
  ENDPOINTS: {
    // Auth endpoints
    CONSENT_CHECK: '/api/consent/check',
    CONSENT_CURRENT: '/api/consent/current',
    CONSENT_ACCEPT: '/api/consent/accept',
    CONSENT_REVOKE: '/api/consent/revoke',
    
    // Admin endpoints
    COMPANIES: '/api/companies',
    ADMIN_USERS: '/api/admin/users',
    AUDIT_LOGS: '/api/audit-logs',
    
    // Company endpoints
    COMPANY_USERS: '/api/company/users',
    
    // Email endpoints
    SEND_COMPANY_APPROVAL: '/api/send-company-approval-email',
    SEND_USER_INVITATION: '/api/send-user-invitation-email',
    FORGOT_PASSWORD: '/api/forgot-password',
    
    // Other endpoints
    REFUGEE_VALIDATION: '/api/refugee/check-validation-status',
    ACTIVATE: '/api/activate',
    DEACTIVATE: '/api/deactivate'
  }
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Common headers for API requests
export const getApiHeaders = (includeAuth: boolean = false) => {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  };

  if (includeAuth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};
