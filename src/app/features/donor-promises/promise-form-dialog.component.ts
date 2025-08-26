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
import { Promise } from '../../core/models/promise.model';

export interface PromiseFormDialogData {
  promise: Promise | null;
  isEdit: boolean;
}

@Component({
  selector: 'app-promise-form-dialog',
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
    <h2 mat-dialog-title>{{ data.isEdit ? 'Edit Promise' : 'Create New Promise' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="promiseForm" class="promise-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Promise Title</mat-label>
          <input matInput formControlName="title" placeholder="Enter promise title">
          <mat-error *ngIf="promiseForm.get('title')?.hasError('required')">
            Title is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea 
            matInput 
            formControlName="description" 
            rows="3"
            placeholder="Describe your commitment in detail"
          ></textarea>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Category</mat-label>
            <mat-select formControlName="category">
              <mat-option value="financial">Financial</mat-option>
              <mat-option value="volunteer">Volunteer</mat-option>
              <mat-option value="resource">Resource</mat-option>
              <mat-option value="advocacy">Advocacy</mat-option>
              <mat-option value="other">Other</mat-option>
            </mat-select>
            <mat-error *ngIf="promiseForm.get('category')?.hasError('required')">
              Category is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="pending">Pending</mat-option>
              <mat-option value="in-progress">In Progress</mat-option>
              <mat-option value="fulfilled">Fulfilled</mat-option>
              <mat-option value="cancelled">Cancelled</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Financial Details (shown only for financial category) -->
        <div class="financial-section" *ngIf="promiseForm.get('category')?.value === 'financial'">
          <h4>Financial Details</h4>
          <div class="form-row">
            <mat-form-field appearance="outline" class="flex-2">
              <mat-label>Amount</mat-label>
              <input matInput type="number" formControlName="amount" placeholder="0.00">
            </mat-form-field>

            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Currency</mat-label>
              <mat-select formControlName="currency">
                <mat-option value="USD">USD</mat-option>
                <mat-option value="EUR">EUR</mat-option>
                <mat-option value="GBP">GBP</mat-option>
                <mat-option value="KES">KES</mat-option>
                <mat-option value="TZS">TZS</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Due Date (Optional)</mat-label>
          <input matInput [matDatepicker]="dueDatePicker" formControlName="dueDate">
          <mat-datepicker-toggle matSuffix [for]="dueDatePicker"></mat-datepicker-toggle>
          <mat-datepicker #dueDatePicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Notes (Optional)</mat-label>
          <textarea 
            matInput 
            formControlName="notes" 
            rows="2"
            placeholder="Additional notes or updates"
          ></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button 
        mat-raised-button 
        color="primary" 
        (click)="onSave()"
        [disabled]="promiseForm.invalid"
      >
        {{ data.isEdit ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .promise-form {
      min-width: 400px;
      max-width: 500px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }

    .financial-section {
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 4px;
      padding: 16px;
      margin-bottom: 16px;
      background-color: #f9f9f9;
    }

    .financial-section h4 {
      margin: 0 0 16px 0;
      color: rgba(0, 0, 0, 0.7);
      font-weight: 500;
    }

    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    mat-dialog-actions {
      margin-top: 16px;
    }

    @media (max-width: 480px) {
      .promise-form {
        min-width: auto;
        max-width: none;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .flex-1,
      .flex-2 {
        margin-bottom: 16px;
      }
    }
  `]
})
export class PromiseFormDialogComponent implements OnInit {
  promiseForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PromiseFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PromiseFormDialogData
  ) {
    this.promiseForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      category: ['other', Validators.required],
      status: ['pending', Validators.required],
      amount: [''],
      currency: ['USD'],
      dueDate: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    if (this.data.promise) {
      this.promiseForm.patchValue({
        title: this.data.promise.title,
        description: this.data.promise.description,
        category: this.data.promise.category,
        status: this.data.promise.status,
        amount: this.data.promise.amount || '',
        currency: this.data.promise.currency || 'USD',
        dueDate: this.data.promise.dueDate || '',
        notes: this.data.promise.notes || ''
      });
    }

    // Watch category changes to show/hide financial fields
    this.promiseForm.get('category')?.valueChanges.subscribe(category => {
      const amountControl = this.promiseForm.get('amount');
      const currencyControl = this.promiseForm.get('currency');
      
      if (category === 'financial') {
        // Make amount required for financial promises
        amountControl?.setValidators([Validators.required, Validators.min(0.01)]);
        currencyControl?.setValidators([Validators.required]);
      } else {
        // Remove validators for non-financial promises
        amountControl?.clearValidators();
        currencyControl?.clearValidators();
      }
      
      amountControl?.updateValueAndValidity();
      currencyControl?.updateValueAndValidity();
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.promiseForm.valid) {
      const formValue = this.promiseForm.value;
      
      const promiseData = {
        title: formValue.title,
        description: formValue.description,
        category: formValue.category,
        status: formValue.status,
        amount: formValue.category === 'financial' ? parseFloat(formValue.amount) || undefined : undefined,
        currency: formValue.category === 'financial' ? formValue.currency : undefined,
        dueDate: formValue.dueDate || undefined,
        notes: formValue.notes || undefined,
        createdBy: 'current-user' // In real app, get from auth service
      };

      this.dialogRef.close(promiseData);
    }
  }
}
