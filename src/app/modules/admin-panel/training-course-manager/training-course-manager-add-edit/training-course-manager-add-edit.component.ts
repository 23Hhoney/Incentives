import { ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TrainingCourseManagerService } from '../training-course-manager.service';
import { NotificationService } from 'app/shared/notification/notification';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { checkValidText } from 'app/shared/validation/validation-utils';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { URLService } from 'app/modules/url-service/url.service';
import { catchError, of, switchMap } from 'rxjs';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { KohlerStudioService } from 'app/modules/LMS/kohler-studio/kohler-studio.service';
import { items } from 'app/mock-api/apps/file-manager/data';

@Component({
  selector: 'app-training-course-manager-add-edit',
  templateUrl: './training-course-manager-add-edit.component.html',
  styleUrls: ['./training-course-manager-add-edit.component.scss']
})
export class TrainingCourseManagerAddEditComponent {
  CourseForm: FormGroup;
  VideoForm: FormGroup;
  sanitizedVideoUrl: SafeResourceUrl;
  AudioForm: FormGroup;
  duplicateAudioForm: FormGroup;
  ImageForm:FormGroup;
  TextForm:FormGroup;
  slideNameModelType = 'edit'
  UserDropDownList=[];
  title: any;
  quizDeleteOption = true;
  selectedUsers=[];
  slidesOrderChanged = false;
  selectedCurriculums = [];
  selectedFile: File | null = null;
  imageUrl: string | ArrayBuffer | null = null;
  imageUpload: boolean = false;
  imagesUrl: string = '';
  indexNum:any;
  searchText: string = '';
  searchTextCurriculum: string = '';
  SubGroupData = [];
  requiredElementId;
  editor = ClassicEditor;
  selectedImage = null;
  newSlideName = '';
  QuestionsOptions: FormGroup;
  QuizSlideForm: FormGroup;
  courseNameExceedsLength: boolean = false;
  languages: string[];
  public editorConfig = {
    toolbar: [
      'redo', 'undo', 
      'heading', 'bold', 'italic', 'strong',
      'blockQuote',
      'unlink', 'imageUpload',
      'insertTable', 'mediaEmbed', 'bulletedList', 'numberedList', 
    ],
  };

  newQuizFlag = false;
  allSelected: boolean = false;
  allCurriculumSelected: boolean = false;
  newSlideCreation = false;
  previewCourse = false;
  @ViewChild('confirmationDialog') confirmationDialog: TemplateRef<any>;
  addMode:boolean=false;
  quizQuestionId = null;
  editMode:boolean=false;
  questionEditMode = false;
  editedQuestions: any[] = [];
  todayDate: Date = new Date();
  questionFormType = 'New';
  questionFormIndex = 0;
  loginUser: any;
  disableCourseFields = false;
  courseLoading = false;
  audioCourseLoading = false;
  imageCourseLoading=false;
  CourseId: any;
  addOption = [];
  mainBulkArray = [];
  editForm: boolean = false;
  addForm: boolean = false;
  isValidUrl = true;
  sidenavWidth = 70;
  newModifiedSlideDetails = null
  questionarray = [];
  editVideoSlideDetails = false;
  editAudioSlideDetails = false;
  imageslideDetails = false;
  textSlideDetails = false;
  videoUrl: string | ArrayBuffer | null = null;
  audioUrl: string | ArrayBuffer | null = null;
  isEnable: boolean = true;
  quizLoader: boolean = false;
  @ViewChild('sidenav') sidenav: MatSidenav;
  modalReference: any;
  closeSlideCreationDialog: any;
  slideEditable = false;
  audioSlideEditable = false;
  ImageSlideEditable=false;
  textSlideEditable = false;
  noVideoSlide=false;
  data: any;
  slideTypes = ['Image', 'Video', 'Audio', 'Quiz', 'Text'];
  selectedSlideType = 'Quiz';
  slides = [];
  isEditMode: boolean = false;
  selectedSlide = null;
  url;
  SlideId: any;
  selectedSlideId: any;
  SlideDataforVideo: any;
  SlideDataforAudio: any;
  videoUpload: boolean = false;
  audioUpload: boolean = false;
  IsEdit: boolean = false;
  ContentId: string | null = null;
  videosUrl: string | null = null;
  audiosUrl: string | null = null;
  QuizSlideId: any;
  QuestionsData: any;
  editExistingQuiz = false;
  uploadingContent: boolean = false;
  modalReferences: any;
  deleteSlideDialog: any;
  mandatory:any
  SlideDataforImage: any;
  SlideDataforText: any;
  deleteSlideDetails = null;
  isSavingCourse = false;
  showCurriculms = false;
  showUsers = false;
  QuestionType: any;
  imageSlides = [];
  quizSlides = [];
  newSlide = [];
  filteredUserList = []
  filteredCurriculumList = []
  courseStatus: any;
  language: any;

  constructor(
    private fb: FormBuilder,
    private service: TrainingCourseManagerService,
    private KohlerService: KohlerStudioService,
    private notificationService: NotificationService,
    private matDialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private urlService: URLService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.uploadingContent = false;
    this.loginUser = window.sessionStorage.getItem('email');
    this.CourseId = this.route.snapshot.params['id'];
    this.selectedSlideType = 'Quiz';
    this.initializeForms();
    this.loadData();
    this.GetUserListforDropdown();
    this.editData();
   // this.GetAllLanguages();
  }
  filterUserList(searchinput) {
    this.searchText = searchinput
    const lowerSearchText = searchinput.toLowerCase();
    this.filteredUserList = this.UserDropDownList.filter(user => 
      user.value.toLowerCase().includes(lowerSearchText)
    );
  }
  filterCurriculumList(searchinput) {
    this.searchTextCurriculum = searchinput
    const lowerSearchText = searchinput.toLowerCase();
    this.filteredCurriculumList = this.SubGroupData.filter(user => 
      user.value.toLowerCase().includes(lowerSearchText)
    );
  }

  initializeForms(){
    this.disableCourseFields = false;
    this.CourseForm = this.fb.group({
      courseId: [''],
      courseName: [''],
      curriculums: [],
      startDate: [''],
      endDate: [''],
      active: true,
      points: null,
      status: 'active',
      description: [''],
      required: false,
      userId: null,
    });

    this.QuizSlideForm = this.fb.group({
      passingMarks: [''],
      noOfQuestion: [''],
      successMsg: [''],
      failMsg: ['']
    });

    this.QuestionsOptions = this.fb.group({
      orders: new FormArray([]),
      amateur: new FormControl(false),
      option: [''],
      question: [''],
      id: null,
      questionType: ['single',Validators.required],
    });

    this.VideoForm = this.fb.group({
      videourl: [''],
      Body: [''],
      Header: [''],
      mandatory:false,
    });
    this.AudioForm = this.fb.group({
      Body: [''],
      Header: [''],
      mandatory:false,
    });
    this.ImageForm= this.fb.group({
      Body: [''],
      Header: ['']
    });
    this.TextForm= this.fb.group({
      Body: [''],
      Header: ['']
    });
  }
  GetUserListforDropdown()
  {
    this.service.GetUserListforDropdown().subscribe(data => {
      if (data) {
        data.forEach((element, index) => {
          this.UserDropDownList.push({ id: element.id, value: element.value });
          this.filteredUserList.push({ id: element.id, value: element.value })
          if(this.selectedUsers.length > 0) {
            this.selectedUsers.filter((item) => {
              if(item === element.id) {
                this.UserDropDownList[index]['checked'] = true
              }
            })
          }
        });
        this.filterUserList('');
      }
    });
  }
  
