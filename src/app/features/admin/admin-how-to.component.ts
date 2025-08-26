import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';

interface OnboardingStep {
  title: string;
  description: string;
  estimatedTime: string;
  tasks: {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    optional?: boolean;
  }[];
}

@Component({
  selector: 'app-admin-how-to',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatChipsModule
  ],
  template: `
    <div class="how-to-container">
      <header class="page-header">
        <h1>NGO Onboarding Guide</h1>
        <p>Complete setup for your organization in ≤ 60 minutes</p>
        <div class="progress-overview">
          <mat-chip-set>
            <mat-chip color="primary" selected>
              {{ getTotalCompletedTasks() }}/{{ getTotalTasks() }} Tasks Complete
            </mat-chip>
            <mat-chip [color]="getTimeColor()" selected>
              Estimated: {{ getTotalEstimatedTime() }}
            </mat-chip>
          </mat-chip-set>
        </div>
      </header>

      <mat-stepper [linear]="false" orientation="vertical" class="onboarding-stepper">
        <mat-step 
          *ngFor="let step of onboardingSteps; let i = index; trackBy: trackByStepTitle"
          [completed]="isStepCompleted(step)"
          [state]="getStepState(step)"
        >
          <ng-template matStepLabel>
            <div class="step-label">
              <span class="step-title">{{ step.title }}</span>
              <span class="step-time">{{ step.estimatedTime }}</span>
            </div>
          </ng-template>

          <div class="step-content">
            <p class="step-description">{{ step.description }}</p>

            <div class="tasks-list">
              <mat-expansion-panel 
                *ngFor="let task of step.tasks; trackBy: trackByTaskId"
                [expanded]="!task.completed"
                class="task-panel"
                [class.completed]="task.completed"
                [class.optional]="task.optional"
              >
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-checkbox 
                      [checked]="task.completed"
                      (change)="toggleTask(task)"
                      (click)="$event.stopPropagation()"
                      [attr.aria-label]="'Mark ' + task.title + ' as ' + (task.completed ? 'incomplete' : 'complete')"
                    >
                      {{ task.title }}
                      <mat-chip *ngIf="task.optional" color="accent" class="optional-chip">
                        Optional
                      </mat-chip>
                    </mat-checkbox>
                  </mat-panel-title>
                </mat-expansion-panel-header>

                <div class="task-content">
                  <p>{{ task.description }}</p>

                  <!-- Specific instructions based on task type -->
                  <div class="task-instructions" [ngSwitch]="task.id">
                    <!-- Logo Upload Instructions -->
                    <div *ngSwitchCase="'upload-logo'" class="instruction-section">
                      <h4>Steps to Upload Logo:</h4>
                      <ol>
                        <li>Prepare a logo file in SVG, PNG, or JPG format</li>
                        <li>Recommended size: 200x60 pixels (or similar aspect ratio)</li>
                        <li>Save the file as <code>logo.svg</code> (or appropriate extension)</li>
                        <li>Place it in <code>/assets/tenants/[your-tenant-key]/</code></li>
                        <li>Update the <code>logoUrl</code> in your tenant config.json file</li>
                      </ol>
                      <div class="code-example">
                        <strong>Example config.json update:</strong>
                        <pre><code>"logoUrl": "/assets/tenants/your-org/logo.svg"</code></pre>
                      </div>
                    </div>

                    <!-- Set Colors Instructions -->
                    <div *ngSwitchCase="'set-colors'" class="instruction-section">
                      <h4>Steps to Set Brand Colors:</h4>
                      <ol>
                        <li>Choose your primary brand color (main navigation, buttons)</li>
                        <li>Choose your accent color (highlights, secondary buttons)</li>
                        <li>Update the colors in your tenant config.json file</li>
                        <li>Test the colors in different components</li>
                      </ol>
                      <div class="code-example">
                        <strong>Example config.json update:</strong>
                        <pre><code>{{ '{' }}
  "primaryColor": "#2E7D32",
  "accentColor": "#FF6F00"
{{ '}' }}</code></pre>
                      </div>
                      <div class="color-tips">
                        <strong>Color Tips:</strong>
                        <ul>
                          <li>Ensure sufficient contrast for accessibility</li>
                          <li>Use hex color codes for consistency</li>
                          <li>Test on both light and dark backgrounds</li>
                        </ul>
                      </div>
                    </div>

                    <!-- Paste Texts Instructions -->
                    <div *ngSwitchCase="'paste-texts'" class="instruction-section">
                      <h4>Steps to Add Organization Text:</h4>
                      <ol>
                        <li>Prepare your organization's key text content</li>
                        <li>Update the textBlocks section in config.json</li>
                        <li>Customize welcome message, about us, mission, and contact info</li>
                        <li>Keep text concise and engaging</li>
                      </ol>
                      <div class="code-example">
                        <strong>Example textBlocks section:</strong>
                        <pre><code>"textBlocks": {{ '{' }}
  "welcomeMessage": "Welcome to [Your Organization]",
  "aboutUs": "Brief description of your organization...",
  "missionStatement": "Your mission statement...",
  "contactInfo": "Contact us at info@yourorg.org"
{{ '}' }}</code></pre>
                      </div>
                    </div>

                    <!-- Create First Trip Instructions -->
                    <div *ngSwitchCase="'create-first-trip'" class="instruction-section">
                      <h4>Steps to Create Your First Trip:</h4>
                      <ol>
                        <li>Navigate to the Donor Trip section</li>
                        <li>Click "Create New Trip"</li>
                        <li>Fill in trip details (title, destination, dates)</li>
                        <li>Add initial checklist items</li>
                        <li>Save and review the trip</li>
                      </ol>
                      <div class="tips">
                        <strong>Trip Creation Tips:</strong>
                        <ul>
                          <li>Start with a real or planned donor visit</li>
                          <li>Include essential items like visas, flights, accommodations</li>
                          <li>Set realistic due dates for checklist items</li>
                          <li>Categorize items for better organization</li>
                        </ul>
                      </div>
                    </div>

                    <!-- Create First Promise Instructions -->
                    <div *ngSwitchCase="'create-first-promise'" class="instruction-section">
                      <h4>Steps to Create Your First Promise:</h4>
                      <ol>
                        <li>Navigate to the Donor Promises section</li>
                        <li>Click "New Promise"</li>
                        <li>Select appropriate category (financial, volunteer, etc.)</li>
                        <li>Fill in promise details</li>
                        <li>Set due dates and track progress</li>
                      </ol>
                      <div class="tips">
                        <strong>Promise Management Tips:</strong>
                        <ul>
                          <li>Start with actual donor commitments</li>
                          <li>Include both financial and non-financial promises</li>
                          <li>Set realistic due dates</li>
                          <li>Add detailed descriptions for clarity</li>
                          <li>Use the export feature for reporting</li>
                        </ul>
                      </div>
                    </div>

                    <!-- Default Instructions -->
                    <div *ngSwitchDefault class="instruction-section">
                      <div class="generic-help">
                        <p>Complete this task according to your organization's specific needs.</p>
                        <p>Refer to the documentation or contact support if you need assistance.</p>
                      </div>
                    </div>
                  </div>

                  <div class="task-actions">
                    <button 
                      mat-raised-button 
                      [color]="task.completed ? 'accent' : 'primary'"
                      (click)="toggleTask(task)"
                    >
                      <mat-icon>{{ task.completed ? 'undo' : 'check' }}</mat-icon>
                      {{ task.completed ? 'Mark Incomplete' : 'Mark Complete' }}
                    </button>
                  </div>
                </div>
              </mat-expansion-panel>
            </div>

            <div class="step-summary">
              <p>
                <strong>Progress:</strong> 
                {{ getStepCompletedTasks(step) }}/{{ step.tasks.length }} tasks completed
                <span *ngIf="isStepCompleted(step)" class="completed-badge">
                  <mat-icon>check_circle</mat-icon>
                  Step Complete!
                </span>
              </p>
            </div>
          </div>
        </mat-step>
      </mat-stepper>

      <!-- Completion Section -->
      <mat-card class="completion-card" *ngIf="isAllCompleted()">
        <mat-card-content>
          <div class="completion-content">
            <mat-icon class="completion-icon">celebration</mat-icon>
            <h2>Congratulations! 🎉</h2>
            <p>
              You've successfully completed the NGO onboarding process. 
              Your organization is now ready to start using the donor management platform.
            </p>
            <div class="next-steps">
              <h3>Next Steps:</h3>
              <ul>
                <li>Invite staff members to join the platform</li>
                <li>Start adding real donor trips and promises</li>
                <li>Explore the reporting and export features</li>
                <li>Customize additional settings as needed</li>
              </ul>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Reset Progress -->
      <div class="reset-section">
        <button mat-button color="warn" (click)="resetProgress()">
          <mat-icon>refresh</mat-icon>
          Reset Progress
        </button>
      </div>
    </div>
  `,
  styles: [`
    .how-to-container {
      padding: 24px;
      max-width: 1000px;
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
      margin: 0 0 16px 0;
      font-size: 1.1rem;
    }

    .progress-overview {
      display: flex;
      justify-content: center;
      gap: 16px;
    }

    .onboarding-stepper {
      margin-bottom: 32px;
    }

    .step-label {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .step-title {
      font-weight: 500;
      font-size: 1rem;
    }

    .step-time {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .step-content {
      margin: 16px 0;
    }

    .step-description {
      font-size: 1rem;
      color: rgba(0, 0, 0, 0.7);
      margin-bottom: 24px;
      line-height: 1.5;
    }

    .tasks-list {
      margin-bottom: 24px;
    }

    .task-panel {
      margin-bottom: 8px;
      border: 1px solid rgba(0, 0, 0, 0.12);
    }

    .task-panel.completed {
      background-color: #f1f8e9;
      border-color: #4caf50;
    }

    .task-panel.optional {
      border-style: dashed;
    }

    .optional-chip {
      margin-left: 8px;
      font-size: 0.75rem;
      height: 20px;
    }

    .task-content {
      padding: 16px 0;
    }

    .instruction-section {
      background-color: #f8f9fa;
      padding: 16px;
      border-radius: 4px;
      margin: 16px 0;
    }

    .instruction-section h4 {
      margin: 0 0 12px 0;
      color: var(--primary-color, #1976d2);
    }

    .instruction-section ol,
    .instruction-section ul {
      margin: 12px 0;
      padding-left: 20px;
    }

    .instruction-section li {
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .code-example {
      background-color: #2d3748;
      color: #e2e8f0;
      padding: 12px;
      border-radius: 4px;
      margin: 12px 0;
      font-family: 'Courier New', monospace;
    }

    .code-example strong {
      color: #a78bfa;
      display: block;
      margin-bottom: 8px;
    }

    .code-example pre {
      margin: 0;
      white-space: pre-wrap;
    }

    .code-example code {
      background: none;
      color: inherit;
      padding: 0;
    }

    .color-tips,
    .tips {
      background-color: #e3f2fd;
      padding: 12px;
      border-radius: 4px;
      margin-top: 12px;
    }

    .color-tips strong,
    .tips strong {
      color: #1976d2;
    }

    .generic-help {
      text-align: center;
      padding: 24px;
      color: rgba(0, 0, 0, 0.6);
    }

    .task-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }

    .step-summary {
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .completed-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #4caf50;
      font-weight: 500;
    }

    .completion-card {
      margin-bottom: 32px;
      background: linear-gradient(135deg, #4caf50, #8bc34a);
      color: white;
    }

    .completion-content {
      text-align: center;
      padding: 24px;
    }

    .completion-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 16px;
    }

    .completion-content h2 {
      margin: 0 0 16px 0;
    }

    .next-steps {
      text-align: left;
      margin-top: 24px;
      background-color: rgba(255, 255, 255, 0.1);
      padding: 16px;
      border-radius: 4px;
    }

    .next-steps h3 {
      margin: 0 0 12px 0;
    }

    .next-steps ul {
      margin: 0;
      padding-left: 20px;
    }

    .next-steps li {
      margin-bottom: 8px;
    }

    .reset-section {
      text-align: center;
      padding: 16px;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
    }

    @media (max-width: 768px) {
      .how-to-container {
        padding: 16px;
      }

      .progress-overview {
        flex-direction: column;
        align-items: center;
      }

      .step-summary {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .code-example {
        font-size: 0.875rem;
        overflow-x: auto;
      }

      .instruction-section {
        padding: 12px;
      }
    }

    @media (max-width: 480px) {
      .completion-content {
        padding: 16px;
      }

      .completion-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
      }

      .next-steps {
        text-align: center;
      }
    }
  `]
})
export class AdminHowToComponent {
  onboardingSteps: OnboardingStep[] = [
    {
      title: 'Setup Organization Branding',
      description: 'Customize your organization\'s visual identity with logo and brand colors.',
      estimatedTime: '15 min',
      tasks: [
        {
          id: 'upload-logo',
          title: 'Upload Organization Logo',
          description: 'Add your organization\'s logo to create a professional appearance.',
          completed: false
        },
        {
          id: 'set-colors',
          title: 'Set Brand Colors',
          description: 'Configure primary and accent colors to match your brand.',
          completed: false
        },
        {
          id: 'test-theme',
          title: 'Test Theme Appearance',
          description: 'Navigate through the app to ensure colors and logo display correctly.',
          completed: false,
          optional: true
        }
      ]
    },
    {
      title: 'Configure Organization Content',
      description: 'Add your organization\'s text content and messaging.',
      estimatedTime: '20 min',
      tasks: [
        {
          id: 'paste-texts',
          title: 'Add Organization Text Content',
          description: 'Update welcome message, about us, mission statement, and contact information.',
          completed: false
        },
        {
          id: 'review-content',
          title: 'Review Content Display',
          description: 'Check that all text content displays properly throughout the application.',
          completed: false
        },
        {
          id: 'setup-contact',
          title: 'Configure Contact Information',
          description: 'Ensure contact details are accurate and up-to-date.',
          completed: false,
          optional: true
        }
      ]
    },
    {
      title: 'Create Sample Data',
      description: 'Set up initial trips and promises to test functionality.',
      estimatedTime: '15 min',
      tasks: [
        {
          id: 'create-first-trip',
          title: 'Create Your First Trip',
          description: 'Add a sample donor trip with checklist items to test the trip planning feature.',
          completed: false
        },
        {
          id: 'test-checklist',
          title: 'Test Checklist Functionality',
          description: 'Mark some checklist items as complete to test the progress tracking.',
          completed: false
        }
      ]
    },
    {
      title: 'Setup Promise Tracking',
      description: 'Configure donor promise management and tracking.',
      estimatedTime: '10 min',
      tasks: [
        {
          id: 'create-first-promise',
          title: 'Create Your First Promise',
          description: 'Add a sample donor promise to test the promise tracking feature.',
          completed: false
        },
        {
          id: 'test-promise-states',
          title: 'Test Promise Status Changes',
          description: 'Practice changing promise status and adding notes.',
          completed: false
        },
        {
          id: 'test-export',
          title: 'Test Export Features',
          description: 'Try exporting promises to CSV and trips to PDF.',
          completed: false,
          optional: true
        }
      ]
    }
  ];

