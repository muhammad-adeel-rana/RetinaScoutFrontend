import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService, NewsArticle } from '../../../../core/services/news.service';

@Component({
  selector: 'app-blog-latest-news',
  imports: [CommonModule],
  templateUrl: './blog-latest-news.html',
  styleUrl: './blog-latest-news.scss',
})
export class BlogLatestNews implements OnInit {
  articles = signal<NewsArticle[]>([]);
  loading = signal(true);
  error = signal(false);

  constructor(private newsService: NewsService) { }

  ngOnInit() {
    this.newsService.getLatestNews().subscribe({
      next: (res) => {
        this.articles.set(res.articles.slice(0, 4));
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
