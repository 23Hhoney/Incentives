import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CdkDragDrop, CdkDragEnd, CdkDragMove, moveItemInArray } from '@angular/cdk/drag-drop';
import { TrainingCoursesService } from '../training-courses.service';
import { ActivatedRoute, Router } from '@angular/router';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { NotificationService } from 'app/shared/notification/notification';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { URLService } from 'app/modules/url-service/url.service';
import { SlideStateService } from '../slidestate.service';
interface QuizSettings {
  id?: string; // Add this line
  passingPercentage: number;
  successMessage: string;
  failMessage: string;
  isPass: boolean
}
interface QuizQuestion {
  id: string;
  question: string;
  questionDetails?: string;
  type: 'single' | 'multipleSingle' | 'multipleAll' | 'trueFalse';
  options: QuizOption[];
  correctAnswers: string[];
  order: number;
}
interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

@Component({
  selector: 'app-training-courses-editor',
  templateUrl: './training-courses-editor.component.html',
  styleUrls: ['./training-courses-editor.component.scss']
})
export class TrainingCoursesEditorComponent implements OnInit {
  isFullscreen = false;


  // Quiz-related properties
  @ViewChild('QuizManagerDialog') QuizManagerDialog: TemplateRef<any>;
  @ViewChild('QuestionsSavingDialog') QuestionsSavingDialog: TemplateRef<any>;
  selectedQuestion: QuizQuestion | null = null;
  editMode = false;
  quizSettingsForm: FormGroup;
  questionForm: FormGroup;
  quizConfigId: string;

  questions: QuizQuestion[] = [];
  quizManagerDialogRef: any;
  @ViewChild('confirmSingleOptionDialog') confirmSingleOptionDialog: TemplateRef<any>;
  singleOptionDialogRef: MatDialogRef<any>;
  pendingQuestionSave: boolean = false;
  sanitizedVideoUrl: SafeResourceUrl;
  dialogboxforquestion: any;
  elements: any[] = [];
  selectedSlide: any;
  slideType: string;

  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLDivElement>;

  desktopWidth: number = 1366;
  desktopHeight: number = 768;
  mobileWidth: number = 375;
  mobileHeight: number = 667;
  currentWidth: number = 0;
  currentHeight: number = 0;

  backendReferenceWidth: number = 1366;
  backendReferenceHeight: number = 768;
  hasSlides: boolean = false;

  quizSettings: QuizSettings = {
    passingPercentage: 80,
    successMessage: 'Congratulations! You passed the quiz.',
    failMessage: 'Please try again to achieve a passing score.',
    isPass: false
  };

  // Slides-related properties 
  containerWidth: number = 800; // Default desktop width
  // mobileWidth: number = 360;  // Default mobile width
  slides = [];
  newSlideName: string = '';
  isDesktopView = true;
  showQuizManager = false;
  isValidUrl = true;
  @ViewChild('videoSlideDialog') videoSlideDialog!: TemplateRef<any>;
  @ViewChild('contentSlideDialog') contentSlideDialog!: TemplateRef<any>;
  @ViewChild('contentAudioSlideDialog') contentAudioSlideDialog!: TemplateRef<any>;
  @ViewChild('videoInput') videoInput: ElementRef;
  slideCounter = 1;
  isEditing = false;
  isEditingSlideName: boolean = false;
  showImageContainer: boolean = false;
  courseName: string = '';
  courseLanguage: string = '';
  @ViewChild('hyperlinkTemplate') hyperlinkTemplate!: TemplateRef<any>; // Fix here
  // Video handling properties
  ACCEPTED_VIDEO_FORMATS = ['video/mp4', 'video/quicktime', 'video/x-ms-wmv', 'video/x-msvideo', 'video/x-flv'];
  MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
  uploadedVideoData: any;
  videoDialogRef!: MatDialogRef<any> | null;
  contentDialogRef!: MatDialogRef<any> | null;
  duplicatedImages: any[] = [];
  selectedSlideType: string = '';
  cropping = false;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  // Editor config
  public Editor = ClassicEditor;
  editorForm: FormGroup;
  hyperlinkValue: string = '';
  hyperlinkType: string = 'url'; // Default type
  // Editor configuration
  public editorConfig = {
    toolbar: [
      'redo', 'undo',
      'heading', 'bold', 'italic', 'strong',
      'blockQuote',
      'unlink'
      , 'bulletedList', 'numberedList',
    ]
  };

  // Slide types
  slideTypes = [
    { type: 'video', icon: 'videocam', label: 'Video' },
    { type: 'content', icon: 'article', label: 'Content' },
    { type: 'audio-content', icon: 'music_note', label: 'Audio + Content' }
  ];
  editorPositions: { x: number; y: number; }[] = [];
  buttonPositions: { x: number; y: number; }[] = [];
  imageContainerPositions: { x: number; y: number; }[] = [];
  videoPosition = { x: 0, y: 150 };
  imagePosition = { x: 0, y: 150 };
  /// Audio handling properties
  audioPosition = { x: 0, y: 150 };
  uploadedAudioData: any;
  CourseId: any;
  SlideId: any;
  selectedType: any;
  modalReferenceforSlideDelete: any;

  imageEditingOptions: boolean;
  videoUploadModal: MatDialogRef<any, any>;
  deletelement: number;
  contentAudioDialogRef: any;
  pendingElements: any[] = [];
  isContentModified: boolean = false;
  CourseIdNew: any;
  resizeHandle: string = '';
  //Image prompt
  @ViewChild('imageUploadDialog') imageUploadDialog: TemplateRef<any>;

  maxZIndex = 1;
  showCropper = false;
  currentCropImage: string | null = null;
  // selectedContainerId: number | null = null;
  // isResizing = false;
  // startPosition = { x: 0, y: 0 };
  // startDimensions = { width: 0, height: 0 };
  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>;
  modalReference: any;
  itemToDelete: { type: string; index: number } | null = null;
  pendingVideoFile: File | null = null;
  pendingAudioFile: File | null = null;
  pendingVideoUrl: string | null = null;
  existingSlideData: any = null;
  @ViewChild('confirmDeleteDialog') confirmDeleteDialog: TemplateRef<any>;
  dialogRef: MatDialogRef<any>;
  questionToDelete: any;
  @ViewChild('confirmDeleteOptionDialog') confirmDeleteOptionDialog: TemplateRef<any>;

