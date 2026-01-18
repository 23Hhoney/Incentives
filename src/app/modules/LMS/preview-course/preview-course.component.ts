import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TrainingCourseManagerService } from 'app/modules/admin-panel/training-course-manager/training-course-manager.service';
import { URLService } from 'app/modules/url-service/url.service';

@Component({
  selector: 'app-preview-course',
  templateUrl: './preview-course.component.html',
  styleUrls: ['./preview-course.component.scss']
})

export class PreviewCourseComponent {
  @ViewChild('vimeoPlayer', { static: false }) videoPlayer: ElementRef;
  @ViewChild('audioPlayer') audioPlayer: ElementRef;
  isDesktopView: boolean = true;
  currentBreakpoint: string = 'desktop';
  mobileWidth: number = 400;
  mobileHeight: number;

  imageUrl: string;
  sanitizedVideoUrl: SafeResourceUrl;
  textBoxPositions: any[] = [];
  buttonPositions: any[] = [];
  imageElements: any[] = [];
  videoPosition: any = null;
  videoDimensions: any = null;
  VideoSlideData: any = null;
  elements: any[] = [];

  isYoutubeVideo: boolean = false;
  isVimeoVideo: boolean = false;
  audioUrl: any = null;
  elementPositions: any = {};
  loader: boolean = true;
  noDataFound: boolean = false;

  editors: any[] = [];
  buttons: any[] = [];
  textBoxName: string = '';
  textBoxContent: string = '';
  hasAudio: boolean = false;

  textPositionCorrectionY: number = 0;
  audioAutoplay: boolean = false;
  @ViewChild('audioPlayer') audioPlayerRef: ElementRef<HTMLAudioElement>;

  positionCorrectionX: number = -96 + 150;
  positionCorrectionY: number = -60;
  showPositionDebug: boolean = false;
  private resizeTimeout: any;

