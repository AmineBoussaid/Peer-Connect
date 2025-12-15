import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-expert-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ExpertProfileComponent {
  user: any = null;
  reviewsCount = 0;
  assignmentsCount = 0;
  cv: string | null = null;
  uploading = false;
  selectedFile: File | null = null;
  
  // Domains expertise
  expertData: any = null;
  editingDomains = false;
  selectedDomains: string[] = [];
  availableDomains = [
    'Intelligence Artificielle',
    'Machine Learning',
    'Deep Learning',
    'Réseaux de Neurones',
    'Traitement du Langage Naturel',
    'Computer Vision',
    'Big Data',
    'Data Science',
    'IoT',
    'Blockchain',
    'Cybersécurité',
    'Cloud Computing',
    'DevOps',
    'Microservices',
    'Robotique',
    'Réalité Virtuelle',
    'Réalité Augmentée',
    'Apprentissage par Renforcement',
    'Analyse Prédictive',
    'Bioinformatique'
  ];

  constructor(private http: HttpClient, private storage: StorageService) {}

  ngOnInit() {
    this.user = this.storage.getUser();
    if (this.user?.id_utilisateur) {
      this.loadStats();
      this.loadCv();
    }
  }

  loadStats() {
    const id = this.user.id_utilisateur;
    this.http.get<any[]>(`http://localhost:3000/api/experts/${id}/reviews`).subscribe({ 
      next: d => {
        this.reviewsCount = d.length;
      },
      error: () => {}
    });
    this.http.get<any[]>(`http://localhost:3000/api/assignations/by-expert?id_expert=${id}`).subscribe({ 
      next: d => {
        this.assignmentsCount = d.length;
      },
      error: () => {}
    });
  }

  loadCv() {
    const id = this.user.id_utilisateur;
    this.http.get<any>(`http://localhost:3000/api/experts/${id}`).subscribe({
      next: (me) => {
        this.expertData = me;
        this.cv = me?.cv ? `http://localhost:3000${me.cv}` : null;
        // Parse domaines_expertise
        if (me?.domaines_expertise) {
          this.selectedDomains = me.domaines_expertise.split(',').map((d: string) => d.trim()).filter((d: string) => d);
        } else {
          this.selectedDomains = [];
        }
      },
      error: () => {}
    });
  }

  onCvSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.selectedFile = input.files[0];
  }

  saveCv() {
    if (!this.selectedFile) { alert('Veuillez choisir un fichier CV'); return; }
    const formData = new FormData();
    formData.append('cv', this.selectedFile);
    this.uploading = true;
    const id = this.user.id_utilisateur;
    this.http.post<any>(`http://localhost:3000/api/experts/${id}/cv`, formData).subscribe({
      next: (res) => {
        this.uploading = false;
        this.selectedFile = null;
        this.loadCv();
      },
      error: () => { alert('Erreur import CV'); this.uploading = false; }
    });
  }

  toggleDomainSelection(domain: string) {
    const index = this.selectedDomains.indexOf(domain);
    if (index > -1) {
      this.selectedDomains.splice(index, 1);
    } else {
      this.selectedDomains.push(domain);
    }
  }

  isDomainSelected(domain: string): boolean {
    return this.selectedDomains.includes(domain);
  }

  startEditingDomains() {
    this.editingDomains = true;
  }

  cancelEditingDomains() {
    this.editingDomains = false;
    if (this.expertData?.domaines_expertise) {
      this.selectedDomains = this.expertData.domaines_expertise.split(',').map((d: string) => d.trim()).filter((d: string) => d);
    } else {
      this.selectedDomains = [];
    }
  }

  saveDomains() {
    const id = this.user.id_utilisateur;
    const domainsString = this.selectedDomains.join(', ');
    
    this.http.put(`http://localhost:3000/api/experts/${id}/domains`, { domaines_expertise: domainsString }).subscribe({
      next: () => {
        alert('Domaines d\'expertise mis à jour avec succès');
        this.editingDomains = false;
        this.loadCv();
      },
      error: () => {
        alert('Erreur lors de la mise à jour des domaines');
      }
    });
  }
}
