import { Component } from '@angular/core';
import { BlogHero } from './components/blog-hero/blog-hero';
import { BlogLatestNews } from './components/blog-latest-news/blog-latest-news';
import { BlogWorldNews } from './components/blog-world-news/blog-world-news';
import { BlogTechNews } from './components/blog-tech-news/blog-tech-news';

@Component({
  selector: 'app-blog-page',
  standalone: true,
  imports: [
    BlogHero,
    BlogLatestNews,
    BlogWorldNews,
    BlogTechNews,
  ],
  templateUrl: './blog-page.html',
})
export class BlogPage {}
