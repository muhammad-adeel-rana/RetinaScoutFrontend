import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pricing-faq',
  imports: [FormsModule],
  templateUrl: './pricing-faq.html',
  styleUrl: './pricing-faq.scss',
})
export class PricingFaq {
  searchQuery = '';
  currentPage = signal(1);
  readonly pageSize = 7;

  allFaqs = [
    { q: 'What is the purpose of RetinaScout?', a: 'RetinaScout is an AI-powered medical image segmentation system that assists ophthalmologists in early detection of diabetic retinopathy by automatically identifying hemorrhages, microaneurysms, exudates, and optic disc abnormalities from fundus photography.', open: true },
    { q: 'What images are required for analysis?', a: 'RetinaScout requires standard fundus photographs taken with a fundus camera. Images should be of sufficient resolution and quality for accurate analysis.', open: false },
    { q: 'How accurate is the AI detection system?', a: 'Our AI model achieves over 98% diagnostic accuracy on validated clinical datasets, comparable to expert ophthalmologist assessments.', open: false },
    { q: 'What is the difference between manual and AI-assisted screening?', a: 'Manual screening relies on a trained clinician reviewing each image individually, which is time-consuming. AI-assisted screening automates this process, providing instant results with consistent accuracy.', open: false },
    { q: 'How long does it take to process a retinal image?', a: 'RetinaScout processes a single retinal image in under 2 minutes, delivering segmentation results and severity classification instantly.', open: false },
    { q: 'How long does it take to train staff on the system?', a: 'Most users are fully operational within a single training session. Our intuitive interface is designed for clinical environments with minimal technical overhead.', open: false },
    { q: 'What hardware is required to run RetinaScout?', a: 'RetinaScout is a web-based platform accessible from any modern browser. No special hardware is required beyond a standard fundus camera for image capture.', open: false },
    { q: 'Can multiple healthcare professionals access patient data?', a: 'Yes, RetinaScout supports multi-role access. Administrators, doctors, and staff can be assigned different permission levels within the same organization account.', open: false },
    { q: 'What happens if pathological features are detected?', a: 'When pathological features are detected, the system generates a detailed report highlighting affected regions and severity grade, which the clinician can review and act upon.', open: false },
    { q: 'Do I need specialized equipment beyond standard fundus cameras?', a: 'No. RetinaScout is compatible with standard fundus cameras and does not require any proprietary hardware.', open: false },
    { q: 'Is patient data stored securely?', a: 'Yes. All patient data is encrypted at rest and in transit. We comply with medical data privacy regulations including HIPAA standards.', open: false },
    { q: 'Can I export analysis reports?', a: 'Yes. RetinaScout supports multiple export formats including PDF and CSV for sharing results with patients or other healthcare providers.', open: false },
    { q: 'What pathologies can RetinaScout detect?', a: 'RetinaScout can detect hemorrhages, microaneurysms, hard exudates, soft exudates, and optic disc abnormalities associated with diabetic retinopathy.', open: false },
    { q: 'Is there a free trial available?', a: 'Yes. The Starter plan is completely free and includes unlimited patient files, email support, and basic image analysis.', open: false },
    { q: 'How do I upgrade my plan?', a: 'You can upgrade your plan at any time from your account settings. Changes take effect immediately and billing is prorated.', open: false },
    { q: 'What support options are available?', a: 'We offer email support on all plans, priority email support on Professional, and dedicated phone support on the Organization plan.', open: false },
  ];

  get filteredFaqs() {
    if (!this.searchQuery.trim()) return this.allFaqs;
    const q = this.searchQuery.toLowerCase();
    return this.allFaqs.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }

  get totalPages() {
    return Math.ceil(this.filteredFaqs.length / this.pageSize);
  }

  get pagedFaqs() {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredFaqs.slice(start, start + this.pageSize);
  }

  toggleFaq(index: number) {
    const globalIndex = (this.currentPage() - 1) * this.pageSize + index;
    this.allFaqs = this.allFaqs.map((faq, i) => ({
      ...faq,
      open: i === globalIndex ? !faq.open : false,
    }));
  }

  prevPage() {
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages) this.currentPage.update(p => p + 1);
  }
}
