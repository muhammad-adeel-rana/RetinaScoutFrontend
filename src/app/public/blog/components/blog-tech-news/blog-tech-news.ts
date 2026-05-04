import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService, NewsArticle } from '../../../../core/services/news.service';

@Component({
  selector: 'app-blog-tech-news',
  imports: [CommonModule],
  templateUrl: './blog-tech-news.html',
  styleUrl: './blog-tech-news.scss',
})
export class BlogTechNews implements OnInit {
  col1 = signal<NewsArticle[]>([]);
  col2 = signal<NewsArticle[]>([]);
  loading = signal(true);
  error = signal(false);

  constructor(private newsService: NewsService) { }

  ngOnInit() {
    this.newsService.getTechNews().subscribe({
      next: (res) => {
        const articles = res.articles.slice(0, 6);
        this.col1.set(articles.slice(0, 3));
        this.col2.set(articles.slice(3, 6));
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
