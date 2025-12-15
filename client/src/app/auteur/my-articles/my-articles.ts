import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-my-articles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-articles.html',
  styleUrl: './my-articles.css',
})
export class MyArticlesComponent {
  articles: any[] = [];
  filteredArticles: any[] = [];
  assignations: any[] = [];
  articleRatings: { [id: number]: number } = {};
  reviewsByArticle: { [id: number]: any[] } = {};
  form = { titre: '', resume: '', mots_cles: [] as string[], fichier_pdf: '' };
  selectedFile: File | null = null;
  editingId: number | null = null;
  searchTerm = '';
  sortBy = 'date';
  viewMode: 'cards' | 'table' = 'cards';
  page = 1;
  pageSize = 5;
  selectedArticleForHistory: any = null;
  showFormModal = false;
  
  // Suggestions de mots-clés
  availableKeywords = [
    'Intelligence Artificielle', 'Machine Learning', 'Deep Learning',
    'Réseaux de Neurones', 'Traitement du Langage Naturel', 'Computer Vision',
    'Big Data', 'Data Science', 'IoT', 'Blockchain',
    'Cybersécurité', 'Cloud Computing', 'DevOps', 'Microservices',
    'Robotique', 'Réalité Virtuelle', 'Réalité Augmentée',
    'Apprentissage par Renforcement', 'Analyse Prédictive', 'Bioinformatique'
  ];
  filteredKeywords: string[] = [];
  keywordSearch = '';

  constructor(private http: HttpClient, private storage: StorageService) {}

  ngOnInit() {
    this.loadArticlesFromCache();
    this.filteredKeywords = this.availableKeywords;
  }

  getAuteurId(): number | null {
    return this.storage.getUserId();
  }

  loadArticlesFromCache() {
    const id = this.getAuteurId();
    if (!id) {
      return;
    }
    
    // Charger depuis le cache
    const cached = this.storage.getItem(`articles_${id}`);
    if (cached) {
      this.articles = JSON.parse(cached);
      this.applyFilters();
    }
    
    // Charger depuis le serveur en arrière-plan
    this.loadArticles();
  }

  loadArticles(forceRefresh = false) {
    const id = this.getAuteurId();
    if (!id) {
      return;
    }
    this.http.get<any[]>(`http://localhost:3000/api/articles/mine?id_auteur=${id}`).subscribe({
      next: (rows) => {
        this.articles = rows;
        // Sauvegarder dans le cache
        this.storage.setItem(`articles_${id}`, JSON.stringify(rows));
        this.applyFilters();
        this.loadAssignations();
        this.loadArticleRatings();
      },
      error: () => {}
    });
  }
  
  loadAssignations() {
    if (this.articles.length === 0) {
      return;
    }
    const promises = this.articles.map(a => 
      this.http.get<any[]>(`http://localhost:3000/api/assignations/by-article?id_article=${a.id_article}`).toPromise()
    );
    Promise.all(promises).then(results => {
      this.assignations = results.flat().filter(a => a);
    }).catch(() => {});
  }

  loadArticleRatings() {
    if (this.articles.length === 0) {
      return;
    }
    const requests = this.articles.map(a =>
      this.http.get<any[]>(`http://localhost:3000/api/reviews/by-article?id_article=${a.id_article}`).toPromise()
        .then(reviews => {
          if (reviews && reviews.length) {
            const notes = reviews
              .map(r => typeof r.note_globale === 'number' ? r.note_globale : parseFloat(r.note_globale))
              .filter(n => !Number.isNaN(n));
            const avg = notes.length ? (notes.reduce((s, n) => s + n, 0) / notes.length) : undefined;
            if (avg !== undefined) {
              this.articleRatings[a.id_article] = Math.round(avg);
            }
          }
        })
        .catch(() => {})
    );
    Promise.all(requests).catch(() => {});
  }

  getArticleRating(articleId: number): number | null {
    return this.articleRatings[articleId] ?? null;
  }

  to10(val: number | null): number | null {
    if (val === null || val === undefined) return null;
    return Math.round(val) / 10;
  }
  
