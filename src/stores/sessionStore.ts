
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
      
      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser);
        this.currentUser = user;
        console.log('SessionStore - Session restored:', this.currentUser);
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
      } else {
        this.clearSession();
      }
    } catch (error) {
      console.error('SessionStore - Error saving to storage:', error);
    }
  }

  private clearSession() {
    localStorage.removeItem('current_log_user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refugee_validation_email'); // Clean up any other session data
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
    
    console.log('SessionStore - Login check:', { hasValidUser, hasToken, userId: this.currentUser?.id });
    
    // Both user and token must exist for a valid session
    return hasValidUser && hasToken;
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
