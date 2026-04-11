import { Component } from '@angular/core';

@Component({
  selector: 'app-blog-hero',
  imports: [],
  templateUrl: './blog-hero.html',
  styleUrl: './blog-hero.scss',
})
export class BlogHero {
  sideArticles = [
    { category: 'RETINAL HEALTH', title: 'Image Processing Eye Therapy', date: 'April 3, 2026' },
    { category: 'DIAGNOSTICS', title: 'A Precise Data-Driven Diabetic Eye Screening', date: 'April 2, 2026' },
    { category: 'AI RESEARCH', title: 'Advanced Image Scanning On Diabetic Retinal Community', date: 'April 1, 2026' },
    { category: 'TECHNOLOGY', title: 'Retinal Imaging Advances in 2026', date: 'March 30, 2026' },
    { category: 'CLINICAL', title: 'Clinical Outcomes of AI Retinal Screening', date: 'March 28, 2026' },
  ];

  mediumArticles = [
    {
      category: 'DIAGNOSTICS',
      title: 'New AI-Powered Retinal Scanning Helps Diagnose Diabetic Retinopathy in Underserved Communities',
      desc: 'Researchers have developed a new AI model that can detect early signs of diabetic retinopathy with 98% accuracy.',
      date: 'April 4, 2026',
    },
    {
      category: 'TECHNOLOGY',
      title: 'Advanced AI-Assisted Retinal Cameras Early Diabetic Retinopathy Insights from Cluster A',
      desc: 'A new generation of retinal cameras equipped with AI assistance is transforming how clinicians detect early-stage retinopathy.',
      date: 'April 3, 2026',
    },
  ];

  bannerAuthors = [
    { name: 'James Mitchell', role: 'Lead Researcher' },
    { name: 'Dr. Sarah Nair', role: 'Ophthalmologist' },
    { name: 'Lucas Fernandez', role: 'AI Engineer' },
    { name: 'Priya Okafor', role: 'Data Scientist' },
  ];
}
