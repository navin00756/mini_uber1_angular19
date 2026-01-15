import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  mode: 'login' | 'register' = 'login';

  form = {
    name: '',
    email: '',
    password: '',
    role: 'rider'
  };

  base = 'https://uber-clone-1-kqum.onrender.com/api/auth';

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {}

  toggleMode() {
    this.mode = this.mode === 'login' ? 'register' : 'login';
  }

  submit() {
    this.mode === 'login' ? this.login() : this.register();
  }

  register() {
    this.http.post<any>(`${this.base}/register`, this.form).subscribe({
      next: (res) => {
        this.auth.setLogin(res.token, res.user);
        alert(`Registered as ${res.user.role.toUpperCase()}`);
        this.redirectByRole(res.user.role);
      },
      error: (err) => alert(err.error?.message || 'Registration failed')
    });
  }

  login() {
    this.http.post<any>(`${this.base}/login`, {
      email: this.form.email,
      password: this.form.password
    }).subscribe({
      next: (res) => {
        this.auth.setLogin(res.token, res.user);
        alert(`Logged in as ${res.user.role.toUpperCase()}`);
        this.redirectByRole(res.user.role);
      },
      error: (err) => alert(err.error?.message || 'Login failed')
    });
  }

  redirectByRole(role: string) {
    if (role === 'driver') this.router.navigate(['/driver']);
    else if (role === 'admin') this.router.navigate(['/admin']);
    else this.router.navigate(['/rider']);
  }
}
