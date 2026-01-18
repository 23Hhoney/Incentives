import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class URLService {

  constructor(private http: HttpClient) { }

  getVimeoEmbedUrl(videoUrl: string): Observable<any> {
    const url = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(videoUrl)}&width=640&height=340`
    return this.http.get(url);
  }
  extractIframeUrl(iframeHtml: string): string | null {
    const regex = /src="([^"]*)"/;
    const match = iframeHtml.match(regex);
    return match ? match[1] : null;
  }

  constructEmbedUrl(url: string): string {
    let embedUrl = '';

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = this.extractYouTubeVideoId(url);
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('vimeo.com')) {
      const videoId = this.extractVimeoVideoId(url);
      embedUrl = `https://player.vimeo.com/video/${videoId}`;
    }

    return embedUrl;
  }
  extractVimeoVideoId(url: string): string {
    const regExp = /vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:\w+\/)?|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
    const match = url.match(regExp);
    return match ? match[2] : null;
  }

  extractYouTubeVideoId(url: string): string {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }
}
