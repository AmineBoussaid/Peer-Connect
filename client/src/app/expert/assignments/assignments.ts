import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assignments.html',
  styleUrl: './assignments.css',
})
export class AssignmentsComponent {
  assignments: any[] = [];
  filteredAssignments: any[] = [];
  searchTerm = '';
  filterStatut = 'all';
  filterUrgence = 'all';
  sortBy = 'date';
  viewMode: 'cards' | 'table' = 'cards';
  selectedAssignment: any = null;
  Math = Math; // Pour utiliser Math dans le template
  
  constructor(
    private http: HttpClient, 
    private router: Router,
    private storage: StorageService
  ) {}
  
  ngOnInit() {
    this.loadAssignments();
  }
  
  getExpertId(): number | null {
    return this.storage.getUserId();
  }
  
  loadAssignments() {
    const id = this.getExpertId();
    if (!id) {
      console.error('Expert ID not found. User data:', this.storage.getUser());
      this.assignments = [];
      this.applyFilters();
      return;
    }
    
    this.http.get<any[]>(`http://localhost:3000/api/assignations/by-expert?id_expert=${id}`).subscribe({
      next: (assignments) => {
        this.assignments = (assignments || []).map(a => ({
          ...a,
          statut_normalized: this.normalizeStatut(a.statut_assignation)
        }));
        this.applyFilters();
      },
      error: () => {
        this.applyFilters();
      }
    });
  }
  
  applyFilters() {
    let filtered = [...this.assignments];
    
    // Filtre par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.article_titre.toLowerCase().includes(term) ||
        a.auteur_nom.toLowerCase().includes(term) ||
        (a.article_mots_cles && a.article_mots_cles.toLowerCase().includes(term))
      );
    }
    
    // Filtre par statut
    if (this.filterStatut !== 'all') {
      filtered = filtered.filter(a => a.statut_normalized === this.filterStatut);
    }
    
    // Filtre par urgence
    if (this.filterUrgence === 'urgent') {
      const today = new Date();
      const threeDays = 3 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter(a => {
        if (!a.date_limite) return false;
        const deadline = new Date(a.date_limite);
        return (deadline.getTime() - today.getTime()) <= threeDays && deadline.getTime() > today.getTime();
      });
    } else if (this.filterUrgence === 'overdue') {
      const today = new Date();
      filtered = filtered.filter(a => {
        if (!a.date_limite) return false;
        return new Date(a.date_limite).getTime() < today.getTime() && a.statut_assignation !== 'completee';
      });
    }
    
    // Tri
    if (this.sortBy === 'date') {
      filtered.sort((a, b) => {
        const ad = a.article_date_soumission ? new Date(a.article_date_soumission).getTime() : -Infinity;
        const bd = b.article_date_soumission ? new Date(b.article_date_soumission).getTime() : -Infinity;
        return bd - ad;
      });
    } else if (this.sortBy === 'deadline') {
      filtered.sort((a, b) => {
        if (!a.date_limite) return 1;
        if (!b.date_limite) return -1;
        return new Date(a.date_limite).getTime() - new Date(b.date_limite).getTime();
      });
    } else if (this.sortBy === 'title') {
      filtered.sort((a, b) => a.article_titre.localeCompare(b.article_titre));
    }
    
    this.filteredAssignments = filtered;
  }
  
  getTotalAssignments(): number {
    return this.assignments.length;
  }
  
  getPendingAssignments(): number {
    return this.assignments.filter(a => a.statut_normalized === 'en_attente').length;
  }
  
  getInProgressAssignments(): number {
    return this.assignments.filter(a => ['en_cours', 'urgentes', 'en_retard'].includes(a.statut_normalized)).length;
  }
  
  getCompletedAssignments(): number {
    return this.assignments.filter(a => a.statut_normalized === 'termine').length;
  }
  
  getUrgentAssignments(): number {
    const today = new Date();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    return this.assignments.filter(a => {
      if (!a.date_limite || a.statut_normalized === 'termine') return false;
      const deadline = new Date(a.date_limite);
      return (deadline.getTime() - today.getTime()) <= threeDays && deadline.getTime() > today.getTime();
    }).length;
  }
  
  getOverdueAssignments(): number {
    const today = new Date();
    return this.assignments.filter(a => {
      if (!a.date_limite || a.statut_normalized === 'termine') return false;
      return new Date(a.date_limite).getTime() < today.getTime();
    }).length;
  }
  
  getUrgencyClass(assignment: any): string {
    if (!assignment.date_limite || assignment.statut_normalized === 'termine') return '';
    const today = new Date();
    const deadline = new Date(assignment.date_limite);
    const daysLeft = (deadline.getTime() - today.getTime()) / (24 * 60 * 60 * 1000);
    
    if (daysLeft < 0) return 'overdue';
    if (daysLeft <= 3) return 'urgent';
    return 'normal';
  }
  
  getDaysLeft(dateLimit: string): number {
    if (!dateLimit) return 999;
    const today = new Date();
    const deadline = new Date(dateLimit);
    return Math.ceil((deadline.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  }
  
  updateStatut(assignment: any, newStatut: string) {
    this.http.put(`http://localhost:3000/api/assignations/${assignment.id_assignation}/statut`,
      { statut_assignation: newStatut }
    ).subscribe(() => {
      assignment.statut_assignation = newStatut;
      assignment.statut_normalized = this.normalizeStatut(newStatut);
      this.applyFilters();
    });
  }
  
  goToReview(assignment: any) {
    // Check if a review exists; if 404, navigate to create form
    this.http.get<any>(`http://localhost:3000/api/reviews/by-assignation?id_assignation=${assignment.id_assignation}`).subscribe({
      next: () => {
        // Review exists: go to view/edit
        this.router.navigate(['/expert/submit-review'], { 
          queryParams: { 
            id_assignation: assignment.id_assignation,
            id_article: assignment.id_article,
            mode: 'view'
          } 
        });
      },
      error: (err) => {
        // 404 means no review yet: go to create
        this.router.navigate(['/expert/submit-review'], { 
          queryParams: { 
            id_assignation: assignment.id_assignation,
            id_article: assignment.id_article,
            mode: 'create'
          } 
        });
      }
    });
  }
  
  viewArticleDetails(assignment: any) {
    this.selectedAssignment = assignment;
  }
  
  closeDetails() {
    this.selectedAssignment = null;
  }
  
  getPdfUrl(filename: string | null): string {
    return filename ? `http://localhost:3000/uploads/${filename}` : '';
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

  normalizeStatut(statut: string): string {
    return (statut || '').toString().trim().toLowerCase().replace(/\s+/g, '_');
  }

  getSubmissionDate(assign: any): any {
    return assign?.article_date_soumission || assign?.date_soumission || assign?.date_assignation || null;
  }
}
