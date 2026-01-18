import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { COLUMN_TYPE, DataGridColumnHeader } from 'app/shared/component/data-grid/data-grid.service';
import { NotificationService } from 'app/shared/notification/notification';
import { IncentiveAdminPanelService } from '../incentive-admin-panel.service';
import { DatePipe } from '@angular/common';
import moment from 'moment';

@Component({
  selector: 'app-points-credit-file-upload',
  templateUrl: './points-credit-file-upload.component.html',
  styleUrls: ['./points-credit-file-upload.component.scss']
})
export class PointsCreditFileUploadComponent {
  dataSourceTab1 = [];
  loading = false;
  pages: number[] = [];
  currentPage = 1;
  totalPages: number;
  gridColumnsTab1: DataGridColumnHeader[];
  columnType = COLUMN_TYPE;
  event: { pageIndex: number; pageSize: number; };
  sortBy = '';
  modalReference: any;
  private file: File | null = null;  // Store the file
  sortDirection = '';
  totalRecords = 0;
  apiRequest = {
    pageIndex: 1,
    sortBy: "createDate",
    itemCount: 25,
    sortDirection: "desc",
    search: "",
    objectName: null,
    filter: [
    ]
  };
  
  showDropBox = true;
  uploadResult: any = null;
  fileName: string | null = null;
  FileId: any;
  exportToExcel(): void {
    const columnNames = ['UserID', 'ShippedDate', 'InvoiceNumber', 'SKU', 'Quantity'];
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
  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private service:IncentiveAdminPanelService,
    private datePipe: DatePipe,
  ) {}

  ngOnInit(){
    this.gridColumnsTab1 = this.getGridSettingsTab1();
    this.sortBy = this.apiRequest.sortBy;
    this.ImportHistoryPaginated();
  }

  getGridSettingsTab1(): DataGridColumnHeader[] {
    return [
      { columnName: 'fileName', columnTitleKey: 'File Name', columnValue: 'fileName', type: this.columnType.TEXT, show: true, sort: true },
      { columnName: 'Status', columnTitleKey: 'Status', columnValue: 'status', type: this.columnType.Status, show: true, sort: true },
      { columnName: 'createdDateTime', columnTitleKey: 'Date Uploaded', columnValue: 'createdDateTime', type: this.columnType.TEXT, show: true, sort: true },
      { columnName: 'dateProcessed', columnTitleKey: 'Date Processed', columnValue: 'dateProcessed', type: this.columnType.TEXT, show: true, sort: true },
      
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

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalRecords / this.apiRequest.itemCount);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  onPageChange(pageIndex: number) {
    if (pageIndex < 1 || pageIndex > this.totalPages) return;
    this.apiRequest.pageIndex = pageIndex;
    this.currentPage = pageIndex;
    this.ImportHistoryPaginated();
  }

  changePageCount(event) {
    this.apiRequest.itemCount = event;
    this.currentPage = 1;
    this.apiRequest.pageIndex = 1
    this.ImportHistoryPaginated();
  }

  viewUploadedReport() {
    this.FileId = this.uploadResult.fileId
    this.DownloadImportData()
  }
  ImportHistoryPaginated() {
    this.dataSourceTab1 = [];
    this.loading = true;
  
    this.service.ImportHistoryPaginated(this.apiRequest).subscribe(data => {
      if (data) {
        if (data.results) {
          this.dataSourceTab1 = data.results;
  
          this.dataSourceTab1.forEach(element => {
            if (element?.createdDateTime) {
              
              element.createdDateTime = moment.utc(element.createdDateTime)
                .utcOffset('-05:00')  
                .format('MM/DD/YYYY');
            }
            if (element?.dateProcessed) {
              element.dateProcessed = moment.utc(element.dateProcessed)
                .utcOffset('-05:00')  
                .format('MM/DD/YYYY');
            }
            if (element.status === "InProgress") {
              element.status = "In Progress";
            }
          });
        }
        this.totalRecords = data.totalRecords;
        this.calculateTotalPages();
      }
      this.loading = false;
    });
  }
  
  
  
  
  handleButtonClick(event) {
    if (event.buttonAction === 'for_edit') {
      this.FileId=event.item.fileId;
      this.DownloadImportData();
    } 
  }
  DownloadImportData()
  {
    this.service.DownloadImportData(this.FileId).subscribe(data=>{
      const blob = new Blob([data], { type: 'application/csv' });
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'CreditImport_'+this.FileId+'.csv'; // Replace with the desired file name and extension
      a.click();
      //window.open(objectUrl);
      URL.revokeObjectURL(objectUrl);
    })
  }
  
  applySort(event) {
    this.sortBy = event.active;
    this.sortDirection = event.direction;
    this.apiRequest.sortBy = this.sortBy;
    this.apiRequest.sortDirection = this.sortDirection.toLowerCase();
    this.ImportHistoryPaginated();
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
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
      
      this.service.ValidateImportFileForCredit(formData).subscribe(data => {
        this.uploadResult = data;
        if(data.isSuccess) {
          // this.notificationService.successTopRight('File Validated successfully');
          this.showDropBox = false;
        } else {
          this.notificationService.errorTopRight('Some error');
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
        this.notificationService.errorTopRight('Please upload a valid .csv file');
        input.value = ''; // Clear the file input
        return;
      }
  
      const formData = new FormData();
      formData.append('file', file, file.name);
      this.fileName = file.name;
      this.file = file;
      this.service.ValidateImportFileForCredit(formData).subscribe(data => {
        this.uploadResult = data;
        if (data.isSuccess) {
          this.showDropBox = false;
          // this.notificationService.successTopRight('File validated successfully');
        } else {
          this.notificationService.errorTopRight('Some error');
        }
      });
    }
  }

  proceedWithUpload() {
    if (this.file) {
      const formData = new FormData();
      formData.append('file', this.file, this.file.name);
      
      this.service.ImportFileForCreditStep2(formData).subscribe(data => {
        if(data.isSuccess){
          this.notificationService.successTopRight('File upload request submitted');
          this.ImportHistoryPaginated();
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

}
