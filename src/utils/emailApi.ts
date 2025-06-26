
import { buildApiUrl } from '@/config/api';

export interface CompanyApprovalEmailData {
  to: string;
  company_name: string;
  verification_code: string;
  expires_in_days: number;
}

export interface UserInvitationEmailData {
  to: string;
  name: string;
  temporary_password: string;
  company_id: string;
  company_name?: string;
  invited_by?: string;
}

export interface ForgotPasswordEmailData {
  email: string;
}

export const sendCompanyApprovalEmail = async (data: CompanyApprovalEmailData) => {
  console.log('Sending company approval email via backend API');
  
  const response = await fetch(buildApiUrl('/api/send-company-approval-email'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    console.error('Error sending company approval email:', errorData);
    throw new Error(`Failed to send approval email: ${errorData.message || 'Unknown error'}`);
  }

  const result = await response.json();
  console.log('Company approval email sent successfully:', result);
  return result;
};

export const sendUserInvitationEmail = async (data: UserInvitationEmailData) => {
  console.log('Sending user invitation email via backend API');
  
  const response = await fetch(buildApiUrl('/api/send-user-invitation-email'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    console.error('Error sending user invitation email:', errorData);
    throw new Error(`Failed to send invitation email: ${errorData.message || 'Unknown error'}`);
  }

  const result = await response.json();
  console.log('User invitation email sent successfully:', result);
  return result;
};

export const sendForgotPasswordEmail = async (data: ForgotPasswordEmailData) => {
  console.log('Sending forgot password email via backend API');
  
  const response = await fetch(buildApiUrl('/api/forgot-password'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    let errorMessage = 'Failed to send reset link';
    
    try {
      const errorData = await response.json();
      console.log('Error response data:', errorData);
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (parseError) {
      console.log('Could not parse error response as JSON');
      const errorText = await response.text();
      console.log('Error response text:', errorText);
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  const result = await response.json();
  console.log('Forgot password email sent successfully:', result);
  return result;
};
