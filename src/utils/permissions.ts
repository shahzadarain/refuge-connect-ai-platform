
import { CurrentUser } from '@/stores/sessionStore';

export const canManageUsers = (user: CurrentUser | null): boolean => {
  if (!user) {
    console.log('canManageUsers: No user provided');
    return false;
  }
  
  console.log('canManageUsers: Checking permissions for user:', {
    user_type: user.user_type,
    role: user.role,
    id: user.id
  });
  
  // Original company creator
  if (user.user_type === 'employer_admin') {
    console.log('canManageUsers: Access granted - employer_admin');
    return true;
  }
  
  // Company admin (additional admin users)
  if (user.user_type === 'company_user' && user.role === 'company_admin') {
    console.log('canManageUsers: Access granted - company_admin');
    return true;
  }
  
  // System admins
  if (user.user_type === 'admin' || user.user_type === 'super_admin') {
    console.log('canManageUsers: Access granted - system admin');
    return true;
  }
  
  // Everyone else cannot access (including company_user with role company_user)
  console.log('canManageUsers: Access denied - insufficient privileges');
  return false;
};
