import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { NgIf } from '@angular/common';
import { filter } from 'rxjs/operators';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {

  role: string | null = null;
  mobileOpen = false;
  userName: string | null = null;

  constructor(private router: Router, private storage: StorageService) {
    // Écouter les changements de route pour mettre à jour le rôle
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateRole();
      // Close mobile menu on navigation
      this.mobileOpen = false;
    });
  }

  ngOnInit() {
    this.updateRole();
  }

  private updateRole() {
    this.role = this.storage.getItem('role');
    const user = this.storage.getUser();
    this.userName = user?.nom || null;
  }

  logout() {
    this.storage.removeItem('role');
    this.storage.clearUser();
    this.role = null;
    this.userName = null;
    this.router.navigate(['/login']);
  }

  toggleMobile() {
    this.mobileOpen = !this.mobileOpen;
  }

  getActiveClasses() {
    // Return role-colored underline for active links
    switch (this.role) {
      case 'auteur':
        return ['active', 'border-emerald-600', 'text-emerald-700'];
      case 'expert':
        return ['active', 'border-cyan-600', 'text-cyan-700'];
      case 'admin':
        return ['active', 'border-indigo-600', 'text-indigo-700'];
      default:
        return ['active', 'border-gray-600', 'text-gray-700'];
    }
  }
}
