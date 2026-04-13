import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-dashboard-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './dashboard-sidebar.html',
  styleUrl: './dashboard-sidebar.scss',
})
export class DashboardSidebar {
  @Input() collapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  navItems = [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Image Upload', route: '/dashboard/upload', icon: 'upload' },
    { label: 'Visualization', route: '/dashboard/visualization', icon: 'chart' },
    { label: 'Patient Records', route: '/dashboard/patients', icon: 'records' },
    { label: 'Notifications', route: '/dashboard/notifications', icon: 'bell' },
    { label: 'Settings', route: '/dashboard/settings', icon: 'settings' },
  ];
}
