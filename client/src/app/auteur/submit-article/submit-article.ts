import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-submit-article',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './submit-article.html',
  styleUrl: './submit-article.css',
})
export class SubmitArticleComponent {
  myArticles: any[] = [];
  experts: any[] = [];
  filteredExperts: any[] = [];
  assignations: any[] = [];
  selectedArticleId: number | null = null;
  selectedExpertIds: number[] = [];
  dateLimite = '';
  searchExpert = '';
  filterDomain = 'all';
  showHistoryModal = false;
  
  // Pagination for articles
  articlePage = 1;
  articlePageSize = 5;
  
  // Pagination for experts
  expertPage = 1;
  expertPageSize = 5;
  
  // Multi-step form
  currentStep = 0; // 0: Liste des soumissions, 1: Article, 2: Experts, 3: Date limite, 4: Résumé et soumission
  
  // Pagination et groupement des assignations
  assignationPage = 1;
  assignationPageSize = 7;
  groupBy: 'none' | 'article' | 'expert' = 'none';
  expandedGroups: Set<string> = new Set();
  
  constructor(private http: HttpClient, private storage: StorageService) {}
  
  ngOnInit() {
    this.loadMyArticles();
    this.loadExperts();
    this.loadAssignations();
  }
  
  getAuteurId(): number | null {
    return this.storage.getUserId();
  }
  
  loadMyArticles() {
    const id = this.getAuteurId();
    if (!id) {
      return;
    }
    this.http.get<any[]>(`http://localhost:3000/api/articles/mine?id_auteur=${id}`).subscribe(articles => {
      this.myArticles = articles || [];
    }, () => {});
  }
  
  loadExperts() {
    this.http.get<any[]>('http://localhost:3000/api/experts/available').subscribe(experts => {
      this.experts = experts;
      this.applyFilters();
    }, () => {});
  }
  
  loadAssignations() {
    const id = this.getAuteurId();
    if (!id) {
      return;
    }
    this.http.get<any[]>(`http://localhost:3000/api/articles/mine?id_auteur=${id}`).subscribe(articles => {
      // Charger les assignations pour chaque article
      const promises = articles.map(a => 
        this.http.get<any[]>(`http://localhost:3000/api/assignations/by-article?id_article=${a.id_article}`).toPromise()
      );
      Promise.all(promises).then(results => {
        this.assignations = results.flat().filter(a => a);
      }).catch(() => {});
    }, () => {});
  }
  
  applyFilters() {
    let filtered = [...this.experts];
    
    // Filtre par recherche
    if (this.searchExpert) {
      const term = this.searchExpert.toLowerCase();
      filtered = filtered.filter(e => 
        e.nom.toLowerCase().includes(term) ||
        e.email.toLowerCase().includes(term) ||
        (e.domaines_expertise && e.domaines_expertise.toLowerCase().includes(term))
      );
    }
    
    // Filtre par domaine
    if (this.filterDomain !== 'all' && this.filterDomain) {
      filtered = filtered.filter(e => 
        e.domaines_expertise && e.domaines_expertise.toLowerCase().includes(this.filterDomain.toLowerCase())
      );
    }
    
    // Trier par score de crédibilité
    filtered.sort((a, b) => (b.score_credibilite || 0) - (a.score_credibilite || 0));
    
    this.filteredExperts = filtered;
    this.expertPage = 1; // Reset to first page when filters change
  }
  
  // Pagination helpers for articles
  get paginatedArticles() {
    const start = (this.articlePage - 1) * this.articlePageSize;
    const end = start + this.articlePageSize;
    return this.myArticles.slice(start, end);
  }
  
  get totalArticlePages() {
    return Math.ceil(this.myArticles.length / this.articlePageSize);
  }
  
  nextArticlePage() {
    if (this.articlePage < this.totalArticlePages) {
      this.articlePage++;
    }
  }
  
  prevArticlePage() {
    if (this.articlePage > 1) {
      this.articlePage--;
    }
  }
  
  // Pagination helpers for experts
  get paginatedExperts() {
    const start = (this.expertPage - 1) * this.expertPageSize;
    const end = start + this.expertPageSize;
    return this.filteredExperts.slice(start, end);
  }
  