  constructor(
    private route: ActivatedRoute,
    private service: TrainingCourseManagerService,
    private sanitizer: DomSanitizer,
    private urlService: URLService,
    private cdr: ChangeDetectorRef
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      const previousView = this.isDesktopView;
      this.setMobileSize();
      this.checkViewportSize();
      if (previousView !== this.isDesktopView) {
        this.refreshSlideLayout();
      }
    }, 250);
  }

  ngOnInit() {
    this.setMobileSize();
    this.checkViewportSize();
    const slideId = this.route.snapshot.params['slideId'];
    this.loadSlideData(slideId);
  }

  ngAfterViewInit() {
    if (this.audioPlayer) {
      this.audioPlayer.nativeElement.load();
    }
    this.playAudioIfAutoplay();
    
    setTimeout(() => {
      this.adjustElementPositions();
      if (this.textBoxPositions.length > 0 && this.imageElements.length > 0) {
        this.manuallyAdjustPositions();
      }
      if (!this.isDesktopView) {
        this.adjustElementsForMobileView();
      }
    }, 100);
  }

  setMobileSize() {
    const screenWidth = window.innerWidth;
    this.mobileWidth = screenWidth < 600 ? screenWidth - 32 : 400;
    this.mobileHeight = window.innerHeight * 0.7;
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
    
    console.log('Viewport changed to:', this.currentBreakpoint, 'Width:', width);
  }

  getResponsiveFontSize(originalSize: number): number {
    const baseFontSize = originalSize || 14;
    
    switch (this.currentBreakpoint) {
      case 'small-mobile':
        return Math.max(baseFontSize * 0.8, 12);
      case 'mobile':
        return Math.max(baseFontSize * 0.9, 13);
      case 'tablet':
        return Math.max(baseFontSize * 0.95, 14);
      default:
        return baseFontSize;
    }
  }

  adjustElementsForMobileView() {
    if (this.isDesktopView || !this.elements || this.elements.length === 0) {
      return;
    }

    const sortedElements = [...this.elements].sort((a, b) => a.yPercent - b.yPercent);
    let lastElementBottom = 0;

    sortedElements.forEach((element, index) => {
      const elementRef = document.getElementById(`element-${element.id || index}`);
      if (!elementRef) {
        console.warn(`Element with id element-${element.id || index} not found`);
        return;
      }

      if (element.type === 'text') {
        const scrollHeight = elementRef.scrollHeight;
        const clientHeight = elementRef.clientHeight;
        const containerHeight = this.mobileHeight;

        if (scrollHeight > clientHeight) {
          const newHeightPercent = (scrollHeight / containerHeight) * 100;
          element.heightPercent = Math.max(element.heightPercent || 10, newHeightPercent);
        }

        element.yPercent = lastElementBottom;
        lastElementBottom = element.yPercent + (element.heightPercent || 10) + 2;
      } else if (element.type === 'video') {
        element.heightPercent = (this.mobileWidth / 16 * 9) / this.mobileHeight * 100;
        element.yPercent = lastElementBottom;
        lastElementBottom = element.yPercent + (element.heightPercent || 30) + 2;
      } else {
        element.yPercent = lastElementBottom;
        lastElementBottom = element.yPercent + (element.heightPercent || 10) + 2;
      }
    });

    this.elements = sortedElements;
    this.cdr.detectChanges();
  }

  loadSlideData(slideId: string) {
    this.loader = true;
    this.service.GetAllLmsSlideGroupFieldsandData(slideId).subscribe({
      next: (data) => {
        if (data) {
          this.processSlideData(data);
          this.refreshSlideLayout();
        } else {
          this.noDataFound = true;
        }
        this.loader = false;
      },
      error: (err) => {
        console.error('Error loading slide data:', err);
        this.loader = false;
        this.noDataFound = true;
      }
    });
  }

  getElementType(element: any): string {
    if (element.url && !element.text) return 'image';
    if (element.text && element.link) return 'button';
    return 'text';
  }

  refreshSlideLayout() {
    if (!this.isDesktopView) {
      console.log('Refreshing slide layout for mobile view');
      this.processExistingDataForViewport();
      setTimeout(() => this.adjustElementsForMobileView(), 0);
    } else {
      console.log('Refreshing slide layout for desktop view');
      this.elements = [
        ...this.textBoxPositions.map(t => ({ ...t, type: 'text', order: t.yPercent, sequence: t.sequence || 0 })),
        ...this.buttonPositions.map(b => ({ ...b, type: 'button', order: b.yPercent, sequence: b.sequence || 0 })),
        ...this.imageElements.map(i => ({ ...i, type: 'image', order: i.yPercent, sequence: i.sequence || 0 })),
        ...(this.hasAudio && this.audioUrl ? [{ type: 'audio', content: this.audioUrl, order: this.elementPositions['audio']?.yPercent || 0, sequence: 998, xPercent: this.elementPositions['audio']?.xPercent || 0, heightPercent: this.elementPositions['audio']?.heightPercent || 10 }] : []),
        ...(this.VideoSlideData?.videoUrl || this.sanitizedVideoUrl ? [{ type: 'video', content: this.VideoSlideData?.videoUrl || this.sanitizedVideoUrl, order: this.videoPosition?.yPercent || 0, sequence: 999, xPercent: this.videoPosition?.xPercent || 0, heightPercent: this.videoDimensions?.heightPercent || 30 }] : [])
      ];
    }
  }

  processExistingDataForViewport() {
    const images = this.imageElements.map((image, index) => ({
      ...image,
      type: 'image',
      yPercent: image.yPercent || 0,
      xPercent: image.xPercent || 0,
      sequence: image.sequence || index + 200,
      content: image.url, // Ensure content is set to URL for images
      fileName: image.fileName,
      hyperlink: image.hyperlink
    }));

    const texts = this.textBoxPositions.map((text, index) => ({
      ...text,
      type: 'text',
      yPercent: text.yPercent || 0,
      xPercent: text.xPercent || 0,
      sequence: text.sequence || index,
      content: text.content
    }));

    const buttons = this.buttonPositions.map((button, index) => ({
      ...button,
      type: 'button',
      yPercent: button.yPercent || 0,
      xPercent: button.xPercent || 0,
      sequence: button.sequence || index + 100,
      content: button.text, // Ensure content is set to text for buttons
      link: button.link
    }));

    const pairedElements: any[] = [];

    if (this.hasAudio && this.audioUrl) {
      pairedElements.push({
        type: 'audio',
        content: this.audioUrl,
        yPercent: this.elementPositions['audio']?.yPercent || 0,
        xPercent: this.elementPositions['audio']?.xPercent || 0,
        sequence: 998,
        heightPercent: this.elementPositions['audio']?.heightPercent || 10
      });
    }

    if (this.VideoSlideData?.videoUrl || this.sanitizedVideoUrl) {
      pairedElements.push({
        type: 'video',
        content: this.VideoSlideData?.videoUrl || this.sanitizedVideoUrl,
        yPercent: this.videoPosition?.yPercent || 0,
        xPercent: this.videoPosition?.xPercent || 0,
        sequence: 999,
        heightPercent: this.videoDimensions?.heightPercent || 30
      });
    }

    const layoutPattern = this.detectMobileLayoutPattern(images, texts, buttons);
    console.log('Detected mobile layout pattern:', layoutPattern);

    switch (layoutPattern) {
      case 'text-image-button-pairs':
        this.createTextImageButtonPairs(images, texts, buttons, pairedElements);
        break;
      case 'text-above-below-image':
        this.createTextAroundImageLayout(images, texts, buttons, pairedElements);
        break;
      case 'text-button-pairs':
        this.createTextButtonPairs(texts, buttons, pairedElements);
        break;
      default:
        this.createSequentialLayout(images, texts, buttons, pairedElements);
    }

    this.elements = pairedElements.sort((a, b) => a.yPercent - b.yPercent);
    console.log('Processed elements for mobile:', this.elements);
  }

  processSlideData(data: any) {
    this.textBoxPositions = [];
    this.buttonPositions = [];
    this.imageElements = [];
    this.elements = [];
    this.videoPosition = null;
    this.videoDimensions = null;
    this.VideoSlideData = null;
    this.sanitizedVideoUrl = null;
    this.elementPositions = {};

    if (data.lmsSlideGroupViewDatas && data.lmsSlideGroupViewDatas.length > 0) {
      const textGroups = data.lmsSlideGroupViewDatas.filter(group => group.name === 'text');
      textGroups.forEach(group => {
        if (group.lmsSlideGroupFieldViews && group.lmsSlideGroupFieldViews.length > 0) {
          group.lmsSlideGroupFieldViews.forEach(field => {
            const defaultValue = this.parseDefaultValue(field.defaultValue);
            const position = defaultValue.position || {};

            console.log(`Processing text field ${field.name}:`, defaultValue);

            const textData = {
              id: field.id,
              content: this.applyTextStyles(field.lmsSlideGroupFieldsValueViewData?.htmlEditorValue || '', defaultValue.style),
              xPercent: position.xPercent || 0,
              yPercent: position.yPercent || 0,
              widthPercent: defaultValue.widthPercent || 20,
              heightPercent: defaultValue.heightPercent || 10,
              style: {
                bold: defaultValue.style?.bold || false,
                italic: defaultValue.style?.italic || false,
                underline: defaultValue.style?.underline || false,
                fontSize: defaultValue.style?.fontSize || 14,
                color: defaultValue.style?.color || '#000000',
                backgroundColor: defaultValue.style?.backgroundColor || 'transparent',
                textAlign: defaultValue.style?.textAlign || 'left'
              },
              zIndex: 25,
              name: field.name,
              sequence: group.sequence || 0
            };

            this.textBoxPositions.push(textData);
            this.elements.push({
              type: 'text',
              content: field.lmsSlideGroupFieldsValueViewData?.htmlEditorValue || '',
              style: textData.style,
              order: position.yPercent || 0,
              sequence: group.sequence || 0,
              id: field.id,
              xPercent: position.xPercent || 0,
              yPercent: position.yPercent || 0,
              widthPercent: defaultValue.widthPercent || 20,
              heightPercent: defaultValue.heightPercent || 10,
              zIndex: 25,
              name: field.name
            });
          });
        }
      });

      const buttonGroups = data.lmsSlideGroupViewDatas.filter(group => group.name === 'button');
      buttonGroups.forEach(group => {
        if (group.lmsSlideGroupFieldViews && group.lmsSlideGroupFieldViews.length > 0) {
          group.lmsSlideGroupFieldViews.forEach(field => {
            const defaultValue = this.parseDefaultValue(field.defaultValue);
            const htmlContent = field.lmsSlideGroupFieldsValueViewData?.htmlEditorValue || '';

            const buttonData = {
              id: field.id,
              text: this.extractButtonText(htmlContent) || 'Click Here',
              link: defaultValue.hyperlink || this.extractButtonLink(htmlContent) || '#',
              xPercent: defaultValue.position?.xPercent || 0,
              yPercent: defaultValue.position?.yPercent || 0,
              widthPercent: defaultValue.widthPercent || 10,
              heightPercent: defaultValue.heightPercent || 5,
              style: {
                backgroundColor: defaultValue.style?.backgroundColor || '#36a9e2',
                textColor: defaultValue.style?.color || '#ffffff',
                isBold: defaultValue.style?.bold || false,
                isItalic: defaultValue.style?.italic || false,
                isUnderline: defaultValue.style?.underline || false
              },
              zIndex: 20,
              sequence: group.sequence || 0
            };

            this.buttonPositions.push(buttonData);
            this.elements.push({
              type: 'button',
              content: buttonData.text, // Ensure content is set to text
              text: buttonData.text, // Explicitly include text property
              link: buttonData.link,
              style: buttonData.style,
              order: defaultValue.position?.yPercent || 0,
              sequence: group.sequence || 0,
              id: field.id,
              xPercent: defaultValue.position?.xPercent || 0,
              yPercent: defaultValue.position?.yPercent || 0,
              widthPercent: defaultValue.widthPercent || 10,
              heightPercent: defaultValue.heightPercent || 5,
              zIndex: 20
            });
          });
        }
      });

      const imageGroups = data.lmsSlideGroupViewDatas.filter(group => group.name === 'image');
      imageGroups.forEach(group => {
        if (group.lmsSlideGroupFieldViews && group.lmsSlideGroupFieldViews.length > 0) {
          group.lmsSlideGroupFieldViews.forEach(field => {
            if (field.lmsSlideContentFileViewData && field.lmsSlideContentFileViewData.length > 0) {
              const defaultValue = this.parseDefaultValue(field.defaultValue);
              field.lmsSlideContentFileViewData.forEach(imageData => {
                const contentData = this.parseDefaultValue(imageData.content);

                const imageElementData = {
                  id: field.id,
                  url: imageData.url,
                  fileName: imageData.fileName,
                  xPercent: contentData.position?.xPercent ?? defaultValue.position?.xPercent ?? 0,
                  yPercent: contentData.position?.yPercent ?? defaultValue.position?.yPercent ?? 0,
                  widthPercent: contentData.dimensions?.widthPercent ?? defaultValue.widthPercent ?? 30,
                  heightPercent: contentData.dimensions?.heightPercent ?? defaultValue.heightPercent ?? 20,
                  zIndex: contentData.zIndex ?? defaultValue.zIndex ?? 1,
                  hyperlink: contentData.hyperlink ?? null,
                  sequence: group.sequence || 0
                };

                this.imageElements.push(imageElementData);
                this.elements.push({
                  type: 'image',
                  content: imageData.url, // Ensure content is set to URL
                  url: imageData.url, // Explicitly include url property
                  order: contentData.position?.yPercent ?? defaultValue.position?.yPercent ?? 0,
                  sequence: group.sequence || 0,
                  hyperlink: contentData.hyperlink ?? null,
                  id: field.id,
                  fileName: imageData.fileName,
                  xPercent: contentData.position?.xPercent ?? defaultValue.position?.xPercent ?? 0,
                  yPercent: contentData.position?.yPercent ?? defaultValue.position?.yPercent ?? 0,
                  widthPercent: contentData.dimensions?.widthPercent ?? defaultValue.widthPercent ?? 30,
                  heightPercent: contentData.dimensions?.heightPercent ?? defaultValue.heightPercent ?? 20,
                  zIndex: contentData.zIndex ?? defaultValue.zIndex ?? 1
                });
              });
            }
          });
        }
      });
    }

    if (data.uploadLmsSlideFileModelData && data.uploadLmsSlideFileModelData.length > 0) {
      const videoData = data.uploadLmsSlideFileModelData.find(item => item.type === 'video');
      if (videoData) {
        const positionData = this.parseDefaultValue(videoData.position);
        this.videoPosition = {
          xPercent: positionData.xPercent || 0,
          yPercent: positionData.yPercent || 0
        };
        this.videoDimensions = {
          widthPercent: positionData.widthPercent || 40,
          heightPercent: positionData.heightPercent || 30
        };

        if (videoData.content) {
          this.setupVideo(videoData.content);
        } else if (videoData.url) {
          this.VideoSlideData = { videoUrl: videoData.url };
          this.isYoutubeVideo = false;
          this.isVimeoVideo = false;
        }

        this.elements.push({
          type: 'video',
          content: videoData.content || videoData.url,
          order: positionData.yPercent || 0,
          sequence: 999,
          xPercent: positionData.xPercent || 0,
          yPercent: positionData.yPercent || 0,
          heightPercent: positionData.heightPercent || 30
        });
      }

      const audioData = data.uploadLmsSlideFileModelData.find(item => item.type === 'audio' || item.type === 'audio-content');
      if (audioData) {
        console.log('Found audio data:', audioData);
        this.audioUrl = audioData.url || '';
        this.hasAudio = !!this.audioUrl;
        this.audioAutoplay = audioData.isPlay === true;

        const positionData = this.parseDefaultValue(audioData.position);
        this.elementPositions['audio'] = {
          xPercent: positionData.xPercent || 0,
          yPercent: positionData.yPercent || 0,
          widthPercent: positionData.widthPercent || 40,
          heightPercent: positionData.heightPercent || 10
        };

        this.elements.push({
          type: 'audio',
          content: audioData.url,
          order: positionData.yPercent || 0,
          sequence: 998,
          xPercent: positionData.xPercent || 0,
          yPercent: positionData.yPercent || 0,
          heightPercent: positionData.heightPercent || 10
        });
      }
    }

    this.noDataFound = (
      this.textBoxPositions.length === 0 &&
      this.buttonPositions.length === 0 &&
      this.imageElements.length === 0 &&
      !this.VideoSlideData?.videoUrl &&
      !this.sanitizedVideoUrl &&
      !this.hasAudio
    );
  }

  applyTextStyles(content: string, style: any): string {
    if (style.bold) {
      content = `<strong>${content}</strong>`;
    }
    if (style.italic) {
      content = `<em>${content}</em>`;
    }
    if (style.underline) {
      content = `<u>${content}</u>`;
    }
    return content;
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
        });
      }
    }
  }

  formatHyperlink(link: string): string {
    if (!link) return null;
    if (link.startsWith('http://') || link.startsWith('https://')) return link;
    if (link.startsWith('mailto:') || link.startsWith('tel:')) return link;
    return `https://${link}`;
  }

  getSafeAudioUrl(url: string): SafeResourceUrl {
    if (!url) return '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  adjustElementPositions() {
    const container = document.querySelector('.container') as HTMLElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const offsetX = containerRect.left;
    const offsetY = containerRect.top;
    
    const computedStyle = window.getComputedStyle(container);
    const marginLeft = parseInt(computedStyle.marginLeft, 10) || 150;
    
    this.positionCorrectionX = -offsetX + marginLeft;
    this.positionCorrectionY = -offsetY;
    
    this.textPositionCorrectionY = 0; 
  }

  manuallyAdjustPositions() {
    const headerText = this.textBoxPositions.find(t => t.name === 'Text 1');
    const footerText = this.textBoxPositions.find(t => t.name === 'Text 2');
    
    if (headerText && footerText && this.imageElements.length > 0) {
      const firstImage = this.imageElements[0];
      const imageTop = firstImage.yPercent;
      
      if (headerText.yPercent > imageTop - 100) {
        headerText.yPercent = imageTop - 100;
      }
      
      const imageBottom = imageTop + firstImage.heightPercent;
      if (footerText.yPercent < imageBottom + 20) {
        footerText.yPercent = imageBottom + 20;
      }
    }
  }
  validateDimension(value: number | undefined | null, fallback: number): number {
    if (value === undefined || value === null || isNaN(Number(value))) return fallback;
    return Math.min(100, Math.max(0, Number(value)));
  }

  mapVerticalAlign(val?: string): string {
    if (!val) return 'flex-start';
    const v = val.toLowerCase();
    if (v === 'top') return 'flex-start';
    if (v === 'middle' || v === 'center') return 'center';
    if (v === 'bottom') return 'flex-end';
    return 'flex-start';
  }

  mapHorizontalAlignItems(textAlign?: string): string {
    if (!textAlign) return 'stretch';
    const t = textAlign.toLowerCase();
    if (t === 'left') return 'flex-start';
    if (t === 'center' || t === 'justify') return 'center';
    if (t === 'right') return 'flex-end';
    return 'stretch';
  }
  togglePositionDebug() {
    this.showPositionDebug = !this.showPositionDebug;
  }

  private parseDefaultValue(value: string) {
    try {
      return value ? JSON.parse(value) : {};
    } catch (e) {
      console.error('Error parsing default value:', e);
      return {};
    }
  }

  setupVideo(videoUrl: string) {
    if (!videoUrl) return;
    
    this.isYoutubeVideo = false;
    this.isVimeoVideo = false;
    
    console.log('Setting up video with URL:', videoUrl);
    
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const videoId = this.extractYouTubeVideoId(videoUrl);
      if (videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
        this.isYoutubeVideo = true;
        console.log('YouTube video detected, ID:', videoId);
      }
    } else if (videoUrl.includes('vimeo.com')) {
      const videoId = this.extractVimeoVideoId(videoUrl);
      console.log('Extracted Vimeo ID:', videoId);
      
      if (videoId) {
        let embedUrl = '';
        if (videoUrl.includes('/')) {
          const urlParts = videoUrl.split('/');
          const hash = urlParts[urlParts.length - 1];
          
          if (hash && hash !== videoId) {
            embedUrl = `https://player.vimeo.com/video/${videoId}?h=${hash}&autoplay=0&title=0&byline=0&portrait=0`;
            console.log('Private Vimeo video with hash:', hash);
          } else {
            embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=0&title=0&byline=0&portrait=0`;
          }
        } else {
          embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=0&title=0&byline=0&portrait=0`;
        }
        
        console.log('Vimeo embed URL:', embedUrl);
        this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
        this.isVimeoVideo = true;
      }
    } else {
      this.VideoSlideData = { videoUrl };
      this.isYoutubeVideo = false;
      this.isVimeoVideo = false;
      console.log('Local video detected');
    }
  }

  extractVimeoVideoId(url: string): string {
    if (!url) return '';
    
    console.log('Extracting Vimeo ID from:', url);
    
    try {
      url = url.trim();
      
      const privateRegex = /vimeo\.com\/(\d+)\/([a-zA-Z0-9]+)/;
      const privateMatch = url.match(privateRegex);
      if (privateMatch && privateMatch[1]) {
        console.log('Matched private Vimeo URL pattern, ID:', privateMatch[1]);
        return privateMatch[1];
      }
      
      const patterns = [
        /vimeo\.com\/(\d+)/,
        /player\.vimeo\.com\/video\/(\d+)/,
        /vimeo\.com\/channels\/[a-zA-Z0-9]+\/(\d+)/,
        /vimeo\.com\/groups\/[a-zA-Z0-9]+\/videos\/(\d+)/,
        /vimeo\.com\/album\/[a-zA-Z0-9]+\/video\/(\d+)/,
        /vimeo\.com\/showcase\/[a-zA-Z0-9]+\/video\/(\d+)/
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          console.log('Matched standard Vimeo URL pattern, ID:', match[1]);
          return match[1];
        }
      }
      
      console.warn('Could not extract Vimeo ID from URL:', url);
      return '';
    } catch (error) {
      console.error('Error extracting Vimeo ID:', error);
      return '';
    }
  }

  extractYouTubeVideoId(url: string): string {
    let match = url.match(/youtube\.com\/watch\?v=([^&]+)/);
    if (match) return match[1];
    
    match = url.match(/youtu\.be\/([^?]+)/);
    if (match) return match[1];
    
    match = url.match(/youtube\.com\/embed\/([^?]+)/);
    if (match) return match[1];
    
    return '';
  }

  extractButtonText(html: string): string {
    if (!html) return 'Click Here';
    
    const buttonMatch = html.match(/<button[^>]*>(.*?)<\/button>/i);
    if (buttonMatch && buttonMatch[1]) {
      return buttonMatch[1].replace(/<[^>]*>/g, '').trim();
    }
    
    const textMatch = html.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i);
    if (textMatch && textMatch[1]) {
      return textMatch[1].replace(/<[^>]*>/g, '').trim();
    }
    
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent || 'Click Here';
  }

  extractButtonLink(html: string): string {
    if (!html) return '#';
    
    const windowOpenMatch = html.match(/window\.open\(['"]([^'"]+)['"]/);
    if (windowOpenMatch) return windowOpenMatch[1];
    
    const hrefMatch = html.match(/href=['"]([^'"]+)['"]/);
    if (hrefMatch) return hrefMatch[1];
    
    return '#';
  }

  extractButtonStyle(html: string) {
    const styleMatch = html?.match(/style="([^"]+)"/);
    const styleString = styleMatch ? styleMatch[1] : '';
    
    return {
      backgroundColor: this.extractStyleProperty(styleString, 'background-color') || '#36a9e2',
      textColor: this.extractStyleProperty(styleString, 'color') || '#ffffff',
      isBold: styleString.includes('font-weight: bold'),
      isItalic: styleString.includes('font-style: italic'),
      isUnderline: styleString.includes('text-decoration: underline')
    };
  }

  extractStyleProperty(styleString: string, property: string): string {
    const match = styleString.match(new RegExp(`${property}:\\s*([^;]+)`));
    return match ? match[1].trim() : '';
  }

  openButtonLink(link: string) {
    if (link && link !== '#') {
      const url = link.startsWith('http') ? link : `https://${link}`;
      window.open(url, '_blank');
    }
  }

  navigateBack() {
    window.close();
  }

  getSafeHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content || '');
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
      console.log('Detected pattern: text-image-button-pairs');
      return 'text-image-button-pairs';
    }
    
    if (images.length > 0 && texts.length >= images.length && buttons.length === 0) {
      console.log('Detected pattern: text-above-below-image');
      return 'text-above-below-image';
    }
    
    if (texts.length > 0 && buttons.length > 0 && images.length === 0) {
      console.log('Detected pattern: text-button-pairs');
      return 'text-button-pairs';
    }
    
    console.log('Detected pattern: sequential');
    return 'sequential';
  }

  checkTextsAroundImages(images: any[], texts: any[]): boolean {
    if (images.length === 0 || texts.length < 2) return false;
    
    const avgImageY = images.reduce((sum, img) => sum + img.yPercent, 0) / images.length;
    
    const textsAbove = texts.filter(text => text.yPercent < avgImageY);
    const textsBelow = texts.filter(text => text.yPercent > avgImageY);
    
    return textsAbove.length > 0 && textsBelow.length > 0;
  }

  createTextImageButtonPairs(images: any[], texts: any[], buttons: any[], pairedElements: any[]): void {
    const maxElements = Math.max(images.length, texts.length, buttons.length);
    
    for (let i = 0; i < maxElements; i++) {
      const currentGroup = [];
      
      if (texts[i]) currentGroup.push({ element: texts[i], type: 'text' });
      if (images[i]) currentGroup.push({ element: images[i], type: 'image' });
      if (buttons[i]) currentGroup.push({ element: buttons[i], type: 'button' });
      
      currentGroup.sort((a, b) => a.element.yPercent - b.element.yPercent);
      
      currentGroup.forEach(item => pairedElements.push(item.element));
    }
  }

  createTextAroundImageLayout(images: any[], texts: any[], buttons: any[], pairedElements: any[]): void {
    const mainImage = images[0];
    
    const textsAbove = texts.filter(text => text.yPercent < mainImage.yPercent)
      .sort((a, b) => a.yPercent - b.yPercent);
    const textsBelow = texts.filter(text => text.yPercent > mainImage.yPercent)
      .sort((a, b) => a.yPercent - b.yPercent);
    
    textsAbove.forEach(text => pairedElements.push(text));
    images.forEach(image => pairedElements.push(image));
    textsBelow.forEach(text => pairedElements.push(text));
    
    buttons.forEach(button => pairedElements.push(button));
  }

  createTextButtonPairs(texts: any[], buttons: any[], pairedElements: any[]): void {
    const maxElements = Math.max(texts.length, buttons.length);
    
    for (let i = 0; i < maxElements; i++) {
      if (texts[i]) pairedElements.push(texts[i]);
      if (buttons[i]) pairedElements.push(buttons[i]);
    }
  }

  createSequentialLayout(images: any[], texts: any[], buttons: any[], pairedElements: any[]): void {
    const allElements = [...images, ...texts, ...buttons];
    allElements.sort((a, b) => a.yPercent - b.yPercent);
    
    pairedElements.push(...allElements);
  }
}




