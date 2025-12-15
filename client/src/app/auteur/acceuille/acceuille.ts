import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-auteur-acceuille',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './acceuille.html',
  styleUrls: ['./acceuille.css']
})
export class AuteurAcceuilleComponent {
  assignations: any[] = [];
  filteredAssignations: any[] = [];
  articles: any[] = [];
  filteredArticles: any[] = [];
  allAssignations: any[] = [];
  articleRatings: { [id: number]: number } = {};
  page = 1;
  pageSize = 5;
  articlesPage = 1;
  articlesPageSize = 6;

  constructor(private http: HttpClient, private storage: StorageService) {}

  ngOnInit() {
    this.loadMyArticles();
    this.loadAllArticles();
  }

  getAuteurId(): number | null {
    return this.storage.getUserId();
  }

  loadMyArticles() {
    const id = this.getAuteurId();
    if (!id) return;
    
    this.http.get<any[]>(`http://localhost:3000/api/articles/mine?id_auteur=${id}`).subscribe({
      next: (rows) => {
        this.assignations = rows || [];
        this.filteredAssignations = rows || [];
        this.loadArticleRatings();
        this.loadUserAssignations();
      },
      error: () => {}
    });
  }

  loadAllArticles() {
    this.http.get<any[]>(`http://localhost:3000/api/articles/all`).subscribe({
      next: (rows) => {
        this.articles = rows || [];
        this.filteredArticles = rows || [];
      },
      error: () => {}
    });
  }

  loadUserAssignations() {
    if (this.assignations.length === 0) {
      return;
    }
    const promises = this.assignations.map(a => 
      this.http.get<any[]>(`http://localhost:3000/api/assignations/by-article?id_article=${a.id_article}`).toPromise()
    );
    Promise.all(promises).then(results => {
      this.allAssignations = results.flat().filter(a => a);
    }).catch(() => {});
  }

  loadArticleRatings() {
    const promises = this.assignations.map(a =>
      this.http.get<any[]>(`http://localhost:3000/api/reviews/by-article?id_article=${a.id_article}`).toPromise()
        .then(reviews => {
          if (reviews && reviews.length) {
            const notes = reviews
              .map(r => typeof r.note_globale === 'number' ? r.note_globale : parseFloat(r.note_globale))
              .filter(n => !Number.isNaN(n));
            const avg = notes.length ? (notes.reduce((s, n) => s + n, 0) / notes.length) : undefined;
            if (avg !== undefined) {
              this.articleRatings[a.id_article] = Math.round(avg * 10) / 10;
            }
          }
        })
        .catch(() => {})
    );
    Promise.all(promises).catch(() => {});
  }

  getArticleRating(articleId: number): number | null {
    return this.articleRatings[articleId] ?? null;
  }

  to10(val: number | null): string {
    if (val === null || val === undefined) return '-';
    return (val / 10).toFixed(1);
  }

  get paginatedAssignations(): any[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredAssignations.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredAssignations.length / this.pageSize));
  }

  get paginatedArticles(): any[] {
    const start = (this.articlesPage - 1) * this.articlesPageSize;
    return this.filteredArticles.slice(start, start + this.articlesPageSize);
  }

  get totalArticlesPages(): number {
    return Math.max(1, Math.ceil(this.filteredArticles.length / this.articlesPageSize));
  }

  getFilteredStatuts(article: any): any[] {
    const assignations = this.getArticleAssignations(article.id_article);
    return assignations.filter(a => 
      a.statut_assignation !== 'en_cours' && a.statut_assignation !== 'en_attente'
    );
  }

  nextPage(): void {
    if (this.page < this.totalPages) this.page += 1;
  }

  prevPage(): void {
    if (this.page > 1) this.page -= 1;
  }

  nextArticlesPage(): void {
    if (this.articlesPage < this.totalArticlesPages) this.articlesPage += 1;
  }

  prevArticlesPage(): void {
    if (this.articlesPage > 1) this.articlesPage -= 1;
  }

  getPdfUrl(filename: string | null): string {
    return filename ? `http://localhost:3000/uploads/${filename}` : '';
  }

  getArticleAssignations(articleId: number): any[] {
    return this.assignations.filter(a => a.id_article === articleId);
  }

  getLastSubmissionDate(): string {
    if (this.assignations.length === 0) return '-';
    const dates = this.assignations.map(a => new Date(a.date_soumission));
    const latest = new Date(Math.max(...dates.map(d => d.getTime())));
    const now = new Date();
    const diffMs = now.getTime() - latest.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)}w`;
    return latest.toLocaleDateString('fr-FR');
  }

  get statsCards() {
    const stats = [
      {
        label: 'Mes Articles Soumis',
        value: this.assignations.length,
        icon: '📝',
        color: 'bg-emerald-50',
        textColor: 'text-emerald-700'
      },
      {
        label: 'Assignations Terminées',
        value: this.allAssignations.filter(a => a.statut_assignation === 'termine').length,
        icon: '✅',
        color: 'bg-indigo-50',
        textColor: 'text-indigo-700'
      },
      {
        label: 'Dernier Article',
        value: this.getLastSubmissionDate(),
        icon: '📅',
        color: 'bg-amber-50',
        textColor: 'text-amber-700'
      }
    ];
    return stats;
  }

  getStatutColor(statut: string): string {
    const key = (statut || '').toString().trim().toLowerCase();
    const colors: any = {
      'en_attente': '#ffc107',
      'en_cours': '#17a2b8',
      'termine': '#28a745',
      'annulea': '#dc3545',
      'refuse': '#6c757d',
      'urgentes': '#e25822',
      'en_retard': '#ff6f00'
    };
    return colors[key] || '#6c757d';
  }
}