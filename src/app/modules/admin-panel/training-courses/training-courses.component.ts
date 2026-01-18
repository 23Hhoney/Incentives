import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { COLUMN_TYPE, DataGridColumnHeader } from 'app/shared/component/data-grid/data-grid.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NotificationService } from 'app/shared/notification/notification';
import { ExportExcelService } from 'app/modules/pages/excel-export-service.service';
import { catchError, of } from 'rxjs';
import { TrainingCoursesService } from './training-courses.service';
import { checkValidText } from 'app/shared/validation/validation-utils';
import moment from 'moment';
import { FilterService } from 'app/shared/component/filter/filter.service';
@Component({
  selector: 'app-training-courses',
  templateUrl: './training-courses.component.html',
  styleUrls: ['./training-courses.component.scss']
})
export class TrainingCoursesComponent extends FilterService {
  loading:boolean=false
  gridColumns: DataGridColumnHeader[];
  columnType = COLUMN_TYPE;
  deletelement = null;
  currentPage = 1;
  showUsers = false;
  popUpDetails = null;
  CourseForm : FormGroup;
  slides = [];
  allSelected: boolean = false;
  imageSlideData = [];
  textSlideData = [];
  audioSlideData = [];
  videoSlideData = [];
  quizSlideData = [];
  @ViewChild('courseContent') courseContent: TemplateRef<any>;
  @ViewChild('duplicateCourse') duplicateCourse: TemplateRef<any>;
  selectedTab = 'Active'
  selectedTabIndex = 0;
  selectedCourseList = [];
  PassCourse: any;
  UserDropDownList= [];
  filteredUserList = [];
  selectedUsers = [];
  selectedCourses = [];
  searchText: string = '';
  CourseName: any;
  courseElement= null;
  duplicateCourseForm: FormGroup;
  event: { pageIndex: number; pageSize: number; };
  sortBy = '';
  modalReference: any;
  sortDirection = '';
  totalRecords = 0;
  formFilter: FormGroup;
  courseContentPopUp: any;
  courseDuplicatePopUp: any;
  uploadResult: any = null;
  dataSource = [];
  pages: number[] = [];
  slidesData = [];
  apiRequest = {
    itemCount: 25,
    pageIndex: 1,
    sortBy: "createDate",
    search: "",
    sortDirection: "desc",
    filter: []
  };

  totalPages: number;
  modelRefForDuplicate: any;
  courseCopyIdDuplicate: any;
  languages: string[] = [];
  selectedLanguage: string = 'English'; // Default selection
  fileName: string | null = null;
  FileId: any;
  showDropBox = true;
  private file: File | null = null;
  showViewReportButton = false;
  showCreateViewReportButton = false;
  gridColumnsBulkRedemption: DataGridColumnHeader[];
  dataSourceUpdateBulkRedemption = [];
  bulkUpdateRedemptionLoading = false;
  BulkUpdateRedemptionPages: number[] = [];
  currentPageBulkUpdateRedemption = 1;
  totalPagesBulkUpdateRedemption: number;
  totalRecordsBulkUpdateRedemption = 0;
  sortByBulkUpdateRedemption = '';
  sortDirectionBulkUpdateRedemption = '';
shouldRedirectToEdit: any = null;

  bulkUpdateRedemptionApiRequest = {
    itemCount: 25,
    pageIndex: 1,
    pageLimit: 10,
    sortBy: "createdDateTime",
    search: "",
    sortDirection: "desc",
    objectName: "AutoPassTrainingCoursesImport",
    filter: []
  };
  isFilterSubmitted: boolean = false;
  filterApplied: boolean;
  appliedFilters: any[] = []; // Initialize as an empty array
  filterOptions: any[];
  selectedIndex: number;
  courseSlideData: any;
  constructor(private router: Router,
    private service: TrainingCoursesService,
    private _formGroup: FormBuilder,
    private _matDialog: MatDialog,
    private modalService: BsModalService,
    private _notificationService:NotificationService,
    private exportExcelService: ExportExcelService
  ) {
    super()
  }
  defaultTabIndex = 0;
  ngOnInit(): void {
    this.gridColumns = this.getGridSettings();
    this.selectedTab = this.service.helper.tab;
    if(!this.selectedTab) {
      this.selectedTab = 'Active';
    }
    this.setTabIndex();
    this.GetCoursePaginated();
    this.CourseInitializeform();
    this.gridColumnsBulkRedemption = this.getGridSettingsBulkRedemption();

  }
  setTabIndex() { switch (this.service.helper.tab)
     {
     case 'Inactive': this.defaultTabIndex = 1; break; case 'Archive': this.defaultTabIndex = 2; break; default: this.defaultTabIndex = 0; } }

