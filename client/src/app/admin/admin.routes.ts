import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'acceuille', pathMatch: 'full' },
  { path: 'acceuille', loadComponent: () => import('./acceuille/acceuille').then(m => m.AdminAcceuilleComponent) },
  { path: 'manage-experts', loadComponent: () => import('./manage-experts/manage-experts').then(m => m.ManageExpertsComponent) },
  { path: 'workflow', loadComponent: () => import('./workflow/workflow').then(m => m.WorkflowComponent) }
];
