import { Component } from '@angular/core';

@Component({
  selector: 'app-blog-tech-news',
  imports: [],
  templateUrl: './blog-tech-news.html',
  styleUrl: './blog-tech-news.scss',
})
export class BlogTechNews {
  col1 = [
    { category: 'AI & IMAGING', title: 'New deep learning model achieves record accuracy in retinal disease detection', date: 'April 5, 2026' },
    { category: 'DEVICES', title: 'Portable fundus cameras now compatible with RetinaScout platform', date: 'April 3, 2026' },
    { category: 'SOFTWARE', title: 'RetinaScout v2.0 introduces real-time segmentation overlay', date: 'April 1, 2026' },
  ];

  col2 = [
    { category: 'RESEARCH', title: 'Transfer learning improves diabetic retinopathy grading in low-resource settings', date: 'April 4, 2026' },
    { category: 'CLINICAL TECH', title: 'Telemedicine integration allows remote retinal consultations', date: 'April 2, 2026' },
    { category: 'DATA SCIENCE', title: 'Federated learning protects patient privacy in multi-site retinal studies', date: 'March 31, 2026' },
  ];
}
