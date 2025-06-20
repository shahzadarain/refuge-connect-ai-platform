
import { supabase } from '@/integrations/supabase/client';

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

export const sendCompanyApprovalEmail = async (data: CompanyApprovalEmailData) => {
  console.log('Sending company approval email via Supabase Edge Function');
  
  const { data: response, error } = await supabase.functions.invoke('send-company-approval-email', {
    body: data
  });

  if (error) {
    console.error('Error sending company approval email:', error);
    throw new Error(`Failed to send approval email: ${error.message}`);
  }

  console.log('Company approval email sent successfully:', response);
  return response;
};

export const sendUserInvitationEmail = async (data: UserInvitationEmailData) => {
  console.log('Sending user invitation email via Supabase Edge Function');
  
  const { data: response, error } = await supabase.functions.invoke('send-user-invitation-email', {
    body: data
  });

  if (error) {
    console.error('Error sending user invitation email:', error);
    throw new Error(`Failed to send invitation email: ${error.message}`);
  }

  console.log('User invitation email sent successfully:', response);
  return response;
};
