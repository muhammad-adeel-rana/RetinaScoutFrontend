import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-charts',
  imports: [],
  templateUrl: './dashboard-charts.html',
  styleUrl: './dashboard-charts.scss',
})
export class DashboardCharts {
  barData = [
    { day: 'Mon', value: 30, highlight: false },
    { day: 'Tue', value: 45, highlight: false },
    { day: 'Wed', value: 28, highlight: false },
    { day: 'Thu', value: 55, highlight: false },
    { day: 'Fri', value: 42, highlight: false },
    { day: 'Sat', value: 38, highlight: false },
    { day: 'Sun', value: 80, highlight: true },
    { day: 'Mon', value: 52, highlight: false },
    { day: 'Tue', value: 48, highlight: false },
    { day: 'Wed', value: 35, highlight: false },
    { day: 'Thu', value: 60, highlight: false },
    { day: 'Fri', value: 44, highlight: false },
    { day: 'Sat', value: 50, highlight: false },
    { day: 'Sun', value: 40, highlight: false },
  ];

  maxBar = Math.max(...this.barData.map(d => d.value));

  donutSegments = [
    { label: 'Normal', value: 60, color: '#10B981' },
    { label: 'Moderate', value: 30, color: '#F59E0B' },
    { label: 'Severe', value: 10, color: '#7C3AED' },
  ];

  getBarHeight(value: number): string {
    return `${(value / this.maxBar) * 100}%`;
  }
}
