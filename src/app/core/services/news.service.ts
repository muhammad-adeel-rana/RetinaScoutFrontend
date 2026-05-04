import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NewsArticle {
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    source: { name: string };
    author: string | null;
}

export interface NewsResponse {
    articles: NewsArticle[];
    category: string;
}

@Injectable({ providedIn: 'root' })
export class NewsService {
    private readonly apiUrl = 'http://localhost:8000';

    constructor(private http: HttpClient) { }

    getLatestNews(): Observable<NewsResponse> {
        return this.http.get<NewsResponse>(`${this.apiUrl}/news/latest`);
    }

    getTechNews(): Observable<NewsResponse> {
        return this.http.get<NewsResponse>(`${this.apiUrl}/news/tech`);
    }

    getWorldNews(): Observable<NewsResponse> {
        return this.http.get<NewsResponse>(`${this.apiUrl}/news/world`);
    }
}