  get totalExpertPages() {
    return Math.ceil(this.filteredExperts.length / this.expertPageSize);
  }
  
  nextExpertPage() {
    if (this.expertPage < this.totalExpertPages) {
      this.expertPage++;
    }
  }
  
  prevExpertPage() {
    if (this.expertPage > 1) {
      this.expertPage--;
    }
  }
  
  getUniqueDomains(): string[] {
    const domains = new Set<string>();
    this.experts.forEach(e => {
      if (e.domaines_expertise) {
        e.domaines_expertise.split(',').forEach((d: string) => {
          domains.add(d.trim());
        });
      }
    });
    return Array.from(domains);
  }
  
  submitToExpert() {
    if (!this.selectedArticleId || this.selectedExpertIds.length === 0) {
      alert('Veuillez sélectionner un article et au moins un expert');
      return;
    }
    if (this.selectedExpertIds.length > 5) {
      alert('Vous pouvez sélectionner au maximum 5 experts.');
      return;
    }

    // Validate expert selection set
    const invalid = this.selectedExpertIds.some(id => {
      const expert = this.experts.find(e => e.id_utilisateur === id);
      return !expert;
    });
    if (invalid) {
      alert('Expert invalide. Veuillez re-sélectionner les experts.');
      return;
    }

    const payloads = this.selectedExpertIds.map(id => ({
      id_article: Number(this.selectedArticleId),
      id_expert: Number(id),
      date_limite: this.dateLimite || null
    }));

    Promise.all(
      payloads.map(p => this.http.post('http://localhost:3000/api/assignations', p).toPromise())
    ).then(() => {
      alert('Article soumis aux experts sélectionnés');
      this.selectedArticleId = null;
      this.selectedExpertIds = [];
      this.dateLimite = '';
      this.currentStep = 0; // Retour à la liste des soumissions
      this.loadMyArticles();
      this.loadAssignations();
      this.showHistoryModal = true;
    }).catch(() => {
      alert('Erreur lors de la soumission');
    });
  }
  
  getSelectedArticle() {
    return this.myArticles.find(a => a.id_article === this.selectedArticleId);
  }
  
  getSelectedExperts() {
    return this.experts.filter(e => this.selectedExpertIds.includes(e.id_utilisateur));
  }

  isExpertSelected(expertId: number): boolean {
    return this.selectedExpertIds.includes(expertId);
  }

  toggleExpert(expertId: number) {
    if (this.isExpertSelected(expertId)) {
      this.selectedExpertIds = this.selectedExpertIds.filter(id => id !== expertId);
    } else {
      if (this.selectedExpertIds.length >= 5) {
        alert('Vous pouvez sélectionner au maximum 5 experts.');
        return;
      }
      this.selectedExpertIds = [...this.selectedExpertIds, expertId];
    }
  }
  
  getPdfUrl(filename: string | null): string {
    return filename ? `http://localhost:3000/uploads/${filename}` : '';
  }
  
  getAssignationsForArticle(articleId: number): any[] {
    return this.assignations.filter(a => a.id_article === articleId);
  }
  
  getExpertName(expertId: number): string {
    const expert = this.experts.find(e => e.id_utilisateur === expertId);
    return expert ? expert.nom : 'Expert inconnu';
  }
  
  getTotalAssignations(): number {
    return this.assignations.length;
  }
  
  getPendingReviews(): number {
    return this.assignations.filter(a => !a.date_review).length;
  }
  
  getCompletedReviews(): number {
    return this.assignations.filter(a => a.date_review).length;
  }

  // Multi-step form methods
  startNewSubmission() {
    this.currentStep = 1;
    this.selectedArticleId = null;
    this.selectedExpertIds = [];
    this.dateLimite = '';
    this.articlePage = 1;
    this.expertPage = 1;
  }

  cancelSubmission() {
    this.currentStep = 0;
    this.selectedArticleId = null;
    this.selectedExpertIds = [];
    this.dateLimite = '';
  }

