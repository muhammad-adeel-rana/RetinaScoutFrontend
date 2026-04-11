import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home),
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about-page/about-page').then(m => m.AboutPage),
  },
  {
    path: 'pricing',
    loadComponent: () => import('./pages/pricing-page/pricing-page').then(m => m.PricingPage),
  },
  {
    path: 'blog',
    loadComponent: () => import('./pages/blog-page/blog-page').then(m => m.BlogPage),
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup-page/signup-page').then(m => m.SignupPage),
    data: { hideShell: true },
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login-page/login-page').then(m => m.LoginPage),
    data: { hideShell: true },
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/ophthalmologist/ophthalmologist-dashboard').then(m => m.OphthalmologistDashboard),
    data: { hideShell: true },
  },
  {
    path: '**',
    redirectTo: '',
  },
];
