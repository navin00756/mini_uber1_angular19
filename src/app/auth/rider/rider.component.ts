import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

declare const google: any;

@Component({
  standalone: true,
  selector: 'app-rider',
  imports: [CommonModule, FormsModule],
  templateUrl: './rider.component.html'
})
export class RiderComponent implements AfterViewInit {    

  pickup = '';
  drop = '';

  pickupLat = 0;
  pickupLng = 0;
  dropLat = 0;
  dropLng = 0;

  rideType = 'mini';

  distance = 0;
  baseFare = 0;
  perKm = 0;
  fare: number | null = null;

  rideId: string | null = null;
  pollingInterval: any;

  // 🔥 PAYMENT CONFIRMATION STATE (IMPORTANT)
  paymentDone = false;
  paymentReference = '';

  statusMessage = '';

  baseUrl = 'https://uber-clone-1-kqum.onrender.com';
  paymentBaseUrl = 'https://uber-clone-1-kqum.onrender.com';

  constructor(private http: HttpClient) {}

  // ---------------- AUTOCOMPLETE ----------------
  ngAfterViewInit() {
    if ((window as any).google) {
      this.initAutocomplete();
      return;
    }

    const script = document.createElement('script');
    script.src =
      'https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_KEY&libraries=places';
    script.async = true;
    script.onload = () => this.initAutocomplete();
    document.body.appendChild(script);
  }

  initAutocomplete() {
    const pickupInput = document.getElementById('pickup') as HTMLInputElement;
    const dropInput = document.getElementById('drop') as HTMLInputElement;

    const pickupAuto = new google.maps.places.Autocomplete(pickupInput);
    pickupAuto.addListener('place_changed', () => {
      const p = pickupAuto.getPlace();
      this.pickup = p.formatted_address;
      this.pickupLat = p.geometry.location.lat();
      this.pickupLng = p.geometry.location.lng();
    });

    const dropAuto = new google.maps.places.Autocomplete(dropInput);
    dropAuto.addListener('place_changed', () => {
      const p = dropAuto.getPlace();
      this.drop = p.formatted_address;
      this.dropLat = p.geometry.location.lat();
      this.dropLng = p.geometry.location.lng();
    });
  }

  // ---------------- FARE ----------------
  async calculateFare() {
    this.statusMessage = 'Calculating fare...';

    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${this.pickupLng},${this.pickupLat};${this.dropLng},${this.dropLat}?overview=false`
    );

    const data = await res.json();
    this.distance = +(data.routes[0].distance / 1000).toFixed(2);

    if (this.rideType === 'mini')  { this.baseFare = 40; this.perKm = 10; }
    if (this.rideType === 'sedan') { this.baseFare = 60; this.perKm = 14; }
    if (this.rideType === 'suv')   { this.baseFare = 80; this.perKm = 18; }

    this.fare = Math.round(this.baseFare + (this.perKm * this.distance));
    this.statusMessage = 'Fare calculated ✅';
  }

  // ---------------- CONFIRM RIDE ----------------
  confirmRide() {
    this.statusMessage = 'Booking ride...';

    const payload = {
      pickup: this.pickup,
      drop: this.drop,
      rideType: this.rideType,
      distance: this.distance,
      fare: this.fare
    };

    this.http.post<any>(`${this.baseUrl}/book`, payload)
      .subscribe({
        next: res => {
          this.rideId = res.data._id;
          localStorage.setItem('activeRideId', res.data._id);
          this.statusMessage = 'Ride booked 🚕 Finding driver...';
          this.startRidePolling();
        },
        error: () => {
          this.statusMessage = 'Ride booking failed ❌';
        }
      });
  }

  // ---------------- POLLING ----------------
  startRidePolling() {
    const rideId = localStorage.getItem('activeRideId');
    if (!rideId) return;

    this.pollingInterval = setInterval(() => {
      this.http.get<any>(`${this.baseUrl}/${rideId}`)
        .subscribe(res => {

          const status = res.data.status;
          this.statusMessage = `Ride status: ${status}`;

          if (status === 'COMPLETED') {
            clearInterval(this.pollingInterval);
            localStorage.removeItem('activeRideId');
            this.startPayment();   // 🔥 payment starts here
          }
        });
    }, 5000);
  }

  // ---------------- PAYMENT ----------------
  startPayment() {
    this.statusMessage = 'Creating payment order...';

    this.http.post<any>(
      `${this.paymentBaseUrl}/create-order/${this.rideId}`, {}
    ).subscribe({
      next: res => {
        const paymentId = 'pay_demo_' + Date.now();
        this.verifyPayment(res.orderId, paymentId);
      },
      error: () => {
        this.statusMessage = 'Payment order failed ❌';
      }
    });
  }

  // ✅ THIS IS WHERE FRONTEND KNOWS PAYMENT IS DONE
  verifyPayment(orderId: string, paymentId: string) {

    this.statusMessage = 'Verifying payment...';

    this.http.post<any>(`${this.paymentBaseUrl}/verify`, {
      orderId,
      paymentId,
      rideId: this.rideId
    }).subscribe({
      next: () => {
        // 🔥 SOURCE OF TRUTH
        this.paymentDone = true;
        this.paymentReference = paymentId;

        this.statusMessage = '✅ Payment Successful';
        localStorage.setItem('paymentDone', 'true');
      },
      error: () => {
        this.statusMessage = '❌ Payment Failed';
        this.paymentDone = false;
      }
    });
  }
}
