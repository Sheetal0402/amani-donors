export interface User {
  id: string;
  username: string;
  email: string;
  role: 'donor' | 'staff' | 'admin';
  firstName: string;
  lastName: string;
  tenantKey: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
}
