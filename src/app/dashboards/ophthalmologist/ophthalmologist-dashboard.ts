import { Component } from '@angular/core';
import { DashboardSidebar } from './components/dashboard-sidebar/dashboard-sidebar';
import { DashboardNavbar } from './components/dashboard-navbar/dashboard-navbar';
import { DashboardCharts } from './components/dashboard-charts/dashboard-charts';
import { DashboardTable } from './components/dashboard-table/dashboard-table';
import { DoctorAvailability } from './components/doctor-availability/doctor-availability';
import { RecentActivity } from './components/recent-activity/recent-activity';
import { ImageAnalysis } from './components/image-analysis/image-analysis';
import { PerformanceMetrics } from './components/performance-metrics/performance-metrics';

@Component({
  selector: 'app-ophthalmologist-dashboard',
  imports: [
    DashboardSidebar,
    DashboardNavbar,
    DashboardCharts,
    DashboardTable,
    DoctorAvailability,
    RecentActivity,
    ImageAnalysis,
    PerformanceMetrics,
  ],
  templateUrl: './ophthalmologist-dashboard.html',
  styleUrl: './ophthalmologist-dashboard.scss',
})
export class OphthalmologistDashboard {
  sidebarCollapsed = false;

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