  CourseInitializeform() {
    this.CourseForm = this._formGroup.group({
      courseId: null,
      userId: null,
      language: null
    });
  }
  getGridSettings(): DataGridColumnHeader[] {
    return [
      {
        columnName: '#',
        columnTitleKey: '',
        columnValue: '',
        type: this.columnType.CHECKBOX,
        show: true,
        sort: false
      },
      {
        columnName: 'name',
        columnTitleKey: 'Course Name',
        columnValue: 'name',
        type: this.columnType.TEXT_W_ELLIP_L,
        show: true,
        sort: true,
      },
      {
        columnName: 'requiredStr',
        columnTitleKey: 'Required',
        columnValue: 'requiredStr',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      },
      {
        columnName: 'curriculumNames',
        columnTitleKey: 'Curriculum',
        columnValue: 'curriculumNames',
        type: this.columnType.TEXT_W_ELLIP,
        show: true,
        sort: false,  // Change to true if sorting is needed
      },

      {
        columnName: 'startDate',
        columnTitleKey: 'Start Date',
        columnValue: 'startDate',
        type: this.columnType.DATE,
        show: true,
        sort: true,
      },
      {
        columnName: 'endDate',
        columnTitleKey: 'End Date',
        columnValue: 'endDate',
        type: this.columnType.DATE,
        show: true,
        sort: true,
      },
      {
        columnName: 'action',
        columnTitleKey: 'Actions',
        columnValue: 'id',
        type: this.columnType.POPOVER,
        buttonArray: true,
        headerClass: 'width-150px',
        buttons: [
          {
            buttonAction: 'for_archive',
            icon: 'archive',
            tooltipKey: this.selectedTabIndex === 2 ? 'Unarchive' : 'Archive',
            buttonClass: 'btn-color-600',
          },
          {
            buttonAction: 'for_duplicate',
            icon: 'duplicate',
            tooltipKey: 'Duplicate',
            buttonClass: 'btn-color-600'
          },
          {
            buttonAction: 'for_language',
            icon: 'language',
            tooltipKey: 'Create Language',
            buttonClass: 'btn-color-600'
          },
          {
            buttonAction: 'for_edit',
            icon: 'edit',
            tooltipKey: 'Edit',
            buttonClass: 'btn-color-600'
          },
          {
            buttonAction: 'for_courseContent',
            icon: 'list',
            tooltipKey: 'Course Content',
            buttonClass: 'btn-color-600'
          },
          {
            buttonAction: 'for_gradebook',
            icon: 'book',
            tooltipKey: 'Grade Book ',
            buttonClass: 'btn-color-600',
          }
        ],
        show: true,
        sort: false,
      }
    ]
  }
  getGridSettingsBulkRedemption(): DataGridColumnHeader[] {
    return [
      { columnName: 'File Name', columnTitleKey: 'File Name', columnValue: 'fileName', type: this.columnType.TEXT, show: true, sort: true },
      { columnName: 'Status', columnTitleKey: 'Status', columnValue: 'status', type: this.columnType.Status, show: true, sort: true },
      { columnName: 'Date Uploaded', columnTitleKey: 'Date Uploaded', columnValue: 'createdDateTime', type: this.columnType.TEXT, show: true, sort: true },
      { columnName: 'Date Processed', columnTitleKey: 'Date Processed', columnValue: 'dateProcessed', type: this.columnType.TEXT, show: true, sort: true },

      {
        columnName: 'action',
        columnTitleKey: 'Download',
        columnValue: 'id',
        type: this.columnType.BUTTON,
        buttonArray: true,
        headerClass: 'width-150px',
        buttons: [
          {
            buttonAction: 'for_edit',
            icon: 'download',
            tooltipKey: 'download',
            buttonClass: 'btn-color-600',

          },
        ],
        show: true,
        sort: false,
      }
    ];
  }

