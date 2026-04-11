import { Component } from '@angular/core';

@Component({
  selector: 'app-blog-latest-news',
  imports: [],
  templateUrl: './blog-latest-news.html',
  styleUrl: './blog-latest-news.scss',
})
export class BlogLatestNews {
  articles = [
    { category: 'DIAGNOSTICS', title: 'AI Detects Diabetic Retinopathy in Rural Medical Clinics', date: 'April 5, 2026', author: 'Dr. Sarah Nair' },
    { category: 'RESEARCH', title: 'New Study Links Early Retinal Screening to Better Patient Outcomes', date: 'April 4, 2026', author: 'James Mitchell' },
    { category: 'TECHNOLOGY', title: 'AI-Powered Retinal Cameras Reduce Diagnostic Time by 60%', date: 'April 3, 2026', author: 'Lucas Fernandez' },
    { category: 'CLINICAL', title: 'Screening Programs Expand Access to Retinal Care Globally', date: 'April 2, 2026', author: 'Priya Okafor' },
  ];
}
