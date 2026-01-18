import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class YoutubeService {
  private apiKey = 'YOUR_API_KEY';
  private apiUrl = 'https://www.googleapis.com/youtube/v3/videos';

  constructor(private http: HttpClient) {}

  getVideoDuration(videoId: string): Observable<string> {
    const url = `${this.apiUrl}?id=${videoId}&part=contentDetails&key=${this.apiKey}`;
    return this.http.get<any>(url).pipe(
      map((response) => {
        if (response.items && response.items.length > 0) {
          return this.convertISO8601Duration(response.items[0].contentDetails.duration);
        }
        return 'Unknown';
      })
    );
  }

  private convertISO8601Duration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (match[1] || '0H').slice(0, -1);
    const minutes = (match[2] || '0M').slice(0, -1);
    const seconds = (match[3] || '0S').slice(0, -1);

    return `${hours !== '0' ? hours + ':' : ''}${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  }
}