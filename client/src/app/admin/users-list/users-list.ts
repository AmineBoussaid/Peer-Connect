import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-list.html',
  styleUrls: ['./users-list.css']
})
export class AdminUsersListComponent {
  users: Array<any> = [];
  filter = '';
  roleFilter = 'all';
  isLoading = true;
  page = 1;
  pageSize = 8;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.http.get<any[]>('http://localhost:3000/api/admin/users').subscribe({
      next: (rows) => {
        this.users = rows;
        this.isLoading = false;
      },
      error: () => {
        alert('Erreur lors du chargement des utilisateurs');
        this.isLoading = false;
      }
    });
  }

  get filtered() {
    let result = this.users.filter(u =>
      !this.filter || (u.nom?.toLowerCase().includes(this.filter.toLowerCase()) || u.email?.toLowerCase().includes(this.filter.toLowerCase()))
    );
    
    if (this.roleFilter !== 'all') {
      result = result.filter(u => u.role === this.roleFilter);
    }
    
    this.page = 1;
    return result;
  }

  get paginatedUsers() {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  nextPage() {
    if (this.page < this.totalPages) this.page++;
  }

  prevPage() {
    if (this.page > 1) this.page--;
  }

  viewDetails(userId: number) {
    this.router.navigate([`/admin/user/${userId}`]);
  }
}
