import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-workflow',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './workflow.html',
  styleUrl: './workflow.css',
})
export class WorkflowComponent {
  assignments: any[] = [];
  filteredAssignments: any[] = [];
  searchTerm = '';
  filterStatut: string = 'all';
  sortBy: string = 'date';
  page = 1;
  pageSize = 6;

  statutOptions = [
    { value: 'en_attente', label: 'En attente' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'termine', label: 'Terminée' },
    { value: 'annulee', label: 'Annulée' },
    { value: 'refuse', label: 'Refusée' },
    { value: 'urgentes', label: 'Urgente' },
    { value: 'en_retard', label: 'En retard' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAssignments();
  }

  loadAssignments() {
    this.http.get<any[]>('http://localhost:3000/api/assignations/all').subscribe(rows => {
      this.assignments = rows || [];
      this.applyFilters();
    }, () => {});
  }

  applyFilters() {
    let filtered = [...this.assignments];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        (a.article_titre && a.article_titre.toLowerCase().includes(term)) ||
        (a.auteur_nom && a.auteur_nom.toLowerCase().includes(term)) ||
        (a.expert_nom && a.expert_nom.toLowerCase().includes(term)) ||
        (a.article_resume && a.article_resume.toLowerCase().includes(term))
      );
    }

    if (this.filterStatut !== 'all') {
      filtered = filtered.filter(a => (a.statut_assignation || '').toLowerCase() === this.filterStatut);
    }

    if (this.sortBy === 'date') {
      filtered.sort((a, b) => {
        const ad = a.article_date_soumission ? new Date(a.article_date_soumission).getTime() : -Infinity;
        const bd = b.article_date_soumission ? new Date(b.article_date_soumission).getTime() : -Infinity;
        return bd - ad;
      });
    } else if (this.sortBy === 'title') {
      filtered.sort((a, b) => (a.article_titre || '').localeCompare(b.article_titre || ''));
    } else if (this.sortBy === 'author') {
      filtered.sort((a, b) => (a.auteur_nom || '').localeCompare(b.auteur_nom || ''));
    }

    this.filteredAssignments = filtered;
    this.page = 1;
  }

  get paginatedAssignments(): any[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredAssignments.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredAssignments.length / this.pageSize));
  }

  nextPage(): void {
    if (this.page < this.totalPages) this.page += 1;
  }

  prevPage(): void {
    if (this.page > 1) this.page -= 1;
  }

  getPdfUrl(filename: string | null): string {
    return filename ? `http://localhost:3000/uploads/${filename}` : '';
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

  getAssignmentCountByStatut(statut: string): number {
    return this.assignments.filter(a => (a.statut_assignation || '').toLowerCase() === statut).length;
  }
}
