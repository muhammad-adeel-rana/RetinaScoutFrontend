import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  imports: [CommonModule],
  templateUrl: './faq.html',
  styleUrl: './faq.scss',
})
export class Faq {
  leftFaqs = [
    {
      q: 'What is the purpose of RetinaScout?',
      a: 'RetinaScout is an AI-powered diagnostic imaging system designed to assist in the early detection of diabetic retinopathy by automatically screening fundus images and classifying them by severity, reducing the burden on healthcare providers.',
      open: false,
    },
    {
      q: 'How accurate is the AI detection system?',
      a: 'Our AI model achieves high diagnostic accuracy on validated clinical datasets, comparable to expert ophthalmologist assessments using Dice Coefficient and IoU metrics.',
      open: false,
    },
  ];

  rightFaqs = [
    {
      q: 'What images are required for analysis?',
      a: 'RetinaScout requires standard fundus photographs taken with a fundus camera. Images should be of sufficient resolution and quality for accurate analysis.',
      open: false,
    },
    {
      q: 'How long does it take to process a retinal image?',
      a: 'RetinaScout processes a single retinal image in under 2 minutes, delivering segmentation results and severity classification.',
      open: false,
    },
    {
      q: 'Can multiple healthcare professionals access patient data?',
      a: 'Yes, RetinaScout supports multi-role access. Administrators, doctors, and staff can be assigned different permission levels within the same organization account.',
      open: false,
    },
    {
      q: 'What happens if pathological features are detected?',
      a: 'When pathological features are detected, the system generates a detailed report highlighting affected regions and severity grade, which the clinician can review and act upon.',
      open: false,
    },
  ];

  toggleLeft(index: number) {
    this.leftFaqs = this.leftFaqs.map((f, i) => ({ ...f, open: i === index ? !f.open : false }));
  }

  toggleRight(index: number) {
    this.rightFaqs = this.rightFaqs.map((f, i) => ({ ...f, open: i === index ? !f.open : false }));
  }
}
