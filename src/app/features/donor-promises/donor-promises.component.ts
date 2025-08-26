import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { Subject, takeUntil } from 'rxjs';
import { Promise } from '../../core/models/promise.model';
import { PromiseService } from '../../core/services/promise.service';
import { PromiseFormDialogComponent } from './promise-form-dialog.component';

@Component({
  selector: 'app-donor-promises',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule
  ],
  template: `
    <div class="donor-promises-container">
      <header class="page-header">
        <h1>Donor Promises</h1>
        <p>Track your commitments and mark them as fulfilled</p>
        <div class="header-actions">
          <button mat-raised-button color="accent" (click)="exportToCSV()">
            <mat-icon>file_download</mat-icon>
            Export CSV
          </button>
          <button mat-raised-button color="primary" (click)="createPromise()">
            <mat-icon>add</mat-icon>
            New Promise
          </button>
        </div>
      </header>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon pending">hourglass_empty</mat-icon>
              <div class="stat-details">
                <span class="stat-number">{{ getPromisesByStatus('pending').length }}</span>
                <span class="stat-label">Pending</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon in-progress">schedule</mat-icon>
              <div class="stat-details">
                <span class="stat-number">{{ getPromisesByStatus('in-progress').length }}</span>
                <span class="stat-label">In Progress</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon fulfilled">check_circle</mat-icon>
              <div class="stat-details">
                <span class="stat-number">{{ getPromisesByStatus('fulfilled').length }}</span>
                <span class="stat-label">Fulfilled</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon total">assignment</mat-icon>
              <div class="stat-details">
                <span class="stat-number">{{ promises.length }}</span>
                <span class="stat-label">Total</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Promises by Status -->
      <mat-tab-group class="promises-tabs" *ngIf="promises.length > 0; else noPromises">
        <mat-tab label="All Promises">
          <div class="promises-list">
            <mat-card 
              *ngFor="let promise of promises; trackBy: trackByPromiseId" 
              class="promise-card"
              [class]="'status-' + promise.status"
            >
              <mat-card-header>
                <mat-card-title>{{ promise.title }}</mat-card-title>
                <mat-card-subtitle>
                  <mat-chip-set>
                    <mat-chip [color]="getCategoryColor(promise.category)" selected>
                      {{ promise.category | titlecase }}
                    </mat-chip>
                    <mat-chip [color]="getStatusColor(promise.status)" selected>
                      {{ promise.status | titlecase }}
                    </mat-chip>
                  </mat-chip-set>
                </mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <p class="promise-description">{{ promise.description }}</p>

                <div class="promise-details" *ngIf="promise.amount || promise.dueDate || promise.fulfilledAt">
                  <div class="detail-item" *ngIf="promise.amount">
                    <mat-icon>attach_money</mat-icon>
                    <span>{{ promise.amount | currency:(promise.currency || 'USD') }}</span>
                  </div>
                  <div class="detail-item" *ngIf="promise.dueDate && promise.status !== 'fulfilled'">
                    <mat-icon>schedule</mat-icon>
                    <span>Due: {{ promise.dueDate | date:'mediumDate' }}</span>
                  </div>
                  <div class="detail-item" *ngIf="promise.fulfilledAt">
                    <mat-icon>check_circle</mat-icon>
                    <span>Fulfilled: {{ promise.fulfilledAt | date:'mediumDate' }}</span>
                  </div>
                </div>

                <div class="promise-notes" *ngIf="promise.notes">
                  <strong>Notes:</strong> {{ promise.notes }}
                </div>
              </mat-card-content>

              <mat-card-actions>
                <button mat-button (click)="editPromise(promise)">
                  <mat-icon>edit</mat-icon>
                  Edit
                </button>
                <button 
                  mat-button 
                  *ngIf="promise.status !== 'fulfilled'" 
                  (click)="markAsFulfilled(promise)"
                >
                  <mat-icon>check</mat-icon>
                  Mark Fulfilled
                </button>
                <button mat-icon-button [matMenuTriggerFor]="promiseMenu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #promiseMenu="matMenu">
                  <button mat-menu-item (click)="duplicatePromise(promise)">
                    <mat-icon>content_copy</mat-icon>
                    <span>Duplicate</span>
                  </button>
                  <button mat-menu-item (click)="deletePromise(promise)" class="delete-action">
                    <mat-icon>delete</mat-icon>
                    <span>Delete</span>
                  </button>
                </mat-menu>
              </mat-card-actions>
            </mat-card>
          </div>
        </mat-tab>

        <mat-tab label="Pending">
          <div class="promises-list">
            <mat-card 
              *ngFor="let promise of getPromisesByStatus('pending'); trackBy: trackByPromiseId" 
              class="promise-card status-pending"
            >
              <!-- Same card content as above -->
              <mat-card-header>
                <mat-card-title>{{ promise.title }}</mat-card-title>
                <mat-card-subtitle>
                  <mat-chip-set>
                    <mat-chip [color]="getCategoryColor(promise.category)" selected>
                      {{ promise.category | titlecase }}
                    </mat-chip>
                  </mat-chip-set>
                </mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <p class="promise-description">{{ promise.description }}</p>
                <div class="promise-details" *ngIf="promise.amount || promise.dueDate">
                  <div class="detail-item" *ngIf="promise.amount">
                    <mat-icon>attach_money</mat-icon>
                    <span>{{ promise.amount | currency:(promise.currency || 'USD') }}</span>
                  </div>
                  <div class="detail-item" *ngIf="promise.dueDate">
                    <mat-icon>schedule</mat-icon>
                    <span>Due: {{ promise.dueDate | date:'mediumDate' }}</span>
                  </div>
                </div>
                <div class="promise-notes" *ngIf="promise.notes">
                  <strong>Notes:</strong> {{ promise.notes }}
                </div>
              </mat-card-content>

              <mat-card-actions>
                <button mat-button (click)="editPromise(promise)">
                  <mat-icon>edit</mat-icon>
                  Edit
                </button>
                <button mat-raised-button color="primary" (click)="markAsFulfilled(promise)">
                  <mat-icon>check</mat-icon>
                  Mark Fulfilled
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </mat-tab>

        <mat-tab label="In Progress">
          <div class="promises-list">
            <mat-card 
              *ngFor="let promise of getPromisesByStatus('in-progress'); trackBy: trackByPromiseId" 
              class="promise-card status-in-progress"
            >
              <mat-card-header>
                <mat-card-title>{{ promise.title }}</mat-card-title>
                <mat-card-subtitle>
                  <mat-chip-set>
                    <mat-chip [color]="getCategoryColor(promise.category)" selected>
                      {{ promise.category | titlecase }}
                    </mat-chip>
                  </mat-chip-set>
                </mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <p class="promise-description">{{ promise.description }}</p>
                <div class="promise-details" *ngIf="promise.amount || promise.dueDate">
                  <div class="detail-item" *ngIf="promise.amount">
                    <mat-icon>attach_money</mat-icon>
                    <span>{{ promise.amount | currency:(promise.currency || 'USD') }}</span>
                  </div>
                  <div class="detail-item" *ngIf="promise.dueDate">
                    <mat-icon>schedule</mat-icon>
                    <span>Due: {{ promise.dueDate | date:'mediumDate' }}</span>
                  </div>
                </div>
                <div class="promise-notes" *ngIf="promise.notes">
                  <strong>Notes:</strong> {{ promise.notes }}
                </div>
              </mat-card-content>

              <mat-card-actions>
                <button mat-button (click)="editPromise(promise)">
                  <mat-icon>edit</mat-icon>
                  Edit
                </button>
                <button mat-raised-button color="primary" (click)="markAsFulfilled(promise)">
                  <mat-icon>check</mat-icon>
                  Mark Fulfilled
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </mat-tab>

        <mat-tab label="Fulfilled">
          <div class="promises-list">
            <mat-card 
              *ngFor="let promise of getPromisesByStatus('fulfilled'); trackBy: trackByPromiseId" 
              class="promise-card status-fulfilled"
            >
              <mat-card-header>
                <mat-card-title>{{ promise.title }}</mat-card-title>
                <mat-card-subtitle>
                  <mat-chip-set>
                    <mat-chip [color]="getCategoryColor(promise.category)" selected>
                      {{ promise.category | titlecase }}
                    </mat-chip>
                    <mat-chip color="primary" selected>
                      Fulfilled
                    </mat-chip>
                  </mat-chip-set>
                </mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <p class="promise-description">{{ promise.description }}</p>
                <div class="promise-details">
                  <div class="detail-item" *ngIf="promise.amount">
                    <mat-icon>attach_money</mat-icon>
                    <span>{{ promise.amount | currency:(promise.currency || 'USD') }}</span>
                  </div>
                  <div class="detail-item" *ngIf="promise.fulfilledAt">
                    <mat-icon>check_circle</mat-icon>
                    <span>Fulfilled: {{ promise.fulfilledAt | date:'mediumDate' }}</span>
                  </div>
                </div>
                <div class="promise-notes" *ngIf="promise.notes">
                  <strong>Notes:</strong> {{ promise.notes }}
                </div>
              </mat-card-content>

              <mat-card-actions>
                <button mat-button (click)="editPromise(promise)">
                  <mat-icon>edit</mat-icon>
                  Edit
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>

      <ng-template #noPromises>
        <div class="empty-state">
          <mat-icon class="empty-icon">assignment_turned_in</mat-icon>
          <h2>No promises yet</h2>
          <p>Create your first promise to start tracking your commitments</p>
          <button mat-raised-button color="primary" (click)="createPromise()">
            <mat-icon>add</mat-icon>
            Create First Promise
          </button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .donor-promises-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
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
      margin: 0 0 24px 0;
    }

    .header-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      text-align: center;
    }

    .stat-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }

    .stat-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
    }

    .stat-icon.pending { color: #ff9800; }
    .stat-icon.in-progress { color: #2196f3; }
    .stat-icon.fulfilled { color: #4caf50; }
    .stat-icon.total { color: #9c27b0; }

    .stat-details {
      text-align: left;
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

    .promises-tabs {
      margin-bottom: 24px;
    }

    .promises-list {
      display: grid;
      gap: 16px;
      margin-top: 24px;
    }

    .promise-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .promise-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .promise-card.status-pending {
      border-left: 4px solid #ff9800;
    }

    .promise-card.status-in-progress {
      border-left: 4px solid #2196f3;
    }

    .promise-card.status-fulfilled {
      border-left: 4px solid #4caf50;
      opacity: 0.9;
    }

    .promise-description {
      margin-bottom: 16px;
      line-height: 1.5;
    }

    .promise-details {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 12px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.7);
    }

    .detail-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .promise-notes {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.7);
      background-color: #f5f5f5;
      padding: 8px 12px;
      border-radius: 4px;
      margin-top: 12px;
    }

    mat-card-actions {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 8px;
    }

    .delete-action {
      color: #f44336;
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

    @media (max-width: 768px) {
      .donor-promises-container {
        padding: 16px;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .stat-content {
        flex-direction: column;
        gap: 8px;
      }

      .stat-details {
        text-align: center;
      }

      .header-actions {
        flex-direction: column;
        align-items: center;
      }

      .promises-list {
        gap: 12px;
      }

      .promise-details {
        flex-direction: column;
        gap: 8px;
      }
    }

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .stat-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
      }

      .stat-number {
        font-size: 1.5rem;
      }
    }
  `]
})
export class DonorPromisesComponent implements OnInit, OnDestroy {
  promises: Promise[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private promiseService: PromiseService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.promiseService.getPromises()
      .pipe(takeUntil(this.destroy$))
      .subscribe(promises => {
        this.promises = promises;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByPromiseId(index: number, promise: Promise): string {
    return promise.id;
  }

  getPromisesByStatus(status: Promise['status']): Promise[] {
    return this.promises.filter(promise => promise.status === status);
  }

  getCategoryColor(category: Promise['category']): 'primary' | 'accent' | 'warn' {
    switch (category) {
      case 'financial': return 'primary';
      case 'volunteer': return 'accent';
      case 'resource': return 'warn';
      default: return 'primary';
    }
  }

  getStatusColor(status: Promise['status']): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'fulfilled': return 'primary';
      case 'in-progress': return 'accent';
      default: return 'warn';
    }
  }

  createPromise(): void {
    const dialogRef = this.dialog.open(PromiseFormDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { promise: null, isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.promiseService.createPromise(result).subscribe({
          next: () => {
            this.snackBar.open('Promise created successfully!', 'Close', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Failed to create promise', 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  editPromise(promise: Promise): void {
    const dialogRef = this.dialog.open(PromiseFormDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { promise: promise, isEdit: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.promiseService.updatePromise(promise.id, result).subscribe({
          next: () => {
            this.snackBar.open('Promise updated successfully!', 'Close', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Failed to update promise', 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  markAsFulfilled(promise: Promise): void {
    this.promiseService.markAsFulfilled(promise.id, 'Marked as fulfilled by user').subscribe({
      next: () => {
        this.snackBar.open('Promise marked as fulfilled!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to update promise', 'Close', { duration: 5000 });
      }
    });
  }

  duplicatePromise(promise: Promise): void {
    const duplicatedPromise = {
      title: `${promise.title} (Copy)`,
      description: promise.description,
      amount: promise.amount,
      currency: promise.currency,
      category: promise.category,
      status: 'pending' as const,
      dueDate: promise.dueDate,
      createdBy: promise.createdBy,
      notes: promise.notes
    };

    this.promiseService.createPromise(duplicatedPromise).subscribe({
      next: () => {
        this.snackBar.open('Promise duplicated successfully!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to duplicate promise', 'Close', { duration: 5000 });
      }
    });
  }

  deletePromise(promise: Promise): void {
    if (confirm(`Are you sure you want to delete "${promise.title}"?`)) {
      this.promiseService.deletePromise(promise.id).subscribe({
        next: () => {
          this.snackBar.open('Promise deleted successfully!', 'Close', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Failed to delete promise', 'Close', { duration: 5000 });
        }
      });
    }
  }

  exportToCSV(): void {
    this.promiseService.exportToCSV().subscribe({
      next: (csvContent) => {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'donor_promises.csv';
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('Promises exported successfully!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to export promises', 'Close', { duration: 5000 });
      }
    });
  }
}
