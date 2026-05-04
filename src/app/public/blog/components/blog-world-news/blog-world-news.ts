import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService, NewsArticle } from '../../../../core/services/news.service';

@Component({
  selector: 'app-blog-world-news',
  imports: [CommonModule],
  templateUrl: './blog-world-news.html',
  styleUrl: './blog-world-news.scss',
})
export class BlogWorldNews implements OnInit {
  featuredArticle = signal<NewsArticle | null>(null);
  smallArticles = signal<NewsArticle[]>([]);
  loading = signal(true);
  error = signal(false);

  constructor(private newsService: NewsService) { }

  ngOnInit() {
    this.newsService.getWorldNews().subscribe({
      next: (res) => {
        const articles = res.articles.slice(0, 4);
        this.featuredArticle.set(articles[0] || null);
        this.smallArticles.set(articles.slice(1));
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }
}
