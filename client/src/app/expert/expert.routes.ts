import { Routes } from '@angular/router';

export const EXPERT_ROUTES: Routes = [
  { path: '', redirectTo: 'acceuille', pathMatch: 'full' },
  { path: 'acceuille', loadComponent: () => import('./acceuille/acceuille').then(m => m.ExpertAcceuilleComponent) },
  { path: 'assignments', loadComponent: () => import('./assignments/assignments').then(m => m.AssignmentsComponent) },
  { path: 'submit-review', loadComponent: () => import('./submit-review/submit-review').then(m => m.SubmitReviewComponent) }
];
