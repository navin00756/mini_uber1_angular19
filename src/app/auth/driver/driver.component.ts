import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-driver',
  imports: [CommonModule],
  templateUrl: './driver.component.html'
})
export class DriverComponent implements OnInit {

  rides: any[] = [];
  base = 'http://localhost:5000/api/rides';
  driverId = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.driverId = JSON.parse(localStorage.getItem('user') || '{}')._id;
    this.loadRides();
  }

loadRides() {
  this.http.get<any>(`${this.base}/requested`)
    .subscribe(res1 => {

      this.http.get<any>(`${this.base}/driver/${this.driverId}`)
        .subscribe(res2 => {

          this.rides = [
            ...(res2.data || []),
            ...(res1.data || [])
          ];
        });
    });
}


  acceptRide(rideId: string) {
    this.http.post(`${this.base}/assign/${rideId}`, { driverId: this.driverId })
      .subscribe(() => this.loadRides());
  }

  startRide(rideId: string) {
    this.http.post(`${this.base}/start/${rideId}`, {})
      .subscribe(() => {
        alert('Ride Started 🚗');
        this.loadRides();
      });
  }

  completeRide(rideId: string) {
    this.http.post(`${this.base}/complete/${rideId}`, {})
      .subscribe(() => {
        alert('Ride Completed ✅');
        this.loadRides();
      });
  }
}
