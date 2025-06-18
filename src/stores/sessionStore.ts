
interface CurrentUser {
  id: string;
  email: string;
  user_type: 'super_admin' | 'employer_admin' | 'refugee';
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
    this.saveToStorage();
    this.notifyListeners();
    console.log('User session cleared');
  }

  isLoggedIn(): boolean {
    const hasUser = this.currentUser !== null;
    const hasToken = localStorage.getItem('access_token') !== null;
    return hasUser && hasToken;
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
