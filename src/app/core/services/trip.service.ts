import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Trip, ChecklistItem } from '../models/trip.model';
import { TenantConfigService } from './tenant-config.service';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private tripsSubject = new BehaviorSubject<Trip[]>([]);
  trips$ = this.tripsSubject.asObservable();

  constructor(
    private tenantService: TenantConfigService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadTrips();
  }

  private loadTrips(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storageKey = this.tenantService.getStorageKey('trips');
      const savedTrips = localStorage.getItem(storageKey);
      
      if (savedTrips) {
        try {
          const trips = JSON.parse(savedTrips).map((trip: any) => ({
            ...trip,
            startDate: new Date(trip.startDate),
            endDate: new Date(trip.endDate),
            createdAt: new Date(trip.createdAt),
            updatedAt: new Date(trip.updatedAt)
          }));
          this.tripsSubject.next(trips);
        } catch (error) {
          console.error('Failed to parse saved trips:', error);
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
    const mockTrips: Trip[] = [
      {
        id: '1',
        title: 'Kenya Educational Visit',
        description: 'Visit schools and educational facilities in Kenya',
        destination: 'Nairobi, Kenya',
        startDate: new Date('2024-03-15'),
        endDate: new Date('2024-03-25'),
        status: 'planning',
        checklist: this.getMockChecklistItems(),
        createdBy: 'donor@amani.org',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        title: 'Tanzania Water Project Visit',
        description: 'Inspect water well installations and meet beneficiaries',
        destination: 'Arusha, Tanzania',
        startDate: new Date('2024-05-10'),
        endDate: new Date('2024-05-20'),
        status: 'active',
        checklist: this.getMockChecklistItems(),
        createdBy: 'donor@amani.org',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-15')
      }
    ];
    
    this.tripsSubject.next(mockTrips);
    this.saveTrips();
  }

  private getMockChecklistItems(): ChecklistItem[] {
    return [
      {
        id: '1',
        title: 'Get Travel Visa',
        description: 'Apply for and obtain travel visa',
        category: 'documentation',
        isCompleted: false,
        dueDate: new Date('2024-02-15'),
        priority: 'high'
      },
      {
        id: '2',
        title: 'Book Flights',
        description: 'Book round-trip flights',
        category: 'travel',
        isCompleted: true,
        completedAt: new Date('2024-01-20'),
        priority: 'high'
      },
      {
        id: '3',
        title: 'Get Vaccinations',
        description: 'Required vaccinations for travel',
        category: 'health',
        isCompleted: false,
        dueDate: new Date('2024-02-28'),
        priority: 'medium'
      },
      {
        id: '4',
        title: 'Pack Equipment',
        description: 'Pack camera and recording equipment',
        category: 'preparation',
        isCompleted: false,
        priority: 'low'
      }
    ];
  }

  getTrips(): Observable<Trip[]> {
    return this.trips$;
  }

  getTripById(id: string): Observable<Trip | undefined> {
    return of(this.tripsSubject.value.find(trip => trip.id === id));
  }

  createTrip(trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Observable<Trip> {
    const newTrip: Trip = {
      ...trip,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const trips = [...this.tripsSubject.value, newTrip];
    this.tripsSubject.next(trips);
    this.saveTrips();
    
    return of(newTrip);
  }

  updateTrip(id: string, updates: Partial<Trip>): Observable<Trip> {
    const trips = this.tripsSubject.value;
    const index = trips.findIndex(trip => trip.id === id);
    
    if (index === -1) {
      throw new Error('Trip not found');
    }

    const updatedTrip = {
      ...trips[index],
      ...updates,
      updatedAt: new Date()
    };

    trips[index] = updatedTrip;
    this.tripsSubject.next([...trips]);
    this.saveTrips();
    
    return of(updatedTrip);
  }

  deleteTrip(id: string): Observable<boolean> {
    const trips = this.tripsSubject.value.filter(trip => trip.id !== id);
    this.tripsSubject.next(trips);
    this.saveTrips();
    
    return of(true);
  }

  updateChecklistItem(tripId: string, itemId: string, updates: Partial<ChecklistItem>): Observable<Trip> {
    const trips = this.tripsSubject.value;
    const tripIndex = trips.findIndex(trip => trip.id === tripId);
    
    if (tripIndex === -1) {
      throw new Error('Trip not found');
    }

    const trip = trips[tripIndex];
    const itemIndex = trip.checklist.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      throw new Error('Checklist item not found');
    }

    if (updates.isCompleted && !trip.checklist[itemIndex].isCompleted) {
      updates.completedAt = new Date();
    } else if (updates.isCompleted === false) {
      updates.completedAt = undefined;
    }

    trip.checklist[itemIndex] = { ...trip.checklist[itemIndex], ...updates };
    trip.updatedAt = new Date();

    this.tripsSubject.next([...trips]);
    this.saveTrips();
    
    return of(trip);
  }

  addChecklistItem(tripId: string, item: Omit<ChecklistItem, 'id'>): Observable<Trip> {
    const trips = this.tripsSubject.value;
    const tripIndex = trips.findIndex(trip => trip.id === tripId);
    
    if (tripIndex === -1) {
      throw new Error('Trip not found');
    }

    const newItem: ChecklistItem = {
      ...item,
      id: this.generateId()
    };

    trips[tripIndex].checklist.push(newItem);
    trips[tripIndex].updatedAt = new Date();

    this.tripsSubject.next([...trips]);
    this.saveTrips();
    
    return of(trips[tripIndex]);
  }

  private saveTrips(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storageKey = this.tenantService.getStorageKey('trips');
      localStorage.setItem(storageKey, JSON.stringify(this.tripsSubject.value));
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  exportToPDF(tripId: string): Observable<Blob> {
    // Mock PDF export - in real app, would use a PDF library
    const trip = this.tripsSubject.value.find(t => t.id === tripId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    // Create mock PDF content
    const content = `Trip: ${trip.title}\nDestination: ${trip.destination}\nChecklist items: ${trip.checklist.length}`;
    const blob = new Blob([content], { type: 'text/plain' });
    
    return of(blob);
  }
}