  handleCheckBoxClick(event) {
    this.selectedCourseList = event.checkedList;
  }

  handleBulkGradeBookDownload() {
    const payload = { ids: [] }
    this.selectedCourseList.map((item) => {
      payload.ids.push(item.courseCopyId);
    })
    this.downloadGradeBookData(payload);
  }
  DownloadActiveCourses() {
    this.service.GetAllActiveCourse().subscribe(data => {
      if (data.length === 0) {
        this._notificationService.errorTopRight('No records found.');
      }
      const exportdata: any[] = this.getExportActiveCourseData(data);

      if (exportdata && exportdata.length > 0) {
        this.exportExcelService.exportAsExcelFile(exportdata, 'ActiveCourses');
      }
    })
  }
  handleButtonClick(event, content) {
    if (event.buttonAction === 'for_edit') {
      this.editdialog(event.item.courseCopyId, event.item.language, event.item.id, event.buttonAction);
    }
    else if (event.buttonAction === 'for_language') {
      // Check if all three languages exist
      if (event.item.languages &&
        event.item.languages.includes('English') &&
        event.item.languages.includes('Spanish') &&
        event.item.languages.includes('French')) {
        this._notificationService.errorTopRight('All three language versions are created');
        return;
      }
      this.editdialog(event.item.courseCopyId, event.item.language, event.item.id, event.buttonAction);
    }
    else if (event.buttonAction === 'for_archive') {
      if (event.item?.status && event.item?.status?.toLowerCase() === 'archive') {
        this.popUpDetails = {
          caps: 'Unarchive',
          small: 'undo archive',
          modalMessage: 'Are you sure, you want to Unarchive?'
        };
      } else {
        this.popUpDetails = {
          caps: 'Archive',
          small: 'archive',
          modalMessage: 'Are you sure, you want to Archive?'
        };
      }
      this.openDeletePopUp(event.item, content);
    }
    else if (event.buttonAction === 'for_duplicate') {
      this.courseCopyIdDuplicate = event.item.courseCopyId;
      this.openCourseDuplicate(this.duplicateCourse)
      /*
      this.service.CopyCourses(payload).subscribe(data => {
        if (data.isSuccess === true) {
          this._notificationService.successTopRight(data.message);
          this.GetCoursePaginated();
        }
        this._notificationService.errorTopRight(data.message);
      }) */
    }
    else if (event.buttonAction === 'for_gradebook') {
      const payload = { ids: [event.item.courseCopyId] }
      this.downloadGradeBookData(payload);
    } else if (event.buttonAction === 'for_courseContent') {
      this.courseCopyIdDuplicate = event.item.courseCopyId;
      this.imageSlideData = [];
      this.textSlideData = [];
      this.audioSlideData = [];
      this.videoSlideData = [];
      this.quizSlideData = [];
      this.GetallSlides(event.item.id);
      
      // Open in new tab
      const baseUrl = window.location.origin;

      const urlPath = `course-content-dialog/${event.item.courseCopyId}`;
      const fullUrl = `${baseUrl}/Admin/${urlPath}`;
       window.open(fullUrl, '_blank');
      // const url = this.router.serializeUrl(
      //   this.router.createUrlTree(['/course-content-dialog', event.item.courseCopyId])
      // );
      // window.open(url, '_blank');
    }

  }
  editdialog(event, lang, ids, buttonAction) {
    this.router.navigate(['/training-courses/training-courses-edit-add/' + event + '/' + lang + '/' + ids + '/' + buttonAction], { queryParams: { tab: this.selectedTab } })
  }
duplicateCourseFun() {
  if (!checkValidText(this.duplicateCourseForm.get('courseId').value)) {
    this._notificationService.errorTopRight('Please Fill Course Id');
    return;
  }
  
  const courseCopyId = this.courseCopyIdDuplicate;
  const courseId = this.duplicateCourseForm.get('courseId').value;
  const payload = {
    copyId: courseCopyId,
    courseId: courseId
  }
  
  this.service.CopyCourses(payload).subscribe(data => {
    if (data.isSuccess === true) {
      this._notificationService.successTopRight(data.message);
      this.courseDuplicatePopUp.close();
      
      // Switch to Inactive tab first (index 1)
      this.defaultTabIndex = 1;
      this.selectedTab = 'Inactive'; // or whatever value represents inactive tab
      
      // Refresh the data and then redirect to edit
      this.GetCoursePaginated();
      
      // After data is loaded, find and edit the newly created course
      // You'll need to modify GetCoursePaginated to handle this
      this.shouldRedirectToEdit = {
        courseId: courseId,
        originalCourseCopyId: courseCopyId
      };
    } else {
      this._notificationService.errorTopRight(data.message);
    }
  });
}

