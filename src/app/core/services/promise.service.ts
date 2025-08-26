import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Promise } from '../models/promise.model';
import { TenantConfigService } from './tenant-config.service';

@Injectable({
  providedIn: 'root'
})
export class PromiseService {
  private promisesSubject = new BehaviorSubject<Promise[]>([]);
  promises$ = this.promisesSubject.asObservable();

  constructor(
    private tenantService: TenantConfigService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadPromises();
  }

  private loadPromises(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storageKey = this.tenantService.getStorageKey('promises');
      const savedPromises = localStorage.getItem(storageKey);
      
      if (savedPromises) {
        try {
          const promises = JSON.parse(savedPromises).map((promise: any) => ({
            ...promise,
            dueDate: promise.dueDate ? new Date(promise.dueDate) : undefined,
            fulfilledAt: promise.fulfilledAt ? new Date(promise.fulfilledAt) : undefined,
            createdAt: new Date(promise.createdAt),
            updatedAt: new Date(promise.updatedAt)
          }));
          this.promisesSubject.next(promises);
        } catch (error) {
          console.error('Failed to parse saved promises:', error);
          this.initializeWithMockData();
        }
      } else {
        this.initializeWithMockData();
      }
    } else {
      this.initializeWithMockData();
    }
  }

  private initializeWithMockData(): void {
    const mockPromises: Promise[] = [
      {
        id: '1',
        title: 'Monthly Donation',
        description: 'Regular monthly donation of $500',
        amount: 500,
        currency: 'USD',
        category: 'financial',
        status: 'fulfilled',
        dueDate: new Date('2024-02-01'),
        fulfilledAt: new Date('2024-01-28'),
        createdBy: 'donor@amani.org',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-28'),
        notes: 'Fulfilled via bank transfer'
      },
      {
        id: '2',
        title: 'Volunteer Time',
        description: 'Commit 20 hours of volunteer work',
        category: 'volunteer',
        status: 'in-progress',
        dueDate: new Date('2024-03-31'),
        createdBy: 'donor@amani.org',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-02-01'),
        notes: '8 hours completed so far'
      },
      {
        id: '3',
        title: 'Equipment Donation',
        description: 'Donate 10 laptops for educational program',
        category: 'resource',
        status: 'pending',
        dueDate: new Date('2024-04-15'),
        createdBy: 'donor@amani.org',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01')
      },
      {
        id: '4',
        title: 'Social Media Promotion',
        description: 'Share organization posts on social media',
        category: 'advocacy',
        status: 'fulfilled',
        fulfilledAt: new Date('2024-01-20'),
        createdBy: 'donor@amani.org',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-20')
      }
    ];
    
    this.promisesSubject.next(mockPromises);
    this.savePromises();
  }

  getPromises(): Observable<Promise[]> {
    return this.promises$;
  }

  getPromiseById(id: string): Observable<Promise | undefined> {
    return of(this.promisesSubject.value.find(promise => promise.id === id));
  }

  createPromise(promise: Omit<Promise, 'id' | 'createdAt' | 'updatedAt'>): Observable<Promise> {
    const newPromise: Promise = {
      ...promise,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const promises = [...this.promisesSubject.value, newPromise];
    this.promisesSubject.next(promises);
    this.savePromises();
    
    return of(newPromise);
  }

  updatePromise(id: string, updates: Partial<Promise>): Observable<Promise> {
    const promises = this.promisesSubject.value;
    const index = promises.findIndex(promise => promise.id === id);
    
    if (index === -1) {
      throw new Error('Promise not found');
    }

    // Handle status changes
    if (updates.status === 'fulfilled' && promises[index].status !== 'fulfilled') {
      updates.fulfilledAt = new Date();
    } else if (updates.status !== 'fulfilled') {
      updates.fulfilledAt = undefined;
    }

    const updatedPromise = {
      ...promises[index],
      ...updates,
      updatedAt: new Date()
    };

    promises[index] = updatedPromise;
    this.promisesSubject.next([...promises]);
    this.savePromises();
    
    return of(updatedPromise);
  }

  deletePromise(id: string): Observable<boolean> {
    const promises = this.promisesSubject.value.filter(promise => promise.id !== id);
    this.promisesSubject.next(promises);
    this.savePromises();
    
    return of(true);
  }

  markAsFulfilled(id: string, notes?: string): Observable<Promise> {
    return this.updatePromise(id, { 
      status: 'fulfilled', 
      notes: notes || undefined 
    });
  }

  getPromisesByStatus(status: Promise['status']): Observable<Promise[]> {
    return of(this.promisesSubject.value.filter(promise => promise.status === status));
  }

  getPromisesByCategory(category: Promise['category']): Observable<Promise[]> {
    return of(this.promisesSubject.value.filter(promise => promise.category === category));
  }

  private savePromises(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storageKey = this.tenantService.getStorageKey('promises');
      localStorage.setItem(storageKey, JSON.stringify(this.promisesSubject.value));
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  exportToCSV(): Observable<string> {
    const promises = this.promisesSubject.value;
    
    const headers = ['Title', 'Description', 'Category', 'Status', 'Amount', 'Currency', 'Due Date', 'Fulfilled Date', 'Notes'];
    const rows = promises.map(promise => [
      promise.title,
      promise.description,
      promise.category,
      promise.status,
      promise.amount?.toString() || '',
      promise.currency || '',
      promise.dueDate?.toLocaleDateString() || '',
      promise.fulfilledAt?.toLocaleDateString() || '',
      promise.notes || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return of(csvContent);
  }
}
