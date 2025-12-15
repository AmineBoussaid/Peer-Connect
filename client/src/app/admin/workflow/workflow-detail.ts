import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-workflow-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './workflow-detail.html',
  styleUrl: './workflow-detail.css'
})
export class WorkflowDetailComponent {
  assignation: any = null;
  reviews: any[] = [];
  isLoading = true;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    this.loadDetail();
  }

  loadDetail() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<any>(`http://localhost:3000/api/assignations/${id}/detail`).subscribe(data => {
        console.log('Assignation detail response:', data);
        this.assignation = data?.assignment || data?.assignation || null;
        this.reviews = data?.reviews || [];
        this.isLoading = false;
      }, (error) => { 
        console.error('Error loading assignation detail:', error);
        this.isLoading = false; 
      });
    } else {
      this.isLoading = false;
    }
  }

  refresh() {
    this.isLoading = true;
    this.loadDetail();
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
      'en_retard': '#ff6f00',
      // Review recommandations
      'accepter': '#28a745',
      'reviser': '#ffc107',
      'rejeter': '#dc3545'
    };
    return colors[key] || '#6c757d';
  }

  getPdfUrl(filename: string | null): string {
    return filename ? `http://localhost:3000/uploads/${filename}` : '';
  }
}
