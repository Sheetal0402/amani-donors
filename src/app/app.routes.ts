import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/components/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'donor-trip',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/donor-trip/donor-trip.component').then(m => m.DonorTripComponent)
  },
  {
    path: 'donor-trip/:id',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/donor-trip/trip-detail.component').then(m => m.TripDetailComponent)
  },
  {
    path: 'donor-promises',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/donor-promises/donor-promises.component').then(m => m.DonorPromisesComponent)
  },
  {
    path: 'admin/how-to',
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'staff'] },
    loadComponent: () => import('./features/admin/admin-how-to.component').then(m => m.AdminHowToComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