  optionDialogRef: MatDialogRef<any>;
  optionToDelete: { questionId: string, optionId: string, index: number };
  selectedLanguage: any;
  buttonAction: any;
  hasSlideContent = false;
  @ViewChildren('optionInput') optionInputs!: QueryList<ElementRef>;
  @ViewChildren('vimeoPlayer') vimeoPlayers: QueryList<ElementRef>;
  preservedSlideId: string | null = null;
  showHelpOverlay = false;
  @ViewChild('helpContent') helpContent: ElementRef;
  modalReferenceforSlideConfirm: any;
  pendingRequest: any;
  pendingIsUpdate: boolean;
  pendingCurrentSlideId: any;
  exportReqId: any;
  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private service: TrainingCoursesService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private sanitizer: DomSanitizer,
    private urlService: URLService,
    private cdr: ChangeDetectorRef,
    private slideStateService: SlideStateService

  ) {
    this.initializeForms();
    this.editorForm = this.fb.group({
      editors: this.fb.array([])
    });
  }

  get editors(): FormArray {
    return this.editorForm.get('editors') as FormArray;
  }


  ngOnInit() {
    this.CourseId = this.route.snapshot.params['id'];
    this.CourseIdNew = this.route.snapshot.params['ids'];
    this.selectedLanguage = this.route.snapshot.params['lang'];
    this.buttonAction = this.route.snapshot.params['buttonAction'];

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['selectedSlideId']) {
      this.preservedSlideId = navigation.extras.state['selectedSlideId'];
    } else {
      this.preservedSlideId = this.slideStateService.getSelectedSlideId();

      if (!this.preservedSlideId) {
        this.preservedSlideId = localStorage.getItem('selectedSlideId');

        if (this.preservedSlideId) {
          localStorage.removeItem('selectedSlideId');
        }
      }
    }

    this.loadSlides(this.preservedSlideId);
    this.setMobileSize()
    console.log('test Course', this.courseName);
    console.log('test courseLangauge', this.courseLanguage);
  }

  ngAfterViewInit() {
    // Subscribe to changes in the vimeoPlayers QueryList
    this.vimeoPlayers?.changes.subscribe(players => {
      players.forEach((player: ElementRef) => {
        // Set up load event listener for each iframe
        if (player && player.nativeElement) {
          player.nativeElement.onload = () => {
            // Find the corresponding element and update its loading state
            const elementId = this.findElementIdForIframe(player.nativeElement);
            if (elementId) {
              const element = this.elements.find(e => e.id === elementId);
              if (element) {
                element.isLoading = false;
              }
            }
          };
        }
      });
    });
    this.checkScrollbar();

  }

  adjustElementsForMobileView() {
    if (!this.isDesktopView && this.elements && this.elements.length > 0) {
      // Sort elements by vertical position (top to bottom)
      const sortedElements = [...this.elements].sort((a, b) => {
        const aY = a.position?.yPercent || 0;
        const bY = b.position?.yPercent || 0;
        return aY - bY;
      });

      // Track the bottom boundary of each element
      let lastElementBottom = 0;

      // Process each element
      sortedElements.forEach(element => {
        if (element.type === 'text') {
          // Calculate the actual height based on content
          const textContainer = document.querySelector(`[data-element-id="${element.id}"]`);
          if (textContainer) {
            const actualHeight = textContainer.scrollHeight;
            const containerHeight = textContainer.clientHeight;

            // If text is overflowing
            if (actualHeight > containerHeight) {
              // Increase the height to fit content
              const additionalHeightNeeded = (actualHeight / containerHeight) * element.heightPercent;
              element.heightPercent = additionalHeightNeeded;

              // Update position of elements below this one
              const currentBottom = element.position.yPercent + element.heightPercent;
              if (currentBottom > lastElementBottom) {
                lastElementBottom = currentBottom;
              }
            }
          }
        } else {
          // For non-text elements, check if they need to be moved down
          if (element.position.yPercent < lastElementBottom) {
            // Add some spacing
            const spacing = 2; // 2% spacing
            element.position.yPercent = lastElementBottom + spacing;
          }

          // Update the last bottom boundary
          lastElementBottom = element.position.yPercent + element.heightPercent;
        }
      });

      // Force change detection
      this.cdr.detectChanges();
    }
  }
  setMobileSize() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    this.mobileWidth = screenWidth < 600 ? screenWidth - 32 : 400; // with padding
    this.mobileHeight = screenHeight * 0.7;
  }

  getReferenceWidth(): number {
    return this.isDesktopView ? this.desktopWidth : this.mobileWidth;
  }

  getReferenceHeight(): number {
    return this.isDesktopView ? this.desktopHeight : this.mobileHeight;
  }


  toggleEditMode() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.isContentModified = true;
    } else {
      this.isContentModified = false;
    }
  }
  exitEditMode() {
    this.isEditing = false;

  }

  // Slides //
  onSlideTypeSelect(type: string, dialogRef: any) {
    dialogRef.close(type);
  }
  loadSlides(preserveSelectedSlideId?: string) {
    this.service.getSlidesFromCourseId(this.CourseIdNew).subscribe({
      next: (response) => {
        this.courseName = response.courseName;
        this.courseLanguage = response.language;
        if (response && response.lmsSlidesModelViews && response.lmsSlidesModelViews.length > 0) {
          this.hasSlides = true;
          this.slides = response.lmsSlidesModelViews.map((slide, index) => ({
            ...slide,
            type: slide.type,
            order: index,
            content: null
          }));


          // Handle slide selection
          if (this.slides.length > 0) {
            if (preserveSelectedSlideId) {
              // Try to find and select the previously selected slide
              const previouslySelectedSlide = this.slides.find(slide => slide.id === preserveSelectedSlideId);
              if (previouslySelectedSlide) {
                this.selectedSlide = previouslySelectedSlide;
                this.newSlideName = this.selectedSlide.name;
                this.onSlideSelect(this.selectedSlide);
              } else {
                // If not found, select the first slide
                this.selectedSlide = this.slides[0];
                this.newSlideName = this.selectedSlide.name;
                this.onSlideSelect(this.selectedSlide);
              }
            } else {
              // Default behavior - select first slide
              this.selectedSlide = this.slides[0];
              this.newSlideName = this.selectedSlide.name;
              this.onSlideSelect(this.selectedSlide);
            }
          }
        } else {
          this.hasSlides = false;
        }
      },
      error: (err) => {
        console.error('Error loading slides:', err);
      }
    });
  }

  addNewSlide(newSlideModal: TemplateRef<any>) {
    const dialogRef = this.dialog.open(newSlideModal, {
      width: '400px',
      disableClose: false
    });
  
    dialogRef.afterClosed().subscribe(type => {
      if (type) {
        const newSlide = {
          id: null,
          name: `Slide ${this.slides.length + 1}`,
          type: type,
          content: null,
          order: this.slides.length
        };
  
        const request = {
          id: null,
          lmsCourseId: this.CourseIdNew,
          name: newSlide.name,
          type: newSlide.type,
          indexNum: newSlide.order
        };
  
        // Directly execute save without confirmation dialog
        this.executeSaveSlide(true, request, false, null);
      }
    });
  }

  saveSlide() {
    if (!this.selectedSlide) return;
  
    const isUpdate = this.selectedSlide.id !== null;
    const currentSlideId = this.selectedSlide.id;
  
    const request = {
      id: this.selectedSlide.id ?? null,
      lmsCourseId: this.CourseIdNew,
      name: this.newSlideName,
      type: this.selectedSlide.type,
      indexNum: this.selectedSlide.order
    };
  
    // Directly execute save without confirmation dialog
    this.executeSaveSlide(false, request, isUpdate, currentSlideId);
  }
  

  toggleEditSlideName() {
    this.isEditingSlideName = !this.isEditingSlideName;
    
    if (this.isEditingSlideName) {
      this.newSlideName = this.selectedSlide.name;
      setTimeout(() => {
        const inputElement = document.getElementById('slideNameInput');
        if (inputElement) {
          inputElement.focus();
        }
      }, 100);
    } else {
      this.saveSlide();
    }
  }

  openDeleteDialog(slide: any, event: Event, deletebox: TemplateRef<any>) {
    event.stopPropagation();
    this.deletelement = slide.id;
    this.modalReferenceforSlideDelete = this.dialog.open(deletebox, {
      width: '400px'
    });
  }
  DeleteSlide() {
    this.service.DeleteSlides({}, this.deletelement).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          const index = this.slides.findIndex(s => s.id === this.deletelement);
          if (index > -1) {
            this.slides.splice(index, 1); // Remove the slide

            // Update slide order
            this.updateSlideOrder();
            this.slideCounter = this.slides.length + 1;

            // Select a new slide
            if (this.slides.length > 0) {
              // If the deleted slide was not the last one, select the next slide
              if (index < this.slides.length) {
                this.selectedSlide = this.slides[index];
              } else {
                // If the deleted slide was the last one, select the previous slide
                this.selectedSlide = this.slides[this.slides.length - 1];
              }
              this.newSlideName = this.selectedSlide.name;
              this.onSlideSelect(this.selectedSlide);
            } else {
              // If no slides remain, clear the selected slide
              this.selectedSlide = null;
              this.newSlideName = '';
            }

            this.notificationService.successTopRight('Slide deleted successfully');
          }
        } else {
          this.notificationService.errorTopRight(response.message);
        }
      },
      error: (error) => {
        this.notificationService.errorTopRight('Error deleting slide');
      }
    });
  }

  updateSlideOrder() {
    this.slides = this.slides.map((slide, index) => ({
      ...slide,
      order: index
    }));
  }
  reArrangeSlides(event) {
    moveItemInArray(this.slides, event.previousIndex, event.currentIndex);
    this.updateSlideOrder();

    // Prepare the reorder request with a single slide's id and indexNum
    const reorderRequest = {
      id: this.slides[event.currentIndex].id, // ID of the reordered slide
      indexNum: event.currentIndex // New index after reorder
    };
    const reorderBulkRequest = [];
    if (this.slides != null && this.slides) {
      this.slides.forEach(data => {
        reorderBulkRequest.push({
          id: data.id,
          indexNum: event.currentIndex
        });
      });
    }
    this.service.reorderBulkSlides(reorderBulkRequest).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.notificationService.successTopRight('Slide order updated');
          this.loadSlides();
        } else {
          this.notificationService.errorTopRight('Some Error');
        }
      },
      error: () => {
        this.notificationService.errorTopRight('Error updating slide order');
      }
    });

  }
  openConfirmDialogs(request: any, isUpdate: boolean, currentSlideId: any, confirmBox: TemplateRef<any>) {
    this.modalReferenceforSlideConfirm = this.dialog.open(confirmBox, {
      width: '400px'
    });

    this.pendingRequest = request;
    this.pendingIsUpdate = isUpdate;
    this.pendingCurrentSlideId = currentSlideId;
  }

  executeSaveSlide(isEdit: boolean, request?: any, isUpdate?: boolean, currentSlideId?: any) {
    // Use provided parameters or fall back to pending values
    const saveRequest = request || this.pendingRequest;
    const saveIsUpdate = isUpdate !== undefined ? isUpdate : this.pendingIsUpdate;
    const saveCurrentSlideId = currentSlideId !== undefined ? currentSlideId : this.pendingCurrentSlideId;
  
    this.service.SaveOrUpdateSlides(saveRequest, isEdit).subscribe({
      next: (response) => {
        this.exportReqId=response.exportReqId;
        sessionStorage.setItem('exportReqId', this.exportReqId);
        if (response.isSuccess) {
          if (saveIsUpdate) {
            // Existing slide update logic
            const updatedSlideIndex = this.slides.findIndex(slide => slide.id === this.selectedSlide.id);
            if (updatedSlideIndex !== -1) {
              this.slides[updatedSlideIndex] = { ...this.selectedSlide, name: this.newSlideName };
              this.selectedSlide = this.slides[updatedSlideIndex];
            }
            this.notificationService.successTopRight('Slide updated successfully');
            this.loadSlides(saveCurrentSlideId);
          } else {
            // New slide creation - redirect to editor
            const newSlideId = response.id || response.data?.id;
            
            if (newSlideId) {
              // Create the new slide object with the returned ID
              const newSlide = {
                id: newSlideId,
                name: saveRequest.name,
                type: saveRequest.type,
                order: saveRequest.indexNum,
                content: null
              };
              
              // Add to slides array
              this.slides.push(newSlide);
              this.selectedSlide = newSlide;
              this.newSlideName = newSlide.name;
              this.selectedSlideType = newSlide.type;
              
              this.notificationService.successTopRight('New slide added successfully');
              
              // Set the selected slide ID in the service
              this.slideStateService.setSelectedSlideId(newSlideId);
              
              // Navigate directly to the editor for the new slide
              this.navigateToEditor(newSlideId, newSlide.type, false); // false because it's new content
            } else {
              this.notificationService.errorTopRight('Error: No slide ID returned');
            }
          }
        } else {
          this.notificationService.errorTopRight(response.message);
        }
      },
      error: (error) => {
        this.notificationService.errorTopRight('Error saving slide');
      }
    });
  }
  
  
  
  
  private navigateToEditor(slideId: string, slideType: string, isEdit: boolean) {
    this.router.navigate(['/lms-editor/' + slideId + '/' +
      slideType + '/' + this.CourseIdNew + '/' +
      this.selectedLanguage + '/' + this.CourseId + '/' +
      this.buttonAction + '/' + isEdit.toString()], {
      state: { selectedSlideId: slideId }
    });
  }

  toggleView(isDesktop: boolean) {
    this.isDesktopView = isDesktop;

    // Re-sort elements for the new view mode
    if (this.elements && this.elements.length > 0) {
      this.elements = this.sortElementsForMobileView(this.elements);
    }

    this.loadSlideData();
  }
  private sortElementsForMobileView(elements: any[]): any[] {
    if (this.isDesktopView) {
      return elements; // Keep original order for desktop
    }

    // For mobile view, sort by vertical position first, then horizontal
    return elements.sort((a, b) => {
      const yDiff = Math.abs(a.yPercent - b.yPercent);

      // If elements are on roughly the same horizontal line (within 5% difference)
      if (yDiff < 5) {
        return a.xPercent - b.xPercent; // Sort left to right
      }

      return a.yPercent - b.yPercent; // Sort top to bottom
    });
  }

  previewSlide() {
    if (!this.selectedSlide) {
      return;
    }

    if (!this.hasSlideContent) {
      this.notificationService.errorTopRight('Please add content to the slide before previewing.');
      return;
    }

    const urlArray = [];
    const url = "kohler-studio-course/" + this.selectedSlide.id;
    urlArray.push(url);
    const updatedUrl = urlArray.join('/');
    window.open(updatedUrl, '_blank');
    sessionStorage.removeItem('isPreview');
  }



  onSlideSelect(slide) {
    this.editors.clear();
    this.buttonPositions = [];
    this.editorPositions = [];
    this.pendingElements = [];
    this.videoPosition = { x: 0, y: 0 };
    this.audioPosition = { x: 0, y: 0 };
    this.selectedSlide = slide;
    this.newSlideName = slide.name;
    this.selectedSlideType = slide.type;
    this.showImageContainer = false;
    this.sanitizedVideoUrl = null;
    this.slideType = slide.type;

    this.hasSlideContent = false;
    this.hasSlideContent = false;

    this.loadSlideData();
    this.slideStateService.setSelectedSlideId(slide.id);

  }


  checkSlideContent(data?: any) {
    // First check if elements exist in the current component state
    if (this.elements && this.elements.length > 0) {
      this.hasSlideContent = true;
      console.log('Slide has content: elements array has items');
      return true;
    }

    if (!data) {
      this.hasSlideContent = false;
      console.log('Slide has no content: no data provided');
      return false;
    }

    // Check for video slide type specifically
    if (this.selectedSlide && this.selectedSlide.type === 'video') {
      if (data.uploadLmsSlideFileModelData && data.uploadLmsSlideFileModelData.length > 0) {
        const hasVideoContent = data.uploadLmsSlideFileModelData.some(file => {
          const hasValidUrl = file.url &&
            file.url.trim() !== '' &&
            file.url !== 'http://172.191.225.236:8080/Admin/LmsSlides/videoPath/' &&
            file.fileType === 'video';

          const hasValidContent = file.content && file.content.trim() !== '';

          return hasValidUrl || hasValidContent;
        });

        this.hasSlideContent = hasVideoContent;
        console.log('Video slide has content:', hasVideoContent);
        return hasVideoContent;
      }
    }

    // Check for group data (for other slide types)
    let hasGroupData = false;
    if (data.lmsSlideGroupViewDatas && data.lmsSlideGroupViewDatas.length > 0) {
      hasGroupData = data.lmsSlideGroupViewDatas.some(group => {
        return group.lmsSlideGroupFieldViews &&
          group.lmsSlideGroupFieldViews.some(field => {
            if (field.lmsSlideGroupFieldsValueViewData?.htmlEditorValue) {
              return true;
            }
            if (field.lmsSlideContentFileViewData && field.lmsSlideContentFileViewData.length > 0) {
              return true;
            }
            return false;
          });
      });
    }

    // Check for file data (for other slide types)
    let hasFileData = false;
    if (data.uploadLmsSlideFileModelData && data.uploadLmsSlideFileModelData.length > 0) {
      hasFileData = data.uploadLmsSlideFileModelData.some(file => {
        return (file.content && file.content.trim() !== '') ||
          (file.url && file.url.trim() !== '' &&
            file.url !== 'http://172.191.225.236:8080/Admin/LmsSlides/videoPath/');
      });
    }

    this.hasSlideContent = hasGroupData || hasFileData;
    // setTimeout(() => {
    //   this.adjustAllTextPositions();
    // }, 500);
    return this.hasSlideContent;
  }

  onReady(editor: any) {
    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );
  }
  openSlideDialog() {
    if (this.selectedSlide) {
    }
  }
  handleSave() {

    this.isContentModified = false;
    this.isEditing = false;
  }
  backToCourse() {
    const isEdit = this.route.snapshot.params['isEdit'] || 'false';

    this.router.navigate(['/training-courses/training-courses-edit-add/' +
      this.CourseId + '/' +
      this.selectedLanguage + '/' +
      this.CourseIdNew + '/' +
      'for_edit']);
  }
  RouteToLmsEditor() {
    if (!this.selectedSlide) {
      this.notificationService.errorTopRight('No slide selected');
      return;
    }
    
    const isEdit = this.hasSlideContent; // true for 'Edit Slide', false for 'Add Content'
    this.slideStateService.setSelectedSlideId(this.selectedSlide.id);
    this.navigateToEditor(this.selectedSlide.id, this.selectedSlideType, isEdit);
  }
  loadSlideData() {
    this.elements = [];
    this.hasSlideContent = false;
    if (!this.selectedSlide) {
      return;
    }
    switch (this.slideType) {
      case 'content':
        this.getSlideDataForContent();
        break;
      case 'audio-content':
        this.getAudioData();
        break;
      case 'video':
        this.getSlideData();
        break;
      default:
        console.warn('Unknown slide type:', this.slideType);
        this.checkSlideContent();
    }
  }
  findElementIdForIframe(iframe: HTMLIFrameElement): string | null {
    // This is a simplified approach - you may need to adjust based on your DOM structure
    const videoElements = this.elements.filter(e => e.type === 'video' && e.isYoutubeOrVimeo);
    for (const element of videoElements) {
      if (element.sanitizedVideoUrl && iframe.src.includes(this.extractVideoId(element.content))) {
        return element.id;
      }
    }
    return null;
  }

  extractVideoId(url: string): string {
    if (!url) return '';

    if (url.includes('vimeo.com')) {
      return this.urlService.extractVimeoVideoId(url);
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return this.urlService.extractYouTubeVideoId(url);
    }

    return '';
  }
  getSlideData() {
    this.service.GetAllLmsSlideGroupFieldsandData(this.selectedSlide.id).subscribe({
      next: (data) => {
        this.checkSlideContent(data);
        const tempElements: any[] = [];

        // Create a combined array of all elements with their sequence/position info
        const allElementsData: any[] = [];

        // Collect images with their group sequence
        if (data.lmsSlideGroupViewDatas) {
          data.lmsSlideGroupViewDatas.forEach((group) => {
            if (group.name === 'image') {
              group.lmsSlideGroupFieldViews.forEach((field) => {
                if (field.lmsSlideContentFileViewData && field.lmsSlideContentFileViewData.length > 0) {
                  const imageData = field.lmsSlideContentFileViewData[0];
                  const position = JSON.parse(imageData.position || '{}');
                  const content = JSON.parse(imageData.content || '{}');

                  allElementsData.push({
                    type: 'image',
                    groupSequence: group.sequence,
                    yPercent: position.yPercent || 0,
                    xPercent: position.xPercent || 0,
                    data: {
                      id: imageData.id,
                      type: 'image',
                      xPercent: position.xPercent || 0,
                      yPercent: position.yPercent || 0,
                      widthPercent: content.dimensions?.widthPercent || 40,
                      heightPercent: content.dimensions?.heightPercent || 30,
                      content: imageData.url,
                      zIndex: content.zIndex || 1
                    }
                  });
                }
              });
            } else if (group.name === 'text') {
              group.lmsSlideGroupFieldViews.forEach((field) => {
                const defaultValueData = JSON.parse(field.defaultValue || '{}');
                const position = defaultValueData.position || { xPercent: 0, yPercent: 0 };
                const style = defaultValueData.style || {};

                allElementsData.push({
                  type: 'text',
                  groupSequence: group.sequence,
                  yPercent: position.yPercent || 0,
                  xPercent: position.xPercent || 0,
                  data: {
                    id: group.id,
                    type: 'text',
                    xPercent: position.xPercent || 0,
                    yPercent: position.yPercent || 0,
                    widthPercent: defaultValueData.widthPercent || 20,
                    heightPercent: defaultValueData.heightPercent || 10,
                    content: field.lmsSlideGroupFieldsValueViewData?.htmlEditorValue || '',
                    style: style
                  }
                });
              });
            } else if (group.name === 'button') {
              group.lmsSlideGroupFieldViews.forEach((field) => {
                const defaultValueData = JSON.parse(field.defaultValue || '{}');
                const position = defaultValueData.position || { xPercent: 0, yPercent: 0 };
                const style = defaultValueData.style || {};

                allElementsData.push({
                  type: 'button',
                  groupSequence: group.sequence,
                  yPercent: position.yPercent || 0,
                  xPercent: position.xPercent || 0,
                  data: {
                    id: group.id,
                    type: 'button',
                    xPercent: position.xPercent || 0,
                    yPercent: position.yPercent || 0,
                    widthPercent: defaultValueData.widthPercent || 15,
                    heightPercent: defaultValueData.heightPercent || 5,
                    content: field.lmsSlideGroupFieldsValueViewData?.htmlEditorValue || 'Click Here',
                    style: style
                  }
                });
              });
            }
          });
        }

        // Handle video elements
        if (data.uploadLmsSlideFileModelData && data.uploadLmsSlideFileModelData.length > 0) {
          const videoData = data.uploadLmsSlideFileModelData.find(x => x.type === 'video');
          if (videoData) {
            const position = JSON.parse(videoData.position || '{}');
            let videoUrl = '';
            let sanitizedVideoUrl = null;
            let isYoutubeOrVimeo = false;

            if (videoData.content) {
              videoUrl = videoData.content;
              if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                const videoId = this.urlService.extractYouTubeVideoId(videoUrl);
                sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
                isYoutubeOrVimeo = true;
              }
              else if (videoUrl.includes('vimeo.com')) {
                const videoId = this.urlService.extractVimeoVideoId(videoUrl);
                console.log('Extracted Vimeo ID:', videoId, 'from URL:', videoUrl);
                if (videoUrl.includes('/')) {
                  const parts = videoUrl.split('/');
                  const hash = parts[parts.length - 1];
                  if (videoId && hash && hash !== videoId) {
                    sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
                      `https://player.vimeo.com/video/${videoId}?h=${hash}&autoplay=0&title=0&byline=0&portrait=0`
                    );
                  } else {
                    sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
                      `https://player.vimeo.com/video/${videoId}?autoplay=0&title=0&byline=0&portrait=0`
                    );
                  }
                } else {
                  sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
                    `https://player.vimeo.com/video/${videoId}?autoplay=0&title=0&byline=0&portrait=0`
                  );
                }
                isYoutubeOrVimeo = true;
              }
            } else if (videoData.url) {
              videoUrl = videoData.url;
              sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl);
            }

            allElementsData.push({
              type: 'video',
              groupSequence: 0,
              yPercent: position.yPercent || 0,
              xPercent: position.xPercent || 0,
              data: {
                id: videoData.id,
                type: 'video',
                xPercent: position.xPercent || 0,
                yPercent: position.yPercent || 0,
                widthPercent: position.widthPercent || 40,
                heightPercent: position.heightPercent || 30,
                content: videoUrl,
                localVideoUrl: videoData.url || null,
                sanitizedVideoUrl: sanitizedVideoUrl,
                isYoutubeOrVimeo: isYoutubeOrVimeo,
                requireUserToWatch: videoData.isRequired,
                isLoading: true,
                hasError: false
              }
            });
          }
        }

        // Sort elements by yPercent (top to bottom), then by xPercent (left to right)
        // This ensures proper ordering for mobile view
        allElementsData.sort((a, b) => {
          if (Math.abs(a.yPercent - b.yPercent) < 5) { // If elements are roughly on the same horizontal line
            return a.xPercent - b.xPercent; // Sort by x position (left to right)
          }
          return a.yPercent - b.yPercent; // Sort by y position (top to bottom)
        });

        // Extract the sorted data
        this.elements = allElementsData.map(item => item.data);

        if (this.elements.length > 0) {
          this.hasSlideContent = true;
        }
      },
      error: (error) => {
        console.error('Error fetching slide data:', error);
        this.hasSlideContent = false;
      }
    });
  }


  adjustAllTextPositions(): void {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight;

    const step = 1;
    const maxTries = 200;

    this.elements.forEach((textElement, textIndex) => {
      if (textElement.type !== 'text') return;

      const textDiv = document.getElementById(`element-${textIndex}`);
      if (!textDiv) return;

      const textLeftPx = (textElement.xPercent / 100) * canvasWidth;
      const textTopPx = (textElement.yPercent / 100) * canvasHeight;
      const textWidthPx = textDiv.offsetWidth;
      const textHeightPx = textDiv.offsetHeight;

      this.elements.forEach((otherElement, otherIndex) => {
        if (otherIndex === textIndex) return;

        let newLeft = otherElement.xPercent;
        let newTop = otherElement.yPercent;

        const otherWidthPx = (otherElement.widthPercent / 100) * canvasWidth;
        const otherHeightPx = (otherElement.heightPercent / 100) * canvasHeight;

        let tries = 0;
        let isOverlapping = true;

        while (isOverlapping && tries++ < maxTries) {
          const otherLeftPx = (newLeft / 100) * canvasWidth;
          const otherTopPx = (newTop / 100) * canvasHeight;

          const overlapHorizontally =
            otherLeftPx < textLeftPx + textWidthPx &&
            otherLeftPx + otherWidthPx > textLeftPx;

          const overlapVertically =
            otherTopPx < textTopPx + textHeightPx &&
            otherTopPx + otherHeightPx > textTopPx;

          const isOverlap = overlapHorizontally && overlapVertically;

          if (!isOverlap) break;

          if (overlapVertically && !overlapHorizontally) {
            newTop += step;
          } else if (overlapHorizontally && !overlapVertically) {
            newLeft += step;
          } else {
            newTop += step;
            newLeft += step;
          }
        }

        otherElement.xPercent = newLeft;
        otherElement.yPercent = newTop;
      });
    });
  }

  extractVimeoVideoId(url: string): string {
    if (!url) return '';

    try {
      // Clean the URL first
      url = url.trim();

      // Special case for private Vimeo links with format: vimeo.com/ID/HASH
      const privateRegex = /vimeo\.com\/(\d+)\/([a-zA-Z0-9]+)/;
      const privateMatch = url.match(privateRegex);
      if (privateMatch && privateMatch[1]) {
        return privateMatch[1];
      }

      // Handle various Vimeo URL formats
      const patterns = [
        /vimeo\.com\/(\d+)/, // Standard URLs
        /player\.vimeo\.com\/video\/(\d+)/, // Player URLs
        /vimeo\.com\/channels\/[a-zA-Z0-9]+\/(\d+)/, // Channel URLs
        /vimeo\.com\/groups\/[a-zA-Z0-9]+\/videos\/(\d+)/, // Group URLs
        /vimeo\.com\/album\/[a-zA-Z0-9]+\/video\/(\d+)/, // Album URLs
        /vimeo\.com\/showcase\/[a-zA-Z0-9]+\/video\/(\d+)/ // Showcase URLs
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }

      // If URL contains query parameters, try to extract ID from them
      if (url.includes('?')) {
        const params = new URLSearchParams(url.split('?')[1]);
        const idParam = params.get('id') || params.get('video_id');
        if (idParam) return idParam;
      }

      console.warn('Could not extract Vimeo ID from URL:', url);
      return '';
    } catch (error) {
      console.error('Error extracting Vimeo ID:', error);
      return '';
    }
  }
  onVideoLoaded(element: any) {
    console.log('Video loaded successfully:', element);
    element.isLoading = false;
    element.hasError = false;
  }

  onVideoError(element: any) {
    console.log('Error loading video:', element);
    element.isLoading = false;
    element.hasError = true;
  }
  getFontSize(element: any): number { return element.style?.fontSize || 14; }

  getSafeHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  isPositionOverlapping(position: { x: number, y: number }, existingPositions: Array<{ x: number, y: number }>): boolean {
    return existingPositions.some(pos =>
      Math.abs(pos.x - position.x) < 50 && Math.abs(pos.y - position.y) < 50
    );
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  getAudioData() {
    this.service.GetAllLmsSlideGroupFieldsandData(this.selectedSlide.id).subscribe({
      next: (data) => {
        this.checkSlideContent(data);
        const allElements: any[] = [];

        if (data) {
          // Separate arrays for different element types
          const images: any[] = [];
          const texts: any[] = [];
          const buttons: any[] = [];
          const audios: any[] = [];

          // First collect all elements by type (keeping your existing logic)
          if (data.lmsSlideGroupViewDatas?.length) {
            data.lmsSlideGroupViewDatas.forEach((group) => {
              if (group.name === 'image') {
                group.lmsSlideGroupFieldViews.forEach((field) => {
                  if (field.lmsSlideContentFileViewData?.length) {
                    field.lmsSlideContentFileViewData.forEach((contentFile) => {
                      try {
                        const contentData = JSON.parse(contentFile.content || '{}');
                        const contentPosition = contentData.position || { xPercent: 0, yPercent: 0 };

                        const widthPercent = contentData.dimensions?.widthPercent !== undefined
                          ? parseFloat(contentData.dimensions.widthPercent)
                          : 30;

                        const heightPercent = contentData.dimensions?.heightPercent !== undefined
                          ? parseFloat(contentData.dimensions.heightPercent)
                          : 20;

                        images.push({
                          id: contentFile.id || `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                          type: 'image',
                          xPercent: contentPosition.xPercent || 0,
                          yPercent: contentPosition.yPercent || 0,
                          widthPercent: widthPercent,
                          heightPercent: heightPercent,
                          content: contentFile.url || '',
                          zIndex: contentData.zIndex || 1,
                          groupSequence: group.sequence,
                          fieldSequence: field.sequence
                        });
                      } catch (e) {
                        console.error('Error parsing image data:', e, contentFile);
                      }
                    });
                  }
                });
              }
              else if (group.name === 'textBox' || group.name === 'text') {
                group.lmsSlideGroupFieldViews.forEach((field) => {
                  try {
                    const savedData = JSON.parse(field.defaultValue || '{}');
                    const position = savedData.position || { xPercent: 0, yPercent: 0 };
                    const widthPercent = parseFloat(savedData.widthPercent) || 20;
                    const heightPercent = parseFloat(savedData.heightPercent) || 10;
                    const style = savedData.style || {
                      bold: false,
                      italic: false,
                      underline: false,
                      fontSize: 14,
                      color: '#000000',
                      backgroundColor: 'transparent',
                      textAlign: 'left'
                    };

                    texts.push({
                      id: group.id,
                      type: 'text',
                      xPercent: position.xPercent || 0,
                      yPercent: position.yPercent || 0,
                      widthPercent: widthPercent,
                      heightPercent: heightPercent,
                      content: field.lmsSlideGroupFieldsValueViewData?.htmlEditorValue || '',
                      style: style,
                      zIndex: 5,
                      groupSequence: group.sequence,
                      fieldSequence: field.sequence
                    });
                  } catch (e) {
                    console.error('Error parsing text data:', e);
                  }
                });
              }
              else if (group.name === 'button') {
                group.lmsSlideGroupFieldViews.forEach((field) => {
                  try {
                    const defaultValueData = JSON.parse(field.defaultValue || '{}');
                    const position = defaultValueData.position || { xPercent: 0, yPercent: 0 };
                    const widthPercent = parseFloat(defaultValueData.widthPercent) || 15;
                    const heightPercent = parseFloat(defaultValueData.heightPercent) || 5;
                    const style = defaultValueData.style || {
                      backgroundColor: '#05202E',
                      color: '#FFFFFF',
                      bold: false,
                      italic: false,
                      underline: false
                    };

                    buttons.push({
                      id: group.id,
                      type: 'button',
                      xPercent: position.xPercent || 0,
                      yPercent: position.yPercent || 0,
                      widthPercent: widthPercent,
                      heightPercent: heightPercent,
                      content: field.lmsSlideGroupFieldsValueViewData?.htmlEditorValue || defaultValueData.text || 'Click Here',
                      style: style,
                      zIndex: 10,
                      groupSequence: group.sequence,
                      fieldSequence: field.sequence
                    });
                  } catch (e) {
                    console.error('Error parsing button data:', e);
                  }
                });
              }
            });
          }

          // Process audio
          const audioData = data.uploadLmsSlideFileModelData?.find(x => x.type === 'audio-content');
          if (audioData) {
            try {
              const position = audioData.position ? JSON.parse(audioData.position) : { xPercent: 0, yPercent: 0 };

              audios.push({
                id: audioData.id || `audio-${Date.now()}`,
                type: 'audio',
                xPercent: position.xPercent || 0,
                yPercent: position.yPercent || 0,
                widthPercent: position.widthPercent || 40,
                heightPercent: position.heightPercent || 10,
                content: audioData.fileName ? audioData.url : audioData.content,
                requireUserToListen: audioData.isRequired,
                zIndex: 8,
                groupSequence: 999,
                fieldSequence: 1
              });
            } catch (e) {
              console.error('Error parsing audio data:', e, audioData);
            }
          }

          // For mobile view, sort by Y position like getSlideDataForContent (no pairing)
          if (!this.isDesktopView) {
            // Combine all elements and sort by Y position
            const allMobileElements = [...images, ...texts, ...buttons, ...audios];
            allMobileElements.sort((a, b) => {
              // Sort by Y position first
              if (Math.abs(a.yPercent - b.yPercent) > 2) {
                return a.yPercent - b.yPercent;
              }
              // If Y positions are very close, sort by X position
              return a.xPercent - b.xPercent;
            });

            allElements.push(...allMobileElements);
          }
          else {
            // Desktop view - sort all elements by position
            const allDesktopElements = [...images, ...texts, ...buttons, ...audios];
            allDesktopElements.sort((a, b) => {
              if (Math.abs(a.yPercent - b.yPercent) < 5) {
                return a.xPercent - b.xPercent;
              }
              return a.yPercent - b.yPercent;
            });
            allElements.push(...allDesktopElements);
          }
        }

        this.elements = allElements;
        this.hasSlideContent = allElements.length > 0;

        console.log('Final element order:', this.elements.map(el => ({
          type: el.type,
          id: el.id,
          yPercent: el.yPercent,
          xPercent: el.xPercent,
          content: el.type === 'text' ? el.content.substring(0, 30) + '...' : el.content
        })));
      },
      error: (error) => {
        console.error('Error fetching audio slide data:', error);
        this.hasSlideContent = false;
      }
    });
  }

  getSlideDataForContent() {
    this.service.GetAllLmsSlideGroupFieldsandData(this.selectedSlide.id).subscribe({
      next: (data) => {
        this.checkSlideContent(data);
        const allElements: any[] = [];

        if (data.lmsSlideGroupViewDatas) {
          // Separate arrays for different element types
          const images: any[] = [];
          const texts: any[] = [];
          const buttons: any[] = [];

          // First collect all elements by type
          data.lmsSlideGroupViewDatas.forEach((group) => {
            if (group.name === 'image') {
              group.lmsSlideGroupFieldViews.forEach((field) => {
                if (field.lmsSlideContentFileViewData?.length) {
                  field.lmsSlideContentFileViewData.forEach((fileData) => {
                    try {
                      const content = JSON.parse(fileData.content || '{}');
                      const position = content.position || { xPercent: 0, yPercent: 0 };

                      images.push({
                        id: fileData.id,
                        type: 'image',
                        xPercent: position.xPercent,
                        yPercent: position.yPercent,
                        widthPercent: content.dimensions?.widthPercent || 30,
                        heightPercent: content.dimensions?.heightPercent || 20,
                        content: fileData.url,
                        zIndex: content.zIndex || 1,
                        groupSequence: group.sequence,
                        fieldSequence: field.sequence
                      });
                    } catch (e) {
                      console.error('Error parsing image data:', e);
                    }
                  });
                }
              });
            }
            else if (group.name === 'text' || group.name === 'textBox') {
              group.lmsSlideGroupFieldViews.forEach((field) => {
                try {
                  const defaultValue = JSON.parse(field.defaultValue || '{}');
                  const position = defaultValue.position || { xPercent: 0, yPercent: 0 };

                  texts.push({
                    id: group.id,
                    type: 'text',
                    xPercent: position.xPercent,
                    yPercent: position.yPercent,
                    widthPercent: defaultValue.widthPercent || 20,
                    heightPercent: defaultValue.heightPercent || 10,
                    content: field.lmsSlideGroupFieldsValueViewData?.htmlEditorValue || '',
                    style: defaultValue.style || {
                      fontSize: 14,
                      color: '#000000',
                      textAlign: 'left'
                    },
                    zIndex: 5,
                    groupSequence: group.sequence,
                    fieldSequence: field.sequence
                  });
                } catch (e) {
                  console.error('Error parsing text data:', e);
                }
              });
            }
            else if (group.name === 'button') {
              group.lmsSlideGroupFieldViews.forEach((field) => {
                try {
                  const defaultValueData = JSON.parse(field.defaultValue || '{}');
                  const position = defaultValueData.position || { xPercent: 0, yPercent: 0 };
                  const widthPercent = parseFloat(defaultValueData.widthPercent) || 15;
                  const heightPercent = parseFloat(defaultValueData.heightPercent) || 5;
                  const style = defaultValueData.style || {
                    backgroundColor: '#05202E',
                    color: '#FFFFFF',
                    bold: false,
                    italic: false,
                    underline: false
                  };

                  buttons.push({
                    id: group.id,
                    type: 'button',
                    xPercent: position.xPercent || 0,
                    yPercent: position.yPercent || 0,
                    widthPercent: widthPercent,
                    heightPercent: heightPercent,
                    content: field.lmsSlideGroupFieldsValueViewData?.htmlEditorValue || defaultValueData.text || 'Click Here',
                    style: style,
                    zIndex: 10,
                    groupSequence: group.sequence,
                    fieldSequence: field.sequence
                  });
                } catch (e) {
                  console.error('Error parsing button data:', e);
                }
              });
            }
          });

          // For mobile view, create pairs of image + text + button
          // For mobile view, create pairs based on sequence order
          if (!this.isDesktopView) {
            const pairedElements = [];

            // Sort all elements by their group sequence and position
            images.sort((a, b) => a.groupSequence - b.groupSequence || a.yPercent - b.yPercent);
            texts.sort((a, b) => a.groupSequence - b.groupSequence || a.yPercent - b.yPercent);
            buttons.sort((a, b) => a.groupSequence - b.groupSequence || a.yPercent - b.yPercent);

            // Detect layout pattern based on element positions and counts
            const layoutPattern = this.detectMobileLayoutPattern(images, texts, buttons);

            switch (layoutPattern) {
              case 'text-image-button-pairs':
                // Case 1: Multiple sets of text-image-button
                this.createTextImageButtonPairs(images, texts, buttons, pairedElements);
                break;

              case 'text-above-below-image':
                // Case 2: Text above and below image
                this.createTextAroundImageLayout(images, texts, buttons, pairedElements);
                break;

              case 'text-button-pairs':
                // Original case: Text-button pairs
                this.createTextButtonPairs(texts, buttons, pairedElements);
                break;

              default:
                // Fallback: Sequential order by position
                this.createSequentialLayout(images, texts, buttons, pairedElements);
            }

            allElements.push(...pairedElements);
          }



          else {
            // Desktop view - sort all elements by position
            const allDesktopElements = [...images, ...texts, ...buttons];
            allDesktopElements.sort((a, b) => {
              if (Math.abs(a.yPercent - b.yPercent) < 5) {
                return a.xPercent - b.xPercent;
              }
              return a.yPercent - b.yPercent;
            });
            allElements.push(...allDesktopElements);
          }
        }

        this.elements = allElements;
        this.hasSlideContent = allElements.length > 0;

        console.log('Final element order:', this.elements.map(el => ({
          type: el.type,
          id: el.id,
          xPercent: el.xPercent,
          content: el.type === 'text' ? el.content.substring(0, 30) + '...' : el.content
        })));
      },
      error: (error) => {
        console.error('Error fetching slide content:', error);
        this.hasSlideContent = false;
      }
    });
  }

  detectMobileLayoutPattern(images: any[], texts: any[], buttons: any[]): string {
    // Case 1: Equal or similar counts of text, image, button (text-image-button pattern)
    if (images.length > 0 && texts.length > 0 && buttons.length > 0 &&
      Math.abs(images.length - texts.length) <= 1 &&
      Math.abs(images.length - buttons.length) <= 1) {
      return 'text-image-button-pairs';
    }

    // Case 2: Multiple texts with single/few images (text around image pattern)
    if (images.length > 0 && texts.length > images.length && buttons.length === 0) {
      // Check if texts are positioned above and below images
      const hasTextsAboveAndBelow = this.checkTextsAroundImages(images, texts);
      if (hasTextsAboveAndBelow) {
        return 'text-above-below-image';
      }
    }

    // Case 3: Text-button pairs (original case)
    if (texts.length > 0 && buttons.length > 0 && images.length === 0) {
      return 'text-button-pairs';
    }

    return 'sequential';
  }

  checkTextsAroundImages(images: any[], texts: any[]): boolean {
    if (images.length === 0 || texts.length < 2) return false;

    // Get the average Y position of images
    const avgImageY = images.reduce((sum, img) => sum + img.yPercent, 0) / images.length;

    // Check if we have texts both above and below the average image position
    const textsAbove = texts.filter(text => text.yPercent < avgImageY);
    const textsBelow = texts.filter(text => text.yPercent > avgImageY);

    return textsAbove.length > 0 && textsBelow.length > 0;
  }

  createTextImageButtonPairs(images: any[], texts: any[], buttons: any[], pairedElements: any[]): void {
    const maxElements = Math.max(images.length, texts.length, buttons.length);

    for (let i = 0; i < maxElements; i++) {
      // Group elements that belong together based on position proximity
      const currentGroup = [];

      if (texts[i]) currentGroup.push({ element: texts[i], type: 'text' });
      if (images[i]) currentGroup.push({ element: images[i], type: 'image' });
      if (buttons[i]) currentGroup.push({ element: buttons[i], type: 'button' });

      // Sort group by Y position to maintain visual order
      currentGroup.sort((a, b) => a.element.yPercent - b.element.yPercent);

      // Add elements in the sorted order
      currentGroup.forEach(item => pairedElements.push(item.element));
    }
  }

  createTextAroundImageLayout(images: any[], texts: any[], buttons: any[], pairedElements: any[]): void {
    // Get the main image (usually the first or most central one)
    const mainImage = images[0];

    // Separate texts above and below the image
    const textsAbove = texts.filter(text => text.yPercent < mainImage.yPercent)
      .sort((a, b) => a.yPercent - b.yPercent);
    const textsBelow = texts.filter(text => text.yPercent > mainImage.yPercent)
      .sort((a, b) => a.yPercent - b.yPercent);

    // Add elements in mobile-friendly order
    textsAbove.forEach(text => pairedElements.push(text));
    images.forEach(image => pairedElements.push(image));
    textsBelow.forEach(text => pairedElements.push(text));

    // Add any buttons at the end
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
    // Combine all elements and sort by Y position, then X position
    const allElements = [...images, ...texts, ...buttons];
    allElements.sort((a, b) => {
      if (Math.abs(a.yPercent - b.yPercent) < 5) {
        return a.xPercent - b.xPercent;
      }
      return a.yPercent - b.yPercent;
    });

    pairedElements.push(...allElements);
  }




  getAudioElementStyle(element: any): any {
    if (this.isDesktopView) {
      return {
        width: '100%',
        height: '100%'
      };
    } else {
      return {
        width: '100%',
        height: 'auto',
        minHeight: '50px',
        marginTop: '10px',
        marginBottom: '10px'
      };
    }
  }




  generateImageHtml(container: any): string {
    if (!container || !container.imageUrl) {
      return '';
    }

    return `<div style="position: absolute; left: ${container.position?.x || 0}px; top: ${container.position?.y || 0}px; z-index: ${container.zIndex || 1}; width: ${container.dimensions?.width || 300}px; height: ${container.dimensions?.height || 200}px;">
        <img src="${container.imageUrl}" style="width: 100%; height: 100%; object-fit: contain;" alt="Image ${container.id || 'default'}">
      </div>`;
  }
  extractStyleContent(htmlContent: string): string {
    if (!htmlContent) {
      return '';
    }

    const styleMatch = htmlContent.match(/style="([^"]*)"/) || [];
    return styleMatch[1] || '';
  }



  openConfirmDialog(type: string, index?: number) {
    this.itemToDelete = { type, index };
    this.modalReference = this.dialog.open(this.confirmDialog, { width: '400px' });
  }



  // Quiz Manager //
  initializeForms() {

    this.quizSettingsForm = this.fb.group({
      passingPercentage: [this.quizSettings.passingPercentage],
      successMessage: [this.quizSettings.successMessage],
      failMessage: [this.quizSettings.failMessage]
    });

    this.questionForm = this.fb.group({
      question: [''],
      type: ['single'],
      optionText: [''],  // Add this line
      options: this.fb.array([])
    });
  }

  get optionsArray() {
    return this.questionForm.get('options') as FormArray;
  }
GetQuizData() {
  this.service.GetQuizDataByCourseId(this.CourseIdNew).subscribe(data => {
    // Map quiz settings
    this.quizConfigId = data.courseQuizPassingConfig.id;
    this.quizSettings = {
      passingPercentage: data.courseQuizPassingConfig.passingMarks,
      successMessage: data.courseQuizPassingConfig.successMsg,
      failMessage: data.courseQuizPassingConfig.failMsg,
      isPass: data.courseQuizPassingConfig.isPass
    };

    // Update quiz settings form
    this.quizSettingsForm.patchValue({
      passingPercentage: data.courseQuizPassingConfig.passingMarks,
      successMessage: data.courseQuizPassingConfig.successMsg,
      failMessage: data.courseQuizPassingConfig.failMsg
    });

    if (data.courseQuizPassingConfig.isPass) {
      this.quizSettingsForm.get('passingPercentage').disable();
    } else {
      this.quizSettingsForm.get('passingPercentage').enable();
    }

    // Map questions and options
    if (data.questionWithOptions?.length > 0) {
      this.questions = data.questionWithOptions.map(q => ({
        id: q.id,
        question: q.label,
        type: q.questionType,
        order: q.index,
        languageQuizQuestionId: q.languageQuizQuestionId,
        options: q.options.map(opt => ({
          id: opt.id,
          text: this.translateTrueFalseOption(opt.label, q.questionType),
          isCorrect: opt.isCorrect
        }))
      }));
    } else {
      this.questions = [];
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



  toggleQuizManager() {
    this.quizManagerDialogRef = this.dialog.open(this.QuizManagerDialog, {
      width: '1500px',
      height: '90vh',
      disableClose: true,
      data: {
        questions: this.questions,
        quizSettings: this.quizSettings
      }
    });
    this.GetQuizData();
  }
  addOption() {
    const questionType = this.questionForm.get('type').value;

    if (questionType === 'trueFalse') {
      this.notificationService.errorTopRight('Cannot add custom options for True/False type.');
      return;
    }

    const option = this.fb.group({
      text: [''],
      isCorrect: [false],
      fromBackend: [false]
    });

    this.optionsArray.push(option);
  }

  removeOption(index: number) {
    const option = this.optionsArray.at(index).value;
    const questionId = this.editMode ? this.selectedQuestion.id : null;
    const optionId = this.editMode ? this.selectedQuestion.options[index].id : null;

    this.optionToDelete = {
      questionId: questionId,
      optionId: optionId,
      index: index
    };

    // Always show confirmation dialog
    this.optionDialogRef = this.dialog.open(this.confirmDeleteOptionDialog, {
      width: '400px',
      disableClose: true
    });
  }
  confirmDeleteOption() {
    if (this.optionToDelete) {
      if (this.questionForm.get('type').value === 'trueFalse') {
        this.notificationService.errorTopRight('Cannot delete options for True/False type.');
        this.optionDialogRef.close();
        return;
      }

      // Check if this is an existing option (has IDs)
      if (this.optionToDelete.questionId && this.optionToDelete.optionId) {
        const json = {
          questionId: this.optionToDelete.questionId,
          optionId: this.optionToDelete.optionId
        };

        this.service.Deleteoption(json).subscribe({
          next: (data) => {
            if (data.isSuccess) {
              this.notificationService.successTopRight('Option deleted successfully');
              this.optionsArray.removeAt(this.optionToDelete.index);
            } else {
              this.notificationService.errorTopRight('Failed to delete option');
            }
          },
          error: (error) => {
            this.notificationService.errorTopRight('Error deleting option');
          }
        });
      } else {
        // For new options, just remove from form array
        this.optionsArray.removeAt(this.optionToDelete.index);
        this.notificationService.successTopRight('Option removed successfully');
      }

      this.optionDialogRef.close();
    }
  }


  async pasteOptions() {
    try {
      if (window.isSecureContext && navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        this.processClipboardText(text);
      } else {
        throw new Error("Clipboard access requires a secure context (HTTPS).");
      }
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        console.error('Clipboard read permission denied. Please check your browser settings.');
      } else {
        console.error('An error occurred while accessing the clipboard:', error.message || error);
      }
    }
  }
  adjustTextPositions(elements: any[]) {
    elements.sort((a, b) => a.sequence - b.sequence);

    for (let i = 1; i < elements.length; i++) {
      if (elements[i].type === 'text') {
        const previousElement = elements[i - 1];
        if (previousElement.type === 'text') {
          elements[i].position.yPercent =
            previousElement.position.yPercent + previousElement.heightPercent + 2; // Adding a gap of 2%
        }
      }
    }
  }



  private processClipboardText(text: string) {
    if (!text) return;

    const options = text.split('\n').filter(line => line.trim());
    options.forEach(option => {
      this.optionsArray.push(this.fb.group({
        text: [option.trim(), Validators.required],
        isCorrect: [false],
        fromBackend: [false]  // Add this line
      }));
    });
  }

  onOptionCorrectChange(index: number) {
    // Don't allow changes if isPass is true and in edit mode
    if (this.editMode && this.quizSettings.isPass) {
      this.notificationService.errorTopRight('Cannot modify correct answers when quiz is already passed.');
      // Reset the checkbox to its previous state
      const currentOption = this.optionsArray.at(index);
      const originalValue = this.selectedQuestion.options[index]?.isCorrect || false;
      currentOption.get('isCorrect').setValue(originalValue, { emitEvent: false });
      return;
    }

    const questionType = this.questionForm.get('type').value;
    const options = this.optionsArray.controls;

    if (questionType === 'single' || questionType === 'trueFalse') {
      // For single answer types, uncheck all other options when one is selected
      options.forEach((option, i) => {
        if (i !== index) {
          option.get('isCorrect').setValue(false, { emitEvent: false });
        }
      });
    }
  }

  isOptionCheckboxDisabled(index: number): boolean {
    if (this.editMode && this.quizSettings.isPass) {
      return true;
    }

    return false;
  }

  addOptions(event?: KeyboardEvent) {
    if (event) {
      event.preventDefault();
    }
    const questionType = this.questionForm.get('type')?.value;
    if (questionType === 'trueFalse') {
      this.notificationService.errorTopRight('Cannot add custom options for True/False type.');
      return;
    }
    const option = this.fb.group({
      text: [''],
      isCorrect: [false],
      fromBackend: [false]  // Mark as not from backend
    });
    this.optionsArray.push(option);
    // Move focus to the newly created input field
    setTimeout(() => {
      const inputElements = this.optionInputs.toArray();
      if (inputElements.length) {
        inputElements[inputElements.length - 1].nativeElement.focus();
      }
    }, 0);
  }


onQuestionTypeChange() {
  if (this.editMode && this.quizSettings.isPass) {
    this.notificationService.errorTopRight('Cannot modify question type when quiz is already passed.');
    this.questionForm.get('type').setValue(this.selectedQuestion.type);
    return;
  }

  const questionType = this.questionForm.get('type').value;
  this.optionsArray.clear();
  
  if (questionType === 'trueFalse') {
    const { trueText, falseText } = this.getTrueFalseText();
    
    this.optionsArray.push(this.fb.group({
      text: [trueText, Validators.required],
      isCorrect: [false],
      readonly: [true],
      fromBackend: [false]
    }));
    this.optionsArray.push(this.fb.group({
      text: [falseText, Validators.required],
      isCorrect: [false],
      readonly: [true],
      fromBackend: [false]
    }));
  } else {
    this.addOption();
  }
}

private getTrueFalseText(): { trueText: string, falseText: string } {
  switch (this.courseLanguage?.toLowerCase()) {
    case 'spanish':
    case 'es':
      return { trueText: 'Verdadero', falseText: 'Falso' };
    case 'french':
    case 'fr':
      return { trueText: 'Vrai', falseText: 'Faux' };
    case 'english':
    case 'en':
    default:
      return { trueText: 'True', falseText: 'False' };
  }
}


  addQuestion() {
    this.service.CheckQuetionsForQuiz(this.CourseIdNew, {}).subscribe(data => {
      if (data.isSuccess) {
        this.notificationService.errorTopRight('You have already added questions for this quiz.');
        return;
      }
      else {
        const newQuestion: QuizQuestion = {
          id: '',
          question: this.questionForm.get('question').value,
          type: this.questionForm.get('type').value,
          options: this.optionsArray.value.map(opt => ({
            id: '',
            text: opt.text,
            isCorrect: opt.isCorrect
          })),
          correctAnswers: this.getCorrectAnswers(),
          order: this.questions.length
        };
        this.questions.push(newQuestion);
        this.resetQuestionForm();
      }
    });
  }

  private getCorrectAnswers(): string[] {
    return this.optionsArray.controls
      .map((control, index) => ({ index, control }))
      .filter(item => item.control.get('isCorrect').value)
      .map(item => item.index.toString());
  }
  openQuestionDialog(question?: QuizQuestion) {
    this.editMode = !!question;
    this.resetQuestionForm();

    if (question) {
      this.selectedQuestion = question;

      // Set question data
      this.questionForm.patchValue({
        question: question.question,
        type: question.type,
        questionDetails: question.questionDetails || ''
      });

      // Check isPass status for edit restrictions
      if (this.quizSettings.isPass) {
        // Disable type control and correct answer changes when isPass is true
        this.questionForm.get('type').disable();
      } else {
        // Enable type control when isPass is false
        this.questionForm.get('type').enable();
      }

      // Add existing options
      question.options.forEach(option => {
        const optionGroup = this.fb.group({
          text: [option.text],
          isCorrect: [{
            value: option.isCorrect,
            disabled: this.quizSettings.isPass // Disable if isPass is true
          }],
          readonly: [question.type === 'trueFalse'],
          fromBackend: [true]
        });
        this.optionsArray.push(optionGroup);
      });
    } else {
      // Enable type control for new questions
      this.questionForm.get('type').enable();
    }

    this.dialogboxforquestion = this.dialog.open(this.QuestionsSavingDialog, {
      width: '900px',
      disableClose: true
    });
  }

  toggleAccordion() {
    this.showHelpOverlay = !this.showHelpOverlay;

    if (this.showHelpOverlay) {
      setTimeout(() => {
        this.checkScrollbar();
      }, 100);
    }
  }

  checkScrollbar() {
    if (this.showHelpOverlay && this.helpContent) {
      const element = this.helpContent.nativeElement;
      element.style.overflowY = 'scroll';
      element.style.maxHeight = '60vh';
    }
  }

  closeDialog() {
    alert('Dialog closed. You can implement your own logic here!');
  }


  saveChanges() {
    const marks = this.quizSettingsForm.get('passingPercentage').value;
    const successMsg = this.quizSettingsForm.get('successMessage').value;
    const failMsg = this.quizSettingsForm.get('failMessage').value;
    const questions = this.questions;
    if (marks === null || marks < 0 || marks > 100) {
      this.notificationService.errorTopRight('Please enter a passing percentage between 0 and 100');
      return;
    }
    if (!successMsg || successMsg.trim() === '') {
      this.notificationService.errorTopRight('Please enter a valid success message');
      return;
    }
    if (!failMsg || failMsg.trim() === '') {
      this.notificationService.errorTopRight('Please enter a valid failure message');
      return;
    }

    const apiData = {
      lmsCourseQuizPassingConfig: {
        id: this.quizConfigId,
        passingMarks: marks,
        noOfQuestion: questions.length,
        successMsg: successMsg,
        failMsg: failMsg
      },
      lmsCourseQuizQuestionView: questions.map((question, index) => ({
        id: question.id || '00000000-0000-0000-0000-000000000000',
        indexNum: index,
        question: question.question,
        questionType: question.type,
        courseId: this.CourseIdNew,
        lmsCourseQuizOptionViews: question.options.map(option => ({
          id: option.id || '00000000-0000-0000-0000-000000000000',
          option: option.text,
          isCorrect: option.isCorrect
        }))
      }))
    };

    this.service.saveQuizData(apiData).subscribe(response => {
      if (response.isSuccess) {
        this.notificationService.successTopRight('Quiz Saved or updated successfully.');
        this.GetQuizData();
      } else if (response.message === 'already used!') {
        this.notificationService.errorTopRight('Quiz modification is restricted. Users have already started or completed this quiz.');
      }
    });
  }
  resetQuestionForm() {
    this.questionForm.reset({
      question: '',
      questionDetails: '',
      type: 'single'
    });

    // Enable the type control
    this.questionForm.get('type').enable();

    while (this.optionsArray.length) {
      this.optionsArray.removeAt(0);
    }
  }

  editQuestion(question: QuizQuestion) {
    this.questionForm.patchValue({
      question: question.question,
      type: question.type
    });

    while (this.optionsArray.length) {
      this.optionsArray.removeAt(0);
    }

    question.options.forEach(option => {
      this.optionsArray.push(this.fb.group({
        text: [option.text, Validators.required],
        isCorrect: [option.isCorrect]
      }));
    });
  }
  saveQuestion() {
    if (!this.questionForm.get('question').value || this.questionForm.get('question').value.trim() === '') {
      this.notificationService.errorTopRight('Please add a question.');
      return;
    }

    if (!this.questionForm.get('type').value) {
      this.notificationService.errorTopRight('Please select the answer type');
      return;
    }

    if (this.questionForm.get('type').value !== 'trueFalse' && this.optionsArray.length === 0) {
      this.notificationService.errorTopRight('Please add at least one option');
      return;
    }

    const hasEmptyOptions = this.optionsArray.controls.some(control =>
      !control.get('text').value || control.get('text').value.trim() === ''
    );
    if (hasEmptyOptions) {
      this.notificationService.errorTopRight('Please fill in all option texts');
      return;
    }

    const hasCorrectOption = this.optionsArray.controls.some(control => control.get('isCorrect').value === true);
    if (!hasCorrectOption && !this.editMode) {
      this.notificationService.errorTopRight('Please select at least one correct answer');
      return;
    }

    // Check for "Multiple Answers: Single Selection" with only one option selected
    const questionType = this.questionForm.get('type').value;
    if (questionType === 'multipleSingle') {
      const correctOptionsCount = this.optionsArray.controls.filter(control =>
        control.get('isCorrect').value === true
      ).length;

      if (correctOptionsCount === 1) {
        // Show confirmation dialog
        this.pendingQuestionSave = true;
        this.singleOptionDialogRef = this.dialog.open(this.confirmSingleOptionDialog, {
          width: '400px',
          disableClose: true
        });
        return; // Don't proceed with save yet
      }
    }

    // Proceed with normal save
    this.proceedWithQuestionSave();
  }
  proceedWithQuestionSave() {
    if (this.questionForm.valid) {
      const formValue = this.questionForm.value;

      let options;

      if (this.editMode) {
        // Handle edit mode - map existing options
        options = this.selectedQuestion.options.map((originalOption, index) => {
          // Check if the option exists in the form array
          const formOption = this.optionsArray.at(index);
          if (formOption) {
            return {
              id: originalOption.id || null,
              text: formOption.get('text').value,
              isCorrect: this.quizSettings.isPass ?
                originalOption.isCorrect : // Keep original if isPass is true
                formOption.get('isCorrect').value
            };
          } else {
            // Fallback for missing form options
            return {
              id: originalOption.id || null,
              text: originalOption.text,
              isCorrect: originalOption.isCorrect
            };
          }
        });
      } else {
        // Handle new question mode
        options = this.optionsArray.controls.map(control => ({
          id: null,
          text: control.get('text').value,
          isCorrect: control.get('isCorrect').value
        }));
      }

      const newQuestion: QuizQuestion = {
        id: this.editMode ? this.selectedQuestion.id : null,
        question: formValue.question,
        questionDetails: formValue.questionDetails,
        type: this.editMode ? this.selectedQuestion.type : formValue.type,
        options: options,
        correctAnswers: this.editMode ?
          this.selectedQuestion.correctAnswers :
          this.getCorrectAnswers(),
        order: this.editMode ? this.selectedQuestion.order : this.questions.length
      };

      if (this.editMode) {
        const index = this.questions.findIndex(q => q.id === this.selectedQuestion.id);
        if (index !== -1) {
          this.questions[index] = newQuestion;
        }
      } else {
        this.questions.push(newQuestion);
      }

      this.dialogboxforquestion.close();
      this.pendingQuestionSave = false;
    }
  }
  confirmSingleOption() {
    this.singleOptionDialogRef.close();
    this.proceedWithQuestionSave();
  }

  // New method to handle cancellation of single option
  cancelSingleOption() {
    this.singleOptionDialogRef.close();
    this.pendingQuestionSave = false;
    // User can continue editing the question
  }
  onSingleOptionSelect(selectedIndex: number) {
    if (this.editMode && this.quizSettings.isPass) {
      this.notificationService.errorTopRight('Cannot modify correct answers when quiz is already passed.');
      return;
    }

    const options = this.optionsArray.controls;

    // Set all options to false first
    options.forEach((option, i) => {
      option.get('isCorrect').setValue(false, { emitEvent: false });
    });

    // Set the selected option to true
    options[selectedIndex].get('isCorrect').setValue(true, { emitEvent: false });
  }


  onQuestionDrop(event: CdkDragDrop<QuizQuestion[]>) {
    moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
    this.questions = this.questions.map((question, index) => ({
      ...question,
      order: index
    }));
  }


  deleteQuestion(question: QuizQuestion) {
    this.questionToDelete = question;
    this.dialogRef = this.dialog.open(this.confirmDeleteDialog, {
      width: '400px',
      disableClose: true
    });
  }
  confirmDeleteQuestion() {
    if (this.questionToDelete) {
      const questionIds = this.questionToDelete.languageQuizQuestionId;

      if (questionIds) {
        const request = {
          courseCopyId: this.CourseId,
          id: [questionIds]
        };

        this.service.DeleteMultipleQuestion(request).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.removeQuestionFromArray(this.questionToDelete.id);
              this.notificationService.successTopRight('Question deleted successfully');
              this.GetQuizData();
            } else {
              this.notificationService.errorTopRight('Failed to delete question');
            }
          },
          error: () => {
            this.notificationService.errorTopRight('Error deleting question');
          }
        });
      } else {
        this.removeQuestionFromArray(this.questionToDelete.id);
        this.notificationService.successTopRight('Question deleted successfully');
      }
      this.dialogRef.close();
    }
  }


  removeQuestionFromArray(questionId: string) {
    const index = this.questions.findIndex(q => q.id === questionId);
    if (index !== -1) {
      this.questions.splice(index, 1);
    }
  }

}

export class UploadAdapter {
  private loader: any;

  constructor(loader: any) {
    this.loader = loader;
  }

  public async upload(): Promise<any> {
    const file = await this.loader.file;
    return this.readThis(file);
  }

  private readThis(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve({ default: base64String });
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  }
}