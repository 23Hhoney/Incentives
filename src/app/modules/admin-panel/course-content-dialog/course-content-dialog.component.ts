import { Component, OnInit } from '@angular/core';
import { TrainingCoursesService } from '../training-courses/training-courses.service';
import { ActivatedRoute } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

@Component({
  selector: 'app-course-content-dialog',
  templateUrl: './course-content-dialog.component.html',
  styleUrls: ['./course-content-dialog.component.scss']
})

export class CourseContentDialogComponent implements OnInit {
  selectedLanguage: string = '';
  languages: string[] = [];
  courseSlideData: any[] = [];
  quizSlideData: any;
  courseCopyIdDuplicate: any;
  isLoading: boolean = false;
  error: string | null = null;
  courseLanguage: string = '';

  constructor(
    private route: ActivatedRoute,
    private service: TrainingCoursesService,
  ) {}

  ngOnInit(): void {
    this.courseCopyIdDuplicate = this.route.snapshot.paramMap.get('courseId');
    this.getAllLanguages();
        
    if (this.languages.length > 0) {
      this.selectedLanguage = this.languages[0];
      this.courseLanguage = this.selectedLanguage; // Set courseLanguage
      this.loadCourseContent();
    }
  }
  getAllLanguages(): void {
    this.languages = ['English', 'Spanish', 'French'];
  }

