import { Injectable, signal } from '@angular/core';
import { AnalysisResult } from './analysis.service';

@Injectable({ providedIn: 'root' })
export class AnalysisStateService {
    /** Holds the latest analysis result across pages. */
    result = signal<AnalysisResult | null>(null);

    /** Patient info submitted on the upload page. */
    patientInfo = signal<Record<string, unknown> | null>(null);

    setResult(result: AnalysisResult) {
        this.result.set(result);
    }

    setPatientInfo(info: Record<string, unknown>) {
        this.patientInfo.set(info);
    }

    clear() {
        this.result.set(null);
        this.patientInfo.set(null);
    }
}
