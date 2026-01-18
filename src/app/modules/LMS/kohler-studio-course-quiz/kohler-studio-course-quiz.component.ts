import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { KohlerStudioService } from '../kohler-studio/kohler-studio.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from 'app/shared/notification/notification';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'app-kohler-studio-course-quiz',
  templateUrl: './kohler-studio-course-quiz.component.html',
  styleUrls: ['./kohler-studio-course-quiz.component.scss']
})
export class KohlerStudioCourseQuizComponent implements OnInit {
  questions: any[] = [];
  currentQuestionIndex: number = 0;
  ShowKohler: boolean = false;
  answers: any[] = [];
  loader = false;
  quiz1: FormGroup;
  buttonDisabled = false;
  courseId: string;
  lmsSubCourseQuizId: any;
  answer: any[] = [];
  isPreview = false;
  hasSelectedOption: boolean = false;
  courseLanguage: string = 'english'; // Add this property

  constructor(
    private _formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private service: KohlerStudioService,
    private router: Router,
    private _notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      console.log('this.courseId', params);
      this.courseId = params['courseContentQuizSlideId'];
      this.GetAllQuestionsfromQuiz();
    });
    
    this.quiz1 = this._formBuilder.group({
      truthValue: false,
      singleAnswer: ['']
    });
    
    this.route.queryParams.subscribe(queryParams => {
      console.log('Query params:', queryParams);
      this.isPreview = queryParams['preview'] === 'true';

      if (!this.isPreview) {
        const previewFlag = JSON.parse(sessionStorage.getItem('isPreview'));
        this.isPreview = !!previewFlag;
      }
      
      // If in preview mode, disable the form controls
      if (this.isPreview) {
        this.quiz1.get('singleAnswer')?.disable();
      }
    });

    this.route.params.subscribe(params => {
      console.log('Course ID params:', params);
      this.courseId = params['courseContentQuizSlideId'];
      this.GetAllQuestionsfromQuiz();
    });

    }
  

GetAllQuestionsfromQuiz() {
    this.loader = true;
    this.service.GetQuizDataByCourse(this.courseId).subscribe((data: any) => {
      this.loader = false;
      this.questions = data.questionWithOptions;
      
      // Set the course language from the response
      this.courseLanguage = data.courseQuizPassingConfig?.language || 'english';
      
      if (this.isPreview) {
        this.questions.forEach(element => {
          element.options.forEach(option => option.isCorrect);
          this.lmsSubCourseQuizId = element.id;
        });
      } else {
        this.questions.forEach(element => {
          element.options.forEach(option => option.isCorrect = false);
          this.lmsSubCourseQuizId = element.id;
        });
      }
    });
  }