  applyFilters() {
    let filtered = [...this.articles];
    
    // Filtre par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.titre.toLowerCase().includes(term) ||
        (a.resume && a.resume.toLowerCase().includes(term)) ||
        (a.mots_cles && a.mots_cles.toLowerCase().includes(term))
      );
    }
    
    // Tri
    if (this.sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.date_soumission).getTime() - new Date(a.date_soumission).getTime());
    } else if (this.sortBy === 'title') {
      filtered.sort((a, b) => a.titre.localeCompare(b.titre));
    }
    
    this.filteredArticles = filtered;
    this.page = 1; // reset pagination on filter change
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
    } else {
      alert('Veuillez sélectionner un fichier PDF');
      this.selectedFile = null;
    }
  }

  filterKeywords() {
    const search = this.keywordSearch.toLowerCase();
    this.filteredKeywords = this.availableKeywords.filter(k => 
      k.toLowerCase().includes(search)
    );
  }

  toggleKeyword(keyword: string) {
    const index = this.form.mots_cles.indexOf(keyword);
    if (index > -1) {
      this.form.mots_cles.splice(index, 1);
    } else {
      this.form.mots_cles.push(keyword);
    }
  }

  isKeywordSelected(keyword: string): boolean {
    return this.form.mots_cles.includes(keyword);
  }

  submit() {
    const id = this.getAuteurId();
    if (!id) return;
    if (this.editingId) {
      const formData = new FormData();
      formData.append('titre', this.form.titre);
      formData.append('resume', this.form.resume);
      formData.append('mots_cles', this.form.mots_cles.join(', '));
      if (this.selectedFile) {
        formData.append('fichier_pdf', this.selectedFile);
      }
      this.http.put(`http://localhost:3000/api/articles/${this.editingId}`, formData).subscribe(() => {
        this.cancel();
        this.closeFormModal();
        this.loadArticles();
      });
    } else {
      const formData = new FormData();
      formData.append('id_auteur', id.toString());
      formData.append('titre', this.form.titre);
      formData.append('resume', this.form.resume);
      formData.append('mots_cles', this.form.mots_cles.join(', '));
      if (this.selectedFile) {
        formData.append('fichier_pdf', this.selectedFile);
      }
      this.http.post('http://localhost:3000/api/articles', formData).subscribe(() => {
        this.resetForm();
        this.selectedFile = null;
        this.closeFormModal();
        // Actualiser la liste depuis le serveur
        this.loadArticles(true);
      });
    }
  }

  edit(article: any) {
    this.editingId = article.id_article;
    const keywords = article.mots_cles ? article.mots_cles.split(',').map((k: string) => k.trim()) : [];
    this.form = {
      titre: article.titre || '',
      resume: article.resume || '',
      mots_cles: keywords,
      fichier_pdf: article.fichier_pdf || ''
    };
    this.selectedFile = null;
    this.openFormModal();
  }

  cancel() { 
    this.editingId = null; 
    this.resetForm(); 
    this.showFormModal = false; 
  }
  
  openFormModal() { this.showFormModal = true; }
  closeFormModal() { 
    this.showFormModal = false; 
    this.editingId = null;
    this.resetForm();
  }
  
  resetForm() { 
    this.form = { titre: '', resume: '', mots_cles: [], fichier_pdf: '' };
    this.selectedFile = null;
    this.keywordSearch = '';
    this.filteredKeywords = this.availableKeywords;
  }

  getPdfUrl(filename: string | null): string {
    return filename ? `http://localhost:3000/uploads/${filename}` : '';
  }

  remove(article: any) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      this.http.delete(`http://localhost:3000/api/articles/${article.id_article}`).subscribe(() => {
        this.loadArticles(true);
      });
    }
  }
  
  // Statistiques
  getTotalArticles(): number {
    return this.articles.length;
  }
  
  getArticlesWithPdf(): number {
    return this.articles.filter(a => a.fichier_pdf).length;
  }
  
  // Historique des assignations
  getAssignationsForArticle(articleId: number): any[] {
    return this.assignations.filter(a => a.id_article === articleId);
  }
  
  showArticleHistory(article: any) {
    this.selectedArticleForHistory = article;
    const id = article?.id_article;
    if (id) {
      this.http.get<any[]>(`http://localhost:3000/api/reviews/by-article?id_article=${id}`).subscribe({
        next: (rows) => {
          this.reviewsByArticle[id] = rows || [];
        },
        error: () => {
          this.reviewsByArticle[id] = [];
        }
      });
    }
  }
  
  closeHistory() {
    this.selectedArticleForHistory = null;
  }

  getAssignationDate(assign: any, fallbackArticle: any): any {
    return assign?.date_assignation || assign?.article_date_soumission || fallbackArticle?.date_soumission || null;
  }

  getReviewsForSelected(): any[] {
    const id = this.selectedArticleForHistory?.id_article;
    if (!id) return [];
    return this.reviewsByArticle[id] || [];
  }

  // Pagination helpers for filtered articles
  get paginatedFilteredArticles(): any[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredArticles.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredArticles.length / this.pageSize));
  }

  nextPage() {
    if (this.page < this.totalPages) this.page++;
  }

  prevPage() {
    if (this.page > 1) this.page--;
  }

  changePageSize(size: number) {
    const n = Number(size);
    this.pageSize = [5, 10, 20].includes(n) ? n : 5;
    this.page = 1;
  }
}
