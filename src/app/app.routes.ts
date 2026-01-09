import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [

  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component')
        .then(m => m.LoginComponent)
  },

  
  {
    path: 'rider',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./auth/rider/rider.component')
        .then(m => m.RiderComponent)
  },

  {
    path: 'driver',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./auth/driver/driver.component')
        .then(m => m.DriverComponent)
  },

  {
    path: 'admin',
    canActivate: [],    
    loadComponent: () =>
      import('./auth/admin/admin.component')
        .then(m => m.AdminComponent)    
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
