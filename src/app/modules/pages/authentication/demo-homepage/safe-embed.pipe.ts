import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({ name: 'safeEmbedUrlpipe' })
export class SafeEmbedUrlPipesY implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string, autoPlay: boolean = false, loop: boolean = false): SafeResourceUrl {
    if (!url) return this.sanitizer.bypassSecurityTrustResourceUrl('');

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = this.extractYouTubeVideoId(url);
      if (videoId) {
        // Construct YouTube embed URL with query parameters
        let embedUrl = `https://www.youtube.com/embed/${videoId}`;
        const queryParams = [];
        if (autoPlay) {
          queryParams.push('autoplay=1');
          queryParams.push('mute=1'); // Auto-play requires mute for most browsers
        }
        if (loop) {
          queryParams.push('loop=1');
          queryParams.push(`playlist=${videoId}`); // Required for looping
        }
        if (queryParams.length > 0) {
          embedUrl += `?${queryParams.join('&')}`;
        }
        console.log('YouTube embed URL:', embedUrl);
        return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
      }
    }

    // Handle Vimeo URLs
    if (url.includes('vimeo.com')) {
      const { videoId, hash } = this.extractVimeoVideoId(url);
      if (videoId) {
        let embedUrl = `https://player.vimeo.com/video/${videoId}`;
        const queryParams = [];
        if (autoPlay) {
          queryParams.push('autoplay=1');
          queryParams.push('muted=1'); // Auto-play requires mute for most browsers
        }
        if (loop) {
          queryParams.push('loop=1');
        }
        if (hash) {
          queryParams.push(`h=${hash}`);
        }
        if (queryParams.length > 0) {
          embedUrl += `?${queryParams.join('&')}`;
        }
        console.log('Vimeo embed URL:', embedUrl);
        return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
      }
    }

    // Return original URL if no specific handling needed
    console.log('Using original URL:', url);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private extractYouTubeVideoId(url: string): string {
    const patterns = [
      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1] && match[1].length === 11) {
        console.log('YouTube Video ID extracted:', match[1]);
        return match[1];
      }
    }

    console.log('No YouTube Video ID found');
    return '';
  }

  private extractVimeoVideoId(url: string): { videoId: string, hash: string | null } {
    const patterns = [
      /(?:vimeo\.com\/)(\d+)(?:\/([a-zA-Z0-9]+))?/, 
      /(?:vimeo\.com\/(?:channels\/[^\/]+\/|groups\/[^\/]+\/videos\/|album\/\d+\/video\/|video\/|))(\d+)(?:\/([a-zA-Z0-9]+))?/,
      /(?:player\.vimeo\.com\/video\/)(\d+)(?:[?&]h=([a-zA-Z0-9]+))?/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        console.log('Vimeo Video ID extracted:', match[1], 'Hash:', match[2] || null);
        return { videoId: match[1], hash: match[2] || null };
      }
    }

    console.log('No Vimeo Video ID found');
    return { videoId: '', hash: null };
  }
}