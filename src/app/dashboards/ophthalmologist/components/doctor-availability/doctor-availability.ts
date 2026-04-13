import { Component } from '@angular/core';

@Component({
  selector: 'app-doctor-availability',
  imports: [],
  templateUrl: './doctor-availability.html',
  styleUrl: './doctor-availability.scss',
})
export class DoctorAvailability {
  doctors = [
    { name: 'Natukunda Cathy', email: 'cathy@gmail.com', role: 'Ophthalmologist', breakTime: '01:00 pm', avatar: 'N', img: 'Doctor1.png' },
    { name: 'Colin Lubembe', email: 'colin@gmail.com', role: 'Ophthalmologist', breakTime: '01:00 pm', avatar: 'C', img: 'Doctor2.png' },
    { name: 'Nanyonga Rahmah', email: 'nanyongarah@gmail.com', role: 'Ophthalmologist', breakTime: '01:00 pm', avatar: 'N', img: 'Doctor3.png' },
  ];
}
