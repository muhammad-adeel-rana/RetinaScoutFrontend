import { Component } from '@angular/core';

@Component({
  selector: 'app-blog-world-news',
  imports: [],
  templateUrl: './blog-world-news.html',
  styleUrl: './blog-world-news.scss',
})
export class BlogWorldNews {
  smallArticles = [
    { category: 'GLOBAL HEALTH', title: 'Entrepreneurs and doctors in the digital age', date: 'April 1, 2026' },
    { category: 'RESEARCH', title: 'Understanding the role of microbiome in diabetic retinopathy', date: 'March 30, 2026' },
    { category: 'INNOVATION', title: 'New retinal imaging devices launched in Asia Pacific', date: 'March 29, 2026' },
  ];
}
