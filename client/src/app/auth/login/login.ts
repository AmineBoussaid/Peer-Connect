import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private router: Router, private http: HttpClient, private storage: StorageService) {}

  login() {
    const payload = { email: this.email.trim().toLowerCase(), password: this.password.trim() };
    this.http.post<any>('http://localhost:3000/api/auth/login', payload).subscribe({
      next: (user) => {
        const role = user.role;
        this.storage.setItem('role', role);
        this.storage.setUser(user);
        this.router.navigate([`/${role}`]).then(() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        });
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 0) {
          alert('Serveur backend injoignable. Vérifiez que le serveur tourne sur http://localhost:3000.');
          return;
        }

        if (error.status === 401) {
          alert('Identifiants invalides');
          return;
        }

        alert(error.error?.message || 'Erreur serveur pendant la connexion');
      }
    });
  }
}