 onLanguageChange(event: { value: string }): void {
    if (!event.value) return;
    this.selectedLanguage = event.value;
    this.courseLanguage = event.value;
    this.loadCourseContent();
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


private loadCourseContent(): void {
    if (!this.selectedLanguage || !this.courseCopyIdDuplicate) return;
        
    this.isLoading = true;
    this.error = null;
        
    // Clear previous data while loading
    this.courseSlideData = [];
    this.quizSlideData = null;
    
    const quizData$ = this.service.GetLmsCourseQuizQuestionBy(
      this.courseCopyIdDuplicate, 
      this.selectedLanguage
    );
        
    const slideData$ = this.service.GetAllLmsSlideDataByLanguage(
      this.courseCopyIdDuplicate, 
      this.selectedLanguage
    );
    
    forkJoin({
      quiz: quizData$,
      slides: slideData$
    }).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (data) => {
        // Process quiz data with translation
        this.quizSlideData = {
          ...data.quiz.courseQuizPassingConfig,
          questions: this.processQuizQuestions(data.quiz.questionWithOptions),
          id: data.quiz.courseQuizPassingConfig?.id || data.quiz.id
        };
                
        // Handle slide data
        this.courseSlideData = data.slides;
                
        console.log('Course content loaded successfully');
      },
      error: (error) => {
        console.error('Error fetching course data:', error);
        this.error = 'Failed to load course content. Please try again.';
                
        // Reset data on error
        this.courseSlideData = [];
        this.quizSlideData = null;
      }
    });
  }

  // Add method to process quiz questions and apply translation
  private processQuizQuestions(questions: any[]): any[] {
    if (!questions) return [];
    
    return questions.map(question => ({
      ...question,
      options: question.options?.map((option: any) => ({
        ...option,
        label: this.translateTrueFalseOption(option.label, question.questionType)
      })) || []
    }));
  }

  // Alternative approach: Handle API calls separately with proper loading state
  private loadCourseContentSeparately(): void {
    if (!this.selectedLanguage || !this.courseCopyIdDuplicate) return;
    
    this.isLoading = true;
    this.error = null;
    
    // Clear previous data
    this.courseSlideData = [];
    this.quizSlideData = null;
    
    let completedCalls = 0;
    const totalCalls = 2;
    
    const checkLoadingComplete = () => {
      completedCalls++;
      if (completedCalls >= totalCalls) {
        this.isLoading = false;
      }
    };

    // Load quiz data
    this.service.GetLmsCourseQuizQuestionBy(this.courseCopyIdDuplicate, this.selectedLanguage)
      .subscribe({
        next: (data) => {
          this.quizSlideData = {
            ...data.courseQuizPassingConfig,
            questions: data.questionWithOptions,
            id: data.courseQuizPassingConfig?.id || data.id
          };
          checkLoadingComplete();
        },
        error: (error) => {
          console.error('Error fetching quiz data:', error);
          this.error = 'Failed to load quiz data.';
          checkLoadingComplete();
        }
      });

    // Load slide data
    this.service.GetAllLmsSlideDataByLanguage(this.courseCopyIdDuplicate, this.selectedLanguage)
      .subscribe({
        next: (data) => {
          this.courseSlideData = data;
          checkLoadingComplete();
        },
        error: (error) => {
          console.error('Error fetching slide data:', error);
          this.error = 'Failed to load slide data.';
          checkLoadingComplete();
        }
      });
  }

  // Helper method to organize slide items with proper numbering
  private stripHtmlTags(html: string): string {
    if (!html) return '';
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  getSlideItems(slide: any): any[] {
    const items: any[] = [];
    let imageCounter = 1;
    let textCounter = 1;
    let buttonCounter = 1;
    let audioCounter = 1;
    let videoCounter = 1;

    // Handle items from lmsSlideGroupViewDatas
    if (slide.lmsSlideGroupViewDatas) {
      // Sort groups by sequence to maintain order
      const sortedGroups = slide.lmsSlideGroupViewDatas.sort((a: any, b: any) =>
        (a.sequence || 0) - (b.sequence || 0)
      );

      sortedGroups.forEach((group: any) => {
        if (group.lmsSlideGroupFieldViews) {
          // Sort fields by sequence within each group
          const sortedFields = group.lmsSlideGroupFieldViews.sort((a: any, b: any) =>
            (a.sequence || 0) - (b.sequence || 0)
          );

          sortedFields.forEach((field: any) => {
            // Handle Images
            if (group.name === 'image' && field.lmsSlideContentFileViewData?.length > 0) {
              field.lmsSlideContentFileViewData.forEach((imageFile: any) => {
                items.push({
                  type: 'image',
                  label: `Image ${imageCounter}`,
                  url: imageFile.url,
                  fileName: imageFile.fileName,
                  description: this.stripHtmlTags(field.lmsSlideGroupFieldsValueViewData?.htmlEditorValue)
                });
                imageCounter++;
              });
            }

            // Handle Text - Strip HTML tags here
            if (group.name === 'text' && field.lmsSlideGroupFieldsValueViewData?.htmlEditorValue) {
              items.push({
                type: 'text',
                label: `Text ${textCounter}`,
                content: this.stripHtmlTags(field.lmsSlideGroupFieldsValueViewData.htmlEditorValue)
              });
              textCounter++;
            }

            // Handle Buttons - Strip HTML tags here
            if (group.name === 'button' && field.lmsSlideGroupFieldsValueViewData?.htmlEditorValue) {
              const hyperlink = this.getButtonHyperlink(field.defaultValue);
              items.push({
                type: 'button',
                label: `Button ${buttonCounter}`,
                content: this.stripHtmlTags(field.lmsSlideGroupFieldsValueViewData.htmlEditorValue),
                hyperlink: hyperlink
              });
              buttonCounter++;
            }

            // Handle Audio from lmsSlideContentFileViewData (if any)
            if (group.name === 'audio' && field.lmsSlideContentFileViewData?.length > 0) {
              field.lmsSlideContentFileViewData.forEach((audioFile: any) => {
                items.push({
                  type: 'audio',
                  label: `Audio ${audioCounter}`,
                  url: audioFile.url,
                  fileName: audioFile.fileName,
                  description: this.stripHtmlTags(field.lmsSlideGroupFieldsValueViewData?.htmlEditorValue)
                });
                audioCounter++;
              });
            }
          });
        }
      });
    }

    // Handle items from uploadLmsSlideFileModelData (Audio files, Videos, etc.)
    if (slide.uploadLmsSlideFileModelData && slide.uploadLmsSlideFileModelData.length > 0) {
      slide.uploadLmsSlideFileModelData.forEach((file: any) => {
        if (file.type === 'audio-content' || file.type === 'audio') {
          items.push({
            type: 'audio',
            label: `Audio`,
            url: file.url,
            fileName: file.fileName,
            description: null
          });
          audioCounter++;
        } else if (file.type === 'video') {
          // Handle two types of video responses
          let videoUrl = '';
          let displayName = '';
          let isExternalLink = false;

          if (file.content && !file.fileName) {
            // External link (YouTube, etc.)
            videoUrl = file.content;
            displayName = file.content;
            isExternalLink = true;
          } else if (file.fileName && file.url) {
            // Uploaded video file
            videoUrl = file.url;
            displayName = file.fileName;
            isExternalLink = false;
          }

          items.push({
            type: 'video',
            label: `Video ${videoCounter}`,
            url: videoUrl,
            fileName: displayName,
            isExternalLink: isExternalLink,
            description: null
          });
          videoCounter++;
        } else {
          // Handle other file types
          items.push({
            type: 'file',
            label: `File ${videoCounter}`,
            url: file.url || file.content,
            fileName: file.fileName || file.content,
            description: null
          });
        }
      });
    }

    return items;
  }

  // Helper method to extract hyperlink from button's defaultValue JSON
  getButtonHyperlink(defaultValue: string): string {
    try {
      if (defaultValue) {
        const parsed = JSON.parse(defaultValue);
        return parsed.hyperlink || '';
      }
    } catch (e) {
      console.warn('Error parsing button defaultValue:', e);
    }
    return '';
  }
}
