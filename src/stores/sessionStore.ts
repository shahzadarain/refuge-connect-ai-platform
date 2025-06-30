interface CurrentUser {
  id: string;
  email: string;
  user_type: 'super_admin' | 'employer_admin' | 'company_user' | 'refugee';
  first_name?: string;
  last_name?: string;
  phone: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
  company_id?: string;
  role?: string;
  has_consented_data_protection?: boolean;
}

class SessionStore {
  private currentUser: CurrentUser | null = null;
  private listeners: ((user: CurrentUser | null) => void)[] = [];
  private isInitialized = false;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedUser = localStorage.getItem('current_log_user');
      const storedToken = localStorage.getItem('access_token');
      
      console.log('SessionStore - Loading from storage:', { hasUser: !!storedUser, hasToken: !!storedToken });
      
      if (storedUser) {
        const user = JSON.parse(storedUser);
        
        // For super admin, be more lenient with token validation
        if (user.user_type === 'super_admin') {
          console.log('SessionStore - Super admin login detected, skipping strict token validation');
          this.currentUser = user;
          console.log('SessionStore - Super admin session restored:', this.currentUser);
        } else if (storedToken) {
          // For other users, validate token but be lenient
          try {
            const base64Url = storedToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const payload = JSON.parse(jsonPayload);
            const currentTime = Math.floor(Date.now() / 1000);
            
            // Add 5 minute buffer to prevent immediate expiry issues
            if (payload.exp && payload.exp < (currentTime - 300)) {
              console.log('SessionStore - Token expired, clearing session');
              this.clearSession();
              return;
            }
            
            this.currentUser = user;
            console.log('SessionStore - Regular user session restored:', this.currentUser);
          } catch (error) {
            console.log('SessionStore - Token validation error, but keeping session for compatibility:', error);
            // Keep the session even if token validation fails - let the API handle it
            this.currentUser = user;
          }
        } else {
          console.log('SessionStore - No token found for non-admin user');
          this.clearSession();
        }
      } else {
        console.log('SessionStore - No valid session found');
        this.clearSession();
      }
    } catch (error) {
      console.error('SessionStore - Error loading from storage:', error);
      this.clearSession();
    } finally {
      this.isInitialized = true;
    }
  }

  private saveToStorage() {
    try {
      if (this.currentUser) {
        localStorage.setItem('current_log_user', JSON.stringify(this.currentUser));
        console.log('SessionStore - Session saved to storage');
      }
    } catch (error) {
      console.error('SessionStore - Error saving to storage:', error);
    }
  }

  private clearSession() {
    localStorage.removeItem('current_log_user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refugee_validation_email');
    localStorage.removeItem('api_cache');
    console.log('SessionStore - All session data cleared');
  }

  setCurrentUser(user: CurrentUser) {
    console.log('SessionStore - Setting user:', user);
    this.currentUser = user;
    this.saveToStorage();
    this.notifyListeners();
  }

  updateUserConsent(hasConsented: boolean) {
    if (this.currentUser) {
      this.currentUser.has_consented_data_protection = hasConsented;
      this.saveToStorage();
      this.notifyListeners();
      console.log('SessionStore - User consent updated:', hasConsented);
    }
  }

  getCurrentUser(): CurrentUser | null {
    return this.currentUser;
  }

  clearCurrentUser() {
    console.log('SessionStore - Clearing current user');
    this.currentUser = null;
    this.clearSession();
    this.notifyListeners();
  }

  isLoggedIn(): boolean {
    const hasValidUser = this.currentUser !== null && !!this.currentUser.id;
    const hasToken = localStorage.getItem('access_token') !== null;
    
    console.log('SessionStore - Login check:', { 
      hasValidUser, 
      hasToken, 
      userId: this.currentUser?.id,
      userType: this.currentUser?.user_type 
    });
    
    // For super admin, only check if user data exists
    if (this.currentUser?.user_type === 'super_admin') {
      console.log('SessionStore - Super admin login check:', hasValidUser);
      return hasValidUser;
    }
    
    // For other users, both user and token should exist (but be lenient)
    return hasValidUser;
  }

  subscribe(listener: (user: CurrentUser | null) => void) {
    this.listeners.push(listener);
    
    // If already initialized, immediately call the listener with current state
    if (this.isInitialized) {
      listener(this.currentUser);
    }
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    console.log('SessionStore - Notifying listeners, user:', this.currentUser?.email || 'null');
    this.listeners.forEach(listener => listener(this.currentUser));
  }
}

export const sessionStore = new SessionStore();
export type { CurrentUser };
