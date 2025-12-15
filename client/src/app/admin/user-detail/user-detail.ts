import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-user-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-detail.html',
  styleUrls: ['./user-detail.css']
})
export class AdminUserDetailComponent {
  userId: number | null = null;
  user: any = null;
  articles: any[] = [];
  reviews: any[] = [];
  assignments: any[] = [];
  isLoading = true;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userId = params['id'];
      if (this.userId) {
        this.load();
      }
    });
  }

  load() {
    this.isLoading = true;
    // Fetch user info
    this.http.get<any>(`http://localhost:3000/api/admin/user/${this.userId}`).subscribe({
      next: (data) => {
        this.user = data;
        // Fetch role-specific data
        if (this.user.role === 'auteur') {
          this.loadArticles();
        } else if (this.user.role === 'expert') {
          this.loadAssignments();
          this.loadReviews();
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        alert('Erreur lors du chargement de l\'utilisateur');
        this.isLoading = false;
      }
    });
  }

  loadArticles() {
    this.http.get<any[]>(`http://localhost:3000/api/auteurs/${this.userId}/articles`).subscribe({
      next: (data) => {
        this.articles = data;
        this.isLoading = false;
      },
      error: () => {
        this.articles = [];
        this.isLoading = false;
      }
    });
  }

  loadReviews() {
    this.http.get<any[]>(`http://localhost:3000/api/experts/${this.userId}/reviews`).subscribe({
      next: (data) => {
        this.reviews = data;
        this.isLoading = false;
      },
      error: () => {
        this.reviews = [];
        this.isLoading = false;
      }
    });
  }

  loadAssignments() {
    this.http.get<any[]>(`http://localhost:3000/api/assignations/by-expert?id_expert=${this.userId}`).subscribe({
      next: (data) => {
        this.assignments = data || [];
      },
      error: () => {
        this.assignments = [];
      }
    });
  }

  getPdfUrl(filename: string | null): string {
    if (!filename) return '';
    // If CV already starts with /uploads/, use it as is
    if (filename.startsWith('/uploads/')) {
      return `http://localhost:3000${filename}`;
    }
    // Otherwise, add /uploads/ prefix
    return `http://localhost:3000/uploads/${filename}`;
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

  getAssignmentsCount(): number {
    return this.assignments.length;
  }

  getEnCoursCount(): number {
    return this.assignments.filter(a => (a.statut_assignation || '').toLowerCase() === 'en_cours').length;
  }

  getTermineesCount(): number {
    return this.assignments.filter(a => (a.statut_assignation || '').toLowerCase() === 'termine').length;
  }

  goBack() {
    this.router.navigate(['/admin/users']);
  }

  refresh() {
    if (this.userId) {
      this.load();
    }
  }
}
