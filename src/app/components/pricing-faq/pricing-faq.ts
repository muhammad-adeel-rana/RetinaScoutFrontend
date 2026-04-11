import { Component } from '@angular/core';

@Component({
  selector: 'app-pricing-faq',
  imports: [],
  templateUrl: './pricing-faq.html',
  styleUrl: './pricing-faq.scss',
})
export class PricingFaq {
  faqs = [
    { q: 'What is the purpose of RetinaScout?', a: 'RetinaScout is an AI-powered diagnostic imaging system designed to assist in the early detection of diabetic retinopathy by automatically screening fundus images and classifying them by severity, reducing the burden on healthcare providers and clinics.', open: true },
    { q: 'What images are required for analysis?', a: 'RetinaScout requires standard fundus photographs taken with a fundus camera. Images should be of sufficient resolution and quality for accurate analysis.', open: false },
    { q: 'How accurate is the AI detection system?', a: 'Our AI model achieves over 98% diagnostic accuracy on validated clinical datasets, comparable to expert ophthalmologist assessments.', open: false },
    { q: 'What is the difference between manual and AI-assisted screening?', a: 'Manual screening relies on a trained clinician reviewing each image individually, which is time-consuming. AI-assisted screening automates this process, providing instant results with consistent accuracy.', open: false },
    { q: 'How long does it take to process a retinal image?', a: 'RetinaScout processes a single retinal image in under 2 minutes, delivering segmentation results and severity classification instantly.', open: false },
    { q: 'What hardware is required to run RetinaScout?', a: 'RetinaScout is a web-based platform accessible from any modern browser. No special hardware is required beyond a standard fundus camera for image capture.', open: false },
    { q: 'Can multiple healthcare professionals access patient data?', a: 'Yes, RetinaScout supports multi-role access. Administrators, doctors, and staff can be assigned different permission levels within the same organization account.', open: false },
    { q: 'What happens if pathological features are detected?', a: 'When pathological features are detected, the system generates a detailed report highlighting affected regions and severity grade, which the clinician can review and act upon.', open: false },
    { q: 'How long does it take to train staff on the system?', a: 'Most users are fully operational within a single training session. Our intuitive interface is designed for clinical environments with minimal technical overhead.', open: false },
    { q: 'Do I need specialized equipment beyond standard fundus cameras?', a: 'No. RetinaScout is compatible with standard fundus cameras and does not require any proprietary hardware.', open: false },
  ];

  toggleFaq(index: number) {
    this.faqs = this.faqs.map((faq, i) => ({
      ...faq,
      open: i === index ? !faq.open : false,
    }));
  }
}
