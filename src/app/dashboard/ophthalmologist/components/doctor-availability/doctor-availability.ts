import { Component } from '@angular/core';

@Component({
  selector: 'app-doctor-availability',
  imports: [],
  templateUrl: './doctor-availability.html',
  styleUrl: './doctor-availability.scss',
})
export class DoctorAvailability {
  doctors = [
    { name: 'Natakunda Cathy', role: 'Ophthalmologist', breakTime: '01:00 pm', avatar: 'N' },
    { name: 'Colin Luwembe', role: 'Ophthalmologist', breakTime: '01:30 pm', avatar: 'C' },
    { name: 'Nawonga Rahman', role: 'Ophthalmologist', breakTime: '01:00 pm', avatar: 'N' },
  ];
}
