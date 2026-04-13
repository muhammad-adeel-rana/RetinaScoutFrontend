import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardSidebar } from '../../components/dashboard-sidebar/dashboard-sidebar';
import { DashboardNavbar } from '../../components/dashboard-navbar/dashboard-navbar';

@Component({
    selector: 'app-medical-report',
    imports: [DashboardSidebar, DashboardNavbar, FormsModule],
    templateUrl: './medical-report.html',
    styleUrl: './medical-report.scss',
})
export class MedicalReport {
    constructor(private router: Router) { }

    sidebarCollapsed = false;

    toggleSidebar() {
        this.sidebarCollapsed = !this.sidebarCollapsed;
    }

    patient = {
        name: 'Marvin McKinney',
        gender: 'Male',
        age: 32,
        bloodType: 'B+',
        conditions: 'Diabetes',
    };

    vitals = [
        { value: '120 mg/dt', label: 'Blood glucose level' },
        { value: '55 Kg', label: 'Weight' },
        { value: '70 bpm', label: 'Heart rate' },
        { value: '71%', label: 'Oxygen saturation' },
        { value: '98.1 F', label: 'Body temperature' },
        { value: '120/80 mm hg', label: 'Blood pressure' },
    ];

    aiResults = [
        { label: 'Diabetic Retinopathy', percent: 2, severity: 'Moderate', color: '#3B82F6' },
        { label: 'Macular Edema', percent: 75, severity: 'Mild', color: '#3B82F6' },
        { label: 'Haemorrhages', percent: 65, severity: 'Present', color: '#3B82F6' },
    ];

    form = {
        doctorName: 'Dr. Sarah Mitchell',
        specialty: 'Ophthalmologist',
        diagnosis: '',
        clinicalFindings: '',
        recommendations: '',
        followUp: '',
    };

    cancel() {
        this.router.navigate(['/dashboard/visualization']);
    }

    saveReport() {
        // save logic placeholder
    }

    downloadReport() {
        // download logic placeholder
    }
}
