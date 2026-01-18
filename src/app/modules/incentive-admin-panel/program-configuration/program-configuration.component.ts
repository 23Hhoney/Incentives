import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { COLUMN_TYPE, DataGridColumnHeader } from 'app/shared/component/data-grid/data-grid.service';
import { IncentiveAdminPanelService } from '../incentive-admin-panel.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from 'app/shared/notification/notification';
import { LoggedInSessionContract, SharedService } from 'app/shared/shared-service';
import { Router } from '@angular/router';
import { checkValidText } from 'app/shared/validation/validation-utils';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ProgramConfigurationService } from './program-configuration.service';
import { DatePipe } from '@angular/common';
import { catchError, debounceTime, distinctUntilChanged, map, Observable, of, startWith, Subscription, switchMap } from 'rxjs';
import { TrainingCourseManagerService } from 'app/modules/admin-panel/training-course-manager/training-course-manager.service';
import { Users } from '../points-credit-manager/users.types';

@Component({
  selector: 'app-program-configuration',
  templateUrl: './program-configuration.component.html',
  styleUrls: ['./program-configuration.component.scss']
})
export class ProgramConfigurationComponent implements OnInit {
  pointsValueDropdown = [
    {
      value: '$1.00',
      id: 1
    },
    {
      value: '$2.00',
      id: 2
    },
    {
      value: '$3.00',
      id: 3
    },
    {
      value: '$4.00',
      id: 4
    },
    {
      value: '$5.00',
      id: 5
    },
    {
      value: '$6.00',
      id: 6
    },
    {
      value: '$7.00',
      id: 7
    },
    {
      value: '$8.00',
      id: 8
    },
    {
      value: '$9.00',
      id: 9
    },
    {
      value: '$10.00',
      id: 10
    },
  ];
  milestoneTypeDropdown = [
    {
      value: 'Points',
      id: 'points'
    },
    {
      value: 'Sale Price',
      id: 'salePrice'
    }
  ];
  options: { value: string, viewValue: string }[] = [
    { value: 'email', viewValue: 'Email' },
    { value: 'notification', viewValue: 'Notification' },
    { value: 'none', viewValue: 'None' }
  ];
  pageIndex = 1;
  enableButton = false;
  pages: number[] = [];
  totalPages: number;
  gridColumns: DataGridColumnHeader[] =[];
  columnType = COLUMN_TYPE;
  bulkTaxInformationModal:any;
  userList = [];
  fileName;
  file;
  userTaxInformationHistoryColumns: DataGridColumnHeader[];
  userTaxInformationHistoryDataSource = [];
  userTaxInformationHistoryLoading = false;
  userTaxInformationHistoryPages:number[] = [];
  userTaxInformationHistoryTotalPages: number;
  // isGoogleSignEnabled:boolean=false;

  userTaxInformationHistoryApiRequest = {
    pageIndex: 1,
    sortBy: "createdDateTime",
    itemCount: 25,
    sortDirection: "desc",
    search: "",
    objectName: "UserTax",
    filter: []
  };
  uploadResult = null;
  taxDocumentForm: FormGroup;
  showDropBox = true;
  showViewReportButton = false;
  selectedTaxDocument = null;
  importHistoryTotalRecords = 0;
  fileId: any;
  pageLimit = 10;
  prevValue = [];
  formTitle = 'Add Milestone';
  sortBy = '';
  editor;
  sortDirection = '';
  totalRecords = 0;
  dataSource = null;
  configurationForm: FormGroup;
  milestoneForm: FormGroup;
  mileStoneDialog = null;
  @ViewChild('milestoneDialog') milestoneDialog: TemplateRef<any>;
  apiRequest = {
    itemCount: 25,
    pageIndex: 1,
    pageLimit: 10,
    sortBy: "createdDateTime",
    search: "",
    sortDirection: "desc",
    filter: []
  };
  loggedInUserObj: LoggedInSessionContract;
  googleSignEnabled: boolean;
  userEmailIdAsUserId: boolean;
  message: string;
  userSearchControl = new FormControl();
  filteredUsers: Observable<Users[]> = of([]);
  selectedUserTooltip = '';
  selectedFullname = '';
  selectedUserName = '';
  isUserSelected = false;
  private subscription: Subscription = new Subscription();
  selectedUserObject: Users | null = null;

