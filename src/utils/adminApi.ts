
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

const API_BASE_URL = 'https://ab93e9536acd.ngrok.app/api';
const API_HEADERS = {
  'Accept': 'application/json',
  'ngrok-skip-browser-warning': 'true'
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

export const approveCompany = async (companyId: string): Promise<void> => {
  console.log('Approving company:', companyId);
  const response = await fetch(`${API_BASE_URL}/companies/${companyId}/approve`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...API_HEADERS
    }
  });

  if (!response.ok) {
    throw new Error('Failed to approve company');
  }
};

export const rejectCompany = async (companyId: string): Promise<void> => {
  console.log('Rejecting company:', companyId);
  const response = await fetch(`${API_BASE_URL}/companies/${companyId}/reject`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...API_HEADERS
    }
  });

  if (!response.ok) {
    throw new Error('Failed to reject company');
  }
};

export const activateUser = async (userId: string): Promise<void> => {
  console.log('Activating user:', userId);
  const response = await fetch(`${API_BASE_URL}/users/${userId}/activate`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...API_HEADERS
    }
  });

  if (!response.ok) {
    throw new Error('Failed to activate user');
  }
};
