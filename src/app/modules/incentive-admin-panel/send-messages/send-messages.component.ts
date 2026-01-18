import { DatePipe, formatDate } from "@angular/common";
import { Component, Inject, LOCALE_ID, TemplateRef } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { COLUMN_TYPE, DataGridColumnHeader } from "app/shared/component/data-grid/data-grid.service";
import { NotificationService } from "app/shared/notification/notification";
import { IncentiveAdminPanelService } from "../incentive-admin-panel.service";
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { MatDialog } from "@angular/material/dialog";
import { ThemePalette } from "@angular/material/core";
import moment, { Moment } from "moment";
import { SendMessageService } from "./send-message.service";
import { catchError, of } from "rxjs";
import { ExportExcelService } from "app/modules/pages/excel-export-service.service";


@Component({
  selector: 'app-send-messages',
  templateUrl: './send-messages.component.html',
  styleUrls: ['./send-messages.component.scss']
})
export class SendMessagesComponent {
  dataSourceTab1 = [];
  filteredDataList = [];
  searchValue = '';
  deletelement:any;
  loading = false;
  usersListLoading = false;
  messageForm: FormGroup;
  minDate = new Date();
  pages: number[] = [];
  userListPages: number[] = []
  userListTotalPages: number;
  currentPage = 1;
  currentRowId;
  userListDataSource = [];
  updateMessage = false;
  SelectedMessageStatus = null;
  selectedObject = null;
  editor = ClassicEditor;
  showMsgDialog = false;
  public date: moment.Moment;
  public disabled = false;
  public showSpinners = true;
  public showSeconds = false;
  public touchUi = false;
  public enableMeridian = false;
  public maxDate: moment.Moment;
  public stepHour = 1;
  public stepMinute = 1;
  public stepSecond = 1;
  public color: ThemePalette = 'primary';
  public dateControl = new FormControl(new Date(2021,9,4,5,6,7));
  public dateControlMinMax = new FormControl(new Date());
  public options = [
    { value: true, label: 'True' },
    { value: false, label: 'False' }
  ];
  public listColors = ['primary', 'accent', 'warn'];
  public stepHours = [1, 2, 3, 4, 5];
  public stepMinutes = [1, 5, 10, 15, 20, 25];
  public stepSeconds = [1, 5, 10, 15, 20, 25];
  totalPages: number;
  gridColumnsTab1: DataGridColumnHeader[];
  userMessageDetailColumns: DataGridColumnHeader[];
  columnType = COLUMN_TYPE;
  event: { pageIndex: number; pageSize: number; };
  sortBy = '';
  messageDialog: any;
  modalReference: any;
  private file: File | null = null;  // Store the file
  sortDirection = '';
  totalRecords = 0;
  userTotalRecords = 0;
  apiRequest = {
    pageIndex: 1,
    sortBy: "createDate",
    itemCount: 25,
    sortDirection: "desc",
    search: "",
    objectName: "MessageImport",
    filter: [
    ]
  };

  userMessageHistoryApiRequest = {
    pageIndex: 1,
    sortBy: 'createDate',
    itemCount: 25,
    sortDirection: 'desc',
    search: '',
    objectName: 'MessageImport',
    filter: []
  }

  public editorConfig = {
    toolbar: [
      'redo', 'undo', 
      'heading', 'bold', 'italic', 'strong',
      'blockQuote',
      'unlink', 'imageUpload',
      'insertTable', 'mediaEmbed', 'bulletedList', 'numberedList', 
    ],
  };
  
  showDropBox = true;
  originalDate = null;
  uploadResult: any = null;
  searchMessageKeyword = '';
  fileName: string | null = null;
  FileId: any;

