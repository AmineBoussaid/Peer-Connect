import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { NgIf, TitleCasePipe } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf, TitleCasePipe],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {

  role: string | null = null;

  constructor(private router: Router) {
    // Écouter les changements de route pour mettre à jour le rôle
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateRole();
    });
  }

  ngOnInit() {
    this.updateRole();
  }

  private updateRole() {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.role = localStorage.getItem('role');
    }
  }

  logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('role');
    }
    this.role = null;
    this.router.navigate(['/login']);
  }
}
