import { ChangeDetectorRef, Component } from '@angular/core';
import { KohlerStudioCourseResultService } from './kohler-studio-course-result.service';
import { ActivatedRoute, Router } from '@angular/router';
import { KohlerStudioService } from '../kohler-studio/kohler-studio.service';
import { NotificationService } from 'app/shared/notification/notification';
import { ModernService } from 'app/layout/layouts/horizontal/modern/modern.service';
import { SharedService } from 'app/shared/shared-service';
import { TrainingCourseManagerService } from 'app/modules/admin-panel/training-course-manager/training-course-manager.service';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import moment from 'moment';

@Component({
  selector: 'app-kohler-studio-course-result',
  templateUrl: './kohler-studio-course-result.component.html',
  styleUrls: ['./kohler-studio-course-result.component.scss']
})
export class KohlerStudioCourseResultComponent {
  notifications: any[] = [];
  showNoDataMessage = false;
  score: number = 0;
  questions: any[] = [];
  UserId: string;
  SubCourseId: any;
  courseId = '';
  status: string = '';
  totalRecords: number = 0;
  totalUnreadCount: number = 0;
  unreadCount = 0;
  totalPages: number = 0;
  message: any;
  userId:any;
  isPreview = false;
  scoreLoading = false;
  quizResponse: any[] = []; // API response data
  userAnswers: any[] = []; // Stores user-selected answers
  processedQuestions: any[] = []; // Questions with additional tags for UI
  apiRequest = {
    pageIndex: 1,
    itemCount: 10 // adjust itemCount if needed
  };
  courseCopyId: string = '';
  language: string = ''; 
  languageused: any;

  constructor(private QuizService: KohlerStudioService, private service: KohlerStudioCourseResultService,private router: Router, private route: ActivatedRoute, private notificationService: NotificationService, private trainingCourseService: TrainingCourseManagerService, private _service: ModernService, private _sharedService: SharedService
    , private notificationsService: NotificationsService, private _changeDetectorRef: ChangeDetectorRef,
  ) {}

 ngOnInit() {
    this.userId = window.sessionStorage.getItem('userId');
    
    this.route.params.subscribe(params => {
      this.SubCourseId = params['courseContentQuizSlideId'];
    });
    
    this.route.queryParams.subscribe(queryParams => {
      this.isPreview = queryParams['preview'] === 'true';
      
      if (!this.isPreview) {
        const previewFlag = JSON.parse(sessionStorage.getItem('isPreview'));
        this.isPreview = !!previewFlag;
      }
      
      if (this.isPreview) {
        this.GetPreviewResultfromQuiz();
      } else {
        this.UserId = window.sessionStorage.getItem('userId');
        this.getResultData();
      }
    });
    
    this._sharedService._notificationCount$.subscribe((resp) => {
      this.unreadCount = resp;
    });
    
    this.getNotificationList();
    
    if (!sessionStorage.getItem('pageReloaded')) {
      sessionStorage.setItem('pageReloaded', 'true');
      setTimeout(() => {
        // window.location.reload();
      }, 1000);
    }
  }
  
 translateTrueFalseOption(optionLabel: string, questionType: string): string {
    if (questionType !== 'trueFalse') {
      return optionLabel;
    }
    const lowerLabel = optionLabel.toLowerCase();
    
    switch (this.languageused?.toLowerCase()) {
      case 'spanish':
        if (lowerLabel === 'true' || lowerLabel === 'verdadero') {
          return 'Verdadero';
        } else if (lowerLabel === 'false' || lowerLabel === 'falso') {
          return 'Falso';
        }
        break;
        
      case 'french':
        if (lowerLabel === 'true' || lowerLabel === 'vrai') {
          return 'Vrai';
        } else if (lowerLabel === 'false' || lowerLabel === 'faux') {
          return 'Faux';
        }
        break;
        
      case 'english':
      default:
        if (lowerLabel === 'verdadero' || lowerLabel === 'vrai') {
          return 'True';
        } else if (lowerLabel === 'falso' || lowerLabel === 'faux') {
          return 'False';
        }
        return optionLabel;
    }
    
    return optionLabel;
  }

  getNotificationList() {
    this.notifications = [];
    this.apiRequest.pageIndex = 1;

    this.notificationsService.getNotificationList(this.userId, this.apiRequest).subscribe(data => {
      this.notifications = data.results.map((notification: any) => {
        if (notification?.createdDateTime) {
          notification.createdDateTime = moment.utc(notification.createdDateTime)
            .utcOffset('-04:00') // Set the desired timezone offset
            .format('MM/DD/YYYY h:mm A');
        }
        if (notification?.scheduledDateTime) {
          notification.scheduledDateTime = moment.utc(notification.scheduledDateTime)
            .utcOffset('-04:00') // Set the desired timezone offset
            .format('MM/DD/YYYY h:mm A');
        }
        return notification;
      });

      this.totalRecords = data.totalRecords;
      this.totalPages = Math.ceil(this.totalRecords / this.apiRequest.itemCount);
      this._changeDetectorRef.markForCheck();

      // Update the unread count using customRecordCount and store it in session storage
      this.totalUnreadCount = data.customRecordCount;
      sessionStorage.setItem('totalUnreadCount', this.totalUnreadCount.toString());
    });
  }
GetPreviewResultfromQuiz() {
    this.scoreLoading = true;
    this.QuizService.GetQuizDataByCourse(this.SubCourseId).subscribe({
      next: (data: any) => {
        // Set language from courseQuizPassingConfig
        this.languageused = data.courseQuizPassingConfig?.language || 'english';
        
        if (!data.courseQuizPassingConfig && !data.questionWithOptions) {
          this.showNoDataMessage = true;
        } else {
          this.message = data.courseQuizPassingConfig?.isPass
            ? data.courseQuizPassingConfig.successMsg
            : data.courseQuizPassingConfig.failMsg;
          
          this.score = 100;
          
          this.questions = data.questionWithOptions.map(question => ({
            ...question,
            question: question.label,
            obtainedMks: 1,
            questionType: question.questionType, 
            options: question.options.map(option => ({
              ...option,
              isSystemCorrect: option.isCorrect,
              isUserCorrect: option.isCorrect,
            })),
            label: undefined
          }));
        }
        this.scoreLoading = false;
      },
      error: () => {
        this.scoreLoading = false;
        this.showNoDataMessage = true;
      }
    });
  }
  

