
import { sendUserInvitationEmail } from './emailApi';

export interface UserInvitationData {
  email: string;
  name: string;
  temporary_password: string;
  company_id: string;
  company_name?: string;
  invited_by?: string;
}

export const sendUserInvitation = async (userData: UserInvitationData) => {
  console.log('Sending user invitation email for:', userData.email);
  
  try {
    const response = await sendUserInvitationEmail({
      to: userData.email,
      name: userData.name,
      temporary_password: userData.temporary_password,
      company_id: userData.company_id,
      company_name: userData.company_name,
      invited_by: userData.invited_by
    });
    
    console.log('User invitation email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Failed to send user invitation email:', error);
    throw error;
  }
};
