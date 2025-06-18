
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
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      localStorage.removeItem('current_log_user');
    }
  }

  private saveToStorage() {
    if (this.currentUser) {
      localStorage.setItem('current_log_user', JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem('current_log_user');
    }
  }

  setCurrentUser(user: CurrentUser) {
    this.currentUser = user;
    this.saveToStorage();
    this.notifyListeners();
  }

  getCurrentUser(): CurrentUser | null {
    return this.currentUser;
  }

  clearCurrentUser() {
    this.currentUser = null;
    this.saveToStorage();
    this.notifyListeners();
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
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