 closeResultPage() {
  if (this.isPreview) {
    this.router.navigate(['/incentive-admin-home']);
  } else {
    this.router.navigate(['/academy-curriculums'], {
      queryParams: { language: this.languageused }
    });
  }
}


 getResultData() {
    this.scoreLoading = true;
    this.service.GetQuizScore(this.UserId, this.SubCourseId).subscribe({
      next: (data: any) => {
        this.languageused = data.languageUsed;
        
        if (!data.courseId && !data.userQuizViewScores) {
          this.showNoDataMessage = true;
          this.scoreLoading = false;
          return;
        }
        
        this.status = data.status;
        this.courseCopyId = data.courseCopyId;
        this.language = data.languageUsed;
        
        if (data.status === 'Pass' && data.points > 0) {
          this.notificationService.successTopRight(`You got ${data.points} points for successfully passing this quiz.`);
        }
        
        if (data.status === 'Pass') {
          const payload = { userId: sessionStorage.getItem('userId') };
          this._service.getPointsAndSalesSummaryCalculation(payload).subscribe(data => {
            if (data) {
              this._sharedService.setTotalPoints(data.remaining_Points);
              this._sharedService.setIsPointLocked(data?.isPointsLocked);
              this.getNotificationList();
            }
          });
        }
        
        this.questions = data.userQuizViewScores;
        this.courseId = data.courseId;
        let correctAnswer = 0;
        const totalQuestions = this.questions.length;
        
        this.questions.forEach((items) => {
          if (+items.obtainedMks === 1) {
            correctAnswer += 1;
          }
        });
        
        this.score = Math.round((+correctAnswer / +totalQuestions) * 100);
        this.message = data.status === 'Pass' ? data.successMsg : data.failMsg;
        this.scoreLoading = false;
      },
      error: () => {
        this.showNoDataMessage = true;
        this.scoreLoading = false;
      }
    });
  }

  
  getOptionClass(question: any, option: any): string {
    if (question.obtainedMks === 0 && option.isUserCorrect) {
      return 'erroranswer';
    }
    if ((question.obtainedMks === 1 && option.isUserCorrect) || 
        (this.status === 'Pass' && question.obtainedMks === 0 && option.isSystemCorrect)) {
      return 'trueanswer';  
    }
    return 'option';
  }
  

  retakeQuiz() {
    if (this.status === 'Pass') {
      this.service.AllowReTakeQuiz(this.userId, this.courseCopyId).subscribe({
        next: (response: any) => {
          if (response.isSuccess) {
            this.router.navigate(['/kohler-studio-course-quiz', this.SubCourseId]);
          } else {
            this.notificationService.errorTopRight('You have already passed this quiz. Retake is not allowed.');
          }
        },
        error: () => {
          this.notificationService.errorTopRight('Unable to verify quiz retake eligibility');
        }
      });
    } else {
      // Direct retake for failed attempts
      this.router.navigate(['/kohler-studio-course-quiz', this.SubCourseId]);
    }
  }

  restartTraining() {
    const courseStatus = this.status === "Pass" ? "Completed" : "started";
      
    this.QuizService.UpdateAssignCourseStatus({
      "courseId": this.courseId,
      "status": courseStatus
    }).subscribe((resp) => {
      if(resp.isSuccess) {
        this.trainingCourseService.GetallslidesData(this.courseId, this.language).subscribe((slides: any) => {
          const sortedSlides = slides.sort((a: any, b: any) => a.indexNum - b.indexNum);
          const firstSlide = sortedSlides[0];
                  
          if (firstSlide) {
            // Pass the course status as a query parameter
            this.router.navigate(
              ["/kohler-studio-course", firstSlide.slideId, this.courseId, this.language],
              { queryParams: { courseStatus: this.status } }
            );
          } else {
            if (this.status === "Pass") {
              this.notificationService.errorTopRight('No content found for this course.');
            } else {
              // If user has failed, show quiz
              this.checkAndNavigateToQuiz(this.courseId);
            }
          }
        });
      } else {
        this.notificationService.errorTopRight('Something went wrong.');
      }
    });
  }
  
  
  checkAndNavigateToQuiz(courseId: string) {
    this.service.GetQuizDataByCourse(courseId).subscribe((quizData: any) => {
      if (quizData && quizData.questionWithOptions?.length > 0) {
        this.router.navigate(["/kohler-studio-course-quiz", courseId]);
      } else {
        this.notificationService.errorTopRight('No slides or quiz available for this course.');
      }
    });
  }
  
  
close() {
  // Pass the language as a query parameter when navigating back
  this.router.navigate(['../academy-curriculums', this.courseId], {
    queryParams: { language: this.languageused }
  });
}
}