  constructor() {
    // Load saved progress from localStorage
    this.loadProgress();
  }

  trackByStepTitle(index: number, step: OnboardingStep): string {
    return step.title;
  }

  trackByTaskId(index: number, task: { id: string }): string {
    return task.id;
  }

  isStepCompleted(step: OnboardingStep): boolean {
    const requiredTasks = step.tasks.filter(task => !task.optional);
    return requiredTasks.every(task => task.completed);
  }

  getStepState(step: OnboardingStep): string {
    if (this.isStepCompleted(step)) {
      return 'done';
    }
    const hasCompletedTasks = step.tasks.some(task => task.completed);
    return hasCompletedTasks ? 'edit' : 'number';
  }

  getStepCompletedTasks(step: OnboardingStep): number {
    return step.tasks.filter(task => task.completed).length;
  }

  getTotalTasks(): number {
    return this.onboardingSteps.reduce((total, step) => total + step.tasks.length, 0);
  }

  getTotalCompletedTasks(): number {
    return this.onboardingSteps.reduce((total, step) => 
      total + step.tasks.filter(task => task.completed).length, 0
    );
  }

  getTotalEstimatedTime(): string {
    const totalMinutes = this.onboardingSteps.reduce((total, step) => {
      const minutes = parseInt(step.estimatedTime.replace(' min', ''));
      return total + minutes;
    }, 0);
    
    if (totalMinutes < 60) {
      return `${totalMinutes} min`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const remainingMinutes = totalMinutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
  }

  getTimeColor(): 'primary' | 'accent' | 'warn' {
    const totalMinutes = parseInt(this.getTotalEstimatedTime().replace(/[^\d]/g, ''));
    if (totalMinutes <= 60) return 'primary';
    if (totalMinutes <= 90) return 'accent';
    return 'warn';
  }

  isAllCompleted(): boolean {
    return this.onboardingSteps.every(step => this.isStepCompleted(step));
  }

  toggleTask(task: { id: string; completed: boolean }): void {
    task.completed = !task.completed;
    this.saveProgress();
  }

  resetProgress(): void {
    if (confirm('Are you sure you want to reset all progress? This action cannot be undone.')) {
      this.onboardingSteps.forEach(step => {
        step.tasks.forEach(task => {
          task.completed = false;
        });
      });
      this.saveProgress();
    }
  }

  private saveProgress(): void {
    const progress = this.onboardingSteps.map(step => ({
      title: step.title,
      tasks: step.tasks.map(task => ({
        id: task.id,
        completed: task.completed
      }))
    }));
    
    localStorage.setItem('donors-app::onboarding-progress', JSON.stringify(progress));
  }

  private loadProgress(): void {
    const saved = localStorage.getItem('donors-app::onboarding-progress');
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        progress.forEach((savedStep: any) => {
          const step = this.onboardingSteps.find(s => s.title === savedStep.title);
          if (step) {
            savedStep.tasks.forEach((savedTask: any) => {
              const task = step.tasks.find(t => t.id === savedTask.id);
              if (task) {
                task.completed = savedTask.completed;
              }
            });
          }
        });
      } catch (error) {
        console.error('Failed to load onboarding progress:', error);
      }
    }
  }
}