  loadData(): void {
    const lang =  this.language;
    this.service.GetAllCiriculum(lang).subscribe(data => {
      this.filteredCurriculumList = [];
      if (data) {
        data.forEach((element, index) => {
          if (element.value === 'REQUIRED MONTHLY TRAINING') {
            this.requiredElementId = element.id;
          }
          this.SubGroupData.push({ id: element.id, value: element.value });
          this.filteredCurriculumList.push({ id: element.id, value: element.value });
          if(this.selectedCurriculums.length > 0) {
            this.selectedCurriculums.filter((item) => {
              if(item === element.id) {
                this.SubGroupData[index]['checked'] = true
              }
            })
          }
        });
      }
    });
  }
  checkCourseNameLength() {
    const courseNameValue = this.CourseForm.get('courseName')?.value || '';
    this.courseNameExceedsLength = courseNameValue.length > 255;
  
    if (this.courseNameExceedsLength) {
      this.notificationService.warningTopRight('Course name exceeded its maximum length of 255 characters.');
    }
  }
  getSubGroupDataName(id) {
    const subGroupDataName = this.SubGroupData.filter(item => item.id === id)
    return subGroupDataName ? subGroupDataName[0].value : null;
  }
  getSelectedUsersName(id: string) {
    const selectedUsersName = this.UserDropDownList.filter(item => item.id === id);
    return selectedUsersName.length > 0 ? selectedUsersName[0].value : null;
  }
  editCourseQuestion(index, quizcontent) {
    this.editExistingQuiz = true;
    this.addOption = this.mainBulkArray[index].courseSessionQuestionOptionBean.map(ele => ({
      selected: ele.correctOption,
      index: ele.optionName,
      optionvalue: ele.questionOptionName,
      id: ele.id
    }));
    this.QuestionsOptions.controls['question'].setValue(this.mainBulkArray[index].questionName);
    this.QuestionsOptions.controls['id'].setValue(this.mainBulkArray[index].id);
    this.questionFormType = 'Edit';
    this.questionFormIndex = index;
    this.modalReferences = this.matDialog.open(quizcontent);
  }
  onLanguageChange(event) {
    this.language = event.value;
    this.loadData()
  }
  GetAllLanguages(){
    this.service.GetAllLanguages().subscribe(data => {
      this.languages = data.map(x => x.name);
    });
  }
  getSlideName(name: string): string {
    const index = name.indexOf('_');
    let slideName = name;
    if (index !== -1) {
      slideName = name.substring(index + 1).trim();
    }
    return slideName.length > 8 ? slideName.substring(0, 8) : slideName;
  }

  getTextBeforeUnderscore(name) {
    const index = name.indexOf('_');
    if (index !== -1) {
      return name.substring(0, index);
    }
    return name; 
  }

 

  checkSelectedCheckbox() {
    const status = this.CourseForm.get('status')?.value;
    return status ? status.toLowerCase() : status;
  }
  checkActiveState(): boolean {
    if (!this.CourseForm.value.endDate || !this.CourseForm.value.startDate) {
      return false;
    }
  
    const today = new Date();
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return dateOnly > new Date(this.convertToUTC(this.CourseForm.value.endDate));
  }
  onCheckboxChange(value: string) {
    if (this.checkActiveState() && value === 'Active') {
        this.notificationService.errorTopRight('Cannot set status to Active as the course has expired.');
        return;
    }

    const initialApiStatus = this.courseStatus;

    this.CourseForm.get('status')?.setValue(value);
    this.cdr.detectChanges();

    if (initialApiStatus === 'Archive' || initialApiStatus === 'Inactive') {
        const object = {
            course: this.CourseForm.get('courseName').value,
            list: 'Archive',
            status: this.CourseForm.get('status')?.value
        };
        this.service.CheckDuplicateArchieveCourse(object).subscribe((data) => {
            if (!data.isSuccess) {
                this.notificationService.errorTopRight(data.message);
                this.CourseForm.get('status')?.setValue(initialApiStatus);
                this.cdr.detectChanges();
            }
        });
    }
}

  
  getImagebyId(id) {
    this.service.DownloadCourseLevelImage(id).subscribe((resp) => {
      this.selectedImage = resp.url
    })
  }

 
  editVideoSlide(flag) {
    this.videoUrl = null;
    this.editVideoSlideDetails = flag
  }
  editAudioSlide(flag, type) {
    if(type === 'cancel') {
      this.duplicateAudioForm = this.fb.group({
        Body: [''],
        Header: [''],
        mandatory:false,
      });
    } else {
      this.duplicateAudioForm = this.fb.group({
        Body: this.AudioForm.value.Body,
        Header: this.AudioForm.value.Header,
        mandatory: this.AudioForm.value.mandatory,
      });
    }
    this.selectedFile = null
    this.audioUpload = false;
    this.audioUrl = null;
    this.editAudioSlideDetails = flag
  }
  EditImageslide(flag) {
   this.imageslideDetails = flag;
  }
  EditTextslide(flag) {
   this.textSlideDetails = flag;
  }

  
  onSelectAudioFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileType = file.type.toLowerCase();

      const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac'];
  
      if (!allowedTypes.includes(fileType)) {
        this.notificationService.errorTopRight('Please upload a valid audio file of type MP3, WAV, OGG, M4A, or AAC');
        input.value = '';
        return;
      }
      const maxSize = 15 * 1024 * 1024;
      this.selectedFile = input.files[0];
      
      if (this.selectedFile.size > maxSize) {
        this.selectedFile = null;
        this.notificationService.errorTopRight('File is too large. Maximum file size is 15 MB.')
        input.value = '';
        return;
      }
      const reader = new FileReader();

      reader.onload = () => {
        this.audioUrl = reader.result as string;
        this.cdr.detectChanges();
      };

      reader.onerror = error => {
        console.error('Error reading file:', error);
      };

