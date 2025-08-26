import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Trip } from '../../core/models/trip.model';

export interface TripFormDialogData {
  trip: Trip | null;
  isEdit: boolean;
}

@Component({
  selector: 'app-trip-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.isEdit ? 'Edit Trip' : 'Create New Trip' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="tripForm" class="trip-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Trip Title</mat-label>
          <input matInput formControlName="title" placeholder="Enter trip title">
          <mat-error *ngIf="tripForm.get('title')?.hasError('required')">
            Title is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Destination</mat-label>
          <input matInput formControlName="destination" placeholder="Enter destination">
          <mat-error *ngIf="tripForm.get('destination')?.hasError('required')">
            Destination is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea 
            matInput 
            formControlName="description" 
            rows="3"
            placeholder="Describe the purpose and goals of this trip"
          ></textarea>
        </mat-form-field>

        <div class="date-row">
          <mat-form-field appearance="outline" class="date-field">
            <mat-label>Start Date</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="startDate">
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
            <mat-error *ngIf="tripForm.get('startDate')?.hasError('required')">
              Start date is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="date-field">
            <mat-label>End Date</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="endDate">
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
            <mat-error *ngIf="tripForm.get('endDate')?.hasError('required')">
              End date is required
            </mat-error>
            <mat-error *ngIf="tripForm.hasError('dateRange')">
              End date must be after start date
            </mat-error>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="planning">Planning</mat-option>
            <mat-option value="active">Active</mat-option>
            <mat-option value="completed">Completed</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button 
        mat-raised-button 
        color="primary" 
        (click)="onSave()"
        [disabled]="tripForm.invalid"
      >
        {{ data.isEdit ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .trip-form {
      min-width: 400px;
      max-width: 500px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .date-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .date-field {
      flex: 1;
    }

    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    mat-dialog-actions {
      margin-top: 16px;
    }

    @media (max-width: 480px) {
      .trip-form {
        min-width: auto;
        max-width: none;
      }

      .date-row {
        flex-direction: column;
        gap: 0;
      }

      .date-field {
        margin-bottom: 16px;
      }
    }
  `]
})
export class TripFormDialogComponent implements OnInit {
  tripForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TripFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TripFormDialogData
  ) {
    this.tripForm = this.fb.group({
      title: ['', Validators.required],
      destination: ['', Validators.required],
      description: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      status: ['planning', Validators.required]
    }, { validators: this.dateRangeValidator });
  }

  ngOnInit(): void {
    if (this.data.trip) {
      this.tripForm.patchValue({
        title: this.data.trip.title,
        destination: this.data.trip.destination,
        description: this.data.trip.description,
        startDate: this.data.trip.startDate,
        endDate: this.data.trip.endDate,
        status: this.data.trip.status
      });
    }
  }

  dateRangeValidator(form: FormGroup) {
    const startDate = form.get('startDate')?.value;
    const endDate = form.get('endDate')?.value;
    
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      return { dateRange: true };
    }
    
    return null;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.tripForm.valid) {
      const formValue = this.tripForm.value;
      
      const tripData = {
        title: formValue.title,
        destination: formValue.destination,
        description: formValue.description,
        startDate: formValue.startDate,
        endDate: formValue.endDate,
        status: formValue.status,
        checklist: this.data.trip?.checklist || [],
        createdBy: 'current-user' // In real app, get from auth service
      };

      this.dialogRef.close(tripData);
    }
  }
}
