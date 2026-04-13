import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardSidebar } from '../../components/dashboard-sidebar/dashboard-sidebar';
import { DashboardNavbar } from '../../components/dashboard-navbar/dashboard-navbar';

@Component({
    selector: 'app-visualization',
    imports: [DashboardSidebar, DashboardNavbar, FormsModule],
    templateUrl: './visualization.html',
    styleUrl: './visualization.scss',
})
export class Visualization {
    constructor(private router: Router) { }

    sidebarCollapsed = false;

    toggleSidebar() {
        this.sidebarCollapsed = !this.sidebarCollapsed;
    }

    goToMedicalReport() {
        this.router.navigate(['/dashboard/medical-report']);
    }

    patient = {
        name: 'Marvin McKinney',
        gender: 'Male',
        age: 32,
        id: 'P-12345',
        status: 'Analysis in Progress',
    };

    vitals = [
        { value: '120 mg/dt', label: 'Blood glucose level' },
        { value: '55 Kg', label: 'Weight' },
        { value: '70 bpm', label: 'Heart rate' },
        { value: '71%', label: 'Oxygen saturation' },
        { value: '98.1 F', label: 'Body temperature' },
        { value: '120/80 mm hg', label: 'Blood pressure' },
    ];

    overlayTags = [
        { label: 'Microaneurysms', color: '#3B82F6', active: true },
        { label: 'Haemorrhages', color: '#10B981', active: false },
        { label: 'Hard Exudates', color: '#8B5CF6', active: false },
        { label: 'Soft Exudates', color: '#F59E0B', active: false },
    ];

    opacityLevel = 10;

    originalZoom = 10;
    maskZoom = 10;

    zoomIn(type: 'original' | 'mask') {
        if (type === 'original') this.originalZoom = Math.min(200, this.originalZoom + 10);
        else this.maskZoom = Math.min(200, this.maskZoom + 10);
    }

    zoomOut(type: 'original' | 'mask') {
        if (type === 'original') this.originalZoom = Math.max(10, this.originalZoom - 10);
        else this.maskZoom = Math.max(10, this.maskZoom - 10);
    }

    toggleTag(index: number) {
        this.overlayTags[index].active = !this.overlayTags[index].active;
    }

    detectionResults = [
        { label: 'Microaneurysms', percent: 45, color: '#3B82F6' },
        { label: 'Haemorrhages', percent: 20, color: '#10B981' },
        { label: 'Hard Exudates', percent: 18, color: '#8B5CF6' },
        { label: 'Soft Exudates', percent: 25, color: '#F59E0B' },
    ];
}
