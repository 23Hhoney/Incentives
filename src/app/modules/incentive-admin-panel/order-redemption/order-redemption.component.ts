import { ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { COLUMN_TYPE, DataGridColumnHeader } from 'app/shared/component/data-grid/data-grid.service';
import { NotificationService } from 'app/shared/notification/notification';
import { OrderRedemptionService } from './order-redemption.service';
import { IncentiveAdminPanelService } from '../incentive-admin-panel.service';
import { ExportExcelService } from 'app/modules/pages/excel-export-service.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { saveAs } from 'file-saver';
import { catchError, debounceTime, distinctUntilChanged, map, Observable, of, startWith, Subscription, switchMap } from 'rxjs';
import { Users } from '../points-credit-manager/users.types';

@Component({
  selector: 'app-order-redemption',
  templateUrl: './order-redemption.component.html',
  styleUrls: ['./order-redemption.component.scss']
})
export class OrderRedemptionComponent {
  @ViewChild('pointsUserDialog') pointsUserDialog!: TemplateRef<any>;
  NegativePointsDialog!: MatDialogRef<any>;
  bpNumber: string;
  gridColumns: DataGridColumnHeader[] =[];
  newOrderGridColumns: DataGridColumnHeader[] = [];
  columnType = COLUMN_TYPE;
  editInProgress: Boolean;
  todayDate: Date = new Date();
  popUpModal: any;
  popUpModalNewOrder: any;
  dataSourceBulkRedemption = [];
  dataSourceUpdateBulkRedemption = [];
  bulkRedemptionLoading = false;
  openedFromHome = false;
  bulkUpdateRedemptionLoading = false;
  sortBy = '';
  sortDirection = '';
  sortByBulkRedemption = '';
  sortDirectionBulkRedemption = '';
  sortByBulkUpdateRedemption = '';
  sortDirectionBulkUpdateRedemption = '';
  selectedTab = 'Multiple Records Search'
  totalRecords = 0;
  redemptionDialogType = '';
  totalRecordsBulkRedemption = 0;
  totalRecordsBulkUpdateRedemption = 0;
  dataSource = null;
  showViewReportButton = false;
  showCreateViewReportButton = false;
  stateList = [];
  filteredUsersForDialog: Observable<Users[]>;
  selectedUserTooltipForDialog: string = '';
  selectedUserNameForDialog:any;
  selectedFullnameForDialog: string;
  orderItemStatus = [
    {
      id: 'pending',
      value: 'Pending',
    },
    {
      id: 'shipped',
      value: 'Shipped',
    },
    {
      id: 'cancelled',
      value: 'Cancelled',
    }
  ]

  orderItemTaxStatus = [
    {
      id: 'Tax Paid',
      value: 'Tax Paid',
    },
    {
      id: 'Tax Not Paid',
      value: 'Tax Not Paid',
    }
  ]

  newOrderItemList=[];
  apiRequest = {
    itemCount: 25,
    pageIndex: 1,
    sortBy: "createdDateTime",
    search: "",
    sortDirection: "desc",
    objectName: "",
    filter: []
  };
  gridColumnsBulkRedemption: DataGridColumnHeader[];
  bulkRedemptionApiRequest = {
    itemCount: 25,
    pageIndex: 1,
    pageLimit: 10,
    sortBy: "createdDateTime",
    search: "",
    sortDirection: "desc",
    objectName: "OrderRedeemptionImport",
    filter: []
  };
  bulkUpdateRedemptionApiRequest = {
    itemCount: 25,
    pageIndex: 1,
    pageLimit: 10,
    sortBy: "createdDateTime",
    search: "",
    sortDirection: "desc",
    objectName: "OrderRedeemptionUpdateImport",
    filter: []
  };
  firstName: string;
  lastName: string;
  email:string;
  companyName:string
  filterTags = [];
  typeDropdown = [
    {
      id: 'All',
      value: 'All',
    },
    {
      id: 'API',
      value: 'API',
    },
    {
      id: 'Manual',
      value: 'Manual',
    },
    {
      id: 'KOHLER Rewards Card',
      value: 'KOHLER Rewards Card',
    },
    {
      id: 'KOHLER Direct Gift Cards',
      value: 'KOHLER Direct Gift Cards',
    }
  ]
  pageIndex = 1;
  pages: number[] = [];
  isDisabled=false;
  pagesNewOrder: number[] = [];
  BulkRedemptionPages: number[] = [];
  BulkUpdateRedemptionPages: number[] = [];
  totalPages: number;
  totalPagesBulkRedemption: number;
  totalPagesBulkUpdateRedemption: number;
  itemOrder: any;
  currentPageBulkRedemption = 1;
  currentPageBulkUpdateRedemption = 1;
  private file: File | null = null;
  addNewOrderForm: FormGroup;
  fileName: string | null = null;
  bulkDialog: any;
  addOrderItemForm: FormGroup;
  FileId: any;
  uploadResult: any = null;
  itemFormType = 'add';
  showDropBox = true;
  itemFormIndex = null;
  searchForm: FormGroup;
  filterForm: FormGroup;
  orderItemsArray = [];
  @ViewChild('itemOrderDialog') itemOrderDialog: TemplateRef<any>;
  @ViewChild('addNewOrder') addNewOrder: TemplateRef<any>;
  errorMessage: any;
  totalPoints: any;
  UserID = new FormControl();
  filteredUsers: Observable<Users[]>;
  selectedFullname: string;
  selectedUserTooltip: string;
  private subscription: Subscription;
  constructor(
    private _notificationService: NotificationService,
    private _formbuilder: FormBuilder,
    private _matDialog: MatDialog,
    private service: OrderRedemptionService,
    private incentiveService:IncentiveAdminPanelService,
    private adminPanelService: IncentiveAdminPanelService,
    private exportExcelService: ExportExcelService,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.setupUserSearch();

    this.route.queryParams.subscribe(params => {
      this.bpNumber = params['bpNumber'];
      if (params['bpNumber']) {
        this.filterForm.get('UserID')?.setValue(this.bpNumber);
        this.applyFilterRecords();
      }
      this.getOrderRedemptionData();
      this.getStateDropDown();
    });

    this.editInProgress = false;
    this.gridColumns = this.getGridSettings();
    this.gridColumnsBulkRedemption = this.getGridSettingsBulkRedemption();
    this.newOrderGridColumns = this.getNewOrderGridSettings();
    this.createOrderForm();
  }

  initializeForms(): void {
    this.filterForm = this._formbuilder.group({
      UserID: this.UserID,
      StartDate: new FormControl(''),
      EndDate: new FormControl(''),
      MinPoints: new FormControl(''),
      MaxPoints: new FormControl(''),
      EntryType: new FormControl(''),
      externalOrderId: new FormControl(''),
      poNumber: new FormControl(''),
    });

    this.addNewOrderForm = this._formbuilder.group({
      bpNumber: new FormControl(''),
    });
    
    this.UserID.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      if (!value) {
        this.selectedUserTooltip = '';
        this.selectedFullname = '';
      }
    });
    this.setupUserSearch();
  }

  setupUserSearch(): void {
    this.filteredUsers = this.UserID.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) => this.searchUsers(value || ''))
    );
  }

  private searchUsers(value: string): Observable<Users[]> {
    if (!value) {
      return of([]); 
    }

    const payload = { userID: value };
    return this.incentiveService.GetUserById(payload).pipe(
      map((response) => response || []), 
      catchError((error) => {
        console.error('API Error:', error);
        return of([]); 
      })
    );
  }
  onUserSelected(event: any): void {
    const selectedUser = event.option.value as Users;
    if (selectedUser) {
      this.selectedFullname = `${selectedUser.firstName} ${selectedUser.lastName}`;
      this.selectedUserTooltip = `Email: ${selectedUser.email}, ID: ${selectedUser.bpNumber}`;
      // Set bpNumber to the UserID form control
      this.filterForm.get('UserID')?.setValue(selectedUser.bpNumber);
    }
  }
  displayFn(user: Users | string): string {
    if (!user) {
      return '';
    }
    if (typeof user === 'string') {
      return user; // Return the string if that's the case
    }
    const name = user.firstName || '';
    const lastName = user.lastName || '';
    const bpNumber = user.bpNumber || '';
    return `${name} ${lastName} - ${bpNumber}`.trim();
  }
  
  formatUserDisplay(user: Users, searchTerm: string): string {
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const name = `${user.firstName} ${user.lastName}`;
    const email = user.email;
    const bpNumber = user.bpNumber;
  
    return `${name.replace(regex, `<b>$1</b>`)} (${email.replace(regex, `<b>$1</b>`)}) - ${bpNumber}`;
  }


  initializeForm(): void {
    this.searchForm = this._formbuilder.group({
      bpNumber: ['']
    });
  }

  private searchUsersfordialog(value: string | Users): Observable<Users[]> {
    if (typeof value === 'string' && !value.trim()) {
      return of([]); // Return an empty array if the input is empty or whitespace
    }

    const searchValue = typeof value === 'string' ? value.trim() : value.bpNumber || ''; // Extract bpNumber if it's a Users object
    if (!searchValue) {
      return of([]);
    }

    const payload = { userID: searchValue };

    return this.incentiveService.GetUserById(payload).pipe(
      map((response) => response || []),
      catchError((error) => {
        console.error('API Error:', error);
        return of([]); // Return an empty array on error
      })
    );
  }

  onBpNumberSelected(event: any): void {
    const selectedUser = event.option.value as Users;
    if (selectedUser) {
      this.selectedUserNameForDialog = `${selectedUser.firstName || ''} ${selectedUser.lastName || ''} (${selectedUser.email || ''}) - ${selectedUser.bpNumber || ''}`.trim();
      this.selectedFullnameForDialog = `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim();
      this.selectedUserTooltipForDialog = this.selectedUserNameForDialog;
      const bpNumberControl = this.addNewOrderForm.get('bpNumber');
      if (bpNumberControl) {
        bpNumberControl.setValue(selectedUser.bpNumber); 
      }
    } else {
      this.selectedUserTooltipForDialog = '';
      const bpNumberControl = this.addNewOrderForm.get('bpNumber');
      if (bpNumberControl) {
        bpNumberControl.setValue(''); 
      }
    }
  }
  displayFns(user: Users | string): string {
    if (!user) {
      return '';
    }
    if (typeof user === 'string') {
      return user; // Directly return the string if the user is a string
    }
    return `${user.firstName || ''} ${user.lastName || ''} - ${user.bpNumber || ''}`.trim();
  }

  getStateDropDown() {
    const stateId ='c073e1ab-2a1e-46e6-317c-08dc9f2c9227'

    this.service.getAllStates(stateId).subscribe((data:any)=>{
      if (data) {
        
        data.forEach(element => {
          this.stateList.push({
            id: element.id,
            value: element.name
          })
        });
      }
    })
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
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

  getNewOrderGridSettings(): DataGridColumnHeader[] {
    return [
      {
        columnName: 'action',
        columnTitleKey: 'Edit',
        columnValue: 'id',
        type: this.columnType.BUTTON,
        buttonArray: true,
        headerClass: 'width-150px',
        buttons: [
          {
            buttonAction: 'for_edit',
            icon: 'edit',
            tooltipKey: 'edit',
            buttonClass: 'btn-color-600',
           
          },
        ],
        show: true,
        sort: false,
      },
      {
        columnName: 'PO',
        columnTitleKey: 'PO',
        columnValue: 'externalOrderId',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      },
      
      {
        columnName: 'Item',
        columnTitleKey: 'Item',
        columnValue: 'itemName',
        type: this.columnType.TEXT,
        show: true,
       sort: true,
      },
      {
        columnName: 'Qty',
        columnTitleKey: 'Qty',
        columnValue: 'quantity',
        type: this.columnType.COMMANUMBER,
        show: true,
       sort: true,
      },
      {
        columnName: 'Price',
        columnTitleKey: 'Price',
        columnValue: 'price',
        type: this.columnType.COMMANUMBER,
        show: true,
       sort: true,
      },
      {
        columnName: 'Total Price',
        columnTitleKey: 'Total Price',
        columnValue: 'total',
        type: this.columnType.COMMANUMBER,
        show: true,
       sort: true,
      },
      {
        columnName: 'points',
        columnTitleKey: 'Total Points',
        columnValue: 'totalPoints',
        type: this.columnType.COMMANUMBER,
        show: true,
       sort: true,
      },
      {
        columnName: 'Handling',
        columnTitleKey: 'Handling',
        columnValue: 'handing',
        type: this.columnType.COMMANUMBER,
        show: true,
       sort: true,
      },
      {
        columnName: 'Shipping',
        columnTitleKey: 'Shipping',
        columnValue: 'shippingMethod',
        type: this.columnType.TEXT,
        show: true,
       sort: true,
      },
      {
        columnName: 'Status',
        columnTitleKey: 'Status',
        columnValue: 'status',
        type: this.columnType.TEXT,
        show: true,
       sort: true,
      },
    ];
  }

  getGridSettings(): DataGridColumnHeader[] {
    return [
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
          disableBtnParam: 'disableEdit'
        },
        show: true,
        sort: false,
      },
      {
        columnName: 'UserID',
        columnTitleKey: 'User ID',
        columnValue: 'bpNumber',
        type: this.columnType.TEXT,
        show: true,
       sort: true,
      }, 
      {
        columnName: 'OrderNumber',
        columnTitleKey: 'External Order #',
        columnValue: 'poNumber',
        type: this.columnType.TEXT,
        show: true,
       sort: true,
      },
  
      {
        columnName: 'rowId',
        columnTitleKey: 'Unique Row Id',
        columnValue: 'id',
        type: this.columnType.TEXT_W_ELLIP,
        show: true,
        sort: true,
      },
      {
        columnName: 'poNumber',
        columnTitleKey: 'PO #',
        columnValue: 'ExternalOrderId',
        type: this.columnType.TEXT,
        show: true,
       sort: true,
      }, 
      {
        columnName: 'totalPoints',
        columnTitleKey: 'Total Points Used',
        columnValue: 'totalPoints',
        type: this.columnType.COMMANUMBER,
        show: true,
        sort: true,
      }, 
      // {
      //   columnName: 'Items Ordered',
      //   columnTitleKey: 'Items Ordered',
      //   columnValue: 'quantity',
      //   type: this.columnType.TEXT,
      //   show: true,
      //   sort: true,
      // }, 
      {
        columnName: 'createdById',
        columnTitleKey: 'Entered By',
        columnValue: 'createdById',
        type: this.columnType.TEXT,
        show: true,
       sort: true,
      },
      {
        columnName: 'entryType',
        columnTitleKey: 'Entry Type',
        columnValue: 'entryType',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      },
      {
        columnName: 'orderDate',
        columnTitleKey: 'Order Date',
        columnValue: 'orderDate',
        type: this.columnType.DATE,
        show: true,
        sort: true,
      },
      {
        columnName: 'status',
        columnTitleKey: 'Status',
        columnValue: 'status',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
    }
    ]
  }
  updateRedemptionTemplate(): void {
    const columnNames = ['UserId', 'ExternalOrderId', 'PONumber', 'UniqueRowId', 'ShipFirstName', 'ShipLastName', 'ShipAddress1', 'ShipAddress2', 'ShipCity', 'ShipState', 'ShipZip', 'ShipPhone', 'Phone', 'OrderDate_AM_PM', 'Item', 'Quantity', 'Points', 'TotalPoints', 'ItemNumber', 'Manufacturer', 'Handling', 'PaidPrice', 'ActualCost', 'ActualShipping', 'ActualHandling', 'ActualTax' ,'InvoiceNumber', 'InvoiceDate', 'InvoiceTotal', 'InvoiceTotalAmerican', 'EGRPONumber', 'EGRCheckDate', 'StatusName', 'ExpectedShipDate', 'ActualShipDate', 'ShippingMethod', 'ShippingCost', 'TrackingNumber', 'ItemVendorName']
    this.exportToExcel(columnNames)
  }
  createRedemptionTemplate(): void {
    const columnNames = ['UserId','Status','OrderNumber',	'ItemNumber',	'ShipFirstName',	'ShipLastName',	'ShipAddress1',	'ShipAddress2',	'ShipCity',	'ShipState',	'ShipZip',	'ShipPhone',	'OrderDate',	'ItemName',	'Quantity',	'Points', 'TotalPoints',	'PaidPrice',	'ItemVendorName']
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
  viewUploadedReport() {
    this.FileId = this.uploadResult.fileId
    this.DownloadImportData()
  }
  cancelUpload() {
    this.uploadResult = null;
    this.fileName = null;
    this.file = null; 
    this.showDropBox = true;
  }
  ImportUpdateHistoryPaginated() {
    this.dataSourceUpdateBulkRedemption = [];
    this.bulkUpdateRedemptionLoading = true;
  
    this.incentiveService.ImportHistoryPaginated(this.bulkUpdateRedemptionApiRequest).subscribe(data => {
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
  
  ImportHistoryPaginated() {
    this.dataSourceBulkRedemption = [];
    this.bulkRedemptionLoading = true;
  
    this.incentiveService.ImportHistoryPaginated(this.bulkRedemptionApiRequest).subscribe(data => {
      if (data?.results.length) {
        this.dataSourceBulkRedemption = data.results;
        this.dataSourceBulkRedemption.forEach(element => {
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
  
        this.totalRecordsBulkRedemption = data.totalRecords;
        this.totalPagesBulkRedemption = Math.ceil(this.totalRecordsBulkRedemption / this.bulkRedemptionApiRequest.itemCount);
        this.BulkRedemptionPages = Array.from({ length: this.totalPagesBulkRedemption }, (_, i) => i + 1);
      }
      this.bulkRedemptionLoading = false;
    });
  }
  
  
  applySortBulkRedemption(event) {
    this.sortByBulkRedemption = event.active;
    this.sortDirectionBulkRedemption = event.direction;
    this.bulkRedemptionApiRequest.sortBy = this.sortByBulkRedemption;
    this.bulkRedemptionApiRequest.sortDirection = this.sortDirectionBulkRedemption.toLowerCase();
    this.ImportHistoryPaginated();
  }
  applySortBulkUpdateRedemption(event) {
    this.sortByBulkUpdateRedemption = event.active;
    this.sortDirectionBulkUpdateRedemption = event.direction;
    this.bulkUpdateRedemptionApiRequest.sortBy = this.sortByBulkUpdateRedemption;
    this.bulkUpdateRedemptionApiRequest.sortDirection = this.sortDirectionBulkUpdateRedemption.toLowerCase();
    this.ImportUpdateHistoryPaginated();
  }
  handleButtonClickBulkRedemption(event) {
    if (event.buttonAction === 'for_edit') {
      this.FileId=event.item.fileId;
      this.DownloadBulkUpdateData();
    } 
  }
  validateInteger(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Remove any non-digit characters and ensure the value is an integer
    input.value = input.value.replace(/[^0-9]/g, '');
    // Update the form control value to ensure it reflects the cleaned input
    this.addNewOrderForm.get('points')?.setValue(input.value);
    }
    handleButtonClick(event) {
      if (event.buttonAction === 'for_edit') {
        this.isDisabled = true;
        this.addNewOrderForm = this._formbuilder.group({
          id: new FormControl(event.item.id),
          bpNumber: new FormControl({ value: event.item.bpNumber, disabled: true }),
          poNumber: new FormControl({ value: event.item.poNumber, disabled: true }),
          entryType: new FormControl(event.item.entryType),
          orderDate: new FormControl({ value: event.item.orderDate, disabled: true }), 
          firstName: new FormControl(event.item.shipFirstName),
          lastName: new FormControl(event.item.shipLastName),
          email: new FormControl(event.item.email),
          address1: new FormControl(event.item.shipAddress1),
          address2: new FormControl(event.item.shipAddress2),
          phone: new FormControl({ value: event.item.shipPhone, disabled: true }),
          city: new FormControl(event.item.shipCity),
          state: new FormControl(event.item.shipState),
          zipCode: new FormControl(event.item.shipZip),
          actualCost: new FormControl(event.item.actualCost),
          actualTax: new FormControl(event.item.actualTax),
          actualShipping: new FormControl(event.item.actualShipping),
          actualHandling: new FormControl(event.item.actualHandling),
          invoicNumber: new FormControl(event.item.invoicNumber),
          InvoiceDate: new FormControl(event.item.invoiceDate),
          InvoiceDueDate: new FormControl(event.item.invoiceDueDate),
          InvoiceTotal: new FormControl(event.item.invoiceTotal),
          InvoiceTotalAmerican: new FormControl(event.item.invoiceTotalAmerican),
          urepoNumber: new FormControl(event.item.urepoNumber),
          egrpoNumber: new FormControl(event.item.egrpoNumber),
          egrCheckDate: new FormControl(event.item.egrCheckDate),
          vendorPaid: new FormControl(event.item.vendorPaid === 'true' ? true : false),
          taxPaymentStatus: new FormControl(event.item.taxPaymentStatus),
          totalPoints: new FormControl(event.item.totalPoints),
          totalPrice: new FormControl(event.item.totalPrice),
        });
        this.orderItemsArray = event.item.orderRedemptionItemPaginated;
        this.newOrderItemList = event.item.orderRedemptionItemPaginated;
        this.totalPoints = event.item.orderRedemptionItemPaginated[0].totalPoints;
        this.openAddNewOrder(this.addNewOrder, 'edit');
      }
    }
    
    handleButtonClickNewOrder(event) {
      if (event.buttonAction === 'for_edit') {
        this.itemFormType = 'edit';
        this.itemFormIndex = event.index;
        this.addOrderItemForm = this._formbuilder.group({
          id: new FormControl(event.item.id),
          externalOrderId: new FormControl({ value: event.item.externalOrderId, disabled: true }),
          quantity: new FormControl({ value: event.item.quantity, disabled: true }),
          price: new FormControl({ value: event.item.price, disabled: true }),
          total: new FormControl({ value: event.item.total, disabled: true }),
          points: new FormControl(
            { value: event.item.points, disabled: this.itemFormType === 'edit' }
          ),
          totalPoints: new FormControl({ value: this.calculateTotalPoints(event.item.quantity, event.item.points), disabled: true }),
          handing: new FormControl(event.item.handing),
          itemName: new FormControl({ value: event.item.itemName, disabled: true }), 
          itemModel: new FormControl(event.item.itemModel),
          manufacture: new FormControl(event.item.manufacture),
          itemVendorName: new FormControl({ value: event.item.itemVendorName, disabled: true }),
          expectedShipDate: new FormControl(event.item.expectedShipDate),
          actualShipDate: new FormControl(event.item.actualShipDate),
          processingStatus: new FormControl(event.item.processingStatus),
          shippingCost: new FormControl(event.item.shippingCost),
          trackingNumber: new FormControl(event.item.trackingNumber),
          shippingMethod: new FormControl(event.item.shippingMethod),
          status: new FormControl(event.item.status),
        });
        this.openItemOrderDialog(this.itemOrderDialog, this.itemFormType);
        this.subscribeToFormChanges();
      }
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
  onPageChangeBulkRedemption(pageIndex: number) {
    if (pageIndex < 1 || pageIndex > this.totalPagesBulkRedemption) return;
    this.bulkRedemptionApiRequest.pageIndex = pageIndex;
    this.currentPageBulkRedemption = pageIndex;
    this.ImportHistoryPaginated();
  }
  changeBulkRedemptionPageCount(event) {
    this.bulkRedemptionApiRequest.itemCount = event;
    this.currentPageBulkRedemption = 1;
    this.ImportHistoryPaginated();
  }
  DownloadImportData() {
    this.incentiveService.DownloadImportData(this.FileId).subscribe(data=>{
      const blob = new Blob([data], { type: 'application/csv' });
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'BulkRedemption_'+this.FileId+'.csv';
      a.click();
      URL.revokeObjectURL(objectUrl);
    })
  }
  DownloadBulkUpdateData() {
    this.incentiveService.DownloadBulkUpdateData(this.FileId).subscribe(data=>{
      const blob = new Blob([data], { type: 'application/csv' });
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'BulkRedemption_'+this.FileId+'.csv';
      a.click();
      URL.revokeObjectURL(objectUrl);
    })
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
      if(this.redemptionDialogType === 'update') {
        this.service.ValidateUpdateOrderRedeemptionFile(formData).subscribe(data => {
          this.uploadResult = data;
          if(data.isSuccess) {
            // this.notificationService.successTopRight('File Validated successfully');
            this.showViewReportButton = data.errorRecordCount === 0 ? false : true;
            this.showDropBox = false;
            
          } else {
            this._notificationService.errorTopRight('Something is wrong with the file, Please check the file format and columns');
          }
        });
      } else {
        this.service.ValidateBulkRedemptionFile(formData).subscribe(data => {
          this.uploadResult = data;
          if(data.isSuccess) {
            // this.notificationService.successTopRight('File Validated successfully');
            this.showDropBox = false;
            this.showCreateViewReportButton = data.errorRecordCount === 0 ? false : true;
          } else {
            this._notificationService.errorTopRight('Something is wrong with the file, Please check the file format and columns');
          }
        });
      }
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
      if(this.redemptionDialogType === 'update') {
        this.service.ValidateUpdateOrderRedeemptionFile(formData).subscribe(data => {
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
      } else {
        this.service.ValidateBulkRedemptionFile(formData).subscribe(data => {
          this.uploadResult = data;
          if (data.isSuccess) {
            this.showDropBox = false;
            this.showCreateViewReportButton = data.errorRecordCount === 0 ? false : true;
            // this.notificationService.successTopRight('File validated successfully');
          } else {
            this._notificationService.errorTopRight('Something is wrong with the file, Please check the file format and columns');
          }
        });
      }
    }
  }
  proceedWithUpload() {
    if (this.file) {
      const formData = new FormData();
      formData.append('file', this.file, this.file.name);
      if(this.redemptionDialogType === 'update') {
        this.service.UpdateOrderRedeemptionFile(formData).subscribe(data => {
          if(data.isSuccess){
            this._notificationService.successTopRight('File upload request submitted');
            this.ImportHistoryPaginated();
            this.uploadResult = false;
            this.showDropBox = true;
          }
        });
      }else {
        this.service.ImportOrderRedeemptionFile(formData).subscribe(data => {
          if(data.isSuccess){
            this._notificationService.successTopRight('File upload request submitted');
            this.ImportHistoryPaginated();
            this.uploadResult = false;
            this.showDropBox = true;
          }
        });
      }
    } else {
      console.error('No file available for upload');
    }
  }

  getOrderRedemptionData() {
    this.dataSource = [];
    this.service.listAndFilter(this.apiRequest).subscribe(data => {
        if (data) {
            if (data.results) {
                this.dataSource = data.results;
                this.dataSource.forEach(obj => {
                  if (obj.entryType === 'KOHLER Direct Gift Cards' || obj.entryType === 'KOHLER Rewards Card') {
                    obj.disableEdit = false;
                  } else {
                    obj.disableEdit = false;
                  }
                });
                this.dataSource.forEach((orders) => {
                    orders['ExternalOrderId'] = '';
                    orders.orderRedemptionItemPaginated.forEach((items, index) => {
                        if (orders.orderRedemptionItemPaginated.length - 1 === index) {
                            orders['ExternalOrderId'] += items.externalOrderId;
                        } else {
                            orders['ExternalOrderId'] += items.externalOrderId + ' ,';
                        }
                    });
                   
                    if (orders.orderRedemptionItemPaginated.length > 0) {
                        orders['status'] = orders.orderRedemptionItemPaginated[0].status;
                    } else {
                        orders['status'] = null; 
                    }
                });
            }
            this.totalRecords = data.totalRecords;
            this.calculateTotalPages();
        } else {
            this._notificationService.errorTopRight('Something went wrong, failed to fetch data.');
        }
    });
}

  subscribeToFormChanges() {
    this.addOrderItemForm.get('quantity').valueChanges.subscribe(() => {
      this.calculateTotals();
    });
  
    this.addOrderItemForm.get('price').valueChanges.subscribe(() => {
      this.calculateTotals();
    });
  
    this.addOrderItemForm.get('points').valueChanges.subscribe(() => {
      this.calculateTotals();
    });
  }
  

  calculateTotals() {
    const quantity = this.addOrderItemForm.get('quantity').value || 0;
    const price = this.addOrderItemForm.get('price').value || 0;
    const pricePoint = this.addOrderItemForm.get('points').value || 0;
  
    const total = quantity * price;
    const totalPoints = quantity * pricePoint;
  
    this.addOrderItemForm.get('total').setValue(total, { emitEvent: false });
    this.addOrderItemForm.get('totalPoints').setValue(totalPoints, { emitEvent: false });
  }
  calculateTotalPoints(quantity: number, pricePoint: number): number {
    return quantity * pricePoint;
  }
  openItemOrderDialog(templateRef: TemplateRef<any>, type: string): void {
    if (type === 'add') {
      this.itemFormIndex = null;
      this.itemFormType = 'add';
      this.createOrderItemForm();
    }
    this.subscribeToFormChanges(); 
    this.itemOrder = this._matDialog.open(templateRef);
  }
  saveItemOrderForm() {
    // Enable points control to include it in validation
    this.addOrderItemForm.get('points')?.enable();
  
    if (this.checkItemValidation()) {
      const orderedItems = [...this.newOrderItemList];
      this.newOrderItemList = [];
  
      const formValue = this.addOrderItemForm.getRawValue();
  
      if (this.itemFormType === 'edit') {
        this.orderItemsArray[this.itemFormIndex] = formValue;
        orderedItems[this.itemFormIndex] = formValue;
      } else {
        this.orderItemsArray.push(formValue);
        orderedItems.push(formValue);
      }
  
      this.newOrderItemList = [...orderedItems];
      console.log('this.newOrderItemList', this.newOrderItemList);
  
      let totalPrice = 0;
      let totalPoints = 0;
      this.orderItemsArray.forEach((items) => {
        totalPrice += +items.total;
        totalPoints += +items.totalPoints;
      });
      this.addNewOrderForm.controls['totalPrice'].setValue(totalPrice);
      this.addNewOrderForm.controls['totalPoints'].setValue(totalPoints);
  
      this.closeitemOrderDialog();
    }
  
    // Re-disable points control if necessary
    if (this.itemFormType === 'edit') {
      this.addOrderItemForm.get('points')?.disable();
    }
  }
  
  
  closeitemOrderDialog(): void {
    this.itemOrder.close();
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalRecords / this.apiRequest.itemCount);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  createBulkDialog(templateName, typeName) {
    this.redemptionDialogType = typeName;
    if(typeName === 'update') {
      this.ImportUpdateHistoryPaginated()
    } else {
      this.ImportHistoryPaginated();
    }
    this.cancelUpload()
    this.bulkDialog = this._matDialog.open(templateName);
  }
  closeBulkDialog() {
    this.bulkDialog.close();
  }
  createOrderItemForm() {
    this.addOrderItemForm = this._formbuilder.group({
      id: new FormControl(null),
      externalOrderId: new FormControl(null),
      quantity: new FormControl(null),
      price: new FormControl(null),
      points: new FormControl(null),
      total: new FormControl({ value: null, disabled: true }), 
      totalPoints: new FormControl({ value: null, disabled: true }), 
      handing: new FormControl(null),
      itemName: new FormControl(null),
      itemModel: new FormControl(''),
      manufacture: new FormControl(''),
      itemVendorName: new FormControl(''),
      expectedShipDate: new FormControl(null),
      actualShipDate: new FormControl(null),
      processingStatus: new FormControl(''),
      shippingCost: new FormControl(null),
      trackingNumber: new FormControl(''),
      shippingMethod: new FormControl(''),
      status: new FormControl(''),
    });
  }
  createOrderForm() {
    this.isDisabled = false;
    this.addNewOrderForm = this._formbuilder.group({
      id: new FormControl(null),
      bpNumber: new FormControl(null),
      poNumber: new FormControl(null),
      entryType: new FormControl(''),
      orderDate: new FormControl(null),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      email: new FormControl(''),
      address1: new FormControl(''),
      address2: new FormControl(''),
      phone: new FormControl(''),
      city: new FormControl(''),
      state: new FormControl(''),
      zipCode: new FormControl(''),
      actualCost: new FormControl(null),
      actualTax: new FormControl(null),
      actualShipping: new FormControl(null),
      actualHandling: new FormControl(null),
      invoicNumber: new FormControl(null),
      InvoiceDate: new FormControl(null),
      InvoiceDueDate: new FormControl(null),
      InvoiceTotal: new FormControl(null),
      InvoiceTotalAmerican: new FormControl(null),
      urepoNumber: new FormControl(null),
      egrpoNumber: new FormControl(null),
      egrCheckDate: new FormControl(null),
      vendorPaid: new FormControl(''),
      taxPaymentStatus: new FormControl(''),
      totalPoints: new FormControl(null),
      totalPrice: new FormControl(null),
    });
  }

  onPageChange(pageIndex: number) {
    if (pageIndex < 1 || pageIndex > this.totalPages) return;
    this.apiRequest.pageIndex = pageIndex;
    this.pageIndex = pageIndex;
    this.getOrderRedemptionData();
}

changePageCount(event) {
    const previousItemCount = this.apiRequest.itemCount;
    this.apiRequest.itemCount = event;

    const previousPageFirstItemIndex = (this.pageIndex - 1) * previousItemCount + 1;
    this.pageIndex = Math.ceil(previousPageFirstItemIndex / this.apiRequest.itemCount);

    this.apiRequest.pageIndex = this.pageIndex;
    this.getOrderRedemptionData();
}

  handleSortChange(event) {
    this.sortBy = event.active;
    this.sortDirection = event.direction;
    this.apiRequest.sortBy = this.sortBy;
    this.apiRequest.sortDirection = this.sortDirection.toLowerCase();
    this.getOrderRedemptionData();
  }

  openAddNewOrder(addOrderTemplate, type) {
    if(type === 'add') {
      this.isDisabled=false;
      this.orderItemsArray = [];
      this.newOrderItemList = [];
      this.createOrderForm();
    }
    this.popUpModal = this._matDialog.open(addOrderTemplate, { panelClass: 'custom-container'});

    this.addNewOrderForm.get('bpNumber')!.valueChanges.subscribe((value: any) => {
      if (!value || typeof value !== 'string' || !value.trim()) {
        this.selectedUserTooltipForDialog = '';
        this.selectedFullnameForDialog = '';
      }
    });
    this.filteredUsersForDialog = this.addNewOrderForm.get('bpNumber')!.valueChanges.pipe(
      debounceTime(300), 
      distinctUntilChanged(),
      switchMap((value: string) => this.searchUsersfordialog(value))
    );
  }
  checkValidation() {
    if (this.addNewOrderForm.value.poNumber === null) {
      this._notificationService.errorTopRight('External Order is required');
      return false;
    } else if (this.addNewOrderForm.value.bpNumber === null) {
      this._notificationService.errorTopRight('User ID is required');
      return false;
    } else if (this.addNewOrderForm.value.orderDate === null) {
      this._notificationService.errorTopRight('Order date is required');
      return false;
    } else if (this.orderItemsArray.length === 0) {
      this._notificationService.errorTopRight('At least one order item must be added');
      return false;
    } else {
      return true;
    }

    // else if (this.addNewOrderForm.value.taxPaymentStatus === null || this.addNewOrderForm.value.taxPaymentStatus === '') {
    //   this._notificationService.errorTopRight('Tax payment status is required');
    //   return false;
    // }
  }
  
  checkItemValidation() {
    const formValue = this.addOrderItemForm.getRawValue();
    const pointsValue = this.addOrderItemForm.get('points')?.value;
  
    if (formValue.externalOrderId === null || formValue.externalOrderId.trim() === '') {
      this._notificationService.errorTopRight('PO Number is required');
      return false;
    } else if (formValue.quantity === null || isNaN(formValue.quantity) || formValue.quantity <= 0) {
      this._notificationService.errorTopRight('Quantity is required and must be a positive number');
      return false;
    } else if (formValue.price === null || isNaN(formValue.price)) { 
      this._notificationService.errorTopRight('Price is required and must be a valid number');
      return false;
    } else if (pointsValue === null || !/^-?\d+$/.test(pointsValue)) {
      this._notificationService.errorTopRight('Points Per Quantity is required and must be an integer (positive or negative)');
      return false;
    } else if (formValue.itemName === null || formValue.itemName.trim() === '') {
      this._notificationService.errorTopRight('Item name is required');
      return false;
    } else if (formValue.itemVendorName === null || formValue.itemVendorName.trim() === '') {
      this._notificationService.errorTopRight('Vendor name is required');
      return false;
    } else if (formValue.status === null || formValue.status.trim() === '') {
      this._notificationService.errorTopRight('Status is required');
      return false;
    } 
    return true;
  }
  
  saveBulkOrderForm() {
    if (this.checkValidation()) {
      const requestQuery = this.addNewOrderForm.getRawValue();
      const orderDate = new Date(requestQuery.orderDate);
      if (orderDate) {
        const utcDate = new Date(Date.UTC(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate(), 0, 0, 0));
        requestQuery.orderDate = utcDate.toISOString();
      }
      const invoiceDateValue = requestQuery.InvoiceDate;
      if (invoiceDateValue && invoiceDateValue !== '') {
        const InvoiceDate = new Date(invoiceDateValue);
        const utcDate = new Date(Date.UTC(InvoiceDate.getFullYear(), InvoiceDate.getMonth(), InvoiceDate.getDate(), 0, 0, 0));
        requestQuery.InvoiceDate = utcDate.toISOString();
      } else {
        requestQuery.InvoiceDate = null;
      }
      requestQuery['orderRedeemItemAPIModels'] = this.orderItemsArray;
      requestQuery.vendorPaid = requestQuery?.vendorPaid.toString();

      this.service.SaveOrUpdate(requestQuery).subscribe((resp) => {
        if (resp.isSuccess) {
          this._notificationService.successTopRight('Order saved successfully');
          this.getOrderRedemptionData();
          this.closeDialog();
        } else {
          this._notificationService.errorTopRight(resp.message);
        }
      });
    }
  }
  
  checkPointsBalance() {
    const object = {
      bpNumber: this.addNewOrderForm.get('bpNumber')?.value,
      point: this.addOrderItemForm?.get('totalPoints')?.value ?? this.totalPoints,
    };

    this.service.checkPointsBalance(object).subscribe((el) => {
      if (el.isSuccess)
      {
        this.saveBulkOrderFormInternal();
      }
      else{
          this.errorMessage=el.message
          this.showNegativePointsDialog();
      }
    });
  }

  showNegativePointsDialog() {
    this.NegativePointsDialog = this._matDialog.open(this.pointsUserDialog);
  }
  
  
  saveBulkOrderFormInternal() {
    if (this.checkValidation()) {
      const requestQuery = this.addNewOrderForm.getRawValue();
      const orderDate = new Date(requestQuery.orderDate);
      if (orderDate) {
        const utcDate = new Date(Date.UTC(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate(), 0, 0, 0));
        requestQuery.orderDate = utcDate.toISOString();
      }
      const invoiceDateValue = requestQuery.InvoiceDate;
      if (invoiceDateValue && invoiceDateValue !== '') {
        const InvoiceDate = new Date(invoiceDateValue);
        const utcDate = new Date(Date.UTC(InvoiceDate.getFullYear(), InvoiceDate.getMonth(), InvoiceDate.getDate(), 0, 0, 0));
        requestQuery.InvoiceDate = utcDate.toISOString();
      } else {
        requestQuery.InvoiceDate = null;
      }
      requestQuery['orderRedeemItemAPIModels'] = this.orderItemsArray;
      requestQuery.vendorPaid = requestQuery?.vendorPaid.toString();
  
      this.service.SaveOrUpdate(requestQuery).subscribe((resp) => {
        if (resp.isSuccess) {
          this._notificationService.successTopRight('Order saved successfully');
          this.getOrderRedemptionData();
          this.closeDialog();
        } else {
          this._notificationService.errorTopRight(resp.message);
        }
      });
    }
  }
  
  

  handleAddNewOrder() {
    let payload = this.addNewOrderForm.getRawValue();
    if (payload.bpNumber === '') {
      this._notificationService.errorTopRight('Please fill BP Number');
      return;
    }
    payload.id = null;
    this.service.addNewOrder(payload).subscribe(data => {
      if (data.isSuccess) {
        this._notificationService.successTopRight('Data successfully added.')
        this.closeDialog();
      } else {
        this._notificationService.errorTopRight('Something went wrong, Failed to add new order');
      }
    })
  }

  closeDialog() {
    this.popUpModal.close();
  }

  handlepopUpModalClose() {
    if (this.popUpModalNewOrder) {
      this.popUpModalNewOrder.close();
    } else {
      this.popUpModal.close();
    }
  }

  applyFilterRecords() {
    const rawValue = this.filterForm.getRawValue();
    const filterPayload = [];
  
    const fields = [
      { key: 'UserID', type: 'string' },
      { key: 'MinPoints', type: 'string' },
      { key: 'MaxPoints', type: 'string' },
      { key: 'EntryType', type: 'string' },
      { key: 'StartDate', type: 'date' },
      { key: 'EndDate', type: 'date' },
      { key: 'externalOrderId', type: 'string' },
      { key: 'poNumber', type: 'string' },
    ];
  
    // Validation: Both StartDate and EndDate are required
    if ((rawValue['StartDate'] && !rawValue['EndDate']) || (!rawValue['StartDate'] && rawValue['EndDate'])) {
      this._notificationService.errorTopRight('Both start date and end date are required to apply the date filter.');
      return;
    }
  
    // Validation: EndDate should not be less than StartDate
    if (rawValue['StartDate'] && rawValue['EndDate']) {
      const startDate = new Date(rawValue['StartDate']);
      const endDate = new Date(rawValue['EndDate']);
  
      if (endDate < startDate) {
        this._notificationService.errorTopRight('End date cannot be earlier than start date.');
        return;
      }
    }
  
    // Validation: Both MinPoints and MaxPoints are required
    if (
      (rawValue['MinPoints'] !== null && rawValue['MinPoints'] !== undefined &&
        (rawValue['MaxPoints'] === null || rawValue['MaxPoints'] === undefined)) ||
      ((rawValue['MinPoints'] === null || rawValue['MinPoints'] === undefined) &&
        rawValue['MaxPoints'] !== null && rawValue['MaxPoints'] !== undefined)
    ) {
      this._notificationService.errorTopRight('Both Min Point and Max Point are required to apply the point filter.');
      return;
    }
  
    // Validation: MaxPoints should not be less than MinPoints
    if (rawValue['MinPoints'] !== null && rawValue['MinPoints'] !== undefined &&
        rawValue['MaxPoints'] !== null && rawValue['MaxPoints'] !== undefined) {
      if (+rawValue['MaxPoints'] < +rawValue['MinPoints']) {
        this._notificationService.errorTopRight('Max Points cannot be less than Min Points.');
        return;
      }
    }
  
    fields.forEach(field => {
      let value = rawValue[field.key];
  
      // Handle UserID separately if it's an object
      if (field.key === 'UserID' && value && typeof value === 'object') {
        value = value.bpNumber || ''; // Extract bpNumber if the value is an object
      }
  
      if (field.type === 'string' && typeof value === 'string' && value.trim()) {
        filterPayload.push({ oid: field.key, value: value.trim() });
      } else if (field.type === 'date' && value) {
        const formattedDate = this.formatDate(value, field.key);
        filterPayload.push({ oid: field.key, value: formattedDate });
      }
    });
  
    this.apiRequest.filter = filterPayload;
    this.apiRequest.pageIndex = 1;
    this.updateResultTags();
    this.getOrderRedemptionData();
  }
  
  
  

  formatDate(date: string, type: string): string {
    const selectedDate = new Date(date);
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0'); 
    const day = String(selectedDate.getDate()).padStart(2, '0'); 
    
    let time = '00:00:00';
    if (type === 'EndDate') {
      time = '23:59:59';
    }
  
    return `${year}-${month}-${day}T${time}`;
  }

  updateResultTags() {
    const filterData = this.filterForm.getRawValue();
    let dateFilterTag = '';
  
    if (filterData.StartDate && filterData.EndDate) {
      dateFilterTag = `Order Date: ${this.formatSelectedDate(filterData.StartDate)} - ${this.formatSelectedDate(filterData.EndDate)}`;
    } else if (filterData.StartDate) {
      dateFilterTag = `Order Date: ${this.formatSelectedDate(filterData.StartDate)}`;
    } else if (filterData.EndDate) {
      dateFilterTag = `Order Date: ${this.formatSelectedDate(filterData.EndDate)}`;
    }
  
    this.filterTags = [
      {
        oid: 'UserID',
        title: 'User ID:',
        value: filterData.UserID ?? '',
      },
      {
        oid: 'MinPoints',
        title: 'Minimum Points:',
        value: filterData.MinPoints ?? '',
      },
      {
        oid: 'MaxPoints',
        title: 'Maximum Points:',
        value: filterData.MaxPoints ?? '',
      },
      {
        oid: 'EntryType',
        title: 'Entry Type:',
        value: filterData.EntryType ? `${filterData.EntryType}` : '',
      },
      {
        oid: 'OrderDate',
        title: 'Order Date:',
        value: dateFilterTag,
      },
      {
        oid: 'externalOrderId',
        title: 'External Order Id:',
        value: filterData.externalOrderId ?? '',
      },
      {
        oid: 'poNumber',
        title: 'Po Number:',
        value: filterData.poNumber ?? '',
      },
    ].filter(tag => tag.value); // Remove empty tags
  }

  removeFilterLabel(label) {

    if (label.oid === 'MinPoints' || label.oid === 'MaxPoints') {
      this.filterTags = this.filterTags.filter(item => item.oid !== 'MinPoints' && item.oid !== 'MaxPoints');
    }

    this.filterTags = this.filterTags.filter(item => item.oid !== label.oid);
    if (label.oid === 'OrderDate') {
      this.filterForm.get('StartDate')?.setValue('');
      this.filterForm.get('EndDate')?.setValue('');
    } else if (label.oid === 'MinPoints' || label.oid === 'MaxPoints') {
      this.filterForm.get('MinPoints')?.setValue('');
      this.filterForm.get('MaxPoints')?.setValue('');
    } else {
      this.filterForm.get(label.oid)?.setValue('');
    }

    this.apiRequest.filter = this.apiRequest.filter.filter(filter => {
      if (label.oid === 'OrderDate') {
        return filter.oid !== 'StartDate' && filter.oid !== 'EndDate';
      } else if (label.oid === 'MinPoints' || label.oid === 'MaxPoints') {
        return filter.oid !== 'MinPoints' && filter.oid !== 'MaxPoints';
      }
      return filter.oid !== label.oid;
    });
    this.getOrderRedemptionData();
  }

  resetFilters() { 
    this.filterForm.reset();
    this.filterTags = [];
    this.apiRequest.filter = [];
    this.getOrderRedemptionData();
  }

  formatSelectedDate(value) {
    const date = new Date(value); 
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


  exportAllResult() {
    const request = {
      itemCount: this.totalRecords,
      pageIndex: 1,
      sortBy: "createdDateTime",
      search: "",
      sortDirection: "desc",
      filter: []
    };
    this.service.listAndFilter(request).subscribe(data => {
      const exportdata: any[] = this.getExportData(data.results);
      if (exportdata && exportdata.length > 0) {
        this.downloadCSV(exportdata, 'Order_Redemption_Data');
      } else {
        this._notificationService.errorTopRight('Data not found.');
      }
    });
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
        data.push({
          'User Id': element.bpNumber,
          'External Order': element.poNumber,
          'PO': externalOrderIds,
          "Unique Row Id": element.id,
          'Total Points Used': element.totalPoints,
          'Entered By': element.enteredBy !== null ? element.enteredBy : '',
          'Entry Type': element.entryType,
          'Order Date': formattedOrderDate,
          'Status': element.taxPaymentStatus !== null ? element.taxPaymentStatus : ''
        });
      });
    }
    return data;
  }


  downloadCSV(data: any[], filename: string) {
    const csvData = this.convertToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
  }

  convertToCSV(objArray: any[]): string {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = '';

    // Create the header row
    for (const index in array[0]) {
      if (array[0].hasOwnProperty(index)) {
        row += `"${index}",`;
      }
    }
    row = row.slice(0, -1);
    str += row + '\r\n';

    // Create the data rows
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
  onPointsInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^-?\d]/g, ''); // Allows only digits and one optional leading negative sign
    this.addOrderItemForm.get('points')?.setValue(input.value, { emitEvent: false });
  }


}
