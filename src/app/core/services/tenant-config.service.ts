import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { TenantConfig, TenantTheme } from '../models/tenant-config.model';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TenantConfigService {
  private currentTenantSubject = new BehaviorSubject<string>('demo-ngo');
  private tenantConfigSubject = new BehaviorSubject<TenantConfig | null>(null);
  
  currentTenant$ = this.currentTenantSubject.asObservable();
  tenantConfig$ = this.tenantConfigSubject.asObservable();

  private storagePrefix = 'donors-app::';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadSavedTenant();
  }

  private loadSavedTenant(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedTenant = localStorage.getItem(`${this.storagePrefix}currentTenant`);
      if (savedTenant) {
        this.switchTenant(savedTenant);
        return;
      }
    }
    this.loadTenantConfig('demo-ngo');
  }

  switchTenant(tenantKey: string): Observable<TenantConfig> {
    return this.loadTenantConfig(tenantKey).pipe(
      tap(config => {
        this.currentTenantSubject.next(tenantKey);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(`${this.storagePrefix}currentTenant`, tenantKey);
        }
        this.applyTheme(config);
      })
    );
  }

  loadTenantConfig(tenantKey: string): Observable<TenantConfig> {
    return this.http.get<TenantConfig>(`/assets/tenants/${tenantKey}/config.json`).pipe(
      tap(config => this.tenantConfigSubject.next(config)),
      catchError(error => {
        console.error(`Failed to load tenant config for ${tenantKey}:`, error);
        return this.getFallbackConfig(tenantKey);
      })
    );
  }

  private getFallbackConfig(tenantKey: string): Observable<TenantConfig> {
    const fallbackConfig: TenantConfig = {
      name: tenantKey.charAt(0).toUpperCase() + tenantKey.slice(1),
      logoUrl: '/assets/logo-placeholder.svg',
      primaryColor: '#1976d2',
      accentColor: '#ff5722',
      textBlocks: {
        welcomeMessage: `Welcome to ${tenantKey}`,
        aboutUs: 'About our organization',
        missionStatement: 'Our mission statement',
        contactInfo: 'Contact us for more information'
      }
    };
    this.tenantConfigSubject.next(fallbackConfig);
    return of(fallbackConfig);
  }

  private applyTheme(config: TenantConfig): void {
    if (isPlatformBrowser(this.platformId)) {
      const root = document.documentElement;
      root.style.setProperty('--primary-color', config.primaryColor);
      root.style.setProperty('--accent-color', config.accentColor);
    }
  }

  getCurrentTenant(): string {
    return this.currentTenantSubject.value;
  }

  getCurrentConfig(): TenantConfig | null {
    return this.tenantConfigSubject.value;
  }

  getStorageKey(key: string): string {
    return `${this.storagePrefix}${this.getCurrentTenant()}::${key}`;
  }

  getAvailableTenants(): string[] {
    return ['amani', 'generic', 'demo-ngo'];
  }
}