  constructor(private service: IncentiveAdminPanelService, private fb: FormBuilder,
    private CourseService:TrainingCourseManagerService,
     private _matDialog: MatDialog, private notificationService: NotificationService,
     private _router: Router,
    private _sharedService : SharedService,
    private _programConfigurationServce: ProgramConfigurationService,
    private datePipe: DatePipe) {
      this.GetUserListforDropdown()
    this.configurationForm = this.fb.group({
      id: null,
      includePointsSystem: true,
      includeAcademySystem: true,
      collectTaxForms: true,
      requiredTaxFormsBeforeAllowUserToRedeemPoint: true,
      userEmailAsUserId: false,
      isgoogleSign:false,
      userOnbe: false,
      userNeoCurrency: false,
      pointValueRatio: 1,
      programStartDate: new Date(),
      programEndtDate: new Date()
    })
    this.gridColumns = this.getGridSettings();
    this.getList()
    this.GetProgramConfiguration();
    
  }
  ngOnInit(): void {
    this.prevValue = [];
    this.editor = ClassicEditor;
  
    // Subscribe to logged-in details if necessary
    this._sharedService._loggedInDetails$.subscribe((data: LoggedInSessionContract) => {
      if (data) {
        this.loggedInUserObj = data;
      }
    });
  
    this.userTaxInformationHistoryColumns = this.getUserTaxInformationHistoryGridSettings();
  
    this.userEmailIdAsUserId = window.sessionStorage.getItem('userEmailAsUserId') === 'true';
    this.googleSignEnabled = window.sessionStorage.getItem('isgoogleSign') === 'true';
  
    console.log('userEmailIdAsUserId:', this.userEmailIdAsUserId);
    console.log('googleSignEnabled:', this.googleSignEnabled);
  
    
    this.setupUserSearchSubscription();
    this.userSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      if (!value) {
        this.selectedUserTooltip = '';
        this.selectedFullname = '';
      }
    });
    
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  private setupUserSearchSubscription(): void {
    this.subscription = this.userSearchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (this.isUserSelected) {
          this.isUserSelected = false;
          return of([]);
        }
        return this.searchUsers(value || '');
      })
    ).subscribe(users => {
      this.filteredUsers = of(users);
      if (!this.userSearchControl.value) {
        this.selectedFullname = '';
        this.selectedUserTooltip = '';
      }
    });
  }

  private searchUsers(value: string): Observable<Users[]> {
    if (!value) {
      return of([]);
    }
    
    const payload = { userID: value };
    return this.service.GetUserById(payload).pipe(
      map(response => response || []),
      catchError(error => {
        console.error('API Error:', error);
        return of([]);
      })
    );
  }

  onUserSelected(event: any): void {
    const selectedUser = event.option.value as Users;
    if (selectedUser) {
      this.isUserSelected = true;
      this.selectedUserObject = selectedUser; // Store the selected user object
      this.selectedUserTooltip = `${selectedUser.firstName || ''} ${selectedUser.lastName || ''} (${selectedUser.email || ''}) - ${selectedUser.bpNumber || ''}`;
      this.selectedUserName = `${selectedUser.firstName || ''} ${selectedUser.lastName || ''} (${selectedUser.email || ''}) - ${selectedUser.bpNumber || ''}`;
      this.selectedFullname = `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`;
  
      // Optional: Keep bpNumber for display, but don't use for ID
      this.taxDocumentForm.get('UserMail')?.setValue(selectedUser.bpNumber || '');
    } else {
      this.selectedFullname = '';
      this.selectedUserObject = null;
    }
  }
  

  displayFn(user: Users | string): string {
    if (!user) {
      return '';
    }
    if (typeof user === 'string') {
      return user;
    }
    const name = user.firstName || '';
    const lastName = user.lastName || '';
    const bpNumber = user.bpNumber || '';
    return `${name} ${lastName} - ${bpNumber}`.trim();
  }

  formatUserDisplay(user: Users, searchTerm: string): string {
    if (!searchTerm) {
      const name = `${user.firstName} ${user.lastName}`;
      const email = user.email;
      const bpNumber = user.bpNumber;
      return `${name} (${email}) - ${bpNumber}`;
    }
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const name = `${user.firstName} ${user.lastName}`;
    const email = user.email;
    const bpNumber = user.bpNumber;
    const formattedName = name.replace(regex, `<b>$1</b>`);
    const formattedEmail = email.replace(regex, `<b>$1</b>`);
    return `${formattedName} (${formattedEmail}) - ${bpNumber}`;
  }

  onEmailAsUserIdChange(value: boolean): void {
    console.log('check value',value)
    // this.userEmailIdAsUserId = value;
    const isgoogleSignControl = this.configurationForm.get('isgoogleSign');
    if (value) {
      isgoogleSignControl?.enable(); 
      this.message="";
    } else {
      isgoogleSignControl?.disable();
      isgoogleSignControl?.setValue(false);
      this.message="Enable 'Use Email ID as Username' to activate SSO."

    }
  }
  getUserTaxInformationHistoryGridSettings(): DataGridColumnHeader[] {
    return [
      { columnName: 'fileName', columnTitleKey: 'File Name', columnValue: 'fileName', type: this.columnType.TEXT, show: true, sort: true },
      { columnName: 'status', columnTitleKey: 'Status', columnValue: 'status', type: this.columnType.Status, show: true, sort: true },
      { columnName: 'createdDateTime', columnTitleKey: 'Date Uploaded', columnValue: 'createdDateTime', type: this.columnType.TEXT, show: true, sort: true },
      { columnName: 'dateProcessed', columnTitleKey: 'Date Processed', columnValue: 'dateProcessed', type: this.columnType.TEXT, show: true, sort: true },
    ];
  }
  getGridSettings(): DataGridColumnHeader[] {
    return [
      {
        columnName: 'edit',
        columnTitleKey: 'Edit',
        columnValue: 'id',
        headerClass: 'program-config-header-class',
        type: this.columnType.BUTTON,
        button: {
          buttonAction: 'for_edit',
          icon: 'edit',
          tooltipKey: 'edit',
          buttonClass: 'btn-color-600',
        },
        show: true,
        sort: false,
      },
      {
        columnName: 'name',
        columnTitleKey: 'Milestone Name',
        columnValue: 'milestoneName',
        headerClass: 'program-config-header-class',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      },
      {
        columnName: 'type',
        columnTitleKey: 'Type',
        columnValue: 'type',
        headerClass: 'program-config-header-class',
        type: this.columnType.TEXTWITHBACKGROUNDBUTTON,
        show: true,
        sort: true,
      }, 
      {
        columnName: 'threshold',
        columnTitleKey: 'Threshold',
        columnValue: 'threshold',
        headerClass: 'program-config-header-class',
        type: this.columnType.COMMANUMBER,
        show: true,
        sort: true,
      }, 
      {
        columnName: 'congrateMsg',
        columnTitleKey: 'Message Type',
        columnValue: 'congrateMsg',
        headerClass: 'program-config-header-class',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      }, 
      {
        columnName: 'userGroup',
        columnTitleKey: 'User Group',
        columnValue: 'userGroupName',
        headerClass: 'program-config-header-class',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      },
    ]
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalRecords / this.apiRequest.itemCount);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onPageChange(pageIndex: number) {
    if (pageIndex < 1 || pageIndex > this.totalPages) return;
    this.apiRequest.pageIndex = pageIndex;
    this.pageIndex = pageIndex;
    this.getList();
  }
  GetUserListforDropdown()
  {
    this.CourseService.GetUserListforDropdown().subscribe(data => {
      if (data) {
       this.userList = data;
      }
    });
  }
  onTaxDocumentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      // if (file.type.startsWith('image/')) {
        this.selectedTaxDocument = file;
      // } else {
      //   this.notificationService.errorTopRight('Please upload a valid image file');
      //   input.value = ''; 
      // }
    }
  }
  GetProgramConfiguration() {
    this.service.GetProgramConfiguration().subscribe((resp) => {
      if (resp[0]) {
        this.configurationForm = this.fb.group({
          id: resp[0].id,
          includePointsSystem: resp[0].includePointsSystem,
          includeAcademySystem: resp[0].includeAcademySystem,
          collectTaxForms: resp[0].collectTaxForms,
          requiredTaxFormsBeforeAllowUserToRedeemPoint: resp[0].requiredTaxFormsBeforeAllowUserToRedeemPoint,
          userEmailAsUserId: resp[0].userEmailAsUserId,
          isgoogleSign: resp[0].isgoogleSign,
          userOnbe: resp[0].userOnbe,
          userNeoCurrency: resp[0].userNeoCurrency,
          googleAnalytics: [resp[0].googleAnalytics || ''],
          pointValueRatio: resp[0].pointValueRatio,
          programStartDate: new Date(resp[0].programStartDate),
          programEndtDate: new Date(resp[0].programEndtDate)
        });
      } else {
        this.configurationForm = this.fb.group({
          id: null,
          includePointsSystem: true,
          includeAcademySystem: true,
          collectTaxForms: true,
          requiredTaxFormsBeforeAllowUserToRedeemPoint: true,
          userOnbe: true,
          userNeoCurrency: true,
          userEmailAsUserId: true,
          isgoogleSign: false,
          googleAnalytics: [''],
          pointValueRatio: 1,
          programStartDate: new Date(),
          programEndtDate: new Date()
        });
      }
      const userEmailAsUserIdValue = this.configurationForm.get('userEmailAsUserId')?.value;
      if (!userEmailAsUserIdValue) {
        this.configurationForm.get('isgoogleSign')?.disable();
       this.message="Enable 'Use Email ID as Username' to activate SSO."
      } else {
        this.message="";
        this.configurationForm.get('isgoogleSign')?.enable();
      }
    });
  }
  
  

  changePageCount(event) {
    this.apiRequest.itemCount = event;
    this.pageIndex = 1;
    this.apiRequest.pageIndex = 1;
    this.getList();
  }

  handleSortChange(event) {
    this.sortBy = event.active;
    this.sortDirection = event.direction;
    this.apiRequest.sortBy = this.sortBy;
    this.apiRequest.sortDirection = this.sortDirection.toLowerCase();
    this.getList();
  }
  openDialog(DialogName, type) {
    if (type === 'add') {
      this.milestoneForm = this.fb.group({
        id: null,
        milestoneName: null,
        type: null,
        threshold: null,
        congrateMsg:null,
        congratsMessageType: [[]],  // Initialize as an empty array
        milestoneTypeViews: [[]],
        userGroupName: null,
        emailSubject: null,
        emailBody: null,
        notificationSubject: null,
        notificationBody: null
      });
      this.formTitle = 'Add Milestone';
    }
    this.mileStoneDialog = this._matDialog.open(DialogName, {panelClass: 'milestone-container'});
  }
  removeFile(): void {
    this.selectedTaxDocument = null;
  }
  
  handleButtonClick(event) {
    if (event.buttonAction === 'for_edit') {
      this.enableButton = false;
      const milestone = event.item;
      let emailSubject = null;
      let emailBody = null;
      let notificationSubject = null;
      let notificationBody = null;
      const congratsMsgArray = [];
  
      milestone.milestoneTypePaginateds.forEach(type => {
        if (type.type === 'email') {
          emailSubject = milestone.emailSubject;
          emailBody = milestone.emailBody;
          congratsMsgArray.push('email');
        } else if (type.type === 'notification') {
          notificationSubject = milestone.notificationSubject;
          notificationBody = milestone.notificationBody;
          congratsMsgArray.push('notification');
        }
        else if (type.type === 'none') {
          congratsMsgArray.push('none');
        }
      });
  
      this.milestoneForm = this.fb.group({
        id: milestone.id,
        milestoneName: milestone.milestoneName,
        type: milestone.type,
        threshold: milestone.threshold,
        congratsMessageType: [congratsMsgArray], // Ensure it's an array
        userGroupName: milestone.userGroupName,
        emailSubject: emailSubject,
        emailBody: emailBody,
        notificationSubject: notificationSubject,
        notificationBody: notificationBody,
        congrateMsg:null
      });
      this.prevValue = congratsMsgArray;
  
      this.formTitle = 'Edit Milestone';
      this.openDialog(this.milestoneDialog, 'edit');
    }
  }
  SaveTaxDocuments() {
    if (!this.selectedUserObject?.id) {
      this.notificationService.errorTopRight('Please select a valid user.');
      return;
    }
  
    const formData = new FormData();
    formData.append('UserId', this.selectedUserObject.id); // <-- Use the correct user ID
    formData.append('file', this.selectedTaxDocument);
  
    this.service.SaveTaxDocumentSentByAdmin(formData).subscribe((resp) => {
      console.log('success', resp);
      if (resp.isSuccess) {
        this.notificationService.successTopRight('Tax Information Uploaded Successfully.');
        this.closeDialog();
        this.ClearForm();
      }
    });
  }
  
  ClearForm() {
    this.taxDocumentForm.reset();
    this.userSearchControl.setValue('');
    this.selectedTaxDocument = null;
    this.selectedUserObject = null;
    this.selectedUserTooltip = ''; 
    this.selectedFullname = '';   
    this.isUserSelected = false;   // optional: reset selection flag
  }
  onCongratsMessageTypeChange() {
    const congratsMsgValue = this.milestoneForm.get('congratsMessageType').value;
    if (this.prevValue.length < congratsMsgValue.length) {
      const newItem = congratsMsgValue.filter((item) => {
        return this.prevValue.indexOf(item) === -1;
      });

      if (newItem.includes('none')) {
        this.milestoneForm.get('congratsMessageType').setValue(['none']);
        this.milestoneForm.get('emailSubject').reset();
        this.milestoneForm.get('emailBody').reset();
        this.milestoneForm.get('notificationSubject').reset();
        this.milestoneForm.get('notificationBody').reset();
      } else {
        const filteredValues = congratsMsgValue.filter(value => value !== 'none');
        this.milestoneForm.get('congratsMessageType').setValue(filteredValues);
        if (!filteredValues.includes('email')) {
          this.milestoneForm.get('emailSubject').reset();
          this.milestoneForm.get('emailBody').reset();
        }
    
        if (!filteredValues.includes('notification')) {
          this.milestoneForm.get('notificationSubject').reset();
          this.milestoneForm.get('notificationBody').reset();
        }
      }
    }
    this.prevValue = this.milestoneForm.get('congratsMessageType').value.map(item => {
      return item;
    });
    // if (congratsMsgValue.includes('none')) {
    //   this.milestoneForm.get('congratsMessageType').setValue(['none']); 
    //   this.milestoneForm.get('emailSubject').reset();
    //   this.milestoneForm.get('emailBody').reset();
    //   this.milestoneForm.get('notificationSubject').reset();
    //   this.milestoneForm.get('notificationBody').reset();
    // } else {
    //   const filteredValues = congratsMsgValue.filter(value => value !== 'none');
    //   this.milestoneForm.get('congratsMessageType').setValue(filteredValues);
  
    //   if (!filteredValues.includes('email')) {
    //     this.milestoneForm.get('emailSubject').reset();
    //     this.milestoneForm.get('emailBody').reset();
    //   }
  
    //   if (!filteredValues.includes('notification')) {
    //     this.milestoneForm.get('notificationSubject').reset();
    //     this.milestoneForm.get('notificationBody').reset();
    //   }
    // }
  }

  getList() {
    this.dataSource = [];
    this.service.ProgramConfigurationList(this.apiRequest).subscribe(data => {
      if (data) {
        if (data.results) {
          this.dataSource = data.results;
          this.dataSource = this.transformData(data.results);
        }
        this.totalRecords = data.totalRecords;
        this.calculateTotalPages();
      }
    });
  }
  transformData(data: any[]): any[] {
    return data.map(item => {
      let typeDisplay = '';
      
      // Determine type display based on `milestoneTypePaginateds`
      if (item.milestoneTypePaginateds.some(t => t.type === 'email') && item.milestoneTypePaginateds.some(t => t.type === 'notification')) {
        typeDisplay = 'Email, Notification';
      } else if (item.milestoneTypePaginateds.some(t => t.type === 'email')) {
        typeDisplay = 'Email';
      } else if (item.milestoneTypePaginateds.some(t => t.type === 'notification')) {
        typeDisplay = 'Notification';
      } else {
        typeDisplay = 'None';
      }
  
      return {
        ...item,
        congrateMsg: typeDisplay 
      };
    });
  }

  SaveOrUpdateMilestone() {
    const validateForm = this.checkMilestoneValidation();
    if (validateForm) {
        const milestoneData = this.milestoneForm.value;
        milestoneData.congrateMsg = null; 
        milestoneData.milestoneTypeViews = []; 

        if (this.milestoneForm.get('congratsMessageType').value.includes('none')) {
          milestoneData.milestoneTypeViews.push({
              type: 'none'
          });
      }
        if (this.milestoneForm.get('congratsMessageType').value.includes('email')) {
            milestoneData.milestoneTypeViews.push({
                type: 'email'
            });
        }

        if (this.milestoneForm.get('congratsMessageType').value.includes('notification')) {
            milestoneData.milestoneTypeViews.push({
                type: 'notification'
            });
        }

        this.service.SaveOrUpdateMilestone(milestoneData).subscribe((resp) => {
            if (resp.isSuccess) {
                this.prevValue = []; 
                this.mileStoneDialog.close();
                this.notificationService.successTopRight('Milestone Saved Successfully.');
                this.getList();
            } else {
                this.notificationService.errorTopRight('Something went wrong.');
            }
        });
    }
}
  checkMilestoneValidation(): boolean {
    const congratsMessageTypeValue = this.milestoneForm.get('congratsMessageType').value;
    
    if (!checkValidText(this.milestoneForm.get('milestoneName').value)) {
      this.notificationService.errorTopRight('Please Fill Milestone Name');
      return false;
    } 
    else if (!checkValidText(this.milestoneForm.get('type').value)) {
      this.notificationService.errorTopRight('Please Select Type');
      return false;
    } 
    
    const thresholdValue = this.milestoneForm.get('threshold').value;
    if (thresholdValue === null || thresholdValue === '') {
      this.notificationService.errorTopRight('Please Fill Threshold');
      return false;
    } 
    else if (isNaN(thresholdValue) || thresholdValue < 0) {
      this.notificationService.errorTopRight('Threshold must be a positive number');
      return false;
    }
    
    if (congratsMessageTypeValue.includes('none') && congratsMessageTypeValue.length === 1) {
      return true;
    } else if (congratsMessageTypeValue.length === 0) {
      this.notificationService.errorTopRight('Please select at least one Congrats Message Type');
      return false;
    }
    
    if (congratsMessageTypeValue.includes('email')) {
      if (!checkValidText(this.milestoneForm.get('emailSubject').value) || 
          !checkValidText(this.milestoneForm.get('emailBody').value)) {
        this.notificationService.errorTopRight('Please Fill Email Subject and Body');
        return false;
      }
    }
    
    if (congratsMessageTypeValue.includes('notification')) {
      if (!checkValidText(this.milestoneForm.get('notificationSubject').value) || 
          !checkValidText(this.milestoneForm.get('notificationBody').value)) {
        this.notificationService.errorTopRight('Please Fill Notification Subject and Body');
        return false;
      }
    }
    
    return true;
  }

  SaveOrUpdateProgramConfiguration() {
    const reqObj = this.configurationForm.value;
    this.service.SaveOrUpdateProgramConfiguration(reqObj).subscribe((resp) => {
      if (resp.isSuccess) {
        let showLems = reqObj.includeAcademySystem;
        let showIncentive = reqObj.includePointsSystem;
        this.loggedInUserObj.showIncentiveAdmin = showIncentive;
        this.loggedInUserObj.showLemsAdmin = showLems;
        
        this._sharedService.setLoggedInObject(this.loggedInUserObj);

        this.notificationService.successTopRight('Settings Saved Successfully.');
        this.GetProgramConfiguration();
      } else {
        this.notificationService.successTopRight('Something went wrong.')
      }
    })
  }
 
  CollectTaxNotification() {
    const includePointsSystem = this.configurationForm.get('includePointsSystem').value;
    if (includePointsSystem) { // If the value is true
        let object = {
            "notificationId": null,
            "isBroadcast": true,
            "userId": null,
            "creatorUserId": window.sessionStorage.getItem('email'),
            "title": "Tax Documents Needed",
            "message": "Please submit your W9 form. You can submit your form by going to My Account -> Manage Tax Information -> and uploading your filled-out W9. If you are having any difficulty, you can also email your form to tritonsupport@kohlerpreferredpartners.com.",
            "isAlert": true,
            "ishighlithed": true,
            "scheduledDateTime": new Date(),
            "importhistoryId": null
        };

        this.service.SendNotificationforCollectTax(object).subscribe(data => {
            if (data.isSuccess) {
                this.notificationService.successTopRight('Notification Sent Successfully');
            }
        });
    }
}

  openAnalyticsTagDialog(templateRef: TemplateRef<any>): void {
    const dialogRef = this._matDialog.open(templateRef, {
      width: '500px'
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.configurationForm.patchValue({ googleAnalytics: result });
        console.log('Google Analytics Tag:', result);
        // Handle the result (e.g., save the tag)
      }
    });
  }

  onCancel(): void {
    this._matDialog.closeAll();
  }

  onSave(): void {
    this._matDialog.closeAll();
    let object={
      googleAnalytics: this.configurationForm.get('googleAnalytics').value
    }
    this.service.SaveGoogleAnalytics(object).subscribe(data=>{
       if(data.isSuccess)
       {
        this.notificationService.successTopRight("Data Saved Successfully");

       }
       else{
        this.notificationService.errorTopRight(data.message);
       }
    })
  }

  RoutetoAdminPage()
  {
      this._router.navigate(['/admin-user'])
  }
  
  onFieldChange() {
    this.enableButton = true;
  }

  openBulkTaxInformationModal(modal) {
    this.selectedTaxDocument = null;
    this.taxDocumentForm = this.fb.group({
      'UserMail': new FormControl(),
      'file': new FormControl(),
    })
    this.bulkTaxInformationModal = this._matDialog.open(modal)
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files) {

      const file = event.dataTransfer.files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'csv') {
        this.notificationService.errorTopRight('Invalid file type. Please drop a .csv file.');
        return;
      }
  
      const formData = new FormData();
      formData.append('file', file, file.name);
      this.fileName = file.name;
      this.file = file;

      this._programConfigurationServce.validateUserTaxFile(formData).subscribe(data => {
        this.uploadResult = data;
        if (data.isSuccess) {
          this.showDropBox = false;
          this.showViewReportButton = data.errorRecordCount === 0 ? false : true;
        } else {
          this.notificationService.errorTopRight('Something is wrong with the file, Please check the file format and columns');
        }
      });
    }
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {

      const file = input.files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase()?.trim();

      if (fileExtension !== 'csv') {
        this.notificationService.errorTopRight('Invalid file type. Please drop a .csv file.');
        input.value = '';
        return;
      }
  
      const formData = new FormData();
      formData.append('file', file, file.name);
      this.fileName = file.name;
      this.file = file;
      this._programConfigurationServce.validateUserTaxFile(formData).subscribe(data => {
        input.value = null;
        this.uploadResult = data;
        if (data.isSuccess) {
          this.showDropBox = false;
          this.showViewReportButton = data.errorRecordCount === 0 ? false : true;
        } else {
          this.notificationService.errorTopRight('Something is wrong with the file, Please check the file format and columns');
        }
      });
     
    }
  }

  cancelUpload() {
    this.uploadResult = null;
    this.fileName = null;
    this.file = null; 
    this.showDropBox = true;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
  }

  closeDialog() {
    this.bulkTaxInformationModal.close();
  }

  proceedUpload() {
    if (!this.file) {
      this.notificationService.errorTopRight('Please choose a file to upload');
    } else {
      this.notificationService.successTopRight('User tax information uploaded successfully')
    }
  }
  
  userTaxInformationHistoryPageCount(event) {
    this.userTaxInformationHistoryApiRequest.itemCount = event;
    this.userTaxInformationHistoryApiRequest.pageIndex = 1
    this.ImportHistoryPaginated();
  }

  onImportHistoryPageChange(pageIndex: number) {
    if (pageIndex < 1 || pageIndex > this.userTaxInformationHistoryTotalPages) return;
    this.userTaxInformationHistoryApiRequest.pageIndex = pageIndex;
    this.ImportHistoryPaginated();
  }

  downloadTemplate() {
    const columnNames = ['UserId', 'UserEmail', 'FilePath'];
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

  ImportHistoryPaginated() {
    this.userTaxInformationHistoryDataSource = [];
    this.importHistoryTotalRecords = 0;
    this.userTaxInformationHistoryLoading=true;

    this.service.ImportHistoryPaginated(this.userTaxInformationHistoryApiRequest).subscribe(data => {
      if (data) {
        if (data.results) {
          this.userTaxInformationHistoryDataSource = data.results;
          this.userTaxInformationHistoryDataSource.forEach(element=>{
            element.createdDateTime = this.datePipe.transform(element.createdDateTime, 'short');
            if(element.dateProcessed)
              element.dateProcessed=this.datePipe.transform(element.dateProcessed, 'short');
          })
        }
        this.importHistoryTotalRecords = data.totalRecords;
        this.calculateImportHistoryTotalPages();
      } else {
        this.notificationService.errorTopRight('Failed to fetch file history')
      }
      this.userTaxInformationHistoryLoading=false;
    });
  }

calculateImportHistoryTotalPages() {
  this.userTaxInformationHistoryTotalPages = Math.ceil(this.importHistoryTotalRecords / this.userTaxInformationHistoryApiRequest.itemCount);
  this.userTaxInformationHistoryPages = Array.from({ length: this.userTaxInformationHistoryTotalPages }, (_, i) => i + 1);
}

handleUpload() {
  let formData = new FormData();
  if (!this.file) {
    this.notificationService.errorTopRight('Please select file.');
  }
  formData.append("csvFile", this.file, this.fileName);
  this._programConfigurationServce.processExcelforEmail(formData).pipe(
    catchError(error=>{
      console.log('Error uploading user tax information', error);
      this.notificationService.errorTopRight('Somthing went wrong, failed to process your request at the moment')
      return of(null);
    })
  ).subscribe(data=> {
    if(data.isSuccess) {
      this.notificationService.successTopRight("Tax information has been successfully queued for upload.")
      this.showDropBox = true;
      this.uploadResult = null; 
    } else {
      this.notificationService.errorTopRight('Somthing went wrong, failed to process your request at the moment');
    }
   
  });

  this.ImportHistoryPaginated(); 
}

viewUploadedReport() {
  this.fileId = this.uploadResult.fileID
  this.downloadImportData()
}

downloadImportData() {
  this._programConfigurationServce.downloadImportData(this.fileId).subscribe(data=>{
    const blob = new Blob([data], { type: 'application/csv' });
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    a.href = objectUrl;
    a.download = 'UserTaxInformation_'+this.fileId+'.csv';
    a.click();
    URL.revokeObjectURL(objectUrl);
  })
}
routeToManageEmailTemplates()
{
  this._router.navigate(['/email-template'])
}

}
