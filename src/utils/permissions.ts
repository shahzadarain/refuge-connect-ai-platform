
import { CurrentUser } from '@/stores/sessionStore';

export const canManageUsers = (user: CurrentUser | null): boolean => {
  if (!user) {
    console.log('canManageUsers: No user provided');
    return false;
  }
  
  console.log('canManageUsers: Full user object:', JSON.stringify(user, null, 2));
  console.log('canManageUsers: Checking permissions for user:', {
    user_type: user.user_type,
    role: user.role,
    id: user.id,
    hasRole: user.hasOwnProperty('role'),
    roleValue: user.role
  });
  
  // Original company creator - should ALWAYS have access regardless of role
  if (user.user_type === 'employer_admin') {
    console.log('canManageUsers: Access granted - employer_admin (ignoring role field)');
    return true;
  }
  
  // Company admin (additional admin users) - only if role is company_admin
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
  console.log(`canManageUsers: User type "${user.user_type}" with role "${user.role}" does not have admin access`);
  return false;
};
