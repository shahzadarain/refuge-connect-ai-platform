
export interface Company {
  id: string;
  legal_name: string;
  country_of_registration: string;
  registration_number: string;
  website?: string;
  number_of_employees?: number;
  about_company?: string;
  is_approved: boolean;
  approved_by?: string;
  approved_at?: string;
  admin_comment?: string;
  created_at: string;
}

export interface User {
  id: string;
  user_type: 'employer_admin' | 'refugee';
  email: string;
  phone?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
}

// Add interface for approval response
export interface ApprovalResponse {
  success: boolean;
  message: string;
  verification_details?: {
    email: string;
    company_name: string;
    verification_code: string;
    expires_in_days: number;
  };
}

const API_BASE_URL = 'https://ab93e9536acd.ngrok.app/api';
const API_HEADERS = {
  'Accept': 'application/json',
  'ngrok-skip-browser-warning': 'true'
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    ...API_HEADERS,
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const fetchCompanies = async (): Promise<Company[]> => {
  console.log('Fetching companies from API...');
  const response = await fetch(`${API_BASE_URL}/companies`, {
    method: 'GET',
    headers: API_HEADERS
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch companies: ${response.status}`);
  }

  const data = await response.json();
  console.log('Companies data received:', data);
  return data;
};

export const fetchUsers = async (): Promise<User[]> => {
  console.log('Fetching users from API...');
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'GET',
    headers: API_HEADERS
  });

  if (!response.ok) {
    console.log('Users endpoint not available or failed:', response.status);
    return [];
  }

  const data = await response.json();
  console.log('Users data received:', data);
  return data;
};

export const approveCompany = async (companyId: string, adminId: string, adminComment?: string): Promise<ApprovalResponse> => {
  console.log('Approving company:', companyId, 'by admin:', adminId, 'with comment:', adminComment);
  
  const requestBody = {
    is_approved: true,
    admin_comment: adminComment
  };
  
  console.log('Request body being sent:', requestBody);
  
  const response = await fetch(`${API_BASE_URL}/companies/${companyId}/approve`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(requestBody)
  });

  console.log('Response status:', response.status);
  console.log('Response headers:', response.headers);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error(`Failed to approve company: ${response.status} - ${errorText}`);
  }

  const responseData = await response.json();
  console.log('Approval response data:', responseData);
  return responseData;
};

export const rejectCompany = async (companyId: string, adminId: string, adminComment?: string): Promise<void> => {
  console.log('Rejecting company:', companyId, 'by admin:', adminId, 'with comment:', adminComment);
  
  const requestBody = {
    is_approved: false,
    admin_comment: adminComment
  };
  
  console.log('Request body being sent:', requestBody);
  
  const response = await fetch(`${API_BASE_URL}/companies/${companyId}/approve`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(requestBody)
  });

  console.log('Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error(`Failed to reject company: ${response.status} - ${errorText}`);
  }

  const responseData = await response.json();
  console.log('Rejection response data:', responseData);
};

export const activateUser = async (userId: string): Promise<void> => {
  console.log('Activating user:', userId);
  const response = await fetch(`${API_BASE_URL}/users/${userId}/activate`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Failed to activate user');
  }
};
