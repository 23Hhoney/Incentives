import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'app/shared/notification/notification';
import { SkuImportService } from './sku-import.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DataGridColumnHeader, COLUMN_TYPE } from 'app/shared/component/data-grid/data-grid.service';
import { MatDialog } from "@angular/material/dialog";
import { IncentiveAdminPanelService } from '../incentive-admin-panel.service';
import { DatePipe } from '@angular/common';
import { ExportExcelService } from 'app/modules/pages/excel-export-service.service';
import moment from 'moment';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-sku-import',
  templateUrl: './sku-import.component.html',
  styleUrls: ['./sku-import.component.scss']
})
export class SkuImportComponent implements OnInit {

  fileName;
  file;
  bulkUpdateFileName;
  bulkUpdateFile;
  popupModal: any;
  gridColumns: DataGridColumnHeader[] =[];
  columnType = COLUMN_TYPE;
  pageLimit = 10;
  sortBy = '';
  modalReference: any;
  isLoading: boolean = false;
  sortDirection = '';
  totalRecords = 0;
  showFilter = true;
  dataSource = [];
  programStartDate = null;
  programEndDate = null;
  showViewReportButton = false;
  showBulkUpdateViewReportButton = false;
  selectedTabIndex = 0;
  skuTypeOptions = [
    { id: 1, value: 'Eligible' },
    { id: 2, value: 'Not Eligible' }
  ];
  importDataSource = [];
  importLoading = false;
  importGridColumns: DataGridColumnHeader[];
  importPages: number[] = [];
  importHistoryTotalPages: number;
  importCurrentPage = 1;
  importHistoryTotalRecords = 0;
  selectedSKUList = [];
  editInProgress = false;
  selectAllCheckbox = false; 
  apiRequest = {
    itemCount: 25,
    pageIndex: 1,
    pageLimit: 10,
    sortBy: "sku",
    search: "",
    sortDirection: "desc",
    filter: []
  };

  importHistoryApiRequest = {
    pageIndex: 1,
    sortBy: "createDate",
    itemCount: 25,
    sortDirection: "desc",
    search: "",
    objectName: "SKUListImport",
    filter: [
    ]
  };

  showDropBox = true;
  showBulkUpdateDropBox = true;
  uploadResult = null;
  bulkUpdateUploadResult = null;
  fileId: any;
  filterTags = [];
  pageIndex = 1;
  pages: number[] = [];
  totalPages: number;
  formFilter: FormGroup;
  manageProgramPeriod: FormGroup;
  addSkuForm: FormGroup;
  importHistoryRadioForm: FormGroup;
  selectedData = null;

  constructor(
    private _notificationService: NotificationService,
    private skuImportService: SkuImportService,
    private _formbuilder: FormBuilder,
    private _matDialog: MatDialog,
    private adminPanelService:IncentiveAdminPanelService,
    private datePipe: DatePipe,
    private exportExcelService: ExportExcelService,
  ) {}

  ngOnInit(): void {
    this.gridColumns = this.getGridSettings();
    this.importGridColumns = this.getGridSettingsImport();
    this.getSKUImportData();
    this.formFilter = this._formbuilder.group({
      skuId: new FormControl(''),
      category: new FormControl(''),
      subCategory: new FormControl(''),
      brand: new FormControl(''),
      productLine: new FormControl(''),
      itemName: new FormControl(''),
    });
    this.importHistoryRadioForm = this._formbuilder.group({
      selectedImportHistory: new FormControl('import')
    });

    this.importHistoryRadioForm.get('selectedImportHistory').valueChanges.subscribe((value) => {
      if (value === 'import') {
        this.importHistoryApiRequest.objectName = 'SKUListImport'
      } else {
        this.importHistoryApiRequest.objectName = 'SKUListUpdate'
      }
      this.ImportHistoryPaginated();
    });
    this.manageProgramPeriod = this._formbuilder.group({
      start: [''],
      end: ['']
    });

    this.addSkuForm = this._formbuilder.group({
      skU_id: new FormControl(''),
      points: new FormControl(''),
      listPrice: new FormControl(''),
      startDate: new FormControl(''),
      endDate: new FormControl(''),
      productName: new FormControl(''),
      brand: new FormControl(''),
      productLine: new FormControl(''),
      category: new FormControl(''),
      subCategory: new FormControl(''),
      skuType: new FormControl(''),
      upc: new FormControl(''),
    })
    this.ImportHistoryPaginated();
  }