translateTrueFalseOption(optionLabel: string, questionType: string): string {
    if (questionType !== 'trueFalse') {
      return optionLabel;
    }
    const lowerLabel = optionLabel.toLowerCase();
    
    switch (this.courseLanguage?.toLowerCase()) {
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



  onSelectionChange(event: any, id, option: any): void {
    const currentQuestion = this.questions[this.currentQuestionIndex];
    this.hasSelectedOption = false; // Reset selection status
    
    if (currentQuestion.questionType === 'single' || currentQuestion.questionType === 'trueFalse') {
      this.answer = [];
      currentQuestion.options.forEach((item) => {
        if (item.id === id) {
          item.isCorrect = event.checked;
        } else {
          item.isCorrect = false;
        }
        this.answer.push({
          isCorrect: item.isCorrect,
          lmsCourseQuizQuestionOptionId: item.id
        });
        // Update selection status
        if (item.isCorrect) {
          this.hasSelectedOption = true;
        }
      });
    } else {
      this.answer = [];
      currentQuestion.options.forEach((item) => {
        if (item.id === id) {
          item.isCorrect = event.checked;
        }
        this.answer.push({
          isCorrect: item.isCorrect,
          lmsCourseQuizQuestionOptionId: item.id
        });
        // Update selection status for multiple choice
        if (item.isCorrect) {
          this.hasSelectedOption = true;
        }
      });
    }
  }

  // New method for radio button selection
  onRadioSelectionChange(event: MatRadioChange) {
    const selectedOptionId = event.value;
    const currentQuestion = this.questions[this.currentQuestionIndex];
    
    // Reset the answer array
    this.answer = [];
    
    // Update options and build answer array
    currentQuestion.options.forEach((item) => {
      item.isCorrect = item.id === selectedOptionId;
      
      this.answer.push({
        isCorrect: item.isCorrect,
        lmsCourseQuizQuestionOptionId: item.id
      });
    });
    
    // Set hasSelectedOption to true since a radio button is selected
    this.hasSelectedOption = true;
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
    this.answer = [];
    
    const currentQuestion = this.questions[this.currentQuestionIndex];
    
    // Set the radio button value if it's a single or trueFalse question
    if (currentQuestion.questionType === 'single' || currentQuestion.questionType === 'trueFalse') {
      const selectedOption = currentQuestion.options.find(opt => opt.isCorrect);
      if (selectedOption) {
        this.quiz1.get('singleAnswer').setValue(selectedOption.id);
      } else {
        this.quiz1.get('singleAnswer').setValue('');
      }
    }
    
    currentQuestion.options.forEach((item) => {
      this.answer.push({
        isCorrect: item.isCorrect,
        lmsCourseQuizQuestionOptionId: item.id
      });
      if (item.isCorrect) {
        this.quiz1.controls['truthValue'].setValue(item.label);
      }
    });
    
    // Update hasSelectedOption based on current question's selections
    this.hasSelectedOption = currentQuestion.options.some(opt => opt.isCorrect);
  }

  nextQuestion() {
    if (this.isPreview) {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
        this.hasSelectedOption = false; // Reset selection status for new question
        
        const currentQuestion = this.questions[this.currentQuestionIndex];
        
        // Set the radio button value if it's a single or trueFalse question
        if (currentQuestion.questionType === 'single' || currentQuestion.questionType === 'trueFalse') {
          const selectedOption = currentQuestion.options.find(opt => opt.isCorrect);
          if (selectedOption) {
            this.quiz1.get('singleAnswer').setValue(selectedOption.id);
          } else {
            this.quiz1.get('singleAnswer').setValue('');
          }
        }
        
        currentQuestion.options.forEach((item) => {
          if (item.isCorrect) {
            this.quiz1.controls['truthValue'].setValue(item.label);
          }
        });
      }
    } else {
      if (this.answer.length === 0) {
        const filteredSelectedArray = this.questions[this.currentQuestionIndex].options.filter((item) => item.isCorrect);
        if (filteredSelectedArray && filteredSelectedArray.length > 0) {
          this.questions[this.currentQuestionIndex].options.forEach((item) => {
            this.answer.push({
              isCorrect: item.isCorrect,
              lmsCourseQuizQuestionOptionId: item.id
            });
            if (item.isCorrect) {
              this.quiz1.controls['truthValue'].setValue(item.label);
            }
          });
        } else {
          this._notificationService.errorTopRight('Please select an answer!');
        }
      }

      if (this.answer.length > 0) {
        this.storeAnswer();
        if (this.currentQuestionIndex < this.questions.length - 1) {
          this.currentQuestionIndex++;
          this.hasSelectedOption = false; // Reset selection status for new question
          this.quiz1.controls['truthValue'].setValue(null);
          this.quiz1.get('singleAnswer').setValue(''); // Reset radio selection
        }
      }
    }
  }

  storeAnswer() {
    const currentQuestion = this.questions[this.currentQuestionIndex];
    const questionIdx = this.answers.findIndex(obj => obj.lmsCourseQuizQuestionId === currentQuestion.id);
    const answerData = {
      userId: window.sessionStorage.getItem('userId'),
      lmsCourseQuizQuestionId: currentQuestion.id,
      lmsCourseId: this.courseId,
      options: currentQuestion.options.map(opt => ({
        isCorrect: opt.isCorrect,
        lmsCourseQuizQuestionOptionId: opt.id
      })),
      createdById: window.sessionStorage.getItem('email')
    };
    
    if (questionIdx > -1) {
      this.answers[questionIdx] = answerData;
    } else {
      this.answers.push(answerData);
    }
    
    this.answer = [];
  }

  submitQuiz() {
    if (this.isPreview) {
      // Navigate to result page with preview parameter
      this.router.navigate(['/kohler-studio-course-result', this.courseId], {
        queryParams: { preview: 'true' }
      });
    } else {
      // Rest of your existing code for non-preview mode
      if (this.answer.length === 0 && this.buttonDisabled === false) {
        const filteredSelectedArray = this.questions[this.currentQuestionIndex].options.filter((item) => item.isCorrect);
        console.log('filteredSelectedArray', filteredSelectedArray);
        if (filteredSelectedArray && filteredSelectedArray.length > 0) {
          this.questions[this.currentQuestionIndex].options.forEach((item) => {
            this.answer.push({
              isCorrect: item.isCorrect,
              lmsCourseQuizQuestionId: item.id
            });
            if (item.isCorrect) {
              this.quiz1.controls['truthValue'].setValue(item.label);
            }
          });
        } else {
          this._notificationService.errorTopRight('Please Select The Answer!');
        }
      }
      if (this.answer.length > 0 && this.buttonDisabled === false) {
        const questionIdx = this.answers.findIndex(obj => obj.lmsCourseQuizQuestionId === this.questions[this.currentQuestionIndex].id);
        this.buttonDisabled = true;
        if (questionIdx > -1) {
          this.answers[questionIdx] = {
            userId: window.sessionStorage.getItem('userId'),
            lmsCourseQuizQuestionId: this.questions[this.currentQuestionIndex].id,
            lmsCourseId: this.courseId,
            options: [...this.answer],
            createdById: window.sessionStorage.getItem('email')
          };
        } else {
          this.answers.push({
            userId: window.sessionStorage.getItem('userId'),
            lmsCourseQuizQuestionId: this.questions[this.currentQuestionIndex].id,
            lmsCourseId: this.courseId,
            options: [...this.answer],
            createdById: window.sessionStorage.getItem('email')
          });
        }
        
        console.log('check this answes', this.answers);
        
        this.service.SaveUserQuiz(this.answers).subscribe(data => {
          this.buttonDisabled = false;
          if (data.isSuccess) {
            this._notificationService.successTopRight(data.message);
            this.router.navigate(['/kohler-studio-course-result', this.courseId]);
          } else {
            this._notificationService.errorTopRight('Some Error');
          }
        });
      } else if (this.buttonDisabled) {
        this._notificationService.warningTopRight('Submission is in progess. Please wait!');
      } else {
        this._notificationService.errorTopRight('Please Select The Answer!');
      }
    }
  }
}

