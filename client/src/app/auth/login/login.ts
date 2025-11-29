import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  constructor(private router: Router) {}

  goTo(role: string) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('role', role);
    }
    // Naviguer puis recharger pour mettre à jour le header
    this.router.navigate([`/${role}`]).then(() => {
      window.location.reload();
    });
  }
}