      reader.readAsDataURL(this.selectedFile);
      this.audioUpload = true;
    }
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      if (file.type.startsWith('image/')) {
        this.selectedImage = file;
      } else {
        this.notificationService.errorTopRight('Please upload a valid image file');
        input.value = ''; // Clear the input
      }
    }
  }

  removeFile(): void {
    this.selectedImage = null;
  }
  formateSelectedDate(value: string): string {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = this.padZero(date.getMonth() + 1);
    const day = this.padZero(date.getDate());
    // Ensure time is set to 00:00:00
    const formattedDate = `${year}-${month}-${day}T00:00:00`;
    return formattedDate;
  }
  
  padZero(num: number, size: number = 2): string {
    let s = num.toString();
    while (s.length < size) s = '0' + s;
    return s;
  }

  isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }
  convertToLocalTime(dateString: string): string {
    const date = new Date(dateString);
    // Format date as YYYY-MM-DD in local timezone
    return date.toLocaleDateString('en-CA'); // en-CA locale gives YYYY-MM-DD format
}
  editData(): void {
    if (this.CourseId) {
      this.service.GetCourseDetail(this.CourseId).subscribe(data => {
        if (data) {
          this.courseStatus = data.status;
          console.log('Initial status:', this.courseStatus);
          this.CourseForm.get('status')?.setValue(this.courseStatus);
          this.selectedUsers = [];
          this.getImagebyId(data.id);
          data.classAssigns.forEach((user) => {
            this.selectedUsers.push(user.userId)
          });
          data.courseCurriculumClassAssigns.forEach((curriculum) => {
            this.selectedCurriculums.push(curriculum.curriculumId);
          })
          this.SubGroupData.forEach(element => {
            this.selectedCurriculums.filter((item) => {
              if (item === element.id) {
                element['checked'] = true
              }
            })
          });
          this.UserDropDownList.forEach(element => {
            this.selectedUsers.filter((item) => {
              if (item === element.id) {
                element['checked'] = true
              }
            })
          });
          this.isEditMode = true;
          this.CourseForm = this.fb.group({
            courseId: data.courseId,
            courseName: data.name,
            curriculums: [],
            startDate: this.convertToLocalTime(data.startDate),
            endDate: this.convertToLocalTime(data.endDate),
            active: data.iActive,
            points: data.points,
            description: data.description ?? '',
            required: data.required,
            status: data.status,
            userId: ['']
          });
          this.CourseForm.controls['userId'].setValue(this.selectedUsers);
          this.CourseForm.controls['curriculums'].setValue(this.selectedCurriculums);
          if (this.selectedCurriculums.length === this.SubGroupData.length) {
            this.allCurriculumSelected = true;
          } else {
            this.allCurriculumSelected = false;
          }
          if (data.classAssigns && data.classAssigns.length > 0) {
            this.disableCourseFields = true;
          } else {
            this.disableCourseFields = false;
          }
        }
      });
    }
  }
  
  convertToUTC(date: string, originalDate: string | null = null): string {
    // If we have an original date from the form, preserve it
    if (originalDate) {
        return originalDate;
    }
    
    // For newly selected dates from datepicker
    if (date.length === 10) { // YYYY-MM-DD format
        const localDate = new Date(date);
        const utcDate = new Date(Date.UTC(
            localDate.getFullYear(),
            localDate.getMonth(),
            localDate.getDate(),
            12, 0, 0
        ));
        return utcDate.toISOString();
    }
    
    // For existing dates in ISO format
    return new Date(date).toISOString();
}
    
  SaveOrupdateCourse() {
    const selectedUsers = this.CourseForm.get('userId').value.map(userId => ({
      userId: userId
    }));

    const validateForm = this.checkvalidation();
    if (!validateForm) {
      return;
    }
    const formEndDate = this.CourseForm.get('endDate').value;
    const formStartDate = this.CourseForm.get('startDate').value;
    
    // Get the original values from the form
    const originalStartDate = this.CourseForm.get('startDate').pristine ? 
        formStartDate : null;
    const originalEndDate = this.CourseForm.get('endDate').pristine ? 
        formEndDate : null;
    
    const startDate = this.convertToUTC(formStartDate, originalStartDate);
    const endDate = this.convertToUTC(formEndDate, originalEndDate);

    
    // Validate the dates
    if (!startDate || !this.isValidDate(startDate)) {
      this.notificationService.errorTopRight('Please enter a valid start date');
      return;
    } else if (endDate && !this.isValidDate(endDate)) {
      this.notificationService.errorTopRight('Please enter a valid end date');
      return;
    } else if (new Date(startDate) > new Date(endDate)) {
      this.notificationService.errorTopRight('Start date cannot be later than end date. Please enter valid dates');
      return;
  }

    if (validateForm) {
      const FormMessageType = this.CourseId ? 'updated' : 'saved';
      const formData = new FormData();
      formData.append('id', this.CourseId ? this.CourseId : '');
      formData.append('courseId', this.CourseForm.get('courseId').value);
      formData.append('name', this.CourseForm.get('courseName').value);
      formData.append('file', this.selectedImage);
      formData.append('createdById', this.loginUser);

      if (startDate) formData.append('startDate', startDate);  
      if (endDate) formData.append('endDate', endDate);

      formData.append('description', this.CourseForm.get('description').value ? this.CourseForm.get('description').value : '');
      formData.append('modifiedById', this.loginUser);
      formData.append('iActive', this.CourseForm.get('active').value);
      formData.append('Points', this.CourseForm.get('points').value);
      formData.append('required', this.CourseForm.get('required').value);
      formData.append('status', this.CourseForm.get('status').value);

      this.CourseForm.get('curriculums').value.forEach((curriculum, index) => {
        formData.append(`CourseCurriculumViewModels[${index}][curriculumMasterId]`, curriculum);
      });

      selectedUsers.forEach((id, index) => {
        for (const key in id) {
          if (id.hasOwnProperty(key)) {
            formData.append(`courseAssignViewModels[${index}][${key}]`, id[key]);
          }
        }
      });

      this.isSavingCourse = true;

      this.service.SaveOrUpdateCourse(formData).pipe(
        catchError(error => {
          this.isSavingCourse = true;
          this.notificationService.errorTopRight('Something went wrong');
          return of(null);
        })
      ).subscribe(data => {
        this.isSavingCourse = false;
        if (data.isSuccess) {
          this.notificationService.successTopRight(`Data ${FormMessageType} Successfully`);
          this.router.navigate(['/training-course-manager']);
        } else {
          this.notificationService.errorTopRight(data.message);
        }
      });
    }
  }
      
  checkvalidation(): boolean {
    if (!checkValidText(this.CourseForm.get('courseId').value)) {
     this.notificationService.errorTopRight('Please Fill Course Id');
     return false;
   } 
   else if (!checkValidText(this.CourseForm.get('courseName').value+'')) {
    this.notificationService.errorTopRight('Please Fill Course Name');
    return false;
  } 
   else if (!this.CourseForm.get('curriculums').value.length) {
     this.notificationService.errorTopRight('Please Select Curriculum');
     return false;
   } 
   else if (!this.CourseForm.get('userId').value || this.CourseForm.get('userId').value.length === 0) {
    this.notificationService.errorTopRight('Please Select User');
    return false;
  }  
   else if (this.CourseForm.get('points').value === null || this.CourseForm.get('points').value === '') {
    this.notificationService.errorTopRight('Please Add Points');
    return false;
  } else if(this.CourseForm.get('points').value < 0) {
    this.notificationService.errorTopRight('Points must be a positive number. Please enter a valid value.');
    return false;
  } else if (!checkValidText(this.CourseForm.get('startDate').value+'')) {
    this.notificationService.errorTopRight('Please Fill Start Date');
    return false;
  }
  else if (!checkValidText(this.CourseForm.get('endDate').value+'')) {
    this.notificationService.errorTopRight('Please Fill End Date');
    return false;
  }
   else {
     return true;
   } 
 }
 rearrangeSlidesOrder(type) {
  const filteredSlide = [];
  const slideCategories = [this.quizSlides, this.imageSlides];

  slideCategories.forEach(slides => {
    slides.reverse().forEach(slide => {
      filteredSlide.push({
        slideId: slide.id,
        courseId: this.CourseId
      });
    });
  });
  this.service.UpdateCourseSlide(filteredSlide).subscribe((resp) => {
    if(resp.isSuccess) {
      if(type !== 'no notification') {
        this.notificationService.successTopRight('Slides order changed successfully.')
      }
      this.GetallSlides();
      this.slidesOrderChanged = false;
    } else {
      this.notificationService.errorTopRight('Something went wrong.')
    }
  })
 }
  addSlide(): void {
    if(!(this.quizSlides.length === 1) && this.selectedSlideType !== 'Quiz') {
      return this.notificationService.errorTopRight('Please add the quiz slide first.')
    }
    const selectedSlideTypeName = this.selectedSlideType
    const filteredSlidesArray = this.slides.filter((slide) => slide.slideName.includes(selectedSlideTypeName.split(' ')[0]))
    if(selectedSlideTypeName === 'Quiz' && filteredSlidesArray.length === 1) {
      this.notificationService.errorTopRight('Quiz slide already exist.')
    } else {
      if(filteredSlidesArray.length === 0 || selectedSlideTypeName === 'Quiz') {
        this.selectedSlideType = selectedSlideTypeName;
      } else {
        // this.selectedSlideType = selectedSlideTypeName.split(' ')[0] + ' ' + (filteredSlidesArray.length + 1).toString()
        this.resetSlideForm();
      }
      this.selectedFile = null;
      const newSlide = {
        slideName: this.selectedSlideType,
        courseId: this.CourseId,
        createdById: this.loginUser,
        modifiedById: null
      };
      this.slides.push(newSlide);
      this.newSlide = []
      this.newModifiedSlideDetails = newSlide;
      this.newSlide.push(newSlide)
      this.newSlideName = this.selectedSlideType;
      this.selectedSlide = newSlide
      this.newSlideCreation = true;
      this.imagesUrl = null;
      this.imageUrl = null;
      this.slideEditable = false;
      this.editVideoSlideDetails = true;
      this.selectSlide(newSlide);
    }
  }
  resetSlideForm() {
    if(this.selectedSlideType.includes('Audio')) {
      this.audiosUrl = null
      this.AudioForm = this.fb.group({
        Body: [''],
        Header: [''],
        mandatory:false,
      });
    } else if(this.selectedSlideType.includes('Image')) {
      this.selectedImage = null;
      this.imageUrl = null;
      this.imagesUrl = null;
      this.imageUpload = false;
      this.ImageForm= this.fb.group({
        Body: [''],
        Header: ['']
      });
    } else if(this.selectedSlideType.includes('Text')) {
      this.TextForm= this.fb.group({
        Body: [''],
        Header: ['']
      });
    } else if(this.selectedSlideType.includes('Video')) {
      this.videoUrl = null;
      this.sanitizedVideoUrl = null;
      this.VideoForm = this.fb.group({
        videourl: [''],
        Body: [''],
        Header: [''],
        mandatory:false,
      });
    }
  }
  selectNewSlideName(event) {
    this.selectedSlideType = event.value;
    if(!(this.quizSlides.length === 1)) {
      return this.notificationService.errorTopRight('Please add the quiz slide first.');
    } 
  }
  saveNewSlide(newSlide) {
    const formRawData =  this.selectedSlide.slideName.includes('Audio') ? this.AudioForm.getRawValue() :
    this.selectedSlide.slideName.includes('Video') ? this.VideoForm.getRawValue() :
    this.selectedSlide.slideName.includes('Image') ? this.ImageForm.getRawValue() :
    this.selectedSlide.slideName.includes('Text') ? this.TextForm.getRawValue() :
    null;
    if(this.selectedSlideType !== 'Quiz' && (formRawData.Header === null || formRawData.Header === undefined || formRawData.Header === '')){
      return this.notificationService.errorTopRight('Header field is Mandatory')
    }
    let checkHeaderName = [];

    if(this.selectedSlideType !== 'Quiz') {
      checkHeaderName = this.slides.filter((item) => {
        const slideName = this.getSlideName(item.slideName);
        let skipCondition = false;
        if('id' in item) {
          skipCondition = item?.id === newSlide?.id || item.id === newSlide?.courseId;
        } else {
          skipCondition = item?.courseId === newSlide?.id || item.courseId === newSlide?.courseId;
        }
        return slideName === formRawData.Header && !skipCondition;
      });
    }
    if (this.selectedSlideType !== 'Quiz' && checkHeaderName.length > 0) {
      return this.notificationService.errorTopRight('Header Name Should Be Unique.');
    }
    if (this.selectedSlide.slideName.includes('Video')) {
      const embedUrl = this.urlService.constructEmbedUrl(formRawData.videourl);
      if (embedUrl === '' || embedUrl === null) {
        this.notificationService.errorTopRight('The URL provided is invalid. Please ensure it is a valid YouTube or Vimeo URL.');
        return;
      }
    }
    if(this.selectedSlideType === 'Quiz') {
      this.newModifiedSlideDetails.slideName = 'Quiz';
    } else {
      const slideName = this.newModifiedSlideDetails.slideName;
      const parts = slideName.split('_');
      const extractedType = parts[0];
      this.newModifiedSlideDetails.slideName = `${extractedType}_${formRawData.Header}`;
    }
    if(this.newSlideCreation && this.slides[this.slides.length - 1].slideName ===  this.selectedSlide.slideName) {
      this.service.SaveOrUpdateSlide(this.newModifiedSlideDetails).subscribe(data => {
        if (data.isSuccess === false) {
          this.notificationService.errorTopRight('Slide already exists and cannot be added');
          this.slides.pop();
        } else {
          this.ContentId = '00000000-0000-0000-0000-000000000000'
          this.textSlideEditable = false;
          this.ImageSlideEditable = false;
          this.audioSlideEditable = false;
          this.slideEditable = false;
          this.notificationService.successTopRight('Slide saved Successfully');
          this.service.Getallslides(this.CourseId).subscribe(data => {
            if(data) {
              this.slides = data;
              let addedSlide = this.slides.filter(x => x.slideName == newSlide.slideName);
              this.selectedSlide = addedSlide[0];
              this.slides[this.slides.length - 1] = addedSlide[0]
              this.selectedSlideId = addedSlide[0].id
              if(this.selectedSlide.slideName === 'Quiz') {
                this.saveQuizSlideInfo()
              } else {
                this.saveSlideDetails();
              }
            }
          });
        }
      }, error => {
        this.notificationService.errorTopRight('An error occurred while saving the slide');
        this.slides.pop();
      });
    } else {
      if(this.selectedSlide.slideName.includes('Quiz')) {
        // const req = this.newModifiedSlideDetails;
        // // req['courseId'] = this.CourseId,
        // this.service.SaveOrUpdateSlide(req).subscribe(data => {
        //   if(data.isSuccess) {
            this.saveQuizSlideInfo()
          // } else {
          //   this.notificationService.errorTopRight('Something went wrong.')
          // }
        // })
      } else {
        const req = this.newModifiedSlideDetails;
        req['courseId'] = this.CourseId,
        this.service.SaveOrUpdateSlide(req).subscribe(data => {
          if(data.isSuccess) {
            this.service.Getallslides(this.CourseId).subscribe(data => {
              if(data) {
                this.slides = data;
                let addedSlide = this.slides.filter(x => x.slideName == req.slideName);
                this.selectedSlide = addedSlide[0];
                this.slides[this.slides.length - 1] = addedSlide[0]
                this.selectedSlideId = addedSlide[0].id
                this.saveSlideDetails();
              }
            });
          } else {
            this.notificationService.errorTopRight('Something went wrong.')
          }
        })
      }

    }
  }
  saveSlideDetails() {
    const formRawData =  this.selectedSlide.slideName.includes('Audio') ? this.AudioForm.getRawValue() :
    this.selectedSlide.slideName.includes('Video') ? this.VideoForm.getRawValue() :
    this.selectedSlide.slideName.includes('Image') ? this.ImageForm.getRawValue() :
    this.selectedSlide.slideName.includes('Text') ? this.TextForm.getRawValue() :
    null;
    if (this.selectedSlide.slideName.includes('Video')) {
      const embedUrl = this.urlService.constructEmbedUrl(formRawData.videourl);
      if (embedUrl === '' || embedUrl === null) {
        this.notificationService.errorTopRight('The URL provided is invalid. Please ensure it is a valid YouTube or Vimeo URL.');
        return;
      }
    }
    const formData: FormData = new FormData();
    let contentId =  this.ContentId;
    if(!contentId)contentId = '00000000-0000-0000-0000-000000000000';
    this.uploadingContent = true;
    this.mandatory=false;
    formData.append('id', this.slideEditable || this.audioSlideEditable || this.ImageSlideEditable || this.textSlideEditable ? contentId: '00000000-0000-0000-0000-000000000000');
    formData.append('slideId', this.selectedSlideId);
    formData.append('courseId', this.CourseId);
    formData.append('body', formRawData?.Body);
    formData.append('videourl', formRawData?.videourl);
    formData.append('header', formRawData?.Header);
    formData.append('createdById', this.loginUser);
    formData.append('modifiedById', null);
    if (formRawData && formRawData.mandatory !== undefined) {
      formData.append('mandatory', formRawData.mandatory === '' ? false : formRawData.mandatory);
    } else {
      formData.append('mandatory',this.mandatory);
    }
    formData.append('formFile', this.selectedSlide.slideName.includes('Video') ? '' : this.selectedFile);
    this.service.SaveorUpdateCourseVideo(formData).subscribe(el => {
      if (!el.isSuccess) {
        this.notificationService.errorTopRight('Some Error');
        this.uploadingContent = false;
        this.editAudioSlideDetails = false;
        this.editVideoSlideDetails = false;
        this.imageslideDetails=false;
        this.textSlideDetails = false;
        if(this.newSlideCreation) {
          this.newSlideCreation = false;
        }
      } else {
        this.notificationService.successTopRight('Data Saved Successfully');
        this.rearrangeSequence()
        this.rearrangeSlidesOrder('no notification')
        this.selectSlide(this.selectedSlide)
        this.uploadingContent = false;
        this.editAudioSlideDetails = false;
        this.editVideoSlideDetails = false;
        this.imageslideDetails=false;
        this.textSlideDetails = false;
        if(this.newSlideCreation) {
          this.newSlideCreation = false;
        }
      }
    });
  }
  rearrangeSequence() {
    this.imageSlides = [];
    this.quizSlides = [];
    this.newSlide = [];
    let quizIndex = this.slides.findIndex(slide => slide.slideName === "Quiz");
    if (quizIndex !== -1) {
      let quizSlide = this.slides.splice(quizIndex, 1)[0];
      this.slides.push(quizSlide);
    }
    this.slides.forEach(slide => {
      if (slide.slideName.startsWith("Quiz")) {
        this.quizSlides.push(slide);
      } else {
        this.imageSlides.push(slide);
      }
    });
    this.selectedSlide = this.slides[0];
    this.selectSlide(this.selectedSlide);
  }

  GetallSlides() {
    // this.newSlideCreation = false;
    this.IsEdit = true;
    this.newSlide = [];
    this.service.Getallslides(this.CourseId).subscribe(data => {
      this.slides = data;
      if(this.slides.length>0) {
        this.rearrangeSequence();
      } else {
        this.imageSlides = [];
        this.quizSlides = [];
        this.newSlide = [];
        this.selectedSlide = null;
      }
    });
  }

  selectSlide(slide){
    this.courseLoading = true;
    this.selectedSlide = slide;
    this.selectedSlideType = slide.slideName.includes('Video') ? 'Video' : slide.slideName.includes('Text') ? 'Text' : slide.slideName.includes('Image') ? 'Image' : slide.slideName.includes('Audio') ? 'Audio' : 'Quiz'
    this.selectedSlideId = slide.id;
    this.resetSlideForm();
    if (this.selectedSlide.slideName.includes('Video')) {
      this.editVideoSlideDetails = false;
      if (this.CourseId && this.selectedSlideId) {
        this.courseLoading = true;
        this.videoUpload = false;
        this.ContentId = '00000000-0000-0000-0000-000000000000';
        this.audioSlideEditable = false;
        this.ImageSlideEditable = false;
        this.textSlideEditable = false
        this.slideEditable = false
        this.uploadingContent = false;
        this.service.GetSlideMediaContent(this.CourseId, this.selectedSlideId).subscribe(data => {
          if(data && data.id){
            this.SlideDataforVideo = data;
            if(data.id){
              this.ContentId = data.id;
              this.slideEditable = true
            } else {
              this.slideEditable = true
              this.ContentId = '00000000-0000-0000-0000-000000000000';
            }
            if (this.SlideDataforVideo.videoURl.includes('vimeo.com')) {
              this.urlService.getVimeoEmbedUrl(this.SlideDataforVideo.videoURl).subscribe((resp) => {
                const embedUrl = this.urlService.extractIframeUrl(resp.html)
                if (embedUrl === '' || embedUrl === null) {
                  this.isValidUrl = false;
                } else {
                  this.isValidUrl = true;
                }
                this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl)
              })
            } else {
              const embedUrl = this.urlService.constructEmbedUrl(this.SlideDataforVideo.videoURl);
              if (embedUrl === '' || embedUrl === null) {
                this.isValidUrl = false;
              } else {
                this.isValidUrl = true;
              }
              this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
            }
            this.VideoForm.setValue({
              videourl:  this.SlideDataforVideo.videoURl || '',
              Body: this.SlideDataforVideo.body || '',
              Header: this.SlideDataforVideo.header || '',
              mandatory:this.SlideDataforVideo.mandatory|| false
            });
          } else {
            this.slideEditable = true;
          }
          this.courseLoading = false;
          // this.service.GetSlideVideoUrl(this.ContentId).subscribe(videoData => {
          //   if(videoData){
          //     this.videosUrl = videoData.url;
          //   }else {
          //     this.slideEditable = false
          //     this.courseLoading = false;
          //   }
          // });
        });
      } else if ('courseId' in this.selectedSlide) {
        this.VideoForm = this.fb.group({
          videourl: [''],
          Body: [''],
          Header: [''],
          mandatory:false,
        });
        this.slideEditable = false;
        this.courseLoading = false;
      }
    } 
    else if (this.selectedSlide.slideName === 'Quiz') {
      this.quizLoader = true;
      this.ContentId = '00000000-0000-0000-0000-000000000000';
      this.audioSlideEditable = false;
      this.ImageSlideEditable = false;
      this.slideEditable = false;
      this.textSlideEditable = false
      this.uploadingContent = false;
      this.quizDeleteOption = true;
      this.quizLoader = false;

      if ('id' in this.selectedSlide) {
          this.newQuizFlag = false;
          this.QuestionsData = null;
          this.QuestionsOptions = this.fb.group({
            orders: new FormArray([]),
            amateur: new FormControl(false),
            option: [''],
            question: [''],
            id: null,
            questionType: ['single',Validators.required],
          });
          this.service.GetQuizSlideContent(this.CourseId, this.selectedSlideId).subscribe(data => {
              if (data && data.length > 0) {
                  this.QuizSlideId = data[0].id;
                  this.QuizSlideForm = this.fb.group({
                      passingMarks: data[0].passingMarks,
                      noOfQuestion: 5,
                      successMsg: data[0].successMsg,
                      failMsg: data[0].failMsg
                  });
                  Object.keys(this.QuizSlideForm.controls).forEach(key => {
                    const control = this.QuizSlideForm.get(key);
                    if (key === 'passingMarks' || key === 'successMsg' || key === 'failMsg') {
                      control.enable();
                    } else {
                      control.enable();
                    }
                  });
                  this.service.GetSlideQuizQuestions(this.QuizSlideId).subscribe({
                      next: (data) => {
                        this.quizLoader = false;
                        this.courseLoading = false;
                        this.QuestionsData = data;
                        this.initForm();
                      },
                      error: (err) => {
                        this.quizLoader = false;
                        this.courseLoading = false;
                      }
                  });
              } else {
                this.newQuizFlag = true;
                this.quizLoader = false;
                this.courseLoading = false;
              }
          });
      } else {
        this.resetSlideForm();
        this.courseLoading = false;
        this.newQuizFlag = true;
      }
    }

    else if(this.selectedSlide.slideName.includes('Audio')) {
      this.editAudioSlideDetails = false;
      if (this.CourseId && this.selectedSlideId) {
        this.audioCourseLoading = true;
        this.ContentId = '00000000-0000-0000-0000-000000000000';
        this.audioSlideEditable = false;
        this.ImageSlideEditable=false;
        this.slideEditable = false
        this.uploadingContent = false;
        this.textSlideEditable = false
        this.audioUpload = false;
        if ('id' in this.selectedSlide) {
          this.service.GetSlideMediaContent(this.CourseId, this.selectedSlideId).subscribe(data => {
            if(data){
              this.SlideDataforAudio = data;
              
              if(data.id)
                this.ContentId = data.id;
              else 
                this.ContentId = '00000000-0000-0000-0000-000000000000';
              this.AudioForm.setValue({
                Body: this.SlideDataforAudio.body,
                Header: this.SlideDataforAudio.header || '',
                mandatory:this.SlideDataforAudio.mandatory|| false
              });
            } else {
              this.audioSlideEditable = false;
            }
            this.service.GetSlideVideoUrl(this.ContentId).subscribe(videoData => {
              if(videoData){
                this.audiosUrl = videoData.url;
                this.audioSlideEditable = true;
                this.audioCourseLoading = false;
                this.courseLoading = false;
              } else {
                this.audioSlideEditable = false;
                this.audioCourseLoading = false;
                this.courseLoading = false;
              }
            });
            this.courseLoading = false;
          });
        }
      } else {
        this.resetSlideForm();
        this.courseLoading = false;
        this.editAudioSlideDetails = false;
      }
    } else if(this.selectedSlide.slideName.includes('Image')) {
      this.imageslideDetails = false;
      this.imageCourseLoading = true;
      if (this.CourseId && this.selectedSlideId) {
        this.imageCourseLoading = true;
        this.ImageSlideEditable = false
        this.ContentId = '00000000-0000-0000-0000-000000000000';
        this.audioSlideEditable = false;
        this.slideEditable = false;
        this.uploadingContent = false;
        this.textSlideEditable = false
        this.audioUpload = false;
        if ('id' in this.selectedSlide) {
          this.service.GetSlideMediaContent(this.CourseId, this.selectedSlideId).subscribe(data => {
            if (data) {
              this.SlideDataforImage = data;
              this.ContentId = data.id || '00000000-0000-0000-0000-000000000000';
              this.ImageForm.setValue({
                Body: this.SlideDataforImage.body || '',
                Header: this.SlideDataforImage.header || ''
              });
            } else {
              this.ImageSlideEditable = false;
            }
            this.service.GetSlideVideoUrl(this.ContentId).subscribe(imageData => {
              if (imageData) {
                this.imageUrl = imageData.url;
                this.imagesUrl= imageData.url;
                this.ImageSlideEditable = true;
              } else {
                this.ImageSlideEditable = false;
              }
              this.imageCourseLoading = false;
              this.courseLoading = false;
            });
          });
        } else {
          this.resetSlideForm();
          this.imageCourseLoading = false;
          this.courseLoading = false;
        }
      }
      else if ('courseId' in this.selectedSlide) {
        this.resetSlideForm();
        this.courseLoading = false;
        this.imageCourseLoading = false;
        this.ImageSlideEditable = false;
      }
    } else if(this.selectedSlide.slideName.includes('Text')) {
      this.textSlideDetails = false;
      if (this.CourseId && this.selectedSlideId) {
        this.imageCourseLoading = true;
        this.textSlideEditable = false
        this.ContentId = '00000000-0000-0000-0000-000000000000';
        this.audioSlideEditable = false;
        this.slideEditable = false;
        this.uploadingContent = false;
        this.audioUpload = false;
        if ('id' in this.selectedSlide) {
          this.service.GetSlideMediaContent(this.CourseId, this.selectedSlideId).subscribe(data => {
            if (data) {
              this.SlideDataforText = data;
              this.ContentId = data.id || '00000000-0000-0000-0000-000000000000';
              this.TextForm.setValue({
                Body: this.SlideDataforText.body || '',
                Header: this.SlideDataforText.header || ''
              });
              this.textSlideEditable = true;
            } else {
              this.textSlideEditable = false;
            }
            this.imageCourseLoading = false;
            this.courseLoading = false;
          });
        } else {
          this.resetSlideForm();
          this.courseLoading = false;
        }
      } else if ('courseId' in this.selectedSlide) {
        this.resetSlideForm();
        this.courseLoading = false;
        this.textSlideEditable = false;
        this.imageCourseLoading = false;
      }
    }
    this.url = '';
  }

  over(type) {
    if(type === 'curriculm') {
      this.showCurriculms = true;
    } else {
      this.showUsers = true
    }
  }

  out(type) {
    if(type === 'curriculm') {
      this.showCurriculms = false;;
    } else {
      this.showUsers = false;
    }
  }

  Submit(): void {
    if(this.slides[this.slides.length - 1].slideName ===  this.selectedSlide.slideName && this.newSlideCreation){
      this.saveNewSlide(this.slides[this.slides.length - 1]);
    } else {
      this.newModifiedSlideDetails = {
        slideName: this.selectedSlideType,
        id: this.selectedSlide.id,
        createdById: this.loginUser,
        modifiedById: null
      }
      this.saveNewSlide(this.selectedSlide);
    }
  }
  Resetform()
  {
    this.QuizSlideForm = this.fb.group({
      passingMarks: [''],
      noOfQuestion: [''],
      successMsg: [''],
      failMsg: ['']
    });
    this.mainBulkArray =[];
  }

  saveQuizQuestions() {
    if (!this.data) {
      if (this.mainBulkArray) {
        const requestBody = this.QuestionsData.questionWithOptions.map((question, index)=>({
          id: question.id,
          indexnum: index + 1,
          question: question.label,
          courseContentSlideQuizId: this.QuizSlideId,
          createdById: this.loginUser,
          modifiedById: null,
          questionType: question.questionType,
          courseContentSlideQuizOptionViews: question.options.map(option => ({
            id: option.id,
            option: option.label,
            isCorrect: option.isCorrect,
            createdById: this.loginUser,
            modifiedById: null
          }))
        }));
        this.isEnable = true
        this.quizLoader = true;
        this.service.SaveorupdateSlideQuizQuestions(requestBody).subscribe(el => {
          this.quizLoader = false;
          if (el.status === 'FAILED') {
            this.notificationService.errorTopRight('SomeSystemError');
            this.isEnable = false;
          } else if (el.isSuccess) {
            this.selectSlide(this.selectedSlide);
            this.mainBulkArray = [];
            // this.notificationService.successTopRight('Data saved successfully');
          } else if(el.isSuccess === false) {
            this.selectSlide(this.selectedSlide);
            this.notificationService.errorTopRight('Quiz already submitted by the user.');
          }
        });
        if(this.newSlideCreation) {
          this.newSlideCreation = false;
          this.GetallSlides();
        }
      }
     
    } else {
      if(this.newSlideCreation) {
        this.newSlideCreation = false;
        this.GetallSlides();
      }
    }
  }

  deleteSlide(event, slide, index, dialog) {
    event.stopPropagation()
    this.deleteSlideDetails = {
      slide: slide,
      index: index
    }
    this.modalReferences = this.matDialog.open(dialog)
  }
  deleteSlideConfirmation() {
    if('id' in this.deleteSlideDetails.slide) {
      this.service.deleteSlide(this.deleteSlideDetails.slide.id).subscribe((resp) => {
        if(resp.isSuccess) {
          this.notificationService.successTopRight('Slide deleted successfully.')
          this.Resetform();
          this.GetallSlides();
          if(this.newSlideCreation) {
            this.newSlideCreation = false;
          }
          this.modalReferences.close()
        } else {
          if (resp?.message === 'already used!') {
            this.notificationService.errorTopRight('Quiz modification is restricted. Users have already started or completed this quiz.');
          } else {
            this.notificationService.errorTopRight('Something went wrong.')
            //This question is already attempted, so it cannot be deleted
          } 
        }
      })
    } else {
      this.modalReferences.close()
      this.slides.splice(this.slides.length - 1, 1)
      if(this.newSlideCreation) {
        this.newSlideCreation = false;
      }
      this.GetallSlides();
    }
  }
  SaveQuizSlide() {
    const marks = this.QuizSlideForm.get('passingMarks').value;
    const successMsg = this.QuizSlideForm.get('successMsg').value;
    const failMsg = this.QuizSlideForm.get('failMsg').value;
  
    if (marks === null || marks < 0 || marks > 100) {
      this.notificationService.errorTopRight('Please enter a passing percentage between 0 and 100');
      return;
    }
    if (successMsg === null || successMsg.trim() === '') {
      this.notificationService.errorTopRight('Please enter a valid success message');
      return;
    }
    if (failMsg === null || failMsg.trim() === '') {
      this.notificationService.errorTopRight('Please enter a valid failure message');
      return;
    }
    if(this.newSlideName === 'Quiz') {
      this.saveNewSlide(this.slides[this.slides.length - 1]);
    } else {
      this.saveQuizSlideInfo();
    } 
  }
  
  saveQuizSlideInfo() {
    if(this.QuizSlideId) {
      const object = {
        id: this.QuizSlideId,
        passingMarks: this.QuizSlideForm.get('passingMarks').value,
        noOfQuestion: 5,
        successMsg: this.QuizSlideForm.get('successMsg').value,
        failMsg: this.QuizSlideForm.get('failMsg').value,
        courseContentSlideId: this.selectedSlideId,
        courseId: this.CourseId,
        createdById: this.loginUser,
        modifiedById: this.loginUser
      };
      this.service.SaveorupdateSlideQuiz(object).subscribe(el => {
        if (!el.isSuccess) {
          this.notificationService.errorTopRight('Some Error');
        } else {
          this.notificationService.successTopRight('Data Updated Successfully');
          this.GetSlideContentquiz();
        }
        if(this.newSlideCreation) {
          this.newSlideCreation = false;
          this.GetallSlides();
        }
      });
    } else{
      const object = {
        id: null,
        passingMarks: this.QuizSlideForm.get('passingMarks').value,
        noOfQuestion: 5,
        successMsg: this.QuizSlideForm.get('successMsg').value,
        failMsg: this.QuizSlideForm.get('failMsg').value,
        courseContentSlideId: this.selectedSlideId,
        courseId: this.CourseId,
        createdById: this.loginUser,
        modifiedById: null
      };

      this.service.SaveorupdateSlideQuiz(object).subscribe(el => {
        if (!el.isSuccess) {
          this.notificationService.errorTopRight('Some Error');
        } else {
          this.notificationService.successTopRight('Data Saved Successfully');
          this.GetSlideContentquiz();
        }
      });
    }
  }
  GetSlideContentquiz() {
    this.service.GetQuizSlideContent(this.CourseId, this.selectedSlideId).pipe(
      switchMap(data => {
        this.QuizSlideId = data[0].id; // Update QuizSlideId
        console.log('QuizSlideId', this.QuizSlideId);
        this.QuizSlideForm = this.fb.group({
          passingMarks: data[0].passingMarks,
          noOfQuestion: 5,
          successMsg: data[0].successMsg,
          failMsg: data[0].failMsg
        });
        return this.service.SaveorupdateSlideQuizQuestions(
          this.QuestionsData.questionWithOptions.map((question, index) => ({
            id: question.id,
            indexnum: index + 1,
            question: question.label,
            courseContentSlideQuizId: this.QuizSlideId,
            createdById: this.loginUser,
            modifiedById: null,
            questionType: question.questionType,
            courseContentSlideQuizOptionViews: question.options.map(option => ({
              id: option.id,
              option: option.label,
              isCorrect: option.isCorrect,
              createdById: this.loginUser,
              modifiedById: null
            }))
          }))
        );
      })
    ).subscribe(el => {
      if (el.isSuccess) {
        this.selectSlide(this.selectedSlide);
        this.mainBulkArray = [];
        this.notificationService.successTopRight('Quiz questions saved successfully!');
        this.modalReference.close();
      } 
      else if(el.isSuccess === false) {
        this.selectSlide(this.selectedSlide);
        this.notificationService.errorTopRight('Quiz already submitted by the user.');
      }
      else {
        this.notificationService.errorTopRight('Quiz submission failed.');
      }
    });
  }
  closeScreen(): void {
    this.isEnable = true;
  }

  cancel()
  {
    this.router.navigate(['/training-course-manager']);
  }
  onSelectImageFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileType = file.type.toLowerCase();
      const allowedExtensions = ['jpeg', 'png', 'gif'];
      const fileExtension = fileType.split('/').pop();

      if (!allowedExtensions.includes(fileExtension)) {
        this.notificationService.errorTopRight('Please upload a JPEG, PNG, or GIF image');
        input.value = '';
        return;
      }
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrl = reader.result;
        this.imageUpload = true;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  detectCheckboxClick(event) {
    this.selectedUsers = [];
    this.UserDropDownList.forEach((items) => {
      if(items.id === event.id) {
        items['checked'] = !items['checked']
      }
      if(items['checked']) {
        this.selectedUsers.push(items.id)
      }
    })
    this.allSelected = this.selectedUsers.length === this.UserDropDownList.length
    this.CourseForm.controls['userId'].setValue(this.selectedUsers)
  }
  selectAll(event) {
    this.UserDropDownList.forEach((items) => {
      items['checked'] = event.checked;
    })
    if (event.checked) {
      this.selectedUsers = this.filteredUserList.map(item => item.id);
    } else {
      this.selectedUsers = [];
    }
    if(this.searchText === '' || this.searchText === null || this.searchText === undefined) {
      this.allSelected = event.checked
    }
    this.CourseForm.get('userId')?.setValue(this.selectedUsers);
  }


  selectAllCurriculum(event) {
    this.filteredCurriculumList.forEach((items) => {
      items['checked'] = event.checked;
    })
    if (event.checked) {
      this.selectedCurriculums = this.filteredCurriculumList.map(item => item.id);
    } else {
      this.selectedCurriculums = [];
    }
    if(this.searchTextCurriculum === '' || this.searchTextCurriculum === null || this.searchTextCurriculum === undefined) {
      this.allCurriculumSelected = event.checked
    }
    this.CourseForm.get('curriculums')?.setValue(this.selectedCurriculums);
  }

  toggleAllSelection() {
    if (this.selectedUsers.length === this.UserDropDownList.length) {
      this.allSelected = true;
    } else {
      this.allSelected = false;
    }
  }

  onRequireCheckboxChange() {
    if (this.CourseForm.get('required').value === true) {
      this.selectedCurriculums.push(this.requiredElementId);
      this.CourseForm.get('curriculums').setValue(this.selectedCurriculums);
    } else {
      this.selectedCurriculums = this.selectedCurriculums.filter(id => id !== this.requiredElementId);
      this.CourseForm.get('curriculums').setValue(this.selectedCurriculums);
    }
  }

  onCurriculumSelectionChange(event) {
    this.selectedCurriculums = [];
    this.SubGroupData.forEach((items) => {
      if(items.id === event.id) {
        items['checked'] = !items['checked']
      }
      if(items['checked']) {
        this.selectedCurriculums.push(items.id)
      }
    })
    this.allCurriculumSelected = this.selectedCurriculums.length === this.SubGroupData.length
    this.CourseForm.controls['curriculums'].setValue(this.selectedCurriculums)
    if (this.selectedCurriculums.includes(this.requiredElementId)) {
      this.CourseForm.get('required').setValue(true);
    } else {
      this.CourseForm.get('required').setValue(false);
    }
  }

  addQuiz(quizcontent): void {
    this.editExistingQuiz = false;
    this.editMode==false;
   
      this.QuestionsOptions.controls['questionType'].enable();

    this.questionFormType = 'New';
    this.addOption = [];
    this.modalReferences = this.matDialog.open(quizcontent);
    this.QuestionsOptions.reset();
  }

  addNewNote(content, type): void {
    this.previewCourse = type === 'preview' ? true : false;
    if(type === 'preview') {
      const currentUrl = window.location.href;
      let urlArray = currentUrl.split('/');
      const elementsToRemove = ["training-course-manager", "training-course-manager-add-edit"];
      urlArray = urlArray.filter(item => !elementsToRemove.includes(item));
      urlArray.pop();
      sessionStorage.setItem('isPreview', JSON.stringify(true));
      this.service.Getallslides(this.CourseId).subscribe(data => {
        const slides = data;
        if(slides.length === 0) {
          this.notificationService.errorTopRight('No slides have been added to this course yet.')
        } else if(slides[0]?.slideName.includes('Image')) {
          const url = "kohler-studio-Image-course/" + this.CourseId + '/' + slides[0]?.id
          urlArray.push(url);
          const updatedUrl = urlArray.join('/');
          window.open(updatedUrl, '_blank');
          sessionStorage.removeItem('isPreview');
        } else if(slides[0].slideName.includes('Video')) {
          const url = "kohler-studio-course/" + this.CourseId + '/' + slides[0]?.id
          urlArray.push(url);
          const updatedUrl = urlArray.join('/');
          window.open(updatedUrl, '_blank');
          sessionStorage.removeItem('isPreview');
        } else if(slides[0].slideName.includes('Text')) {
          const url = "kohler-studio-text-course/" + this.CourseId + '/' + slides[0]?.id
          urlArray.push(url);
          const updatedUrl = urlArray.join('/');
          window.open(updatedUrl, '_blank');
          sessionStorage.removeItem('isPreview');
        } else if(slides[0].slideName.includes('Audio')) {
          const url = "kohler-studio-part-course/" + this.CourseId + '/' + slides[0]?.id
          urlArray.push(url);
          const updatedUrl = urlArray.join('/');
          window.open(updatedUrl, '_blank');
          sessionStorage.removeItem('isPreview');
        } else if(slides[0].slideName.includes('Quiz')) {
          this.KohlerService.GetAllCourseId(this.CourseId).subscribe(data=>{
            if (data) {
              const url = "kohler-studio-course-quiz/" + data[0]?.id
              urlArray.push(url);
              const updatedUrl = urlArray.join('/');
              window.open(updatedUrl, '_blank');
              sessionStorage.removeItem('isPreview');
            }
          })
        }
      });
    } else {
      this.selectedSlide = null;
      if(this.newSlideCreation) {
        this.newSlideCreation = false;
      }
      this.GetallSlides();
      this.addOption = [];
      this.modalReference = this.matDialog.open(content, { disableClose: true, width: '1000px', height: '600px' });
      this.modalReference.backdropClick().subscribe(() => {
        this.confirmCloseDialog();
      });
    }
  }
  confirmCloseDialog(): void {
    if(this.newSlideCreation) {
      this.closeSlideCreationDialog = this.matDialog.open(this.confirmationDialog);
    } else {
      this.modalReference.close();
    }
  }
  closeSlideCreationDialogWithoutSaving() {
    this.closeSlideCreationDialog.close()
    this.modalReference.close();
  }

  addTaskToNote(event): void {
    event.stopPropagation();
    event.preventDefault();
    const option = this.QuestionsOptions.get('option').value.trim();
    const questionType = this.QuestionsOptions.get('questionType').value;
    if (option && questionType !== 'trueFalse') {
      this.addOption.push({ index: this.addOption.length, selected: false, optionvalue: option });
      this.QuestionsOptions.get('option').reset(); // Clear the input field
    } else if (questionType === 'trueFalse') {
      this.notificationService.errorTopRight('Cannot add custom options for True/False type.');
    } else {
      this.notificationService.errorTopRight('Option cannot be empty.');
    }
  }

  removeTaskFromNoteAdd(item: number): void {
    this.addOption.splice(item, 1);
  }

  disableCheckbox(item): boolean {
    const questionType = this.QuestionsOptions.get('questionType').value;
    if (questionType === 'single' || questionType === 'trueFalse') {
    return this.addOption.some(opt => opt.selected && opt !== item);
    }
    return false;
    }

  onAnswerTypeChange(event): void {
    const questionType = event.value;
    if (questionType === 'single') {
     
    } else if (questionType === 'trueFalse') {
      this.addOption = [
        { index: 0, selected: false, optionvalue: 'True' },
        { index: 1, selected: false, optionvalue: 'False' }
      ];
    }
  }
  SubmitQuestionForm() {
    this.quizDeleteOption = false;
    if (!this.QuestionsOptions.get('question').value || this.QuestionsOptions.get('question').value === '') {
      return this.notificationService.errorTopRight('Please add a question.');
    }
    if (this.QuestionsOptions.invalid) {
      this.notificationService.errorTopRight('Please select the answer type');
      return;
    }
    if (!this.QuestionsOptions.get('questionType').value) {
      return this.notificationService.errorTopRight('Please select how many answers should be correct.');
    }
  
    const courseSessionQuestionOptionBean = this.addOption.map(ele => ({
      correctOption: ele.selected,
      optionName: ele.index,
      questionOptionName: ele.optionvalue,
      id: ele.id
    }));
  
    const isSelected = this.addOption.some(el => el.selected);
    const questionType = this.QuestionsOptions.get('questionType').value;
  
    if (!isSelected) {
      this.notificationService.warningTopRight('Please select at least one correct answer before submitting');
    } else {
      const questionData = {
        courseSessionQuestionOptionBean,
        id: this.QuestionsOptions.get('id').value,
        questionName: this.QuestionsOptions.get('question').value,
        questionType: questionType 
      };
  
      if (this.editExistingQuiz) {
        this.mainBulkArray.push(questionData);
        this.QuestionsData.questionWithOptions[this.questionFormIndex] = {
          label: this.QuestionsOptions.get('question').value,
          options: courseSessionQuestionOptionBean.map(elem => ({
            label: elem.questionOptionName,
            isCorrect: elem.correctOption,
            id: elem.id,
            index: elem.optionName
          })),
          id: this.QuestionsOptions.get('id').value,
          questionType: questionType 
        };
      } else {
        if (this.questionFormType === 'Edit') {
          this.mainBulkArray[this.questionFormIndex] = questionData;
        } else {
          this.mainBulkArray.push(questionData);
          if (this.QuestionsData) {
            this.QuestionsData.questionWithOptions.push({
              id: this.QuestionsOptions.get('id').value,
              index: this.QuestionsData.questionWithOptions.length + 1,
              label: this.QuestionsOptions.get('question').value,
              options: courseSessionQuestionOptionBean.map((elem, i) => ({
                label: elem.questionOptionName,
                isCorrect: elem.correctOption,
                id: elem.id,
                index: i
              })),
              questionType: questionType 
            });
          } else {
            this.QuestionsData = {
              questionWithOptions: [{
                id: this.QuestionsOptions.get('id').value,
                index: 1,
                label: this.QuestionsOptions.get('question').value,
                options: courseSessionQuestionOptionBean.map((elem, i) => ({
                  label: elem.questionOptionName,
                  isCorrect: elem.correctOption,
                  id: elem.id,
                  index: i
                })),
                questionType: questionType 
              }]
            };
          }
        }
      }
  
      this.modalReferences.close();
      this.addOption = [];
      this.isEnable = false;
    }
  }
  submitquestionforms(): void {
    if (!this.QuizSlideId) {
      this.SaveQuizSlide();
      this.saveQuizQuestions();
    } else {
      this.SaveQuizSlide();
      this.saveQuizQuestions();
    }  
  }

  moveUp(index: number): void {
    if (index > 0) {
      const temp = this.QuestionsData.questionWithOptions[index];
      this.QuestionsData.questionWithOptions[index] = this.QuestionsData.questionWithOptions[index - 1];
      this.QuestionsData.questionWithOptions[index - 1] = temp;
    }
  }

  moveDown(index: number): void {
    if (index < this.QuestionsData.questionWithOptions.length - 1) {
      const temp = this.QuestionsData.questionWithOptions[index];
      this.QuestionsData.questionWithOptions[index] = this.QuestionsData.questionWithOptions[index + 1];
      this.QuestionsData.questionWithOptions[index + 1] = temp;
    }
  }
  moveUpSlide(event, index: number, type): void {
    event.stopPropagation();
    if (index > 0) {
      const temp = this.imageSlides[index];
      this.imageSlides[index] = this.imageSlides[index - 1];
      this.imageSlides[index - 1] = temp;
      this.slidesOrderChanged = true
    }
  }

  moveDownSlide(event, index: number, type): void {
    event.stopPropagation();
    if (index < this.imageSlides.length - 1) {
      const temp = this.imageSlides[index];
      this.imageSlides[index] = this.imageSlides[index + 1];
      this.imageSlides[index + 1] = temp;
      this.slidesOrderChanged = true
    }
  }
  initForm() {
    this.QuestionsData.questionWithOptions.forEach(question => {
      this.QuestionsOptions.addControl(question.id, this.fb.group({}));
      this.editedQuestions.push({ ...question });
    });
  }
  deleteQuestionConfirmation() {
    this.service.DeleteQuestion({
      "id": this.quizQuestionId
    }).subscribe((resp) => {
      if(resp.isSuccess) {
        this.notificationService.successTopRight('Question deleted successfully.');
        this.modalReferences.close();
        this.selectSlide(this.selectedSlide);
      } else {
        if (resp?.message === 'already used!') {
          this.notificationService.errorTopRight('Quiz modification is restricted. Users have already started or completed this quiz.');
        } else {
          this.notificationService.errorTopRight('Something went wrong.')
        } 
      }
    })
  }

  deleteQuestion(index: number, model) {
    if (this.QuestionsData?.questionWithOptions?.length <= 1) {
      this.notificationService.errorTopRight('At least 1 question is required in the quiz. To remove the question, please delete the entire slide.');
      return;
    }
    this.quizQuestionId = this.QuestionsData.questionWithOptions[index]?.id
    this.modalReferences = this.matDialog.open(model);
  }
  editQuestion(index: number, quizcontent) {
    this.editMode = true; 
    this.editExistingQuiz = true;
  
    this.addOption = this.QuestionsData.questionWithOptions[index].options.map((ele, i) => ({
      selected: ele.isCorrect,
      index: i,
      optionvalue: ele.label,
      id: ele.id
    }));
  
    const questionData = this.QuestionsData.questionWithOptions[index];
  
    // Update the form controls
    this.QuestionsOptions.controls['question'].setValue(questionData.label);
    this.QuestionsOptions.controls['id'].setValue(questionData.id);
    this.QuestionsOptions.controls['questionType'].setValue(questionData.questionType);
  
    // Disable the questionType control if in edit mode
    if (this.editMode) {
      this.QuestionsOptions.controls['questionType'].disable();
    } else {
      this.QuestionsOptions.controls['questionType'].enable();
    }
  
    this.questionFormType = 'Edit';
    this.questionFormIndex = index;
    this.modalReferences = this.matDialog.open(quizcontent);
    this.questionEditMode = true;
  }
  

  onReady(eventData) {
    eventData.plugins.get('FileRepository').createUploadAdapter = function (loader) {
      return new UploadAdapter(loader);
    };
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