  handleRowClick(event) {

  }
  updateTrainingCourseTemplate(): void {
    const columnNames = ['UserID', 'CourseID']
    this.exportToExcel(columnNames)
  }
  exportToExcel(columnNames): void {
    const csvContent = columnNames.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'Demo Template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
  onTabChanged(event) {
    this.selectedTabIndex = event.index
    this.gridColumns = this.getGridSettings();
    this.selectedTab = event.tab.textLabel;
    this.apiRequest.pageIndex = 1;
    this.currentPage = 1;
    this.selectedCourseList = [];
    this.GetCoursePaginated();
  }
  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalRecords / this.apiRequest.itemCount);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  onPageChange(pageIndex: number) {
    if (pageIndex < 1 || pageIndex > this.totalPages) return;
    this.apiRequest.pageIndex = pageIndex;
    this.currentPage = pageIndex;
    this.GetCoursePaginated();
  }

  changePageCount(event) {
    this.apiRequest.itemCount = event;
    this.currentPage === 1
    this.GetCoursePaginated();
  }

  handleSortChange(event) {
    this.sortBy = event.active;
    this.sortDirection = event.direction;

    this.apiRequest.sortBy = this.sortBy;
    this.apiRequest.sortDirection = this.sortDirection.toLowerCase();

    this.GetCoursePaginated();
  }
  AddCourse() {
    this.router.navigate(['/training-courses/training-courses-edit-add'], { queryParams: { tab: this.selectedTab } });
  }

  languageNameToCode(language: string): string {
    const mappings: { [key: string]: string } = {
      'English': 'EN',
      'Spanish': 'SP',
      'French': 'FR'
    };
    return mappings[language] || language;
  }
GetCoursePaginated() {
  this.dataSource = [];
  this.loading = true;
  if (this.appliedFilters && this.appliedFilters.length > 0) {
    this.apiRequest.filter = this.appliedFilters;
  } else {
    this.apiRequest.filter = [];
  }
  
  this.service.GetCoursesPaginated(this.apiRequest, this.selectedTab).subscribe(data => {
    if (data && data.results) {
      this.dataSource = data.results.map(course => {
        // Create a map of language to its version status
        const languageVersionMap = {};
        // Populate the map from manageCourseVersions
        if (course.manageCourseVersions && course.manageCourseVersions.length > 0) {
          course.manageCourseVersions.forEach(version => {
            languageVersionMap[version.language] = version.languageVersion;
          });
        }
        // Format language codes with asterisk for active versions
        const formattedLanguages = course.languages.map(lang => {
          const code = this.languageNameToCode(lang);
          return languageVersionMap[lang] ? `${code}*` : code;
        }).join(', ');
        
        return {
          ...course,
          name: `${course.name} (${formattedLanguages})`,
          curriculumNames: course.courseCurriculumClassAssigns
            ? course.courseCurriculumClassAssigns.map(curriculum => curriculum.curriculumName).join(', ')
            : 'N/A'
        };
      });
      
      this.totalRecords = data.totalRecords;
      this.calculateTotalPages();
      
      // Handle redirection to edit after duplication
      if (this.shouldRedirectToEdit) {
        const newCourse = this.dataSource.find(course => 
          course.courseId === this.shouldRedirectToEdit.courseId
        );
        
        if (newCourse) {
          // Redirect to edit the newly created course
          setTimeout(() => {
            this.editdialog(newCourse.courseCopyId, newCourse.language, newCourse.id, 'for_edit');
          }, 100);
        }
        
        // Clear the redirect flag
        this.shouldRedirectToEdit = null;
      }
    }
    this.loading = false;
  });
}



