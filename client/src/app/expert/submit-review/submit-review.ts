import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-submit-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './submit-review.html',
  styleUrl: './submit-review.css',
})
export class SubmitReviewComponent {
  assignment: any = null;
  existingReview: any = null;
  isEditMode = false;
  
  form = {
    commentaires: '',
    recommandation: '',
    score_qualite: 0,
    score_originalite: 0,
    score_clarte: 0
  };
  
  // Critères d'évaluation détaillés
  criteriaQualite = [
    { value: 5, label: 'Excellent', description: 'Méthodologie rigoureuse, résultats solides' },
    { value: 4, label: 'Très bon', description: 'Bonne qualité avec quelques points à améliorer' },
    { value: 3, label: 'Bon', description: 'Qualité acceptable, améliorations nécessaires' },
    { value: 2, label: 'Moyen', description: 'Qualité insuffisante, révisions importantes' },
    { value: 1, label: 'Faible', description: 'Qualité très insuffisante' }
  ];
  
  criteriaOriginalite = [
    { value: 5, label: 'Très original', description: 'Approche innovante et unique' },
    { value: 4, label: 'Original', description: 'Bonnes contributions originales' },
    { value: 3, label: 'Modérément original', description: 'Quelques aspects originaux' },
    { value: 2, label: 'Peu original', description: 'Manque d\'originalité' },
    { value: 1, label: 'Non original', description: 'Aucune contribution originale' }
  ];
  
  criteriaClarte = [
    { value: 5, label: 'Très clair', description: 'Excellente rédaction et structure' },
    { value: 4, label: 'Clair', description: 'Bonne clarté globale' },
    { value: 3, label: 'Assez clair', description: 'Clarté acceptable' },
    { value: 2, label: 'Peu clair', description: 'Difficultés de compréhension' },
    { value: 1, label: 'Confus', description: 'Très difficile à comprendre' }
  ];
  
  constructor(
    private http: HttpClient, 
    private route: ActivatedRoute,
    private router: Router,
    private storage: StorageService
  ) {}
  
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const idAssignation = params['id_assignation'];
      const idArticle = params['id_article'];
      
      if (idAssignation && idArticle) {
        this.loadAssignment(idAssignation);
        this.checkExistingReview(idAssignation);
      }
    });
  }
  
  loadAssignment(idAssignation: number) {
    const expertId = this.getExpertId();
    if (!expertId) {
      return;
    }
    
    this.http.get<any[]>(`http://localhost:3000/api/assignations/by-expert?id_expert=${expertId}`).subscribe(assignments => {
      this.assignment = assignments.find(a => a.id_assignation == idAssignation);
    }, () => {});
  }
  
  checkExistingReview(idAssignation: number) {
    this.http.get<any>(`http://localhost:3000/api/reviews/by-assignation?id_assignation=${idAssignation}`).subscribe({
      next: (review) => {
        this.existingReview = review;
        this.isEditMode = true;
        this.form = {
          commentaires: review.commentaires || '',
          recommandation: review.recommandation || '',
          score_qualite: review.score_qualite || 0,
          score_originalite: review.score_originalite || 0,
          score_clarte: review.score_clarte || 0
        };
      },
      error: () => {
        this.isEditMode = false;
      }
    });
  }
  
  getExpertId(): number | null {
    return this.storage.getUserId();
  }
  
  submitReview() {
    if (!this.assignment) return;
    
    console.log('Form before submission:', {
      commentaires: this.form.commentaires?.substring(0, 20),
      recommandation: this.form.recommandation,
      score_qualite: this.form.score_qualite,
      score_originalite: this.form.score_originalite,
      score_clarte: this.form.score_clarte
    });
    
    if (!this.form.commentaires || !this.form.recommandation) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    const payload = {
      id_assignation: this.assignment.id_assignation,
      id_article: this.assignment.id_article,
      id_expert: this.getExpertId(),
      commentaires: this.form.commentaires,
      recommandation: this.form.recommandation,
      note_globale: this.getAverageScore(),
      score_qualite: this.form.score_qualite || null,
      score_originalite: this.form.score_originalite || null,
      score_clarte: this.form.score_clarte || null
    };
    
    if (this.isEditMode && this.existingReview) {
      // Mise à jour
      this.http.put(`http://localhost:3000/api/reviews/${this.existingReview.id_review}`, payload).subscribe({
        next: () => {
          alert('Review mise à jour avec succès');
          this.router.navigate(['/expert/assignments']);
        },
        error: () => {
          alert('Erreur lors de la mise à jour');
        }
      });
    } else {
      // Création
      console.log('Submitting payload:', payload);
      this.http.post('http://localhost:3000/api/reviews', payload).subscribe({
        next: (response) => {
          console.log('Review submitted successfully:', response);
          alert('Review soumise avec succès');
          this.router.navigate(['/expert/assignments']);
        },
        error: (error) => {
          console.error('Error submitting review:', error);
          const errorMsg = error?.error?.message || 'Erreur lors de la soumission';
          alert('Erreur: ' + errorMsg);
        }
      });
    }
  }
  
  cancel() {
    this.router.navigate(['/expert/assignments']);
  }
  
  getPdfUrl(filename: string | null): string {
    return filename ? `http://localhost:3000/uploads/${filename}` : '';
  }
  
  getAverageScore(): number {
    const scores = [this.form.score_qualite, this.form.score_originalite, this.form.score_clarte];
    const validScores = scores.filter(s => s > 0);
    if (validScores.length === 0) return 0;
    return validScores.reduce((a, b) => a + b, 0) / validScores.length;
  }
  
  getScoreColor(score: number): string {
    if (score >= 4.5) return '#28a745';
    if (score >= 3.5) return '#17a2b8';
    if (score >= 2.5) return '#ffc107';
    if (score >= 1.5) return '#fd7e14';
    return '#dc3545';
  }
  
  getRecommendationColor(recommandation: string): string {
    const colors: any = {
      'accepter': '#28a745',
      'reviser': '#ffc107',
      'rejeter': '#dc3545'
    };
    return colors[recommandation] || '#6c757d';
  }

  getRecommendationLabel(recommandation: string): string {
    const labels: any = {
      'accepter': 'Accepter',
      'reviser': 'Réviser',
      'rejeter': 'Rejeter'
    };
    return labels[recommandation] || recommandation;
  }
}