  handleFileChange(event) {
    this.file = event.target.files[0];
    if (event.target.files && event.target.files[0]) {
      this.fileName = this.file.name;
            
    }
    console.log(this.file,'======file=====', this.fileName);
  }

  handleUpload() {
    let formData = new FormData();
    if (this.selectedTabIndex === 0) {
      if (!this.file) {
        this._notificationService.errorTopRight('Please select file.');
      }
      formData.append("file", this.file, this.fileName);
      this.skuImportService.uploadSKUFile(formData).subscribe(
        (result: any) => {
          this.showDropBox = true;
          this.uploadResult = null; 
        });
    } else {
      if (!this.bulkUpdateFile) {
        this._notificationService.errorTopRight('Please select file.');
      }
      formData.append("file", this.bulkUpdateFile, this.bulkUpdateFileName);
      this.skuImportService.uploadBulkUpdateSKUFile(formData).subscribe(
        (result: any) => {
          this.showBulkUpdateDropBox = true;
          this.bulkUpdateUploadResult = null;
          
        });
    }
    this.ImportHistoryPaginated();
    this.getSKUImportData();
 
  }

  downloadTemplate() {
    this.skuImportService.downloadTemplate().subscribe(data => {
      // console.log('========template=========', data);
      var blob = new Blob([data], { type: 'text/csv' });
      var objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl);
    });
  }
  downloadTemplateForUpdate() {
    this.skuImportService.downloadTemplateforUpdate().subscribe(data => {
      // console.log('========template=========', data);
      var blob = new Blob([data], { type: 'text/csv' });
      var objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl);
    });
  }

  ImportHistoryPaginated() {
    this.importDataSource = [];
    this.importHistoryTotalRecords = 0;
    this.importLoading = true;
  
    this.adminPanelService.ImportHistoryPaginated(this.importHistoryApiRequest).subscribe(data => {
      if (data) {
        if (data.results) {
          this.importDataSource = data.results;
          this.importDataSource.forEach(element => {
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
          if (data.status === "Inprogress") {
            data.status = "In Progress";
          }
        }
        this.importHistoryTotalRecords = data.totalRecords;
        this.calculateImportHistoryTotalPages();
      } else {
        this._notificationService.errorTopRight('Failed to fetch file history');
      }
      this.importLoading = false;
    });
  }
  
  
  

  calculateImportHistoryTotalPages() {
    this.importHistoryTotalPages = Math.ceil(this.importHistoryTotalRecords / this.importHistoryApiRequest.itemCount);
    this.importPages = Array.from({ length: this.importHistoryTotalPages }, (_, i) => i + 1);
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  removeFilterLabel(label): void {
    this.filterTags = this.filterTags.filter(item => item.oid !== label.oid);
    this.formFilter.get(label.oid)?.setValue('');
    this.apiRequest.filter.map((filter)=>{
      if (filter.oid === label.oid) {
        filter.value = '';
      }
    })
    this.getSKUImportData();
  }

  getGridSettingsImport(): DataGridColumnHeader[] {
    return [
      { columnName: 'fileName', columnTitleKey: 'File Name', columnValue: 'fileName', type: this.columnType.TEXT, show: true, sort: true },
      { columnName: 'status', columnTitleKey: 'Status', columnValue: 'status', type: this.columnType.Status, show: true, sort: true },
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
            buttonAction: 'download',
            icon: 'download',
            tooltipKey: 'download',
            buttonClass: 'btn-color-600',
           
          },
          {
            buttonAction: 'error',
            icon: 'error_outline',
            tooltipKey: 'error download',
            buttonClass: 'btn-color-600',
          },
        ],
        show: true,
        sort: false,
      }
    ];
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
        columnName: 'SkuId',
        columnTitleKey: 'SKU\'s',
        columnValue: 'skU_id',
        type: this.columnType.TEXT,
        show: true,
       sort: true,
      },
      {
        columnName: 'id',
        columnTitleKey: 'SKU Row Id',
        columnValue: 'id',
        type: this.columnType.TEXT,
        show: true,
       sort: true,
      },
      {
        columnName: 'RewardedValue',
        columnTitleKey: 'Point Value',
        columnValue: 'points',
        type: this.columnType.TEXT,
        show: true,
       sort: true,
      }, 
      {
        columnName: 'listPrice',
        columnTitleKey: 'List Price Values',
        columnValue: 'listPrice',
        type: this.columnType.TEXT,
        show: true,
       sort: true,
      }, 
      {
        columnName: 'StartDate',
        columnTitleKey: 'Start Date',
        columnValue: 'startDate',
        type: this.columnType.DATE,
        show: true,
        sort: true,
      }, 
      {
        columnName: 'EndDate',
        columnTitleKey: 'End Date',
        columnValue: 'endDate',
        type: this.columnType.DATE,
        show: true,
        sort: true,
      }, 
      {
        columnName: 'ItemName',
        columnTitleKey: 'Item Name',
        columnValue: 'productName',
        type: this.columnType.TEXT_W_ELLIP,
        show: true,
       sort: true,
      },
      {
        columnName: 'brand',
        columnTitleKey: 'Brand',
        columnValue: 'brand',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      },
      {
        columnName: 'productLine',
        columnTitleKey: 'Product Line',
        columnValue: 'productLine',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      },
      {
        columnName: 'Category',
        columnTitleKey: 'Category',
        columnValue: 'category',
        type: this.columnType.TEXT_W_ELLIP,
        show: true,
        sort: true,
      },
      {
        columnName: 'SubCategory',
        columnTitleKey: 'Sub Category',
        columnValue: 'subCategory',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      },
      {
        columnName: 'skuTypeDisplay',
        columnTitleKey: 'Sku Type',
        columnValue: 'skuTypeDisplay',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      },
      {
        columnName: 'edit',
        columnTitleKey: 'Edit',
        columnValue: 'id',
        type: this.columnType.BUTTON,
        button: {
          buttonAction: 'for_edit',
          icon: 'pen',
          isIconSvg: true,
          tooltipKey: 'edit',
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
          isIconSvg: true,
          tooltipKey: 'Delete',
          buttonClass: 'btn-color-600',
        },
        show: true,
        sort: false,
      }
    ]
  }

  getSKUImportData() {
    this.dataSource = [];
    this.skuImportService.getSKUList(this.apiRequest).subscribe(data => {
      if (data) {
        if (data.results) {
          this.dataSource = data.results.map(item => ({
            ...item,
            skuTypeDisplay: item.skuType === 1 ? 'Eligible' : 'Not Eligible'
          }));
        }
        if (data.status === "Inprogress") {
          data.status = "In Progress";
        } 
        this.totalRecords = data.totalRecords;
        this.calculateTotalPages();
      }
    });
  }
  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalRecords / this.apiRequest.itemCount);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onPageChange(pageIndex: number) {
    if (pageIndex < 1 || pageIndex > this.totalPages) return;
    this.apiRequest.pageIndex = pageIndex;
    this.pageIndex = pageIndex;
    this.selectedSKUList = [];
    this.getSKUImportData();
  }

  onImportHistoryPageChange(pageIndex: number) {
    if (pageIndex < 1 || pageIndex > this.importHistoryTotalPages) return;
    this.importHistoryApiRequest.pageIndex = pageIndex;
    this.importCurrentPage = pageIndex;
    this.ImportHistoryPaginated();
  }

  handleCheckBoxClick(event) {
    if (event.checkedList) {
      this.selectedSKUList = event.checkedList;
  
      // Update `selectAllCheckbox` based on selected items compared to total items
      const totalSKUs = this.dataSource?.length || 0; // Replace `skuDataSource` with your data source variable
      this.selectAllCheckbox = this.selectedSKUList.length === totalSKUs;
    }
  }

  handleSortChange(event) {
    this.sortBy = event.active;
    this.sortDirection = event.direction;

    this.apiRequest.sortBy = this.sortBy;
    this.apiRequest.sortDirection = this.sortDirection.toLowerCase();
    
    this.getSKUImportData();
  }

  handleImportSortChange(event) {
    this.importHistoryApiRequest.sortBy = event.active;
    this.importHistoryApiRequest.sortDirection = event.direction.toLowerCase();
    this.ImportHistoryPaginated();
  }

  handleSearch() {
    const rawValue = this.formFilter.getRawValue();
    const filterPayload = [
      {
        oid: 'skuId',
        value: rawValue.skuId ?? '',
        displayName: 'SKU'
      },
      {
        oid: 'brand',
        value: rawValue.brand ?? '',
        displayName: 'Brand'
      },
      {
        oid: 'productLine',
        value: rawValue.productLine ?? '',
        displayName: 'Product Line'
      },
      {
        oid: 'category',
        value: rawValue.category ?? '',
        displayName: 'Category'
      },
      {
        oid: 'subCategory',
        value: rawValue.subCategory ?? '',
        displayName: 'Subcategory'
      },
      {
        oid: 'itemName',
        value: rawValue.itemName ?? '',
        displayName: 'Item Name'
      },
    ]


  this.updateResultTags(filterPayload);
  this.apiRequest.filter = filterPayload;
  this.apiRequest.pageIndex = 1; 
  this.pageIndex = 1;       
  this.selectedSKUList = [];    
  this.getSKUImportData();
  }

  onBulkUpdateFileSelect(event: Event) {
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
      this.bulkUpdateFileName = file.name;
      this.bulkUpdateFile = file;

      this.skuImportService.validateUpdateFileForSKUListManager(formData).subscribe(data => {
        this.bulkUpdateUploadResult = data;
        if (data.isSuccess) {
          this.showBulkUpdateDropBox = false;
          this.showBulkUpdateViewReportButton = data.errorRecordCount === 0 ? false : true;
        } else {
          this._notificationService.errorTopRight('Something is wrong with the file, Please check the file format and columns');
        }
      });
    }
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
      this.skuImportService.validateImportFileForSKUListManager(formData).subscribe(data => {
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

  viewUploadedReport() {
    this.fileId = this.uploadResult.fileId
    this.downloadImportData()
  }

  viewBulkUpdateUploadedReport() {
    this.fileId = this.bulkUpdateUploadResult.fileId;
    this.downloadImportData();
  }

  downloadImportData() {
    this.skuImportService.downloadImportData(this.fileId).subscribe(data=>{
      const blob = new Blob([data], { type: 'application/csv' });
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'SKUListImport_'+this.fileId+'.csv';
      a.click();
      URL.revokeObjectURL(objectUrl);
    })
  }
  downloadErrorImportData() {
    this.skuImportService.downloadErrorImportData(this.fileId).subscribe(data=>{
      const blob = new Blob([data], { type: 'application/csv' });
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'SKUListImport_'+this.fileId+'.csv';
      a.click();
      URL.revokeObjectURL(objectUrl);
    })
  }

  cancelUpload() {
    console.log(this.selectedTabIndex);
    if (this.selectedTabIndex === 0) {
      this.uploadResult = null;
      this.fileName = null;
      this.file = null; 
      this.showDropBox = true;
    } else {
      this.bulkUpdateUploadResult = null;
      this.bulkUpdateFileName = null;
      this.bulkUpdateFile = null; 
      this.showBulkUpdateDropBox = true;

    }
    
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
      
      this.skuImportService.validateImportFileForSKUListManager(formData).subscribe(data => {
        this.uploadResult = data;
        if(data.isSuccess) {
          this.showDropBox = false;
          this.showViewReportButton = data.errorRecordCount === 0 ? false : true;
        } else {
          this._notificationService.errorTopRight('Something is wrong with the file, Please check the file format and columns');
        }
      });
    }
  }

  onBulkUpdateFileDrop(event: DragEvent) {
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
      this.bulkUpdateFileName = file.name;
      this.bulkUpdateFile = file;
      this.skuImportService.validateUpdateFileForSKUListManager(formData).subscribe(data => {
        this.bulkUpdateUploadResult = data;
        if(data.isSuccess) {
          this.showBulkUpdateDropBox = false;
          this.showBulkUpdateViewReportButton = data.errorRecordCount === 0 ? false : true;
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

  handleEditSKU(item, dialogName) {
    this.addSkuForm = this._formbuilder.group({
      skU_id: item.skU_id,
      points: item.points,
      listPrice: item.listPrice,
      startDate: item.startDate,
      endDate: item.endDate,
      productName: item.productName,
      brand: item.brand,
      productLine: item.productLine,
      category: item.category,
      subCategory: item.subCategory,
      upc: item.upc,
      skuType: item.skuType
    })
    this.openDialog(dialogName);
  }

  openDialog(dialogName) {
    this.popupModal = this._matDialog.open(dialogName);
  }

  openAddSkuDialog(dialogName) {
    this.editInProgress = false;
    this.popupModal = this._matDialog.open(dialogName);
  }

  closeDialog() {
    this.popupModal.close()
    this.addSkuForm.reset()
    this.editInProgress = false;
  }

  saveManageProgramPeriod() {
    if (this.manageProgramPeriod.get('start')?.value) {
      this.programStartDate = this.formatSelectedDate(this.manageProgramPeriod.get('start').value);
    } else {
      this.programStartDate = null;
    }
    if (this.manageProgramPeriod.get('end')?.value) {
      this.programEndDate = this.formatSelectedDate(this.manageProgramPeriod.get('end').value);
    } else {
      this.programEndDate = null;
    }
    this.popupModal.close()
  }

  onFilterClear() {
    this.manageProgramPeriod.reset();
  }

  changePageCount(event) {
    this.importHistoryApiRequest.itemCount = event;
    this.importCurrentPage = 1;
    this.importHistoryApiRequest.pageIndex = 1
    this.ImportHistoryPaginated();
  }

  changeExportPageCount(event) {
    this.apiRequest.itemCount = event;
    this.pageIndex = 1;
    this.apiRequest.pageIndex = 1
    this.getSKUImportData();
  }

  formatSelectedDate(value) {
    const date = new Date(value);
    console.log(date);
    const year = date.getFullYear();
    const month = this.padZero(date.getMonth() + 1);
    const day = this.padZero(date.getDate());
    const formattedDate = `${month}-${day}-${year}`;
    return formattedDate
  }

  padZero(num: number, size: number = 2): string {
    let s = num.toString();
    while (s.length < size) s = '0' + s;
    return s;
  }

  exportAllCurrentPeriodSKU() {
    const startDate = new Date(this.manageProgramPeriod.get('start').value);
    const endDate = new Date(this.manageProgramPeriod.get('end').value);
    const formattedStartDate = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')}T00:00:00.0Z`;
    
    const formattedEndDate = `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}T23:59:59`;
  
    const payload = {
      startDate: formattedStartDate,
      endDate: formattedEndDate
    };
  
    this.skuImportService.exportAllCurrentperiodSKU(payload).subscribe(data => {
      const exportData: any[] = this.getExportData(data);
      
      if (exportData && exportData.length > 0) {
        this.downloadCSV(exportData, `Sku_Data_${formattedStartDate}_${formattedEndDate}.csv`);
      }
    });
  }
  

  updateResultTags(filterPayload) {
    this.filterTags = filterPayload;
  }

  addSKU() {
    const skuData = this.addSkuForm.getRawValue();
  
    if (skuData.skuType.length === 0 || skuData.skuType === null) {
      this._notificationService.errorTopRight('Please select SKU Type');
      return;
    }
  
    // Convert startDate and endDate to UTC
    const payload = {
      ...skuData,
      startDate: this.convertUTC(skuData.startDate),
      endDate: this.convertUTC(skuData.endDate),
    };
  
    this.skuImportService.addSaveSKU(payload).subscribe(data => {
      if (data.isSuccess) {
        this.closeDialog();
        this.addSkuForm.reset();
        this.getSKUImportData();
      } else {
        this._notificationService.errorTopRight('Something went wrong. Failed to add record');
      }
    });
  }
  

  deleteSKU() {
    const payload = {id: this.selectedData.id};
    this.skuImportService.deleteSKU(payload).subscribe(data => {
      if (data.isSuccess) {
        this.closeDialog();
        this.selectedData = null;
        this._notificationService.successTopRight(data.message)
        this.getSKUImportData();
      } else {
        this._notificationService.errorTopRight('Something went wrong. Failed to delete record');
      }
    })
  }

  convertUTC(date) {
    const StartDate = new Date(date);
    const utcDate = new Date(Date.UTC(StartDate.getFullYear(), StartDate.getMonth(), StartDate.getDate()));
    return utcDate;
  }
  saveSKU() {
    const skuData = this.addSkuForm.getRawValue();
  
    if (skuData.skuType.length === 0 || skuData.skuType === null) {
      this._notificationService.errorTopRight('Please select SKU Type');
      return;
    }
  
    const payload = {
      brand: skuData.brand,
      category: skuData.category,
      startDate: this.convertUTC(skuData.startDate),
      endDate: this.convertUTC(skuData.endDate),
      id: this.selectedData.id,
      listPrice: skuData.listPrice,
      points: skuData.points,
      productLine: skuData.productLine,
      productName: skuData.productName,
      skU_id: skuData.skU_id,
      subCategory: skuData.subCategory,
      upc: skuData.upc,
      skuType: skuData.skuType
    };
  
    this.skuImportService.addSaveSKU(payload).subscribe(data => {
      if (data.isSuccess) {
        this.closeDialog();
        this.addSkuForm.reset();
        this.getSKUImportData();
      } else {
        this._notificationService.errorTopRight('Something went wrong. Failed to save data');
      }
    });
  }

  handleButtonClick(event, addEditDialog, deleteConfirmation) {
    switch (event.buttonAction) {
      case 'download':
        this.fileId = event.item.fileId;
        this.downloadImportData();
        break;
      case 'error':
        this.fileId = event.item.fileId;
        this.downloadErrorImportData();
        break;
      case 'for_edit':
        this.editInProgress = true;
        this.selectedData =  event.item;
        this.handleEditSKU(event.item, addEditDialog);
        break;
      case 'for_delete':
        this.selectedData = event.item;
        this.openDialog(deleteConfirmation);
        break;
      default:
        break;
    }
  }
  

  exportSelectedSKUs() {
    const isAll = this.selectAllCheckbox; 
    const payload = { ids: isAll ? null : this.selectedSKUList.map(sku => sku.id) };
  
    this.isLoading = true; // Show loader and disable button
  
    this.skuImportService.exportSelectedSKUs(payload, isAll).subscribe(
      data => {
        this.isLoading = false; // Hide loader after response
  
        const exportData: any[] = this.getExportData(data);
        if (exportData && exportData.length > 0) {
          this.downloadCSV(exportData, 'Sku_Data.csv');
        }
      },
      err => {
        this.isLoading = false; // Hide loader if an error occurs
        console.error('Export Failed', err);
      }
    );
  }
  
  getExportData(result: any[]): any[] {
    const data: any[] = [];
    if (result && result.length > 0) {
      result.forEach(element => {
        data.push({
          'SKU': `"${element.skU_id}"`,
          'SKURowId': `"${element.id}"`,
          'Brand': `"${element.brand}"`,
          'ProductName': `"${element.productName}"`,
          'ProductLine': `"${element.productLine}"`,
          'Category': `"${element.category}"`,
          'SubCategory': `"${element.subCategory}"`,
          'Points': `"${element.points}"`,
          'UPC': `"${element.upc}"`,
          'ListPrice': `"${element.listPrice}"`,
          'StartDate': element.startDate ? `"${this.datePipe.transform(element.startDate, 'MM/dd/yyyy')}"` : '""',
          'EndDate': element.endDate ? `"${this.datePipe.transform(element.endDate, 'MM/dd/yyyy')}"` : '""',
          'SkuType': `"${element.skuType}"`
        });
      });
    }
    return data;
  }
  
  
  downloadCSV(data: any[], filename: string) {
    const csvData = this.convertToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
  }
  
  convertToCSV(objArray: any[]): string {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = '';
  
    // Get the headers
    for (const index in array[0]) {
      if (array[0].hasOwnProperty(index)) {
        row += index + ',';
      }
    }
    row = row.slice(0, -1); // Remove the last comma
    str += row + '\r\n';
  
    // Get the values
    array.forEach(item => {
      let line = '';
      for (const index in item) {
        if (item.hasOwnProperty(index)) {
          if (line !== '') line += ',';
          line += item[index];
        }
      }
      str += line + '\r\n';
    });
  
    return str;
  }
    
  

  onTabChange(event) {
    this.file = null;
    this.selectedTabIndex = event.index;
    if (event.index == 0) {
      this.ImportHistoryPaginated();
    } else {
      this.getSKUImportData();
    }
  }
}