  openDeletePopUp(element: any, content: TemplateRef<any>) {
    console.log('element', element)
    this.deletelement = element;
    this.CourseName = element.name;
    this.modalReference = this._matDialog.open(content, {
      data: { elementId: this.deletelement }
    });
  }
  openCourseContent(content: TemplateRef<any>) {
    this.courseContentPopUp = this._matDialog.open(content, {
      width: '800px',
      maxHeight: '90vh',
      data: { elementId: this.deletelement },
      panelClass: 'custom-dialog-container'
    });

    this.GetAllLanguages();

    if (this.selectedLanguage) {
      this.onLanguageChange({ value: this.selectedLanguage });
    }
  }

  onLanguageChange(event: { value: string }) {
    if (!event.value) return;

    this.service.GetLmsCourseQuizQuestionBy(this.courseCopyIdDuplicate, event.value)
      .subscribe({
        next: (data) => {
          this.quizSlideData = {
            ...data.courseQuizPassingConfig,
            questions: data.questionWithOptions
          };
        },
        error: (error) => {
          console.error('Error fetching quiz data:', error);
        }
      });

    this.service.GetAllLmsSlideDataByLanguage(this.courseCopyIdDuplicate, event.value)
      .subscribe({
        next: (data) => {
          this.courseSlideData = data;
        },
        error: (error) => {
          console.error('Error fetching quiz data:', error);
        }
      });
    console.log("=========jhhhh===", this.courseSlideData);

  }
  openCourseDuplicate(content: TemplateRef<any>) {
    this.courseDuplicatePopUp = this._matDialog.open(content, {
      data: { elementId: this.deletelement },
      width: '400px'
    });
    this.duplicateCourseForm = this._formGroup.group({
      courseId: ['']
    });
  }
  ArchieveCourse(type) {
    const duplicateCheckObject = {
      course: this.CourseName,
      list: this.popUpDetails.caps === 'Unarchive' ? 'Archive' : 'Active',
      status: this.popUpDetails.caps === 'Unarchive' ? 'Active' : 'Archive'
    };

    this.service.CheckDuplicateArchieveCourse(duplicateCheckObject).subscribe(data => {
      if (data.isSuccess) {
        const archiveRequest = {
          id: this.deletelement.courseCopyId,
          status: type === 'undo archive' ? false : true
        };

        this.service.CourseArchive(archiveRequest).subscribe(response => {
          if (response.isSuccess) {
            const successMessage = type === 'undo archive' ? 'Unarchived Successfully' : 'Archived Successfully';
            this._notificationService.successTopRight(successMessage);
            this.GetCoursePaginated();
          } else {
            this._notificationService.errorTopRight('Internal system error.');
          }
        });
      } else {
        this._notificationService.errorTopRight('Course Name Already Exists');
      }
    });
  }

  ApplySearch(searchValue: string, inputElement: HTMLInputElement) {
    if (searchValue === '') {
      inputElement.value = '';
    }
    this.loading = true;
    searchValue = searchValue.trim();
    searchValue = searchValue.toLowerCase();
    this.apiRequest.search = searchValue;
    this.GetCoursePaginated();
  }

  GetAllLanguages() {
    this.service.GetAllLanguages().subscribe(data => {
      this.languages = data.map(x => x.name);
      if (this.languages.includes('English')) {
        this.selectedLanguage = 'English';
      } else {
        this.selectedLanguage = this.languages.length > 0 ? this.languages[0] : '';
      }
    });
  }

