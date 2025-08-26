import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { Trip } from '../../core/models/trip.model';
import { TripService } from '../../core/services/trip.service';
import { TripFormDialogComponent } from './trip-form-dialog.component';

@Component({
  selector: 'app-donor-trip',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="donor-trip-container">
      <header class="page-header">
        <h1>Donor Trip Planner</h1>
        <p>Plan your trips, manage checklists, and track your progress</p>
      </header>

      <div class="trips-grid" *ngIf="trips.length > 0; else noTrips">
        <mat-card *ngFor="let trip of trips; trackBy: trackByTripId" class="trip-card">
          <mat-card-header>
            <mat-card-title>{{ trip.title }}</mat-card-title>
            <mat-card-subtitle>{{ trip.destination }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="trip-dates">
              <mat-icon>date_range</mat-icon>
              <span>{{ trip.startDate | date:'mediumDate' }} - {{ trip.endDate | date:'mediumDate' }}</span>
            </div>

            <div class="trip-description">
              {{ trip.description }}
            </div>

            <div class="trip-status">
              <mat-chip-set>
                <mat-chip [color]="getStatusColor(trip.status)" selected>
                  {{ trip.status | titlecase }}
                </mat-chip>
              </mat-chip-set>
            </div>

            <div class="checklist-progress">
              <div class="progress-header">
                <span>Checklist Progress</span>
                <span>{{ getCompletedCount(trip) }}/{{ trip.checklist.length }}</span>
              </div>
              <mat-progress-bar 
                mode="determinate" 
                [value]="getProgressPercentage(trip)"
                [attr.aria-label]="'Checklist progress: ' + getProgressPercentage(trip) + ' percent complete'"
              ></mat-progress-bar>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button 
              mat-button 
              [routerLink]="['/donor-trip', trip.id]"
              [attr.aria-label]="'View details for ' + trip.title"
            >
              <mat-icon>visibility</mat-icon>
              View Details
            </button>
            <button 
              mat-button 
              (click)="editTrip(trip)"
              [attr.aria-label]="'Edit ' + trip.title"
            >
              <mat-icon>edit</mat-icon>
              Edit
            </button>
            <button 
              mat-button 
              (click)="exportTripPDF(trip)"
              [attr.aria-label]="'Export ' + trip.title + ' to PDF'"
            >
              <mat-icon>picture_as_pdf</mat-icon>
              Export PDF
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <ng-template #noTrips>
        <div class="empty-state">
          <mat-icon class="empty-icon">card_travel</mat-icon>
          <h2>No trips planned yet</h2>
          <p>Create your first trip to start planning your donor journey</p>
          <button 
            mat-raised-button 
            color="primary" 
            (click)="createTrip()"
            [attr.aria-label]="'Create your first trip'"
          >
            <mat-icon>add</mat-icon>
            Create First Trip
          </button>
        </div>
      </ng-template>

      <!-- Add Trip Button -->
      <button 
        mat-raised-button 
        color="primary" 
        class="fab-add"
        (click)="createTrip()"
        *ngIf="trips.length > 0"
        [attr.aria-label]="'Add new trip'"
      >
        <mat-icon>add</mat-icon>
        Add Trip
      </button>
    </div>
  `,
  styles: [`
    .donor-trip-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
      min-height: calc(100vh - 120px);
    }

    .page-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .page-header h1 {
      margin: 0 0 8px 0;
      color: var(--primary-color, #1976d2);
    }

    .page-header p {
      color: rgba(0, 0, 0, 0.6);
      margin: 0;
    }

    .trips-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
    }

    .trip-card {
      height: fit-content;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .trip-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .trip-dates {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      color: rgba(0, 0, 0, 0.6);
    }

    .trip-dates mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .trip-description {
      margin-bottom: 16px;
      line-height: 1.5;
    }

    .trip-status {
      margin-bottom: 16px;
    }

    .checklist-progress {
      margin-bottom: 8px;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .progress-header span:first-child {
      font-weight: 500;
    }

    .progress-header span:last-child {
      color: rgba(0, 0, 0, 0.6);
    }

    mat-card-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    mat-card-actions button {
      flex: 1;
      min-width: 120px;
    }

    .empty-state {
      text-align: center;
      padding: 64px 24px;
      max-width: 400px;
      margin: 0 auto;
    }

    .empty-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: rgba(0, 0, 0, 0.3);
      margin-bottom: 24px;
    }

    .empty-state h2 {
      margin: 0 0 12px 0;
      color: rgba(0, 0, 0, 0.7);
    }

    .empty-state p {
      color: rgba(0, 0, 0, 0.5);
      margin-bottom: 32px;
      line-height: 1.5;
    }

    .fab-add {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1000;
    }

    @media (max-width: 768px) {
      .donor-trip-container {
        padding: 16px;
      }

      .trips-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      mat-card-actions {
        flex-direction: column;
      }

      mat-card-actions button {
        width: 100%;
      }

      .page-header h1 {
        font-size: 1.75rem;
      }
    }

    @media (max-width: 480px) {
      .fab-add {
        bottom: 16px;
        right: 16px;
      }

      .empty-state {
        padding: 32px 16px;
      }
    }
  `]
})
export class DonorTripComponent implements OnInit, OnDestroy {
  trips: Trip[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private tripService: TripService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.tripService.getTrips()
      .pipe(takeUntil(this.destroy$))
      .subscribe(trips => {
        this.trips = trips;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByTripId(index: number, trip: Trip): string {
    return trip.id;
  }

  getStatusColor(status: Trip['status']): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'completed': return 'primary';
      case 'active': return 'accent';
      default: return 'warn';
    }
  }

  getCompletedCount(trip: Trip): number {
    return trip.checklist.filter(item => item.isCompleted).length;
  }

  getProgressPercentage(trip: Trip): number {
    if (trip.checklist.length === 0) return 0;
    return (this.getCompletedCount(trip) / trip.checklist.length) * 100;
  }

  createTrip(): void {
    const dialogRef = this.dialog.open(TripFormDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { trip: null, isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tripService.createTrip(result).subscribe({
          next: (trip) => {
            this.snackBar.open('Trip created successfully!', 'Close', { duration: 3000 });
          },
          error: (error) => {
            this.snackBar.open('Failed to create trip', 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  editTrip(trip: Trip): void {
    const dialogRef = this.dialog.open(TripFormDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { trip: trip, isEdit: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tripService.updateTrip(trip.id, result).subscribe({
          next: (updatedTrip) => {
            this.snackBar.open('Trip updated successfully!', 'Close', { duration: 3000 });
          },
          error: (error) => {
            this.snackBar.open('Failed to update trip', 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  exportTripPDF(trip: Trip): void {
    this.tripService.exportToPDF(trip.id).subscribe({
      next: (blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${trip.title.replace(/\s+/g, '_')}_checklist.txt`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('Trip exported successfully!', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Failed to export trip', 'Close', { duration: 5000 });
      }
    });
  }
}
