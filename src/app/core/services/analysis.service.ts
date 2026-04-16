import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AnalysisResult {
    original_image: string;   // base64 PNG data-URI
    mask_overlay: string;     // base64 RGBA PNG data-URI
    detection: {
        hard_exudates: number;  // percentage 0–100
    };
}

@Injectable({ providedIn: 'root' })
export class AnalysisService {
    private readonly apiUrl = 'http://localhost:8000';

    constructor(private http: HttpClient) { }

    analyzeImage(file: File): Observable<AnalysisResult> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<AnalysisResult>(`${this.apiUrl}/analyze`, formData);
    }

    checkHealth(): Observable<{ status: string; device: string }> {
        return this.http.get<{ status: string; device: string }>(`${this.apiUrl}/health`);
    }
}
