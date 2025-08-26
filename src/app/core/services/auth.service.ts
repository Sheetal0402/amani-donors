import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User, AuthState } from '../models/auth.model';
import { TenantConfigService } from './tenant-config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStateSubject = new BehaviorSubject<AuthState>({
    isLoggedIn: false,
    user: null,
    token: null
  });

  authState$ = this.authStateSubject.asObservable();

  // Mock users for demonstration
  private mockUsers: User[] = [
    {
      id: '1',
      username: 'admin@amani.org',
      email: 'admin@amani.org',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      tenantKey: 'amani'
    },
    {
      id: '2',
      username: 'donor@amani.org',
      email: 'donor@amani.org',
      role: 'donor',
      firstName: 'John',
      lastName: 'Donor',
      tenantKey: 'amani'
    },
    {
      id: '3',
      username: 'staff@generic.org',
      email: 'staff@generic.org',
      role: 'staff',
      firstName: 'Jane',
      lastName: 'Staff',
      tenantKey: 'generic'
    },
    {
      id: '4',
      username: 'admin@demo-ngo.org',
      email: 'admin@demo-ngo.org',
      role: 'admin',
      firstName: 'Demo',
      lastName: 'Admin',
      tenantKey: 'demo-ngo'
    }
  ];

  constructor(
    private tenantService: TenantConfigService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadSavedAuth();
  }

  private loadSavedAuth(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedAuth = localStorage.getItem('donors-app::auth');
      if (savedAuth) {
        try {
          const authState = JSON.parse(savedAuth);
          this.authStateSubject.next(authState);
        } catch (error) {
          console.error('Failed to parse saved auth state:', error);
          this.logout();
        }
      }
    }
  }

  login(email: string, password: string): Observable<AuthState> {
    // Mock authentication - in real app, this would call an API
    const user = this.mockUsers.find(u => u.email === email);
    
    if (user && password === 'password123') { // Mock password
      const authState: AuthState = {
        isLoggedIn: true,
        user: user,
        token: 'mock-jwt-token'
      };
      
      this.authStateSubject.next(authState);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('donors-app::auth', JSON.stringify(authState));
      }
      
      // Switch to user's tenant
      this.tenantService.switchTenant(user.tenantKey).subscribe();
      
      return of(authState);
    }
    
    throw new Error('Invalid credentials');
  }

  logout(): void {
    const authState: AuthState = {
      isLoggedIn: false,
      user: null,
      token: null
    };
    
    this.authStateSubject.next(authState);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('donors-app::auth');
    }
  }

  getCurrentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  isLoggedIn(): boolean {
    return this.authStateSubject.value.isLoggedIn;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  getMockUsers(): User[] {
    return this.mockUsers;
  }
}