  downloadGradeBookData(payload) {
    this.service.DownloadGradeBookData(payload).subscribe(data => {
      if (data.length === 0) {
        this._notificationService.errorTopRight('No records found.');
      }
      const exportdata: any[] = this.getExportData(data);

      if (exportdata && exportdata.length > 0) {
        this.exportExcelService.exportAsExcelFile(exportdata, 'GradeBook');
      }
    })
  }
  getExportActiveCourseData(result: any[]): any[] {
    const data: any[] = [];
    if (result && result.length > 0) {
      result.forEach(element => {
        data.push({
          'Course ID': element.courseId,
          'Name': element.name


        });
      });

    }
    return data;
  }
  getExportData(result: any[]): any[] {
    const data: any[] = [];
    if (result && result.length > 0) {
      result.forEach(element => {
        data.push({
          "Curriculum": element.curriculum,
          "Course Id ": element.courseId,
          'Course Name': element.course,
          'Language Used': element.languageUsed,
          'User ID': element.bpNumber,
          'First Name': element.firstName,
          'Last Name': element.lastName,
          'Email': element.email,
          'Exam Status': element.passed,
          'Course Required': element.courseRequired,
          'Passed Date': element.passingDate,
          'Passing Percentage': element.passMark,
          'Percentage Obtained': element.obtainMarksPer,
          "Correct Answers": element.obtainMarks,
          'Credit Rewards': element.cRewards,
          'Affiliate Name': element.affiliateName,
          'Portal Name': element.company,
          'Tier Name': element.tierName,
          "Assigned ": element.currentCourseAssign,
        });
      });

    }
    return data;
  }

  AutomaticallyPassCourse(PassTrainingCourse) {
    this.PassCourse = this._matDialog.open(PassTrainingCourse, {
      width: '900px'
    });
    this.GetUserListforDropdown();
    this.getuserData();
    this.ImportUpdateHistoryPaginated();
  }

  AutomaticallyPassCourseForBpNumberFun() {
    const courseId = this.CourseForm.get('courseId').value;
    const userIds = this.CourseForm.get('userId').value;

    const payload = userIds;
    this.service.AutomaticallyPassCourseForBpNumberFun(payload, courseId).subscribe(response => {
      if (response.isSuccess) {
        this._notificationService.successTopRight("Course Passed");
      }

    });
  }
  getuserData() {
    this.service.GetAllCourses().subscribe(data => {
      console.log('ss', data)
      if (data) {
        data.forEach((element) => {
          this.selectedCourses.push({
            id: element.id,
            value: element.value
          });
        });
      }
    });
  }

  GetUserListforDropdown() {
    this.service.GetUserListforDropdown().subscribe(data => {
      if (data) {
        data.forEach((element, index) => {
          this.UserDropDownList.push({ id: element.id, value: element.value });
          this.filteredUserList.push({ id: element.id, value: element.value })
          if (this.selectedUsers.length > 0) {
            this.selectedUsers.filter((item) => {
              if (item === element.id) {
                this.UserDropDownList[index]['checked'] = true
              }
            })
          }
        });
        this.filterUserList('');
      }
    });
  }
  filterUserList(searchinput) {
    this.searchText = searchinput
    const lowerSearchText = searchinput.toLowerCase();
    this.filteredUserList = this.UserDropDownList.filter(user =>
      user.value.toLowerCase().includes(lowerSearchText)
    );
  }
  detectCheckboxClick(event) {
    this.selectedUsers = [];
    this.UserDropDownList.forEach((items) => {
      if (items.id === event.id) {
        items['checked'] = !items['checked']
      }
      if (items['checked']) {
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
    if (this.searchText === '' || this.searchText === null || this.searchText === undefined) {
      this.allSelected = event.checked
    }
    this.CourseForm.get('userId')?.setValue(this.selectedUsers);
  }
  over(type) {
    this.showUsers = true
  }

  out(type) {
    this.showUsers = true
  }
  onFileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      const file = event.dataTransfer.files[0];
      const fileType = file.name.split('.').pop()?.toLowerCase();

      if (fileType !== 'csv') {
        this._notificationService.errorTopRight('Invalid file type. Please drop a CSV file.');
        return;
      }

      const formData = new FormData();
      formData.append('file', file, file.name);
      this.fileName = file.name;
      this.file = file;
      this.service.ValidateAutoPassTrainingCoursesFile(formData).subscribe(data => {
        this.uploadResult = data;
        if (data.isSuccess) {
          this.showDropBox = false;
          this.showViewReportButton = data.errorRecordCount === 0 ? false : true;
        } else {
          this._notificationService.errorTopRight('Something is wrong with the file, Please check the file format and columns');
        }
      });
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension !== 'csv') {
        this._notificationService.errorTopRight('Please upload a valid .csv file');
        input.value = '';
        return;
      }

      const formData = new FormData();
      formData.append('file', file, file.name);
      this.fileName = file.name;
      this.file = file;
      this.service.ValidateAutoPassTrainingCoursesFile(formData).subscribe(data => {
        input.value = null;
        this.uploadResult = data;
        if (data.isSuccess) {
          this.showDropBox = false;
          this.showViewReportButton = data.errorRecordCount === 0 ? false : true;
          // this.notificationService.successTopRight('File validated successfully');
        } else {
          this._notificationService.errorTopRight('Something is wrong with the file, Please check the file format and columns');
        }
      });

    }
  }
  proceedWithUpload() {
    if (this.file) {
      const formData = new FormData();
      formData.append('file', this.file, this.file.name);

      this.service.ImportAutoPassTrainingCoursesFile(formData).subscribe(data => {
        if (data.isSuccess) {
          this._notificationService.successTopRight('File upload request submitted');
          this.ImportUpdateHistoryPaginated();
          this.uploadResult = false;
          this.showDropBox = true;
        }
      });

    } else {
      console.error('No file available for upload');
    }
  }
  cancelUpload() {
    this.uploadResult = null;
    this.fileName = null;
    this.file = null;
    this.showDropBox = true;
  }

