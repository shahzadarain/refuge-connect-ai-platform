
export interface CompanyUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: 'company_admin' | 'company_user';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}
