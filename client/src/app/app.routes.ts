import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Page login
  { path: 'login', component: LoginComponent },

  // Lazy loading des rôles
  { path: 'auteur', loadChildren: () => import('./auteur/auteur.routes').then(m => m.AUTEUR_ROUTES) },
  { path: 'expert', loadChildren: () => import('./expert/expert.routes').then(m => m.EXPERT_ROUTES) },
  { path: 'admin', loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES) },

];
