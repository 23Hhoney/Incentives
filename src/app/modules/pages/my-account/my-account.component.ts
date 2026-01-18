import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ModernService } from 'app/layout/layouts/horizontal/modern/modern.service';
import { AccountTransactionsService } from '../account-transactions/account-transactions.service';
import { MyAccountService } from './my-account.service';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from 'app/shared/notification/notification';
import { SharedService } from 'app/shared/shared-service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'environments/environment';
import { catchError, of } from 'rxjs';
import { DatePipe } from '@angular/common';
import { COLUMN_TYPE, DataGridColumnHeader } from 'app/shared/component/data-grid/data-grid.service';
import moment from 'moment';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent {

  remainingPoints = 0;
  totalSales = 0;
  targetValue = '0';
  userStatus = 'Standard'
  userName: string;
  latestTransaction = {
    invoiceNumber: 'N/A',
    orderNumber:'N/A',
    dateProcessed: '',
    type: ''
  };
  columnType = COLUMN_TYPE;
  courseData = {
    totalCompleted: 0,
    totalCourses: 0
  }
  profilePicture = ''
  selectedProfilePicture = 'https://via.placeholder.com/150';
  profilePictureFile = null;
  profilePictureFileName = null;
  isProfileUpdating = false;
  yearsArray = [];
  profileAndPasswordForm: FormGroup
  manageTaxInformationForm: FormGroup
  taxInformationGridColumns: DataGridColumnHeader[];
  accessTaxInformationGridColumns: DataGridColumnHeader[];
  taxInformationDataSource = null;
  accessTaxInformationDataSource = null;
  taxInformationLoading = false;
  taxInformationCurrentPage = 1;
  taxInformationTotalRecord = 0;
  accessTaxInfoTotalRecord = 0;
  taxInformationPages: number[] = [];
  accessTaxInformationPages: number[] = [];
  notiApiRequest = {
    itemCount:3,
    pageIndex: 1,
    pageLimit: 3,
    sortBy: "",
    search: "",
    sortDirection: "",
    filter: []
  }
  currentTaxInput: any;
  taxInformationApiRequest = {
    pageIndex: 1,
    sortBy: "",
    itemCount: 25,
    sortDirection: "",
    search: "",
    objectName: "",
    filter: []
  }
  accessTaxFormLoading = false;
  accessTaxFormApiRequest = {
    pageIndex: 1,
    sortBy: "createdDate",
    itemCount: 25,
    sortDirection: "desc",
    search: "",
    objectName: "",
    filter: []
  }
  manageTaxInformationFile = null;
  manageTaxInformationFileName = null;
  modal: any;
  deleteModal: any;
  isUploadingTaxInformation = false;
  selectedDocId = null;
  totalUnreadNotifications = 0;
  isPointsAndSummaryLoading = false;
  isStatusLoading = false;
  isUserCourseCompletedLoading = false;
  isNotificationLoading = false;
  isLatestTransactionLoading = false;
  isUserProfileLoading = false;
  taxInformationTotalPages: number;
  accessTaxInfoTotalPages: number;
  UserEmailAsUserId: any;
  EmailId: any;
  constructor(
    private accountTransactionService: AccountTransactionsService, 
    private routing: Router,
    private _modernService: ModernService,
    private service: MyAccountService,
    private _matDialog: MatDialog,
    private _notificationService: NotificationService,
    private _sharedService: SharedService,
    private _formbuilder: FormBuilder,
    private datePipe: DatePipe
  ) {
    encapsulation: ViewEncapsulation.None
    const startYear = 1980;
    const currentYear = new Date().getFullYear();
    this.yearsArray = [];
    for (let year = startYear; year <= currentYear; year++) {
      this.yearsArray.push(year.toString());
    }
  }
  
  navigateTo(page) {
    this.routing.navigate([`./${page}`])
  }

  ngOnInit() {
   
    // this.UserEmailAsUserId = window.sessionStorage.getItem('userEmailAsUserId') === 'true';
    // console.log('this.UserEmailAsUserId', this.UserEmailAsUserId);

    this.profileAndPasswordForm = this._formbuilder.group({
        id: new FormControl(''),
        firstName: new FormControl(''),
        lastName: new FormControl(''),
        contactNumber: new FormControl(''),
        email: new FormControl({ value: '', disabled:true}),
        currentPassword: new FormControl(null),
        newPassword: [null, [this.passwordValidator(), Validators.minLength(8)]],
        confirmNewPassword: new FormControl(null)
    }, { validator: this.passwordMatchValidator.bind(this) });

    this._sharedService._profilePicture$.subscribe((data) => {
        if (data) {
            this.profilePicture = data;
        }
    });

    this._sharedService._userName$.subscribe((data) => {
        this.userName = data;
    });

    // Handle changes in the currentPassword field
    this.profileAndPasswordForm.get('currentPassword').valueChanges.subscribe((value) => {
        if (value === '') {
            this.profileAndPasswordForm.get('currentPassword').setValue(null);
        }
    });

    // Initialize other forms and data
    this.manageTaxInformationForm = this._formbuilder.group({
        year: this.yearsArray[this.yearsArray.length - 1],
    });

    this.taxInformationGridColumns = this.getGridSettings();
    this.accessTaxInformationGridColumns = this.getAcessTaxInformationGridSettings();
    this.getPointsAndSalesSummaryCalculation();
    this.getLatestTransaction();
    this.getUserStatus();
    this.getUserCourseCompleted();
    this.getNotificationList();
    this.getUserTaxInformation();
    this.userName = window.sessionStorage.getItem('name');
}




  getUserTaxInformation() {
    this.taxInformationLoading = true;
    this.taxInformationDataSource = null;
  
    this.service.getUserTaxInformation().subscribe(data => {
      this.taxInformationLoading = false;
      if (data.length) {
        this.taxInformationDataSource = data;
        this.taxInformationDataSource.forEach(element => {
          if (element?.sendDate) {
            
            element.sendDate = moment.utc(element.sendDate)
              .tz('America/New_York')
              .format('MM-DD-YYYY');
          }
        });
        this.taxInformationTotalRecord = data.totalRecords;
        this.calculateTotalPages();
      }
    });
  }
  

  calculateTotalPages() {
    this.taxInformationTotalPages = Math.ceil(this.taxInformationTotalRecord / this.taxInformationApiRequest.itemCount);
    this.taxInformationPages = Array.from({ length: this.taxInformationTotalPages }, (_, i) => i + 1);
  }

  calculateAccessTotalPages() {
    this.accessTaxInfoTotalPages = Math.ceil(this.accessTaxInfoTotalRecord / this.accessTaxFormApiRequest.itemCount);
    this.accessTaxInformationPages = Array.from({ length: this.accessTaxInfoTotalPages }, (_, i) => i + 1);
  }

  getProfilePicture() {
    this.service.getProfileImage(window.sessionStorage.getItem('userId')).subscribe(data=>{
      if (data) {
        var blob = new Blob([data]);
        var objectUrl = URL.createObjectURL(blob);
        this._sharedService.setProfilePicture(objectUrl);
      }
    })
  }

  getAcessTaxInformationGridSettings(): DataGridColumnHeader[] {
    return [
      { columnName: 'fileName', columnTitleKey: 'File Name', columnValue: 'fileName', type: this.columnType.TEXT, show: true, sort: true },
      { columnName: 'createdDate', columnTitleKey: 'Date', columnValue: 'createdDateTime', type: this.columnType.TEXT, show: true, sort: true },
      {
        columnName: 'action',
        columnTitleKey: 'Download',
        columnValue: 'id',
        type: this.columnType.BUTTON,
        buttonArray: true,
        headerClass: 'width-150px',
        buttons: [
          {
            buttonAction: 'for_download',
            icon: 'download',
            tooltipKey: 'download',
            buttonClass: 'btn-color-600',
           
          },
         
        ],
        show: true,
        sort: false,
      }
    ]
  }

  getGridSettings(): DataGridColumnHeader[] {
    return [
      { columnName: 'year', columnTitleKey: 'Year', columnValue: 'year', type: this.columnType.TEXT, show: true, sort: true },
      { columnName: 'documentName', columnTitleKey: 'Document Name', columnValue: 'documentName', type: this.columnType.TEXT, show: true, sort: true },
      { columnName: 'sendDate', columnTitleKey: 'Date', columnValue: 'sendDate', type: this.columnType.TEXT, show: true, sort: true },
      { columnName: 'verificationStatus', columnTitleKey: 'Verification Status', columnValue: 'verificationStatus', type: this.columnType.TEXT, show: true, sort: true }
    ];
  }
  passwordValidator() {
    return (control: { value: string }) => {
      const value = control.value;
      const hasNumber = /\d/.test(value);
      const hasUpper = /[A-Z]/.test(value);
      const hasLower = /[a-z]/.test(value);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const valid = hasNumber && hasUpper && hasLower && hasSpecial;
      if (!valid) {
        return { passwordStrength: true };
      }
      return null;
    };
  }

  getUserStatus() {
    this.isStatusLoading = true;
    const paylaod = {userId: sessionStorage.getItem('userId')}
    this.service.getAccountStatus(paylaod).subscribe(data=>{
      this.isStatusLoading = false;
      if (data) {
        this.userStatus = data.userId
      }
    })
  }

  formatNumberWithCommas(value: number): string {
    if (value == null) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  getNotificationList() {
    this.isNotificationLoading = true;
    this.service.getNotificationList(sessionStorage.getItem('userId'), this.notiApiRequest).subscribe(data => {
      this.isNotificationLoading = false;
      if (data) {
        this.totalUnreadNotifications = data.customRecordCount;
      }
        
    });
  }

  getUserCourseCompleted() {
    this.isUserCourseCompletedLoading = true;
    const payload = {userId: sessionStorage.getItem('userId')}
    this.service.getUserCourseCompleted(payload).subscribe(data=>{
      this.isUserCourseCompletedLoading = false;
      if (data && Object.keys(data).length) {
        this.courseData = data
      } 
    })
  }


  getPointsAndSalesSummaryCalculation() {
    this.isPointsAndSummaryLoading = true;
    const payload = {userId: sessionStorage.getItem('userId')}
    this._modernService.getPointsAndSalesSummaryCalculation(payload).subscribe(data=>{
      if (data) {
        if (data?.targetValue) {
          const targetValue = parseFloat(data?.targetValue);          
          this.targetValue = targetValue.toFixed(2)?.toString();
        } 
        this.isPointsAndSummaryLoading = false;
        this.remainingPoints = data.remaining_Points;
        this.totalSales = data.total_sales.toFixed(2);
        this._sharedService.setTotalPoints(data.remaining_Points);
        this._sharedService.setIsPointLocked(data?.isPointsLocked)
      }
      
    })
  }

  getLatestTransaction() {
    this.isLatestTransactionLoading = true;
    const apiRequest = {
      itemCount: 1,
      pageIndex: 1,
      pageLimit: 1,
      sortBy: "creadtedDate",
      search: "",
      sortDirection: "desc",
      filter: []
    };
    const id = window.sessionStorage.getItem("userId");
    const type = "all";
    this.accountTransactionService.TransactionsPagination(id, type, apiRequest).subscribe(data => {
      this.isLatestTransactionLoading = false;
      if(data) {
        if (data?.results.length) {
          const latestTransactionData = data.results[0];
          this.latestTransaction.invoiceNumber = latestTransactionData.invoiceNumber;
          this.latestTransaction.orderNumber = latestTransactionData.orderNumber;
          this.latestTransaction.dateProcessed = this.formatSelectedDate(latestTransactionData.dateProcessed);
          this.latestTransaction.type = latestTransactionData.transactionType;
          console.log(this.latestTransaction);
        }
      }
    });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const { newPassword, confirmNewPassword } = formGroup.controls;
    if (!newPassword.value) {
      return;
    }
    return newPassword.value === confirmNewPassword.value ? null : { mismatch: true };
  }

  formatSelectedDate(value) {
    const date = new Date(value);
    console.log(date);
    const year = date.getFullYear();
    const month = this.padZero(date.getMonth() + 1);
    const day = this.padZero(date.getDate());
    const formattedDate = `${month}/${day}/${year}`;
    return formattedDate
  }

  padZero(num: number, size: number = 2): string {
    let s = num.toString();
    while (s.length < size) s = '0' + s;
    return s;
  }

  handleProfilePictureEdit(modalName) {
    this.modal = this._matDialog.open(modalName, { panelClass: 'edit-profile-picture' });
    if (this.profilePicture.length) {
      this.selectedProfilePicture = this.profilePicture;
    }
  }
  
  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this._notificationService.errorTopRight('Please upload a valid .csv file');
        return;
      }

      const reader = new FileReader();
      this.profilePictureFile = file;
      this.profilePictureFileName = file.name;
      reader.onload = (e: any) => {
        this.selectedProfilePicture = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onManageTaxFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
        const file = input.files[0];
        if (file.type === 'application/pdf') {
            this.currentTaxInput = input;
            this.manageTaxInformationFile = file;
            this.manageTaxInformationFileName = file.name;
        } else {
           this._notificationService.errorTopRight('Please Upload a PDF file only');
            input.value = '';
        }
    }
}
openW9FormPdf() {
  window.open('https://www.irs.gov/pub/irs-pdf/fw9.pdf')
}
  handleProfilePictureUpdate() {
    this.isProfileUpdating = true;
    if (!this.profilePictureFile || !this.profilePictureFileName) {
      this._notificationService.errorTopRight('Please choose a file before submitting');
      return;
    }
    this._notificationService.infoTopRight('Please wait while your profile picture is being updated.')
    let formData = new FormData();
    formData.append("file", this.profilePictureFile, this.profilePictureFileName);
    formData.append("UserId", sessionStorage.getItem('userId'));
      this.service.setProfielImage(formData).subscribe(
        (result: any) => {
          this.handleCanceProfileUpdate();
          this.getProfilePicture();
          this._notificationService.successTopRight('Profile Picture Updated Successfully!');
          this.isProfileUpdating = false;
        });
  }

  saveUserTaxDocument() {
    const rawData = this.manageTaxInformationForm.getRawValue();
    let formData = new FormData();
    if(!rawData.year) {
      this._notificationService.errorTopRight('Please enter year');
      return;
    } else if(rawData.year < 0) {
      this._notificationService.errorTopRight('Please enter a valid year');
      return;
    } else if (!this.manageTaxInformationFile || !this.manageTaxInformationFileName) {
      this._notificationService.errorTopRight('Please choose a file to upload.')
      return;
    }
    this._notificationService.infoTopRight('Please wait while your file is being uploaded.')
    formData.append("file", this.manageTaxInformationFile, this.manageTaxInformationFileName);
    this.isUploadingTaxInformation = true;
    this.service.saveUserTaxDocument(formData, rawData.year).pipe(catchError(error => {
      console.log(error);
      this.isUploadingTaxInformation = false;
      return of(null);
    })).subscribe(data => {
      if (data) {
        this.isUploadingTaxInformation = false;
        if (data.isSuccess) {
          this._notificationService.successTopRight("Tax information saved successfully");
          this.getUserTaxInformation();
          this.manageTaxInformationFile = null;
          this.manageTaxInformationFileName = null;
          this.manageTaxInformationForm.reset();
        } else {
          this._notificationService.errorTopRight(data?.message ?? 'Something went wrong');
        }
      }
    })
    this.currentTaxInput.value = null;
  }

  handleCancelManageTaxModal() {
    this.modal.close();
    this.manageTaxInformationFile = null;
    this.manageTaxInformationFileName = null;
    this.manageTaxInformationForm.reset();
  }

  handleCanceProfileUpdate() {
    this.modal.close();
    this.profilePictureFile = null;
    this.profilePictureFileName = null;
    this.selectedProfilePicture = ''
  }

  handleProfileAndPasswordChange(modalName) {
    this.isUserProfileLoading = true;
    this.service.getUserProfileInfo(window.sessionStorage.getItem('userId'), environment.tentantcode).pipe(
      catchError(error => {
        this._notificationService.errorTopRight('Something went wrong. Unable to get user data')
        console.log(error);
        this.isUserProfileLoading =  false;
        return of(null);
      })
    ).subscribe(data=>{
      this.isUserProfileLoading =  false;
      console.log(this.profileAndPasswordForm.getRawValue());
      if (data && Object.keys(data).length) {
        this.profileAndPasswordForm.patchValue({
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          contactNumber: data.phone,
          email: data.email,
        });
        console.log(this.profileAndPasswordForm.getRawValue());
      } else {
        this._notificationService.errorTopRight('Something went wrong. Invalid user data')
        return;
      }
    })
    this.modal = this._matDialog.open(modalName, { panelClass: 'edit-profile-picture' });
  }

  handleProfileAndPasswordSubmit() {
    const formData = this.profileAndPasswordForm.getRawValue();

    formData.contactNumber = formData.contactNumber ? formData.contactNumber.trim() : '';
    if (formData.newPassword) {
      if (formData.newPassword === formData.currentPassword) {
        this._notificationService.errorTopRight('The new password must be different from the current password.');
        return;
      } else if (this.profileAndPasswordForm.invalid) {
        return;
      } else if (!formData.currentPassword) {
        this._notificationService.errorTopRight('Please enter current password.');
        return;
      }
    }
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  
    if (!formData.firstName || formData.firstName === '') {
      this._notificationService.errorTopRight('Please Enter First Name');
    } else if (!formData.lastName || formData.lastName === '') {
      this._notificationService.errorTopRight('Please Enter Last Name');
    } else if (!formData.contactNumber || formData.contactNumber === '') {
      this._notificationService.errorTopRight('Please Enter Contact Number');
    } else if (!phoneRegex.test(formData.contactNumber)) {
      this._notificationService.errorTopRight('Please Enter a valid Contact Number in the format (xxx) xxx-xxxx');
    } else if (!formData.email || formData.email === '') {
      this._notificationService.errorTopRight('Please Enter Email');
    } else {
      this.isProfileUpdating = true;

      const payload = {
        "id": formData.id,
        "firstName": formData.firstName,
        "lastName": formData.lastName,
        "email": formData.email,
        "phone": formData.contactNumber,
        "oldPassword": formData.currentPassword,
        "newPassword": formData.newPassword
      };
  
      this.service.updateUserProfileInfo(environment.tentantcode, payload).pipe(
        catchError(error => {
          this.isProfileUpdating = false;
          console.log("Error:", error);
          this._notificationService.errorTopRight('Something went wrong, unable to update profile');
          return of(null);
        })
      ).subscribe(data => {
        this.isProfileUpdating = false;
        if (data.isSuccess) {
          const userName = (formData.firstName + " " + formData.lastName).trim();
          this._notificationService.successTopRight("Profile updated successfully!");
          this._sharedService.setUserName(userName);
          this.handleCanceProfileAndPasswordUpdate();
        } else {
          this._notificationService.errorTopRight(data?.message ?? 'Please enter a valid old password. The password you provided does not match.');
        }
        
      });
    }
  }
  
  

  handleCanceProfileAndPasswordUpdate() {
    this.modal.close();
    this.profileAndPasswordForm.reset();
  }

  handleManageTaxInformationEdit(modal) {
    this.manageTaxInformationForm = this._formbuilder.group({
      year: this.yearsArray[this.yearsArray.length - 1]
    });
    this.getUserTaxInformation();
    this.modal = this._matDialog.open(modal, {panelClass: 'edit-profile-picture'});
  }
  

  handleAccessTaxInformationEdit(modal) {
    this.getAccessTaxFormData();
    this.modal = this._matDialog.open(modal, {panelClass: 'edit-profile-picture'})
  }

  onPageChange(pageIndex: number) {
    if (pageIndex < 1 || pageIndex > this.taxInformationTotalPages) return;
    this.taxInformationApiRequest.pageIndex = pageIndex;
    this.taxInformationCurrentPage = pageIndex;
    this.getUserTaxInformation();
  }

  onAccessTaxPageChange(pageIndex: number) {
    if (pageIndex < 1 || pageIndex > this.accessTaxInfoTotalPages) return;
    this.accessTaxFormApiRequest.pageIndex = pageIndex;
    this.getAccessTaxFormData();
  }


  getAccessTaxFormData() {
    this.accessTaxFormLoading = true;
  
    this.service.listTaxDocumentSentByAdmin(window.sessionStorage.getItem('userId'), this.accessTaxFormApiRequest)
      .pipe(
        catchError(error => {
          this.accessTaxFormLoading = false;
          this._notificationService.errorTopRight('Something went wrong, unable to fetch tax forms');
          return of(null);
        })
      )
      .subscribe(data => {
        this.accessTaxFormLoading = false;
        if (data) {
          if (data?.results.length) {
            this.accessTaxInformationDataSource = data.results;
            this.accessTaxInformationDataSource.forEach(element => {
              if (element?.createdDateTime) {
               
                element.createdDateTime = moment.utc(element.createdDateTime)
                  .tz('America/New_York')
                  .format('MM-DD-YYYY');
              }
            });
            this.accessTaxInfoTotalRecord = data.totalRecords;
            this.calculateAccessTotalPages();
          }
        }
      });
  }
  

  handleButtonClick(event, deleteModal) {
      switch (event.buttonAction) {
        case 'delete':
          this.selectedDocId = event.item.id;
          this.openDeleteModal(deleteModal);
          break;
        default:
          break;
    }
  }

  handleAccessFormButtonClick(event) {
    switch (event.buttonAction) {
      case 'for_download':
        const a = document.createElement('a');
        a.href = event?.item?.fileUrl;
        a.download = 'Demo Template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(event?.item?.fileUrl);
        break;
      default:
        break;
  }
}

  handleSortChange(event) {
    this.taxInformationApiRequest.sortBy = event.active;
    this.taxInformationApiRequest.sortDirection = event.direction.toLowerCase();
    this.getUserTaxInformation();
  }

  handleAccessSortChange(event) {
    this.accessTaxFormApiRequest.sortBy = event.active;
    this.accessTaxFormApiRequest.sortDirection = event.direction.toLowerCase();
    this.getAccessTaxFormData();
  }

  openDeleteModal(modalName) {
    this.deleteModal = this._matDialog.open(modalName);
  }

  closeDeleteModal() {
    this.selectedDocId = null;
    this.deleteModal.close()
  }

  deleteTaxInformation() {
    const payload = {
      docId: this.selectedDocId
    }
    this.service.deleteTaxInformation(payload).pipe(
      catchError(error => {
        this._notificationService.errorTopRight('Something went wrong. Failed to delete record')
        return of(null);
      })
    ).subscribe(data => {
      if (data) {
        if (data.isSuccess) {
          this._notificationService.successTopRight('Successfully deleted record.')
          this.getUserTaxInformation();
        } else {
          this._notificationService.errorTopRight('Something went wrong. Failed to delete record');
        }
      }
    })
    this.selectedDocId
  }

  getBpNumber() {
    return window.sessionStorage.getItem('bpNumber')
  }

  changePageCount(event) {
    this.taxInformationApiRequest.itemCount = event;
    this.taxInformationCurrentPage = 1;
    this.taxInformationApiRequest.pageIndex = 1
    this.getUserTaxInformation();
  }
  
}
