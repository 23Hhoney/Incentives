import { Component } from "@angular/core";
import { KohlerStudioService } from "../kohler-studio/kohler-studio.service";
import { ActivatedRoute, Router } from "@angular/router";
import { TrainingCourseManagerService } from "app/modules/admin-panel/training-course-manager/training-course-manager.service";
import { NotificationService } from "app/shared/notification/notification";
import { SharedService } from "app/shared/shared-service";
import { ModernService } from "app/layout/layouts/horizontal/modern/modern.service";
import { ManageWebsiteService } from "app/modules/pages/authentication/manage-website/manage-website.service";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Component({
  selector: "app-academy-cirriculums",
  templateUrl: "./academy-cirriculums.component.html",
  styleUrls: ["./academy-cirriculums.component.scss"],
})
export class AcademyCirriculumsComponent {
  courses: any[] = [];
  totalCourse = 0;
  totalAttempted = 0;
  loading: boolean = false;
  userId: any;
  progressOffset: number = 440;
  mandatoryList = [];
  languages: any[] = [];
  selectedLanguage: any;
  filteredCourses: any[] = [];
  totalRequiredCourses = 0;
  totalRequiredCompleted = 0;
  hasRequiredCourses: boolean = false;
  showPublishedPage = false;
  publishedPage = null;
  sectionsArray = [];
  isPreview: boolean;
  draftId: string;

