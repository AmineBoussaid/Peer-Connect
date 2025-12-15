import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-manage-experts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './manage-experts.html',
  styleUrl: './manage-experts.css',
})
export class ManageExpertsComponent {
  experts: any[] = [];
  filteredExperts: any[] = [];
  searchTerm = '';
  filterDisponibilite: string = 'all';
  sortBy: string = 'score';
  editingScore: number | null = null;
  newScore = 0;
  isLoading = true;
  
  constructor(private http: HttpClient) {}
  
  ngOnInit() {
    this.loadExperts();
  }
  
  loadExperts() {
    this.http.get<any[]>('http://localhost:3000/api/experts/all').subscribe(experts => {
      this.experts = experts;
      this.applyFilters();
      this.isLoading = false;
    }, () => {
      this.isLoading = false;
    });
  }
  
  applyFilters() {
    let filtered = [...this.experts];
    
    // Filtre par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        e.nom.toLowerCase().includes(term) ||
        e.email.toLowerCase().includes(term) ||
        (e.domaines_expertise && e.domaines_expertise.toLowerCase().includes(term))
      );
    }
    
    // Filtre par disponibilité
    if (this.filterDisponibilite === 'available') {
      filtered = filtered.filter(e => e.disponibilite === 1);
    } else if (this.filterDisponibilite === 'unavailable') {
      filtered = filtered.filter(e => e.disponibilite === 0);
    }
    
    // Tri
    if (this.sortBy === 'score') {
      filtered.sort((a, b) => (b.score_credibilite || 0) - (a.score_credibilite || 0));
    } else if (this.sortBy === 'name') {
      filtered.sort((a, b) => a.nom.localeCompare(b.nom));
    } else if (this.sortBy === 'reviews') {
      filtered.sort((a, b) => (b.nb_reviews || 0) - (a.nb_reviews || 0));
    }
    
    this.filteredExperts = filtered;
  }
  
  toggleDisponibilite(expert: any) {
    const newDispo = expert.disponibilite === 1 ? 0 : 1;
    this.http.put(`http://localhost:3000/api/experts/${expert.id_utilisateur}/disponibilite`, 
      { disponibilite: newDispo }
    ).subscribe(() => {
      expert.disponibilite = newDispo;
    });
  }
  
  startEditScore(expert: any) {
    this.editingScore = expert.id_utilisateur;
    this.newScore = expert.score_credibilite || 0;
  }
  
  saveScore(expert: any) {
    this.http.put(`http://localhost:3000/api/experts/${expert.id_utilisateur}/score`,
      { score_credibilite: this.newScore }
    ).subscribe(() => {
      expert.score_credibilite = this.newScore;
      this.editingScore = null;
      this.applyFilters();
    });
  }
  
  cancelEditScore() {
    this.editingScore = null;
  }
  
  getAvailableCount(): number {
    return this.experts.filter(e => e.disponibilite === 1).length;
  }

  getCvUrl(cv: string): string {
    if (!cv) return '';
    // If CV already starts with /uploads/, use it as is
    if (cv.startsWith('/uploads/')) {
      return `http://localhost:3000${cv}`;
    }
    // Otherwise, add /uploads/ prefix
    return `http://localhost:3000/uploads/${cv}`;
  }
}
