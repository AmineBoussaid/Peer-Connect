import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-expert-acceuille',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './acceuille.html',
  styleUrls: ['./acceuille.css']
})
export class ExpertAcceuilleComponent {
  assignations: any[] = [];
  filteredAssignations: any[] = [];
  articles: any[] = [];
  filteredArticles: any[] = [];
  articleRatings: { [id: number]: number } = {};
  page = 1;
  pageSize = 5;
  articlesPage = 1;
  articlesPageSize = 6;

  constructor(private http: HttpClient, private storage: StorageService) {}

  ngOnInit() {
    this.loadAssignations();
    this.loadAllArticles();
  }

  getExpertId(): number | null {
    return this.storage.getUserId();
  }

  loadAssignations() {
    const id = this.getExpertId();
    if (!id) return;
    
    this.http.get<any[]>(`http://localhost:3000/api/assignations/by-expert?id_expert=${id}`).subscribe({
      next: (rows) => {
        this.assignations = rows || [];
        this.filteredAssignations = rows || [];
        this.loadArticleRatings();
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

  get statsCards() {
    const stats = [
      {
        label: 'Articles à Évaluer',
        value: this.assignations.length,
        icon: '📋',
        color: 'bg-blue-50',
        textColor: 'text-blue-700'
      },
      {
        label: 'Articles Disponibles',
        value: this.articles.length,
        icon: '📚',
        color: 'bg-purple-50',
        textColor: 'text-purple-700'
      },
      {
        label: 'Évaluations Complétées',
        value: this.assignations.filter(a => a.statut_assignation === 'termine').length,
        icon: '✅',
        color: 'bg-green-50',
        textColor: 'text-green-700'
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
      'annulee': '#dc3545',
      'refuse': '#6c757d',
      'urgentes': '#e25822',
      'en_retard': '#ff6f00'
    };
    return colors[key] || '#6c757d';
  }
}