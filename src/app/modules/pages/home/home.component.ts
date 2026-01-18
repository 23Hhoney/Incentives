import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ChartType } from 'ng-apexcharts';
import { HomeService } from './home.service';
import { ModernService } from 'app/layout/layouts/horizontal/modern/modern.service';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Router } from '@angular/router';
import { SharedService } from 'app/shared/shared-service';
import { Subscription, firstValueFrom, interval } from 'rxjs';
import { NotificationService } from 'app/shared/notification/notification';
import { TrainingCourseManagerService } from 'app/modules/admin-panel/training-course-manager/training-course-manager.service';
import { KohlerStudioService } from 'app/modules/LMS/kohler-studio/kohler-studio.service';
import * as moment from 'moment-timezone';
import { ManageWebsiteService } from '../authentication/manage-website/manage-website.service';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { fi } from 'date-fns/locale';

interface PieChartData {
  [key: string]: number;
}
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
 @ViewChild('vimeoPlayer', { static: false }) videoPlayer: ElementRef;
  trainingEmbededVideo = null;
  @ViewChildren(BaseChartDirective) baseCharts!: QueryList<BaseChartDirective>;
  ytdSales: { [key: number]: number | { currentYear: number; previousYear: number } } = {};
  ytdPointsEarned: { [key: number]: number | { currentYear: number; previousYear: number } } = {};
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

  totalCourse = 0;
  currentCarousel = 0;
  totalAttempted = 0;
  view = [700, 400];
  remainingPoints = 0;
  pointsCredited = 0;
  targetValue = '0';
  totalSales = 0;
  targetValues: number = 0;

  isSalesSelected = false;
  isLineChartSalesSelected = false;
  pieChartData = [];
  pieChartType: ChartType = 'pie';
  colorScheme = {
    domain: ["#C94D6D", "#4174C9", "#876B8E", "#8DBCCC", "#8FAAC6", "#8C4D57", "#b89dc7", "#966577", "#95a3de", "#fb9ad4", "#99738a", "#ccbdaf", "#97c4a0", "#c9adc9", "#e3ccba", "#bfe0b8", "#b7d2f7", "#d0c7f2", "#b6f0bf", "#d6bfd6"]
  };

  lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value'
        },
        ticks: {
          callback: (value: number) => {
            if (this.isSalesSelected) {
              return this.formatToDollar(value);
            } else {
              return this.formatNumberWithCommas(value);
            }
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      }
    },
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
            const value: number = context.raw as number;
            if (this.isSalesSelected) {
              return `Sales: ${this.formatToDollar(value)}`;
            } else {
              return `Points: ${this.formatNumberWithCommas(value)}`;
            }
          }
        }
      }
    }
  };

  monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  selectedTimePeriod: string = 'currentYear';
  lineChartDataset = [];
  lineChartData: ChartData<'line', number[], string | string[]>[] = [];
  lineChartLoading: boolean[] = [];
  noLineChartData: boolean[] = [];
  lineChartType: ChartType = 'line';
  apiRequest = {
    itemCount: 4,
    pageIndex: 1,
    pageLimit: 4,
    sortBy: "name",
    search: "",
    sortDirection: "desc",
    filter: []
  };
  notiApiRequest = {
    itemCount: 2,
    pageIndex: 1,
    pageLimit: 2,
    sortBy: "",
    search: "",
    sortDirection: "",
    filter: []
  };
  selectedTimePeriodLine: string;
  selectedTimePeriodPie: string;
  selectedTimePeriodBar: string;
  noPieChartData: boolean = false;
  noBarChartData: boolean = false;
  currentYear: number = new Date().getFullYear();
  previousYear: number = new Date().getFullYear() - 1;
  barChartData: {
    totalSales?: number;
    targetValue?: number;
    currentYear?: { totalSales: number; targetValue: number };
    previousYear?: { totalSales: number; targetValue: number };
  } = {
    totalSales: 0,
    targetValue: 0,
    currentYear: { totalSales: 0, targetValue: 0 },
    previousYear: { totalSales: 0, targetValue: 0 }
  };
  pieChartLoading = false;
  pointsAndSummaryLoading = false;
  isCurriculumLoading = false;
  isTransactionLoading = false;
  totalAvailableCourse = 0;
  totalCompleted = 0;
  isTransactionRedemptionLoading = false;
  isTransactionCreditLoading = false;
  userType = 'normaluser';
  isNotificationLoading = false;
  publishedPage = null;
  curriculumData = [];
  transactionData = [];
  totalRequiredCourses: number = 0;
  totalRequiredCompleted: number = 0;
  mandatoryList: any[] = [];
  redemptionTransactionData = [];
  creditTransactionData = [];
  sectionsArray = [];
  private updateSectionHeightsTimer: any = null;
  notifications: any = { results: [], customRecordCount: 0 };
  data: any;
  userName = sessionStorage.getItem('name');
  selectedLanguage: 'English';
  originalSections: string = '';
  mobileView = false;
  storedMobileView = null;
  audioAutoplay: boolean = true;
  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;
  @ViewChild('scrollContainerItem') scrollContainerItem!: ElementRef;
  seeMore: boolean[] = [];
  monthValues: string[] = [
    '1', '2', '3', '4', '5', '6',
    '7', '8', '9', '10', '11', '12'
  ];
  isAssigned: boolean;

  constructor(
    private sanitizer: DomSanitizer,
    private _modernService: ModernService,
    private _router: Router,
    private _homeService: HomeService,
    private _sharedService: SharedService,
    private router: Router,
    private notificationService: NotificationService,
    private trainingCourseService: TrainingCourseManagerService,
    private KohlerService: KohlerStudioService,
    private manageWebsiteContent: ManageWebsiteService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.manageWebsiteContent.GetAllCMSMenu(false).subscribe((res: any[]) => {
      const filteredRes = res.filter(item => !item.menuId.startsWith('DRFT_') && item.menuId !== 'DRFT_RESTORED');

      filteredRes.forEach((items) => {
        if ((items.menuId === '' || items.menuId === 'HM') && !items.isPublish) {
          this.publishedPage = items;
        }
      });

      if (this.publishedPage && this.publishedPage.menuId === 'HM') {
        this.manageWebsiteContent.GetAllCMSContainer(this.publishedPage.id, true).subscribe((resp: any[]) => {
          let lineChartCounter = 0; // Track line chart indices across all sections
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

            section.getAllCMSContainerViews.forEach(item => {
              console.log('Item chartDropdown:', item.chartDropdown);
              if (item.chartDropdown) {
                switch (item.type) {
                  case 'Pie Chart':
                    this.selectedTimePeriodPie = item.chartDropdown;
                    break;
                  case 'Line Chart':
                    this.selectedTimePeriodLine = item.chartDropdown;
                    break;
                  case 'Bar Chart':
                    this.selectedTimePeriodBar = item.chartDropdown;
                    break;
                }
              }
            });

            return {
              id: section.id,
              position: section.position !== undefined ? section.position : sectionIndex,
              height: 0,
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
                    const hour = new Date().getHours();
                    const greetingMessage =
                      hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
                    const userName = this.userName ? `, ${this.userName}` : '';
                  
                    if (items.text) {
                      // Replace only the placeholder text inside the span
                      textContent = items.text.replace(
                        /\[Good Morning\/Afternoon\/Evening\], \[First Name\]/,
                        `${greetingMessage}${userName}`
                      );
                    } else {
                      // Fallback if items.text is missing
                      textContent = `
                        <h3 style="text-align:center;">
                          <span 
                            class="kl-editor-size-x-large"
                            style="color:#02479c !important; font-family: HelveticaNeuelight; font-size:19px;">
                            ${greetingMessage}${userName}
                          </span>
                        </h3>`;
                    }
                  }
                  
                  else if (items.text) {
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
                    chartDataType: items.chartDataType,
                    chartIndex: items.type === 'Line Chart' ? lineChartCounter++ : undefined, // Assign chartIndex for Line Charts
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

          this.processSections();
          this.changeDetectorRef.detectChanges();
          
          // Use requestAnimationFrame and setTimeout to ensure DOM is ready
          requestAnimationFrame(() => {
            setTimeout(() => {
              this.triggerSectionRecalc();
            }, 100);
          });

          if (this.userType !== 'admin') {
            this.getPointsAndSalesSummaryCalculation();
            this.getChartData();
            this.getAllCurriculum();
            this.getTransactionData();
            this.getRedemptionTransactionData();
            this.getCreditTransactionData();
          }
        });
      }
    });
  }

  ngOnInit(): void {
    this.userType = sessionStorage.getItem('usertype');
    this.getNotificationList();
    window.sessionStorage.setItem('isSalesSelected', JSON.stringify(this.isSalesSelected));
    this.startCarousel();
    this.updateChartSize();

    let payload = [
      { oid: 'currentyear', value: 2025 },
      { oid: 'previousyear', value: 2024 }
    ];
    this._homeService.pointsAndSalesSummaryForUserByYearRangeFilter(payload, window.sessionStorage.getItem('userId')).subscribe(data => {
      this.ytdSales = data.currentYear;
      this.ytdPointsEarned = data.previousYear;
    });
  }
  resizeObserver!: ResizeObserver;

   ngAfterViewInit(): void {
      this.forceReflowOnce();
    this.resizeObserver = new ResizeObserver(() => {
      this.triggerSectionRecalc();
    });

    setTimeout(() => {
      document.querySelectorAll('.element-container').forEach(el => {
        this.resizeObserver.observe(el);
      });
      // Force recalculation after DOM is ready
      this.triggerSectionRecalc();
    }, 100);
    this.playAudioIfAutoplay();  // try to autoplay when view is ready
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


  ngOnDestroy() {
    this.resizeObserver?.disconnect();
    if (this.carouselSubscription) {
      this.carouselSubscription.unsubscribe();
    }
  }
  
  forceReflowOnce(): void {
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
    });
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
  @HostListener('window:resize', ['$event'])
onResizeWindow(event: any) {
  const width = event.target.innerWidth;
  this.mobileView = width <= 480;  // assuming you have this flag

  this.handleResponsiveLayout(width);
  
  // Force change detection so isWindowWidthLessThan768() re-evaluates
  this.changeDetectorRef.detectChanges();

  // Force re-calculation of section heights after layout stabilizes
  setTimeout(() => {
    this.updateSectionHeights();
    this.changeDetectorRef.detectChanges();
  }, 100);

  setTimeout(() => {
    this.updateSectionHeights();  // Double-check after fonts/images load
    this.changeDetectorRef.detectChanges();
  }, 300);
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
  extractKohlerQuizUUID(url: string): string | null {
    const regex = /\/kohler-studio-course-quiz\/([a-f0-9-]{36})\?courseStatus=Active(&selectedLanguage=[a-zA-Z]+)?$/i;
    const match = url.match(regex);
    return match ? match[1] : null;
  }


  extractKohlerCourseUUID(url: string): string | null {
    const regex = /\/kohler-studio-course\/[a-f0-9-]{36}\/([a-f0-9-]{36})\/[a-zA-Z]+\?courseStatus=Active(&selectedLanguage=[a-zA-Z]+)?$/i;
    const match = url.match(regex);
    return match ? match[1] : null; 
  }

 async processSections() {
  for (const section of this.sectionsArray) {
    for (const item of section.items) {
      if (item.type === 'TrainingMonth') {
        const quizUUID = item.text ? this.extractKohlerQuizUUID(item.text) : null;
        const courseUUID = item.text ? this.extractKohlerCourseUUID(item.text) : null;
        const finalUUID = quizUUID || courseUUID;


        if (finalUUID) {
          try {
            const userId = sessionStorage.getItem('userId');
            if (!userId) {
              item['isAssigned'] = false;
              this.isAssigned = false;
              item['courseImageUrl'] = 'assets/images/course_default.png';
              continue; // Skip API calls if userId is missing
            }

            // Check if course is assigned first
            const courseAssignedResp = await firstValueFrom(this._homeService.getCourseAssigned(finalUUID, userId));
            item['isAssigned'] = courseAssignedResp && (courseAssignedResp.assigned ?? false);
            this.isAssigned = courseAssignedResp && (courseAssignedResp.assigned ?? false); 
            // Only call DownloadCourseLevelImage if course is assigned
            if (item['isAssigned']) {
              const imageUrlResp = await firstValueFrom(this.manageWebsiteContent.DownloadCourseLevelImage(finalUUID));
              item['courseImageUrl'] = imageUrlResp.url || 'assets/images/course_default.png';
            } else {
              item['courseImageUrl'] = 'assets/images/course_default.png';
            }
          } catch (error) {
            item['courseImageUrl'] = 'assets/images/course_default.png';
            item['isAssigned'] = false;
            this.isAssigned = false;
          }
        } else {
          item['courseImageUrl'] = 'assets/images/course_default.png';
          item['isAssigned'] = false;
          this.isAssigned = false;
        }
      } else if (item.type === 'video') {
        const firstItem = item.getAllCMSItemViews?.[0];
        if (firstItem) {
          item.autoPlay = firstItem.autoPlay || false;
          item.requireUserToWatch = firstItem.requireUserToWatch || firstItem.isRequired || false;

          if (firstItem.bannerHeading) {
            try {
              const loopData = typeof firstItem.bannerHeading === 'string'
                ? JSON.parse(firstItem.bannerHeading)
                : firstItem.bannerHeading;
              item.loop = loopData.loop || false;
            } catch (e) {
              item.loop = false;
            }
          }

          if (firstItem.url) {
            item.localVideoUrl = firstItem.url;
            item.isYoutubeOrVimeo = false;
          } else if (firstItem.content && firstItem.content.includes('youtu')) {
            item.videoUrl = this.transformYouTubeUrl(firstItem.content, item.autoPlay, item.loop);
            item.isYoutubeOrVimeo = true;
          } else if (item.text && item.text.includes('youtu')) {
            item.videoUrl = this.transformYouTubeUrl(item.text, item.autoPlay, item.loop);
            item.isYoutubeOrVimeo = true;
          }
        }
      } else if (item.type === 'audio') {
        if (item.getAllCMSItemViews?.length) {
          const audioItem = item.getAllCMSItemViews[0];
          item.audioUrl = audioItem.url || audioItem.content || null;
          item.autoPlay = audioItem.autoPlay !== undefined ? audioItem.autoPlay : false;
          item.requireUserToWatch = audioItem.requireUserToWatch || audioItem.isRequired || false;
        }
        if (!item.audioUrl && item.text) {
          item.audioUrl = item.text;
        }
      } else {
      }
    }
  }
}

async onClickTrainingMonth(item: any): Promise<void> {
  const url = item?.text?.trim();

  if (!url || !this.isValidKohlerQuizUrl(url)) {
    this.handleViewAllCurriculums();
    return;
  }

  const quizUUID = this.extractKohlerQuizUUID(url);
  const courseUUID = this.extractKohlerCourseUUID(url);
  const finalUUID = quizUUID || courseUUID;


  if (!finalUUID) {
    this.handleViewAllCurriculums();
    return;
  }

  // Use stored item['isAssigned'], default to false if undefined
  if (item['isAssigned'] ?? false) {
    window.location.href = url;
  } else {
    this.handleViewAllCurriculums();
  }
}


  isValidKohlerQuizUrl(url: string): boolean {
    const quizRegex = /\/kohler-studio-course-quiz\/[a-f0-9-]{36}\?courseStatus=Active(&selectedLanguage=[a-zA-Z]+)?$/i;
    const courseRegex = /\/kohler-studio-course\/[a-f0-9-]{36}\/[a-f0-9-]{36}\/[a-zA-Z]+(\?courseStatus=Active(&selectedLanguage=[a-zA-Z]+)?)?$/i;
    return quizRegex.test(url) || courseRegex.test(url);
  }

  navigateToCourseUrl(item: any): void {
    this.handleViewAllCurriculums();
  }


 buildPayload(timePeriod: string): any[] | null {
    let payload: any[] = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear().toString();
    const currentMonth = (currentDate.getMonth() + 1).toString();
    const previousYear = (currentDate.getFullYear() - 1).toString();

    switch (timePeriod) {
      case 'currentMonth':
        payload = [{ oid: 'month', value: currentMonth }];
        break;
      case 'currentYear':
        payload = [{ oid: 'year', value: currentYear }];
        break;
      case 'previousYear':
        payload = [{ oid: 'year', value: previousYear }];
        break;
      case 'yearVsYear':
        payload = [
          { oid: 'currentyear', value: currentYear },
          { oid: 'previousyear', value: previousYear }
        ];
        break;
      case 'lifetime':
        return null;
    }
    return payload;
  }

 getChartData() {
    const userId = sessionStorage.getItem('userId');
    const lineChartSections = this.sectionsArray
      .flatMap(section => section.items)
      .filter(item => item.type === 'Line Chart');

    this.lineChartData = new Array(lineChartSections.length).fill(null).map(() => ({ labels: [], datasets: [] }));
    this.lineChartLoading = new Array(lineChartSections.length).fill(false);
    this.noLineChartData = new Array(lineChartSections.length).fill(false);

    lineChartSections.forEach((section, index) => {
      const linePayload = this.buildPayload(section.chartDropdown);
      const chartDataType = section.chartDataType || 'sales';
      // console.log(`getChartData - Line Chart ${index} Payload:`, linePayload, `chartDataType:`, chartDataType);
      this.getLineChartData(userId, linePayload, chartDataType, index);
    });

    const pieChartSections = this.sectionsArray
      .flatMap(section => section.items)
      .filter(item => item.type === 'Pie Chart');

    pieChartSections.forEach((section, index) => {
      const piePayload = this.buildPayload(section.chartDropdown);
      const chartDataType = section.chartDataType || 'sales';
      // console.log(`getChartData - Pie Chart ${index} Payload:`, piePayload, `chartDataType:`, chartDataType);
      this.getPieChartData(userId, piePayload, chartDataType);
    });

    this.getBarChartData(userId, this.buildPayload(this.selectedTimePeriodBar));
  }

  getChartDropdownText(chartDropdown: string): string {
    switch (chartDropdown) {
      case 'currentMonth':
        return 'Current Month';
      case 'currentYear':
        return 'Current Year';
      case 'previousYear':
        return 'Previous Year';
      case 'lifetime':
        return 'Lifetime';
      case 'yearVsYear':
        return 'Previous Year vs Current Year';
      default:
        return 'Current Year';
    }
  }
    getLineChartOptions(chartDataType: string): ChartOptions {
    return {
      ...this.lineChartOptions,
      scales: {
        y: {
          ...this.lineChartOptions.scales?.y,
          ticks: {
            callback: (value: number) => this.formatValue(value, chartDataType)
          }
        }
      },
      plugins: {
        ...this.lineChartOptions.plugins,
        tooltip: {
          callbacks: {
            label: (context) => this.getTooltipLabel(context.dataset.label, context.raw as number, chartDataType)
          }
        }
      }
    };
  }
    private getTooltipLabel(datasetLabel: string, value: number, chartDataType: string = 'points'): string {
    const formattedValue = this.formatValue(value, chartDataType);
    switch (chartDataType) {
      case 'sales':
        return `Sales: ${formattedValue}`;
      case 'points':
        return `Points: ${formattedValue}`;
      case 'quantity':
        return `Quantity: ${formattedValue}`;
      default:
        return `${datasetLabel}: ${formattedValue}`;
    }
  }
 private formatValue(value: number, chartDataType: string = 'points'): string {
    switch (chartDataType) {
      case 'sales':
        return this.formatToDollar(value);
      case 'points':
        return this.formatNumberWithCommas(value);
      case 'quantity':
        return this.formatNumberWithCommas(value);
      default:
        return this.formatNumberWithCommas(value);
    }
  }
  getLineChartData(userId: string | null, payload: any[] | null, chartDataType: string = 'sales', chartIndex: number) {
    this.lineChartLoading[chartIndex] = true;
    this.noLineChartData[chartIndex] = false;

    const isYearVsYear = payload && payload.length === 2 && payload.some(p => p.oid === 'currentyear') && payload.some(p => p.oid === 'previousyear');

    const apiCall = isYearVsYear
      ? this._homeService.monthlyPointsAndSalesSummaryForUserByYearRangFilter(payload, userId, chartDataType)
      : this._homeService.getChartDataForLineChart(payload, userId, chartDataType);

    apiCall.subscribe(data => {
      console.log(`Raw API Response for chartIndex ${chartIndex}, chartDataType ${chartDataType}:`, data);
      this.lineChartLoading[chartIndex] = false;
      if (data && (data.monthlyPointsSummaries?.length || (data.currentYear?.length && data.previousYear?.length))) {
        let labels: string[] = [];
        let datasets: any[] = [];

        if (isYearVsYear) {
          this.ytdSales[chartIndex] = {
            currentYear: data.currentYear?.reduce((sum, item) => sum + (item.totalSales || 0), 0) || 0,
            previousYear: data.previousYear?.reduce((sum, item) => sum + (item.totalSales || 0), 0) || 0
          };
          this.ytdPointsEarned[chartIndex] = {
            currentYear: data.currentYear?.reduce((sum, item) => sum + (item.totalPointsCredited || 0), 0) || 0,
            previousYear: data.previousYear?.reduce((sum, item) => sum + (item.totalPointsCredited || 0), 0) || 0
          };
          const ytdQuantity = {
            currentYear: data.currentYear?.reduce((sum, item) => sum + (item.totalQuantity || 0), 0) || 0,
            previousYear: data.previousYear?.reduce((sum, item) => sum + (item.totalQuantity || 0), 0) || 0
          };

          const currentYear = new Date().getFullYear().toString();
          const previousYear = (new Date().getFullYear() - 1).toString();

          labels = this.monthLabels;

          datasets = [
            {
              label: chartDataType === 'sales' ? `Sales ${currentYear}: ${this.formatToDollar((this.ytdSales[chartIndex] as { currentYear: number }).currentYear)}` :
                     chartDataType === 'points' ? `Points ${currentYear}: ${this.formatNumberWithCommas((this.ytdPointsEarned[chartIndex] as { currentYear: number }).currentYear)}` :
                     `Quantity ${currentYear}: ${this.formatNumberWithCommas(ytdQuantity.currentYear)}`,
              data: labels.map((_, index) => {
                const monthData = data.currentYear.find(item => item.month === index + 1);
                return monthData ? (chartDataType === 'sales' ? monthData.totalSales :
                                  chartDataType === 'points' ? monthData.totalPointsCredited :
                                  monthData.totalQuantity) : 0;
              }),
              borderColor: '#007bff',
              backgroundColor: '#007bff',
              fill: false,
              tension: 0.4
            },
            {
              label: chartDataType === 'sales' ? `Sales ${previousYear}: ${this.formatToDollar((this.ytdSales[chartIndex] as { previousYear: number }).previousYear)}` :
                     chartDataType === 'points' ? `Points ${previousYear}: ${this.formatNumberWithCommas((this.ytdPointsEarned[chartIndex] as { previousYear: number }).previousYear)}` :
                     `Quantity ${previousYear}: ${this.formatNumberWithCommas(ytdQuantity.previousYear)}`,
              data: labels.map((_, index) => {
                const monthData = data.previousYear.find(item => item.month === index + 1);
                return monthData ? (chartDataType === 'sales' ? monthData.totalSales :
                                  chartDataType === 'points' ? monthData.totalPointsCredited :
                                  monthData.totalQuantity) : 0;
              }),
              borderColor: '#dc3545',
              backgroundColor: '#dc3545',
              fill: false,
              tension: 0.4
            }
          ];
        } else {
          this.ytdSales[chartIndex] = data.ytdSales || 0;
          this.ytdPointsEarned[chartIndex] = data.ytdPointsEarned || 0;
          const ytdQuantity = data.monthlyPointsSummaries?.reduce((sum, item) => sum + (item.totalQuantity || 0), 0) || 0;

          let filteredMonthlyPointsSummaries = data.monthlyPointsSummaries || [];
          labels = this.monthLabels; // Use all months for consistency

          datasets = [
            {
              label: chartDataType === 'sales' ? `Sales: ${this.formatToDollar(this.ytdSales[chartIndex] as number)}` :
                     chartDataType === 'points' ? `Points: ${this.formatNumberWithCommas(this.ytdPointsEarned[chartIndex] as number)}` :
                     `Quantity: ${this.formatNumberWithCommas(ytdQuantity)}`,
              data: labels.map((_, index) => {
                const monthData = filteredMonthlyPointsSummaries.find(item => item.month === index + 1);
                return monthData ? (chartDataType === 'sales' ? monthData.totalSales || 0 :
                                  chartDataType === 'points' ? monthData.totalPointsCredited || 0 :
                                  monthData.totalQuantity || 0) : 0;
              }),
              borderColor: '#007bff',
              backgroundColor: '#007bff',
              fill: false,
              tension: 0.4
            }
          ];
        }

        this.lineChartData[chartIndex] = {
          labels,
          datasets
        };
        this.changeDetectorRef.detectChanges();
        if (this.baseCharts && this.baseCharts.toArray()[chartIndex]) {
          this.baseCharts.toArray()[chartIndex].update();
        }
      } else {
        this.noLineChartData[chartIndex] = true;
        this.lineChartData[chartIndex] = {
          labels: [],
          datasets: [
            {
              label: chartDataType === 'sales' ? 'Sales: $0' :
                     chartDataType === 'points' ? 'Points: 0' :
                     'Quantity: 0',
              data: [],
              borderColor: '#007bff',
              backgroundColor: '#007bff',
              fill: false
            }
          ]
        };
        this.changeDetectorRef.detectChanges();
        if (this.baseCharts && this.baseCharts.toArray()[chartIndex]) {
          this.baseCharts.toArray()[chartIndex].update();
        }
      }
    }, error => {
      this.lineChartLoading[chartIndex] = false;
      this.noLineChartData[chartIndex] = true;
      this.lineChartData[chartIndex] = {
        labels: [],
        datasets: [
          {
            label: chartDataType === 'sales' ? 'Sales: $0' :
                   chartDataType === 'points' ? 'Points: 0' :
                   'Quantity: 0',
            data: [],
            borderColor: '#007bff',
            backgroundColor: '#007bff',
            fill: false
          }
        ]
      };
      this.changeDetectorRef.detectChanges();
      if (this.baseCharts && this.baseCharts.toArray()[chartIndex]) {
        this.baseCharts.toArray()[chartIndex].update();
      }
    });
  }

 getPieChartData(userId: string | null, payload: any[] | null, chartDataType: string = 'sales') {
  this.pieChartLoading = true;
  this.noPieChartData = false;
  this._homeService.getdataForPieChartByfilter(payload, userId, chartDataType).subscribe((data: PieChartData) => {
    this.pieChartLoading = false;
    if (data && Object.keys(data).length > 0) {
      const total = Object.values(data).reduce((sum, value) => sum + (typeof value === 'number' ? value : 0), 0);
      this.pieChartData = Object.keys(data).map(key => {
        const value = data[key];
        const percentage = total > 0 ? (value / total * 100).toFixed(2) : '0.00';
        return {
          name: key,
          value: value,
          extra: { percentage } // Store percentage for tooltip
        };
      });
      this.noPieChartData = false;
    } else {
      this.pieChartData = [];
      this.noPieChartData = true;
    }
    this.changeDetectorRef.detectChanges();
  }, (error) => {
    this.pieChartLoading = false;
    this.pieChartData = [];
    this.noPieChartData = true;
    this.changeDetectorRef.detectChanges();
  });
}

  getBarChartData(userId: string | null, payload: any[] | null) {
    this.pointsAndSummaryLoading = true;
    this.noBarChartData = false;

    const isYearVsYear = payload && payload.length === 2 && payload.some(p => p.oid === 'currentyear') && payload.some(p => p.oid === 'previousyear');

    const apiCall = isYearVsYear
      ? this._homeService.pointsAndSalesSummaryForUserByYearRangeFilter(payload, userId)
      : this._homeService.getdataForChartByfilter(payload, userId);

    apiCall.subscribe(data => {
      this.pointsAndSummaryLoading = false;
      if (data && (data.total_sales || data.targetValue || (data.currentYear && data.previousYear))) {
        if (isYearVsYear) {
          // Handle year vs year comparison
          this.barChartData = {
            currentYear: {
              totalSales: data.currentYear.total_sales || 0,
              targetValue: parseFloat(data.currentYear.targetValue || '0')
            },
            previousYear: {
              totalSales: data.previousYear.total_sales || 0,
              targetValue: parseFloat(data.previousYear.targetValue || '0')
            }
          };
        } else {
          // Handle single period (currentMonth, currentYear, previousYear, lifetime)
          this.totalSales = data.total_sales || 0;
          this.targetValues = parseFloat(data.targetValue || '0');
          this.barChartData = {
            totalSales: this.totalSales,
            targetValue: this.targetValues
          };
        }
        this.noBarChartData = false;
      } else {
        this.totalSales = 0;
        this.targetValues = 0;
        this.barChartData = {
          totalSales: 0,
          targetValue: 0
        };
        this.noBarChartData = true;
      }
    }, error => {
      this.pointsAndSummaryLoading = false;
      this.totalSales = 0;
      this.targetValues = 0;
      this.barChartData = {
        totalSales: 0,
        targetValue: 0
      };
      this.noBarChartData = true;
    });
  }
  handleViewAllNotification() {
    this._router.navigate(['notifications'])
  }

  handleViewAllCurriculums() {
      
    this._router.navigate(['academy-curriculums']);
  }


  async getAllCurriculum() {
    this.isCurriculumLoading = true;
    this.totalAvailableCourse = 0;
    this.totalCompleted = 0;

    try {
      const data = await firstValueFrom(this._homeService.GetAllCourses(window.sessionStorage.getItem('userId'), 'English'));
      this.isCurriculumLoading = false;

      if (data && data.length > 0) {
        this.totalAvailableCourse = data.reduce((sum, curr) => sum + curr.totalAvailableCourse, 0);
        this.totalCompleted = data.reduce((sum, curr) => sum + curr.totalCompleted, 0);

        this.curriculumData = await Promise.all(data.map(async (curriculum) => {
          curriculum.open = true;

          if (curriculum.list && curriculum.list.length > 0) {
            const groupedList = Object.values(
              curriculum.list.reduce((acc: any, course: any) => {
                const copyId = course.courseCopyId;
                if (!acc[copyId]) {
                  const englishCourse = curriculum.list.find(c => 
                    c.courseCopyId === copyId && c.language === 'English'
                  );
                  acc[copyId] = {
                    mainCourse: englishCourse || course,
                    languages: []
                  };
                }
                acc[copyId].languages.push({
                  courseId: course.courseId,
                  courseCopyId: course.courseCopyId,
                  language: course.language,
                  status: course.status,
                  progressStatus: course.progressStatus
                });
                acc[copyId].languages.sort((a, b) => a.language === 'English' ? -1 : b.language === 'English' ? 1 : 0);
                return acc;
              }, {})
            );

            // Fetch image URLs for each course
            // for (const group of groupedList) {
            //   try {
            //     const imageUrlResp = await firstValueFrom(this.manageWebsiteContent.DownloadCourseLevelImage(group.mainCourse.courseId));
            //     group.mainCourse.imageUrl = imageUrlResp.url || 'assets/images/course_default.png';
            //   } catch (error) {
            //     console.error(`Failed to fetch image for course ${group.mainCourse.courseId}:`, error);
            //     group.mainCourse.imageUrl = 'assets/images/course_default.png';
            //   }
            // }

            curriculum.list = groupedList;
          }

          return curriculum;
        }));
      this.createRequiredMonthlyTrainingSection();
      }
    } catch (error) {
      console.error('Error fetching curriculum:', error);
      this.isCurriculumLoading = false;
      this.curriculumData = [];

    }
  }
  createRequiredMonthlyTrainingSection() {
    const requiredCoursesMap = new Map();
    let requiredCoursesCount = 0;
    let requiredCompletedCount = 0;

    console.log('Curriculum Data:', this.curriculumData); // Debug

    this.curriculumData.forEach(curriculum => {
      if (curriculum.list && curriculum.list.length > 0) {
        curriculum.list.forEach((course: any) => {
          if (course.mainCourse && course.mainCourse.isRequired) {
            const courseCopyId = course.mainCourse.courseCopyId;
            if (!requiredCoursesMap.has(courseCopyId)) {
              requiredCoursesMap.set(courseCopyId, {
                ...course,
                originalCurriculum: curriculum.curriculm
              });
              requiredCoursesCount++;
              if (course.mainCourse.status === 'Pass' || course.mainCourse.progressStatus === 'Completed') {
                requiredCompletedCount++;
              }
            }
          }
        });
      }
    });

    const requiredCourses = Array.from(requiredCoursesMap.values());

    this.totalRequiredCourses = requiredCoursesCount;
    this.totalRequiredCompleted = requiredCompletedCount;


    const requiredTrainingIndex = this.curriculumData.findIndex(
      curriculum => curriculum.curriculm === 'Required Training'
    );

    const requiredTrainingCurriculum = {
      totalAvailableCourse: requiredCoursesCount,
      totalCompleted: requiredCompletedCount,
      curriculmId: 'required-monthly-training',
      curriculumCopyId: 'required-monthly-training-copy',
      curriculm: 'Required Training',
      language: this.selectedLanguage,
      curriculumLanguage: [this.selectedLanguage],
      languageNames: { [this.selectedLanguage]: 'Required Training' },
      list: requiredCourses,
      open: true
    };

    if (requiredTrainingIndex >= 0) {
      this.curriculumData[requiredTrainingIndex] = requiredTrainingCurriculum;
    } else {
      this.curriculumData.unshift(requiredTrainingCurriculum);
    }

    this.changeDetectorRef.detectChanges(); // Ensure UI updates
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
  parseButtonStyle(salesHeading: string) {
  try {
    return salesHeading ? JSON.parse(salesHeading) : {};
  } catch (e) {
    return {};
  }
}
getTrainingVideoUrl(item: any): any {
  let videoUrl: string | null = null;
  
  if (item.getAllCMSItemViews && item.getAllCMSItemViews.length > 0) {
    const firstItem = item.getAllCMSItemViews[0];
    videoUrl = firstItem.content || firstItem.url;
  }

  if (!videoUrl && item.text) {
    videoUrl = item.text;
  }
  
  if (videoUrl) {
    // Convert YouTube watch URLs to embed format
    if (videoUrl.includes('youtube.com/watch?v=')) {
      const videoId = videoUrl.split('v=')[1]?.split('&')[0];
      videoUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (videoUrl.includes('youtu.be/')) {
      const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
      videoUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    
    return this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl);
  }
  
  // If no video URL found, return null
  return null;
}



  updateChartSize(): void {
    const chartWidth = window.innerWidth > 1100 ? 244 :
    window.innerWidth <= 1100 && window.innerWidth > 700 ? window.innerWidth - 240 :
   window.innerWidth <= 700 && window.innerWidth > 400 ? window.innerWidth - 150 :
   window.innerWidth - 80;
    this.view = [chartWidth, 300];
  }



// Helper methods to add to your component
private isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    // Check if it's a valid URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      new URL(url);
      return true;
    } else if (url.includes('.') && !url.includes(' ')) {
      // Handle cases like "google.com" without protocol
      new URL('https://' + url);
      return true;
    }
    return false;
  } catch {
    return false;
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

// Button click handler method
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

  setChartSize(item, i, j) {
    const container = document.querySelector('.chart-container-'+i+'-'+j) as HTMLElement;
    if (container) {
      const width = container.offsetWidth ? +container.offsetWidth : 0;
      const height = container.offsetHeight ? container.offsetHeight : 0;
      item['chartView'] = [Math.max(100, width), Math.max(100, height)];
    }
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
        
        
        const viewportHeight = window.innerHeight;
 const sectionEl = document.querySelectorAll(
      '.sections-container > div'
    )[sectionIndex] as HTMLElement;

    if (!sectionEl) return '50vh';

    const sectionRect = sectionEl.getBoundingClientRect();
    let maxBottomPx = 0;

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
          // Freeform mode - check actual DOM height for text elements
          section.items.forEach(item => {
            const top = item.yPercent ?? 0;
            let height = item.heightPercent ?? 25;

            // For text elements, check the actual rendered height
            if (item.type === 'text' || item.type === 'greeting') {
              const elementDom = document.getElementById('element-' + item.id);
              if (elementDom) {
                // Force reflow to ensure accurate measurement
                void elementDom.offsetHeight;

                const actualHeightPx = elementDom.scrollHeight + 16; // + padding
                const actualHeightVh = (actualHeightPx / window.innerHeight) * 100;

                height = Math.max(height, actualHeightVh + 2); // + buffer
              }
            }

            maxBottom = Math.max(maxBottom, top + height);
          });
          maxBottom += 0.5;
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
    if (!section?.items?.length) return 'auto';

    const viewportHeight = window.innerHeight;

    const sectionEl = document.querySelectorAll(
      '.sections-container > div'
    )[sectionIndex] as HTMLElement;

    if (!sectionEl) return 'auto';

    const sectionRect = sectionEl.getBoundingClientRect();
    let maxBottomPx = 0;
    let foundElements = 0;

    section.items.forEach(item => {
      const el = document.getElementById('element-' + item.id);
      if (!el) return;
      foundElements++;

      const rect = el.getBoundingClientRect();
      const bottomPx = rect.bottom - sectionRect.top;

      maxBottomPx = Math.max(maxBottomPx, bottomPx);
    });

    // If no elements found or no valid height, return auto
    if (foundElements === 0 || maxBottomPx <= 0) {
      return 'auto';
    }

    const finalVh = (maxBottomPx / viewportHeight) * 100;
    // Only add 5vh buffer, don't force minimum 50vh
    return `${Math.ceil(finalVh + 5)}vh`;
  }

  triggerSectionRecalc() {
    this.sectionsArray = [...this.sectionsArray];
  }
//Helper methods for responsiveness
  isWindowWidthLessThan768(): boolean {
    return window.innerWidth < 769;
  }
 isWindowWidthLessThan530(): boolean {
    return window.innerWidth < 531;
  }
  
  hasSectionGreeting(section: any): boolean {
    return section?.items?.some((item: any) => item.type === 'greeting') || false;
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.triggerSectionRecalc();
    this.changeDetectorRef.detectChanges();
  }
  getSafeHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
 
  getVideoUrl(item: any): string {
  let url = item.localVideoUrl || item.blobUrl || item.tempVideoUrl || item.videoUrl || '';
  
  if (item.isYoutubeOrVimeo && url) {
    url = this.transformYouTubeUrl(url, item.autoPlay, item.loop);
  }
  
  if (url && url.startsWith('blob:')) {
    console.log(`Using blob video URL: ${url} for item ID: ${item.id}`);
  }
  
  return url;
}
  onVideoLoadStart(item: any): void {
    if (item.requireUserToWatch) {
      item.loadStarted = true;
      item.modified = true;
      this.changeDetectorRef.detectChanges();
      item.loadStarted = true;
      item.modified = true;
      this.changeDetectorRef.detectChanges();
    }
  }

  onVideoError(event: any, item: any): void {
    console.error('Video error:', {
      error: event,
      itemId: item.id,
      url: this.getVideoUrl(item),
      isYoutubeOrVimeo: item.isYoutubeOrVimeo,
      videoUrl: item.videoUrl
    });
    this.notificationService.errorTopRight('Failed to load video. Please check the URL or network connection.');
  }

  onAudioError(event: any, item: any): void {
    console.error('Audio error:', {
      error: event,
      itemId: item.id,
      url: this.getAudioUrl(item)
    });
    this.notificationService.errorTopRight('Failed to load audio. Please check the URL or file format.');
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
    console.log('Audio URL for item', item.id, ':', url, 'autoPlay:', item.autoPlay); // Debugging
    return url;
  }

  console.warn('Invalid or missing audio URL for item:', item.id, { audioUrl: item.audioUrl, content: item.content, text: item.text });
  return '';
}
playAudio(item: any): void {
  const audio = document.querySelector(`audio[aria-label='Audio player for ${item.id}']`) as HTMLAudioElement;
  if (audio) {
    audio.play().then(() => {
      item.isPlaying = true;
      this.changeDetectorRef.detectChanges();
      console.log('Audio started playing for item:', item.id);
    }).catch(error => {
      console.error('Failed to play audio:', error, 'Item:', item.id);
      this.notificationService.errorTopRight('Failed to play audio. Please try again.');
    });
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
  
  onResize(event) {
    let chartWidth = event.target.innerWidth > 1100 ? 244 : event.target.innerWidth <= 1100 && event.target.innerWidth > 700 ? event.target.innerWidth - 240 : event.target.innerWidth <= 700 && event.target.innerWidth > 400 ? event.target.innerWidth - 150 : event.target.innerWidth - 80;
    this.view = [chartWidth, 300];
  }


sanitizeVideoUrl(url: string, autoPlay: boolean, loop: boolean): SafeResourceUrl {
  if (!url) {
    console.warn('No URL provided for sanitization');
    return this.sanitizer.bypassSecurityTrustResourceUrl('');
  }

  // Handle YouTube URLs
  if (url.includes('youtu')) {
    url = this.transformYouTubeUrl(url, autoPlay, loop);
  }

  return this.sanitizer.bypassSecurityTrustResourceUrl(url);
}
transformYouTubeUrl(url: string, autoPlay: boolean, loop: boolean): string {
  if (!url || !url.includes('youtu')) {
    console.warn('Invalid YouTube URL:', url);
    return url;
  }

  // Extract video ID from various YouTube URL formats
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  const videoId = match ? match[1] : null;

  if (videoId) {
    let embedUrl = `https://www.youtube.com/embed/${videoId}`;
    const params = [];
    if (autoPlay) {
      params.push('autoplay=1', 'mute=1'); // Mute is required for autoplay
    }
    if (loop) {
      params.push(`loop=1`, `playlist=${videoId}`); // Playlist required for looping
    }
    if (params.length) {
      embedUrl += `?${params.join('&')}`;
    }
    return embedUrl;
  }

  console.warn('Failed to parse YouTube URL:', url);
  return url;
}
 getValidAudioUrl(item: any): string {
    const validAudioExtensions = ['.mp3', '.wav', '.ogg', '.m4a'];
    const isValidUrl = (url: string) => url && validAudioExtensions.some(ext => url.toLowerCase().endsWith(ext));
    const url = item.url || item.content;
    return isValidUrl(url) ? url : '';
  }
  startCarousel() {
    this.carouselSubscription = interval(10000).subscribe(() => {
      this.next();
    });
  }

  next() {
    this.currentCarousel = (this.currentCarousel + 1) % 3;
  }

  getPointsAndSalesSummaryCalculation() {
    this.pointsAndSummaryLoading = true;
    const payload = { userId: sessionStorage.getItem('userId') };
  
    this._modernService.getPointsAndSalesSummaryCalculation(payload).subscribe({
      next: (data) => {
        if (data) {
          if (data?.targetValue) {
            const targetValue = parseFloat(data?.targetValue);          
            this.targetValue = targetValue.toFixed(2)?.toString();
          }
          this.remainingPoints = data?.remaining_Points ? data.remaining_Points : 0;
          this.totalSales = data.total_sales?.toFixed(2) ?? this.totalSales.toFixed(2);
          this._sharedService.setTotalPoints(data.remaining_Points);
          this._sharedService.setIsPointLocked(data?.isPointsLocked);
        }
        this.pointsAndSummaryLoading = false;
      },
      error: (error) => {
        this.pointsAndSummaryLoading = false; 
        console.error('Error fetching points and sales summary:', error);
      }
    });
  }
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  formatNumberWithCommas(value): string {
    if (value == null) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  getNotificationList() {
    this.isNotificationLoading = true;
    this._homeService.getNotificationList(sessionStorage.getItem('userId'), this.notiApiRequest).subscribe({
      next: (data) => {
        this.isNotificationLoading = false;
        this.notifications = data || { results: [], customRecordCount: 0 };
        this.seeMore = new Array(data.results.length).fill(false);
        this.notifications.results = this.notifications.results.map(notification => {
          if (notification.createdDateTime) {
            notification.createdDateTime = moment.tz(
              notification.createdDateTime,
              notification.createdDateTimeZone || 'UTC'
            ).tz('America/New_York').format('MM/DD/YYYY h:mm A');
          }
          if (notification.scheduledDateTime) {
            notification.scheduledDateTime = moment.tz(
              notification.scheduledDateTime,
              notification.scheduledDateTimeZone || 'UTC'
            ).tz('America/New_York').format('MM/DD/YYYY h:mm A');
          }
          // Ensure properties are initialized
          notification.isRead = notification.isRead ?? false;
          notification.ishighlithed = notification.ishighlithed ?? false;
          notification.isAlert = notification.isAlert ?? false;
          return notification;
        });
        this._sharedService.setNotificationCount(data?.customRecordCount ?? 0);
       
      },
      error: (error) => {
        console.error('Error fetching notifications:', error);
        this.isNotificationLoading = false;
        this.notifications = { results: [], customRecordCount: 0 };
        this.seeMore = [];
      }
    });
  }
  
  toggleSeeMore(index: number) {
    this.seeMore[index] = !this.seeMore[index];
  }
  
  getImageById = async () => {
    await this.curriculumData.forEach((item) => {
      if (item.curriculm === 'REQUIRED MONTHLY TRAINING') {
        this.totalCourse = item.totalAvailableCourse ?? 0;
        this.totalAttempted = item.totalCompleted ?? 0;
      }
  
      if (item.list === null) {
        item.list = [];
      }
  
      if (item.list.length > 0) {
        item.list.forEach((groupedCourse: any) => {
          this.trainingCourseService.DownloadCourseLevelImage(groupedCourse.mainCourse.courseId).subscribe({
            next: (resp) => {
              groupedCourse.mainCourse.imageUrl = resp.url;  // Set imageUrl in mainCourse object
            },
            error: () => {
              groupedCourse.mainCourse.imageUrl = 'assets/images/course_default.png';
            }
          });
        });
      }
    });
  }
  getLanguageCodes(languages: string[]): string {
    if (!languages || languages.length <= 1) return '';
    
    // Filter out English and get language codes
    return languages
      .filter(lang => lang !== 'English')
      .map(lang => {
        if (lang === 'Spanish') return 'SP';
        if (lang === 'French') return 'FR';
        return lang.substring(0, 2).toUpperCase();
      })
      .join(', ');
  }
  
  // calculateWidth(totalCourse: number, totalAttempted: number): number {
  //   if (totalCourse === 0) {
  //     return 0;
  //   }
  //   const result = (totalAttempted / totalCourse) * 100;
  //   return parseFloat(result.toFixed(2));
  // }
  
  getLanguageCode(language: string): string {
    switch (language) {
      case 'Spanish':
        return 'SP';
      case 'French':
        return 'FR';
      default:
        return '';
    }
  }
  
  goToCourse(courseCopyId: string, courseId: string, status: string, language: string) {
    const userId = window.sessionStorage.getItem('userId');
    
    if (status === "Pass" || status === "Completed") {
      this._homeService.getAllCourseId(courseId).subscribe(
        (data: any) => {
          if (data && data.length > 0) {
            this.router.navigate(["/kohler-studio-course-result", data[0].slideQuizId]);
          }
        }
      );
    } else {
      // Update course status to "started"
      this._homeService.UpdateAssignCourseStatus({
        courseId: courseId,
        status: "started"
      }).subscribe((resp) => {
        if (resp.isSuccess) {
          this.trainingCourseService.GetallslidesData(courseId, language).subscribe((slides: any) => {
            const sortedSlides = slides.sort((a: any, b: any) => a.indexNum - b.indexNum);
            const firstSlide = sortedSlides[0];
            
            if (firstSlide) {
              // Navigate to appropriate course view based on slide type
              this.router.navigate(
                ["/kohler-studio-course", firstSlide.slideId, courseId, language],
                { queryParams: { courseStatus: status } }
              );
            } else {
              this.checkAndNavigateToQuiz(courseId, status);
            }
          });
        } else {
          this.notificationService.errorTopRight('Something went wrong.');
        }
      });
    }
  }
  
  private checkAndNavigateToQuiz(courseId: string, status: string) {
    this._homeService.GetQuizDataByCourse(courseId).subscribe((quizData: any) => {
      if (quizData && quizData.questionWithOptions?.length > 0) {
        this.router.navigate(
          ["/kohler-studio-course-quiz", courseId],
          { queryParams: { courseStatus: status } }
        );
      } else {
        this.notificationService.errorTopRight('No slides or quiz available for this course.');
      }
    });
  }

 
  getValidUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  }
 

 

  calculateWidth(totalCourse: number, totalAttempted: number): number {
    if (totalCourse === 0) {
      return 0;
    }
    const result = (totalAttempted / totalCourse) * 100;
    return parseFloat(result.toFixed(2));
  }

 
  
  customTooltipFormatting = (data): string => {
    const percentage = `${data.value.toFixed(2)}%`; 
    return `Category is ${data.name}, this will add in your sales ${percentage}`; 
  }
  getTransactionData() {
    this.isTransactionLoading = true;
    const apiRequest = {
      itemCount: 4,
      pageIndex: 1,
      sortBy: 'creadtedDate',
      search: '',
      sortDirection: 'desc',
      filter: []
    };
    const id = window.sessionStorage.getItem('userId');
    const type = 'all';
    
    this._homeService.TransactionsPagination(id, type, apiRequest).subscribe(data => {
      this.isTransactionLoading = false; 
      
      if (data && data.results && data.results.length > 0) {
        data.results.forEach((item) => {
          item.dateProcessed = item.dateProcessed
            ? moment.utc(item.dateProcessed).format('MM-DD-YYYY')
            : 'N/A';
    
          item.dateOfSale = item.dateOfSale
            ? moment.utc(item.dateOfSale).format('MM-DD-YYYY')
            : 'N/A';
    
          if (item.itemQuantity) {
            item.itemQuantity = this.formatNumberWithCommas(item.itemQuantity);
          }
    
          if (item.transactionType === 'Redemption') {
            item.listPrice = 'N/A';
            if (item.list && item.list.length > 0) {
              const nestedItem = item.list[0]; 
              item.totalPoints = nestedItem.pointsRedemeed 
                ? `-${this.formatNumberWithCommas(nestedItem.pointsRedemeed)}`
                : '0';
            } else {
              item.totalPoints = '0';
            }
          } 
          else if (item.transactionType === 'Credit') {
            if (item.totalPoints) {
              item.totalPoints = this.formatNumberWithCommas(item.totalPoints);
            }
          }

          if (item.pointsRedemeed) {
            item.pointsRedemeed = this.formatNumberWithCommas(item.pointsRedemeed);
          }
    
          item.invoiceNumber = item.invoiceNumber || 'N/A';
          item.orderNumber = item.orderNumber || 'N/A';
        });
    
        this.transactionData = data.results; 
      } else {
        this.transactionData = []; 
      }
    }, error => {
      this.isTransactionLoading = false; 
      this.transactionData = []; 
    });
  }
  getRedemptionTransactionData() {
    this.isTransactionRedemptionLoading = true;
    const apiRequest = {
      itemCount: 4,
      pageIndex: 1,
      sortBy: 'creadtedDate',
      search: '',
      sortDirection: 'desc',
      filter: []
    };
    const id = window.sessionStorage.getItem('userId');
    const type = 'Redemption';
    
    this._homeService.TransactionsPagination(id, type, apiRequest).subscribe(data => {
      this.isTransactionRedemptionLoading = false; 
      
      if (data && data.results && data.results.length > 0) {
        data.results.forEach((item) => {
          item.dateProcessed = item.dateProcessed
            ? moment.utc(item.dateProcessed).format('MM-DD-YYYY')
            : 'N/A';
    
          item.dateOfSale = item.dateOfSale
            ? moment.utc(item.dateOfSale).format('MM-DD-YYYY')
            : 'N/A';
    
          if (item.itemQuantity) {
            item.itemQuantity = this.formatNumberWithCommas(item.itemQuantity);
          }
    
          if (item.transactionType === 'Redemption') {
            item.listPrice = 'N/A';
            if (item.list && item.list.length > 0) {
              const nestedItem = item.list[0]; 
              item.totalPoints = nestedItem.pointsRedemeed 
                ? `-${this.formatNumberWithCommas(nestedItem.pointsRedemeed)}`
                : '0';
            } else {
              item.totalPoints = '0';
            }
          } 
          else if (item.transactionType === 'Credit') {
            if (item.totalPoints) {
              item.totalPoints = this.formatNumberWithCommas(item.totalPoints);
            }
          }

          if (item.pointsRedemeed) {
            item.pointsRedemeed = this.formatNumberWithCommas(item.pointsRedemeed);
          }
    
          item.invoiceNumber = item.invoiceNumber || 'N/A';
          item.orderNumber = item.orderNumber || 'N/A';
        });
    
        this.redemptionTransactionData = data.results; 
      } else {
        this.redemptionTransactionData = []; 
      }
    }, error => {
      this.isTransactionRedemptionLoading = false; 
      this.redemptionTransactionData = []; 
    });
  }
  getCreditTransactionData() {
    this.isTransactionCreditLoading = true;
    const apiRequest = {
      itemCount: 4,
      pageIndex: 1,
      sortBy: 'creadtedDate',
      search: '',
      sortDirection: 'desc',
      filter: []
    };
    const id = window.sessionStorage.getItem('userId');
    const type = 'credit';
    
    this._homeService.TransactionsPagination(id, type, apiRequest).subscribe(data => {
      this.isTransactionCreditLoading = false; 
      
      if (data && data.results && data.results.length > 0) {
        data.results.forEach((item) => {
          item.dateProcessed = item.dateProcessed
            ? moment.utc(item.dateProcessed).format('MM-DD-YYYY')
            : 'N/A';
    
          item.dateOfSale = item.dateOfSale
            ? moment.utc(item.dateOfSale).format('MM-DD-YYYY')
            : 'N/A';
    
          if (item.itemQuantity) {
            item.itemQuantity = this.formatNumberWithCommas(item.itemQuantity);
          }
    
          if (item.transactionType === 'Redemption') {
            item.listPrice = 'N/A';
            if (item.list && item.list.length > 0) {
              const nestedItem = item.list[0]; 
              item.totalPoints = nestedItem.pointsRedemeed 
                ? `-${this.formatNumberWithCommas(nestedItem.pointsRedemeed)}`
                : '0';
            } else {
              item.totalPoints = '0';
            }
          } 
          else if (item.transactionType === 'Credit') {
            if (item.totalPoints) {
              item.totalPoints = this.formatNumberWithCommas(item.totalPoints);
            }
          }

          if (item.pointsRedemeed) {
            item.pointsRedemeed = this.formatNumberWithCommas(item.pointsRedemeed);
          }
    
          item.invoiceNumber = item.invoiceNumber || 'N/A';
          item.orderNumber = item.orderNumber || 'N/A';
        });
    
        this.creditTransactionData = data.results; 
      } else {
        this.creditTransactionData = []; 
      }
    }, error => {
      this.isTransactionCreditLoading = false; 
      this.creditTransactionData = []; 
    });
  }
    
    

  formatSelectedDate(value) {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = this.padZero(date.getMonth() + 1);
    const day = this.padZero(date.getDate());
    const formattedDate = `${month}/${day}/${year}`;
    return formattedDate
  }

  padZero(num: number, size: number = 2): string {
    let s = num.toString();
    while (s.length < size) s = '0' + s;
    return s;
  }
  

  
  formatToDollar(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
  }

  handleReadClick(noti) {
    if (noti.isAlert) {
      return;
    }
    if (!noti.isRead) {
      
      const request= [
        {
          "id": noti.notificationId
        }
      ]
      this._homeService.markRead(request).subscribe(data => {
        if(data.isSuccess) 
          this.getNotificationList();
      });
    }
}
  handleCarouselChange(value) {
    this.currentCarousel = value;
  }
  
  routeToProgram()
  {
    this.router.navigate(['/program-rules']);
  }
  routeToNotification()
  {
    this.router.navigate(['/notifications']);
  }
  sanitizedChartHeading(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  formatHyperlink(link: string): string {
  if (!link) return null;
  if (link.match(/^https?:\/\//)) return link;
  if (link.includes('@')) return `mailto:${link}`;
  if (link.match(/^[\d\(\)\-\s\+]+$/)) return `tel:${link}`;
  return `https://${link}`;
}
getSafeNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'object') {
    // If it's an object, try to extract a numeric field (common patterns)
    if (value.value !== undefined) return Number(value.value) || 0;
    if (value.amount !== undefined) return Number(value.amount) || 0;
    if (value.total !== undefined) return Number(value.total) || 0;
  }
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

}