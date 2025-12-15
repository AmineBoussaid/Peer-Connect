import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-auteur-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class AuteurProfileComponent {
  user: any = null;
  articlesCount = 0;

  constructor(private http: HttpClient, private storage: StorageService) {}

  ngOnInit() {
    this.user = this.storage.getUser();
    if (this.user?.id_utilisateur) {
      this.loadStats();
    }
  }

  loadStats() {
    const id = this.user.id_utilisateur;
    this.http.get<any[]>(`http://localhost:3000/api/auteurs/${id}/articles`).subscribe({ 
      next: d => {
        this.articlesCount = d.length;
      },
      error: () => {}
    });
  }
}
