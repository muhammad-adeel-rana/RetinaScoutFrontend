import { Component, signal } from '@angular/core';

export interface Analysis {
  id: number;
  customer: string;
  email: string;
  status: 'Normal' | 'Diabetic Retinopathy' | 'Glaucoma' | 'Referred';
  referred: string;
  accuracy: number;
  rating: number;
}

@Component({
  selector: 'app-dashboard-table',
  imports: [],
  templateUrl: './dashboard-table.html',
  styleUrl: './dashboard-table.scss',
})
export class DashboardTable {
  activeFilter = signal<string>('View All');
  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  itemsPerPage = 5;
  Math = Math;

  filters = ['View All', 'Normal', 'Diabetic Retinopathy', 'Glaucoma'];

  allData: Analysis[] = [
    { id: 1, customer: 'Natukunda Cathy', email: 'cathy@gmail.com', status: 'Normal', referred: 'May 24, 2024', accuracy: 80, rating: 5 },
    { id: 2, customer: 'Colin Lubembe', email: 'colin@gmail.com', status: 'Diabetic Retinopathy', referred: 'Apr 24, 2024', accuracy: 85, rating: 4 },
    { id: 3, customer: 'Nanyonga Rahmah', email: 'nanyongarah@gmail.com', status: 'Glaucoma', referred: 'May 14, 2024', accuracy: 79, rating: 4 },
    { id: 4, customer: 'Natukunda Cathy', email: 'catheriney@gmail.com', status: 'Normal', referred: 'May 16, 2024', accuracy: 95, rating: 5 },
  ];

  get filteredData(): Analysis[] {
    let data = this.allData;
    if (this.activeFilter() !== 'View All') {
      data = data.filter(d => d.status === this.activeFilter());
    }
    if (this.searchQuery()) {
      const q = this.searchQuery().toLowerCase();
      data = data.filter(d => d.customer.toLowerCase().includes(q));
    }
    return data;
  }

  get paginatedData(): Analysis[] {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredData.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.itemsPerPage);
  }

  setFilter(f: string) { this.activeFilter.set(f); this.currentPage.set(1); }
  setSearch(e: Event) { this.searchQuery.set((e.target as HTMLInputElement).value); }
  setPage(p: number) { if (p >= 1 && p <= this.totalPages) this.currentPage.set(p); }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Normal': 'status--normal',
      'Diabetic Retinopathy': 'status--diabetic',
      'Glaucoma': 'status--glaucoma',
      'Referred': 'status--referred',
    };
    return map[status] || '';
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
