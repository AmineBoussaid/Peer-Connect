import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { PublicHomeComponent } from './public/home/home';

export const routes: Routes = [

  { path: '', component: PublicHomeComponent },

  { path: 'auth', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },

  { path: 'login', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth/register', pathMatch: 'full' },

  // Lazy loading des rôles
  { path: 'auteur', loadChildren: () => import('./auteur/auteur.routes').then(m => m.AUTEUR_ROUTES) },
  { path: 'expert', loadChildren: () => import('./expert/expert.routes').then(m => m.EXPERT_ROUTES) },
  { path: 'admin', loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES) },

  { path: '**', redirectTo: '', pathMatch: 'full' },

];
