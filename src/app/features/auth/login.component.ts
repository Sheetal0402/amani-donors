import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSelectModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Login to Donor Portal</mat-card-title>
          <mat-card-subtitle>Access your donor management dashboard</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input 
                matInput 
                type="email" 
                formControlName="email"
                [attr.aria-label]="'Email address'"
                autocomplete="email"
              >
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Please enter a valid email address
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input 
                matInput 
                [type]="hidePassword ? 'password' : 'text'" 
                formControlName="password"
                [attr.aria-label]="'Password'"
                autocomplete="current-password"
              >
              <button 
                mat-icon-button 
                matSuffix 
                type="button"
                (click)="hidePassword = !hidePassword"
                [attr.aria-label]="hidePassword ? 'Show password' : 'Hide password'"
              >
                <mat-icon>{{hidePassword ? 'visibility' : 'visibility_off'}}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
            </mat-form-field>

            <button 
              mat-raised-button 
              color="primary" 
              type="submit" 
              class="full-width login-button"
              [disabled]="loginForm.invalid || isLoading"
              [attr.aria-label]="'Sign in to your account'"
            >
              <mat-icon *ngIf="isLoading">hourglass_empty</mat-icon>
              {{ isLoading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <div class="demo-users">
            <h4>Demo Users (password: password123)</h4>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Quick Login</mat-label>
              <mat-select (selectionChange)="quickLogin($event.value)" [attr.aria-label]="'Select demo user'">
                <mat-option *ngFor="let user of demoUsers" [value]="user">
                  {{ user.email }} ({{ user.role | titlecase }} - {{ user.tenantKey }})
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 64px);
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .login-button {
      margin-top: 16px;
      height: 48px;
      font-size: 16px;
    }

    .demo-users {
      width: 100%;
      margin-top: 16px;
    }

    .demo-users h4 {
      margin: 0 0 12px 0;
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
      font-weight: 500;
    }

    mat-card-header {
      text-align: center;
      margin-bottom: 24px;
    }

    mat-card-title {
      font-size: 24px;
      font-weight: 500;
    }

    mat-card-subtitle {
      margin-top: 8px;
      color: rgba(0, 0, 0, 0.6);
    }

    @media (max-width: 480px) {
      .login-container {
        padding: 12px;
      }

      mat-card-title {
        font-size: 20px;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  demoUsers: User[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Check if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }

    this.demoUsers = this.authService.getMockUsers();
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password } = this.loginForm.value;

      try {
        this.authService.login(email, password).subscribe({
          next: (authState) => {
            this.isLoading = false;
            this.snackBar.open(`Welcome back, ${authState.user?.firstName}!`, 'Close', {
              duration: 3000
            });
            this.router.navigate(['/']);
          },
          error: (error) => {
            this.isLoading = false;
            this.snackBar.open('Invalid email or password', 'Close', {
              duration: 5000
            });
          }
        });
      } catch (error) {
        this.isLoading = false;
        this.snackBar.open('Invalid email or password', 'Close', {
          duration: 5000
        });
      }
    }
  }

  quickLogin(user: User): void {
    this.loginForm.patchValue({
      email: user.email,
      password: 'password123'
    });
    this.onSubmit();
  }
}
