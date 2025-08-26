import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TenantConfigService } from '../../core/services/tenant-config.service';
import { AuthService } from '../../core/services/auth.service';
import { TenantConfig } from '../../core/models/tenant-config.model';
import { User } from '../../core/models/auth.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDividerModule,
    RouterModule
  ],
  template: `
    <mat-toolbar class="app-header">
      <div class="header-content">
        <!-- Logo and Organization Name -->
        <div class="logo-section" routerLink="/">
          <img 
            *ngIf="tenantConfig?.logoUrl" 
            [src]="tenantConfig?.logoUrl" 
            [alt]="(tenantConfig?.name || 'Organization') + ' logo'"
            class="logo"
            (error)="onLogoError($event)"
          >
          <span class="org-name">{{ tenantConfig?.name || 'Donor Portal' }}</span>
        </div>

        <!-- Navigation Links -->
        <nav class="nav-links" *ngIf="currentUser">
          <a mat-button routerLink="/donor-trip" routerLinkActive="active" class="nav-button">
            <mat-icon>card_travel</mat-icon>
            <span class="nav-text">Trips</span>
          </a>
          <a mat-button routerLink="/donor-promises" routerLinkActive="active" class="nav-button">
            <mat-icon>assignment_turned_in</mat-icon>
            <span class="nav-text">Promises</span>
          </a>
          <a mat-button 
             routerLink="/admin/how-to" 
             routerLinkActive="active"
             class="nav-button"
             *ngIf="currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff')">
            <mat-icon>help_outline</mat-icon>
            <span class="nav-text">How-to</span>
          </a>
        </nav>

        <!-- Right side controls -->
        <div class="header-controls">
          <!-- Tenant Switcher -->
          <mat-form-field appearance="outline" class="tenant-selector" *ngIf="currentUser">
            <mat-label>Organization</mat-label>
            <mat-select 
              [value]="currentTenant" 
              (selectionChange)="onTenantChange($event.value)"
              [attr.aria-label]="'Switch organization'"
            >
              <mat-option value="amani">Amani Foundation</mat-option>
              <mat-option value="generic">Generic NGO</mat-option>
              <mat-option value="demo-ngo">Demo NGO</mat-option>
            </mat-select>
          </mat-form-field>

          <!-- User Menu -->
          <div class="user-menu" *ngIf="currentUser">
            <button mat-icon-button [matMenuTriggerFor]="userMenu" [attr.aria-label]="'User menu'" class="user-avatar">
              <mat-icon>account_circle</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu" class="user-dropdown">
              <div class="user-info">
                <div class="user-avatar-large">
                  <mat-icon>account_circle</mat-icon>
                </div>
                <div class="user-details">
                  <div class="user-name">{{ currentUser.firstName }} {{ currentUser.lastName }}</div>
                  <div class="user-role">{{ currentUser.role | titlecase }}</div>
                </div>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()" class="logout-item">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
            </mat-menu>
          </div>

          <!-- Login Button -->
          <button mat-raised-button 
             routerLink="/login" 
             *ngIf="!currentUser"
             class="gradient-button login-button"
             [attr.aria-label]="'Login to your account'">
            <mat-icon>login</mat-icon>
            Login
          </button>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .app-header {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: linear-gradient(135deg, #4caf50 0%, #81c784 100%) !important;
      box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
      backdrop-filter: blur(10px);
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }

    .logo-section {
      display: flex;
      align-items: center;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      padding: 8px 0;
      transition: transform 0.3s ease;
    }

    .logo-section:hover {
      transform: scale(1.05);
    }

    .logo {
      height: 40px;
      width: auto;
      margin-right: 12px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .org-name {
      font-size: 1.25rem;
      font-weight: 600;
      color: white;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-button {
      color: rgba(255, 255, 255, 0.9) !important;
      transition: all 0.3s ease !important;
      border-radius: 8px !important;
      padding: 8px 16px !important;
      position: relative;
      overflow: hidden;
    }

    .nav-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.1);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.3s ease;
    }

    .nav-button:hover::before,
    .nav-button.active::before {
      transform: scaleX(1);
    }

    .nav-button:hover,
    .nav-button.active {
      color: white !important;
      background-color: rgba(255, 255, 255, 0.15) !important;
      transform: translateY(-1px);
    }

    .nav-button .mat-icon {
      margin-right: 6px;
      font-size: 20px;
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .tenant-selector {
      min-width: 160px;
    }

    .tenant-selector .mat-mdc-form-field-wrapper {
      padding-bottom: 0;
    }

    .tenant-selector .mat-mdc-text-field-wrapper {
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
    }

    .tenant-selector .mat-mdc-form-field-label {
      color: rgba(255, 255, 255, 0.8) !important;
    }

    .user-avatar {
      color: white !important;
      background-color: rgba(255, 255, 255, 0.1) !important;
      border-radius: 50% !important;
      transition: all 0.3s ease !important;
    }

    .user-avatar:hover {
      background-color: rgba(255, 255, 255, 0.2) !important;
      transform: scale(1.1);
    }

    .user-dropdown .user-info {
      padding: 16px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 200px;
    }

    .user-avatar-large {
      color: var(--primary-color);
      font-size: 40px;
    }

    .user-avatar-large mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
    }

    .user-details {
      flex: 1;
    }

    .user-name {
      font-weight: 600;
      font-size: 16px;
      color: #333;
      margin-bottom: 2px;
    }

    .user-role {
      font-size: 12px;
      color: var(--primary-color);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .logout-item {
      color: #f44336 !important;
    }

    .logout-item:hover {
      background-color: rgba(244, 67, 54, 0.1) !important;
    }

    .login-button {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      padding: 8px 20px !important;
    }

    .login-button mat-icon {
      font-size: 18px;
    }

    @media (max-width: 768px) {
      .header-content {
        padding: 0 8px;
      }

      .nav-text {
        display: none;
      }

      .nav-button .mat-icon {
        margin-right: 0;
      }

      .tenant-selector {
        min-width: 120px;
      }

      .org-name {
        font-size: 1rem;
      }

      .header-controls {
        gap: 8px;
      }
    }

    @media (max-width: 480px) {
      .logo {
        height: 32px;
      }

      .nav-links {
        gap: 4px;
      }

      .nav-button {
        padding: 6px 12px !important;
      }
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  currentTenant: string = '';
  tenantConfig: TenantConfig | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private tenantService: TenantConfigService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(authState => {
        this.currentUser = authState.user;
      });

    this.tenantService.currentTenant$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tenant => {
        this.currentTenant = tenant;
      });

    this.tenantService.tenantConfig$
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => {
        this.tenantConfig = config;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTenantChange(tenantKey: string): void {
    this.tenantService.switchTenant(tenantKey).subscribe();
  }

  logout(): void {
    this.authService.logout();
  }

  onLogoError(event: any): void {
    // Hide broken logo
    event.target.style.display = 'none';
  }
}
