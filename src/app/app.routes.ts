import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./public/home/home').then(m => m.Home),
  },
  {
    path: 'about',
    loadComponent: () => import('./public/about/about-page').then(m => m.AboutPage),
  },
  {
    path: 'pricing',
    loadComponent: () => import('./public/pricing/pricing-page').then(m => m.PricingPage),
  },
  {
    path: 'blog',
    loadComponent: () => import('./public/blog/blog-page').then(m => m.BlogPage),
  },
  {
    path: 'signup',
    loadComponent: () => import('./public/auth/signup/signup-page').then(m => m.SignupPage),
    data: { hideShell: true },
  },
  {
    path: 'login',
    loadComponent: () => import('./public/auth/login/login-page').then(m => m.LoginPage),
    data: { hideShell: true },
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboards/ophthalmologist/ophthalmologist-dashboard').then(m => m.OphthalmologistDashboard),
    data: { hideShell: true },
  },
  {
    path: 'dashboard/upload',
    loadComponent: () => import('./dashboards/ophthalmologist/pages/image-upload/image-upload').then(m => m.ImageUpload),
    data: { hideShell: true },
  },
  {
    path: 'dashboard/visualization',
    loadComponent: () => import('./dashboards/ophthalmologist/pages/visualization/visualization').then(m => m.Visualization),
    data: { hideShell: true },
  },
  {
    path: 'dashboard/medical-report',
    loadComponent: () => import('./dashboards/ophthalmologist/pages/medical-report/medical-report').then(m => m.MedicalReport),
    data: { hideShell: true },
  },
  {
    path: 'dashboard/patients',
    loadComponent: () => import('./dashboards/ophthalmologist/pages/patient-records/patient-records').then(m => m.PatientRecords),
    data: { hideShell: true },
  },
  {
    path: 'dashboard/patients/:id',
    loadComponent: () => import('./dashboards/ophthalmologist/pages/patient-detail/patient-detail').then(m => m.PatientDetail),
    data: { hideShell: true },
  },
  {
    path: '**',
    redirectTo: '',
  },
];
