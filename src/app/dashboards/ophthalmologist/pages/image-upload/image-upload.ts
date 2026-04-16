import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardSidebar } from '../../components/dashboard-sidebar/dashboard-sidebar';
import { DashboardNavbar } from '../../components/dashboard-navbar/dashboard-navbar';
import { AnalysisService } from '../../../../core/services/analysis.service';
import { AnalysisStateService } from '../../../../core/services/analysis-state.service';

@Component({
  selector: 'app-image-upload',
  imports: [DashboardSidebar, DashboardNavbar, FormsModule],
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.scss',
})
export class ImageUpload {
  constructor(
    private router: Router,
    private analysisService: AnalysisService,
    private analysisState: AnalysisStateService,
  ) { }

  sidebarCollapsed = false;
  showPatientModal = true;
  isAnalyzing = false;
  errorMessage = '';

  patientForm = {
    patientName: '',
    age: '',
    gender: '',
    patientId: '',
    doctorName: '',
    department: '',
    consent: false,
  };

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  cancelModal() {
    this.router.navigate(['/dashboard']);
  }

  continueToUpload() {
    this.showPatientModal = false;
    // Store patient info in shared state
    this.analysisState.setPatientInfo({ ...this.patientForm });
  }

  uploadSlots = [0, 1, 2, 3];
  uploadedFiles: (File | null)[] = [null, null, null, null];

  onFileSelected(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.uploadedFiles[index] = input.files[0];
      this.errorMessage = '';
    }
  }

  triggerUpload(index: number) {
    const input = document.getElementById(`file-input-${index}`) as HTMLInputElement;
    input?.click();
  }

  get hasUploadedFiles(): boolean {
    return this.uploadedFiles.some(f => f !== null);
  }

  /** Send the first uploaded image to the backend for analysis. */
  viewAnalysis() {
    const file = this.uploadedFiles.find(f => f !== null);
    if (!file) {
      this.errorMessage = 'Please upload at least one retinal image.';
      return;
    }

    this.isAnalyzing = true;
    this.errorMessage = '';

    this.analysisService.analyzeImage(file).subscribe({
      next: (result) => {
        this.analysisState.setResult(result);
        this.isAnalyzing = false;
        this.router.navigate(['/dashboard/visualization']);
      },
      error: (err) => {
        this.isAnalyzing = false;
        this.errorMessage =
          err.status === 0
            ? 'Cannot reach the analysis server. Make sure the backend is running on port 8000.'
            : `Analysis failed: ${err.error?.detail ?? err.message}`;
      },
    });
  }

  analysisResults = [
    { label: 'Resnet', bg: '#E8F0FE' },
    { label: 'Attention U-Net', bg: '#E8F0FE' },
    { label: 'SAM 3', bg: '#E8F0FE' },
    { label: 'DeepLab V3', bg: '#E8F0FE' },
  ];
}
