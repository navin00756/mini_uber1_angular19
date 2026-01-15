import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AdminService {

  private base = 'http://localhost:5000/api/admin';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  getUsers() {
    return this.http.get<any[]>(`${this.base}/users`, this.getHeaders());
  }

  getRiders() {
    return this.http.get<any[]>(`${this.base}/riders`, this.getHeaders());
  }

  getDrivers() {
    return this.http.get<any[]>(`${this.base}/drivers`, this.getHeaders());
  }
}
