import { Component } from '@angular/core';
import { BlogHero } from '../../components/blog-hero/blog-hero';
import { BlogLatestNews } from '../../components/blog-latest-news/blog-latest-news';
import { BlogWorldNews } from '../../components/blog-world-news/blog-world-news';
import { BlogTechNews } from '../../components/blog-tech-news/blog-tech-news';

@Component({
  selector: 'app-blog-page',
  imports: [BlogHero, BlogLatestNews, BlogWorldNews, BlogTechNews],
  template: `
    <app-blog-hero></app-blog-hero>
    <app-blog-latest-news></app-blog-latest-news>
    <app-blog-world-news></app-blog-world-news>
    <app-blog-tech-news></app-blog-tech-news>
  `,
})
export class BlogPage {}