  constructor(
    private service: KohlerStudioService,
    private trainingCourseService: TrainingCourseManagerService,
    private router: Router,
    private notificationService: NotificationService,
    private _sharedService: SharedService,
    private _modernService: ModernService,
    private route: ActivatedRoute,
    private manageWebsiteContent: ManageWebsiteService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.userId = window.sessionStorage.getItem("userId");
    this.route.queryParamMap.subscribe(params => {
      this.isPreview = params.get('isPreview') === 'true';
      this.draftId = params.get('draftId');    
    });
    this.loadLanguages().then(() => {
      this.route.queryParams.subscribe(params => {
        const languageFromQuery = params['language'];
        
        if (languageFromQuery) {
          const languageExists = this.languages.find(lang =>
            lang.name === languageFromQuery || lang.value === languageFromQuery
          );
          
          if (languageExists) {
            this.selectedLanguage = languageFromQuery;
          } else {
            this.selectedLanguage = 'English';
          }
        } else {
          this.selectedLanguage = 'English';
        }
        
        this.GetAllCourses();
      });
    }).catch(error => {
      console.error('Error loading languages:', error);
      this.selectedLanguage = 'English';
      this.GetAllCourses();
    });
    
    this.getPointsAndSalesSummaryCalculation();
    this.manageWebsiteContent.GetAllCMSMenu(false).subscribe((res: any[]) => {
      const filteredRes = res.filter(item => !item.menuId.startsWith('DRFT_') && item.menuId !== 'DRFT_RESTORED');
      
      filteredRes.forEach((items) => {
        if (items.menuId === 'AC') {
          this.publishedPage = items;
        }
      });
      if (this.draftId != null) {
        this.showPublishedPage = true;
        this.manageWebsiteContent.GetAllCMSContainer(this.draftId, false).subscribe((resp: any[]) => {
          this.sectionsArray = resp.map((section, sectionIndex) => {
            // Parse styles for all items in this section
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
              height: 100,
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

                  // Parse button styling
                  let buttonStyle: any = {};
                  if (items.type === 'button' && items.salesHeading) {
                    try {
                      buttonStyle = typeof items.salesHeading === 'string' ? JSON.parse(items.salesHeading) : items.salesHeading;
                    } catch (e) {
                      console.warn('Failed to parse button salesHeading for item', items.id, ':', e);
                    }
                  }

                  // Handle media URLs
                  let images: string[] = [];
                  let localVideoUrl: string | null = null;
                  let videoUrl: string | null = null;
                  let audioUrl: string | null = null;
                  let isYoutubeOrVimeo: boolean = false;
                  let autoPlay: boolean = false;
                  let loop: boolean = false;
                  let requireUserToWatch: boolean = false;
                  let textContent: string = '';
                  if (items.text) {
                    textContent = items.text;
                    if (!textContent.includes('<p>') && textContent.trim()) {
                      textContent = `<p>${textContent}</p>`;
                    }
                  } else if (items.getAllCMSItemViews?.length && items.getAllCMSItemViews[0].content) {
                    const firstItem = items.getAllCMSItemViews[0];
                    if (firstItem.type === 'text' || items.type === 'text' || items.type === 'textbox') {
                      textContent = firstItem.content;
                      if (!textContent.includes('<p>') && textContent.trim()) {
                        textContent = `<p>${textContent}</p>`;
                      }
                    }
                  }

                  const defaultLeft = idx * 20;
                  const defaultTop = 10;
                  const defaultHeight = 100;

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
                    hyperlink: items.chartHeading || '',
                    buttonStyle: buttonStyle,
                    styles: parsedStyles,
                    xPercent: fitWidthData.xPercent ?? (parsedStyles.left != null ? parseFloat(parsedStyles.left) : defaultLeft),
                    yPercent: fitWidthData.yPercent ?? (parsedStyles.top != null ? parseFloat(parsedStyles.top) : defaultTop),
                    widthPercent: fitWidthData.widthPercent ?? (items.containerSize || 30),
                    heightPercent: fitWidthData.heightPercent ?? (parsedStyles.height || defaultHeight),
                    zIndex: fitWidthData.zindex ?? (parsedStyles.zindex || (idx + 1)),
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

          // Fix duplicate positions
          this.sectionsArray.forEach((section, index) => {
            if (index > 0 && section.position === this.sectionsArray[index - 1].position) {
              section.position = this.sectionsArray[index - 1].position + 1;
            }
          });
        });
      }
     else if (this.publishedPage) {
        this.showPublishedPage = true;
        this.manageWebsiteContent.GetAllCMSContainer(this.publishedPage.id, true).subscribe((resp: any[]) => {
          this.sectionsArray = resp.map((section, sectionIndex) => {
            // Parse styles for all items in this section
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
              height: 100,
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

                  // Parse button styling
                  let buttonStyle: any = {};
                  if (items.type === 'button' && items.salesHeading) {
                    try {
                      buttonStyle = typeof items.salesHeading === 'string' ? JSON.parse(items.salesHeading) : items.salesHeading;
                    } catch (e) {
                      console.warn('Failed to parse button salesHeading for item', items.id, ':', e);
                    }
                  }

                  // Handle media URLs
                  let images: string[] = [];
                  let localVideoUrl: string | null = null;
                  let videoUrl: string | null = null;
                  let audioUrl: string | null = null;
                  let isYoutubeOrVimeo: boolean = false;
                  let autoPlay: boolean = false;
                  let loop: boolean = false;
                  let requireUserToWatch: boolean = false;
                  let textContent: string = '';
                  if (items.text) {
                    textContent = items.text;
                    if (!textContent.includes('<p>') && textContent.trim()) {
                      textContent = `<p>${textContent}</p>`;
                    }
                  } else if (items.getAllCMSItemViews?.length && items.getAllCMSItemViews[0].content) {
                    const firstItem = items.getAllCMSItemViews[0];
                    if (firstItem.type === 'text' || items.type === 'text' || items.type === 'textbox') {
                      textContent = firstItem.content;
                      if (!textContent.includes('<p>') && textContent.trim()) {
                        textContent = `<p>${textContent}</p>`;
                      }
                    }
                  }

                  const defaultLeft = idx * 20;
                  const defaultTop = 10;
                  const defaultHeight = 100;

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
                    hyperlink: items.chartHeading || '',
                    buttonStyle: buttonStyle,
                    styles: parsedStyles,
                    xPercent: fitWidthData.xPercent ?? (parsedStyles.left != null ? parseFloat(parsedStyles.left) : defaultLeft),
                    yPercent: fitWidthData.yPercent ?? (parsedStyles.top != null ? parseFloat(parsedStyles.top) : defaultTop),
                    widthPercent: fitWidthData.widthPercent ?? (items.containerSize || 30),
                    heightPercent: fitWidthData.heightPercent ?? (parsedStyles.height || defaultHeight),
                    zIndex: fitWidthData.zindex ?? (parsedStyles.zindex || (idx + 1)),
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

          // Fix duplicate positions
          this.sectionsArray.forEach((section, index) => {
            if (index > 0 && section.position === this.sectionsArray[index - 1].position) {
              section.position = this.sectionsArray[index - 1].position + 1;
            }
          });
        });
      } else {
        this.showPublishedPage = false;
      }
    });
  }
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  async getImageById(): Promise<void> {
    const imagePromises = this.filteredCourses.map(async (item) => {
      if (item.curriculm === 'REQUIRED MONTHLY TRAINING') {
        this.totalCourse = item.totalAvailableCourse ?? 0;
        this.totalAttempted = item.totalCompleted ?? 0;
      }

      if (!item.list) {
        item.list = [];
        return;
      }

      if (item.list.length > 0) {
        const courseImagePromises = item.list.map((groupedCourse: any) => {
          return new Promise<void>((resolve) => {
            this.trainingCourseService.DownloadCourseLevelImage(groupedCourse.mainCourse.courseId).subscribe({
              next: (resp) => {
                groupedCourse.mainCourse.imageUrl = resp.url;
                resolve();
              },
              error: () => {
                groupedCourse.mainCourse.imageUrl = 'assets/images/course_default.png';
                resolve();
              }
            });
          });
        });
        
        await Promise.all(courseImagePromises);
      }
    });

    await Promise.all(imagePromises);
  }

  loadLanguages(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.trainingCourseService.GetLanguage().subscribe({
        next: (response: any) => {
          this.languages = response || [];
          resolve();
        },
        error: (error) => {
          console.error('Error loading languages:', error);
          this.languages = [{ name: 'English', value: 'English' }]; // Fallback
          reject(error);
        }
      });
    });
  }

  getPointsAndSalesSummaryCalculation() {
    const payload = { userId: sessionStorage.getItem('userId') };
    this._modernService.getPointsAndSalesSummaryCalculation(payload).subscribe({
      next: (data) => {
        if (data) {
          this._sharedService.setIsPointLocked(data?.isPointsLocked);
        }
      },
      error: (error) => {
        console.error('Error getting points calculation:', error);
      }
    });
  }

  calculateWidth(totalCourse: number, totalAttempted: number): number {
    if (totalCourse === 0) {
      return 0;
    }
    const result = (totalAttempted / totalCourse) * 100;
    return parseFloat(result.toFixed(2));
  }

  calculateProgress(startDate: Date, endDate: Date): number {
    const currentDate = new Date();
    const totalTime = endDate.getTime() - startDate.getTime();
    const elapsedTime = currentDate.getTime() - startDate.getTime();
    return (elapsedTime / totalTime) * 100;
  }

  checkIfRequiredCoursesExist() {
    this.hasRequiredCourses = this.totalRequiredCourses > 0;
    console.log('Total Required Courses:', this.totalRequiredCourses);
    console.log('Has Required Courses:', this.hasRequiredCourses);
  }

  GetAllCourses() {
    this.loading = true;
    this.totalCourse = 0;
    this.totalAttempted = 0;
    this.totalRequiredCourses = 0;
    this.totalRequiredCompleted = 0;
    this.mandatoryList = [];

    this.service.GetAllCourses(this.userId, this.selectedLanguage).subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          this.courses = data.map(curriculum => {
            curriculum.open = true;
            curriculum.languageNames = {};

            if (curriculum.list && curriculum.list.length > 0) {
              const groupedList = Object.values(
                curriculum.list.reduce((acc: any, course: any) => {
                  const copyId = course.courseCopyId;
                  if (!acc[copyId]) {
                    acc[copyId] = {
                      mainCourse: course,
                      languages: [],
                    };
                  }
                  acc[copyId].languages.push({
                    courseId: course.courseId,
                    courseCopyId: course.courseCopyId,
                    course: course.course,
                    language: course.language,
                    status: course.status,
                    progressStatus: course.progressStatus,
                    points: course.points,
                    required: course.isRequired,
                    isRequired: course.isRequired,
                    description: course.description
                  });

                  curriculum.languageNames[course.language] = course.curriculm;
                  return acc;
                }, {})
              );

              groupedList.forEach((group: any) => {
                const languageCourse = group.languages.find((lang: any) => lang.language === this.selectedLanguage);
                if (languageCourse) {
                  group.mainCourse = {
                    ...languageCourse,
                    required: languageCourse.isRequired,
                    isRequired: languageCourse.isRequired,
                    description: languageCourse.description
                  };
                }
              });

              curriculum.list = groupedList;
            }
            return curriculum;
          });

          this.createRequiredMonthlyTrainingSection();
          this.filterCoursesByLanguage(this.selectedLanguage);
          this.getImageById().then(() => {
            this.checkIfRequiredCoursesExist();
          });
        } else {
          this.courses = [];
          this.filteredCourses = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error("Error fetching courses:", error);
        this.loading = false;
        this.notificationService.errorTopRight('Error loading courses. Please try again.');
      }
    });
  }

  createRequiredMonthlyTrainingSection() {
    const requiredCoursesMap = new Map();
    let requiredCoursesCount = 0;
    let requiredCompletedCount = 0;

    this.courses.forEach(curriculum => {
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

              if (course.mainCourse.status === 'Pass' ||
                  course.mainCourse.progressStatus === 'Completed') {
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

    const requiredTrainingIndex = this.courses.findIndex(
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
      this.courses[requiredTrainingIndex] = requiredTrainingCurriculum;
    } else {
      this.courses.unshift(requiredTrainingCurriculum);
    }

    console.log('Deduplicated Required Courses:', requiredCourses);
    console.log('Total Required Courses Count:', requiredCoursesCount);
  }

  filterCoursesByLanguage(languageName: string) {
    if (!languageName) {
      languageName = 'English';
      this.selectedLanguage = 'English';
    } else {
      this.selectedLanguage = languageName;
    }

    this.filteredCourses = this.courses.map(curriculum => {
      if (!curriculum.list || !Array.isArray(curriculum.list)) {
        return {
          ...curriculum,
          list: []
        };
      }

      const filteredList = curriculum.list.filter((course: any) => {
        return course.languages && Array.isArray(course.languages) &&
          course.languages.some((lang: any) => lang.language === languageName);
      }).map((course: any) => {
        if (!course.languages || !Array.isArray(course.languages)) {
          return course;
        }

        const languageCourse = course.languages.find((lang: any) => lang.language === languageName);
        if (languageCourse) {
          return {
            ...course,
            mainCourse: {
              ...course.mainCourse,
              course: languageCourse.course || course.mainCourse.course,
              courseId: languageCourse.courseId,
              language: languageCourse.language,
              status: languageCourse.status,
              points: languageCourse.points || course.mainCourse.points,
              progressStatus: languageCourse.progressStatus,
              required: languageCourse.isRequired || course.mainCourse.required,
              isRequired: languageCourse.isRequired || course.mainCourse.isRequired,
            }
          };
        }
        return course;
      });

      return {
        ...curriculum,
        list: filteredList
      };
    }).filter(curriculum => curriculum.list && curriculum.list.length > 0);
  }

  calculateRequiredCoursesWidth(): number {
    if (this.totalRequiredCourses === 0) {
      return 0;
    }
    const result = (this.totalRequiredCompleted / this.totalRequiredCourses) * 100;
    return parseFloat(result.toFixed(2));
  }

  onLanguageChange() {
    // Update URL with selected language
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { language: this.selectedLanguage },
      queryParamsHandling: 'merge'
    });

    this.GetAllCourses();
  }

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
  this.service.GetCourseLangaugeCompletedstatus(courseCopyId, this.userId).subscribe({
    next: (resp: any) => {
      if (resp) {
        const completedLanguage = resp.useLanguage;
        
        if (completedLanguage === 'English' || completedLanguage === 'Spanish' || completedLanguage === 'French') {
          
          if (completedLanguage === this.selectedLanguage) {
            this.proceedWithCourse(courseCopyId, courseId, status, language);
          } else {
            this.notificationService.infoTopRight(
              `You have completed the course in ${completedLanguage} language. Please try accessing the ${completedLanguage} language to view the results.`
            );
            return; 
          }
        } else {
          // If no valid completion status, proceed with normal flow
          this.proceedWithCourse(courseCopyId, courseId, status, language);
        }
      } else {
        // If no completion status, proceed with normal flow
        this.proceedWithCourse(courseCopyId, courseId, status, language);
      }
    },
    error: (error) => {
      console.error('Error fetching course completion status:', error);
      // On error, proceed with normal flow
      this.proceedWithCourse(courseCopyId, courseId, status, language);
    }
  });
}

