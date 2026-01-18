import { Component, AfterViewInit, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { KohlerStudioService } from '../kohler-studio/kohler-studio.service';
import { TrainingCourseManagerService } from 'app/modules/admin-panel/training-course-manager/training-course-manager.service';
import { NotificationService } from 'app/shared/notification/notification';
import { URLService } from 'app/modules/url-service/url.service';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import Player from '@vimeo/player';

@Component({
  selector: 'app-kohler-studio-course',
  templateUrl: './kohler-studio-course.component.html',
  styleUrls: ['./kohler-studio-course.component.scss']
})

export class KohlerStudioCourseComponent implements OnInit, OnDestroy {
  @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef;
  @ViewChild('audioPlayer') audioPlayerRef: ElementRef<HTMLAudioElement>;
  @ViewChild('contentArea') contentArea: ElementRef;

  private readonly VERTICAL_SPACING = 60;
  ShowKohler: boolean = false;
  quiz1: FormGroup;
  sanitizedVideoUrl: SafeResourceUrl | null = null;
  SubCourseId: string;
  courseid: string;
  SubCourseName: any;
  VideoUrl = null;
  noDataFound = false;
  loader = false;
  VideoSlideData: { videoUrl: SafeResourceUrl | null, isRequired?: boolean, isPlay?: boolean } | null = null;
  CourseName: any;
  wordLimit: number = 40;
  showMore: boolean = false;
  slides: any[] = [];
  courseContentQuizSlideId: any;
  currentSlideIndex = 0;
  slideId: string | null = null;
  isVideoWatched = false;
  progressTrackingInterval: any = null;
  isVimeoVideo: boolean = false;
  private player: Player;
  videoUrl: string;
  videoDuration: number | null = null;
  videoWatchedPercentage: number = 0;
  watchedTime: number = 0;
  requiredWatchTime: number = 0;
  private youtubePlayer: any;
  isYoutubeVideo: boolean = false;
  language: string;
  isAudioPlayed = false;
  imageUrl: any | null = null;
  audioUrl: SafeResourceUrl | null = null;
  textBoxPositions: any[] = [];
  buttonPositions: any[] = [];
  imageElements: any[] = [];
  elementPositions: { [key: string]: any } = {};
  audioAutoplay: boolean = false;
  courseStatus: string;
  audioIsRequired: boolean = false;
  audioCompleted: boolean = false;
  isPreview = false;
  editors: any[] = [];
  buttons: any[] = [];
  textBoxContent: string;
  isDesktopView: boolean = true;
  currentBreakpoint: string = 'desktop';
  resizeTimeout: any;
  elements: any[] = [];
  containerWidth: number;
  containerHeight: number;
  audioDuration: number = 0;
  audioCurrentTime: number = 0;
  audioProgressPercentage: number = 0;

  constructor(
    private _formBuilder: FormBuilder,
    private trainingService: TrainingCourseManagerService,
    private route: ActivatedRoute,
    private urlService: URLService,
    private service: KohlerStudioService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private notificationService: NotificationService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(queryParams => {
      console.log('Query params:', queryParams);
      this.isPreview = queryParams['preview'] === 'true';
      if (!this.isPreview) {
        const previewFlag = JSON.parse(sessionStorage.getItem('isPreview'));
        this.isPreview = !!previewFlag;
      }
    });
    this.route.paramMap.subscribe(params => {
      this.language = params.get('lang');
      this.courseid = params.get('courseId');
      this.slideId = params.get('slideId');
    });
    this.route.queryParams.subscribe(params => {
      this.courseStatus = params['courseStatus'];
    });
    this.checkViewportSize();
    this.GetallSlides();
  }

  ngAfterViewInit() {
    this.containerWidth = this.contentArea?.nativeElement?.offsetWidth || 0;
    this.containerHeight = this.contentArea?.nativeElement?.offsetHeight || 0;
    this.checkViewportSize();

    if (this.audioPlayerRef && this.audioPlayerRef.nativeElement) {
      this.audioPlayerRef.nativeElement.onloadedmetadata = () => {
        console.log('Audio metadata loaded, duration:', this.audioPlayerRef.nativeElement.duration);
        this.audioDuration = this.audioPlayerRef.nativeElement.duration;
        if (this.audioAutoplay) {
          this.playAudioIfAutoplay();
        }
      };
    } else {
      console.log('No audio player found in this slide');
    }

    window.addEventListener('message', (event) => {
      if (event.data && typeof event.data === 'object') {
        if (event.data.event === 'ready' && event.data.player_id) {
          console.log('Vimeo player ready');
        } else if (event.data.event === 'playProgress' || event.data.event === 'timeupdate') {
          if (event.data.data && event.data.data.percent) {
            this.videoWatchedPercentage = event.data.data.percent * 100;
            if (this.videoWatchedPercentage > 95) {
              this.isVideoWatched = true;
            }
          }
        } else if (event.data.event === 'ended') {
          this.isVideoWatched = true;
        }
      }
    });

    if (!this.isDesktopView && this.slides.length > 0) {
      this.refreshSlideLayout();
    }

    window.addEventListener('resize', this.onResize.bind(this));
  }

  ngOnDestroy() {
    if (this.progressTrackingInterval) {
      clearInterval(this.progressTrackingInterval);
    }
    if (this.player) {
      try {
        this.player.destroy();
      } catch (e) {
        console.log('Error destroying Vimeo player:', e);
      }
    }
    if (this.youtubePlayer && this.youtubePlayer.destroy) {
      try {
        this.youtubePlayer.destroy();
      } catch (e) {
        console.log('Error destroying YouTube player:', e);
      }
    }
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  parseDefaultValue(value: string) {
    try {
      return value ? JSON.parse(value) : {};
    } catch (e) {
      console.error('Error parsing value:', e);
      return {};
    }
  }

  checkViewportSize() {
    const width = window.innerWidth;
    if (width <= 480) {
      this.currentBreakpoint = 'small-mobile';
      this.isDesktopView = false;
    } else if (width <= 768) {
      this.currentBreakpoint = 'mobile';
      this.isDesktopView = false;
    } else if (width <= 1024) {
      this.currentBreakpoint = 'tablet';
      this.isDesktopView = false;
    } else {
      this.currentBreakpoint = 'desktop';
      this.isDesktopView = true;
    }
    console.log('Viewport size:', width, 'Breakpoint:', this.currentBreakpoint, 'isDesktopView:', this.isDesktopView);
    if (!this.isDesktopView) {
      this.refreshSlideLayout();
    }
  }

  onResize(event: any) {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      const previousView = this.isDesktopView;
      this.checkViewportSize();
      if (previousView !== this.isDesktopView) {
        if (!this.isDesktopView) {
          this.refreshSlideLayout();
        }
      }
    }, 250);
  }

  GetallSlides() {
    this.loader = true;
    this.trainingService.GetallslidesData(this.courseid, this.language).subscribe({
      next: (data) => {
        this.slides = data || [];
        console.log('Slides loaded:', this.slides);
        this.currentSlideIndex = this.slides.findIndex(slide => slide.slideId === this.slideId);
        if (this.currentSlideIndex === -1) {
          console.warn('Slide not found for slideId:', this.slideId);
          this.noDataFound = true;
          this.loader = false;
          return;
        }
        this.loadSlideData(this.slideId);
        if (!this.isDesktopView) {
          this.refreshSlideLayout();
        }
      },
      error: (err) => {
        console.error('Error fetching slides:', err);
        this.noDataFound = true;
        this.loader = false;
      }
    });
  }

  loadSlideData(slideId: string) {
    this.loader = true;
    this.resetSlideState();

    const currentSlide = this.slides[this.currentSlideIndex];
    if (currentSlide?.slideType === 'video') {
      const videoFileData = currentSlide.uploadLmsSlideFileModelData?.find(file => file.type === 'video');
      if (videoFileData) {
        const videoUrl = videoFileData.content || videoFileData.url;
        console.log('Loading video slide with URL:', videoUrl);
        const position = this.parseDefaultValue(videoFileData.position);
        this.elementPositions['video'] = {
          xPercent: position.xPercent || 0,
          yPercent: position.yPercent || 0,
          widthPercent: position.widthPercent || 40,
          heightPercent: position.heightPercent || 30
        };
        this.setupVideoSlide(videoUrl, videoFileData.isRequired);
      } else {
        console.warn('No video file data found for slide:', currentSlide);
      }
    }

    this.service.GetAllLmsSlideGroupFieldsandData(slideId).subscribe({
      next: (data) => {
        console.log('Slide data received:', data);
        if (data) {
          this.processSlideData(data);
        } else {
          console.warn('No slide data received for slideId:', slideId);
          this.noDataFound = true;
        }
        this.loader = false;
        if (this.isYoutubeVideo) {
          setTimeout(() => this.initializeYoutubePlayer(), 100);
        }
        if (!this.isDesktopView) {
          this.refreshSlideLayout();
        }
      },
      error: (err) => {
        console.error('Error loading slide data:', err);
        this.noDataFound = true;
        this.loader = false;
      }
    });
  }

  processAudioContent(data: any) {
    this.processSlideData(data);
    const imageData = data.lmsSlideGroupViewDatas
      ?.find(group => group.name === 'image')
      ?.lmsSlideGroupFieldViews[0]
      ?.lmsSlideContentFileViewData[0];

    if (imageData) {
      this.imageUrl = imageData.url;
      this.elementPositions['image'] = this.parseDefaultValue(imageData.position);
    }

    const audioData = data.uploadLmsSlideFileModelData
      ?.find(file => file.type === 'audio-content');

    if (audioData) {
      this.audioUrl = this.sanitizer.bypassSecurityTrustResourceUrl(audioData.url || audioData.content);
      this.elementPositions['audio'] = this.parseDefaultValue(audioData.position);
      this.audioAutoplay = audioData.isPlay === true;
      this.audioIsRequired = audioData.isRequired === true;
    }
  }

  processContentSlide(data: any) {
    this.processSlideData(data);
  }

  formatHyperlink(link: string): string {
    if (!link) return null;
    if (link.match(/^https?:\/\//)) return link;
    if (link.includes('@')) return `mailto:${link}`;
    if (link.match(/^[\d\(\)\-\s\+]+$/)) return `tel:${link}`;
    return `https://${link}`;
  }

  refreshSlideLayout() {
    if (!this.isDesktopView && this.slides.length > 0) {
      this.processExistingDataForViewport();
    }
  }

  processExistingDataForViewport() {
    this.elements = [];

    if (!this.slides || this.slides.length === 0) {
      console.warn('No slides available for mobile layout processing');
      this.noDataFound = true;
      return;
    }

    const currentSlide = this.slides[this.currentSlideIndex];
    if (!currentSlide) {
      console.warn('Current slide not found for index:', this.currentSlideIndex);
      this.noDataFound = true;
      return;
    }

    console.log('Processing mobile layout for slide:', currentSlide);

    // Process text elements
    this.textBoxPositions.forEach((text, index) => {
      if (text.content) {
        this.elements.push({
          type: 'text',
          content: text.content,
          style: {
            fontWeight: text.style?.fontWeight || 'normal',
            fontStyle: text.style?.fontStyle || 'normal',
            textDecoration: text.style?.textDecoration || 'none',
            fontSize: text.style?.fontSize || '14px',
            color: text.style?.color || '#000000',
            backgroundColor: text.style?.backgroundColor || 'transparent',
            textAlign: text.style?.textAlign || 'center'
          },
          order: text.position?.yPercent || 0,
          xPercent: text.position?.xPercent || 0,
          yPercent: text.position?.yPercent || 0,
          widthPercent: text.dimensions?.widthPercent || 20,
          heightPercent: text.dimensions?.heightPercent || 10,
          zIndex: text.zIndex || 20
        });
      } else {
        console.warn(`Skipping text at index ${index} due to missing content`);
      }
    });

    // Process button elements
    this.buttonPositions.forEach((button, index) => {
      if (button.text) {
        this.elements.push({
          type: 'button',
          content: button.text,
          text: button.text,
          link: button.link ? this.formatHyperlink(button.link) : null,
          style: {
            backgroundColor: button.style?.backgroundColor || '#007bff',
            textColor: button.style?.textColor || '#ffffff',
            isBold: button.style?.isBold || false,
            isItalic: button.style?.isItalic || false,
            isUnderline: button.style?.isUnderline || false
          },
          order: button.position?.yPercent || 0,
          xPercent: button.position?.xPercent || 0,
          yPercent: button.position?.yPercent || 0,
          widthPercent: button.dimensions?.widthPercent || 15,
          heightPercent: button.dimensions?.heightPercent || 5,
          zIndex: button.zIndex || 25
        });
      } else {
        console.warn(`Skipping button at index ${index} due to missing text`);
      }
    });

    // Process image elements
    this.imageElements.forEach((image, index) => {
      if (this.validateImageUrl(image.url)) {
        this.elements.push({
          type: 'image',
          content: image.url,
          url: image.url,
          fileName: image.fileName || 'image',
          hyperlink: image.hyperlink ? this.formatHyperlink(image.hyperlink) : null,
          order: image.position?.yPercent || 0,
          xPercent: image.position?.xPercent || 0,
          yPercent: image.position?.yPercent || 0,
          widthPercent: image.dimensions?.widthPercent || 30,
          heightPercent: image.dimensions?.heightPercent || 20,
          zIndex: image.zIndex || 1
        });
      } else {
        console.warn(`Skipping image at index ${index} due to invalid URL:`, image.url);
      }
    });

    // Process audio element
    if (this.audioUrl) {
      this.elements.push({
        type: 'audio',
        content: this.audioUrl,
        order: this.elementPositions['audio']?.yPercent || 0,
        xPercent: this.elementPositions['audio']?.xPercent || 0,
        yPercent: this.elementPositions['audio']?.yPercent || 0,
        widthPercent: this.elementPositions['audio']?.widthPercent || 40,
        heightPercent: this.elementPositions['audio']?.heightPercent || 5
      });
    } else if (currentSlide.slideType === 'audio-content') {
      console.warn('Audio URL missing for audio-content slide');
    }

    // Process video element
    if (this.VideoSlideData?.videoUrl || this.sanitizedVideoUrl) {
      let videoUrl = (this.VideoSlideData?.videoUrl || this.sanitizedVideoUrl) as string | SafeResourceUrl;
      let isYoutube = false;
      let isVimeo = false;
      let sanitizedContent: SafeResourceUrl | null = null;

      // Extract raw URL if SafeResourceUrl
      const rawVideoUrl = typeof videoUrl === 'string' ? videoUrl : (videoUrl as any)?.changingThisBreaksApplicationSecurity || '';

      if (rawVideoUrl) {
        console.log('Processing video URL for mobile:', rawVideoUrl);

        if (rawVideoUrl.includes('youtube.com') || rawVideoUrl.includes('youtu.be')) {
          isYoutube = true;
          const videoId = this.extractYouTubeVideoId(rawVideoUrl);
          if (videoId) {
            sanitizedContent = this.sanitizer.bypassSecurityTrustResourceUrl(
              `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`
            );
            console.log('Sanitized YouTube URL:', sanitizedContent);
          } else {
            console.warn('Invalid YouTube video ID for URL:', rawVideoUrl);
          }
        } else if (rawVideoUrl.includes('vimeo.com')) {
          isVimeo = true;
          const vimeoId = this.extractVimeoVideoId(rawVideoUrl);
          if (vimeoId) {
            sanitizedContent = this.sanitizer.bypassSecurityTrustResourceUrl(
              `https://player.vimeo.com/video/${vimeoId}?api=1`
            );
            console.log('Sanitized Vimeo URL:', sanitizedContent);
          } else {
            console.warn('Invalid Vimeo video ID for URL:', rawVideoUrl);
          }
        } else {
          sanitizedContent = this.sanitizer.bypassSecurityTrustResourceUrl(rawVideoUrl);
          console.log('Sanitized direct video URL:', sanitizedContent);
        }

        if (sanitizedContent) {
          this.elements.push({
            type: 'video',
            content: sanitizedContent,
            isYoutubeVideo: isYoutube,
            isVimeoVideo: isVimeo,
            order: this.elementPositions['video']?.yPercent || 0,
            xPercent: this.elementPositions['video']?.xPercent || 0,
            yPercent: this.elementPositions['video']?.yPercent || 0,
            widthPercent: this.elementPositions['video']?.widthPercent || 40,
            heightPercent: this.elementPositions['video']?.heightPercent || 30
          });
          console.log('Added video element to mobile layout:', {
            type: 'video',
            content: sanitizedContent,
            isYoutubeVideo: isYoutube,
            isVimeoVideo: isVimeo,
            order: this.elementPositions['video']?.yPercent || 0
          });
        } else {
          console.warn('Skipping video element due to invalid URL');
          this.noDataFound = true;
        }
      } else {
        console.warn('No valid video URL found for mobile layout');
      }
    } else if (currentSlide.slideType === 'video') {
      console.warn('Video slide detected but no video URL available');
      const videoFile = currentSlide.uploadLmsSlideFileModelData?.find(file => file.type === 'video');
      if (videoFile?.content || videoFile?.url) {
        const videoUrl = videoFile.content || videoFile.url;
        console.log('Found video in uploadLmsSlideFileModelData:', videoUrl);
        let sanitizedContent: SafeResourceUrl | null = null;
        let isYoutube = false;
        let isVimeo = false;

        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
          isYoutube = true;
          const videoId = this.extractYouTubeVideoId(videoUrl);
          if (videoId) {
            sanitizedContent = this.sanitizer.bypassSecurityTrustResourceUrl(
              `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`
            );
            console.log('Sanitized YouTube URL (fallback):', sanitizedContent);
          } else {
            console.warn('Invalid YouTube video ID in uploadLmsSlideFileModelData:', videoUrl);
          }
        } else if (videoUrl.includes('vimeo.com')) {
          isVimeo = true;
          const vimeoId = this.extractVimeoVideoId(videoUrl);
          if (vimeoId) {
            sanitizedContent = this.sanitizer.bypassSecurityTrustResourceUrl(
              `https://player.vimeo.com/video/${vimeoId}?api=1`
            );
            console.log('Sanitized Vimeo URL (fallback):', sanitizedContent);
          } else {
            console.warn('Invalid Vimeo video ID in uploadLmsSlideFileModelData:', videoUrl);
          }
        } else {
          sanitizedContent = this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl);
          console.log('Sanitized direct video URL (fallback):', sanitizedContent);
        }

        if (sanitizedContent) {
          this.elements.push({
            type: 'video',
            content: sanitizedContent,
            isYoutubeVideo: isYoutube,
            isVimeoVideo: isVimeo,
            order: this.parseDefaultValue(videoFile.position)?.yPercent || 0,
            xPercent: this.parseDefaultValue(videoFile.position)?.xPercent || 0,
            yPercent: this.parseDefaultValue(videoFile.position)?.yPercent || 0,
            widthPercent: this.parseDefaultValue(videoFile.position)?.widthPercent || 40,
            heightPercent: this.parseDefaultValue(videoFile.position)?.heightPercent || 30
          });
          console.log('Added fallback video element:', {
            type: 'video',
            content: sanitizedContent,
            isYoutubeVideo: isYoutube,
            isVimeoVideo: isVimeo,
            order: this.parseDefaultValue(videoFile.position)?.yPercent || 0
          });
        }
      } else {
        console.warn('No video file found in uploadLmsSlideFileModelData');
        this.noDataFound = true;
      }
    }

    console.log('Elements before sorting:', this.elements);

    // Sort elements by yPercent (order) to match desktop layout
    this.elements.sort((a, b) => a.order - b.order);

    console.log('Sorted elements for mobile:', this.elements);

    // Apply layout pattern
    const pattern = this.detectMobileLayoutPattern(
      this.imageElements,
      this.textBoxPositions,
      this.buttonPositions
    );
    console.log('Detected mobile layout pattern:', pattern);

    this.elements = this.createMobileLayout(pattern, this.elements);

    if (this.elements.length === 0) {
      console.warn('No elements processed for mobile layout');
      this.noDataFound = true;
    } else {
      this.noDataFound = false;
    }
  }

  extractYouTubeVideoId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  extractVimeoVideoId(url: string): string | null {
    const regex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)(?:.*hash=([a-z0-9]+))?/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  detectMobileLayoutPattern(images: any[], texts: any[], buttons: any[]): string {
    console.log('Detecting layout pattern - images:', images.length, 'texts:', texts.length, 'buttons:', buttons.length);
    const countsMatch =
      images.length > 0 &&
      texts.length > 0 &&
      buttons.length > 0 &&
      Math.abs(images.length - texts.length) <= 1 &&
      Math.abs(images.length - buttons.length) <= 1;

    if (countsMatch) {
      return 'text-image-button-pairs';
    }

    if (images.length > 0 && texts.length >= images.length && buttons.length === 0) {
      return 'text-above-below-image';
    }

    if (texts.length > 0 && buttons.length > 0 && images.length === 0) {
      return 'text-button-pairs';
    }

    return 'sequential';
  }

  createMobileLayout(pattern: string, elements: any[]): any[] {
    switch (pattern) {
      case 'text-image-button-pairs':
        return this.createTextImageButtonPairs(elements);
      case 'text-above-below-image':
        return this.createTextAroundImageLayout(elements);
      case 'text-button-pairs':
        return this.createTextButtonPairs(elements);
      default:
        return this.createSequentialLayout(elements);
    }
  }

  createTextImageButtonPairs(elements: any[]): any[] {
    const grouped: any[] = [];
    const sortedElements = [...elements].sort((a, b) => a.order - b.order);

    const texts = sortedElements.filter(e => e.type === 'text');
    const images = sortedElements.filter(e => e.type === 'image');
    const buttons = sortedElements.filter(e => e.type === 'button');
    const media = sortedElements.filter(e => e.type === 'audio' || e.type === 'video');

    const maxLength = Math.max(texts.length, images.length, buttons.length);
    for (let i = 0; i < maxLength; i++) {
      if (texts[i]) grouped.push(texts[i]);
      if (images[i]) grouped.push(images[i]);
      if (buttons[i]) grouped.push(buttons[i]);
    }

    grouped.push(...media);

    return grouped.sort((a, b) => a.order - b.order);
  }

  createTextAroundImageLayout(elements: any[]): any[] {
    const sortedElements = [...elements].sort((a, b) => a.order - b.order);
    const images = sortedElements.filter(e => e.type === 'image');
    const texts = sortedElements.filter(e => e.type === 'text');
    const others = sortedElements.filter(e => e.type !== 'text' && e.type !== 'image');

    const result: any[] = [];
    images.forEach((image) => {
      const aboveTexts = texts.filter(t => t.order < image.order);
      const belowTexts = texts.filter(t => t.order > image.order);

      result.push(...aboveTexts);
      result.push(image);
      result.push(...belowTexts);
    });

    result.push(...others);

    return result.sort((a, b) => a.order - b.order);
  }

  createTextButtonPairs(elements: any[]): any[] {
    const sortedElements = [...elements].sort((a, b) => a.order - b.order);
    const texts = sortedElements.filter(e => e.type === 'text');
    const buttons = sortedElements.filter(e => e.type === 'button');
    const others = sortedElements.filter(e => e.type !== 'text' && e.type !== 'button');

    const result: any[] = [];
    const maxLength = Math.max(texts.length, buttons.length);
    for (let i = 0; i < maxLength; i++) {
      if (texts[i]) result.push(texts[i]);
      if (buttons[i]) result.push(buttons[i]);
    }

    result.push(...others);

    return result.sort((a, b) => a.order - b.order);
  }

  createSequentialLayout(elements: any[]): any[] {
    return [...elements].sort((a, b) => a.order - b.order);
  }

  getResponsiveFontSize(originalSize: string | number): number {
    let fontSize = parseFloat(originalSize.toString().replace('px', '')) || 14;
    if (this.currentBreakpoint === 'small-mobile') {
      return fontSize * 0.8;
    } else if (this.currentBreakpoint === 'mobile') {
      return fontSize * 0.9;
    } else if (this.currentBreakpoint === 'tablet') {
      return fontSize;
    }
    return fontSize;
  }

  getSafeHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  validateImageUrl(url: string): boolean {
    if (!url) {
      console.warn('Invalid image URL:', url);
      return false;
    }
    return true;
  }

  processSlideData(data: any) {
    this.textBoxPositions = [];
    this.buttonPositions = [];
    this.imageElements = [];
    this.elementPositions = {};
    this.elements = [];

    data.lmsSlideGroupViewDatas?.forEach(group => {
      switch (group.name) {
        case 'textBox':
        case 'text':
          this.processTextBoxes(group);
          break;
        case 'button':
          this.processButtons(group);
          break;
        case 'image':
          this.processImages(group);
          break;
      }
    });

    if (data.uploadLmsSlideFileModelData?.length) {
      this.processMediaFiles(data.uploadLmsSlideFileModelData);
    }

    if (!this.isDesktopView) {
      this.processExistingDataForViewport();
    }
  }

  processTextBoxes(group: any) {
    group.lmsSlideGroupFieldViews.forEach(field => {
      try {
        const defaultValue = this.parseDefaultValue(field.defaultValue || '{}');
        const content = field.lmsSlideGroupFieldsValueViewData?.htmlEditorValue || `<div>${field.name}</div>`;
        const style = defaultValue.style || {};

        this.textBoxPositions.push({
          id: field.id,
          content,
          position: {
            xPercent: defaultValue.position?.xPercent || 0,
            yPercent: defaultValue.position?.yPercent || 0
          },
          dimensions: {
            widthPercent: defaultValue.widthPercent || 20,
            heightPercent: defaultValue.heightPercent || 10
          },
          style: {
            fontWeight: style.bold ? 'bold' : 'normal',
            fontStyle: style.italic ? 'italic' : 'normal',
            textDecoration: style.underline ? 'underline' : 'none',
            fontSize: `${style.fontSize || 14}px`,
            color: style.color || '#000000',
            backgroundColor: style.backgroundColor || 'transparent',
            textAlign: style.textAlign || 'center'
          },
          zIndex: 20
        });
      } catch (e) {
        console.error('Error processing text box:', e);
      }
    });
  }

  processButtons(group: any) {
    group.lmsSlideGroupFieldViews.forEach(field => {
      try {
        const defaultValue = this.parseDefaultValue(field.defaultValue || '{}');
        const text = field.lmsSlideGroupFieldsValueViewData?.htmlEditorValue || 'Click Here';

        this.buttonPositions.push({
          id: field.id,
          text,
          link: defaultValue.hyperlink || '#',
          position: {
            xPercent: defaultValue.position?.xPercent || 0,
            yPercent: defaultValue.position?.yPercent || 0
          },
          dimensions: {
            widthPercent: defaultValue.widthPercent || 15,
            heightPercent: defaultValue.heightPercent || 5
          },
          style: {
            backgroundColor: defaultValue.style?.backgroundColor || '#007bff',
            textColor: defaultValue.style?.color || '#ffffff',
            isBold: defaultValue.style?.bold || false,
            isItalic: defaultValue.style?.italic || false,
            isUnderline: defaultValue.style?.underline || false
          },
          zIndex: 25
        });
      } catch (e) {
        console.error('Error processing button:', e);
      }
    });
  }

  processImages(group: any) {
    group.lmsSlideGroupFieldViews
      .filter(field => field.lmsSlideContentFileViewData?.length > 0)
      .forEach(field => {
        const defaultValue = this.parseDefaultValue(field.defaultValue || '{}');
        field.lmsSlideContentFileViewData.forEach(fileData => {
          try {
            const contentData = this.parseDefaultValue(fileData.content || '{}');
            const positionData = this.parseDefaultValue(fileData.position || '{}');

            const image = {
              id: fileData.id || `${field.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              url: fileData.url,
              position: {
                xPercent: contentData.position?.xPercent ?? positionData.xPercent ?? defaultValue.position?.xPercent ?? 0,
                yPercent: contentData.position?.yPercent ?? positionData.yPercent ?? defaultValue.position?.yPercent ?? 0
              },
              dimensions: {
                widthPercent: contentData.dimensions?.widthPercent ?? defaultValue.widthPercent ?? 30,
                heightPercent: contentData.dimensions?.heightPercent ?? defaultValue.heightPercent ?? 20
              },
              zIndex: contentData.zIndex ?? defaultValue.zIndex ?? 1,
              fileName: fileData.fileName || 'image',
              hyperlink: contentData.hyperlink ?? null
            };

            if (this.validateImageUrl(image.url)) {
              this.imageElements.push(image);
            } else {
              console.warn('Invalid image URL, skipping:', image);
            }
          } catch (e) {
            console.error('Error processing image:', e);
            this.imageElements.push({
              id: fileData.id || `${field.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              url: fileData.url || '',
              position: { xPercent: 0, yPercent: 0 },
              dimensions: { widthPercent: 30, heightPercent: 20 },
              zIndex: 1,
              fileName: fileData.fileName || 'image',
              hyperlink: null
            });
          }
        });
      });

    console.log('Processed imageElements:', this.imageElements);
  }

  validateDimension(value: number, defaultValue: number): number {
    return (value !== undefined && !isNaN(value) && value >= 0 && value <= 100) ? value : defaultValue;
  }

  processMediaFiles(mediaFiles: any[]) {
    mediaFiles.forEach(file => {
      try {
        const position = this.parseDefaultValue(file.position || '{"xPercent":0,"yPercent":0}');
        if (file.type === 'video') {
          this.isVideoWatched = false;
          this.watchedTime = 0;
          this.videoWatchedPercentage = 0;

          this.elementPositions['video'] = {
            xPercent: position.xPercent || 0,
            yPercent: position.yPercent || 0,
            widthPercent: position.widthPercent || 40,
            heightPercent: position.heightPercent || 30
          };

          const videoUrl = file.content || file.url;
          if (videoUrl) {
            this.setupVideoSlide(videoUrl, file.isRequired === true);
            this.VideoSlideData = {
              videoUrl: this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl),
              isRequired: file.isRequired === true,
              isPlay: file.isPlay === true
            };
          } else {
            console.warn('No video URL found in media file:', file);
          }
        } else if (file.type === 'audio-content') {
          const audioUrl = file.url || file.content;
          if (audioUrl) {
            this.audioUrl = this.sanitizer.bypassSecurityTrustResourceUrl(audioUrl);
            this.elementPositions['audio'] = {
              xPercent: position.xPercent || 0,
              yPercent: position.yPercent || 0,
              widthPercent: position.widthPercent || 40,
              heightPercent: position.heightPercent || 5
            };
            this.audioAutoplay = file.isPlay === true;
            this.audioIsRequired = file.isRequired === true;
            if (this.audioAutoplay) {
              setTimeout(() => this.playAudioIfAutoplay(), 500);
            }
          }
        }
      } catch (e) {
        console.error('Error processing media file:', e);
      }
    });
  }

  setupVideoSlide(videoUrl: string, isRequired: boolean) {
    if (!videoUrl) {
      console.warn('setupVideoSlide: No video URL provided');
      this.sanitizedVideoUrl = null;
      this.VideoSlideData = null;
      return;
    }

    console.log('Setting up video slide with URL:', videoUrl);

    this.isVideoWatched = false;
    this.watchedTime = 0;
    this.videoWatchedPercentage = 0;

    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      this.isYoutubeVideo = true;
      this.isVimeoVideo = false;
      const videoId = this.getYoutubeVideoId(videoUrl);
      if (videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`;
        this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
        this.VideoSlideData = {
          videoUrl: this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl),
          isRequired,
          isPlay: false
        };
        console.log('YouTube video setup:', embedUrl);
        setTimeout(() => this.initializeYoutubePlayer(), 1000);
      } else {
        console.warn('Invalid YouTube video ID for URL:', videoUrl);
        this.sanitizedVideoUrl = null;
        this.VideoSlideData = null;
      }
    } else if (videoUrl.includes('vimeo.com')) {
      this.isYoutubeVideo = false;
      this.isVimeoVideo = true;
      const vimeoId = this.getVimeoVideoId(videoUrl);
      let embedUrl = vimeoId ? `https://player.vimeo.com/video/${vimeoId}?api=1` : null;
      const fullMatch = videoUrl.match(/vimeo\.com\/(\d+)\/([a-zA-Z0-9]+)/);
      if (fullMatch) {
        embedUrl = `https://player.vimeo.com/video/${fullMatch[1]}?h=${fullMatch[2]}&api=1`;
      }
      if (embedUrl) {
        this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
        this.VideoSlideData = {
          videoUrl: this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl),
          isRequired,
          isPlay: false
        };
        console.log('Vimeo video setup:', embedUrl);
        setTimeout(() => this.initializeVimeoPlayer(), 1000);
      } else {
        console.warn('Invalid Vimeo video ID for URL:', videoUrl);
        this.sanitizedVideoUrl = null;
        this.VideoSlideData = null;
      }
    } else {
      this.isYoutubeVideo = false;
      this.isVimeoVideo = false;
      this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl);
      this.VideoSlideData = {
        videoUrl: this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl),
        isRequired,
        isPlay: false
      };
      console.log('Direct video setup:', videoUrl);
    }
  }

  openButtonLink(link: string) {
    if (link) {
      const url = this.formatHyperlink(link);
      window.open(url, '_blank');
    }
  }

  onAudioEnded(event: any) {
    console.log('Audio playback completed');
    this.audioCompleted = true;
    this.isAudioPlayed = true;
  }

  onAudioTimeUpdate(event: any) {
    const audio = event.target;
    this.audioCurrentTime = audio.currentTime;
    this.audioDuration = audio.duration;

    this.audioProgressPercentage = (this.audioCurrentTime / this.audioDuration) * 100;

    if (this.audioProgressPercentage >= 98) {
      this.audioCompleted = true;
      this.isAudioPlayed = true;
    }

    console.log(`Audio progress: ${this.audioProgressPercentage.toFixed(1)}%`);
  }

  playAudioIfAutoplay() {
    if (this.audioAutoplay && this.audioPlayerRef && this.audioPlayerRef.nativeElement) {
      console.log('Attempting to autoplay audio');
      const playPromise = this.audioPlayerRef.nativeElement.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('Autoplay started successfully');
        }).catch(error => {
          console.warn('Autoplay was prevented:', error);
          this.notificationService.infoTopRight("Please click to play the audio");
        });
      }
    }
  }

  getBoundedX(x: number): number {
    const maxWidth = window.innerWidth - 200;
    return Math.min(Math.max(0, x || 0), maxWidth);
  }

  getBoundedY(y: number): number {
    const maxHeight = window.innerHeight - 150;
    return Math.min(Math.max(0, y || 0), maxHeight);
  }

  navigateBack() {
    if (this.currentSlideIndex === 0) {
      const isPreview = JSON.parse(sessionStorage.getItem('isPreview'));
      this.router.navigate(isPreview ?
        ['training-courses/training-course-edit-add', this.courseid] :
        ['/academy-curriculums']);
    } else {
      const prevIndex = this.currentSlideIndex - 1;
      this.currentSlideIndex = prevIndex;
      this.loadSlideData(this.slides[prevIndex].slideId);
    }
  }

  resetSlideState() {
    if (this.progressTrackingInterval) {
      clearInterval(this.progressTrackingInterval);
      this.progressTrackingInterval = null;
    }
    this.sanitizedVideoUrl = null;
    this.VideoSlideData = null;
    this.isVideoWatched = false;
    this.watchedTime = 0;
    this.videoWatchedPercentage = 0;
    this.isYoutubeVideo = false;
    this.isVimeoVideo = false;
    this.audioUrl = null;
    this.isAudioPlayed = false;
    this.audioAutoplay = false;
    this.audioIsRequired = false;
    this.audioCompleted = false;
    this.imageUrl = null;
    this.editors = [];
    this.buttons = [];
    this.elementPositions = {};
    this.textBoxPositions = [];
    this.buttonPositions = [];
    this.imageElements = [];
    if (this.player) {
      try {
        this.player.destroy();
      } catch (e) {
        console.log('Error destroying Vimeo player:', e);
      }
      this.player = null;
    }
    if (this.youtubePlayer && this.youtubePlayer.destroy) {
      try {
        this.youtubePlayer.destroy();
      } catch (e) {
        console.log('Error destroying YouTube player:', e);
      }
      this.youtubePlayer = null;
    }
  }

  getVimeoVideoId(url: string): string | null {
    let match = url.match(/vimeo\.com\/(\d+)/);
    if (match) return match[1];
    match = url.match(/vimeo\.com\/(\d+)\/([a-zA-Z0-9]+)/);
    if (match) return match[1];
    return null;
  }

  initializeVimeoPlayer() {
    if (!this.videoPlayer?.nativeElement) {
      console.error('Video player element not found');
      return;
    }
    try {
      const iframe = this.videoPlayer.nativeElement;
      if (iframe.tagName !== 'IFRAME') {
        console.error('Expected an iframe element for Vimeo player');
        return;
      }
      this.player = new Player(iframe);
      this.player.on('loaded', () => {
        console.log('Vimeo player loaded successfully');
      });
      this.player.on('timeupdate', (data) => {
        this.calculateWatchedTime(data.seconds);
      });
      this.player.on('ended', () => {
        this.isVideoWatched = true;
      });
      this.player.on('error', (error) => {
        console.error('Vimeo player error:', error);
        this.notificationService.infoTopRight('Error loading Vimeo video');
      });
      this.player.getDuration().then(duration => {
        this.videoDuration = duration;
        this.requiredWatchTime = duration;
        console.log('Vimeo video duration:', duration);
      }).catch(error => {
        console.error('Error getting Vimeo video duration:', error);
      });
    } catch (error) {
      console.error('Error initializing Vimeo player:', error);
      this.notificationService.infoTopRight('Failed to initialize Vimeo video');
    }
  }

  getVimeoVideoDetails(apiResponse: any): void {
    if (apiResponse && apiResponse.video_id) {
      const videoId = apiResponse.video_id;
      this.videoDuration = apiResponse.duration;
    }
  }

  calculateWatchedTime(currentTime: number, duration: number = null) {
    if (duration !== null) {
      this.videoDuration = duration;
    }
    this.watchedTime = Math.max(this.watchedTime, currentTime);
    if (this.videoDuration > 0) {
      this.videoWatchedPercentage = (this.watchedTime / this.videoDuration) * 100;
      console.log(`Vimeo progress: ${this.videoWatchedPercentage.toFixed(1)}%`);
      if (this.videoWatchedPercentage >= 98) {
        this.isVideoWatched = true;
        console.log('Vimeo video marked as watched');
      }
    }
  }

  getVideoDuration(videoUrl: string): void {
    const videoId = this.getVimeoVideoId(videoUrl);
    if (!videoId) {
      console.error('Could not extract Vimeo video ID for duration lookup');
      return;
    }
    const apiUrl = `https://vimeo.com/api/v2/video/${videoId}.json`;
    this.http.get<any[]>(apiUrl).subscribe({
      next: (response) => {
        if (response && response.length > 0) {
          this.videoDuration = response[0].duration;
          console.log('Retrieved Vimeo video duration:', this.videoDuration);
        }
      },
      error: (err) => {
        console.error('Error fetching Vimeo video duration:', err);
        const oembedUrl = 'https://vimeo.com/api/oembed.json';
        const params = { url: videoUrl };
        this.http.get<any>(oembedUrl, { params }).subscribe({
          next: (response) => {
            this.videoDuration = response.duration;
            console.log('Retrieved Vimeo video duration from oembed:', this.videoDuration);
          },
          error: (err2) => {
            console.error('Error fetching Vimeo video duration from oembed:', err2);
          }
        });
      }
    });
  }

  getYoutubeVideoId(url: string): string {
    let match = url.match(/youtube\.com\/watch\?v=([^&]+)/);
    if (match) return match[1];
    match = url.match(/youtu\.be\/([^?]+)/);
    if (match) return match[1];
    match = url.match(/youtube\.com\/embed\/([^?]+)/);
    if (match) return match[1];
    return '';
  }

  initializeYoutubePlayer() {
    if (!this.videoPlayer?.nativeElement) {
      console.error('YouTube video player reference not available');
      return;
    }
    if (!window['YT']) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      window['onYouTubeIframeAPIReady'] = () => {
        this.createYoutubePlayer();
      };
    } else {
      this.createYoutubePlayer();
    }
  }

  createYoutubePlayer() {
    if (!this.videoPlayer?.nativeElement) {
      console.error('YouTube video player native element not available');
      return;
    }
    try {
      const iframe = this.videoPlayer.nativeElement;
      this.youtubePlayer = new window['YT'].Player(iframe, {
        events: {
          'onStateChange': this.onYoutubePlayerStateChange.bind(this),
          'onReady': (event) => {
            console.log('YouTube player ready');
            this.videoDuration = this.youtubePlayer.getDuration();
            this.startProgressTracking();
          },
          'onError': (error) => {
            console.error('YouTube Player Error:', error);
            this.notificationService.infoTopRight('Error loading YouTube video');
          }
        }
      });
    } catch (error) {
      console.error('Error creating YouTube player:', error);
      this.notificationService.infoTopRight('Failed to initialize YouTube video');
    }
  }

  startProgressTracking() {
    if (this.progressTrackingInterval) {
      clearInterval(this.progressTrackingInterval);
    }
    this.progressTrackingInterval = setInterval(() => {
      if (this.youtubePlayer && typeof this.youtubePlayer.getCurrentTime === 'function') {
        try {
          const currentTime = this.youtubePlayer.getCurrentTime();
          const duration = this.youtubePlayer.getDuration();
          this.watchedTime = Math.max(this.watchedTime, currentTime);
          if (duration > 0) {
            this.videoWatchedPercentage = (this.watchedTime / duration) * 100;
            console.log(`YouTube progress: ${this.videoWatchedPercentage.toFixed(1)}%`);
            if (this.videoWatchedPercentage >= 98) {
              this.isVideoWatched = true;
              console.log('YouTube video marked as watched');
              clearInterval(this.progressTrackingInterval);
            }
          }
        } catch (error) {
          console.error('Error tracking YouTube progress:', error);
        }
      }
    }, 1000);
  }

  onYoutubePlayerStateChange(event) {
    if (event.data === 1) {
      console.log('YouTube video is playing');
    } else if (event.data === 0) {
      console.log('YouTube video ended');
      this.isVideoWatched = true;
      if (this.progressTrackingInterval) {
        clearInterval(this.progressTrackingInterval);
      }
    }
  }

  onVideoTimeUpdate(event: any) {
    const video = event.target;
    const currentTime = video.currentTime;
    const duration = video.duration;
    this.watchedTime = Math.max(this.watchedTime, currentTime);
    if (duration > 0) {
      this.videoWatchedPercentage = (this.watchedTime / duration) * 100;
      console.log(`Video progress: ${this.videoWatchedPercentage.toFixed(1)}%`);
      if (this.videoWatchedPercentage >= 98) {
        this.isVideoWatched = true;
        console.log('Video marked as watched');
      }
    }
  }

  onVideoEnded() {
    console.log('Video playback completed');
    this.isVideoWatched = true;
  }

  navigateToAnotherComponent() {
    if (this.slides[this.currentSlideIndex].slideType === 'video') {
      const videoData = this.VideoSlideData ||
                       this.slides[this.currentSlideIndex].uploadLmsSlideFileModelData?.find(x => x.type === 'video');
      if (videoData && videoData.isRequired && !this.isVideoWatched) {
        this.notificationService.infoTopRight("Please watch the video before proceeding");
        return;
      }
    }

    if (this.slides[this.currentSlideIndex].slideType === 'audio-content') {
      const audioData = this.slides[this.currentSlideIndex].uploadLmsSlideFileModelData
        ?.find(x => x.type === 'audio-content');
      if (audioData && audioData.isRequired && !this.audioCompleted) {
        this.notificationService.infoTopRight("Please listen to the audio before proceeding");
        return;
      }
    }

    if (this.currentSlideIndex < this.slides.length - 1) {
      const nextIndex = this.currentSlideIndex + 1;
      const nextSlide = this.slides[nextIndex];
      this.currentSlideIndex = nextIndex;
      this.loadSlideData(nextSlide.slideId);
    } else {
      this.service.GetQuizDataByCourse(this.courseid).subscribe((quizData: any) => {
        if (this.courseStatus === "Pass" || this.courseStatus === "Completed") {
          this.notificationService.infoTopRight("Slides Completed. You have already passed this quiz.");
          this.router.navigate(['/kohler-studio-course-result', this.courseid]);
        } else if (this.isPreview) {
          this.router.navigate(['/kohler-studio-course-quiz', this.courseid], {
            queryParams: { preview: 'true' }
          });
        } else if (quizData && quizData.questionWithOptions?.length > 0) {
          this.router.navigate(["/kohler-studio-course-quiz", this.courseid]);
        } else {
          const isPreview = JSON.parse(sessionStorage.getItem('isPreview'));
          this.router.navigate(isPreview ?
            ['training-courses/training-course-edit-add', this.courseid] :
            ['/academy-curriculums']);
        }
      });
    }
  }
}