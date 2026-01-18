import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingCourseManagerService } from 'app/modules/admin-panel/training-course-manager/training-course-manager.service';
import { KohlerStudioService } from '../kohler-studio/kohler-studio.service';
import { NotificationService } from 'app/shared/notification/notification';

@Component({
  selector: 'app-kohler-studio-image',
  templateUrl: './kohler-studio-image.component.html',
  styleUrls: ['./kohler-studio-image.component.scss']
})
export class KohlerStudioImageComponent {
  ShowKohler:boolean=false;
  quiz1: FormGroup;
  SubCourseId: string;
  subCourseId: string;
  SubCourseName: any;
  imageSlides = [];
  currentIndex = 0
  ImageUrl = null;
  loader = false;
  ImageSlideData = null;
  NoDataAvailable = false;
  CourseName: any;
  slides = [];
  isVideoWatched = false;
  wordLimit: number = 40;
  showMore: boolean = false;
  courseContentQuizSlideId: any;
  currentSlideIndex = 0;
  slideId = null
  noDataFound: boolean;
  language: string;
  courseid: string;

  constructor(private _formBuilder: FormBuilder,
    private trainingService: TrainingCourseManagerService,
    private route: ActivatedRoute,
    private service:KohlerStudioService,
    private router: Router,
    private notificationService: NotificationService) {
   
  }


  toggleShowMore() {
    this.showMore = !this.showMore;
  }
  editors: any[] = [];
  buttons: any[] = [];
  textBoxContent: string;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
     
      this.language = params.get('lang');
      this.courseid = params.get('courseId');
      this.slideId = params.get('slideId');
      this.GetallSlides();
      this.loadSlideData(this.slideId);
    });
  }

  GetallSlides() {
    this.loader = true;
    this.trainingService.GetallslidesData(this.courseid, this.language).subscribe(data => {
      this.slides = data;
      this.currentSlideIndex = this.slides.findIndex(slide => slide.id === this.slideId);
      // Remove the immediate quiz check here
      this.loader = false;
    });
  }

  loadSlideData(slideId: string) {
    this.loader = true;
    this.editors = [];
    this.buttons = [];
    
    this.service.GetAllLmsSlideGroupFieldsandData(slideId).subscribe({
      next: (data) => {
        if (data) {
          this.processSlideData(data);
        } else {
          this.noDataFound = true;
        }
        this.loader = false;
      }
    });
  }

  processSlideData(data: any) {
    // Process text content
    data.lmsSlideGroupViewDatas?.forEach(group => {
      if (group.name === 'textBox') {
        const textBoxField = group.lmsSlideGroupFieldViews[0];
        this.textBoxContent = textBoxField.lmsSlideGroupFieldsValueViewData?.htmlEditorValue;
      }

      group.lmsSlideGroupFieldViews.forEach(field => {
        if (group.name === 'button') {
          group.lmsSlideGroupFieldViews.forEach(field => {
            // Parse the HTML content to extract button text and link
            const htmlContent = field.lmsSlideGroupFieldsValueViewData?.htmlEditorValue || '';
            const linkMatch = htmlContent.match(/window\.open\('([^']+)'/);
            const textMatch = htmlContent.match(/>([^<]+)<\/button>/);
            
            this.buttons.push({
              text: textMatch ? textMatch[1] : 'Click Here',
              link: linkMatch ? linkMatch[1] : ''
            });
          });
        } 
        
        else {
          this.editors.push({
            content: field.lmsSlideGroupFieldsValueViewData?.htmlEditorValue
          });
        }
      });
    });

    // Process video content
    const videoData = data.uploadLmsSlideFileModelData?.find(x => x.type === 'video');
    if (videoData) {
      const videoUrl = videoData.content || `${videoData.url}${videoData.fileName}`;
     // this.setupVideoSlide(videoUrl);
    }
  }

  

  openButtonLink(link: string) {
    if (link) {
      window.open(link, '_blank');
    }
  }


  navigateToAnotherComponent() {
    // First check if video watching is mandatory
    // Since there's only one slide and we're at the end, check for quiz
    this.service.GetQuizDataByCourse(this.courseid).subscribe((quizData: any) => {
      if (quizData && quizData.questionWithOptions?.length > 0) {
        this.router.navigate(["/kohler-studio-course-quiz", this.courseid]);
      } else {
        // Handle case when there's no quiz
        const isPreview = JSON.parse(sessionStorage.getItem('isPreview'));
        this.router.navigate(isPreview ? 
          ['training-courses/training-course-edit-add', this.courseid] : 
          ['/academy-curriculums']);
      }
    });
  }
  


  navigateBack() {
    if (this.currentSlideIndex === 0) {
      const isPreview = JSON.parse(sessionStorage.getItem('isPreview'));
      this.router.navigate(isPreview ? 
        ['training-courses/training-course-edit-add', this.courseid] : 
        ['/academy-curriculums']);
    } else {
      const prevIndex = this.currentSlideIndex - 1;
      this.loadSlideData(this.slides[prevIndex].id);
      this.currentSlideIndex = prevIndex;
    }
  }
}