// Extract the original course logic into a separate method
private proceedWithCourse(courseCopyId: string, courseId: string, status: string, language: string) {
  if (status === "Pass" || status === "Completed") {
    this.service.GetLmsUserQuizScoreCheckPass(this.userId, courseCopyId).subscribe({
      next: (resp) => {
        if (resp.status === "Pass") {
          this.router.navigate(['/kohler-studio-course-result', resp.courseId]);
        }
      },
      error: (error) => {
        console.error('Error checking quiz score:', error);
        this.notificationService.errorTopRight('Error checking course status.');
      }
    });
  } else {
    this.service.UpdateAssignCourseStatus({
      courseId: courseId,
      status: "started"
    }).subscribe({
      next: (resp) => {
        if (resp.isSuccess) {
          this.trainingCourseService.GetallslidesData(courseId, language).subscribe({
            next: (slides: any) => {
              const sortedSlides = slides.sort((a: any, b: any) => a.indexNum - b.indexNum);
              const firstSlide = sortedSlides[0];
              if (firstSlide) {
                this.router.navigate(
                  ["/kohler-studio-course", firstSlide.slideId, courseId, language],
                  { queryParams: { courseStatus: status, selectedLanguage: this.selectedLanguage } }
                );
              } else {
                this.checkAndNavigateToQuiz(courseId, status);
              }
            },
            error: (error) => {
              console.error('Error getting slides data:', error);
              this.checkAndNavigateToQuiz(courseId, status);
            }
          });
        } else {
          this.notificationService.errorTopRight('Something went wrong.');
        }
      },
      error: (error) => {
        console.error('Error updating course status:', error);
        this.notificationService.errorTopRight('Error starting course.');
      }
    });
  }
}


  private checkAndNavigateToQuiz(courseId: string, status: string) {
    this.service.GetQuizDataByCourse(courseId).subscribe({
      next: (quizData: any) => {
        if (quizData && quizData.questionWithOptions?.length > 0) {
          this.router.navigate(
            ["/kohler-studio-course-quiz", courseId],
            { queryParams: { courseStatus: status, selectedLanguage: this.selectedLanguage } }
          );
        } else {
          this.notificationService.errorTopRight('No slides or quiz available for this course.');
        }
      },
      error: (error) => {
        console.error('Error getting quiz data:', error);
        this.notificationService.errorTopRight('Error loading quiz data.');
      }
    });
  }
}

