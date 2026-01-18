import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { COLUMN_TYPE, DataGridColumnHeader } from 'app/shared/component/data-grid/data-grid.service';
import { TrainingCourseManagerService } from './training-course-manager.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NotificationService } from 'app/shared/notification/notification';
import { ExportExcelService } from 'app/modules/pages/excel-export-service.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-training-course-manager',
  templateUrl: './training-course-manager.component.html',
  styleUrls: ['./training-course-manager.component.scss']
})
export class TrainingCourseManagerComponent {

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
  constructor(private router: Router,
    private service: TrainingCourseManagerService, 
    private _formGroup: FormBuilder, 
    private _matDialog: MatDialog,
    private modalService: BsModalService,
    private _notificationService:NotificationService,
    private exportExcelService: ExportExcelService
  ) {
    // this.formFilter = this._formGroup.group({
    //   ProccesedDateStart: new FormControl(),
    //   ProccesedDateEnd: new FormControl(),
    //   SaleDateStart: new FormControl(),
    //   SaleDateEnd: new FormControl()
    // });
  }

  ngOnInit(): void {
    this.gridColumns = this.getGridSettings();
    this.GetCoursePaginated();
     this.CourseInitializeform();
     
  }


  event: { pageIndex: number; pageSize: number; };
  sortBy = '';
  modalReference: any;
  sortDirection = '';
  totalRecords = 0;
  formFilter: FormGroup;
  courseContentPopUp: any;
  dataSource = [];
  pages: number[] = [];
  slidesData = [];
  apiRequest = {
    itemCount: 25,
    pageIndex: 1,
    sortBy: "dateProcessed",
    search: "",
    sortDirection: "desc",
    filter: []
  };

  totalPages: number;

