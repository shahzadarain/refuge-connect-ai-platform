
import { CompanyUser } from '@/components/types/companyUser';

const API_BASE_URL = 'https://ab93e9536acd.ngrok.app/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  };
};

export const fetchCompanyUsers = async (): Promise<CompanyUser[]> => {
  console.log('Fetching company users...');
  
  const response = await fetch(`${API_BASE_URL}/company/users`, {
    headers: getAuthHeaders()
  });

  console.log('Company users API response status:', response.status);

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Failed to fetch company users:', response.status, errorData);
    throw new Error('Failed to load company users');
  }

  const userData = await response.json();
  console.log('Company users data received:', userData);
  return Array.isArray(userData) ? userData : [];
};

export const toggleUserStatus = async (userId: string, currentStatus: boolean): Promise<void> => {
  console.log('Toggling user status for:', userId, 'current status:', currentStatus);
  
  const response = await fetch(`${API_BASE_URL}/company/users/${userId}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      is_active: !currentStatus
    })
  });

  console.log('Toggle status response:', response.status);

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Failed to update user status:', response.status, errorData);
    
    if (response.status === 400) {
      throw new Error('Cannot deactivate your own account');
    } else {
      throw new Error(errorData.detail || 'Failed to update user status');
    }
  }

  const responseData = await response.json();
  console.log('Status updated successfully:', responseData);
};

export const deleteUser = async (userId: string): Promise<void> => {
  console.log('Deleting user:', userId);
  
  const response = await fetch(`${API_BASE_URL}/company/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  console.log('Delete user response:', response.status);

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Failed to delete user:', response.status, errorData);
    
    if (response.status === 400) {
      throw new Error('Cannot delete your own account');
    } else {
      throw new Error(errorData.detail || 'Failed to delete user');
    }
  }

  const responseData = await response.json();
  console.log('User deleted successfully:', responseData);
};
