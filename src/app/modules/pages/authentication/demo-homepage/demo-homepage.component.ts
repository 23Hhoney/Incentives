import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ManageWebsiteService } from '../manage-website/manage-website.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormGroup } from '@angular/forms';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CKEditorComponent } from '@ckeditor/ckeditor5-angular';
import { catchError, of, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from 'app/shared/notification/notification';

@Component({
  selector: 'app-demo-homepage',
  templateUrl: './demo-homepage.component.html',
  styleUrls: ['./demo-homepage.component.scss']
})
export class DemoHomepageComponent {
  publishedPage = null;
  sectionsArray = [];
  trainingEmbededVideo = null;
  view = [700, 400]
  @ViewChild('scrollContainerItem') scrollContainerItem!: ElementRef;
  @ViewChild(BaseChartDirective) baseChart!: BaseChartDirective;
  @ViewChild('vimeoPlayer', { static: false }) videoPlayer: ElementRef;
  clonedSection = null;
  sliderFlag = null;
  localAsset = 'assets/images/kohler_logo.png';
  logoUrl = 'assets/images/kohler_logo.png';
  logoId = null;
  logoTitle = null;
  showLogoPopup = false;
  disableDrag = false;
  showChild = false;
  editChild = false;
  indexToPush = 0;
  sectionObject = {
    isPie: false,
    isLine: false,
    isbar: false,
    academy: false,
    all: false,
    credit: false,
    redemption: false,
    article: true,
    messages: false,
    singlepanel: false,
    text: false,
    goalTracker: true,
    trainingMonth: false,
  }
  videoFiles = null;
  editHeaderFlag = false
  addSection = false;
  containerPopup = false;
  showMenu = false;
  showGroupforadmin = false;
  showGroupforadminsins = false;
  showGroup = false;
  homeText = 'Home';
  sectionContainer = [];
  previousLink = null;
  showLink = false;
    private updateSectionHeightsTimer: any = null;

  isChild = false;
 // ckeConfig: CKEDITOR.config;
  @ViewChild("myckeditorTI1") ckeditorTI1: CKEditorComponent;
  @ViewChild("myckeditorTI2") ckeditorTI2: CKEditorComponent;
  navigationArray = [
   
  ]
  // home component data
  ytdSales: number = 0; 
  pieChartOptions: ChartOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          pointStyle: 'circle',
          boxWidth: 10,
          padding: 20,
          font: {
            size: 12,
            lineHeight: 1.5,
          },
        }
      }
    },
    maintainAspectRatio: false, 
  };
  
  private carouselSubscription: Subscription;
  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;

  totalCourse = 0;
  currentCarousel = 0;
  totalAttempted = 0;
  remainingPoints = 0;
  pointsCredited = 0;
  isSalesSelected = false;
  showManagePage = false;
  pieChartType: ChartType = 'pie';
  colorScheme = {
    domain: ["#C94D6D", "#4174C9", "#876B8E", "#8DBCCC", "#8FAAC6", "#8C4D57", "#b89dc7", "#966577", "#95a3de", "#fb9ad4", "#99738a", "#ccbdaf", "#97c4a0", "#c9adc9", "#e3ccba", "#bfe0b8", "#b7d2f7", "#d0c7f2", "#b6f0bf", "#d6bfd6"]
  };

  lineChartOptions: ChartOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          pointStyle: 'circle'
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value:number = context.raw as number;
            if (this.isSalesSelected ) {
              return `Sales: $${this.formatNumberWithCommas(value.toFixed(2))}`;
            } else if (!this.isSalesSelected) {
              return `Points: ${this.formatNumberWithCommas(value)}`;
            }
            return `${context.dataset.label}: ${value}`;
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: true
  };
   audioAutoplay: boolean = true;

 pieChartData = [
    { name: "Electronics", value: 25000 },
    { name: "Clothing", value: 15000 },
    { name: "Home Appliances", value: 10000 },
    { name: "Accessories", value: 5000 },
    { name: "Furniture", value: 8000 }
  ];

  // Bar Chart Data
  totalSales = 3500000;
  targetValue = 5000000;

  // Line Chart Data
  monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  lineChartDataset = [
    {
      label: "Sales",
      data: [120000, 150000, 180000, 200000, 220000, 250000, 270000, 260000, 240000, 230000, 210000, 200000],
      borderColor: "#007bff",
      backgroundColor: "rgba(0, 123, 255, 0.1)",
      fill: false,
      tension: 0.4
    },
    {
      label: "Points",
      data: [500, 600, 750, 800, 900, 1000, 950, 920, 880, 850, 820, 800],
      borderColor: "#ff69b4",
      backgroundColor: "rgba(255, 105, 180, 0.1)",
      fill: false,
      tension: 0.4
    }
  ];
  lineChartData = {
    labels: this.monthLabels,
    datasets: [this.isSalesSelected ? this.lineChartDataset[0] : this.lineChartDataset[1]]
  };
 
  lineChartType: ChartType = 'line';
  apiRequest = {
    itemCount:4,
    pageIndex: 1,
    pageLimit: 4,
    sortBy: "name",
    search: "",
    sortDirection: "desc",
    filter: []
  };
  notiApiRequest = {
    itemCount:3,
    pageIndex: 1,
    pageLimit: 3,
    sortBy: "",
    search: "",
    sortDirection: "",
    filter: []
  }
  lineChartLoading = false;
  sideNavArray = []
  sideNavSubItemArray = []
  pieChartLoading = false;
  pointsAndSummaryLoading = false;
  isCurriculumLoading = false;
  isTransactionLoading = false;
  userType = 'normaluser';
  isNotificationLoading = false;
  curriculumData = [];
  transactionData = []
  selectedManagePageId = null;
  notifications = {customRecordCount: 0, totalRecords: 0, results: []};
  data: any;
  userName = sessionStorage.getItem('name')
  siteForm: FormGroup;
  manageForm: FormGroup;
  manageNavForm: FormGroup;
  fileName = null;
  file = null;
  showMenuManagePage = false
  modalReference: any;
  deleteItem = null;
  deleteElement: any; 
  TemplatesArray = [];
  showTemplateswindow = false;
  originalSections: string = '';
  mobileView = false;
  showError: boolean;
  storedMobileView = null;

 constructor(
  private manageWebsiteContent: ManageWebsiteService,
  private sanitizer: DomSanitizer,
  private route: ActivatedRoute,
  private notificationService: NotificationService,
  private changeDetectorRef: ChangeDetectorRef
) {
  this.showError = false; // Initialize error state
  this.route.queryParams.subscribe(params => {
    if (params.id && params.key) {
      this.manageWebsiteContent
        .CheckSecretKeyValidation(params.id, params.key, JSON.parse(params.isd) ? 'publish' : 'draft')
        .pipe(
          catchError(error => {
            this.showError = true; 
            this.changeDetectorRef.detectChanges(); // Trigger change detection
            return of(null);
          })
        )
        .subscribe((resp) => {
          if (resp && resp.message === "not expired!") {
            this.showError = false; // Reset error state on success
            this.manageWebsiteContent.GetAllCMSHeader(params.isd).subscribe((resp) => {
              if (resp && resp.length > 0) {
                this.logoUrl = resp[0].logo;
                this.logoTitle = resp[0].title;
              } else {
                this.logoUrl = this.localAsset;
                this.logoTitle = null;
              }
              this.changeDetectorRef.detectChanges(); // Update view
            });
           this.manageWebsiteContent.GetAllCMSMenu(false).subscribe((res: any[]) => {
      const filteredRes = res.filter(item => !item.menuId.startsWith('DRFT_') && item.menuId !== 'DRFT_RESTORED');

      filteredRes.forEach((items) => {
        if ((items.menuId === '' || items.menuId === 'HM') && !items.isPublish) {
          this.publishedPage = items;
        }
      });

      if (this.publishedPage && this.publishedPage.menuId === 'HM') {
        this.manageWebsiteContent.GetAllCMSContainer(resp.id, params.isd).subscribe((resp: any[]) => {
          this.sectionsArray = resp.map((section, sectionIndex) => {
            const parsedStylesArray = section.getAllCMSContainerViews.map(item => {
              try {
                const styles = typeof item.styles === 'string' ? JSON.parse(item.styles) : item.styles || {};
                if (typeof styles.top === 'string') styles.top = parseFloat(styles.top);
                if (typeof styles.left === 'string') styles.left = parseFloat(styles.left);
                if (typeof styles.height === 'string') styles.height = parseFloat(styles.height);
                if (typeof styles.width === 'string') styles.width = parseFloat(styles.width);
                return styles;
              } catch (e) {
                console.warn('Failed to parse styles for item', item.id, ':', e);
                return { top: 0, left: 0, height: 50, width: 100 };
              }
            });
            return {
              id: section.id,
              position: section.position !== undefined ? section.position : sectionIndex,
              height: parseFloat(this.getSectionArrayMaxHeight(sectionIndex)),
              items: section.getAllCMSContainerViews
                .filter((items) => !(
                  (items.type === 'panel' || items.type === 'image' || items.type === 'video' || items.type === 'audio') &&
                  (!items.getAllCMSItemViews || items.getAllCMSItemViews.length === 0)
                ))
                .map((items, idx) => {
                  const parsedStyles = parsedStylesArray[idx];
                  let fitWidthData: any = {};
                  try {
                    fitWidthData = items.fitWidth ? JSON.parse(items.fitWidth) : {};
                    if (typeof fitWidthData.xPercent === 'string') fitWidthData.xPercent = parseFloat(fitWidthData.xPercent);
                    if (typeof fitWidthData.yPercent === 'string') fitWidthData.yPercent = parseFloat(fitWidthData.yPercent);
                    if (typeof fitWidthData.widthPercent === 'string') fitWidthData.widthPercent = parseFloat(fitWidthData.widthPercent);
                    if (typeof fitWidthData.heightPercent === 'string') fitWidthData.heightPercent = parseFloat(fitWidthData.heightPercent);
                  } catch (e) {
                    console.warn('Failed to parse fitWidth for item', items.id, ':', e);
                  }

                  let buttonStyle: any = {};
                  if (items.type === 'button' && items.salesHeading) {
                    try {
                      buttonStyle = typeof items.salesHeading === 'string' ? JSON.parse(items.salesHeading) : items.salesHeading;
                    } catch (e) {
                      console.warn('Failed to parse button salesHeading for item', items.id, ':', e);
                    }
                  }

                  let images: string[] = [];
                  let localVideoUrl: string | null = null;
                  let videoUrl: string | null = null;
                  let audioUrl: string | null = null;
                  let isYoutubeOrVimeo: boolean = false;
                  let autoPlay: boolean = false;
                  let loop: boolean = false;
                  let requireUserToWatch: boolean = false;

                  if (items.type === 'image' && items.getAllCMSItemViews?.length) {
                    images = items.getAllCMSItemViews.map(item => item.url).filter(url => !!url);
                  } else if (items.type === 'video' && items.getAllCMSItemViews?.length) {
                    const firstItem = items.getAllCMSItemViews[0];
                    if (firstItem.url) {
                      localVideoUrl = firstItem.url;
                    } else if (firstItem.content && (firstItem.content.includes('youtu') || firstItem.content.includes('youtube.com/embed/'))) {
                      videoUrl = firstItem.content;
                      if (videoUrl.includes('youtube.com/watch?v=')) {
                        const videoId = videoUrl.split('v=')[1]?.split('&')[0];
                        videoUrl = `https://www.youtube.com/embed/${videoId}`;
                      } else if (videoUrl.includes('youtu.be/')) {
                        const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
                        videoUrl = `https://www.youtube.com/embed/${videoId}`;
                      }
                      isYoutubeOrVimeo = true;
                    } else if (items.text && (items.text.includes('youtu') || items.text.includes('youtube.com/embed/'))) {
                      videoUrl = items.text;
                      if (videoUrl.includes('youtube.com/watch?v=')) {
                        const videoId = videoUrl.split('v=')[1]?.split('&')[0];
                        videoUrl = `https://www.youtube.com/embed/${videoId}`;
                      } else if (videoUrl.includes('youtu.be/')) {
                        const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
                        videoUrl = `https://www.youtube.com/embed/${videoId}`;
                      }
                      isYoutubeOrVimeo = true;
                    }

                    const videoItem = items.getAllCMSItemViews[0];
                    autoPlay = videoItem.autoPlay || false;
                    requireUserToWatch = videoItem.requireUserToWatch || videoItem.isRequired || false;

                    if (videoItem.bannerHeading) {
                      try {
                        const loopData = typeof videoItem.bannerHeading === 'string' ?
                          JSON.parse(videoItem.bannerHeading) : videoItem.bannerHeading;
                        loop = loopData.loop || false;
                      } catch (e) {
                        console.warn('Failed to parse loop from bannerHeading:', videoItem.bannerHeading);
                      }
                    }
                  } else if (items.type === 'audio') {
                    if (items.getAllCMSItemViews?.length) {
                      audioUrl = items.getAllCMSItemViews[0]?.url || items.getAllCMSItemViews[0]?.content || null;
                      const audioItem = items.getAllCMSItemViews[0];
                      autoPlay = audioItem.autoPlay || false;
                      requireUserToWatch = audioItem.requireUserToWatch || audioItem.isRequired || false;
                      if (audioItem.bannerHeading) {
                        try {
                          const loopData = typeof audioItem.bannerHeading === 'string'
                            ? JSON.parse(audioItem.bannerHeading)
                            : audioItem.bannerHeading;
                          loop = loopData.loop || false;
                        } catch (e) {
                          console.warn('Failed to parse loop from bannerHeading for audio:', audioItem.bannerHeading);
                        }
                      }
                    }
                    if (!audioUrl && items.text) {
                      audioUrl = items.text;
                    }
                  }
                  let textContent: string = '';
                  if (items.type === 'greeting') {
                    textContent = this.getGreetingHtml(items.text);
                  }
                  if (items.text) {
                    textContent = items.text;
                    if (items.type !== 'button' && items.type !== 'TrainingMonth' && !textContent.includes('<p>') && textContent.trim()) {
                      textContent = `<p>${textContent}</p>`;
                    }
                  } else if (items.getAllCMSItemViews?.length && items.getAllCMSItemViews[0].content) {
                    const firstItem = items.getAllCMSItemViews[0];
                    if (firstItem.type === 'text' || items.type === 'text' || items.type === 'textbox') {
                      textContent = firstItem.content;
                      if (items.type !== 'button' && !textContent.includes('<p>') && textContent.trim()) {
                        textContent = `<p>${textContent}</p>`;
                      }
                    }
                  }

                  const defaultLeft = idx * 20;
                  const defaultTop = 10;
                  const defaultHeight = this.getDefaultHeightForType(items.type);

                  return {
                    type: items.type,
                    className: items.className,
                    containerId: items.containerId,
                    id: items.id,
                    containerSize: items.containerSize || 30,
                    isVideo: items.isVideo || (videoUrl ? true : false),
                    text: textContent || items.text || '',
                    content: textContent || items.text || '',
                    selectedIndex: 0,
                    chartHeading: items.chartHeading,
                    salesHeading: items.salesHeading,
                    hyperlink: items.text || items.chartHeading || items.salesHeading || '', 
                    buttonStyle: buttonStyle,
                    styles: parsedStyles,
                    xPercent: fitWidthData.xPercent ?? (parsedStyles.left != null ? parseFloat(parsedStyles.left) : defaultLeft),
                    yPercent: fitWidthData.yPercent ?? (parsedStyles.top != null ? parseFloat(parsedStyles.top) : defaultTop),
                    widthPercent: fitWidthData.widthPercent ?? (items.containerSize || 30),
                    heightPercent: fitWidthData.heightPercent ?? (parsedStyles.height || defaultHeight),
                    zIndex: fitWidthData.zindex ?? (parsedStyles.zindex || (idx + 1)),
                    chartDropdown: items.chartDropdown,
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                    autoPlay: autoPlay,
                    loop: loop,
                    requireUserToWatch: requireUserToWatch,
                    images: images,
                    localVideoUrl: localVideoUrl,
                    videoUrl: videoUrl,
                    audioUrl: audioUrl,
                    isYoutubeOrVimeo: isYoutubeOrVimeo,
                    tempVideoUrl: !isYoutubeOrVimeo ? videoUrl : null,
                    currentIndex: 0,
                    title: (() => {
                      const bannerHeading = items.getAllCMSItemViews?.[0]?.bannerHeading;
                      if (!bannerHeading) return '';
                      try {
                        const parsed = JSON.parse(bannerHeading);
                        return parsed?.title || parsed || '';
                      } catch (e) {
                        return bannerHeading;
                      }
                    })(),
                    subtitle: items.getAllCMSItemViews?.[0]?.bannerSubHeading || '',
                    buttonUrl: items.getAllCMSItemViews?.[0]?.buttonUrl || items.chartHeading || '',
                    isClickable: items.getAllCMSItemViews?.[0]?.isClickable || !!items.chartHeading,
                    getAllCMSItemViews: (items.getAllCMSItemViews || []).map((item) => {
                      let itemFitWidthData: any = {};
                      try {
                        itemFitWidthData = item.fitWidth ? JSON.parse(item.fitWidth) : {};
                      } catch (e) {
                        console.warn('Failed to parse item fitWidth for item', item.id, ':', e);
                      }
                      return {
                        id: item.uploadId || item.id,
                        isVideo: item.isVideo,
                        bannerHeading: item.bannerHeading,
                        newHeadings: item.newHeadings || [],
                        uniqueId: item.uniqueId,
                        bannerSubHeading: item.bannerSubHeading,
                        videoFile: null,
                        ImageFile: null,
                        url: item.url,
                        content: item.content,
                        type: item.type,
                        panelType: item.panelType || 'image',
                        fullBleed: item.fullBleed,
                        fitWidth: item.fitWidth,
                        opacity: item.opacity,
                        autoPlay: item.autoPlay || false,
                        requireUserToWatch: item.isRequired || false,
                        buttonUrl: item.buttonUrl || '',
                        isClickable: item.isClickable || false
                      };
                    })
                  };
                })
            };
          }).sort((a, b) => {
            if (a.position === b.position) {
              return a.id.localeCompare(b.id);
            }
            return a.position - b.position;
          });

          this.sectionsArray.forEach((section, index) => {
            if (index > 0 && section.position === this.sectionsArray[index - 1].position) {
              section.position = this.sectionsArray[index - 1].position + 1;
            }
          });

          this.originalSections = JSON.stringify(this.sectionsArray);
          if (window.innerWidth <= 480) {
            this.storedMobileView = JSON.parse(JSON.stringify(this.sectionsArray));
            this.sectionsArray.forEach(section => {
              section.items = this.reorderCMSItemsByPosition(section.items);
            });
          }

          requestAnimationFrame(() => this.updateSectionHeights());
          this.changeDetectorRef.detectChanges();

          // Fetch data after sectionsArray and time periods are set
         
        });
      }
    });
          } else {
            this.showError = true; // Set error state if response is invalid
            // this.notificationService.errorTopRight(
            //   'The URL might be incorrect or has expired. Please verify and try again'
            // );
            this.changeDetectorRef.detectChanges();
          }
        });
    } else {
      this.showError = true; // Show error if query params are missing
      this.notificationService.errorTopRight('Page URL is incorrect.');
      this.changeDetectorRef.detectChanges();
    }
  });
  let chartWidth = window.innerWidth > 1100 ? 244 : window.innerWidth <= 1100 && window.innerWidth > 700 ? window.innerWidth - 240 : window.innerWidth <= 700 && window.innerWidth > 400 ? window.innerWidth - 150 : window.innerWidth - 80;
  this.view = [chartWidth, 300];
}
  ngOnInit(): void {
       setInterval(() => {
    const hour = new Date().getHours();
    const greetingMessage =
      hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
    this.sectionsArray?.forEach(section => {
      section.items?.forEach(item => {
        if (item.type === 'greeting' && item.text) {
          item.text = item.text.replace(
            /\[Good Morning\/Afternoon\/Evening\]/gi,
            greetingMessage
          );
        }
      });
    });
    this.changeDetectorRef.detectChanges();
  },); // every minute
    
  }


     ngAfterViewInit(): void {
    this.playAudioIfAutoplay();
    this.playYouTubeVideosIfAutoplay();
  }
 playYouTubeVideosIfAutoplay(): void {
    this.sectionsArray.forEach(section => {
      section.items.forEach(item => {
        if (item.type === 'video' && item.isYoutubeOrVimeo && item.videoUrl && item.autoPlay) {
          const iframe = document.querySelector(`iframe[aria-label='YouTube video player for ${item.id}']`) as HTMLIFrameElement;
          if (iframe) {
            const src = iframe.src;
            let newSrc = src;
            if (!src.includes('autoplay=1')) {
              newSrc = `${src}${src.includes('?') ? '&' : '?'}autoplay=1&mute=1`;
            }
            if (item.loop && !src.includes('loop=1')) {
              const videoId = src.split('/embed/')[1]?.split('?')[0];
              newSrc = `${newSrc}${newSrc.includes('?') ? '&' : '?'}loop=1&playlist=${videoId}`;
            }
            if (newSrc !== src) {
              iframe.src = newSrc;
              this.changeDetectorRef.detectChanges();
            }
          }
        }
      });
    });
  }
  formatHyperlink(link: string): string {
  if (!link) return null;
  if (link.match(/^https?:\/\//)) return link;
  if (link.includes('@')) return `mailto:${link}`;
  if (link.match(/^[\d\(\)\-\s\+]+$/)) return `tel:${link}`;
  return `https://${link}`;
}


  playAudioIfAutoplay(): void {
    if (this.audioAutoplay && this.audioPlayerRef?.nativeElement) {
      const audio = this.audioPlayerRef.nativeElement;

      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.then(() => {
        }).catch(error => {
          // Optionally show a play button here
        });
      }
    }
  }
  @HostListener('window:resize', [])
  onResizeWindow() {
    const width = (event.target as Window).innerWidth;
    this.handleResponsiveLayout(width);
  }

  handleResponsiveLayout(width: number) {
    if (width <= 480) {
      this.storedMobileView = JSON.parse(JSON.stringify(this.sectionsArray));
      this.sectionsArray.forEach(section => {
        section.items = this.reorderCMSItemsByPosition(section.items);
      });
    } else if (width > 480 && this.storedMobileView) {
      this.sectionsArray = JSON.parse(JSON.stringify(this.storedMobileView));
      this.storedMobileView = null;
      setTimeout(() => {
        this.updateSectionHeights();
      }, 200);
    }
  }
  setChartSize(item, i, j) {
    const container = document.querySelector('.chart-container-'+i+'-'+j) as HTMLElement;
    if (container) {
      const width = container.offsetWidth ? +container.offsetWidth : 0;
      const height = container.offsetHeight ? container.offsetHeight : 0;
      item['chartView'] = [Math.max(100, width), Math.max(100, height)];
    }
  }
  onVideoLoadStart(item: any): void {
    if (item.requireUserToWatch) {
      item.loadStarted = true; 
      item.modified = true; 
      this.changeDetectorRef.detectChanges();
    }
  }
  reorderCMSItemsByPosition(items: any[]): any[] {
    return items.slice().sort((a, b) => {
      const aTop = a.styles?.top ?? 0;
      const bTop = b.styles?.top ?? 0;

      if (aTop !== bTop) {
        return aTop - bTop; // Sort by top (Y position)
      }

      const aLeft = a.styles?.left ?? 0;
      const bLeft = b.styles?.left ?? 0;

      if (aLeft !== bLeft) {
        return aLeft - bLeft; // Sort by left (X position)
      }

      const aHeight = a.styles?.height ?? 0;
      const bHeight = b.styles?.height ?? 0;

      return aHeight - bHeight; // Optional: Sort by height if needed
    });
  }
 updateSectionHeights(sectionIndex?: number): void {
    if (this.updateSectionHeightsTimer) clearTimeout(this.updateSectionHeightsTimer);

    this.updateSectionHeightsTimer = setTimeout(() => {
      const indices = sectionIndex !== undefined
        ? [sectionIndex]
        : this.sectionsArray.map((_, i) => i);

      indices.forEach(idx => {
        const section = this.sectionsArray[idx];
        if (!section) return;

        if (!section.items || section.items.length === 0) {
          this.setSectionHeight(idx, 16);
          return;
        }

        let maxBottom = 0;

        if ((section.type || '').toLowerCase() === 'widgets') {
          const gap = window.innerWidth < 768 ? 1 : 2;
          const rowHeights: number[] = [];
          let curRowWidth = 0;
          let curRowHeight = 0;

          section.items.forEach(item => {
            const w = item.widthPercent ?? 33;
            const h = item.heightPercent ?? 25;

            if (curRowWidth === 0 || curRowWidth + gap + w > 100) {
              if (curRowWidth > 0) rowHeights.push(curRowHeight);
              curRowWidth = w;
              curRowHeight = h;
            } else {
              curRowWidth += gap + w;
              curRowHeight = Math.max(curRowHeight, h);
            }
          });
          if (curRowWidth > 0) rowHeights.push(curRowHeight);

          const gaps = Math.max(0, rowHeights.length - 1) * 2;
          maxBottom = rowHeights.reduce((a, b) => a + b, 0) + gaps + 8;

        } else {
          // Freeform mode
          section.items.forEach(item => {
            const top = item.yPercent ?? 0;
            const height = item.heightPercent ?? 25;
            maxBottom = Math.max(maxBottom, top + height);
          });
          maxBottom += 2; // ← Only 2vh padding (was 5 → too much)
        }

        const finalHeight = Math.max(8, Math.ceil(maxBottom));
        this.setSectionHeight(idx, finalHeight);
      });

      this.changeDetectorRef.detectChanges();
    }, 80);
  }
  private setSectionHeight(sectionIndex: number, vh: number): void {
    const el = this.scrollContainerItem?.nativeElement?.children?.[sectionIndex];
    if (!el) return;

    const section = this.sectionsArray[sectionIndex]; // ← Fixed!

    el.style.height = `${vh}vh`;
    el.style.minHeight = (!section?.items || section.items.length === 0) ? '16vh' : '1px';
  }


  private readonly VIEWPORT_SCALE = {
    width: 0.8,   
    height: 0.7,
    leftOffset: 10, 
    topOffset: 5  
  };
  getSectionArrayMaxHeight(sectionIndex: number): string {
  const section = this.sectionsArray[sectionIndex];
  if (!section?.items?.length) return '10vh'; // ✅ No items → default to 10vh
  
  let maxHeight = 0;
  section.items.forEach(item => {
    const itemTopVh =
      this.VIEWPORT_SCALE.topOffset +
      (item.yPercent / 100) * this.VIEWPORT_SCALE.height * 100;
    const itemHeightVh =
      (item.heightPercent / 100) * this.VIEWPORT_SCALE.height * 100;

    const bottomEdge = itemTopVh + itemHeightVh;
    if (bottomEdge > maxHeight) {
      maxHeight = bottomEdge;
    }
  });

  // ✅ Add small padding
  const finalHeight = maxHeight + 10;

  // ✅ Enforce a minimum of 10vh (instead of 50vh)
  const adjustedHeight = Math.max(finalHeight, 10);
  return `${adjustedHeight}vh`;
}

  parseButtonStyle(salesHeading: string) {
  try {
    return salesHeading ? JSON.parse(salesHeading) : {};
  } catch (e) {
    return {};
  }
}
onButtonClick(item: any): void {
  if (item.isClickable && (item.buttonUrl || item.chartHeading)) {
    const url = item.buttonUrl || item.chartHeading;
    const formattedUrl = this.formatUrl(url);
    
    try {
      window.open(formattedUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening URL:', error);
      // Optionally show user-friendly error message
      alert('Unable to open URL: ' + url);
    }
  }
}
private formatUrl(url: string): string {
  if (!url) return '';
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Add https:// if missing
  return 'https://' + url;
}

  getSafeHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
  getVideoUrl(item): string {
    const url = item.localVideoUrl || item.blobUrl || item.tempVideoUrl || '';
    if (url && url.startsWith('blob:')) {
      console.log(`Attempting to use video URL: ${url} for item ID: ${item.id}`);
    }
    if (url && !item.isYoutubeOrVimeo) {
      return url;
    }
    return '';
  }
  onVideoError(event: any, item): void {
    console.error('Video error:', {
      error: event,
      itemId: item.id,
      url: this.getVideoUrl(item),
      isYoutubeOrVimeo: item.isYoutubeOrVimeo,
      blobUrl: item.blobUrl,
      localVideoUrl: item.localVideoUrl,
      tempVideoUrl: item.tempVideoUrl,
    });
    this.notificationService.errorTopRight('Failed to load video.');
  }
getAudioUrl(item: any): string {
  const validAudioExtensions = ['.mp3', '.wav', '.ogg', '.m4a'];
  const isValidUrl = (url: string) => url && validAudioExtensions.some(ext => url.toLowerCase().endsWith(ext));

  let url: string | null = null;
  if (item.audioUrl && isValidUrl(item.audioUrl)) {
    url = item.audioUrl;
  } else if (item.getAllCMSItemViews?.length) {
    const firstItem = item.getAllCMSItemViews[0];
    url = firstItem.url || firstItem.content;
  } else if (item.text && isValidUrl(item.text)) {
    url = item.text;
  }

  if (url && isValidUrl(url)) {
    return url;
  }

  return '';
}

playAudio(item: any): void {
  const audio = document.querySelector(`audio[aria-label='Audio player for ${item.id}']`) as HTMLAudioElement;
  if (audio) {
    audio.play().then(() => {
      item.isPlaying = true;
      this.changeDetectorRef.detectChanges();
    }).catch(error => {
      this.notificationService.errorTopRight('Failed to play audio. Please try again.');
    });
  }
}
checkAutoplaySupport(): void {
  const audio = document.createElement('audio');
  const promise = audio.play();
  if (promise !== undefined) {
    promise.catch(error => {
      console.warn('Autoplay prevented:', error);
      // this.notificationService.warningTopRight('Please interact with the page to enable audio autoplay.');
    });
  }
}
onAudioLoaded(audioPlayer: HTMLAudioElement, item: any) {
  if (item.autoPlay) {
    setTimeout(() => {
      audioPlayer.play().catch(err => {
        console.warn('Autoplay failed:', err);
      });
    }, 200);
  }
}

onAudioCanPlay(item: any): void {
  item.isPlaying = false; // Reset isPlaying until playback starts
  console.log('Audio can play for item:', item.id);
}

  onAudioTimeUpdate(event: any, item: any): void {
    if (item.requireUserToWatch) {
      const audio = event.target;
      if (audio.duration > 0) {
        const progress = Math.round((audio.currentTime / audio.duration) * 100);
        if (progress > (item.listenProgress || 0)) {
          item.listenProgress = progress;
          item.modified = true;
        }
      }
    }
  }

  onAudioEnded(item: any): void {
    if (item.requireUserToWatch) {
      item.listenProgress = 100;
      item.modified = true;
    }
  }


  getDefaultHeightForType(type: string): number {
    switch(type) {
      case 'text': return 10;
      case 'image': return 30;
      case 'video': return 40;
      case 'audio': return 15;
      case 'button': return 8;
      case 'Pie Chart':
      case 'Line Chart':
      case 'Bar Chart': return 35;
      default: return 25;
    }
  }
  trackByFn(index: number, item: any): number {
    return item.id || index;
  }
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  // onResize(event) {
  //   let chartWidth = event.target.innerWidth > 1100 ? 244 : event.target.innerWidth <= 1100 && event.target.innerWidth > 700 ? event.target.innerWidth - 240 : event.target.innerWidth <= 700 && event.target.innerWidth > 400 ? event.target.innerWidth - 150 : event.target.innerWidth - 80;
  //   this.view = [chartWidth, 300];
  // }
  formatNumberWithCommas(value): string {
    if (value == null) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  handleMenuClick() {
    this.showMenu = this.showMenu ? false : true;
    this.showLink = false;
    this.showMenuManagePage = false;
  }
  getClass(item) {
    if(!item['addnewSection']){
      return item.className
    } else return 'w-full'
  }
  calculateWidth(totalCourse: number, totalAttempted: number): number {
    if (totalCourse === 0) {
      return 0;
    }
    const result = (totalAttempted / totalCourse) * 100;
    return parseFloat(result.toFixed(2));
  }
  toggleSalesGraph(checked) {
    this.isSalesSelected = checked;
    window.sessionStorage.setItem('isSalesSelected', JSON.stringify(this.isSalesSelected));
    this.lineChartData.datasets = [this.isSalesSelected ? this.lineChartDataset[0] : this.lineChartDataset[1]];
    if (this.baseChart) {
      this.baseChart.update();
    }
  }
getGreetingHtml(originalText?: string): string {
  const hour = new Date().getHours();
  const greetingMessage =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  if (originalText) {
    // Replace placeholders [Good Morning/Afternoon/Evening] and [First Name]
    return originalText
      .replace(/\[Good Morning\/Afternoon\/Evening\]/, `${greetingMessage}`)
      .replace(/\[First Name\]/, '[First Name]');
  }

  // Fallback if no text provided
  return `
    <h3 style="text-align:center;">
      <span 
        class="kl-editor-size-x-large"
        style="color:#02479c !important; font-family: HelveticaNeuelight; font-size:19px;">
        ${greetingMessage}, [First Name]
      </span>
    </h3>`;
}


}