  onPageChangeBulkUpdateRedemption(pageIndex: number) {
    if (pageIndex < 1 || pageIndex > this.totalPagesBulkUpdateRedemption) return;
    this.bulkUpdateRedemptionApiRequest.pageIndex = pageIndex;
    this.currentPageBulkUpdateRedemption = pageIndex;
    this.ImportUpdateHistoryPaginated();
  }
  changeBulkUpdateRedemptionPageCount(event) {
    this.bulkUpdateRedemptionApiRequest.itemCount = event;
    this.currentPageBulkUpdateRedemption = 1;
    this.ImportUpdateHistoryPaginated();
  }
  applySortBulkUpdateRedemption(event) {
    this.sortByBulkUpdateRedemption = event.active;
    this.sortDirectionBulkUpdateRedemption = event.direction;
    this.bulkUpdateRedemptionApiRequest.sortBy = this.sortByBulkUpdateRedemption;
    this.bulkUpdateRedemptionApiRequest.sortDirection = this.sortDirectionBulkUpdateRedemption.toLowerCase();
    this.ImportUpdateHistoryPaginated();
  }
  ImportUpdateHistoryPaginated() {
    this.dataSourceUpdateBulkRedemption = [];
    this.bulkUpdateRedemptionLoading = true;

    this.service.ImportHistoryPaginated(this.bulkUpdateRedemptionApiRequest).subscribe(data => {
      if (data?.results.length) {
        this.dataSourceUpdateBulkRedemption = data.results;
        this.dataSourceUpdateBulkRedemption.forEach(element => {
          if (element?.createdDateTime) {
            element.createdDateTime = moment.utc(element.createdDateTime)
              .tz('America/New_York')
              .format('MM-DD-YYYY');
          }
          if (element?.dateProcessed) {
            element.dateProcessed = moment.utc(element.dateProcessed)
              .tz('America/New_York')
              .format('MM-DD-YYYY');
          }
        });

        this.totalRecordsBulkUpdateRedemption = data.totalRecords;
        this.totalPagesBulkUpdateRedemption = Math.ceil(this.totalRecordsBulkUpdateRedemption / this.bulkUpdateRedemptionApiRequest.itemCount);
        this.BulkUpdateRedemptionPages = Array.from({ length: this.totalPagesBulkUpdateRedemption }, (_, i) => i + 1);
      }
      this.bulkUpdateRedemptionLoading = false;
    });
  }
  handleButtonClickBulkRedemption(event) {
    if (event.buttonAction === 'for_edit') {
      this.FileId = event.item.fileId;
      this.DownloadBulkUpdateData();
    }
  }
  viewUploadedReport() {
    this.FileId = this.uploadResult.fileId
    this.DownloadBulkUpdateData()
  }
  DownloadBulkUpdateData() {
    this.service.DownloadBulkUpdateData(this.FileId).subscribe(data => {
      const blob = new Blob([data], { type: 'application/csv' });
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'TrainingCourse_' + this.FileId + '.csv';
      a.click();
      URL.revokeObjectURL(objectUrl);
    })
  }

