
interface CurrentUser {
  id: string;
  email: string;
  user_type: 'super_admin' | 'admin' | 'employer_admin' | 'company_user' | 'refugee';
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
  company_id?: string;
  role?: string; // Added role field
}

class SessionStore {
  private currentUser: CurrentUser | null = null;
  private listeners: Array<(user: CurrentUser | null) => void> = [];

  constructor() {
    // Load user from localStorage on initialization
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedUser = localStorage.getItem('current_log_user');
      const storedToken = localStorage.getItem('access_token');
      
      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser);
        
        // Validate token for employer_admin users
        if (user.user_type === 'employer_admin') {
          const isValidToken = this.validateEmployerAdminToken(storedToken);
          if (!isValidToken) {
            console.log('Invalid token detected for employer_admin - clearing session');
            this.clearCurrentUser();
            return;
          }
        }
        
        this.currentUser = user;
        console.log('Session restored from storage:', this.currentUser);
      } else {
        console.log('No stored session found');
        this.clearCurrentUser();
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      this.clearCurrentUser();
    }
  }

  private validateEmployerAdminToken(token: string): boolean {
    try {
      // Basic JWT decode (without verification - just for checking payload)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decoded = JSON.parse(jsonPayload);
      console.log('Token payload validation:', decoded);
      
      // Check if employer_admin has required fields
      if (decoded.user_type === 'employer_admin') {
        if (!decoded.company_id || !decoded.role) {
          console.warn('Token missing required fields for employer_admin:', {
            has_company_id: !!decoded.company_id,
            has_role: !!decoded.role
          });
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  private saveToStorage() {
    try {
      if (this.currentUser) {
        localStorage.setItem('current_log_user', JSON.stringify(this.currentUser));
        console.log('Session saved to storage');
      } else {
        localStorage.removeItem('current_log_user');
        localStorage.removeItem('access_token');
        console.log('Session cleared from storage');
      }
    } catch (error) {
      console.error('Error saving session to storage:', error);
    }
  }

  setCurrentUser(user: CurrentUser) {
    this.currentUser = user;
    this.saveToStorage();
    this.notifyListeners();
    console.log('User session set:', user);
  }

  getCurrentUser(): CurrentUser | null {
    return this.currentUser;
  }

  clearCurrentUser() {
    this.currentUser = null;
    // Clear all auth-related data from localStorage
    localStorage.removeItem('current_log_user');
    localStorage.removeItem('access_token');
    this.notifyListeners();
    console.log('User session cleared completely');
  }

  isLoggedIn(): boolean {
    // Simplified logic: if we have a valid user with an ID, they're logged in
    // The token check is secondary since the user object itself indicates authentication
    const hasValidUser = this.currentUser !== null && !!this.currentUser.id;
    const hasToken = localStorage.getItem('access_token') !== null;
    
    console.log('Login check - hasValidUser:', hasValidUser, 'hasToken:', hasToken, 'currentUser:', this.currentUser);
    
    // Primary check: valid user exists
    // Secondary check: token exists (but don't fail if temporarily missing during login flow)
    return hasValidUser;
  }

  // New method to check if user needs token refresh
  needsTokenRefresh(): boolean {
    if (!this.currentUser) return false;
    
    if (this.currentUser.user_type === 'employer_admin') {
      return !this.currentUser.company_id || !this.currentUser.role;
    }
    
    return false;
  }

  subscribe(listener: (user: CurrentUser | null) => void) {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }
}

export const sessionStore = new SessionStore();
export type { CurrentUser };
