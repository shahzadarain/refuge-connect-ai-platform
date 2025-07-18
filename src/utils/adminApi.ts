import { buildApiUrl, getApiHeaders } from '@/config/api';

export interface Company {
  id: string;
  legal_name: string;
  country_of_registration: string;
  registration_number: string;
  website?: string;
  number_of_employees?: number;
  about_company?: string;
  is_approved: boolean;
  is_active?: boolean; // Add is_active field
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
  company_name?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
  company_id?: string;
}

// Updated interface for approval response with verification details
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

export const fetchCompanies = async (): Promise<Company[]> => {
  console.log('Fetching companies from API...');
  const response = await fetch(buildApiUrl('/api/companies'), {
    method: 'GET',
    headers: getApiHeaders(true) // ✅ Added includeAuth: true
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch companies: ${response.status}`);
  }

  const data = await response.json();
  console.log('Companies data received:', data);
  return Array.isArray(data) ? data : [];
};

export const fetchUsers = async (): Promise<User[]> => {
  console.log('Fetching users from API...');
  
  try {
    const response = await fetch(buildApiUrl('/api/admin/users'), {
      method: 'GET',
      headers: getApiHeaders(true) // ✅ Added includeAuth: true
    });

    console.log('Users API response status:', response.status);
    console.log('Users API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch users:', response.status, errorText);
      
      // If endpoint doesn't exist, return empty array
      if (response.status === 404 || response.status === 405) {
        console.log('Users endpoint not available, returning empty array');
        return [];
      }
      
      throw new Error(`Failed to fetch users: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Users data received:', data);
    
    // Handle different response formats
    if (data && data.users && Array.isArray(data.users)) {
      return data.users;
    } else if (Array.isArray(data)) {
      return data;
    } else if (data && data.data && Array.isArray(data.data)) {
      return data.data;
    } else {
      console.warn('Unexpected users response format:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
};

export const fetchCompanyAdmin = async (companyId: string): Promise<User | null> => {
  console.log('Fetching company admin for company:', companyId);
  
  try {
    // First try to get all users and filter
    const response = await fetch(buildApiUrl('/api/admin/users'), {
      method: 'GET',
      headers: getApiHeaders()
    });

    if (!response.ok) {
      console.log('Failed to fetch users:', response.status);
      return null;
    }

    const users = await response.json();
    console.log('All users received:', users);
    
    if (!Array.isArray(users)) {
      console.log('Users response is not an array:', users);
      return null;
    }
    
    // Find the employer_admin user for this company
    const companyAdmin = users.find((user: User) => 
      user.user_type === 'employer_admin' && 
      user.company_id === companyId
    );
    
    console.log('Found company admin:', companyAdmin);
    return companyAdmin || null;
  } catch (error) {
    console.error('Error fetching company admin:', error);
    return null;
  }
};

export const approveCompany = async (companyId: string, adminId: string, adminComment?: string): Promise<ApprovalResponse> => {
  console.log('Approving company:', companyId, 'by admin:', adminId, 'with comment:', adminComment);
  
  const requestBody = {
    is_approved: true,
    admin_comment: adminComment
  };
  
  console.log('Request body being sent:', requestBody);
  
  const response = await fetch(buildApiUrl(`/api/companies/${companyId}/approve`), {
    method: 'PUT',
    headers: getApiHeaders(true), // ✅ Added includeAuth: true
    body: JSON.stringify(requestBody)
  });

  console.log('Response status:', response.status);

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
  
  const response = await fetch(buildApiUrl(`/api/companies/${companyId}/approve`), {
    method: 'PUT',
    headers: getApiHeaders(true), // ✅ Added includeAuth: true
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

export const activateCompany = async (companyId: string): Promise<void> => {
  console.log('Activating company:', companyId);
  const response = await fetch(buildApiUrl(`/api/companies/${companyId}/activate`), {
    method: 'PUT',
    headers: getApiHeaders(true)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error activating company:', errorText);
    throw new Error(`Failed to activate company: ${response.status} - ${errorText}`);
  }

  const responseData = await response.json();
  console.log('Company activation response:', responseData);
};

export const deactivateCompany = async (companyId: string): Promise<void> => {
  console.log('Deactivating company:', companyId);
  const response = await fetch(buildApiUrl(`/api/companies/${companyId}/deactivate`), {
    method: 'PUT',
    headers: getApiHeaders(true)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error deactivating company:', errorText);
    throw new Error(`Failed to deactivate company: ${response.status} - ${errorText}`);
  }

  const responseData = await response.json();
  console.log('Company deactivation response:', responseData);
};

export const activateUser = async (userId: string): Promise<void> => {
  console.log('Activating user:', userId);
  const response = await fetch(buildApiUrl('/api/activate'), {
    method: 'POST',
    headers: getApiHeaders(true), // ✅ Added includeAuth: true
    body: JSON.stringify({ user_id: userId })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error activating user:', errorText);
    throw new Error(`Failed to activate user: ${response.status} - ${errorText}`);
  }

  const responseData = await response.json();
  console.log('User activation response:', responseData);
};

export const deactivateUser = async (userId: string): Promise<void> => {
  console.log('Deactivating user:', userId);
  const response = await fetch(buildApiUrl('/api/deactivate'), {
    method: 'POST',
    headers: getApiHeaders(true), // ✅ Added includeAuth: true
    body: JSON.stringify({ user_id: userId })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error deactivating user:', errorText);
    throw new Error(`Failed to deactivate user: ${response.status} - ${errorText}`);
  }

  const responseData = await response.json();
  console.log('User deactivation response:', responseData);
};

export const fetchUserLastLogin = async (userId: string): Promise<{ last_login?: string }> => {
  console.log('Fetching last login for user:', userId);
  
  try {
    const response = await fetch(buildApiUrl(`/api/admin/users/${userId}/update-last-login`), {
      method: 'GET',
      headers: getApiHeaders(true) // ✅ Added includeAuth: true
    });

    if (!response.ok) {
      console.log('Failed to fetch user last login:', response.status);
      return {};
    }

    const data = await response.json();
    console.log('User last login data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching user last login:', error);
    return {};
  }
};
