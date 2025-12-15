import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'acceuille', pathMatch: 'full' },
  { path: 'acceuille', loadComponent: () => import('./acceuille/acceuille').then(m => m.AdminAcceuilleComponent) },
  { path: 'manage-experts', loadComponent: () => import('./manage-experts/manage-experts').then(m => m.ManageExpertsComponent) },
  { path: 'workflow', loadComponent: () => import('./workflow/workflow').then(m => m.WorkflowComponent) },
  { path: 'workflow-detail/:id', loadComponent: () => import('./workflow/workflow-detail').then(m => m.WorkflowDetailComponent) },
  { path: 'users', loadComponent: () => import('./users-list/users-list').then(m => m.AdminUsersListComponent) },
  { path: 'user/:id', loadComponent: () => import('./user-detail/user-detail').then(m => m.AdminUserDetailComponent) }
];
