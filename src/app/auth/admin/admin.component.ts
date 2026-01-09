import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { Observable } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-admin',
  imports: [CommonModule],
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {

  tab: 'users' | 'riders' | 'drivers' = 'users';
  data: any[] = [];
  loading = false;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.tab = 'users';
    this.fetch(this.adminService.getUsers());
  }

  loadRiders() {
    this.tab = 'riders';
    this.fetch(this.adminService.getRiders());
  }

  loadDrivers() {
    this.tab = 'drivers';
    this.fetch(this.adminService.getDrivers());
  }

  fetch(obs: Observable<any[]>) {
    this.loading = true;

    obs.subscribe({
      next: (res: any[]) => {   // ✅ FIXED
        this.data = res;
        this.loading = false;
      },
      error: () => {
        alert('Unauthorized / Session expired');
        this.logout();
      }
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