  nextStep() {
    if (this.currentStep === 1 && !this.selectedArticleId) {
      alert('Veuillez sélectionner un article');
      return;
    }
    if (this.currentStep === 2 && this.selectedExpertIds.length === 0) {
      alert('Veuillez sélectionner au moins un expert');
      return;
    }
    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number) {
    this.currentStep = step;
  }

  // Pagination et groupement
  get paginatedAssignations() {
    const start = (this.assignationPage - 1) * this.assignationPageSize;
    const end = start + this.assignationPageSize;
    return this.assignations.slice(start, end);
  }

  get totalAssignationPages() {
    return Math.ceil(this.assignations.length / this.assignationPageSize);
  }

  nextAssignationPage() {
    if (this.assignationPage < this.totalAssignationPages) {
      this.assignationPage++;
    }
  }

  prevAssignationPage() {
    if (this.assignationPage > 1) {
      this.assignationPage--;
    }
  }

  get groupedAssignations() {
    if (this.groupBy === 'article') {
      return this.groupByArticle();
    } else if (this.groupBy === 'expert') {
      return this.groupByExpert();
    }
    return [];
  }

  groupByArticle() {
    const groups: any[] = [];
    const articleMap = new Map<number, any[]>();
    
    this.assignations.forEach(assign => {
      if (!articleMap.has(assign.id_article)) {
        articleMap.set(assign.id_article, []);
      }
      articleMap.get(assign.id_article)!.push(assign);
    });

    articleMap.forEach((assigns, articleId) => {
      groups.push({
        id: `article-${articleId}`,
        title: this.getArticleTitle(articleId),
        type: 'article',
        count: assigns.length,
        assignations: assigns
      });
    });

    return groups;
  }

  groupByExpert() {
    const groups: any[] = [];
    const expertMap = new Map<number, any[]>();
    
    this.assignations.forEach(assign => {
      if (!expertMap.has(assign.id_expert)) {
        expertMap.set(assign.id_expert, []);
      }
      expertMap.get(assign.id_expert)!.push(assign);
    });

    expertMap.forEach((assigns, expertId) => {
      groups.push({
        id: `expert-${expertId}`,
        title: this.getExpertName(expertId),
        type: 'expert',
        count: assigns.length,
        assignations: assigns
      });
    });

    return groups;
  }

  toggleGroup(groupId: string) {
    if (this.expandedGroups.has(groupId)) {
      this.expandedGroups.delete(groupId);
    } else {
      this.expandedGroups.add(groupId);
    }
  }

  isGroupExpanded(groupId: string): boolean {
    return this.expandedGroups.has(groupId);
  }

  getAssignationCountByStatus(status: string): number {
    const key = this.normalizeStatut(status);
    return this.assignations.filter(a => this.normalizeStatut(a.statut_assignation) === key).length;
  }

  getReviewsTotal(): number {
    return this.assignations.filter(a => !!a.date_review).length;
  }

  getReviewsInProgress(): number {
    return this.assignations.filter(a => !a.date_review && !['annulee', 'refuse'].includes(this.normalizeStatut(a.statut_assignation))).length;
  }

  getReviewsCancelled(): number {
    return this.assignations.filter(a => ['annulee', 'refuse'].includes(this.normalizeStatut(a.statut_assignation))).length;
  }
  
  getArticleTitle(articleId: number): string {
    const article = this.myArticles.find(a => a.id_article === articleId);
    return article ? article.titre : 'Article';
  }

  normalizeStatut(statut: string): string {
    return (statut || '').toString().trim().toLowerCase();
  }

  getStatutColor(statut: string): string {
    const key = this.normalizeStatut(statut);
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

  getStatutLabel(statut: string): string {
    const key = this.normalizeStatut(statut);
    const labels: any = {
      'en_attente': 'En attente',
      'en_cours': 'En cours',
      'termine': 'Terminée',
      'annulee': 'Annulée',
      'refuse': 'Refusée',
      'urgentes': 'Urgente',
      'en_retard': 'En retard'
    };
    return labels[key] || statut || '—';
  }

  getSubmissionDate(assign: any): any {
    return assign?.article_date_soumission || assign?.date_assignation || null;
  }
}
