
import { CurrentUser } from '@/stores/sessionStore';

export const canManageUsers = (user: CurrentUser | null): boolean => {
  if (!user) return false;
  
  // Original company creator
  if (user.user_type === 'employer_admin') return true;
  
  // Company admin (additional admin users)
  if (user.user_type === 'company_user' && user.role === 'company_admin') return true;
  
  // System admins
  if (user.user_type === 'admin' || user.user_type === 'super_admin') return true;
  
  // Everyone else cannot access (including company_user with role company_user)
  return false;
};