  readonly =true;
  modalReferenceForViewMessage: any;
  idelement: any;
  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private adminService:IncentiveAdminPanelService,
    private _matDialog: MatDialog,
    private datePipe: DatePipe,
    private service: SendMessageService,
    private exportExcelService: ExportExcelService,@Inject(LOCALE_ID) private locale: string,
  ) {}

  ngOnInit(){
    this.gridColumnsTab1 = this.getGridSettingsTab1();
    this.userMessageDetailColumns = this.getMessagePopupGridSettings();
    this.sortBy = this.apiRequest.sortBy;
    this.ImportHistoryPaginated();
    this.initializeMessageForm();
  }
  initializeMessageForm() {
    this.messageForm = this.fb.group({
      subject: null,
      body: null,
      ScheduledDateTime: '',
    })
  }
  ApplySearch(searchValue: string) {
    searchValue = searchValue.trim();
    searchValue = searchValue.toLowerCase();
    this.searchValue = searchValue;
    if (this.searchValue.length) {
      this.filteredDataList = this.dataSourceTab1.filter(item => {
        return (
          item?.fileName?.toLowerCase().includes(this.searchValue) ||
          item?.subject?.toLowerCase().includes(this.searchValue) ||
          item?.totalUserCount?.toString().includes(this.searchValue) ||
          item?.status?.toLowerCase().includes(this.searchValue)
        );
      });
    } else {
      this.filteredDataList = this.dataSourceTab1;
    }
  }

  onReady(eventData) {
    eventData.plugins.get('FileRepository').createUploadAdapter = function (loader) {
      return new UploadAdapter(loader);
    };
  }

  getMessagePopupGridSettings(): DataGridColumnHeader[] {
    return [
      { 
        columnName: 'email', 
        columnTitleKey: 'Email', 
        columnValue: 'email', 
        type: this.columnType.TEXT, 
        show: true, 
        sort: true 
      },
      { 
        columnName: 'firstName', 
        columnTitleKey: 'First Name', 
        columnValue: 'firstName', 
        type: this.columnType.TEXT, 
        show: true, 
        sort: true 
      },
      { 
        columnName: 'lastName', 
        columnTitleKey: 'Last Name', 
        columnValue: 'lastName', 
        type: this.columnType.TEXT, 
        show: true, 
        sort: true 
      },

    ]
  }

  getGridSettingsTab1(): DataGridColumnHeader[] {
    return [
      {
        columnName: 'edit',
        columnTitleKey: 'Edit',
        columnValue: 'id',
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
        columnName: 'view',
        columnTitleKey: 'View Message',
        columnValue: 'id',
        type: this.columnType.BUTTON,
        button: {
          buttonAction: 'for_view',
          icon: 'heroicons_solid:eye',
          tooltipKey: 'View message',
          isIconSvg: true,
          buttonClass: 'btn-color-600',
        },
        show: true,
        sort: false,
      },
      // {
      //   columnName: 'view_user',
      //   columnTitleKey: 'View Users',
      //   columnValue: 'id',
      //   type: this.columnType.BUTTON,
      //   button: {
      //     buttonAction: 'for_users_list',
      //     icon: 'account_circle',
      //     tooltipKey: 'View Users',
      //     buttonClass: 'btn-color-600',
      //   },
      //   show: true,
      //   sort: false,
      // },
      {
        columnName: 'download',
        columnTitleKey: 'Download',
        columnValue: 'id',
        type: this.columnType.BUTTON,
        button: {
          buttonAction: 'for_download',
          icon: 'download',
          tooltipKey: 'Download',
          buttonClass: 'btn-color-600',
        },
        show: true,
        sort: false,
      },
      {
        columnName: 'delete',
        columnTitleKey: 'Delete',
        columnValue: 'id',
        type: this.columnType.BUTTON,
        button: {
          buttonAction: 'for_delete',
          icon: 'delete',
          tooltipKey: 'Delete',
          buttonClass: 'btn-color-600',
        },
        show: true,
        sort: false,
      },

      { columnName: 'name', columnTitleKey: 'User / File Name', columnValue: 'fileName', type: this.columnType.TEXT, show: true, sort: true },
      { columnName: 'subject', columnTitleKey: 'Subject', columnValue: 'subject', type: this.columnType.TEXT_W_ELLIP, show: true, sort: true },
      { columnName: 'userCount', columnTitleKey: 'User Count', columnValue: 'totalUserCount', type: this.columnType.TEXT, show: true, sort: true },
      { columnName: 'scheduledDateTime', columnTitleKey: 'Date / Time', columnValue: 'scheduledDateTime', type: this.columnType.TEXT, show: true, sort: true },
      { columnName: 'status', columnTitleKey: 'Status', columnValue: 'status', type: this.columnType.Status, show: true, sort: true, },
      
    ];
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalRecords / this.apiRequest.itemCount);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  calculateUserListTotalPages() {
    this.userListTotalPages = Math.ceil(this.userTotalRecords / this.userMessageHistoryApiRequest.itemCount);
    this.userListPages = Array.from({ length: this.userListTotalPages }, (_, i) => i + 1);
  }

  onPageChange(pageIndex: number) {

    if (pageIndex < 1 || pageIndex > this.totalPages) return;
    this.apiRequest.pageIndex = pageIndex;
    this.currentPage = pageIndex;

    this.ImportHistoryPaginated();
  }

  onUserListPageChange(pageIndex: number) {
    if (pageIndex < 1 || pageIndex > this.userListTotalPages) return;
    this.userMessageHistoryApiRequest.pageIndex = pageIndex;
    this.getUserMessageDetails(this.currentRowId, undefined, false);
  }

  viewUploadedReport() {
    this.FileId = this.uploadResult.fileId
    this.DownloadImportData()
  }
  searchMessage(value) {
    this.searchMessageKeyword = value;
  }
  ImportHistoryPaginated() {
    this.dataSourceTab1 = [];
    this.filteredDataList = [];
    this.loading = true;
  
    this.adminService.ImportHistoryPaginated(this.apiRequest).subscribe(data => {
      if (data) {
        if (data.results) {
          this.dataSourceTab1 = data.results;
          this.filteredDataList = data.results;
          
          // If search filter is applied
          if (this.searchValue.length) {
            this.filteredDataList = this.dataSourceTab1.filter(item => {
              return (
                item?.fileName?.toLowerCase().includes(this.searchValue) ||
                item?.subject?.toLowerCase().includes(this.searchValue) ||
                item?.totalUserCount?.toString().includes(this.searchValue) ||
                item?.status?.toLowerCase().includes(this.searchValue)
              );
            });
          }
  
          this.filteredDataList.forEach(element => {
          
            if (element.scheduledDateTimeZone) {
              element.scheduledDateTime = moment.tz(element.scheduledDateTime, element.scheduledDateTimeZone)
                .tz('America/New_York') 
                .format('MM/DD/YYYY h:mm A');
            } else {
              element.scheduledDateTime = moment.utc(element.scheduledDateTime)
                .tz('America/New_York')  
                .format('MM/DD/YYYY h:mm A');
            }

            if (element.dateProcessed) {
              if (moment(element.dateProcessed, moment.ISO_8601, true).isValid()) {
                element.dateProcessed = moment.tz(element.dateProcessed, element.scheduledDateTimeZone || 'UTC')
                  .tz('America/New_York')
                  .format('MM/DD/YYYY h:mm A');
              }
            }
          });
        }
  
        this.totalRecords = data.totalRecords;
        this.calculateTotalPages();
      }
      this.loading = false;
    });
  }
  
  
  
  

  handleButtonClick(event,deletepopup,viewPopUp,usersListModal) {
    if (event.buttonAction === 'for_edit') {
      if(event.item.status === 'Sent') {
        this.notificationService.errorTopRight('This message has already been sent.')
      } else {
        this.FileId=event.item.id;
        this.selectedObject = event.item
        this.SelectedMessageStatus = event.item.status
        this.messageForm = this.fb.group({
          subject: this.selectedObject.subject,
          body: this.selectedObject.message,
          ScheduledDateTime: null,
        })
        this.updateMessage = true
        this.formateSelectedDate(this.selectedObject.scheduledDateTime)
      }
    } else if(event.buttonAction === 'for_edit') {
      
    }
    else if(event.buttonAction === 'for_view') {
      this.viewPopUp(event.item.id,viewPopUp)
    }
    else if(event.buttonAction === 'for_download') {
      this.exportAllResult(event.item.id)
      //this.viewPopUp(event.item.id,viewPopUp)

    } else if (event.buttonAction === 'for_users_list') {
      this.viewUsersPopup(event.item, usersListModal)
    } else if(event.buttonAction === 'for_delete') {
      this.openDeletePopUp(event.item.id,deletepopup)
      // this.handleMessageDelete(event.item);
    }
  }

  
  openDeletePopUp(elementId, deletepopup) {
    this.deletelement = elementId;
    this.modalReference = this._matDialog.open(deletepopup, {
      data: { elementId: this.deletelement }
    });
  }
  handleMessageDelete() {
    const payload = {
      id: this.deletelement
    }
    this.service.deleteSendMessage(payload).pipe(
      catchError(error => {
        console.log("Error while deleting the send message data: ", error);
        this.notificationService.errorTopRight('Something went wrong, failed to delete the message.');
        return of(null);
      })
    ).subscribe(data => {
      this.ImportHistoryPaginated();
      if (data && data.isSuccess) {
        this.notificationService.successTopRight('Successfully deleted the message');
      } else {
        this.notificationService.errorTopRight(data?.message ?? 'Something went wrong, failed to delete the message.');
      }
    })
  }

  sanitizeMessage(message: string): string {
    return message; // Return the message as is to include HTML content
    }

  viewPopUp(elementId: string, viewPopUp: TemplateRef<any>) {
    const messageObj = this.getMessageById(elementId);

    if (messageObj) {
      const sanitizedMessage = this.sanitizeMessage(messageObj.message);
      this._matDialog.open(viewPopUp, {
        data: {
          message: sanitizedMessage,
          subject: messageObj.subject
        },
        width: '40vw'
      });
    }
  }

  viewUsersPopup(row, modalName: TemplateRef<any>) {
    this.currentRowId = row.id;
    this.userListDataSource = []
    this.getUserMessageDetails(row.id, modalName, true);
  }


  getUserMessageDetails(rowId, modalName, showModal) {
    this.userListDataSource = []
    this.usersListLoading = true;
    this.service.getUserMessageDetails(rowId, this.userMessageHistoryApiRequest).pipe(
      catchError(error => {
        this.usersListLoading = false;
        console.log('Error on calling GetMsgUserDetails', error);
        this.notificationService.errorTopRight('Something went wrong, unable to fetch data');
        return of(null);
      })
    ).subscribe(response => {
      this.usersListLoading = false;
      if (response) {
        const users = response.results;
        this.userTotalRecords = response.totalRecords;
        this.userListDataSource = users;
        if (showModal === true) {
          this._matDialog.open(modalName, {
            width: "800px",
            height: "530px"
          });
        }
        this.calculateUserListTotalPages();
      } else {
        this.notificationService.errorTopRight('Something went wrong, unable to fetch data');
      }
    })
  }

  getMessageById(id: string) {
    return this.filteredDataList.find(result => result.id === id);
  }

  
  deleteRecord() {
    const requestObject = {
      "delete": true,
      "title": null,
      "message": null,
      "scheduledDateTime": null,
      "importFileId": this.deletelement
    }
    this.adminService.UpdateNotificationMsg(requestObject).subscribe((resp) => {
      if (resp.isSuccess) {
        this.notificationService.successTopRight('Message deleted Successfully')
        this.ImportHistoryPaginated();
      }
    })

  }

  DownloadImportData()
  {
    this.adminService.DownloadImportData(this.FileId).subscribe(data=>{
      const blob = new Blob([data], { type: 'application/csv' });
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'MessageImport_'+this.FileId+'.csv';
      a.click();
      //window.open(objectUrl);
      URL.revokeObjectURL(objectUrl);
    })
  }
  openSchedulDialog(DialogName) {
    this.messageDialog = this._matDialog.open(DialogName);
  }
  onDateTimeChange(event: any): void {
    this.formateSelectedDate(event.target.value);
  }
  
  formateSelectedDate(value) {
    if (!this.updateMessage) {
      const date = new Date(value);
      const year = date.getFullYear();
      const month = this.padZero(date.getMonth() + 1);
      const day = this.padZero(date.getDate());
      const hours = this.padZero(date.getHours());
      const minutes = this.padZero(date.getMinutes());
      const seconds = this.padZero(date.getSeconds());
      const milliseconds = this.padZero(date.getMilliseconds(), 3);
      const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}0000`;
      this.messageForm.controls['ScheduledDateTime'].setValue(formattedDate);
    } else {
      const newFormattedDate = moment(value).format("YYYY-MM-DD") + `T${moment(value).format('HH:mm:ss')}` + '.000Z';
      this.messageForm.controls['ScheduledDateTime'].setValue(newFormattedDate);
    }
    this.originalDate = value;
  }

  padZero(num: number, size: number = 2): string {
    let s = num.toString();
    while (s.length < size) s = '0' + s;
    return s;
  }
  
  applySort(event) {
    this.sortBy = event.active;
    this.sortDirection = event.direction;
    this.apiRequest.sortBy = this.sortBy;
    this.apiRequest.sortDirection = this.sortDirection.toLowerCase();
    this.ImportHistoryPaginated();
  }

  applyUserListSort(event) {
    this.apiRequest.sortBy = event.active;;
    this.apiRequest.sortDirection = event.direction.toLowerCase();
    this.getUserMessageDetails(this.currentRowId, undefined, false);
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    this.initializeMessageForm()
    if (event.dataTransfer?.files) {
      const file = event.dataTransfer.files[0];
      const fileType = file.name.split('.').pop()?.toLowerCase();
      
      if (fileType !== 'csv') {
        this.notificationService.errorTopRight('Invalid file type. Please drop a CSV file.');
        return;
      }
  
      const formData = new FormData();
      formData.append('file', file, file.name);
      this.fileName = file.name;
      this.file = file;
      
      this.adminService.ValidateUserEmails(formData).pipe(
        catchError(error => {
          this.notificationService.errorTopRight('Something went wrong. Unable to process file at the moment.')
          console.log('Error', error);
          return of(null);
        })
      ).subscribe(data => {
        this.uploadResult = data;
        if(data.isSuccess) {
          // this.notificationService.successTopRight('File Validated successfully');
          this.showDropBox = false;
        } else {
          this.notificationService.errorTopRight('Something is wrong with the file, Please check the file format and columns');
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
    this.initializeMessageForm();
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension !== 'csv') {
        this.notificationService.errorTopRight('Please upload a valid .csv file');
        input.value = '';
        return;
      }
  
      const formData = new FormData();
      formData.append('file', file, file.name);
      this.fileName = file.name;
      this.file = file;
      this.adminService.ValidateUserEmails(formData).pipe(
        catchError(error => {
          this.notificationService.errorTopRight('Something went wrong. Unable to process file at the moment.')
          console.log('Error', error);
          return of(null);
        })
      ).subscribe(data => {
        this.uploadResult = data;
        if (data.isSuccess) {
          this.showDropBox = false;
          // this.notificationService.successTopRight('File validated successfully');
        } else {
          this.notificationService.errorTopRight('Something is wrong with the file, Please check the file format and columns.');
        }
      });
    }
  }

  getTimeZoneOffset(): string {
    const now = new Date();
    const formattedDate = formatDate(now, 'zzz', this.locale);
    const timezoneOffset = formattedDate.replace('GMT', ' GMT');
    return timezoneOffset; // e.g., "+05:30 GMT"
  }

  getUserTimeZone(): string {
    return Intl.DateTimeFormat('en-US', { timeZoneName: 'long' }).resolvedOptions().timeZone;
  }
  SendMessage(type) {
    if(type !== 'Quick Send' && this.messageForm.value.ScheduledDateTime === '') {
      return this.notificationService.errorTopRight('Please select the date and time.')
    }
    const userTimeZone = this.getUserTimeZone();
    
    if (this.updateMessage) {
      const requestObject = {
        "delete": false,
        "title": this.messageForm.value.subject,
        "message": this.messageForm.value.body,
        'scheduleDateTime': type === 'Quick Send' ? null : this.messageForm.value.ScheduledDateTime,
        "importFileId": this.FileId,
        "scheduledDateTimeZone": userTimeZone
      }
      this.adminService.UpdateNotificationMsg(requestObject).subscribe((resp) => {
        if (resp.isSuccess) {
          this.notificationService.successTopRight('Message Updated Successfully')
          this.updateMessage = false;
          this.initializeMessageForm();
          this.ImportHistoryPaginated();
          this.uploadResult = null;
          this.showDropBox = true;
          this.closeMessageDialog()
        }
      })
    } else {
      const MessageFormData = this.messageForm.value;
      if (this.file) {
        const formData = new FormData();
        formData.append('Title', MessageFormData.subject);
        formData.append('Message', MessageFormData.body);
        formData.append('IsAlert', JSON.stringify(false));
        formData.append('Ishighlithed', JSON.stringify(true));
        formData.append('ScheduledDateTime', MessageFormData.ScheduledDateTime);
        formData.append('scheduledDateTimeZone', userTimeZone); // Include time zone in the form data
        formData.append('file', this.file, this.file.name);
        
        this.adminService.SaveOrUpdateBulkNotifications(formData).subscribe(data => {
          if(data.isSuccess){
            this.notificationService.successTopRight('File upload request submitted');
            this.ImportHistoryPaginated();
            this.uploadResult = null;
            this.showDropBox = true;
            this.closeMessageDialog()
          }
        });
      } else {
        console.error('No file available for upload');
      }
    }
  }
  
  closeMessageDialog() {
    this.messageForm.controls['ScheduledDateTime'].setValue('');
    this.messageDialog.close();
  }

  changePageCount(event) {
    this.apiRequest.itemCount = event;
    this.apiRequest.pageIndex = 1;
    this.currentPage = 1;
    this.ImportHistoryPaginated();
  }

  changeUserListPageCount(event) {
    this.userMessageHistoryApiRequest.itemCount = event;
    this.userMessageHistoryApiRequest.pageIndex = 1;
    this.getUserMessageDetails(this.currentRowId, undefined, false);
  }

  cancelUpload() {
   
    this.uploadResult = null;
    this.fileName = null;
    this.file = null; 
    this.showDropBox = true;
    this.updateMessage = false;
  }

  exportToExcel(columnNames): void {
   
    const csvContent = columnNames.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Message Template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
  downloadTemplate(): void {
    const columnNames = ['Email']
    this.exportToExcel(columnNames)
  }

  
  exportAllResult(elementId: string) {
    const request = {
      itemCount: 100000,
      pageIndex: 1,
      sortBy: "createdDateTime",
      search: "",
      sortDirection: "desc",
      filter: []
    };
    
    this.service.getUserMessageDetails(elementId, request).subscribe(data => {
      const exportData: any[] = this.getExportData(data.results);
      if (exportData && exportData.length > 0) {
        this.exportCSV(exportData, 'UserDetails');
      } else {
        this.notificationService.errorTopRight('Data not found.');
      }
    });
  }
  
  stripHtmlTags(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;

    let text = div.textContent || div.innerText || '';
  
    text = text.replace(/\u00A0/g, ' ').trim();
  
    return text;
  }
  
  getExportData(result: any[]): any[] {
    const data: any[] = [];
    if (result && result.length > 0) {
      result.forEach(element => {
        let externalOrderIds = '';
        if (element.orderRedemptionItemPaginated && element.orderRedemptionItemPaginated.length > 0) {
          externalOrderIds = element.orderRedemptionItemPaginated.map(item => item.externalOrderId).join(', ');
        }
        const formattedOrderDate = this.datePipe.transform(element.orderDate, 'MM-dd-yyyy');
        
        const cleanMessage = this.stripHtmlTags(element.message);
        
        data.push({
          'User Id': element.bpNumber,
          'Email': element.email,
          'First Name': element.firstName,
          'Last Name': element.lastName,
          'Subject': element.title,
          'Body': cleanMessage
        });
      });
    }
    return data;
  }
  
  exportCSV(data: any[], fileName: string) {
    const csvData = this.convertToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${fileName}.csv`); 
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
  
  convertToCSV(objArray: any[]): string {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = '';
  
    for (const index in array[0]) {
      if (array[0].hasOwnProperty(index)) {
        row += index + ',';
      }
    }
    row = row.slice(0, -1);
    str += row + '\r\n';
  
    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (const index in array[i]) {
        if (array[i].hasOwnProperty(index)) {
          if (line !== '') line += ',';
          line += `"${array[i][index]}"`; 
        }
      }
      str += line + '\r\n';
    }
    return str;
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