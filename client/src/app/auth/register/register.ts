import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  nom = '';
  email = '';
  password = '';
  role: 'auteur' | 'expert' = 'auteur';

  constructor(private router: Router, private http: HttpClient) {}

  register() {
    const payload = { nom: this.nom, email: this.email, password: this.password, role: this.role };
    this.http.post<any>('http://localhost:3000/api/auth/register', payload).subscribe({
      next: (user) => {
        alert('Compte créé avec succès. Vous pouvez vous connecter.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        alert(err?.error?.message || 'Erreur lors de la création du compte');
      }
    });
  }

  goLogin() {
    this.router.navigate(['/login']);
  }
}
