import { Component, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { COLUMN_TYPE, DataGridColumnHeader } from 'app/shared/component/data-grid/data-grid.service';
import { NotificationService } from 'app/shared/notification/notification';
import { IncentiveAdminPanelService } from '../incentive-admin-panel.service';
import { checkValidText } from 'app/shared/validation/validation-utils';
import { ActivatedRoute } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, map, Observable, of, startWith, Subscription, switchMap } from 'rxjs';
import { MatSelect } from '@angular/material/select';
import { Users } from './users.types';

@Component({
  selector: 'app-points-credit-manager',
  templateUrl: './points-credit-manager.component.html',
  styleUrls: ['./points-credit-manager.component.scss']
})
export class PointsCreditManagerComponent {
  fileName;
  file;
  enableButton = false;
  openedFromHome = true;
  skuIdMap: { [key: string]: string } = {};
  @ViewChild('skuDropdown') skuDropdown: MatSelect;
  skuDataMap: { [key: string]: any } = {};
  skuForm: FormGroup;
  skuDialogRef: MatDialogRef<any>;
  creditDialog: any;
  showSaveButton: boolean = false;
  showDeleteButton=false;
  selectedUserTooltip: string = '';
  selectedUserName: any;
  selectedFullname: string;
  selectedUserTooltipForDialog: string = '';
  selectedUserNameForDialog:any;
  selectedFullnameForDialog: string;
  showIneligibleSkuButton: boolean = true;
  deleteModal: any;
  skuDeleteModal:any;
  rejectionReasonsr = [
    { id: 'SKU ineligible', value: 'SKU ineligible' },
    { id: 'No quantity listed', value: 'No quantity listed' },
    { id: 'Quantity greater than 8', value: 'Quantity greater than 8' },
    { id: 'Duplicate SKU entry', value: 'Duplicate SKU entry' }
  ];
  rejectionReasons = [
    { id: 'userIdInvalid', value: 'UserID Number Missing / Invalid' },
    { id: 'invoiceDateInvalid', value: 'Missing / Invalid Invoice Date (past 45-day window)' },
    { id: 'invoiceNumberInvalid', value: 'Missing or Not Legible Invoice Number' },
    { id: 'duplicateInvoice', value: 'Duplicate Invoice' },
    { id: 'missingSkus', value: 'Missing SKUs from Invoice' }
  ];
  selectedReason: any; // This will hold the selected value
  data: any;
  gridColumns: DataGridColumnHeader[] = [];
  columnType = COLUMN_TYPE;
  pageLimit = 10;
  sortBy = '';
  filteredSkuDropDownList = [];
  manualSkus = []
  parentFilteredSkuDropDownList = [];
  todayDate: Date = new Date();
  form: FormGroup;
  searchTerm: string = '';
  modalReference: any;
  sortDirection = '';
  totalRecords = 0;
  showFilter = true;
  dataSource = null;
  loading = false;
  readOnlySkuRejection = false;
  apiRequest = {
    itemCount: 25,
    pageIndex: 1,
    sortBy: "createdDateTime",
    sortDirection: "desc",
    objectName: null,
    search: "",
    filter: []
  };
  showDropBox = true;
  uploadResult = null;
  labels = [];
  pageIndex = 1;
  pages: number[] = [];
  totalPages: number;
  TypeDropdown = [
    {
      id: 'all',
      value: 'All',
    },
    {
      id: 'automated',
      value: 'Automated',
    },
    {
      id: 'manual',
      value: 'Manual',
    },
  ]
  pageNumber = 0;
  pageSize = 50;
  isLoading = false;
  selectedSku: any[] = [];
  selectedskuIds: any[] = [];
  // SkuDropDownList = []; 
  SkuDropDownList: any[] = [];
  formFilter: FormGroup;
  manageProgramPeriod: FormGroup;
  skuIdControl = new FormControl();
  searchControl = new FormControl();
  formTitle = 'Add Credit/ Invoice';
  @ViewChild('templateRefForm') templateRefForm: TemplateRef<any>;
  firstName: any;
  lastName: any;
  email: any;
  companyName: any;
  modalReferenceForUser: any;
  bpNumber: string;
  searchForm: FormGroup;
  skuPageNumber = 0;
  skuPageSize = 40;
  isSkuLoading = false;
  deleteElement: any;
  userDeleteElement: any;
  userId = new FormControl('');
  filteredUsers: Observable<Users[]>;
  filteredUsersForDialog: Observable<Users[]>;
  private subscription: Subscription;
  skuToDelete: { index: number; control: AbstractControl<any, any>; };
  isCollapsed: boolean = true;

  constructor(
    private _notificationService: NotificationService,
    private _formbuilder: FormBuilder,
    private _matDialog: MatDialog,
    private service: IncentiveAdminPanelService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.gridColumns = this.getGridSettings();
  
    this.formFilter = this._formbuilder.group({
      userId: this.userId,
      dateProcessedStar: null,
      dateProcessedEnd: null,
      shippedStartDate: null,
      shippedEndDate: null,
      entryType: null,
      company: null,
      minUnitSold: null,
      maxUnitSold: null,
      minListPrice: null,
      maxListPrice: null,
      minPoint: null,
      maxPoint: null,
      invoiceId:null
    });
  
    this.route.queryParams.subscribe((params) => {
      this.bpNumber = params['bpNumber'];
      if (this.bpNumber) {
        this.formFilter.controls['userId'].setValue(this.bpNumber);
        this.applyFilterRecords();
      }
      this.ListPointCreditManager();

      this.filteredUsers = this.userId.valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(value => this.searchUsers(value || ''))
      );
    });
  
