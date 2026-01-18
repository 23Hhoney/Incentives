import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { KohlerStudioService } from '../kohler-studio/kohler-studio.service';
import { TrainingCourseManagerService } from 'app/modules/admin-panel/training-course-manager/training-course-manager.service';
import { NotificationService } from 'app/shared/notification/notification';

@Component({
  selector: 'app-kohler-studio-part-course',
  templateUrl: './kohler-studio-part-course.component.html',
  styleUrls: ['./kohler-studio-part-course.component.scss']
})
export class KohlerStudioPartCourseComponent {
  CourseId: string;
  SubCourseName: any;
  wordLimit: number = 40;
  showMore: boolean = false;
  noDataFound = false;
  currentSlideIndex = 0;
  slideId = null
  audioSlideData = null;
  audioSlides = [];
  CourseName: any;
  loader = false;
  audioUrl = null;
  slides = null;
  courseContentQuizSlideId: any;
  isAudioPlayed = false;

  editors: any[] = [];
  buttons: any[] = [];
  textBoxContent: string;
  language: string;
  courseid: string;

  constructor(
    private _formBuilder: FormBuilder,
    private router: Router,
    private service:KohlerStudioService,
    private route: ActivatedRoute,
    private trainingService: TrainingCourseManagerService,
    private notificationService: NotificationService
){}

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
  const videoData = data.uploadLmsSlideFileModelData?.find(x => x.type === 'audio-content');
  if (videoData) {
    const videoUrl = videoData.content || `${videoData.url}${videoData.fileName}`;
   // this.setupVideoSlide(videoUrl);
  }
}

onAudioEnded(event: Event): void {
  this.isAudioPlayed = true;
}


openButtonLink(link: string) {
  if (link) {
    window.open(link, '_blank');
  }
}

navigateToAnotherComponent() {
  // First check if video watching is mandatory
  if (this.audioSlideData?.mandatory && !this.isAudioPlayed) {
    this.notificationService.errorTopRight('You must listen to  the full audio to proceed');
    return;
  }

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
nextSlide(){
  this.switchSlide(this.currentSlideIndex + 1);
}
previousSlide() {
  this.switchSlide(this.currentSlideIndex - 1);
}
switchSlide(index) {
  if(+index === -1) {
    const isPreview = JSON.parse(sessionStorage.getItem('isPreview'))
    if(isPreview) {
      this.router.navigate(['training-course-manager/training-course-manager-add-edit', this.CourseId])
    } else {
      this.router.navigate(['/academy-curriculums'])
    }
  } 
  if(this.slides[index]?.slideName.includes('Image')) {
      this.router.navigate(["/kohler-studio-Image-course", this.CourseId, this.slides[index]?.id]);
    } else if(this.slides[index].slideName.includes('Video')) {
      this.router.navigate(["/kohler-studio-course", this.CourseId, this.slides[index]?.id]);
    } else if(this.slides[index].slideName.includes('Audio')) {
      this.router.navigate(["/kohler-studio-part-course", this.CourseId, this.slides[index]?.id]);
    } else if(this.slides[index].slideName.includes('Text')) {
      this.router.navigate(["/kohler-studio-text-course", this.CourseId, this.slides[index]?.id]);
    } else if(this.slides[index].slideName.includes('Quiz')) {
      if(this.courseContentQuizSlideId) {
        this.router.navigate(['/kohler-studio-course-quiz', this.courseContentQuizSlideId]);
      } else {
        this.notificationService.errorTopRight('No quiz is added to this course yet.')
      }
    }
}

  
  
}
