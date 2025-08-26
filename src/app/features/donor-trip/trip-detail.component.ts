import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { Trip, ChecklistItem } from '../../core/models/trip.model';
import { TripService } from '../../core/services/trip.service';

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule,
    MatStepperModule
  ],
  template: `
    <div class="trip-detail-container" *ngIf="trip">
      <!-- Header -->
      <header class="trip-header">
        <button mat-icon-button (click)="goBack()" [attr.aria-label]="'Go back to trips list'">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="trip-info">
          <h1>{{ trip.title }}</h1>
          <div class="trip-meta">
            <span class="destination">
              <mat-icon>place</mat-icon>
              {{ trip.destination }}
            </span>
            <span class="dates">
              <mat-icon>date_range</mat-icon>
              {{ trip.startDate | date:'mediumDate' }} - {{ trip.endDate | date:'mediumDate' }}
            </span>
            <mat-chip-set>
              <mat-chip [color]="getStatusColor(trip.status)" selected>
                {{ trip.status | titlecase }}
              </mat-chip>
            </mat-chip-set>
          </div>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="exportToPDF()">
            <mat-icon>picture_as_pdf</mat-icon>
            Export PDF
          </button>
        </div>
      </header>

      <!-- Description -->
      <mat-card class="description-card" *ngIf="trip.description">
        <mat-card-content>
          <h3>Description</h3>
          <p>{{ trip.description }}</p>
        </mat-card-content>
      </mat-card>

      <!-- Progress Overview -->
      <mat-card class="progress-card">
        <mat-card-content>
          <h3>Checklist Progress</h3>
          <div class="progress-stats">
            <div class="stat">
              <span class="number">{{ getCompletedCount() }}</span>
              <span class="label">Completed</span>
            </div>
            <div class="stat">
              <span class="number">{{ trip.checklist.length - getCompletedCount() }}</span>
              <span class="label">Remaining</span>
            </div>
            <div class="stat">
              <span class="number">{{ getProgressPercentage() }}%</span>
              <span class="label">Progress</span>
            </div>
          </div>
          <mat-progress-bar 
            mode="determinate" 
            [value]="getProgressPercentage()"
            class="progress-bar"
          ></mat-progress-bar>
        </mat-card-content>
      </mat-card>

      <!-- Checklist by Category -->
      <div class="checklist-section">
        <div class="section-header">
          <h2>Checklist Items</h2>
          <button mat-raised-button color="accent" (click)="showAddItemForm = !showAddItemForm">
            <mat-icon>{{ showAddItemForm ? 'close' : 'add' }}</mat-icon>
            {{ showAddItemForm ? 'Cancel' : 'Add Item' }}
          </button>
        </div>

        <!-- Add Item Form -->
        <mat-card class="add-item-card" *ngIf="showAddItemForm">
          <mat-card-content>
            <h3>Add New Checklist Item</h3>
            <form [formGroup]="addItemForm" (ngSubmit)="addChecklistItem()">
              <div class="form-row">
                <mat-form-field appearance="outline" class="flex-2">
                  <mat-label>Title</mat-label>
                  <input matInput formControlName="title" placeholder="Item title">
                  <mat-error *ngIf="addItemForm.get('title')?.hasError('required')">
                    Title is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>Category</mat-label>
                  <mat-select formControlName="category">
                    <mat-option value="travel">Travel</mat-option>
                    <mat-option value="preparation">Preparation</mat-option>
                    <mat-option value="documentation">Documentation</mat-option>
                    <mat-option value="health">Health</mat-option>
                    <mat-option value="other">Other</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="2"></textarea>
              </mat-form-field>

              <div class="form-row">
                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>Priority</mat-label>
                  <mat-select formControlName="priority">
                    <mat-option value="low">Low</mat-option>
                    <mat-option value="medium">Medium</mat-option>
                    <mat-option value="high">High</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>Due Date (Optional)</mat-label>
                  <input matInput [matDatepicker]="dueDatePicker" formControlName="dueDate">
                  <mat-datepicker-toggle matSuffix [for]="dueDatePicker"></mat-datepicker-toggle>
                  <mat-datepicker #dueDatePicker></mat-datepicker>
                </mat-form-field>
              </div>

              <div class="form-actions">
                <button mat-button type="button" (click)="showAddItemForm = false">Cancel</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="addItemForm.invalid">
                  Add Item
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Checklist Items -->
        <div class="checklist-categories">
          <div *ngFor="let category of getCategories()" class="category-section">
            <h3 class="category-title">{{ category | titlecase }} ({{ getItemsByCategory(category).length }})</h3>
            
            <div class="checklist-items">
              <mat-card 
                *ngFor="let item of getItemsByCategory(category); trackBy: trackByItemId" 
                class="checklist-item"
                [class.completed]="item.isCompleted"
              >
                <mat-card-content>
                  <div class="item-header">
                    <mat-checkbox 
                      [checked]="item.isCompleted"
                      (change)="toggleItem(item)"
                      [attr.aria-label]="'Mark ' + item.title + ' as ' + (item.isCompleted ? 'incomplete' : 'complete')"
                    >
                      {{ item.title }}
                    </mat-checkbox>
                    <mat-chip-set>
                      <mat-chip [color]="getPriorityColor(item.priority)" selected>
                        {{ item.priority | titlecase }}
                      </mat-chip>
                    </mat-chip-set>
                  </div>

                  <p class="item-description" *ngIf="item.description">{{ item.description }}</p>

                  <div class="item-meta" *ngIf="item.dueDate || item.completedAt">
                    <span *ngIf="item.dueDate && !item.isCompleted" class="due-date">
                      <mat-icon>schedule</mat-icon>
                      Due: {{ item.dueDate | date:'mediumDate' }}
                    </span>
                    <span *ngIf="item.completedAt" class="completed-date">
                      <mat-icon>check_circle</mat-icon>
                      Completed: {{ item.completedAt | date:'mediumDate' }}
                    </span>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="loading-state" *ngIf="!trip">
      <p>Loading trip details...</p>
    </div>
  `,
  styles: [`
    .trip-detail-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .trip-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 24px;
    }

    .trip-info {
      flex: 1;
    }

    .trip-info h1 {
      margin: 0 0 12px 0;
      color: var(--primary-color, #1976d2);
    }

    .trip-meta {
      display: flex;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;
    }

    .trip-meta span {
      display: flex;
      align-items: center;
      gap: 4px;
      color: rgba(0, 0, 0, 0.6);
    }

    .trip-meta mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .description-card,
    .progress-card,
    .add-item-card {
      margin-bottom: 24px;
    }

    .progress-stats {
      display: flex;
      gap: 32px;
      margin-bottom: 16px;
    }

    .stat {
      text-align: center;
    }

    .stat .number {
      display: block;
      font-size: 2rem;
      font-weight: 500;
      color: var(--primary-color, #1976d2);
    }

    .stat .label {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .progress-bar {
      height: 8px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .section-header h2 {
      margin: 0;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }
    .full-width { width: 100%; margin-bottom: 16px; }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
    }

    .category-section {
      margin-bottom: 32px;
    }

    .category-title {
      margin: 0 0 16px 0;
      color: rgba(0, 0, 0, 0.7);
      font-weight: 500;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--accent-color, #ff5722);
    }

    .checklist-items {
      display: grid;
      gap: 12px;
    }

    .checklist-item {
      transition: all 0.2s;
    }

    .checklist-item.completed {
      opacity: 0.7;
      background-color: #f5f5f5;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .item-description {
      margin: 8px 0;
      color: rgba(0, 0, 0, 0.7);
      line-height: 1.4;
    }

    .item-meta {
      display: flex;
      gap: 16px;
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .item-meta span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .item-meta mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .due-date {
      color: #f57c00;
    }

    .completed-date {
      color: #388e3c;
    }

    .loading-state {
      text-align: center;
      padding: 64px;
      color: rgba(0, 0, 0, 0.6);
    }

    @media (max-width: 768px) {
      .trip-detail-container {
        padding: 16px;
      }

      .trip-header {
        flex-direction: column;
        align-items: stretch;
      }

      .trip-meta {
        gap: 16px;
      }

      .header-actions {
        align-self: flex-start;
      }

      .progress-stats {
        gap: 16px;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .section-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }
    }

    @media (max-width: 480px) {
      .trip-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .progress-stats {
        justify-content: space-around;
      }
    }
  `]
})
export class TripDetailComponent implements OnInit, OnDestroy {
  trip: Trip | null = null;
  showAddItemForm = false;
  addItemForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripService: TripService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.addItemForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      category: ['other', Validators.required],
      priority: ['medium', Validators.required],
      dueDate: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params => this.tripService.getTripById(params['id'])),
      takeUntil(this.destroy$)
    ).subscribe(trip => {
      if (trip) {
        this.trip = trip;
      } else {
        this.snackBar.open('Trip not found', 'Close', { duration: 5000 });
        this.router.navigate(['/donor-trip']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    this.router.navigate(['/donor-trip']);
  }

  getStatusColor(status: Trip['status']): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'completed': return 'primary';
      case 'active': return 'accent';
      default: return 'warn';
    }
  }

  getPriorityColor(priority: ChecklistItem['priority']): 'primary' | 'accent' | 'warn' {
    switch (priority) {
      case 'high': return 'warn';
      case 'medium': return 'accent';
      default: return 'primary';
    }
  }

  getCompletedCount(): number {
    return this.trip ? this.trip.checklist.filter(item => item.isCompleted).length : 0;
  }

  getProgressPercentage(): number {
    if (!this.trip || this.trip.checklist.length === 0) return 0;
    return Math.round((this.getCompletedCount() / this.trip.checklist.length) * 100);
  }

  getCategories(): string[] {
    if (!this.trip) return [];
    const categories = [...new Set(this.trip.checklist.map(item => item.category))];
    return categories.sort();
  }

  getItemsByCategory(category: string): ChecklistItem[] {
    if (!this.trip) return [];
    return this.trip.checklist
      .filter(item => item.category === category)
      .sort((a, b) => {
        // Sort by completion status, then by priority
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? 1 : -1;
        }
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }

  trackByItemId(index: number, item: ChecklistItem): string {
    return item.id;
  }

  toggleItem(item: ChecklistItem): void {
    if (!this.trip) return;

    this.tripService.updateChecklistItem(this.trip.id, item.id, {
      isCompleted: !item.isCompleted
    }).subscribe({
      next: (updatedTrip) => {
        this.trip = updatedTrip;
        const message = item.isCompleted ? 'Item marked as incomplete' : 'Item completed!';
        this.snackBar.open(message, 'Close', { duration: 2000 });
      },
      error: (error) => {
        this.snackBar.open('Failed to update item', 'Close', { duration: 5000 });
      }
    });
  }

  addChecklistItem(): void {
    if (!this.trip || this.addItemForm.invalid) return;

    const formValue = this.addItemForm.value;
    const newItem = {
      title: formValue.title,
      description: formValue.description,
      category: formValue.category,
      priority: formValue.priority,
      dueDate: formValue.dueDate || undefined,
      isCompleted: false
    };

    this.tripService.addChecklistItem(this.trip.id, newItem).subscribe({
      next: (updatedTrip) => {
        this.trip = updatedTrip;
        this.addItemForm.reset({
          category: 'other',
          priority: 'medium'
        });
        this.showAddItemForm = false;
        this.snackBar.open('Checklist item added!', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Failed to add item', 'Close', { duration: 5000 });
      }
    });
  }

  exportToPDF(): void {
    if (!this.trip) return;

    this.tripService.exportToPDF(this.trip.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.trip!.title.replace(/\s+/g, '_')}_checklist.txt`;
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
