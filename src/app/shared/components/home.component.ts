import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { TenantConfigService } from '../../core/services/tenant-config.service';
import { AuthService } from '../../core/services/auth.service';
import { TripService } from '../../core/services/trip.service';
import { PromiseService } from '../../core/services/promise.service';
import { TenantConfig } from '../../core/models/tenant-config.model';
import { User } from '../../core/models/auth.model';
import { Trip } from '../../core/models/trip.model';
import { Promise } from '../../core/models/promise.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatGridListModule
  ],
  template: `
    <div class="home-container">
      <!-- Welcome Section -->
      <section class="welcome-section" *ngIf="tenantConfig">
        <div class="welcome-content">
          <div class="welcome-text">
            <h1>{{ tenantConfig.textBlocks.welcomeMessage }}</h1>
            <p *ngIf="currentUser">
              Welcome back, {{ currentUser.firstName }}! 
              <span class="user-role">({{ currentUser.role | titlecase }})</span>
            </p>
          </div>
          <div class="org-logo" *ngIf="tenantConfig.logoUrl">
            <img 
              [src]="tenantConfig.logoUrl" 
              [alt]="tenantConfig.name + ' logo'"
              (error)="onLogoError($event)"
            >
          </div>
        </div>
      </section>

      <!-- Quick Stats -->
      <section class="stats-section" *ngIf="currentUser">
        <div class="stats-grid">
          <mat-card class="stat-card trips">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon">card_travel</mat-icon>
                <div class="stat-details">
                  <span class="stat-number">{{ trips.length }}</span>
                  <span class="stat-label">Planned Trips</span>
                </div>
              </div>
              <div class="stat-progress" *ngIf="trips.length > 0">
                <span class="progress-text">{{ getActiveTrips() }} active</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card promises">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon">assignment_turned_in</mat-icon>
                <div class="stat-details">
                  <span class="stat-number">{{ promises.length }}</span>
                  <span class="stat-label">Total Promises</span>
                </div>
              </div>
              <div class="stat-progress" *ngIf="promises.length > 0">
                <span class="progress-text">{{ getFulfilledPromises() }} fulfilled</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card checklist">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon">checklist</mat-icon>
                <div class="stat-details">
                  <span class="stat-number">{{ getTotalChecklistItems() }}</span>
                  <span class="stat-label">Checklist Items</span>
                </div>
              </div>
              <div class="stat-progress" *ngIf="getTotalChecklistItems() > 0">
                <span class="progress-text">{{ getCompletedChecklistItems() }} completed</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card pending">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon">schedule</mat-icon>
                <div class="stat-details">
                  <span class="stat-number">{{ getPendingPromises() }}</span>
                  <span class="stat-label">Pending Items</span>
                </div>
              </div>
              <div class="stat-progress">
                <span class="progress-text">Need attention</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="actions-section" *ngIf="currentUser">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <mat-card class="action-card" routerLink="/donor-trip">
            <mat-card-content>
              <mat-icon class="action-icon">card_travel</mat-icon>
              <h3>Plan a Trip</h3>
              <p>Create and manage donor trips with detailed checklists</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="action-card" routerLink="/donor-promises">
            <mat-card-content>
              <mat-icon class="action-icon">assignment_turned_in</mat-icon>
              <h3>Track Promises</h3>
              <p>Add and monitor donor commitments and fulfillment</p>
            </mat-card-content>
          </mat-card>

          <mat-card 
            class="action-card" 
            routerLink="/admin/how-to"
            *ngIf="currentUser.role === 'admin' || currentUser.role === 'staff'"
          >
            <mat-card-content>
              <mat-icon class="action-icon">help_outline</mat-icon>
              <h3>Setup Guide</h3>
              <p>Complete organization onboarding in 60 minutes</p>
            </mat-card-content>
          </mat-card>
        </div>
      </section>

      <!-- Recent Activity -->
      <section class="activity-section" *ngIf="currentUser && (trips.length > 0 || promises.length > 0)">
        <h2>Recent Activity</h2>
        <div class="activity-grid">
          <!-- Recent Trips -->
          <mat-card class="activity-card" *ngIf="trips.length > 0">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>card_travel</mat-icon>
                Recent Trips
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="activity-items">
                <div 
                  *ngFor="let trip of getRecentTrips(); trackBy: trackByTripId" 
                  class="activity-item"
                  [routerLink]="['/donor-trip', trip.id]"
                >
                  <div class="activity-info">
                    <h4>{{ trip.title }}</h4>
                    <p>{{ trip.destination }} • {{ trip.startDate | date:'mediumDate' }}</p>
                  </div>
                  <div class="activity-status">
                    <mat-chip [color]="getStatusColor(trip.status)" selected>
                      {{ trip.status | titlecase }}
                    </mat-chip>
                  </div>
                </div>
              </div>
              <div class="activity-actions">
                <button mat-button routerLink="/donor-trip">View All Trips</button>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Recent Promises -->
          <mat-card class="activity-card" *ngIf="promises.length > 0">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>assignment_turned_in</mat-icon>
                Recent Promises
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="activity-items">
                <div 
                  *ngFor="let promise of getRecentPromises(); trackBy: trackByPromiseId" 
                  class="activity-item"
                >
                  <div class="activity-info">
                    <h4>{{ promise.title }}</h4>
                    <p>{{ promise.category | titlecase }} 
                       <span *ngIf="promise.amount">• {{ promise.amount | currency:(promise.currency || 'USD') }}</span>
                    </p>
                  </div>
                  <div class="activity-status">
                    <mat-chip [color]="getPromiseStatusColor(promise.status)" selected>
                      {{ promise.status | titlecase }}
                    </mat-chip>
                  </div>
                </div>
              </div>
              <div class="activity-actions">
                <button mat-button routerLink="/donor-promises">View All Promises</button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </section>

      <!-- Organization Info -->
      <section class="info-section" *ngIf="tenantConfig">
        <div class="info-grid">
          <mat-card class="info-card about">
            <mat-card-header>
              <mat-card-title>About {{ tenantConfig.name }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>{{ tenantConfig.textBlocks.aboutUs }}</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="info-card mission">
            <mat-card-header>
              <mat-card-title>Our Mission</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>{{ tenantConfig.textBlocks.missionStatement }}</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="info-card contact">
            <mat-card-header>
              <mat-card-title>Contact Information</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>{{ tenantConfig.textBlocks.contactInfo }}</p>
            </mat-card-content>
          </mat-card>
        </div>
      </section>

      <!-- Login Prompt for Non-authenticated Users -->
      <section class="login-prompt" *ngIf="!currentUser">
        <mat-card class="login-card">
          <mat-card-content>
            <div class="login-content">
              <mat-icon class="login-icon">account_circle</mat-icon>
              <h2>Welcome to {{ tenantConfig?.name || 'Donor Portal' }}</h2>
              <p>Please log in to access your donor management dashboard</p>
              <button mat-raised-button color="primary" routerLink="/login" class="login-button">
                <mat-icon>login</mat-icon>
                Sign In
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-section {
      margin-bottom: 40px;
    }

    .welcome-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 40px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: var(--border-radius);
      box-shadow: var(--card-shadow);
      position: relative;
      overflow: hidden;
    }

    .welcome-content::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      pointer-events: none;
    }

    .welcome-text {
      position: relative;
      z-index: 1;
    }

    .welcome-text h1 {
      margin: 0 0 16px 0;
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #ffffff, #f0f0f0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .welcome-text p {
      margin: 0;
      font-size: 1.2rem;
      opacity: 0.95;
      line-height: 1.6;
    }

    .user-role {
      font-size: 1rem;
      opacity: 0.8;
      font-weight: 500;
    }

    .org-logo {
      position: relative;
      z-index: 1;
    }

    .org-logo img {
      height: 80px;
      width: auto;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
      border-radius: 8px;
    }

    .stats-section {
      margin-bottom: 40px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .stat-card {
      transition: var(--transition);
      position: relative;
      overflow: hidden;
      border: none;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      transition: width 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }

    .stat-card:hover::before {
      width: 8px;
    }

    .stat-card.trips::before { background: linear-gradient(135deg, #2196f3, #64b5f6); }
    .stat-card.promises::before { background: linear-gradient(135deg, #4caf50, #81c784); }
    .stat-card.checklist::before { background: linear-gradient(135deg, #ff9800, #ffb74d); }
    .stat-card.pending::before { background: linear-gradient(135deg, #f44336, #ef5350); }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 12px;
    }

    .stat-icon {
      font-size: 2.5rem;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .stat-card.trips .stat-icon { background: linear-gradient(135deg, #2196f3, #64b5f6); }
    .stat-card.promises .stat-icon { background: linear-gradient(135deg, #4caf50, #81c784); }
    .stat-card.checklist .stat-icon { background: linear-gradient(135deg, #ff9800, #ffb74d); }
    .stat-card.pending .stat-icon { background: linear-gradient(135deg, #f44336, #ef5350); }

    .stat-details {
      flex: 1;
    }

    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-label {
      display: block;
      font-size: 0.9rem;
      color: #666;
      margin-top: 4px;
      font-weight: 500;
    }

    .stat-progress {
      padding: 8px 12px;
      background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
      border-radius: 20px;
      font-size: 0.85rem;
      color: #666;
      font-weight: 500;
    }

    .actions-section {
      margin-bottom: 40px;
    }

    .actions-section h2 {
      margin-bottom: 24px;
      font-size: 1.8rem;
      text-align: center;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .action-card {
      cursor: pointer;
      transition: var(--transition);
      text-align: center;
      padding: 24px;
      border: 2px solid transparent;
    }

    .action-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
      border-color: var(--primary-color);
    }

    .action-icon {
      font-size: 3rem;
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      color: white;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      box-shadow: 0 8px 20px rgba(76, 175, 80, 0.3);
    }

    .action-card h3 {
      margin: 0 0 12px 0;
      font-size: 1.3rem;
      font-weight: 600;
    }

    .action-card p {
      margin: 0;
      color: #666;
      line-height: 1.6;
    }
      width: 2rem;
      height: 2rem;
      color: var(--primary-color, #1976d2);
    }

    .stat-details {
      flex: 1;
    }

    .stat-number {
      display: block;
      font-size: 1.75rem;
      font-weight: 500;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .stat-progress {
      text-align: center;
    }

    .progress-text {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .actions-section,
    .activity-section,
    .info-section {
      margin-bottom: 32px;
    }

    .actions-section h2,
    .activity-section h2 {
      margin: 0 0 24px 0;
      color: var(--primary-color, #1976d2);
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }

    .action-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .action-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: var(--accent-color, #ff5722);
      margin-bottom: 16px;
    }

    .action-card h3 {
      margin: 0 0 8px 0;
      color: var(--primary-color, #1976d2);
    }

    .action-card p {
      margin: 0;
      color: rgba(0, 0, 0, 0.6);
      line-height: 1.4;
    }

    .activity-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .activity-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .activity-items {
      margin-bottom: 16px;
    }

    .activity-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .activity-item:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-info h4 {
      margin: 0 0 4px 0;
      font-size: 1rem;
      font-weight: 500;
    }

    .activity-info p {
      margin: 0;
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .activity-actions {
      text-align: center;
      padding-top: 8px;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .info-card {
      height: fit-content;
    }

    .info-card p {
      line-height: 1.6;
      color: rgba(0, 0, 0, 0.7);
    }

    .login-prompt {
      display: flex;
      justify-content: center;
      margin-top: 64px;
    }

    .login-card {
      max-width: 400px;
      width: 100%;
    }

    .login-content {
      text-align: center;
      padding: 32px 24px;
    }

    .login-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: rgba(0, 0, 0, 0.3);
      margin-bottom: 24px;
    }

    .login-content h2 {
      margin: 0 0 16px 0;
      color: var(--primary-color, #1976d2);
    }

    .login-content p {
      margin: 0 0 32px 0;
      color: rgba(0, 0, 0, 0.6);
      line-height: 1.5;
    }

    .login-button {
      padding: 0 32px;
      height: 48px;
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .home-container {
        padding: 16px;
      }

      .welcome-content {
        flex-direction: column;
        text-align: center;
        padding: 24px 16px;
      }

      .welcome-text {
        margin-bottom: 24px;
      }

      .welcome-text h1 {
        font-size: 1.5rem;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .actions-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .activity-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .info-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .activity-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .stat-content {
        justify-content: center;
      }

      .action-icon {
        font-size: 2.5rem;
        width: 2.5rem;
        height: 2.5rem;
      }

      .login-content {
        padding: 24px 16px;
      }

      .login-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
      }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  tenantConfig: TenantConfig | null = null;
  trips: Trip[] = [];
  promises: Promise[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private tenantService: TenantConfigService,
    private authService: AuthService,
    private tripService: TripService,
    private promiseService: PromiseService
  ) {}

  ngOnInit(): void {
    // Subscribe to auth state
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(authState => {
        this.currentUser = authState.user;
      });

    // Subscribe to tenant config
    this.tenantService.tenantConfig$
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => {
        this.tenantConfig = config;
      });

    // Subscribe to trips and promises if user is logged in
    combineLatest([
      this.tripService.getTrips(),
      this.promiseService.getPromises()
    ]).pipe(takeUntil(this.destroy$))
    .subscribe(([trips, promises]) => {
      this.trips = trips;
      this.promises = promises;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onLogoError(event: any): void {
    event.target.style.display = 'none';
  }

  getActiveTrips(): number {
    return this.trips.filter(trip => trip.status === 'active').length;
  }

  getFulfilledPromises(): number {
    return this.promises.filter(promise => promise.status === 'fulfilled').length;
  }

  getPendingPromises(): number {
    return this.promises.filter(promise => promise.status === 'pending').length;
  }

  getTotalChecklistItems(): number {
    return this.trips.reduce((total, trip) => total + trip.checklist.length, 0);
  }

  getCompletedChecklistItems(): number {
    return this.trips.reduce((total, trip) => 
      total + trip.checklist.filter(item => item.isCompleted).length, 0
    );
  }

  getRecentTrips(): Trip[] {
    return this.trips
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);
  }

  getRecentPromises(): Promise[] {
    return this.promises
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);
  }

  getStatusColor(status: Trip['status']): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'completed': return 'primary';
      case 'active': return 'accent';
      default: return 'warn';
    }
  }

  getPromiseStatusColor(status: Promise['status']): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'fulfilled': return 'primary';
      case 'in-progress': return 'accent';
      default: return 'warn';
    }
  }

  trackByTripId(index: number, trip: Trip): string {
    return trip.id;
  }

  trackByPromiseId(index: number, promise: Promise): string {
    return promise.id;
  }
}
