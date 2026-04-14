import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardSidebar } from '../../components/dashboard-sidebar/dashboard-sidebar';
import { DashboardNavbar } from '../../components/dashboard-navbar/dashboard-navbar';

export interface Patient {
  id: string;
  name: string;
  patientId: string;
  status: 'Active' | 'Pending' | 'Inactive' | 'Complete';
  registration: string;
  lastVisit: string;
  condition: string;
  age: number;
  images: number;
}

@Component({
  selector: 'app-patient-records',
  imports: [DashboardSidebar, DashboardNavbar, RouterLink],
  templateUrl: './patient-records.html',
  styleUrl: './patient-records.scss',
})
export class PatientRecords {
  sidebarCollapsed = false;
  activeFilter = signal<string>('All');

  filters = ['All', 'Active', 'Pending', 'Completed'];

  patients: Patient[] = [
    { id: '1', name: 'Emily Davis', patientId: 'P-12348', status: 'Active', registration: '2024-01-02', lastVisit: '2024-01-08', condition: 'Glaucoma', age: 45, images: 7 },
    { id: '2', name: 'Michael Brown', patientId: 'P-12349', status: 'Pending', registration: '2023-10-10', lastVisit: '2023-11-20', condition: 'Age-related Macular Degeneration', age: 72, images: 3 },
    { id: '3', name: 'Sarah Wilson', patientId: 'P-12350', status: 'Active', registration: '2024-01-06', lastVisit: '2024-01-11', condition: 'Retinal Detachment', age: 39, images: 12 },
    { id: '4', name: 'Jessica Taylor', patientId: 'P-12352', status: 'Inactive', registration: '2023-09-25', lastVisit: '2023-12-15', condition: 'Astigmatism', age: 31, images: 4 },
    { id: '5', name: 'Olivia Anderson', patientId: 'P-12354', status: 'Pending', registration: '2023-08-30', lastVisit: '2023-11-05', condition: 'Floaters', age: 50, images: 2 },
    { id: '6', name: 'James Hernandez', patientId: 'P-12355', status: 'Active', registration: '2023-11-28', lastVisit: '2024-01-12', condition: 'Retinitis Pigmentosa', age: 37, images: 8 },
    { id: '7', name: 'David Lee', patientId: 'P-12351', status: 'Active', registration: '2024-01-03', lastVisit: '2024-01-09', condition: 'Myopia', age: 22, images: 6 },
    { id: '8', name: 'William Martinez', patientId: 'P-12353', status: 'Pending', registration: '2024-01-01', lastVisit: '2024-01-07', condition: 'Conjunctivitis', age: 27, images: 9 },
    { id: '9', name: 'James Hernandez', patientId: 'P-12355', status: 'Complete', registration: '2023-11-28', lastVisit: '2024-01-12', condition: 'Retinitis Pigmentosa', age: 37, images: 8 },
  ];

  get filteredPatients(): Patient[] {
    if (this.activeFilter() === 'All') return this.patients;
    return this.patients.filter(p => p.status === this.activeFilter());
  }

  setFilter(f: string) { this.activeFilter.set(f); }

  toggleSidebar() { this.sidebarCollapsed = !this.sidebarCollapsed; }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Active': 'badge--active',
      'Pending': 'badge--pending',
      'Inactive': 'badge--inactive',
      'Complete': 'badge--complete',
    };
    return map[status] || '';
  }

  formatDate(date: string): string {
    return date;
  }
}
