import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardSidebar } from '../../components/dashboard-sidebar/dashboard-sidebar';
import { DashboardNavbar } from '../../components/dashboard-navbar/dashboard-navbar';
import { AnalysisStateService } from '../../../../core/services/analysis-state.service';

@Component({
    selector: 'app-visualization',
    imports: [DashboardSidebar, DashboardNavbar, FormsModule],
    templateUrl: './visualization.html',
    styleUrl: './visualization.scss',
})
export class Visualization implements OnInit, AfterViewInit {
    @ViewChild('maskCanvas') maskCanvasRef!: ElementRef<HTMLCanvasElement>;

    constructor(
        private router: Router,
        private analysisState: AnalysisStateService,
    ) { }

    sidebarCollapsed = false;

    // Images from backend
    originalImageSrc = '';
    maskOverlaySrc = '';

    // Loaded Image objects for canvas rendering
    private originalImg = new Image();
    private maskImg = new Image();
    private imagesReady = { original: false, mask: false };

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
        { label: 'Hard Exudates', color: '#3B82F6', active: true },
        { label: 'Microaneurysms', color: '#10B981', active: false },
        { label: 'Haemorrhages', color: '#8B5CF6', active: false },
        { label: 'Soft Exudates', color: '#F59E0B', active: false },
    ];

    opacityLevel = 50;

    originalZoom = 10;
    maskZoom = 10;

    detectionResults = [
        { label: 'Hard Exudates', percent: 0, color: '#3B82F6', hasData: false },
        { label: 'Microaneurysms', percent: 0, color: '#10B981', hasData: false },
        { label: 'Haemorrhages', percent: 0, color: '#8B5CF6', hasData: false },
        { label: 'Soft Exudates', percent: 0, color: '#F59E0B', hasData: false },
    ];

    ngOnInit() {
        const result = this.analysisState.result();
        if (result) {
            this.originalImageSrc = result.original_image;
            this.maskOverlaySrc = result.mask_overlay;

            // Update detection results with real data
            const he = result.detection.hard_exudates;
            this.detectionResults[0] = { ...this.detectionResults[0], percent: he, hasData: true };
        }

        // Populate patient info if available
        const info = this.analysisState.patientInfo();
        if (info) {
            this.patient = {
                name: String(info['patientName'] ?? this.patient.name),
                gender: String(info['gender'] ?? this.patient.gender),
                age: Number(info['age']) || this.patient.age,
                id: String(info['patientId'] ?? this.patient.id),
                status: 'Analysis Complete',
            };
        }
    }

    ngAfterViewInit() {
        if (this.originalImageSrc && this.maskOverlaySrc) {
            this.loadImagesAndDraw();
        }
    }

    // ── Canvas rendering ──────────────────────────────────────────────

    private loadImagesAndDraw() {
        this.originalImg.onload = () => {
            this.imagesReady.original = true;
            if (this.imagesReady.mask) this.drawCanvas();
        };
        this.maskImg.onload = () => {
            this.imagesReady.mask = true;
            if (this.imagesReady.original) this.drawCanvas();
        };
        this.originalImg.src = this.originalImageSrc;
        this.maskImg.src = this.maskOverlaySrc;
    }

    drawCanvas() {
        const canvas = this.maskCanvasRef?.nativeElement;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = this.originalImg.naturalWidth || 512;
        canvas.height = this.originalImg.naturalHeight || 512;

        // Layer 1: original image
        ctx.globalAlpha = 1;
        ctx.drawImage(this.originalImg, 0, 0, canvas.width, canvas.height);

        // Layer 2: mask overlay (only if Hard Exudates tag is active)
        if (this.overlayTags[0].active) {
            ctx.globalAlpha = this.opacityLevel / 100;
            ctx.drawImage(this.maskImg, 0, 0, canvas.width, canvas.height);
        }

        ctx.globalAlpha = 1;
    }

    onOpacityChange() {
        this.drawCanvas();
    }

    toggleTag(index: number) {
        this.overlayTags[index].active = !this.overlayTags[index].active;
        this.drawCanvas();
    }

    zoomIn(type: 'original' | 'mask') {
        if (type === 'original') this.originalZoom = Math.min(200, this.originalZoom + 10);
        else this.maskZoom = Math.min(200, this.maskZoom + 10);
    }

    zoomOut(type: 'original' | 'mask') {
        if (type === 'original') this.originalZoom = Math.max(10, this.originalZoom - 10);
        else this.maskZoom = Math.max(10, this.maskZoom - 10);
    }
}
