import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingCourseManagerService } from 'app/modules/admin-panel/training-course-manager/training-course-manager.service';
import { KohlerStudioService } from '../kohler-studio/kohler-studio.service';
import { NotificationService } from 'app/shared/notification/notification';

@Component({
  selector: 'app-kohler-studio-text',
  templateUrl: './kohler-studio-text.component.html',
  styleUrls: ['./kohler-studio-text.component.scss']
})
export class KohlerStudioTextComponent {
  ShowKohler:boolean=false;
  quiz1: FormGroup;
  subCourseId: string;
  SubCourseName: any;
  loader = false;
  TextSlideData = null;
  NoDataAvailable = false;
  CourseName: any;
  slides = [];
  isVideoWatched = false;
  wordLimit: number = 40;
  showMore: boolean = false;
  courseContentQuizSlideId: any;
  currentSlideIndex = 0;
  slideId = null

  constructor(private _formBuilder: FormBuilder,
    private trainingService: TrainingCourseManagerService,
    private route: ActivatedRoute,
    private service:KohlerStudioService,
    private router: Router,
    private notificationService: NotificationService) {
   
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.subCourseId = params.get('SubCourseId');
      this.slideId = params.get('slideId')
      this.GetallSlides()
      this.GetSubCourse()
      this.GetCourseSlideDetail();
    });
  }

  toggleShowMore() {
    this.showMore = !this.showMore;
  }
  GetallSlides() {
    this.loader = true
    this.trainingService.Getallslides(this.subCourseId).subscribe(data => {
      this.slides = data;
      this.currentSlideIndex = this.slides.findIndex(slide => slide.id === this.slideId);
      if(this.slides[this.currentSlideIndex]?.id)  {
        this.trainingService.GetSlideMediaContent(this.subCourseId, this.slides[this.currentSlideIndex].id).subscribe(data => {
          if(data && data.id){
            this.TextSlideData = data;
            this.loader = false;
          } else {
            this.loader = false;
            this.NoDataAvailable = true;
          }
        });
      } else {
        this.loader = false;
        this.NoDataAvailable = true;
      }
    });
  }
  GetCourseSlideDetail() {
    this.service.GetAllCourseId(this.subCourseId).subscribe(data=>{
      if (data) {
        this.courseContentQuizSlideId = data[0].id
      }
    })
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
        this.router.navigate(['training-course-manager/training-course-manager-add-edit', this.subCourseId])
      } else {
        this.router.navigate(['/academy-curriculums'])
      }
    } 
    if(this.slides[index]?.slideName.includes('Image')) {
        this.router.navigate(["/kohler-studio-Image-course", this.subCourseId, this.slides[index]?.id]);
      } else if(this.slides[index].slideName.includes('Video')) {
        this.router.navigate(["/kohler-studio-course", this.subCourseId, this.slides[index]?.id]);
      } else if(this.slides[index].slideName.includes('Audio')) {
        this.router.navigate(["/kohler-studio-part-course", this.subCourseId, this.slides[index]?.id]);
      } else if(this.slides[index].slideName.includes('Text')) {
        this.router.navigate(["/kohler-studio-text-course", this.subCourseId, this.slides[index]?.id]);
      } else if(this.slides[index].slideName.includes('Quiz')) {
        if(this.courseContentQuizSlideId) {
          this.router.navigate(['/kohler-studio-course-quiz', this.courseContentQuizSlideId]);
        } else {
          this.notificationService.errorTopRight('No quiz is added to this course yet.')
        }
      }
  }

  GetSubCourse(){
    this.service.GetSubCourseDetail(this.subCourseId).subscribe((data: any) => {
      if (data) {
         this.SubCourseName=data.name;
         this.CourseName=data.curriculumMaster;
      }
    })  
  }
  navigateToAnotherComponent() {
    if (this.TextSlideData === null && !this.NoDataAvailable) {
      this.notificationService.errorTopRight(`Please wait until the page is fully loaded.`)
    } else {
      this.nextSlide();
    }
  }
  navigateBack() {
    if(+this.currentSlideIndex === 0) {
      const isPreview = JSON.parse(sessionStorage.getItem('isPreview'))
      if(isPreview) {
        this.router.navigate(['training-course-manager/training-course-manager-add-edit', this.subCourseId])
      } else {
        this.router.navigate(['/academy-curriculums'])
      }
    } else {
      this.previousSlide();
    }
  }
}
