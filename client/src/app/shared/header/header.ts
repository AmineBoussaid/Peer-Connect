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
    return ['active', 'bg-primary-100', 'text-primary-800', 'ring-1', 'ring-primary-200'];
  }
}
