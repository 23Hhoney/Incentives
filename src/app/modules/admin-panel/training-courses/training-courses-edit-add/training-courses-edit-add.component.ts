import { ChangeDetectorRef, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { KohlerStudioService } from 'app/modules/LMS/kohler-studio/kohler-studio.service';
import { NotificationService } from 'app/shared/notification/notification';
import { ActivatedRoute, Router } from '@angular/router';
import { URLService } from 'app/modules/url-service/url.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { checkValidDate, checkValidText } from 'app/shared/validation/validation-utils';
import { catchError, of } from 'rxjs';
import { TrainingCoursesService } from '../training-courses.service';
import { MatSelect, MatSelectChange } from '@angular/material/select';

interface CurriculumItem {
  id: string | number;
  value: string;
  checked?: boolean;
}
@Component({
  selector: 'app-training-courses-edit-add',
  templateUrl: './training-courses-edit-add.component.html',
  styleUrls: ['./training-courses-edit-add.component.scss']
})
export class TrainingCoursesEditAddComponent implements OnInit {
  CourseForm: FormGroup;
  UserDropDownList=[];
  title: any;
  selectedUsers=[];
  selectedCurriculums = [];
  selectedFile: File | null = null;
  imageUrl: string | ArrayBuffer | null = null;
  imageUpload: boolean = false;
  imagesUrl: string = '';
  indexNum:any;
  searchText: string = '';
  searchTextCurriculum: string = '';
  SubGroupData: CurriculumItem[] = [];
  filteredCurriculumList: CurriculumItem[] = [];
  selectedImage = null;
  courseNameExceedsLength: boolean = false;
  languages: string[];
  isSpanishActive: boolean = false;
  isFrenchActive: boolean = false;
  showSpanishVersion: boolean = false;
  showFrenchVersion: boolean = false;
  manageCourseVersions: any[] = [];
  selectedLanguage: string = 'English';

  public editorConfig = {
    toolbar: [
      'redo', 'undo', 
      'heading', 'bold', 'italic', 'strong',
      'blockQuote',
      'unlink', 'imageUpload',
      'insertTable', 'mediaEmbed', 'bulletedList', 'numberedList', 
    ],
  };

  @ViewChild('confirmationDialog') confirmationDialog: TemplateRef<any>;

  todayDate: Date = new Date();
  CourseId: any;
  isEditMode: boolean = false;
  selectedSlide = null;
  IsEdit: boolean = false;
  modalReferences: any;
  showCurriculms = false;
  showUsers = false;
  QuestionType: any;
  imageSlides = [];
  quizSlides = [];
  newSlide = [];
  filteredUserList = []
  courseStatus: any;
  language: any;
  loginUser: string;
  disableCourseFields: boolean;
  requiredElementId: any;
  allCurriculumSelected: boolean;
  isCurriculumReadonly: boolean = false;
  isSavingCourse: boolean;
  allSelected: boolean;
  CourseIdNew: any;
  buttonAction: any;
  showLanguage: boolean;
  showEnglishVersion: boolean;
  data: any;
  panelClass = 'custom-select-panel';
  Tab: any;
  @ViewChild('fileInput') fileInputElement: ElementRef;
  constructor(
    private fb: FormBuilder,
    private service: TrainingCoursesService,
    private KohlerService: KohlerStudioService,
    private notificationService: NotificationService,
    private matDialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private urlService: URLService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {
    this.languages = [];
   }
   ngOnInit() {
    this.loginUser = window.sessionStorage.getItem('email');
    this.CourseId = this.route.snapshot.params['id'];
    this.CourseIdNew = this.route.snapshot.params['ids'];
    
    this.route.queryParams.subscribe((param) => {
      this.Tab = param.tab;
    });
    

    this.route.params.subscribe(params => {
        this.buttonAction = params['buttonAction']; 
        // Update selectedLanguage if it comes in params
        if (params['lang']) {
            this.selectedLanguage = params['lang'];
        }
        this.setupFormBasedOnAction();
    });

    console.log('this.selectedLanguage', this.selectedLanguage);
    this.initializeForms();
    this.GetUserListforDropdown();
    this.loadInitialCurriculumData();
    
    if (this.buttonAction === 'for_edit') {
      this.showLanguage = false;
      this.editData();
    }
    else if (this.buttonAction === 'for_language') {
      this.showLanguage = true;
      this.isEditMode = true;
      this.CourseForm.get('language').enable();
      this.SubGroupData = [];
      this.filteredCurriculumList = [];
      this.selectedCurriculums = [];
      this.CourseForm.get('curriculums').setValue([]);
      
      this.GetAllLanguages();
      this.editData();
      this.disableFieldsForLanguageMode();
    }
    
}
@ViewChild(MatSelect) matSelect: MatSelect;
  

ngAfterViewInit() {
  // Subscribe to the dropdown opening event
  this.matSelect.openedChange.subscribe(opened => {
    if (opened) {
      // When dropdown opens, scroll to top
      setTimeout(() => {
        const panel = document.querySelector('.mat-select-panel');
        if (panel) {
          panel.scrollTop = 0;
        }
      }, 0);
    }
  });
}

loadInitialCurriculumData() {
  const currentLanguage = this.selectedLanguage || 'English';
  this.service.GetAllCiriculum(currentLanguage).subscribe(data => {
      if (data) {
          // Clear existing data first
          this.filteredCurriculumList = [];
          this.SubGroupData = [];
          
          // Create a Set to track unique IDs
          const uniqueIds = new Set();
          
          data.forEach((element) => {
              if (!uniqueIds.has(element.id)) {
                  uniqueIds.add(element.id);
                  
                
                  const curriculumItem = {
                      id: element.id,
                      value: element.value,
                      checked: false
                  };
                  
                  this.SubGroupData.push(curriculumItem);
                  this.filteredCurriculumList.push(curriculumItem);
              }
          });
      }
  });
}
  initializeForms() {
    this.disableCourseFields = false;
    this.CourseForm = this.fb.group({
      courseId: [''],
      courseName: [''],
      curriculums: [],
      startDate: [''],
      endDate: [''],
      active: true,
      inactive: false, 
      archive: false, 
      points: null,
      status: 'active',
      description: [''],
      required: false,
      userId: null,
      language: ['English'],
      isSpanishActive: false, 
      isFrenchActive: false ,
      AutoNewUserCourseAssign:true
    });
  }
  editData() {
    if (this.CourseId) {
        this.service.GetCourseDetail(this.CourseId, this.selectedLanguage).subscribe(data => {
            if (data) {
                this.data = data; // Store the course data
                
                if (data.fileName) {
                    this.selectedImage = data.fileName;
                }
                
                this.language = data.language;
                
                // Handle existing languages
                const existingLanguages = data.manageCourseVersions.map(v => v.language);
                this.service.GetAllLanguages().subscribe(languagesData => {
                    if (this.selectedLanguage === 'English') {
                        this.languages = languagesData
                            .filter(x =>
                                 (x.name === 'French' || x.name === 'Spanish') &&
                                 !existingLanguages.includes(x.name)
                            )
                            .map(x => x.name);
                    } else {
                        this.languages = languagesData
                            .filter(x => !existingLanguages.includes(x.name))
                            .map(x => x.name);
                    }
                });

                // Handle version data
                const spanishVersion = data.manageCourseVersions.find(v => v.language === 'Spanish');
                const frenchVersion = data.manageCourseVersions.find(v => v.language === 'French');

                // Set selected users and curriculums before patching form
                this.selectedUsers = [];
                if (data.classAssigns) {
                    this.selectedUsers = data.classAssigns.map(user => user.userId);
                }

                this.selectedCurriculums = [];
                if (data.courseCurriculumClassAssigns) {
                    this.selectedCurriculums = data.courseCurriculumClassAssigns.map(curr => curr.curriculumId);
                }

                // Patch the form with all the data including required field
                this.CourseForm.patchValue({
                    language: data.language,
                    courseId: data.courseId,
                    courseName: data.name,
                    curriculums: [...this.selectedCurriculums],
                    startDate: data.startDate,
                    endDate: data.endDate,
                    active: data.iActive,
                    points: data.points,
                    description: data.description || '',
                    required: data.required, // This should set the checkbox correctly
                    status: data.status,
                    userId: [...this.selectedUsers],
                    AutoNewUserCourseAssign: data.autoNewUserCourseAssign,
                    isSpanishActive: !!(spanishVersion && spanishVersion.languageVersion),
                    isFrenchActive: !!(frenchVersion && frenchVersion.languageVersion),
                });

                this.courseStatus = data.status;
                this.showSpanishVersion = !!spanishVersion;
                this.showFrenchVersion = !!frenchVersion;

                // Update checkbox states for SubGroupData
                this.SubGroupData.forEach(element => {
                    element.checked = this.selectedCurriculums.includes(element.id);
                });

                this.filteredCurriculumList = this.SubGroupData.map(item => ({
                    ...item,
                    checked: this.selectedCurriculums.includes(item.id)
                }));

                // Update user dropdown states
                this.UserDropDownList.forEach(element => {
                    element.checked = this.selectedUsers.includes(element.id);
                });

                this.disableCourseFields = data.classAssigns?.length > 0;
                this.isEditMode = true;

                // Load curriculum data after setting form values
                this.loadData();
            }
        });
    }
}

loadData() {
    const lang = this.language;
    this.service.GetAllCiriculum(lang).subscribe(data => {
        // Clear previous data
        this.SubGroupData = [];
        this.filteredCurriculumList = [];
        
        if (data) {
            // Process curriculum data
            data.forEach((element) => {               
               
                const item = {
                    id: element.id,
                    value: element.value,
                    checked: this.selectedCurriculums.includes(element.id)
                };
                
                this.SubGroupData.push(item);
                this.filteredCurriculumList.push({...item});
            });
            
            // Update the form control with the selected curriculum values
            this.CourseForm.patchValue({
                curriculums: [...this.selectedCurriculums]
            });
            
           
            if (this.data && this.data.required !== undefined) {
                this.CourseForm.get('required').setValue(this.data.required);
            }
            
            this.allCurriculumSelected = this.selectedCurriculums.length === this.SubGroupData.length;
        
        }
    });
}


onLanguageChange(event: MatSelectChange) {
  const selectedLanguage = event.value;
  const currentCourseId = this.CourseForm.get('courseId').value;
  const currentCourseName = this.CourseForm.get('courseName').value;
  
  // Remove existing language suffixes (SP, FR) at the end of the string
  const baseId = currentCourseId.replace(/_SP$|_FR$/, '');
  const baseName = currentCourseName.replace(/_SP$|_FR$/, '');
  
  // Append the correct suffix
  this.CourseForm.patchValue({
      language: selectedLanguage,
      courseId: selectedLanguage === 'Spanish' ? `${baseId}_SP` :
                selectedLanguage === 'French' ? `${baseId}_FR` :
                baseId,
      courseName: selectedLanguage === 'Spanish' ? `${baseName}_SP` :
                  selectedLanguage === 'French' ? `${baseName}_FR` :
                  baseName
  });
  
  this.language = selectedLanguage;
  const request = {
      courseId: this.CourseIdNew,
      language: selectedLanguage
  };
  
  // Clear existing data
  this.SubGroupData = [];
  this.filteredCurriculumList = [];
  
  this.service.CourseCheckForLanguageForDropDown(request).subscribe(data => {
      if (data && Array.isArray(data) && data.length > 0) {
          this.SubGroupData = data.map(item => ({
              id: item.id,
              value: item.value
          }));
          this.filteredCurriculumList = [...this.SubGroupData];
          
          // Auto-select the curriculums returned from API
          const curriculumIds = data.map(item => item.id);
          this.selectedCurriculums = curriculumIds;
          this.CourseForm.patchValue({ curriculums: curriculumIds });
          
          // Set the allCurriculumSelected flag if all items are selected
          this.allCurriculumSelected = curriculumIds.length === this.SubGroupData.length;
          
          // Make the curriculum dropdown readonly when data is returned from API
          this.isCurriculumReadonly = true;
      } else {
          this.notificationService.warningTopRight("You don't have curriculum created for the selected language ");
          this.SubGroupData = [];
          this.filteredCurriculumList = [];
          this.CourseForm.patchValue({ curriculums: [] });
          this.selectedCurriculums = [];
          this.isCurriculumReadonly = false;
      }
  });
}


filterCurriculumList(searchinput) {
  this.searchTextCurriculum = searchinput;
  const lowerSearchText = searchinput.toLowerCase();
  
  // Create a new filtered list without duplicates
  this.filteredCurriculumList = Array.from(
    new Set(
      this.SubGroupData
        .filter(curriculum => 
          curriculum.value.toLowerCase().includes(lowerSearchText)
        )
        .map(item => JSON.stringify(item))
    )
  ).map(item => ({
    ...JSON.parse(item),
    checked: this.selectedCurriculums.includes(JSON.parse(item).id)
  }));
}
selectAllCurriculum(event) {
  this.filteredCurriculumList.forEach((items) => {
    items['checked'] = event.checked;
  });
  
  if (event.checked) {
    // Get all IDs from filtered list
    const filteredIds = this.filteredCurriculumList.map(item => item.id);
    
    // Merge with existing selections if search is active
    if (this.searchTextCurriculum) {
      this.selectedCurriculums = [...new Set([...this.selectedCurriculums, ...filteredIds])];
    } else {
      this.selectedCurriculums = filteredIds;
    }
  } else {
    if (this.searchTextCurriculum) {
      // Only remove the filtered items if search is active
      const filteredIds = this.filteredCurriculumList.map(item => item.id);
      this.selectedCurriculums = this.selectedCurriculums.filter(id => !filteredIds.includes(id));
    } else {
      this.selectedCurriculums = [];
    }
  }
  
  if (this.searchTextCurriculum === '' || this.searchTextCurriculum === null || this.searchTextCurriculum === undefined) {
    this.allCurriculumSelected = event.checked;
  }
  
  this.CourseForm.get('curriculums')?.setValue(this.selectedCurriculums);
}

// onRequireCheckboxChange() {
//   if (this.CourseForm.get('required').value === true) {
//     if (!this.selectedCurriculums.includes(this.requiredElementId)) {
//       this.selectedCurriculums.push(this.requiredElementId);
      
//       // Update checked state in SubGroupData
//       const requiredItem = this.SubGroupData.find(item => item.id === this.requiredElementId);
//       if (requiredItem) {
//         requiredItem['checked'] = true;
//       }
//     }
//   } else {
//     this.selectedCurriculums = this.selectedCurriculums.filter(id => id !== this.requiredElementId);
    
//     // Update checked state in SubGroupData
//     const requiredItem = this.SubGroupData.find(item => item.id === this.requiredElementId);
//     if (requiredItem) {
//       requiredItem['checked'] = false;
//     }
//   }
  
//   this.CourseForm.get('curriculums').setValue(this.selectedCurriculums);
// }

onCurriculumSelectionChange(event) {
  const item = this.SubGroupData.find(item => item.id === event.value);
  
  if (item) {
    const isCurrentlySelected = this.selectedCurriculums.includes(item.id);
    
    // If it's currently selected and is being unselected
    if (isCurrentlySelected && !event.selected) {
      // Remove from selection
      this.selectedCurriculums = this.selectedCurriculums.filter(id => id !== item.id);
      item['checked'] = false;
      
      // Call API when checkbox is unchecked
      const jsonData = {
        courseCopyId: this.CourseId,
        curriculumId: [item.id]
      };
      
      this.service.GetAllLmsCurriculumMasterAssigned(jsonData).subscribe((data) => {
        if (data.isSuccess) {
          this.notificationService.warningTopRight(data.message);
        } else {
          this.notificationService.errorTopRight(data.message);
        }
      });
    } 
    // If it's not currently selected and is being selected
    else if (!isCurrentlySelected && event.selected) {
      // Add to selection
      this.selectedCurriculums.push(item.id);
      item['checked'] = true;
    }
    
    // Update all items in SubGroupData to match selectedCurriculums
    this.SubGroupData.forEach(sgItem => {
      sgItem['checked'] = this.selectedCurriculums.includes(sgItem.id);
    });
    
    // Update filtered list to match
    this.filteredCurriculumList.forEach(flItem => {
      flItem['checked'] = this.selectedCurriculums.includes(flItem.id);
    });
    
    this.allCurriculumSelected = this.selectedCurriculums.length === this.SubGroupData.length;
    
    // Update form control value
    this.CourseForm.controls['curriculums'].setValue([...this.selectedCurriculums]);
    

  }
}
handleSelectionChange(event: any) {
  // Get the current selection from the form control
  const currentSelection = this.CourseForm.get('curriculums').value || [];
  
  // Compare with previous selection to find what was added or removed
  const previousSelection = [...this.selectedCurriculums];
  
  // Find items that were removed (unselected)
  const removedItems = previousSelection.filter(id => !currentSelection.includes(id));
  
  // Find items that were added (selected)
  const addedItems = currentSelection.filter(id => !previousSelection.includes(id));
  
  // Update the selectedCurriculums array
  this.selectedCurriculums = [...currentSelection];
  
  // Update checked state in SubGroupData and filteredCurriculumList
  this.SubGroupData.forEach(item => {
    item.checked = this.selectedCurriculums.includes(item.id);
  });
  
  this.filteredCurriculumList.forEach(item => {
    item.checked = this.selectedCurriculums.includes(item.id);
  });
  
  // Update allCurriculumSelected flag
  this.allCurriculumSelected = this.selectedCurriculums.length === this.SubGroupData.length;
  
  // Call API for each removed item
  if (removedItems.length > 0) {
    removedItems.forEach(itemId => {
      const jsonData = {
        courseCopyId: this.CourseId,
        curriculumId: [itemId]
      };
      
      this.service.GetAllLmsCurriculumMasterAssigned(jsonData).subscribe((data) => {
        if (data.isSuccess) {
          this.notificationService.warningTopRight(data.message);
        } else {
          //this.notificationService.errorTopRight(data.message);
        }
      });
    });
  }
  
}


  getSubGroupDataName(id) {
    const subGroupDataName = this.SubGroupData.filter(item => item.id === id);
    console.log('subGroupDataName', subGroupDataName);
    
    return subGroupDataName.length > 0 ? subGroupDataName[0].value : null;
}

  private setupFormBasedOnAction() {
    if (this.CourseForm && this.buttonAction === 'for_language') {
      this.CourseForm.get('language').enable();
            Object.keys(this.CourseForm.controls).forEach(key => {
        if (!['courseName', 'description', 'courseImage', 'language'].includes(key)) {
          this.CourseForm.get(key).disable();
        }
      });
    }
  }
  
  GetAllLanguages() {
    this.service.GetAllLanguages().subscribe(data => {
        // Get existing language versions from course data
        const existingLanguages = this.CourseForm.get('manageCourseVersions')?.value?.map(v => v.language) || [];
        
        // Filter out languages that already have versions
        const availableLanguages = data.filter(x => !existingLanguages.includes(x.name));
        
        if (this.selectedLanguage === 'English') {
            // Show only French and Spanish if they don't already exist
            this.languages = availableLanguages
                .filter(x => x.name === 'French' || x.name === 'Spanish')
                .map(x => x.name);
        } else {
            this.languages = availableLanguages.map(x => x.name);
        }
    });
}
onLanguageVersionEdit(language: 'Spanish' | 'French' | 'English') {
  this.language = language;
  this.selectedLanguage = language;
  
  // Update visibility flags
  if (language === 'Spanish') {
      this.showSpanishVersion = false;
      this.showFrenchVersion = true;
  } else if (language === 'French') {
      this.showFrenchVersion = false;
      this.showSpanishVersion = true;
  } else if (language === 'English') {
      this.showSpanishVersion = true;
      this.showFrenchVersion = true;
  }

  this.CourseForm.patchValue({
      language: language
  });

  // Handle field permissions
  if (this.language === 'Spanish' || this.language === 'French') {
      this.disableFieldsForLanguageMode();
  } else {
      const editableFields = ['courseName', 'description', 'courseImage', 'language', 'curriculums'];
      Object.keys(this.CourseForm.controls).forEach(key => {
          const control = this.CourseForm.get(key);
          control.enable();
      });
  }

  // Load data and handle curriculum selection
  this.service.GetCourseDetail(this.CourseId, language).subscribe(data => {
      if (data) {
          // Store curriculum selections from API response
          if (data.courseCurriculumClassAssigns) {
              this.selectedCurriculums = data.courseCurriculumClassAssigns.map(curr => curr.curriculumId);
          }

          // Load curriculum data for the selected language
          this.service.GetAllCiriculum(language).subscribe(curriculumData => {
              if (curriculumData) {
                  this.SubGroupData = curriculumData.map(element => ({
                      id: element.id,
                      value: element.value,
                      checked: this.selectedCurriculums.includes(element.id)
                  }));
                  
                  this.filteredCurriculumList = [...this.SubGroupData];
                  
                  // Update form control with selected curriculums
                  this.CourseForm.patchValue({
                      curriculums: this.selectedCurriculums
                  });
              }
          });

          // Update other form fields
          this.editData();
      }
  });
}



disableFieldsForLanguageMode() {
  const editableFields = ['courseName', 'description', 'courseImage','language','curriculums'];
  
  Object.keys(this.CourseForm.controls).forEach(key => {
    const control = this.CourseForm.get(key);
    if (!editableFields.includes(key)) {
      control.disable();
    } else {
      control.enable();
    }
  });
}
filterUserList(searchinput) {
  this.searchText = searchinput;
  const lowerSearchText = searchinput.toLowerCase();

  this.filteredUserList = this.UserDropDownList.filter(user => {
    return user.value.toLowerCase().includes(lowerSearchText) || this.selectedUsers.includes(user.id);
  });

  this.filteredUserList = this.filteredUserList.map(user => ({
    ...user,
    checked: this.selectedUsers.includes(user.id)
  }));

  setTimeout(() => {
    const panel = document.querySelector('.mat-select-panel');
    if (panel) {
      panel.scrollTop = 0;
    }
  }, 0);
}



GetUserListforDropdown() {
  this.service.GetUserListforDropdown().subscribe(data => {
    if (data) {
      this.UserDropDownList = data.map(element => ({
        id: element.id,
        value: element.value,
        checked: this.selectedUsers.includes(element.id)
      }));
      
      // Initialize filtered list
      this.filteredUserList = [...this.UserDropDownList];
    }
  });
}

detectCheckboxClick(event) {
  const userIndex = this.UserDropDownList.findIndex(item => item.id === event.id);
  
  if (userIndex !== -1) {
    const isChecked = !this.UserDropDownList[userIndex].checked;
    this.UserDropDownList[userIndex].checked = isChecked;
    
    // Update selectedUsers array
    if (isChecked) {
      if (!this.selectedUsers.includes(event.id)) {
        this.selectedUsers = [...this.selectedUsers, event.id];
      }
    } else {
      this.selectedUsers = this.selectedUsers.filter(id => id !== event.id);
    }
    
    // Update filtered list to reflect changes
    this.filteredUserList = this.filteredUserList.map(user => ({
      ...user,
      checked: this.selectedUsers.includes(user.id)
    }));
    
    this.allSelected = this.selectedUsers.length === this.UserDropDownList.length;
    this.CourseForm.get('userId').setValue(this.selectedUsers);
  }
}

selectAll(event) {
  const usersToUpdate = this.searchText 
    ? this.filteredUserList
    : this.UserDropDownList;

  usersToUpdate.forEach(user => {
    user.checked = event.checked;
  });

  if (event.checked) {
    // Add all filtered users while preserving previous selections
    const newSelectedUsers = new Set([...this.selectedUsers, ...usersToUpdate.map(user => user.id)]);
    this.selectedUsers = Array.from(newSelectedUsers);
  } else {
    // Remove only filtered users from the selection
    this.selectedUsers = this.selectedUsers.filter(id => !usersToUpdate.find(user => user.id === id));
  }

  this.allSelected = event.checked && this.selectedUsers.length === this.UserDropDownList.length;
  this.CourseForm.get('userId').setValue(this.selectedUsers);

  // Refresh the filtered list to reflect changes in checkboxes
  this.filterUserList(this.searchText);
}


  toggleAllSelection() {
    if (this.selectedUsers.length === this.UserDropDownList.length) {
      this.allSelected = true;
    } else {
      this.allSelected = false;
    }
  }
  checkCourseNameLength() {
    const courseNameValue = this.CourseForm.get('courseName')?.value || '';
    this.courseNameExceedsLength = courseNameValue.length > 255;
  
    if (this.courseNameExceedsLength) {
      this.notificationService.warningTopRight('Course name exceeded its maximum length of 255 characters.');
    }
  }
  getSelectedUsersName(id: string) {
    const selectedUsersName = this.UserDropDownList.filter(item => item.id === id);
    return selectedUsersName.length > 0 ? selectedUsersName[0].value : null;
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
        
      if (file.type.startsWith('image/')) {
        this.selectedImage = file.name; 
        this.selectedFile = file; 
      } else {
        this.notificationService.errorTopRight('Please upload a valid image file');
        input.value = ''; 
        this.selectedImage = null;
        this.selectedFile = null;
      }
    } else {
      // Handle the case where no file is selected
      this.selectedImage = null;
      this.selectedFile = null;
    }
  }
  
  
  
  removeFile(): void {
    this.selectedImage = null;
    this.selectedFile = null;
    
    // Reset the file input element to ensure the change event fires again
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
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
  convertToUTC(date: string): string {
    if (!date) return '';
  
    // If the date is already in ISO format, return it as UTC
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
        return new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000).toISOString();
    }
  
    // If it's in YYYY-MM-DD format, convert it to UTC at midnight
    if (date.length === 10) {
        const [year, month, day] = date.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day, 0, 0, 0)).toISOString();
    }
  
    return '';
  }
  enforceIntegerPoints(event: Event) {
    const input = event.target as HTMLInputElement;
  
    // Remove decimal part
    if (input.value.includes('.')) {
      input.value = input.value.split('.')[0];
    }
  
    let value = parseInt(input.value, 10);
  
    if (isNaN(value) || value < 0) {
      input.value = '';
      this.CourseForm.get('points')?.setValue(null);
    } 
  }
  
      
  SaveOrupdateCourse() {
    const pointsValue = this.CourseForm.get('points').value;
    if (pointsValue !== null && pointsValue !== '') {
      const intPoints = Math.floor(Number(pointsValue));
      this.CourseForm.get('points').setValue(intPoints);
    }
  
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
  
    const startDate = this.convertToUTC(formStartDate);
    const endDate = this.convertToUTC(formEndDate);
  
    // Date validations
    if (!startDate || !this.isValidDate(startDate)) {
      this.notificationService.errorTopRight('Please enter a valid start date');
      return;
    }
  
    if (endDate && !this.isValidDate(endDate)) {
      this.notificationService.errorTopRight('Please enter a valid end date');
      return;
    }
  
    if (new Date(startDate) > new Date(endDate)) {
      this.notificationService.errorTopRight('Start date cannot be later than end date. Please enter valid dates');
      return;
    }
  
    const formData = new FormData();
    
   const currentLanguage = this.CourseForm.get('language').value;
    
  formData.append('id', this.data?.id || '');
  formData.append('courseCopyId', this.data?.courseCopyId || '');
  formData.append('language', currentLanguage);
  
  const mainLanguageVersion = currentLanguage === 'English' ? 'true' : 'false';
  formData.append('languageVersion', mainLanguageVersion);
    formData.append('name', this.CourseForm.get('courseName').value);
    formData.append('courseId', this.CourseForm.get('courseId').value);
    formData.append('description', this.CourseForm.get('description').value || '');
    formData.append('points', this.CourseForm.get('points').value);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    formData.append('required', this.CourseForm.get('required').value);
    formData.append('iActive', this.CourseForm.get('active').value);
    formData.append('createdById', this.loginUser);
    formData.append('modifiedById', this.loginUser);
    formData.append('status', this.CourseForm.get('status').value);
    formData.append('AutoNewUserCourseAssign', this.CourseForm.get('AutoNewUserCourseAssign').value);
  
    const curriculums = this.CourseForm.get('curriculums').value;
    if (curriculums && curriculums.length > 0) {
      curriculums.forEach((curriculum, index) => {
        if (curriculum) {
          formData.append(`lmsCourseCurriculumViewModels[${index}][curriculumMasterId]`, curriculum);
        }
      });
    }
  
    // Course user assignments
    selectedUsers.forEach((user, index) => {
      formData.append(`lmscourseAssignViewModels[${index}][userId]`, user.userId);
    });
  
    const manageCourseVersions: any[] = [];
    manageCourseVersions.push({
      id: this.data?.manageCourseVersions.find(v => v.language === "English")?.id || this.data?.id || '',
      languageVersion: true,
      language: "English",
    });
  
    const isSpanishActive = this.CourseForm.get('isSpanishActive')?.value;
    const spanishVersion = this.data?.manageCourseVersions?.find(v => v.language === "Spanish");
    const isFrenchActive = this.CourseForm.get('isFrenchActive')?.value;
    const frenchVersion = this.data?.manageCourseVersions?.find(v => v.language === "French");
  
    if (spanishVersion ) {
      manageCourseVersions.push({
        id: spanishVersion.id,
        languageVersion: this.CourseForm.get('isSpanishActive').value,
        language: "Spanish",
      });
    }
  
    if (frenchVersion ) {
      manageCourseVersions.push({
        id: frenchVersion.id,
        languageVersion: this.CourseForm.get('isFrenchActive').value,
        language: "French",
      });
    }
  
    console.log('Final manageCourseVersions:', manageCourseVersions);
    manageCourseVersions.forEach((version, index) => {
      formData.append(`manageCourseVersions[${index}][id]`, version.id || '');
      formData.append(`manageCourseVersions[${index}][languageVersion]`, version.languageVersion.toString());
      formData.append(`manageCourseVersions[${index}][language]`, version.language);
    });
  
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }
  
    // Check if users are selected to determine if we need the IsUpdateUser parameter
    const hasSelectedUsers = selectedUsers && selectedUsers.length > 0;
  
    this.isSavingCourse = true;
    this.service.SaveOrUpdateCourse(formData, hasSelectedUsers).subscribe(data => {
      if (data.isSuccess) {
        this.notificationService.successTopRight(data.message);
        this.service.updateTab(this.Tab);
        this.router.navigate(['/training-courses']);
      } else {
        this.notificationService.errorTopRight(data.message);
        this.isSavingCourse = false;
      }
    });
  }
  
        
  checkvalidation(): boolean {
    if (this.buttonAction === 'for_language' && this.CourseForm.get('language').value === 'English') {
      this.notificationService.errorTopRight('Please Select a Language');
      return false;
    }
    else if (!checkValidText(this.CourseForm.get('courseId').value)) {
      this.notificationService.errorTopRight('Please Fill Course Id');
      return false;
    }
    else if (!checkValidText(this.CourseForm.get('courseName').value+'')) {
      this.notificationService.errorTopRight('Please Fill Course Name');
      return false;
    }
    
    const selectedCurriculums = this.CourseForm.get('curriculums').value;
    if (!selectedCurriculums || selectedCurriculums.length === 0) {
      this.notificationService.errorTopRight('Please Select at least one Curriculum');
      return false;
    }
    if (!this.filteredCurriculumList.some(curr => selectedCurriculums.includes(curr.id))) {
      this.notificationService.errorTopRight('Please Select at least one Curriculum');
      return false;
    }
    else if (!this.CourseForm.get('userId').value || this.CourseForm.get('userId').value.length === 0) {
      this.notificationService.errorTopRight('Please Select User');
      return false;
    }
    else if (this.CourseForm.get('points').value === null || this.CourseForm.get('points').value === '') {
      this.notificationService.errorTopRight('Please fill Points');
      return false;
    }
    // else if (!Number.isInteger(Number(this.CourseForm.get('points').value))) {
    //   this.notificationService.errorTopRight('Points cannot exceed 100. Please enter a valid value.');
    //   return false;
    // }
    // else if (Number(this.CourseForm.get('points').value) < 0 || Number(this.CourseForm.get('points').value) > 100000) {
    //   this.notificationService.errorTopRight('Points must be between 0 and 100. Please enter a valid value.');
    //   return false;
    // }
    else if (!checkValidText(this.CourseForm.get('startDate').value+'')) {
      this.notificationService.errorTopRight('Please Fill Start Date');
      return false;
    }
    else if (!this.CourseForm.get('endDate').value || String(this.CourseForm.get('endDate').value).trim() === '') {
      this.notificationService.errorTopRight('Please Fill End Date');
      return false;
    }
    const isActiveSelected = this.CourseForm.get('active').value;
    const isInactiveSelected = this.CourseForm.get('inactive').value;
    const isArchiveSelected = this.CourseForm.get('archive').value;

    if (!isActiveSelected && !isInactiveSelected && !isArchiveSelected) {
      this.notificationService.errorTopRight('At least one of Active, Inactive, or Archive must be selected.');
      return false;
    }
    else {
      return true;
    }
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
  cancel()
  {
    this.service.updateTab(this.Tab);
    this.router.navigate(['/training-courses']);
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

  routeToEditor(isEdit: boolean = false) {
    const courseIdToUse = this.data?.manageCourseVersions?.find(
        version => version.language === this.selectedLanguage
    )?.courseId || this.data.id;
    
    this.router.navigate([
        '/training-courses/training-courses-editor',
        this.data.courseCopyId,
        this.selectedLanguage,
        courseIdToUse,
        this.buttonAction,
        isEdit.toString()
    ]);
}

  GoToPreview() {
    sessionStorage.setItem('isPreview', JSON.stringify(true));
    
    const courseIdToUse = this.data?.manageCourseVersions?.find(
      version => version.language === this.selectedLanguage
    )?.courseId || this.data.id;
    
    this.service.GetallslidesData(courseIdToUse, this.selectedLanguage).subscribe(
      (slides: any) => {
        try {
          const sortedSlides = slides.sort((a: any, b: any) => a.indexNum - b.indexNum);
          const firstSlide = sortedSlides[0];
          
          if (firstSlide) {
            const baseUrl = window.location.origin;
            
            // Add preview=true parameter to the URL
            const urlPath = `kohler-studio-course/${firstSlide.slideId}/${courseIdToUse}/${this.selectedLanguage}`;
            const fullUrl = `${baseUrl}/Admin/${urlPath}?preview=true`;
            
            console.log('Preview URL:', fullUrl);
            
            const newWindow = window.open(fullUrl, '_blank');
            if (!newWindow) {
              console.warn('Popup blocked, trying alternative navigation');
              window.location.href = fullUrl;
            }
            
            sessionStorage.removeItem('isPreview');
          } else {
            this.checkAndNavigateToQuizInNewTab(courseIdToUse);
          }
        } catch (error) {
          console.error('Error in GoToPreview:', error);
          this.notificationService.errorTopRight('Error navigating to preview. Please try again.');
          sessionStorage.removeItem('isPreview');
        }
      },
      (error) => {
        console.error('Error fetching slides:', error);
        this.notificationService.errorTopRight('Error fetching slides. Please try again.');
        sessionStorage.removeItem('isPreview');
      }
    );
  }
  
  checkAndNavigateToQuizInNewTab(courseId: string) {
    sessionStorage.setItem('isPreview', JSON.stringify(true));
    
    this.service.GetQuizDataByCourse(courseId).subscribe(
      (quizData: any) => {
        try {
          if (quizData && quizData.questionWithOptions?.length > 0) {
            const baseUrl = window.location.origin;
            
            const urlPath = `kohler-studio-course-quiz/${courseId}`;
            
            const fullUrl = `${baseUrl}/Admin/${urlPath}?preview=true`;
            
            console.log('Quiz URL:', fullUrl); 
            
            // Open in new tab
            const newWindow = window.open(fullUrl, '_blank');
            if (!newWindow) {
              console.warn('Popup blocked, trying alternative navigation');
              window.location.href = fullUrl;
            }
            
            sessionStorage.removeItem('isPreview');
          } else {
            this.notificationService.errorTopRight('No slides or quiz available for this course.');
            sessionStorage.removeItem('isPreview');
          }
        } catch (error) {
          console.error('Error in checkAndNavigateToQuizInNewTab:', error);
          this.notificationService.errorTopRight('Error navigating to quiz. Please try again.');
          sessionStorage.removeItem('isPreview');
        }
      },
      (error) => {
        console.error('Error fetching quiz data:', error);
        this.notificationService.errorTopRight('Error fetching quiz data. Please try again.');
        sessionStorage.removeItem('isPreview');
      }
    );
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