    this.userId.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      if (!value) {
        this.selectedUserTooltip = '';
        this.selectedFullname = '';
      }
    });
  
    this.setupUserSearchSubscription();
  }
  
  private setupUserSearchSubscription(): void {
    this.subscription = this.userId.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => this.searchUsers(value || ''))
    ).subscribe((users) => {
      this.filteredUsers = of(users);
  
      if (!this.userId.value) {
        this.selectedFullname = '';
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
      this.subscription.unsubscribe();
  
      this.selectedUserTooltip = `${selectedUser.firstName} ${selectedUser.lastName} (${selectedUser.email}) - ${selectedUser.bpNumber}`;
      this.selectedUserName = `${selectedUser.firstName} ${selectedUser.lastName} (${selectedUser.email}) - ${selectedUser.bpNumber}`;
      this.selectedFullname = `${selectedUser.firstName} ${selectedUser.lastName}`;
      this.formFilter.get('userId')?.setValue(selectedUser.bpNumber);
  
      setTimeout(() => this.setupUserSearchSubscription(), 100);
    } else {
      this.selectedFullname = '';
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
  
    const formattedName = name.replace(regex, `<b>$1</b>`);
    const formattedEmail = email.replace(regex, `<b>$1</b>`);
  
    return `${formattedName} (${formattedEmail}) - ${bpNumber}`;
  }
  applyFilterRecords() {
    const rawValue = this.formFilter.getRawValue();
    const filterPayload = [];
  
    const fields = [
      { key: 'userId', type: 'string', title: 'User Id' },
      { key: 'minPoint', type: 'string', title: 'Minimum Points' },
      { key: 'maxPoint', type: 'string', title: 'Maximum Points' },
      { key: 'entryType', type: 'string', title: 'Entry Type' },
      { key: 'dateProcessedStar', type: 'date', title: 'Processed Start Date' },
      { key: 'dateProcessedEnd', type: 'date', title: 'Processed End Date' },
      { key: 'shippedStartDate', type: 'date', title: 'Invoice Start Date' },
      { key: 'shippedEndDate', type: 'date', title: 'Invoice End Date' }
    ];
  
    // Validation for date range filters
    if ((rawValue['dateProcessedStar'] && !rawValue['dateProcessedEnd']) || (!rawValue['dateProcessedStar'] && rawValue['dateProcessedEnd'])) {
      this._notificationService.errorTopRight('Both start and end dates are required for the date filter.');
      return;
    }
  
    if ((rawValue['minPoint'] && !rawValue['maxPoint']) || (!rawValue['minPoint'] && rawValue['maxPoint'])) {
      this._notificationService.errorTopRight('Both Minimum Points and Maximum Points are required to apply the points filter.');
      return;
    }
  
    // Iterate through fields to generate filter payload
    fields.forEach((field) => {
      let value = rawValue[field.key];
      if (field.type === 'string' && value && value.trim()) {
        filterPayload.push({ oid: field.key, value: value.trim() });
      } else if (field.type === 'date' && value) {
        const formattedDate = this.toUTCDateString(new Date(value));
        filterPayload.push({ oid: field.key, value: formattedDate });
      }
    });
  
    this.apiRequest.filter = filterPayload;
    this.apiRequest.pageIndex = 1;
    this.labels = this.apiRequest.filter.map((filter) => ({
      id: filter.oid,
      value: filter.value,
      title: fields.find((field) => field.key === filter.oid)?.title || filter.oid
    }));
    this.ListPointCreditManager(); // Fetch filtered data
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
          icon: 'edit',
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
          tooltipKey: 'Delete',
          buttonClass: 'btn-color-600',
        },
        show: true,
        sort: false,
      },
      {
        columnName: 'invoiceId',
        columnTitleKey: 'Invoice',
        columnValue: 'invoiceId',
        type: this.columnType.TEXT_W_ELLIP,
        show: true,
        sort: true,
      },
      {
        columnName: 'userID',
        columnTitleKey: 'User ID',
        columnValue: 'userID',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      },
      {
        columnName: 'enteredBy',
        columnTitleKey: 'Entered By',
        columnValue: 'enteredBy',
        type: this.columnType.TEXT_W_ELLIP,
        show: true,
        sort: true,
      },
      {
        columnName: 'rejected',
        columnTitleKey: 'Status',
        columnValue: 'rejected',
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
        columnName: 'invoiceDate',
        columnTitleKey: 'Invoice Date',
        columnValue: 'invoiceDate',
        type: this.columnType.DATE,
        show: true,
        sort: true,
      },
      {
        columnName: 'processedDate',
        columnTitleKey: 'Date Processed',
        columnValue: 'processedDate',
        type: this.columnType.DATE,
        show: true,
        sort: true,
      },
      {
        columnName: 'points',
        columnTitleKey: 'Total Points',
        columnValue: 'points',
        type: this.columnType.COMMANUMBER,
        show: true,
        sort: true,
      },
      {
        columnName: 'listPrice',
        columnTitleKey: 'List Price',
        columnValue: 'listPrice',
        type: this.columnType.COMMANUMBER,
        show: true,
        sort: true,
      },
      {
        columnName: 'totalSalesPrice',
        columnTitleKey: 'Total List Price',
        columnValue: 'totalSalesPrice',
        type: this.columnType.COMMANUMBER,
        show: true,
        sort: true,
      },
      {
        columnName: 'totalUnit',
        columnTitleKey: 'Quantity',
        columnValue: 'totalUnit',
        type: this.columnType.COMMANUMBER,
        show: true,
        sort: true,
      },
    ]
  }
  ListPointCreditManager() {
    this.dataSource = [];
    this.loading = true;
    this.service.ListPointCreditManager(this.apiRequest).pipe(
      catchError(error => {
        this.loading = false;
        console.log('Error fetching points credit data: ', error);
        this._notificationService.errorTopRight('Something went wrong, unable to fetch data.');
        return of(null);
      })
    ).subscribe(data => {
      this.loading = false;
      if (data) {
        if (data.results) {
          this.dataSource = data.results;
          this.dataSource.map((item => {
            item.totalSalesPrice = item.totalSalesPrice.toFixed(2)
            item.listPrice = item.listPrice.toFixed(2)
            item.rejected = item.rejected === 'False' ? 'Accepted' : 'Rejected'
          }))

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
    this.ListPointCreditManager();
  }
  handleSortChange(event) {
    this.sortBy = event.active;
    this.sortDirection = event.direction;

    this.apiRequest.sortBy = this.sortBy;
    this.apiRequest.sortDirection = this.sortDirection.toLowerCase();
    this.ListPointCreditManager();
  }
  toUTCDateString(date) {
    if (date instanceof Date) {
      const utcDate = new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0, 0, 0
      ));
      return utcDate.toISOString().slice(0, 19);
    }
    return null;
  }
  handleSearch() {
    this.apiRequest.filter = [];
    this.labels = [];
    const filterRawValue = this.formFilter.getRawValue();
  
    ['dateProcessedStar', 'dateProcessedEnd', 'shippedStartDate', 'shippedEndDate'].forEach(field => {
      if (filterRawValue[field] || filterRawValue[field] === 0) {
        const dateValue = new Date(filterRawValue[field]);
        const utcDateString = this.toUTCDateString(dateValue).split('T')[0]; // Remove the time part
        filterRawValue[field] = utcDateString;
      }
    });
  
    // Validation: Both Start Date and End Date must be provided
    if ((filterRawValue['dateProcessedStar'] && !filterRawValue['dateProcessedEnd']) || (!filterRawValue['dateProcessedStar'] && filterRawValue['dateProcessedEnd'])) {
      this._notificationService.errorTopRight('Both start date and end date are required to apply the date filter.');
      return;
    }
  
    if ((filterRawValue['shippedStartDate'] && !filterRawValue['shippedEndDate']) || (!filterRawValue['shippedStartDate'] && filterRawValue['shippedEndDate'])) {
      this._notificationService.errorTopRight('Both start date and end date are required to apply the date filter.');
      return;
    }
  
    // Validation: End Date should not be earlier than Start Date
    if (filterRawValue['dateProcessedStar'] && filterRawValue['dateProcessedEnd'] && new Date(filterRawValue['dateProcessedStar']) > new Date(filterRawValue['dateProcessedEnd'])) {
      this._notificationService.errorTopRight('End Date cannot be earlier than Start Date for the date filter.');
      return;
    }
  
    if (filterRawValue['shippedStartDate'] && filterRawValue['shippedEndDate'] && new Date(filterRawValue['shippedStartDate']) > new Date(filterRawValue['shippedEndDate'])) {
      this._notificationService.errorTopRight('End Date cannot be earlier than Start Date for the invoice date filter.');
      return;
    }
  
    // Validation: Min Points and Max Points must be provided together, and Max Points must be greater than or equal to Min Points
    if (
      (filterRawValue['minPoint'] !== null && filterRawValue['minPoint'] !== undefined && 
       (filterRawValue['maxPoint'] === null || filterRawValue['maxPoint'] === undefined)) || 
      ((filterRawValue['minPoint'] === null || filterRawValue['minPoint'] === undefined) && 
       filterRawValue['maxPoint'] !== null && filterRawValue['maxPoint'] !== undefined)
    ) {
      this._notificationService.errorTopRight('Both Min Points and Max Points are required to apply the point filter.');
      return;
    }
  
    if (filterRawValue['minPoint'] && filterRawValue['maxPoint'] && +filterRawValue['maxPoint'] < +filterRawValue['minPoint']) {
      this._notificationService.errorTopRight('Max Points cannot be less than Min Points.');
      return;
    }
  
    if (
      (filterRawValue['minListPrice'] !== null && filterRawValue['minListPrice'] !== undefined && 
       (filterRawValue['maxListPrice'] === null || filterRawValue['maxListPrice'] === undefined)) || 
      ((filterRawValue['minListPrice'] === null || filterRawValue['minListPrice'] === undefined) && 
       filterRawValue['maxListPrice'] !== null && filterRawValue['maxListPrice'] !== undefined)
    ) {
      this._notificationService.errorTopRight('Both Min List Price and Max List Price are required to apply the filter.');
      return;
    }
    
    // Check if the values are valid numbers and compare them
    if (filterRawValue['minListPrice'] !== undefined && filterRawValue['maxListPrice'] !== undefined) {
      const minListPrice = +filterRawValue['minListPrice'];
      const maxListPrice = +filterRawValue['maxListPrice'];
      
      if (minListPrice > maxListPrice) {
        this._notificationService.errorTopRight('Max List Price cannot be less than Min List Price.');
        return;
      }
    }
  
    Object.keys(filterRawValue).forEach((item) => {
      if (filterRawValue[item] || filterRawValue[item] === 0) {
        this.apiRequest.filter.push({
          oid: item,
          value: filterRawValue[item],
        });
        this.labels.push({
          id: item,
          value: filterRawValue[item],
          title: item === 'userId' ? 'User Id' :
            item === 'dateProcessedStar' ? 'Processed Start Date' :
              item === 'dateProcessedEnd' ? 'Processed End Date' :
                item === 'shippedStartDate' ? 'Invoice Start Date' :
                  item === 'shippedEndDate' ? 'Invoice End Date' :
                    item === 'entryType' ? 'Entry type' :
                      item === 'company' ? 'Company' :
                        item === 'minUnitSold' ? 'Minimum Units Sold' :
                          item === 'maxUnitSold' ? 'Maximum Units Sold' :
                            item === 'minListPrice' ? 'Minimum List Price' :
                              item === 'maxListPrice' ? 'Maximum List Price' :
                                item === 'minPoint' ? 'Minimum Points' :
                                  item === 'maxPoint' ? 'Maximum Points' : item === 'invoiceId' ? 'Invoice' : ''
        });
      }
    });
  
    this.ListPointCreditManager();
  }
  resetFilters() { 
    this.formFilter.reset();
    this.labels = [];
    this.apiRequest.filter = [];
    this.ListPointCreditManager();
    this.pageIndex = 1;
  }
  
  changePageCount(event) {
    this.apiRequest.itemCount = event;
    this.pageIndex = 1;
    this.ListPointCreditManager();
  }
  toggleLabelOnNote(label): void {
    if (label.id === 'dateProcessedStar' || label.id === 'dateProcessedEnd') {
      this.formFilter.controls['dateProcessedStar'].reset();
      this.formFilter.controls['dateProcessedEnd'].reset();
      this.formFilter.controls['dateProcessedStar'].setValue(null);
      this.formFilter.controls['dateProcessedEnd'].setValue(null);
    } else if (label.id === 'shippedStartDate' || label.id === 'shippedEndDate') {
      this.formFilter.controls['shippedStartDate'].reset();
      this.formFilter.controls['shippedEndDate'].reset();
      this.formFilter.controls['shippedStartDate'].setValue(null);
      this.formFilter.controls['shippedEndDate'].setValue(null);
    } else if (label.id === 'minPoint' || label.id === 'maxPoint') {
      this.formFilter.controls['minPoint'].reset();
      this.formFilter.controls['maxPoint'].reset();
      this.formFilter.controls['minPoint'].setValue(null);
      this.formFilter.controls['maxPoint'].setValue(null);
    } else if (label.id === 'minListPrice' || label.id === 'maxListPrice') {
      this.formFilter.controls['minListPrice'].reset();
      this.formFilter.controls['maxListPrice'].reset();
      this.formFilter.controls['minListPrice'].setValue(null);
      this.formFilter.controls['maxListPrice'].setValue(null);
    } else {
      this.formFilter.controls[label.id].reset();
      this.formFilter.controls[label.id].setValue(null);
    }

    this.apiRequest.filter = this.apiRequest.filter.filter(filter => {
      if (label.id === 'dateProcessedStar' || label.id === 'dateProcessedEnd') {
        return filter.oid !== 'dateProcessedStar' && filter.oid !== 'dateProcessedEnd';
      } else if (label.id === 'shippedStartDate' || label.id === 'shippedEndDate') {
        return filter.oid !== 'shippedStartDate' && filter.oid !== 'shippedEndDate';
      } else if (label.id === 'minPoint' || label.id === 'maxPoint') {
        return filter.oid !== 'minPoint' && filter.oid !== 'maxPoint';
      } else if (label.id === 'minListPrice' || label.id === 'maxListPrice') {
        return filter.oid !== 'minListPrice' && filter.oid !== 'maxListPrice';
      }
      return filter.oid !== label.id;
    });

    this.labels = this.labels.filter(l => {
      if (label.id === 'dateProcessedStar' || label.id === 'dateProcessedEnd') {
        return l.id !== 'dateProcessedStar' && l.id !== 'dateProcessedEnd';
      } else if (label.id === 'shippedStartDate' || label.id === 'shippedEndDate') {
        return l.id !== 'shippedStartDate' && l.id !== 'shippedEndDate';
      } else if (label.id === 'minPoint' || label.id === 'maxPoint') {
        return l.id !== 'minPoint' && l.id !== 'maxPoint';
      } else if (label.id === 'minListPrice' || label.id === 'maxListPrice') {
        return l.id !== 'minListPrice' && l.id !== 'maxListPrice';
      }
      return l.id !== label.id;
    });

    this.ListPointCreditManager();
  }
    
    
    
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
  initializeForm() {
    this.manageProgramPeriod = this._formbuilder.group({
      id: null,
      invoiceNumber: null,
      bpNumber: null,
      skuDetails: this._formbuilder.array([]),
      shippedDate: null,
      processedDate: null,
      isRejected: false,
      skuRejectionReason: null,
      totalSalesPrice: null,
      skuId: this._formbuilder.control([]),
      search: new FormControl(''),
      reason: null,
    });
  }
  resetForm() {
    this.manageProgramPeriod.reset();
    this.skuDataMap = {};
  }
  loadSkuData(): void {
    this.skuPageNumber = 0;
    this.SkuDropDownList = [];
    this.filteredSkuDropDownList = [];
    this.parentFilteredSkuDropDownList = [];
    this.getPaginatedSkuList(this.skuPageNumber, this.skuPageSize, '', '', '', true, false); // Initial load
  }
  getPaginatedSkuList(skuPageNumber: number, skuPageSize: number, search: string, sortBy: string, sortDirection: string, resetList: boolean, searchedFunction): void {
    if ((search === '' && searchedFunction) || (!search && searchedFunction)) {
      this.isSkuLoading = true;
      this.SkuDropDownList = this.parentFilteredSkuDropDownList;
      this.isSkuLoading = false;
    } else {
      const matchingObjects = this.parentFilteredSkuDropDownList.filter(items =>
        items.value.toLowerCase().replace(/\s+/g, '').includes(search.toLowerCase().replace(/\s+/g, ''))
      );
      
      // console.log('Matching Objects:', matchingObjects);
      
      if (matchingObjects.length > 0 && searchedFunction) {
        // this.isSkuLoading = true;
        this.SkuDropDownList = [...matchingObjects];

        const requestBody = {
          pageIndex: skuPageNumber,
          sortBy: sortBy || 'createdDate',
          itemCount: skuPageSize,
          sortDirection: sortDirection || '',
          search: search || '',
          objectName: '',
          filter: []
        };

        this.service.getSkuListWithPagination(requestBody).subscribe(data => {
          let skus = [];
          data.forEach((item) => {
            const foundObject = this.parentFilteredSkuDropDownList.find(existingItem => existingItem.id === item.id);
            if (!foundObject) {
              skus.push({
                id: item.id,
                value: item.name,
                checked: false
              });
            }
          });
          this.SkuDropDownList = [...this.SkuDropDownList, ...skus];
          this.parentFilteredSkuDropDownList = [...this.parentFilteredSkuDropDownList, ...skus];
          if (this.parentFilteredSkuDropDownList.length === 0) {
            this.parentFilteredSkuDropDownList = [...skus];
          }
          this.filteredSkuDropDownList = this.SkuDropDownList;
          this.isSkuLoading = false;
        }, error => {
          this.isSkuLoading = false;
          console.error('Error loading SKU list', error);
        });
      } else {
        if (this.isSkuLoading) return;
        this.isSkuLoading = true;

        const requestBody = {
          pageIndex: skuPageNumber,
          sortBy: sortBy || 'createdDate',
          itemCount: skuPageSize,
          sortDirection: sortDirection || '',
          search: search || '',
          objectName: '',
          filter: []
        };

        this.service.getSkuListWithPagination(requestBody).subscribe(data => {
          let skus = [];
          data.forEach((item) => {
            const foundObject = this.parentFilteredSkuDropDownList.find(existingItem => existingItem.id === item.id);
            if (!foundObject) {
              skus.push({
                id: item.id,
                value: item.name,
                checked: false
              });
            }
          });

          this.SkuDropDownList = resetList ? skus : [...this.SkuDropDownList, ...skus];
          this.parentFilteredSkuDropDownList = [...this.parentFilteredSkuDropDownList, ...skus];
          if (this.parentFilteredSkuDropDownList.length === 0) {
            this.parentFilteredSkuDropDownList = [...skus];
          }
          this.filteredSkuDropDownList = this.SkuDropDownList;
          this.isSkuLoading = false;
        }, error => {
          this.isSkuLoading = false;
          console.error('Error loading SKU list', error);
        });
      }
    }
  }
  onScroll(): void {
    this.skuPageNumber++;
    this.getPaginatedSkuList(this.skuPageNumber, this.skuPageSize, this.searchTerm, '', '', false, false);
  }
  filterSkuList(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
  }
  handleSearchSku(event: KeyboardEvent): void {
    event.preventDefault();
    this.searchSku();
  }
  searchSku(): void {
    this.searchTerm = this.manageProgramPeriod.get('search').value;
    this.skuPageNumber = 0;
    this.getPaginatedSkuList(this.skuPageNumber, this.skuPageSize, this.searchTerm, '', '', true, true);
  }
  openManageProgramPeriodDialog(DialogName, type): void {
    this.SkuDropDownList.forEach((items) => {
      items['checked'] = false;
    });
    this.selectedskuIds = [];
    this.filteredSkuDropDownList = [...this.SkuDropDownList];
    // this.parentFilteredSkuDropDownList = [...this.SkuDropDownList];
    if (type === 'add') {
      this.showSaveButton = false;
      this.showDeleteButton = false;  // Hide delete button for 'add'
      this.showIneligibleSkuButton = true;
      this.loadSkuData();
      this.data = null;
      this.manageProgramPeriod = this._formbuilder.group({
        id: null,
        invoiceNumber: null,
        bpNumber: null,
        skuDetails: this._formbuilder.array([]),
        shippedDate: null,
        processedDate: new Date(),
        isRejected: false,
        totalSalesPrice: null,
        skuId: this._formbuilder.control({ value: [], disabled: true }),
        search: new FormControl(''),
        reason: null,
      });
      this.formTitle = 'Add Credit/ Invoice';

      this.manageProgramPeriod.get('bpNumber')!.valueChanges.subscribe((value: string) => {
        if (!value || !value.trim()) {
          this.selectedUserTooltipForDialog = '';
          this.selectedFullnameForDialog = '';
        }
      });

      // Subscribe to shippedDate changes
      this.manageProgramPeriod.get('shippedDate').valueChanges.subscribe((date) => {
        if (date) {
          // Enable the SKU dropdown when a valid shippedDate is selected
          this.manageProgramPeriod.get('skuId').enable();
          this.skuDataMap = {};
          const selectedSkuList = this.manageProgramPeriod.get('skuId').value;
          const skuDetails = this.manageProgramPeriod.get('skuDetails') as FormArray;
          skuDetails.clear();
          selectedSkuList.forEach((skuId) => {
            const selectedSku = this.SkuDropDownList.find((sku) => sku.id === skuId);
            const skuName = selectedSku ? selectedSku.value : '';
            const controlGroup = this._formbuilder.group({
              skU_Id: [skuId],
              skU_name: [skuName],
              totalPoint: [null],
              totalSalePrice: [null],
              totalListPrice: [null],
              totalUnit: [1],
              skuRejectionReason: [null],
              readOnlySkuRejection: [null],
            });

            this.getDetailsViaSku(skuId, controlGroup);
            this.addUnitChangeListener(controlGroup);
            skuDetails.push(controlGroup);
          });
        } else {
          this.manageProgramPeriod.get('skuId').disable();
        }
      });
      this.initializeSkuForm();
    } else if (type === 'edit' && this.data) {
      this.formTitle = 'Edit Credit/ Invoice';
    }

    this.creditDialog = this._matDialog.open(DialogName, {
      width: '1200px',
      disableClose: true,
      data: { type }, // Pass the type to the dialog
    });

    this.creditDialog.afterClosed().subscribe(() => {
      this.resetForm();
    });

    this.filteredUsersForDialog = this.manageProgramPeriod.get('bpNumber')!.valueChanges.pipe(
      debounceTime(300), // Add debounce to avoid multiple API calls for every keystroke
      distinctUntilChanged(),
      switchMap((value: string) => this.searchUsersfordialog(value)) // Fetch users based on input
    );
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

    return this.service.GetUserById(payload).pipe(
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
      this.selectedUserTooltipForDialog = this.selectedUserNameForDialog; // Tooltip uses the formatted name
      const bpNumberControl = this.manageProgramPeriod.get('bpNumber');
      if (bpNumberControl) {
        bpNumberControl.setValue(selectedUser.bpNumber); // Set only the bpNumber in the form control
      }
    } else {
      this.selectedUserTooltipForDialog = '';
      const bpNumberControl = this.manageProgramPeriod.get('bpNumber');
      if (bpNumberControl) {
        bpNumberControl.setValue(''); // Clear the form control if no user is selected
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
  onUserSearch(value: string): void {
    if (!value.trim()) {
      this.filteredUsersForDialog = of([]);
    }
  }
  checkInvoiceDate(skuDropdown: MatSelect) {
    const invoiceDate = this.manageProgramPeriod.get('shippedDate').value;
    if (!invoiceDate) {
      this._notificationService.warningTopRight("Please select the Invoice date first");
      skuDropdown.close();
    }
    this.skuDropdown.open();
  }
  get shippedDate() {
    return this.manageProgramPeriod.get('shippedDate');
  }
  resetDropdownState() {
    this.manageProgramPeriod.controls['skuId'].setValue(null);

    setTimeout(() => {
      this.manageProgramPeriod.controls['skuId'].setValue(this.selectedskuIds);
    }, 0);
  }
  isInvoiceDateSelected(): boolean {
    return !!this.shippedDate?.value;
  }
  closeManageProgramPeriodDialog() {
    this.creditDialog.close()
  }
  get skuDetails(): FormArray {
    return this.manageProgramPeriod.get('skuDetails') as FormArray;
  }
  clearSkuRejectionReason(index: number): void {
    const skuArray = this.skuDetails;
    if (skuArray && skuArray.at(index)) {
      const controlGroup = skuArray.at(index);

      if (!controlGroup['originalValues']) {
        controlGroup['originalValues'] = {
          totalListPrice: controlGroup.get('totalListPrice')?.value,
          totalSalePrice: controlGroup.get('totalSalePrice')?.value || 0,
          totalPoint: controlGroup.get('totalPoint')?.value,
        };
      }

      controlGroup.get('skuRejectionReason')?.setValue(null);

      const totalListPrice = controlGroup['originalValues'].totalListPrice;
      const totalUnit = controlGroup.get('totalUnit')?.value || 1;
      const totalSalePrice = totalListPrice * totalUnit;

      controlGroup.get('totalListPrice')?.setValue(totalListPrice);
      controlGroup.get('totalSalePrice')?.setValue(totalSalePrice);
      controlGroup.get('totalPoint')?.setValue(controlGroup['originalValues'].totalPoint);

      console.log('Final Values:', {
        totalListPrice: controlGroup.get('totalListPrice')?.value,
        totalSalePrice: controlGroup.get('totalSalePrice')?.value,
        totalPoint: controlGroup.get('totalPoint')?.value,
      });
    }
  }
  getDetailsViaSku(skuId: string, controlGroup: FormGroup) {
    this.isLoading = true; // Show loader

    if (this.skuDataMap[skuId]) {
      this.patchSkuData(controlGroup, this.skuDataMap[skuId]);
      this.isLoading = false; // Hide loader
      return;
    }

    const invoicenumber = this.manageProgramPeriod.get('invoiceNumber').value;
    const invoiceDate = this.formateSelectedDate(this.manageProgramPeriod.get('shippedDate').value);
    const object = { invoiceDate, invoicenumber, skuId };

    this.service.getDetailsViaSku(object).subscribe(
      data => {
        if (data) {
          this.skuDataMap[skuId] = data;
          this.patchSkuData(controlGroup, data);
        }
      },
      error => {
        console.error('Error fetching SKU data', error);
      },
      () => {
        this.isLoading = false; // Hide loader after API completes
      }
    );
  }
    
  patchSkuData(controlGroup: FormGroup, data: any) {
    const patchedValues = {
      skU_name: data.name || controlGroup.get('skU_name').value,
      totalPoint: data.points,
      totalSalePrice: data.salePrice || 0,
      totalListPrice: data.listPrice,
      totalUnit: data.units ?? 1,
      totalSalesPrice:data.totalSalesPrice|| 0,
      skuRejectionReason: controlGroup.value.skuRejectionReason 
        ? controlGroup.value.skuRejectionReason 
        : data.isEligible 
          ? null 
          : 'SKU ineligible',
      readOnlySkuRejection: controlGroup.value.isItemRejection 
        ? controlGroup.value.isItemRejection 
        : !data.isEligible
    };
    controlGroup.patchValue({
      skU_name: patchedValues.skU_name,
      totalPoint: patchedValues.totalPoint,
      totalSalePrice: patchedValues.totalSalePrice,
      totalListPrice: patchedValues.totalListPrice,
      totalUnit: patchedValues.totalUnit,
      totalSalesPrice:patchedValues.totalSalesPrice,
      skuRejectionReason: patchedValues.skuRejectionReason,
      readOnlySkuRejection: patchedValues.skuRejectionReason
    });
    controlGroup.get('totalPoint').patchValue(patchedValues.totalPoint);
    this.addUnitChangeListener(controlGroup);

    controlGroup['originalValues'] = {
      totalListPrice: patchedValues.totalListPrice,
      totalSalePrice: patchedValues.totalSalePrice,
      totalPoint: patchedValues.totalPoint,
    };

    controlGroup.get('skuRejectionReason').valueChanges.subscribe(reason => {
      if (reason) {
        controlGroup.get('totalListPrice').setValue(0);
        controlGroup.get('totalSalePrice').setValue(0);
        controlGroup.get('totalPoint').setValue(0);
      } else {
        controlGroup.get('totalListPrice').setValue(controlGroup['originalValues'].totalListPrice);
        controlGroup.get('totalSalePrice').setValue(controlGroup['originalValues'].totalSalePrice);
        controlGroup.get('totalPoint').setValue(controlGroup['originalValues'].totalPoint);
      }
    });
     if (patchedValues.skuRejectionReason) {
      this.readOnlySkuRejection = false;
      if (!data.isEligible) {
        this.readOnlySkuRejection = true;
      } else {
        this.readOnlySkuRejection = false;
      }
    }
  }
  clearSkuDetails() {
    const skuDetails = this.manageProgramPeriod.get('skuDetails') as FormArray;
    while (skuDetails.length) {
      skuDetails.removeAt(0);
    }
  }
  onSkuListDropdownClosed() {
    this.manageProgramPeriod.controls['search'].setValue('')
    this.SkuDropDownList = [...this.parentFilteredSkuDropDownList]
    this.filteredSkuDropDownList = this.SkuDropDownList;
  }

  handleButtonClick(event, deletepopup) {
    if (event.buttonAction === 'for_edit') {
      this.showDeleteButton = true;
      this.data = event.item;
      this.enableButton = false;
      this.showSaveButton = true;
      this.showIneligibleSkuButton = false;
      this.manageProgramPeriod = this._formbuilder.group({
        id: event.item.id,
        invoiceNumber: event.item.invoiceId,
        bpNumber: [{ value: event.item.userID, disabled: true }],
        skuDetails: this._formbuilder.array([]),
        shippedDate: [{ value: event.item.invoiceDate, disabled: false }],
        processedDate: [{ value: event.item.processedDate, disabled: false }],
        isRejected: event.item.rejected === 'Accepted' ? false : true,
        reason: event.item.rejectionComment,
        totalSalesPrice: event.item.totalSalesPriceUser,
        skuId: [{ value: [], disabled: false }],
        search: new FormControl(''),
      });

      this.manageProgramPeriod.get('invoiceNumber').disable();
      this.formTitle = 'Edit Credit/ Invoice';
      const skuArray = this.manageProgramPeriod.get('skuDetails') as FormArray;
      event.item.skuInfos.forEach(sku => {
        if (!this.SkuDropDownList.some(item => item.id === sku.skU_Id)) {
          this.SkuDropDownList.push({ id: sku.skU_Id, value: sku.skU_name });
        }
        const skuGroup = this._formbuilder.group({
          skU_Id: [{ value: sku.skU_Id, disabled: true }],
          skU_name: [{ value: sku.skU_name, disabled: true }],
          totalPoint: [{ value: sku.points, disabled: true }],
          totalSalePrice: [{ value: sku.salePrice, disabled: true }],
          totalListPrice: [{ value: sku.listprice, disabled: true }],
          totalUnit: [{ value: sku.units, disabled: false }],
          skuRejectionReason: [{ value: sku.reasonOfItemRejection, disabled: false }],
          isItemRejection: [{ value: sku.isItemRejected, disabled: false }],
          readOnlySkuRejection: [{ value: null, disabled: true }],
          totalSalesPrice: [{ value: sku.totalSalesPrice || 0, disabled: false }]
        });
        this.getDetailsViaSku(sku.skU_Id, skuGroup);
        this.addUnitChangeListener(skuGroup);
        skuArray.push(skuGroup);
      });

      this.openManageProgramPeriodDialog(this.templateRefForm, 'edit');
      this.selectedskuIds = [];
      const selectedSkuIds = event.item.skuInfos.map(sku => sku.skU_Id);
      this.SkuDropDownList.forEach((items) => {
        if (selectedSkuIds.includes(items.id)) {
          items['checked'] = true;
          this.selectedskuIds.push(items.id);
        } else {
          items['checked'] = false;
        }
      });
      this.filteredSkuDropDownList = this.SkuDropDownList;
      this.parentFilteredSkuDropDownList = this.SkuDropDownList;
      this.manageProgramPeriod.controls.skuId.setValue(selectedSkuIds);
    }
    else if (event.buttonAction === 'for_delete') {
      this.openDeletePopUp(event.item.invoiceId, event.item.userID, deletepopup);
    }
  }
  handleKeydown(event: KeyboardEvent): void {
    event.stopPropagation();
    if (event.key === 'Enter') {
      this.handleSearchSku(event);
    }
  }
  handleKeyUp(event: KeyboardEvent): void {
    event.stopPropagation();
    if (this.manageProgramPeriod.get('search').value.length >= 3 || event.key === 'Backspace') {
      this.handleSearchSku(event);
    }
  }
  
  detectCheckboxClick(event: any): void {
    this.onFieldChange();
    const selectedSkuList = [];
    this.SkuDropDownList.forEach((items) => {
      if (event.id === items.id) {
        items['checked'] = !items['checked'];
        if (!items['checked']) {
          delete this.skuDataMap[items.id];
        }
      }
    });
    this.parentFilteredSkuDropDownList.forEach((items) => {
      if (items['checked']) {
        selectedSkuList.push(items.id);
      }
    });
    this.selectedskuIds = selectedSkuList;
    this.manageProgramPeriod.controls.skuId.setValue(selectedSkuList);

    const skuDetails = this.manageProgramPeriod.get('skuDetails') as FormArray;
    const newSkuDetails: FormGroup[] = [];

    selectedSkuList.forEach(skuId => {
      const existingSkuIndex = skuDetails.value.findIndex(sku => sku.skU_Id === skuId);
      if (existingSkuIndex !== -1) {
        const existingSkuControl = skuDetails.at(existingSkuIndex) as FormGroup;
        newSkuDetails.push(existingSkuControl);
      } else {
        const selectedSku = this.parentFilteredSkuDropDownList.find(sku => sku.id === skuId);
        const skuName = selectedSku ? selectedSku.value : '';
        const controlGroup = this._formbuilder.group({
          skU_Id: [skuId],
          skU_name: [skuName],
          totalPoint: [null],
          totalSalePrice: [null],
          totalListPrice: [null],
          totalUnit: [1],
          skuRejectionReason: [null],
          readOnlySkuRejection: [null],
          totalSalesPrice: [null]
        });
        if (selectedSku?.isNew) {
          controlGroup.patchValue({
            skU_Id: [null],
            skU_name: [selectedSku.value],
            totalPoint: [0],
            totalSalePrice: [0],
            totalListPrice: [0],
            totalUnit: 1,
            skuRejectionReason: 'SKU ineligible',
            readOnlySkuRejection: [true],
          });
          controlGroup.controls.totalPoint.disable();
          controlGroup.controls.totalListPrice.disable();
          controlGroup.controls.totalSalePrice.disable();
          controlGroup.controls.skuRejectionReason.disable();
        } else {
          this.getDetailsViaSku(skuId, controlGroup);
        }
        this.addUnitChangeListener(controlGroup);
        newSkuDetails.push(controlGroup);
      }
    });

    skuDetails.clear();
    newSkuDetails.forEach(group => {
      skuDetails.push(group);
    });
  }
  calculateTotals() {
    const skuDetails = this.manageProgramPeriod.get('skuDetails') as FormArray;
    skuDetails.controls.forEach(control => {
      const units = control.get('totalUnit')?.value || 0;
      const listPrice = control.get('totalListPrice')?.value || 0;
      
      control.patchValue({
        totalSalePrice: units * listPrice,
        totalPoint: this.calculatePoints(units, listPrice)
      }, { emitEvent: false });
    });
  }

  private calculatePoints(units: number, listPrice: number): number {
    return units * listPrice * 0.1; 
  }

  addUnitChangeListener(controlGroup: FormGroup) {
    const initialTotalPoints = controlGroup.get('totalPoint')?.value || 0;
    const initialTotalUnits = controlGroup.get('totalUnit')?.value || 1;
    const pointsPerUnit = initialTotalPoints / initialTotalUnits;

    let isInitialSetup = true;

    controlGroup.get('totalUnit')?.valueChanges.subscribe((value: number) => {
      if (!isInitialSetup) {
        if (value === 0) {
          this._notificationService.warningTopRight('Quantity is zero. No points will be calculated.');
        }
      }
      const totalListPrice = controlGroup.get('totalListPrice')?.value || 0;
      const totalSalePrice = value * totalListPrice; 
      controlGroup.get('totalSalePrice')?.setValue(totalSalePrice, { emitEvent: false });
  
      const totalPoints = value * pointsPerUnit;
      controlGroup.get('totalPoint')?.setValue(totalPoints, { emitEvent: false });
  
      isInitialSetup = false; 
    });

    controlGroup.get('totalPoint')?.valueChanges.subscribe(totalPoints => {
      const totalUnits = controlGroup.get('totalUnit')?.value || 1;
      const newPointsPerUnit = totalPoints / totalUnits;
      if (totalPoints !== 0) {
        controlGroup.get('totalPoint')?.setValue(totalPoints, { emitEvent: false });
      }
    });
  }
  deleteSku(index: number, skuControl: AbstractControl,skuDeleteConfirmation) {
    this.skuToDelete = { index, control: skuControl };
    this.skuDeleteModal = this._matDialog.open(skuDeleteConfirmation, {
    });
  }

  confirmSkuDelete(){
    const invoiceNumber = this.manageProgramPeriod.get('invoiceNumber').value;
    const bpNumber = this.manageProgramPeriod.get('bpNumber').value;
    const skuId = this.skuToDelete.control.get('skU_Id').value;

    const deleteObject = {
      invoice: invoiceNumber,
      bpNumber: bpNumber,
      skuId: skuId
    };

    this.service.DeleteSku(deleteObject).subscribe({
      next: (data) => {
        const skuDetails = this.manageProgramPeriod.get('skuDetails') as FormArray;
        skuDetails.removeAt(this.skuToDelete.index);
        this.selectedskuIds = this.selectedskuIds.filter(id => id !== skuId);
        this.SkuDropDownList = this.SkuDropDownList.map(item => {
          if (item.id === skuId) {
            item.checked = false;
          }
          return item;
        });
        this._notificationService.successTopRight('SKU deleted successfully');
        this.creditDialog.close();
        this.ListPointCreditManager();
      },
      error: (error) => {
        this._notificationService.errorTopRight('Failed to delete SKU');
      }
    });
  
  }
  
 
  saveManageProgramPeriod() {
    const validateForm = this.checkvalidation();
    let isValidationError = false;
  
    const skuDetailsFormArray = this.manageProgramPeriod.get('skuDetails') as FormArray;
  
    if (validateForm && !isValidationError) {
      const skuDetailsArray = skuDetailsFormArray.controls.map((control: FormGroup) => {
        // Direct access to form control values
        const points = control.get('totalPoint')?.value || 0;
        const units = control.get('totalUnit')?.value || 0;
        const skuId = control.get('skU_Id')?.value;
        const skuName = control.get('skU_name')?.value;
        const salePrice = control.get('totalSalePrice')?.value || 0;
        const rejectionReason = control.get('skuRejectionReason')?.value;
        const totalSalesPrice = control.get('totalSalesPrice')?.value || 0;
        return {
          quantity: units,
          totalSalePrice: salePrice,
          id: this.skuDataMap[skuId]?.id || null,
          sku: skuName,
          itemRejectionReason: rejectionReason || null,
          totalPoint: points.toString(),
          isItemRejection: rejectionReason ? true : false,
          totalSalesPrice:totalSalesPrice
        };
      });
  
      const reqObj = {
        id: this.data?.id,
        bpNumber: this.manageProgramPeriod.get('bpNumber').value,
        skUsinformation: skuDetailsArray,
        invoiceNumber: this.manageProgramPeriod.get('invoiceNumber').value,
        shippedDate: this.formateSelectedDate(this.manageProgramPeriod.get('shippedDate').value),
        isRejected: this.manageProgramPeriod.get('isRejected').value,
        rejectionReason: this.manageProgramPeriod.get('reason').value || null,
        processedDate: this.formateSelectedDate(this.manageProgramPeriod.get('processedDate').value),
        processedComment:null,
      };
  
      // Check if 'id' exists (null or undefined)
      if (!reqObj.id) {
        // Call SaveInvoice if id is null or undefined
        this.service.SaveInvoice(reqObj).subscribe({
          next: (resp) => {
            if (resp.isSuccess) {
              this._notificationService.successTopRight('Invoice saved successfully.');
              this.closeManageProgramPeriodDialog();
              this.ListPointCreditManager();
            } else {
              this._notificationService.errorTopRight(resp.message);
            }
          }
        });
      } else {
        // Call UpdateInvoice if id is present
        this.service.UpdateInvoice(reqObj).subscribe({
          next: (resp) => {
            if (resp.isSuccess) {
              this._notificationService.successTopRight('Invoice updated successfully.');
              this.closeManageProgramPeriodDialog();
              this.ListPointCreditManager();
            } else {
              this._notificationService.errorTopRight(resp.message);
            }
          }
        });
      }
    }
  }
  

  saveSku() {
    if (this.skuForm.valid) {
      const skuName =
      {
        "sku": this.skuForm.get('skuName').value
      }
      this.service.CheckDuplicateSku(skuName).subscribe(resp => {
        if (resp.isSuccess == false) {
          const newSku = {
            id: Date.now(),
            value: this.skuForm.get('skuName').value,
            listPrice: 0,
            totalPoints: 0,
            isNew: true,
            checked: true,
            skuRejectionReason: 'SKU ineligible'
          };
          this.manualSkus.push(newSku);

          // Add the new SKU to the SkuDropDownList
          this.selectedskuIds.push(newSku.id);
          this.SkuDropDownList.push(newSku);
          this.filteredSkuDropDownList = [...this.SkuDropDownList];
          this.parentFilteredSkuDropDownList.push(newSku);

          // Close the SKU dialog
          this.closeSkuDialog();
          const skuDetails = this.manageProgramPeriod.get('skuDetails') as FormArray;
          const controlGroup = this._formbuilder.group({
            skU_Id: [newSku.id],
            skU_name: [newSku.value],
            totalPoint: [{ value: newSku.totalPoints, disabled: true }],
            totalSalePrice: [{ value: newSku.listPrice, disabled: true }],
            totalListPrice: [{ value: newSku.listPrice, disabled: true }],
            totalUnit: [1],
            skuRejectionReason: [{ value: newSku.skuRejectionReason, disabled: true }],
            readOnlySkuRejection: [true],
            isItemRejection: [true]
          });
          this.addUnitChangeListener(controlGroup);
          skuDetails.push(controlGroup);
        } else {
          this._notificationService.errorTopRight("This Non-Kohler SKU already exists");
        }
      });
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
  convertUTC(date) {
    const courseStartDate = new Date(date);
    const utcDate = new Date(Date.UTC(courseStartDate.getFullYear(), courseStartDate.getMonth(), courseStartDate.getDate()));
    return utcDate;
  }
  checkvalidation() {
    if (!checkValidText(this.manageProgramPeriod.get('invoiceNumber').value)) {
      this._notificationService.errorTopRight('Please fill Invoice Number');
      return false;
    }
    if (!checkValidText(this.manageProgramPeriod.get('bpNumber').value)) {
      this._notificationService.errorTopRight('Please fill User Id');
      return false;
    }
    const skuDetails = this.manageProgramPeriod.get('skuDetails').value;
    for (const sku of skuDetails) {
      if (sku.totalUnit === null || sku.totalUnit === undefined || isNaN(sku.totalUnit)) {
        this._notificationService.errorTopRight('Please enter a valid Qauntity.');
        return false;
      }
    }
    
    if (!this.manageProgramPeriod.get('shippedDate').value) {
      this._notificationService.errorTopRight('Please select Invoice Date');
      return false;
    }
    if (!this.manageProgramPeriod.get('processedDate').value) {
      this._notificationService.errorTopRight('Please select Processed Date');
      return false;
    }
    return true;
  }
  onFieldChange() {
    this.enableButton=true;
  }
  initializeSkuForm() {
    this.skuForm = this._formbuilder.group({
      skuName: ['']
    });
  }
  openSkuDialog(templateRef: any): void {
    this.initializeSkuForm();
    this.skuDialogRef = this._matDialog.open(templateRef, {
      width: '400px',
      disableClose: true
    });
  }
  closeSkuDialog(): void {
    if (this.skuDialogRef) {
      this.skuDialogRef.close();
    }
  }
  handleMessageDelete() {
    const payload = {
      "invoice": this.deleteElement,
      "bpNumber": this.userDeleteElement
    };
    this.service.DeletePointsCreditData(payload).pipe(
      catchError(error => {
        console.log("Error while deleting the send message data: ", error);
        this._notificationService.errorTopRight('Something went wrong, failed to delete the message.');
        return of(null);
      })
    ).subscribe(data => {
      this.ListPointCreditManager();
      if (data && data.isSuccess) {
        this._notificationService.successTopRight('Data deleted Successfully');
      } else {
        this._notificationService.errorTopRight(data?.message ?? 'Something went wrong, failed to delete the message.');
      }
    });
  }
  openDeletePopUp(elementId, userId, deletepopup,) {
    this.deleteElement = elementId;
    this.userDeleteElement = userId;
    this.deleteModal = this._matDialog.open(deletepopup, {
      data: { elementId: this.deleteElement }
    });
  }

  toggleCollapse(): void {
    const collapseDiv = document.getElementById('collapseDiv');
    if (collapseDiv) {
      if (this.isCollapsed) {
        collapseDiv.classList.remove('hidden');
      } else {
        collapseDiv.classList.add('hidden');
      }
      this.isCollapsed = !this.isCollapsed;
    }
  }
}