  CourseInitializeform()
  {
    this.CourseForm = this._formGroup.group({
      courseId: null,
      userId: null,
    });
  }
  getGridSettings(): DataGridColumnHeader[] {
    return [
      {
        columnName: '#',
        columnTitleKey: 'Select All',
        columnValue: '',
        type: this.columnType.CHECKBOX,
        show: true,
        sort: false
      },
      {
        columnName: 'name',
        columnTitleKey: 'Course Name',
        columnValue: 'name',
        type: this.columnType.TEXT,
        show: true,
       sort: true,
      }, 
     
      {
        columnName: 'required',
        columnTitleKey: 'Required',
        columnValue: 'required',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      }, 
      // {
      //   columnName: 'iActive',
      //   columnTitleKey: 'Active',
      //   columnValue: 'iActive',
      //   type: this.columnType.TEXT,
      //   show: true,
      //   sort: true,
      // },
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
          // {
          //   buttonAction: 'for_duplicate',
          //   icon: 'copy',
          //   tooltipKey: 'Duplicate',
          //   buttonClass: 'btn-color-600'
          // },
          // {
          //   buttonAction: 'for_language',
          //   icon: 'language',
          //   tooltipKey: 'Create Language',
          //   buttonClass: 'btn-color-600'
          // },
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

  handleCheckBoxClick(event) {
    this.selectedCourseList = event.checkedList;
  }

  handleBulkGradeBookDownload() {
    const payload = {ids: []}
    this.selectedCourseList.map((item) => {
      payload.ids.push(item.id);
    })
    this.downloadGradeBookData(payload);
  }

  handleButtonClick(event,content) {
    if (event.buttonAction === 'for_edit') {
      this.editdialog(event.item.id);
    } 
    // else if (event.buttonAction === 'for_delete') {
    //   this.popUpDetails = {
    //     caps: 'Delete',
    //     small: 'delete',
    //     modalMessage: 'Are you sure, you want to delete this record?'
    //   }
    //   this.openDeletePopUp(event.item,content)
    // } 
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
      const payload = event.item.courseCopyId;
      
      this.service.CopyCourses(payload).subscribe(data => {
        if (data.isSuccess === true) {
          this._notificationService.successTopRight(data.message);
        }
        this._notificationService.errorTopRight(data.message);
      })
      this.GetCoursePaginated();
    }
    else if (event.buttonAction === 'for_gradebook') {
      const payload = {ids:[event.item.id]}
      this.downloadGradeBookData(payload);
    } else if(event.buttonAction === 'for_courseContent') {
      this.imageSlideData = [];
      this.textSlideData = [];
      this.audioSlideData = [];
      this.videoSlideData = [];
      this.quizSlideData = [];
      this.GetallSlides(event.item.id)
      this.openCourseContent(this.courseContent)
    }
  }
  editdialog(event)
  {
    this.router.navigate(['/training-course-manager/training-course-manager-add-edit/'+ event])
  }

  handleRowClick(event)
  {

  }
  GetallSlides(id) {
    this.service.Getallslides(id).pipe(
      catchError(error => {
        console.log(error);
        this._notificationService.errorTopRight('Something went wrong. Unable to fetch course content data.');
        return of(null);
      })
    ).subscribe(data => {
      this.slides = data;
      if(this.slides.length>0) {
        this.getSlideDataById(id);
      }
    });
  }
  getSlideDataById= async(id) => {
    await this.slides.forEach((item) => {
      const extractedSlideName = item.slideName.split('_')[0]
      if(item.id) {
        if(extractedSlideName === 'Quiz') {
          this.service.GetQuizSlideContent(id, item.id).subscribe(resp=>{
            if(resp[0]) {
              this.quizSlideData = resp[0];
              this.service.GetSlideQuizQuestions(resp[0].id).subscribe(data=>{
                this.quizSlideData['questions'] = data.questionWithOptions
              })
            }
          });
        } else {
          this.service.GetSlideMediaContent(id, item.id).subscribe(data => {
            if(extractedSlideName === 'Video') {
              this.videoSlideData.push(data);
            } else if(extractedSlideName === 'Audio') {
              const audioSlide = data;
              if (data.id) {
                this.service.GetSlideVideoUrl(data.id).pipe(
                  catchError(error => {
                    this.audioSlideData.push(audioSlide)
                    return of(null);
                  })
                ).subscribe(data => {
                  if (data) {
                    audioSlide['audioSlideVideoURl'] =  data.url;
                    this.audioSlideData.push(audioSlide)
                  }
                });
              }
            } else if(extractedSlideName === 'Image') {
              const imageSlideInfo = data;
              if (data.id) {
                this.service.GetSlideVideoUrl(data.id).pipe(
                  catchError(error => {
                    this.imageSlideData.push(data)
                    return of(null);
                  })
                ).subscribe(data => {
                  if (data) {
                    imageSlideInfo['imageSlidVideoURl'] = data.url;
                    this.imageSlideData.push(imageSlideInfo)
                    console.log('imageSlideData', this.imageSlideData)
                  }
                });
              }
            } else if(extractedSlideName === 'Text') {
              this.textSlideData.push(data);
            }
          });
        }
      }
    })
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
  this.router.navigate(['/training-course-manager/training-course-manager-add-edit']);
}


  GetCoursePaginated() {
    this.dataSource=[];
    this.loading=true;
    this.service.Getallcourses(this.apiRequest, this.selectedTab).subscribe(data => {
      if (data) {
        if (data.results) {
          this.dataSource = data.results;
        }
        this.totalRecords = data.totalRecords;
        this.calculateTotalPages()
      }
      this.loading=false;
    });
  }
  openDeletePopUp(element: any, content: TemplateRef<any>) {
    this.deletelement = element;
    console.log('this.deletelement.status',element)
    this.CourseName = element.name;
    console.log('this.deletelement.status',this.deletelement.status)
    this.modalReference = this._matDialog.open(content, {
      data: { elementId: this.deletelement }
    });
  }
  openCourseContent(content: TemplateRef<any>) {
    this.courseContentPopUp = this._matDialog.open(content, {
      data: { elementId: this.deletelement }
    });
  }

  DeleteCourse(type) {
    if (this.popUpDetails.caps === 'Unarchive') {
      const object = {
        course: this.CourseName,
        list: 'Archive',
        status: 'Active'
      };

      this.service.CheckDuplicateArchieveCourse(object).subscribe(data => {
        if (data.isSuccess) {
          this._notificationService.successTopRight('Unarchived Successfully');
  
          this.service.CourseArchive(this.deletelement.id, this.deletelement.status).subscribe(() => {
            this.GetCoursePaginated();
          });
        } else {
          this._notificationService.errorTopRight('Course Name Already Exist');
        }
      });
    } else {
      this.service.CourseArchive(this.deletelement.id, this.deletelement.status).subscribe(data => {
        if (data.isSuccess) {
          this._notificationService.successTopRight(
            type === 'undo archive' ? 'Unarchived Successfully' : 'Archived Successfully'
          );
          this.GetCoursePaginated();
        } else {
          this._notificationService.errorTopRight('Internal system error.');
        }
      });
    }
  }
  ApplySearch(searchValue: string, inputElement: HTMLInputElement) {
    if(searchValue === '') {
      inputElement.value = '';
    }
    this.loading = true;
    searchValue = searchValue.trim(); 
    searchValue = searchValue.toLowerCase(); 
    this.apiRequest.search = searchValue;
    this.GetCoursePaginated();
  }


  
  downloadGradeBookData(payload) {
    this.service.DownloadGradeBookData(payload).subscribe(data => {
      if (data.length === 0) {
        this._notificationService.errorTopRight('No records found.');
      }
      const exportdata: any[] = this.getExportData(data);
      
      if (exportdata && exportdata.length > 0) {
        this.exportExcelService.exportAsExcelFile(exportdata,'GradeBook');
      } 
    })
  }

  getExportData(result: any[]): any[] {
    const data: any[] = [];
    if (result && result.length > 0) {
      result.forEach(element => {
        data.push({
          "Curriculum": element.curriculum,
          'Course Name': element.course,
          'User ID': element.bpNumber,
          'First Name': element.firstName,
          'Last Name': element.lastName,
          'Email': element.email,
          'Exam Status': element.passed,
          'Course Required': element.courseRequired,
          'Passed Date': element.passingDate, 
          'Passing Percentage': element.passMark,
          'Percentage Obtained': element.obtainMarksPer,
          "Obtained Marks": element.obtainMarks,
          'Credit Rewards': element.cRewards,
          'Affiliate Name': element.affiliateName,
          'Portal Name': element.company,
          'Tier Name': element.tierName
        });
      });
      
    }
    return data;
  }

  AutomaticallyPassCourse(PassTrainingCourse){
    this.PassCourse = this._matDialog.open(PassTrainingCourse, {
    });
    this.GetUserListforDropdown();
    this.getuserData();
  }

 AutomaticallyPassCourseForBpNumberFun() {
  const courseId = this.CourseForm.get('courseId').value; 
  const userIds = this.CourseForm.get('userId').value; 

  const payload = userIds;
  this.service.AutomaticallyPassCourseForBpNumberFun(payload, courseId).subscribe(response => {
    if(response.isSuccess)
    {
      this._notificationService.successTopRight("Course Passed");
    }
   
  });
}
  getuserData()
  {
    this.service.GetAllCourses().subscribe(data=> {
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
  over(type) {
    this.showUsers = true
  }

  out(type) {
    this.showUsers = true
  }
  
}
