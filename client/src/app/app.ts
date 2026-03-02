import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  constructor(private router: Router) {}

  isDashboardRoute(): boolean {
    const path = this.router.url.split('?')[0];
    return path.startsWith('/admin') || path.startsWith('/auteur') || path.startsWith('/expert');
  }
}