  applyFilter(event, filterPopOver) {
    this.isFilterSubmitted = true;
    this.appliedFilters = event.selectedFilters.map((filter) => {
      const option = this.filterOptions.find((opt) => opt.oid === filter.oid);
      return {
        ...filter,
        label: option ? option.label : filter.oid
      };
    });

    this.filterApplied = this.appliedFilters.length > 0;

    this.GetCoursePaginated();
  }
  clearFilters() {
    this.appliedFilters = [];
    this.isFilterSubmitted = false;
    this.filterApplied = false;
    console.log('Filters cleared:', this.filterApplied);
  }
  configureFilters(): any {

    return this.service.getUserFilterSettingsForAdmin();
  }
  removeFilter(filter) {
    this.appliedFilters = this.appliedFilters.filter(f => f.oid !== filter.oid);
    this.filterApplied = this.appliedFilters.length > 0;
    this.applyFilter({ selectedFilters: this.appliedFilters }, null);
    this.isFilterSubmitted = false;
  }




  GetallSlides(id) {
    // this.service.Getallslides(id).pipe(
    //   catchError(error => {
    //     console.log(error);
    //     this._notificationService.errorTopRight('Something went wrong. Unable to fetch course content data.');
    //     return of(null);
    //   })
    // ).subscribe(data => {
    //   this.slides = data;
    //   if(this.slides.length>0) {
    //     this.getSlideDataById(id);
    //   }
    // });
  }
  getSlideDataById = async (id) => {
    // await this.slides.forEach((item) => {
    //   const extractedSlideName = item.slideName.split('_')[0]
    //   if(item.id) {
    //     if(extractedSlideName === 'Quiz') {
    //       this.service.GetQuizSlideContent(id, item.id).subscribe(resp=>{
    //         if(resp[0]) {
    //           this.quizSlideData = resp[0];
    //           this.service.GetSlideQuizQuestions(resp[0].id).subscribe(data=>{
    //             this.quizSlideData['questions'] = data.questionWithOptions
    //           })
    //         }
    //       });
    //     } else {
    //       this.service.GetSlideMediaContent(id, item.id).subscribe(data => {
    //         if(extractedSlideName === 'Video') {
    //           this.videoSlideData.push(data);
    //         } else if(extractedSlideName === 'Audio') {
    //           const audioSlide = data;
    //           if (data.id) {
    //             this.service.GetSlideVideoUrl(data.id).pipe(
    //               catchError(error => {
    //                 this.audioSlideData.push(audioSlide)
    //                 return of(null);
    //               })
    //             ).subscribe(data => {
    //               if (data) {
    //                 audioSlide['audioSlideVideoURl'] =  data.url;
    //                 this.audioSlideData.push(audioSlide)
    //               }
    //             });
    //           }
    //         } else if(extractedSlideName === 'Image') {
    //           const imageSlideInfo = data;
    //           if (data.id) {
    //             this.service.GetSlideVideoUrl(data.id).pipe(
    //               catchError(error => {
    //                 this.imageSlideData.push(data)
    //                 return of(null);
    //               })
    //             ).subscribe(data => {
    //               if (data) {
    //                 imageSlideInfo['imageSlidVideoURl'] = data.url;
    //                 this.imageSlideData.push(imageSlideInfo)
    //                 console.log('imageSlideData', this.imageSlideData)
    //               }
    //             });
    //           }
    //         } else if(extractedSlideName === 'Text') {
    //           this.textSlideData.push(data);
    //         }
    //       });
    //     }
    //   }
    // })
  }
}
