import { Routes } from '@angular/router';

export const AUTEUR_ROUTES: Routes = [
  { path: '', redirectTo: 'acceuille', pathMatch: 'full' },
  { path: 'acceuille', loadComponent: () => import('./acceuille/acceuille').then(m => m.AuteurAcceuilleComponent) },
  { path: 'submit-article', loadComponent: () => import('./submit-article/submit-article').then(m => m.SubmitArticleComponent) },
  { path: 'my-articles', loadComponent: () => import('./my-articles/my-articles').then(m => m.MyArticlesComponent) }
];
