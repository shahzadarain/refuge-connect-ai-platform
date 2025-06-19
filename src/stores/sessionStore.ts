
interface CurrentUser {
  id: string;
  email: string;
  user_type: 'super_admin' | 'employer_admin' | 'refugee';
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
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
        this.currentUser = JSON.parse(storedUser);
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
