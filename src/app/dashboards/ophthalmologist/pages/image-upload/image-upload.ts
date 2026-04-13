import { Component, signal } from '@angular/core';
import { DashboardSidebar } from '../../components/dashboard-sidebar/dashboard-sidebar';
import { DashboardNavbar } from '../../components/dashboard-navbar/dashboard-navbar';

@Component({
  selector: 'app-image-upload',
  imports: [DashboardSidebar, DashboardNavbar],
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.scss',
})
export class ImageUpload {
  sidebarCollapsed = false;

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  uploadSlots = [0, 1, 2, 3];

  analysisResults = [
    { label: 'Resnet', bg: '#E8F0FE' },
    { label: 'Attention U-Net', bg: '#E8F0FE' },
    { label: 'SAM 3', bg: '#E8F0FE' },
    { label: 'DeepLab V3', bg: '#E8F0FE' },
  ];

  uploadedFiles: (File | null)[] = [null, null, null, null];

  onFileSelected(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.uploadedFiles[index] = input.files[0];
    }
  }

  triggerUpload(index: number) {
    const input = document.getElementById(`file-input-${index}`) as HTMLInputElement;
    input?.click();
  }
}
