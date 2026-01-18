import { ChangeDetectorRef, Component, ElementRef, HostListener, TemplateRef, ViewChild } from '@angular/core';
import { COLUMN_TYPE, DataGridColumnHeader } from 'app/shared/component/data-grid/data-grid.service';
import { IncentiveAdminPanelService } from '../incentive-admin-panel.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ExportExcelService } from 'app/modules/pages/excel-export-service.service';
import { MatSidenav } from '@angular/material/sidenav';
import { NotificationService } from 'app/shared/notification/notification';
import { checkValidEmail, checkValidText } from 'app/shared/validation/validation-utils';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseMockApiService } from '@fuse/lib/mock-api';
import { FilterService } from 'app/shared/component/filter/filter.service';
import { SharedService } from 'app/shared/shared-service';
import { AuthService } from 'app/core/auth/auth.service';
import { ModernService } from 'app/layout/layouts/horizontal/modern/modern.service';
import { UserService } from 'app/core/user/user.service';
import { Observable, catchError, of } from 'rxjs';
import { debounce } from 'lodash';
import { DatePipe } from '@angular/common';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-user-administration',
  templateUrl: './user-administration.component.html',
  styleUrls: ['./user-administration.component.scss']
})
export class UserAdministrationComponent extends FilterService{
  @ViewChild('sidenav') sidenav: MatSidenav;
  selectedTabIndex = 0; 
  modalReferenceForDetail:any;
  modelRefForTaxConfirm:any;
  modelRefForBulkUploadTax:any;
  deleteStatic=false;
  SetTemporaryPasswordForm:FormGroup;
  manageUserTaxInformationForm: FormGroup;
  selectedUserEmails: string[] = [];
  AdminForm:FormGroup;
  modulePermissions: any[] = [];
  form: FormGroup;
  userProfilePicture = 'assets/images/default_user.png'
  rolePermissionForm: FormGroup;
  taxDocumentForm: FormGroup;
  modules: any[] = [];
  sortedModules: any[] = []; // Array to hold sorted modules
  currentPage = 1;
  dynamicdropdown: any[];
  dialogForm:FormGroup;
  dialogFormForBulkMessage:FormGroup;
  editMode: boolean[] = [];
  selectedUserIds: any[] = [];
  DynamicForm:FormGroup;
  gridColumnsTab1: DataGridColumnHeader[];
  gridColumnsTab2: DataGridColumnHeader[];
  gridColumnsView: DataGridColumnHeader[];
  isOrderRedemptionEnabled: boolean = false;
  isPointsCreditEnabled: boolean = false;
  columnType = COLUMN_TYPE;
  dataSourceTab1 = null;
  dataSourceTab2 = null;
  RoleList=[];
  fileNames: string[] = [];
  sidenavWidth = 75;
  modalReferenceForDynamic:any;
  actualLoadingPercent: number = 0;  // Add this property

  pages: number[] = [];
  UserForm:FormGroup
  title: string;
  data: any;
  loginUser: string;
  deletelement: any;
  loading = false;
  selectedRole = null
  UserId: any;
  UserName: any;
  selectAllCheckbox = false;
  selectedIndex: any;
  sendMessage: boolean = false;
  filterApplied = false;
  selectedUserid: any;
  label = '';
  isEdit = false;
  isEditForAdmin=false;
  isFilterSubmitted: boolean = false;
  searchForm: FormGroup;
  transactionModal: any;
  userInfo = [
    {label: 'Points Balance', value: '11500', flag: false}, {label: 'YTD Points Earned', value: '15000', flag: false}, 
    {label: 'YTD Points Redeemed',value: '3500',flag: false}, {label: 'YTD Sales Total', value: '$10,125.49', flag: false},
    {label: 'Logs In >1x/mo on average', value: 'Yes', flag: false}, {label: 'Tier Level [Phase II]', value: '$100k+', flag: true}, 
    {label: 'Date Account Created',value: '01/01/2020',flag: false}, {label: 'Last Login Date', value: '06/15/2024', flag: false},
    {label: 'In Nightly CRM Feed', value: 'Yes', flag: true}, {label: 'Required Courses Completed', value: '5', flag: false}, 
    {label: 'Required Courses Available',value: '10',flag: false}  
  ];
  editModes: boolean[] = [];
  dynamiForm: FormGroup;
  userDataDetail: any;
  filterOptions: any[];
  IsButtonDisabled=false;
  appliedFilters: any[] = []; // Initialize as an empty array
  highlightFilter: boolean;
  stateList = [];
  masterDynamicFields = [];
  userDynamicFields = [];
  userCustomFieldData: FormArray;
  deletelementfordynamicfeild: any;
  modalReferences: any;
  manageAdminProfiles: any;
  userarray=[];
  deleteElementForDetails: any;
  UserEmail: any;
  modalForTemporaryPassword: any;
  modalForBulk: any;
  ModalForAdmin: any;
  dataforAdmin: any;
  showUserPermissions = false;
  yearsArray = []
  userTaxFiles = [];
  userTaxStatuses: string[] = ['Pending', 'Verified', 'Rejected']; 
  dataforVeifyDoc: any;
  dataforBulkUploadTax: any;
  selectedUserId: any;
  role: string | null = null;
  selectedTaxDocument = null;
  LMSadminPermission: boolean;
  ProgressTaxDocument1099: any;
  gridColumns: DataGridColumnHeader[];
  dataSource: any;
  totalRecords1099: any;
  totalRecordsforView: any;
  totalPages1099: number;
  totalPagesforView: number;
  pages1099: number[]=[];
  dataSourceForView= null;
  fileNamesError: any;
  isStart = false;
  res: Observable<null | string> = of(null);
  loadingPercent = 0;
  intervalId = {} as any;
  dataloading: boolean;
  ItemId: any;
  confirmationDialog: any;
  constructor(
    private service: IncentiveAdminPanelService, 
    private _formGroup: FormBuilder, 
    private datePipe: DatePipe,
    private exportExcelService: ExportExcelService,
    private notificationService:NotificationService,
    private _matDialog: MatDialog,
    private _sharedService: SharedService,
    private modalService: BsModalService,
    private _activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private modernService: ModernService,
    private _userService: UserService,
    private cd:ChangeDetectorRef,
    private eRef: ElementRef
  ) {
    super();
    const startYear = 1980;
    const currentYear = new Date().getFullYear();
    this.yearsArray = [];
    for (let year = startYear; year <= currentYear; year++) {
      this.yearsArray.push(year.toString());
    }
  }

  ngOnInit() {
   
    this.ApplySearch = debounce(this.ApplySearch, 300);
    this._activatedRoute.queryParams.subscribe(params => {
      if(params.id && params.email){
        this.impersonateUser(params.id, params.email)
      }
    })
    this.role = window.sessionStorage.getItem('role');
    const isLmsAdmin = window.sessionStorage.getItem("isLmsAdmin");
    this.LMSadminPermission = isLmsAdmin === 'true'; 
    if (window.location.pathname.includes('admin-user')) {
      this.title = 'Admin User'
      this.onChanged({index: 1});
    } else if (window.location.pathname.includes('public-user')) {
      this.title = 'Public User'
      this.onChanged({index: 0});
    }
    this.sendMessage = true;
    this.loginUser = window.sessionStorage.getItem('email');
    this.gridColumnsTab1 = this.getGridSettingsTab1();
    this.gridColumnsTab2 = this.getGridSettingsTab2();
    this.gridColumns = this.getGridSettings();
    
    this.sortBy = this.apiRequest.sortBy;
    this.searchForm = this._formGroup.group({
      search: '',

    });
    this.UserForm = this._formGroup.group({
      name: [''],
      email: [{ value: '', disabled: false }],
      phone: [null],
      city: [null],
      organization: [''],
      manager: [''],
      bpNumber: [{ value: '', disabled: false }],
      tierLevel: [''],
      role:[''],
      status:[''],
      rewardsBalance:0,
      rewordSpend:0,
      rewardsEarned:0,
      isTestUser: false,
      isLmsAdmin: false,
      userId: '',
      firstname: '',
      lastName: '',
      zipCode: null,
      state: null,
      address1: null,
      address2: null,
      target:'1500000',
      allfieldsarray: this._formGroup.array([])
    });
    this.AdminForm = this._formGroup.group({
      name: '',
      email: '',
      bpNumber:[''],
      phone: '',
      roles: [''],
      status: '',
      firstName: '',
      lastName: '',
      target:'',
      isLmsAdmin: false,
      isTestUser: false,
    });
    
    this.GetDropDownData();
    this.DiaglogForm();

    this.DynamicForm = this._formGroup.group({
      allfieldsarray: this._formGroup.array([])
    });

    this.SetTemporaryPasswordForm=this._formGroup.group({
      newPassword:[''],
      confirmPassword:[''],
      email:['']
    })
    this.manageUserTaxInformationForm = this._formGroup.group({
      year: null,
      file: null,
      status: null
    })
    this.onYearChange();
    this.form = this._formGroup.group({});
    this.rolePermissionForm = this._formGroup.group({});
    this.GetAllModulesIncheckBox();
    //this.loadDynamicFields();

    this.dynamicdropdown = [
      {
        id: 'Date',
        value: 'Date'
      },
      {
        id: 'Textbox',
        value: 'Textbox'
      },
      {
        id: 'Number',
        value: 'Number'
      },
    ];
    this.service.GetModulerPermissionAccessByRoleId(window.sessionStorage.getItem('roleId')).subscribe(
      (resp) => {
        const modules = resp.modules || resp.data || resp; 
  
        if (Array.isArray(modules)) {
  
          const orderRedemptionModule = modules.find(module => module.moduleName === 'Order Redemption Manager');
          const pointsCreditModule = modules.find(module => module.moduleName === 'Points Credit Manager');
  
          if (orderRedemptionModule) {
            this.isOrderRedemptionEnabled = orderRedemptionModule.isEnabled;
          }
          if (pointsCreditModule) {
            this.isPointsCreditEnabled = pointsCreditModule.isEnabled;
          }
        } else {
          this.notificationService.errorTopRight('Invalid response structure for module permissions');
        }
      },
      (error) => {
        this.notificationService.errorTopRight('Failed to fetch module permissions');
      }
    );
  }

  onYearChange() {
    const selectedYear = this.manageUserTaxInformationForm.get('year')?.value;
    this.manageUserTaxInformationForm.get('file').setValue(null);
    this.manageUserTaxInformationForm.get('status').setValue(null);
    this.userTaxFiles = [];
    if (selectedYear) {
      const payload = {
        year: selectedYear,
        userId: this.data?.id
      }
      this.service.getUserTaxFileByYear(payload).pipe(
        catchError(error => {
          console.log(error);
          this.notificationService.errorTopRight('Something went wrong, unable to fetch user documents.')
          return of(null);
        })
      ).subscribe(data => {
        if (data && data.length) {
          this.userTaxFiles = data;
        } 
      })
      
    } else {
      this.userTaxFiles = [];
    }
  }

  getFilesForYear(year: number) {
    // Mocked file data; replace with actual service call
    return [
      { id: 1, value: `File 1 for ${year}` },
      { id: 2, value: `File 2 for ${year}` },
    ];
  }

  event: { pageIndex: number; pageSize: number; };
  pageIndex1099 = 1;
  pageIndexforView = 1;
  sortBy = '';
  modalReference: any;
  sortDirection = '';
  enableButton = false;
  totalRecords = 0;
  formFilter: FormGroup;
  pagesforView: number[] = [];
  totalpagesForView: number;
  currentPageforView= 1;
  apiRequest = {
    itemCount: 25,
    pageIndex: 1,
    sortBy: "createdDate",
    search: "",
    sortDirection: "desc",
    filter: []
  };
  apiRequest1099 = {
    itemCount: 5,
    pageIndex: 1,
    sortBy: "createdDate",
    search: "",
    sortDirection: "desc",
    filter: []
  };
  apiRequestForView = {
    itemCount: 5,
    pageIndex: 1,
    sortBy: "createdDate",
    search: "",
    sortDirection: "desc",
    objectName: "",
    filter: []
  };
  
  totalPages: number;

  getGridSettingsTab1(): DataGridColumnHeader[] {
    return [
      { columnName: '#', columnTitleKey: 'Select All', columnValue: '', type: this.columnType.CHECKBOX, show: true, sort: false },
      {
        columnName: 'action',
        columnTitleKey: 'Actions',
        columnValue: 'id',
        type: this.columnType.POPOVER,
        buttonArray: true,
        headerClass: 'width-150px',
        buttons: [
          {
            buttonAction: 'for_edit',
            icon: 'edit',
            tooltipKey: 'Edit User',
            buttonClass: 'btn-color-600',
            disableBtnParam: 'disableDownload'
          },
          {
            buttonAction: 'for_delete',
            icon: 'delete',
            tooltipKey: 'Delete',
            buttonClass: 'btn-color-600',
          },
          {
            buttonAction: 'for_impersonate-user_users',
            icon: 'account_circle',
            tooltipKey: 'Impersonate User',
            buttonClass: 'btn-color-600',
            disableBtnParam: 'disableEdit'
          },
          {
            buttonAction: 'for_order_redemptions',
            icon: 'shopping_cart',
            tooltipKey: 'Order Redemptions',
            buttonClass: 'btn-color-600',
          },
          {
            buttonAction: 'for_credit',
            icon: 'star',
            tooltipKey: 'Point Credits',
            buttonClass: 'btn-color-600',
          },
          {
            buttonAction: 'for_message',
            icon: 'message',
            tooltipKey: 'Message User',
            buttonClass: 'btn-color-600',
          },
          {
            buttonAction: 'for_training',
            icon: 'school',
            tooltipKey: 'Training Report',
            buttonClass: 'btn-color-600',
          },
        ],
        show: true,
        sort: false,
      },
      { columnName: 'BpNumber', columnTitleKey: 'User Id', columnValue: 'bpNumber', type: this.columnType.TEXT_W_ELLIP_L, show: true, sort: true },
      { columnName: 'name', columnTitleKey: 'First / Last Name', columnValue: 'name', type: this.columnType.TEXT_W_BOLD, show: true, sort: true },
      { columnName: 'email', columnTitleKey: 'Email', columnValue: 'email', type: this.columnType.TEXT_W_ELLIP_L, show: true, sort: true },
      { columnName: 'status1', columnTitleKey: 'Status', columnValue: 'status1', type: this.columnType.Status, show: true, sort: true, },
      { columnName: 'isUserTaxInformation', columnTitleKey: 'W9 on File', columnValue: 'isUserTaxInformation', type: this.columnType.TEXT, show: true, sort: true, textColor: 'white' },
      { columnName: 'rewordEarned', columnTitleKey: 'Point Balance', columnValue: 'rewordEarned', type: this.columnType.COMMANUMBER, show: true, sort: true },
      { columnName: 'rewordBalance', columnTitleKey: 'Total List Price', columnValue: 'rewordBalance', type: this.columnType.COMMANUMBER, show: true, sort: true },
      { columnName: 'organization', columnTitleKey: 'Organization', columnValue: 'organization', type: this.columnType.TEXT_W_ELLIP_L, show: true, sort: true },
    ];
  }
  getGridSettingsTab2(): DataGridColumnHeader[] {
    const roles = window.sessionStorage.getItem('role');
    const hideButton = roles === 'Claim Manager' || roles === 'Admin' || roles === 'Reports Manager';

    return [
      { columnName: '#', columnTitleKey: '', columnValue: '', type: this.columnType.CHECKBOX, show: true, sort: false },
      
      {
        columnName: 'action',
        columnTitleKey: 'Actions',
        columnValue: 'id',
        type: this.columnType.POPOVER,
        buttonArray: true,
        headerClass: 'width-150px',
        buttons: [
          {
            buttonAction: 'for_editAdmin',
            icon: 'edit',
            tooltipKey: 'Edit User',
            buttonClass: 'btn-color-600',
            disableBtnParam: 'disableDownload',
          },
         
          {
            buttonAction: 'for_impersonate-user',
            icon: 'account_circle',
            tooltipKey: 'Impersonate User',
            buttonClass: 'btn-color-600',
            hideButton: hideButton

          },
          
        ],
        show: true,
        sort: false,
      },
      { columnName: 'BpNumber', columnTitleKey: 'User Id', columnValue: 'bpNumber', type: this.columnType.TEXT_W_ELLIP_L, show: true, sort: true },
      { columnName: 'status1', columnTitleKey: 'Status', columnValue: 'status1', type: this.columnType.Status, show: true, sort: true, },
      { columnName: 'name', columnTitleKey: 'First / Last Name', columnValue: 'name', type: this.columnType.TEXT_W_BOLD, show: true, sort: true },
      
      
     
      { columnName: 'role', columnTitleKey: 'User Type', columnValue: 'role', type: this.columnType.TEXT_W_ELLIP_L, show: true, sort: true, },
     
      { columnName: 'email', columnTitleKey: 'Email', columnValue: 'email', type: this.columnType.TEXT_W_ELLIP_L, show: true, sort: true },
    ];
  }
  onFieldChange() {
    this.enableButton = true;
  }

  GetDropDownData()
  {
    if (this.selectedIndex === 0) {
      this.service.GetAllroles(true).subscribe((data: any) => {
        this.RoleList = [];
        if (data) {
          const filteredRoles = data.filter((element: any) => element.value === 'User');
          filteredRoles.forEach((element: any) => {
            this.RoleList.push({
              id: element.id,
              value: element.value
            });
          });
        }
      });
    } else {
      this.service.GetAllroles(false).subscribe((data: any) => {
        this.RoleList = [];
        if (data) {
          const specialRoles = data.filter((element: any) =>
            element.value === 'Super Admin' || 
            element.value === 'Reports Manager' || 
            element.value === 'Claim Manager' || 
            element.value === 'Admin'
          );
          specialRoles.forEach((element: any) => {
            this.RoleList.push({
              id: element.id,
              value: element.value
            });
          });
        }
      });
    }
    
    
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
  
  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalRecords / this.apiRequest.itemCount);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  configureFilters(): any {
    if(this.selectedIndex===0)
      {
        return this.service.getUserFilterSettings();
      }
    else {
      return this.service.getUserFilterSettingsForAdmin();
    }

   
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

    if (this.selectedIndex === 0) {
      this.FetchUsersListforUsers();
    } else if (this.selectedIndex === 1) {
      this.FetchUsersListForAdmin();
    }
  }
  clearFilters() {
    this.appliedFilters = [];
    this.isFilterSubmitted = false;
    this.filterApplied = false;
    console.log('Filters cleared:', this.filterApplied);
  }

  removeFilter(filter) {
    this.appliedFilters = this.appliedFilters.filter(f => f.oid !== filter.oid);
    this.filterApplied = this.appliedFilters.length > 0;
    this.applyFilter({ selectedFilters: this.appliedFilters }, null); 
    this.isFilterSubmitted = false;
  }

  handleResetLinkClick() {
    this.service.resetLinkPassword({email: this.UserForm.get('email').value}).subscribe(data => {
      if (data && data.isSuccess) {
        this.notificationService.successTopRight('Reset password link sent successfully');
      } else {
        this.notificationService.errorTopRight('Error in sending reset password link');
      }
    });
  }
  handleResetLinkClickForAdmin() {
    this.service.resetLinkPassword({email: this.AdminForm.get('email').value}).subscribe(data => {
      if (data && data.isSuccess) {
        this.notificationService.successTopRight('Reset password link sent successfully');
      } else {
        this.notificationService.errorTopRight('Error in sending reset password link');
      }
    });
  }
  openTemporaryPasswordDialog(temporaryPasswordDialog)
  {
    this.modalForTemporaryPassword = this._matDialog.open(temporaryPasswordDialog);

    this.SetTemporaryPasswordForm=this._formGroup.group({
      newPassword: ['', [this.passwordValidator()]],
      confirmPassword:[''],
      email:['']
    })
    
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
  closeDialogForTemporaryPassword()
  {
    this.modalForTemporaryPassword.close();
    this.SetTemporaryPasswordForm.reset();
  }

  handleSetTemporaryPassword() {
    const validateForm = this.checkValidationForTemporaryPassowrd();
    if (validateForm) {
    const newPassword = this.SetTemporaryPasswordForm.get('newPassword').value;
    const confirmPassword = this.SetTemporaryPasswordForm.get('confirmPassword').value;
  
    if (newPassword !== confirmPassword) {
 
      console.log("Passwords do not match.");
      return;
    }
  
    let object = {
      newPassword: newPassword,
      email: this.UserEmail
    };
  
    this.service.SetTemporaryPassword(object).subscribe(data => {
      if (data.isSuccess) {
        this.notificationService.successTopRight('Temporary password created successfully');
        this.modalForTemporaryPassword.close();
      } else {
        this.notificationService.errorTopRight('Some Error');
      }
    });
  }
  }
  checkValidationForTemporaryPassowrd(): boolean {
    if (!checkValidText(this.SetTemporaryPasswordForm.get('newPassword').value)) {
      this.notificationService.errorTopRight('Please fill new password');
      return false;
    } else if (!checkValidText(this.SetTemporaryPasswordForm.get('confirmPassword').value)) {
      this.notificationService.errorTopRight('Please fill confirm password');
      return false;
    } else if (this.SetTemporaryPasswordForm.get('confirmPassword').value !== this.SetTemporaryPasswordForm.get('newPassword').value) {
      this.notificationService.errorTopRight('Passwords do not match.');
      return false;
    } else {
      return true;
   } 
 }
  onPageChange(pageIndex: number) {
   if(this.selectedIndex===0){
    if (pageIndex < 1 || pageIndex > this.totalPages) return;
    this.apiRequest.pageIndex = pageIndex;
    this.currentPage = pageIndex;
    this.FetchUsersListforUsers();
   }
   else{
    if (pageIndex < 1 || pageIndex > this.totalPages) return;
    this.apiRequest.pageIndex = pageIndex;
    this.currentPage = pageIndex;
     this.FetchUsersListForAdmin();
   }
    
  }


  
  // formatNumberWithCommas(value: number): string {
  //   if (value == null) return '';
  //   return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  // }

  FetchUsersListForAdmin() {
    this.dataSourceTab2 = [];
    this.loading=true;
    if (this.appliedFilters && this.appliedFilters.length > 0) {
      this.apiRequest.filter = this.appliedFilters;
    } else {
      this.apiRequest.filter = [];
    }
    this.service.UsersListforAdmin(this.apiRequest).subscribe(data => {
      if (data) {
        if (data.results) {
          this.dataSourceTab2 = data.results;
          if (this.selectAllCheckbox) {
            this.dataSourceTab2.forEach((items) => {
              items.rewordBalance = items.rewordBalance.toFixed(2)
              items.checked = true;
            })
            const checkedList = this.dataSourceTab2
            this.handleCheckBoxClick({item: null, checkedList})
          } else {
            this.dataSourceTab2.forEach((items) => {
              items.rewordBalance = items.rewordBalance.toFixed(2)
            })
          }
       
        }
        this.totalRecords = data.totalRecords;
        this.calculateTotalPages();
      }
      this.loading=false;
    });
  }
  FetchUsersListforUsers() {
    this.dataSourceTab1 = [];
    if (this.appliedFilters && this.appliedFilters.length > 0) {
      this.apiRequest.filter = this.appliedFilters;
    } else {
      this.apiRequest.filter = [];
    }
    this.loading = true;
    this.service.UsersListforUser(this.apiRequest).subscribe(data => {
      if (data) {
        if (data.results) {
          this.dataSourceTab1 = data.results;
          if (this.selectAllCheckbox) {
            this.dataSourceTab1.forEach((items) => {
              items.rewordBalance = items.rewordBalance.toFixed(2)
              items.checked = true;
            })
            const checkedList = this.dataSourceTab1
            this.handleCheckBoxClick({item: null, checkedList})
          } else {
            this.dataSourceTab1.forEach((items) => {
              items.rewordBalance = items.rewordBalance.toFixed(2)
            })
          }
        }
        this.totalRecords = data.totalRecords;
        this.calculateTotalPages();
      }
      this.loading = false;
    });
  }
  onChanged(event: any) {
     this.selectedIndex = event.index;
    if (this.selectedIndex === 0) {
     this.FetchUsersListforUsers();
    } else if (this.selectedIndex === 1) {
      this.FetchUsersListForAdmin();
    }
  }
  
  handleRowClick(event) {}

  handleButtonClick(event, deletepopup, dialogTemplate, userAddEdit, adminAddEdit) {
    if (event.buttonAction === 'for_edit') {
      this.editDialog(event.item, userAddEdit);
    } else if (event.buttonAction === 'for_delete') {
      this.openDeletePopUp(event.item.id, deletepopup);
    } else if (event.buttonAction === 'for_message') {
      this.sendMessage = false;
      this.UserName = event.item.email;
      this.selectedUserid = event.item.id;
      this.dialogForm.controls['email'].setValue(event.item.name);
      this.openDialog(event.item.id, dialogTemplate);
    } else if (event.buttonAction === 'for_editAdmin') {
      this.editAdminDialog(event.item, adminAddEdit);
    } else if (event.buttonAction === 'for_impersonate-user') {
      let roles = window.sessionStorage.getItem('role');
      if (roles === 'Claim Manager' || roles === 'Admin' || roles === 'Reports Manager') {
        this.notificationService.errorTopRight("You don't have permission to Impersonate the user")
      }
      else {
        const tab = window.location.href;
        window.open(`${tab}/?id=${event.item.id}&email=${event.item.email}`, '_blank');
      }
    } 
    else if(event.buttonAction === 'for_impersonate-user_users'){
      const tab = window.location.href;
      window.open(`${tab}/?id=${event.item.id}&email=${event.item.email}`, '_blank');
    }
    else if (event.buttonAction === 'for_order_redemptions') {
      if (this.isOrderRedemptionEnabled) {
    
        this.router.navigate(['/order-redemption-manager'], { queryParams: { bpNumber: event.item.bpNumber } });
      } else {
        this.notificationService.errorTopRight('You do not have permission to access the Order Redemption Manager.');
      }
    }
    else if (event.buttonAction === 'for_credit') {
      if (this.isPointsCreditEnabled) {
        this.router.navigate(['/points-credit-manager'], { queryParams: { bpNumber: event.item.bpNumber } });
      } else {
        this.notificationService.errorTopRight('You do not have permission to access the Points Credit Manager.');
      }
    }
    else if (event.buttonAction === 'for_training') {
      // download training report
      this.service.getUserCourseReport(event.item.id).pipe(
        catchError(error => {
          console.log('Error', error);
          this.notificationService.errorTopRight('Something went wrong, unable to fetch data for the user');
          return of(null);
        })
      ).subscribe(data => {
        if (data.length) {
          const exportdata: any[] = this.getTrainingExportData(data);
          if (exportdata && exportdata.length > 0) {
            this.exportExcelService.exportAsExcelFile(exportdata,`TrainingReport_${event.item.name}`);
          } 
        } else {
          this.notificationService.errorTopRight('No training course record found for the user');
        }
      })
    }
  }

  impersonateUser(id, email) {
    this.authService.GetUserSession({ userId: id }).subscribe((ele) => {
      if (ele.isSuccesfull) {
        const sessionData = {
          email: email,
          token: ele.sessionID,
          userId: ele.userID,
          name: ele.name,
          bpNumber: ele.bpNumber,
          session: true
        };

        const userObj = {
          accessToken: ele.sessionID,
          firstName: ele.name,
          iat: '',
          lastName: '',
          role: '',
          id: ele.userId,
          showIncentiveAdmin: false,
          showLemsAdmin: false,
          showUserIdasEmail: false,
          showLMSAdmin: false
        };

        const permissionObj = {
          roles: ele.roles,
          userModulePermissions: ele.userModulePermissions,
        };

        if (sessionData) {
          this.notificationService.successTopRight(`Impersonated as ${userObj.firstName}`);
          window.sessionStorage.setItem('email', sessionData.email);
          window.sessionStorage.setItem('accessToken', sessionData.token);
          window.sessionStorage.setItem('userId', sessionData.userId);
          window.sessionStorage.setItem('isPreview', JSON.stringify(false));
          window.sessionStorage.setItem("emailId", encodeURIComponent(sessionData.email));
          this._sharedService.setUserName(sessionData.name)
          window.sessionStorage.setItem('bpNumber', sessionData.bpNumber);
          window.sessionStorage.setItem("isLmsAdmin", ele.isLmsAdmin)
          this._sharedService.setProfilePicture('assets/images/default_user.png');
          this._userService.getProfileImage(sessionData.userId).pipe(
            catchError(error => {
              console.log(error, this.userProfilePicture);
              this._sharedService.setProfilePicture(this.userProfilePicture);
              return of(null);
            })
          ).subscribe(data => {
            if (data) {
              var blob = new Blob([data]);
              var objectUrl = URL.createObjectURL(blob);
              this._sharedService.setProfilePicture(objectUrl);
            }
          })
          this.service.GetProgramConfiguration().subscribe((settings: any) => {
            let showLems = true;
            let showIncentive = true;
            let showUserIdasEmail = true;
            let showLMSAdmin = window.sessionStorage.getItem("isLmsAdmin") === 'true';
            if (settings && settings.length > 0) {
              showIncentive = settings[0].includePointsSystem;
              showLems = settings[0].includeAcademySystem;
              showUserIdasEmail = settings[0].userEmailAsUserId;
              window.sessionStorage.setItem("includePointsSystem", JSON.stringify(settings[0].includePointsSystem));
              window.sessionStorage.setItem("userOnbe", JSON.stringify(settings[0].userOnbe))
              window.sessionStorage.setItem("userNeoCurrency", JSON.stringify(settings[0].userNeoCurrency))
            }

            const roles = permissionObj.roles;
            if (roles && roles.length > 0) {
              const roleName = roles[0].role;
              const roleId = roles[0].id;
              window.sessionStorage.setItem('role', roleName);
              window.sessionStorage.setItem('roleId', roleId);

              if (roleName === 'User') {
                window.sessionStorage.setItem("usertype", 'normaluser');
                userObj.role = roleName;
                const payload = { userId: sessionStorage.getItem('userId') }
                this.modernService.getPointsAndSalesSummaryCalculation(payload).subscribe(data => {
                  if (data) {
                    this._sharedService.setTotalPoints(data.remaining_Points);
                  }
                })
                const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';
                window.location.href = redirectURL;  // Redirect to the appropriate page for normal users
              } else {
                window.sessionStorage.setItem("usertype", 'admin');
                setTimeout(() => {
                  window.location.reload();
                }, 0);

                if (showIncentive && permissionObj.userModulePermissions) {
                  const enabledModulePermissions = ele.userModulePermissions.filter(permission => permission.isEnabled);
                  this._sharedService.setModulePermission(enabledModulePermissions);
                  this._sharedService.setModuleSettingsPermission(ele.userModulesSettingData);
                }
                userObj.role = roleName;
                userObj.showIncentiveAdmin = showIncentive;
                userObj.showLemsAdmin = showLems;
                userObj.showUserIdasEmail = showUserIdasEmail;
                userObj.showLMSAdmin = showLMSAdmin;
                const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/incentive-admin-home';
                this.router.navigateByUrl(redirectURL);  // Redirect to the appropriate page for admin users
              }

              this._sharedService.setLoggedInObject(userObj);
              if(roleName === 'User') {
                if(window.location.href.includes('kohlerpreferredpartners.com')) {
                  window.location.href = 'https://kohlerpreferredpartners.com/dashboards'
                } else {
                  window.location.href = 'http://172.191.225.236:8080/IncentiveWeb/dashboards'
                }
              } else {
                const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/incentive-admin-home';
                this.router.navigateByUrl(redirectURL);
              }
            } 
            else {
              this.notificationService.errorTopRight('User does not have any valid role assigned');
            }
          });
        }
      }
    });
}

  getUserDataById(id) {
    this.userDataDetail = {};
    this.service.getUserDataById(id).subscribe(data => {
       this.manageUserTaxInformationForm.controls['status'].setValue(data.documentStatus);
      data['dateAccountCreated'] = new Date(data.dateAccountCreated);
      data['lastLoginDate'] = new Date(data.lastLoginDate);
      this.userDataDetail = data;
      this.UserEmail=data.email;
    });
    this.service.pointsAndSalesData({'userId': id}).subscribe(resp => {
      this.userDataDetail.ytdPointsEarned = resp.ytdPointsEarned;
      this.userDataDetail.ytdPointsRedeemed = resp.ytdPointsRedeemed;
      this.userDataDetail.ytdSalesTotal = resp.ytdSales ? resp.ytdSales.toFixed(2) : '0';
      });
      
    
  }
    
  DiaglogForm()
  {

    this.dialogForm = this._formGroup.group({
      email: [{ disabled: true }],
      subject: [''],
      message: ['']
    });

  }
  openDeletePopUp(elementId, deletepopup) {
    this.deletelement = elementId;
    this.modalReference = this._matDialog.open(deletepopup, {
      data: { elementId: this.deletelement }
    });
  }
  openDialog(event,dialogTemplate) {
    this.dialogForm.controls["subject"].setValue(null)
    this.dialogForm.controls["message"].setValue(null)
    this.modalReference = this._matDialog.open(dialogTemplate);
  }

  SendMailandNotification()
  {
    
    const validateForm = this.checkvalidationforNotification();
    if (validateForm) {
      this.sendMessage = true;
    let object={
      isBroadcast: true,
      userId: this.selectedUserid,
      creatorUserId:this.loginUser,
      title: this.dialogForm.get('subject').value,
      message: this.dialogForm.get('message').value,
      isAlert: false,
      ishighlithed: false
    }
    this.service.SendNotificationsandEmail(object).subscribe(data => {
      if (data.isSuccess) {
        this.notificationService.successTopRight('Message and Mail sent successfully');
        this.sendMessage = false;
        this.closeDialog();

      }
      else{
        this.notificationService.errorTopRight('Error');
      }
    }, err => {
      this.sendMessage = false;
      this.notificationService.errorTopRight('Error');
      this.closeDialog();
    })
  }
    
  }
  closeDialog() {
    this.modalReference.close();
  }


  OpenDialogForBulkNotification(dialogForBulkMessage) {
    this.dialogFormForBulkMessage = this._formGroup.group({
      email: [''],
      subject: [''],
      message: ['']
    });
    this.sendMessage = false;
    // Join selected user emails into a single string
    const selectedEmails = this.selectedUserEmails.join(', ');
    this.dialogFormForBulkMessage.controls["email"].setValue(selectedEmails);
  
    this.modalForBulk = this._matDialog.open(dialogForBulkMessage);
  }
  
  closeBulkDialog() {
    this.modalForBulk.close();
  }

  deleteRecord() {
    let object = {
      id: this.deletelement
    };
    this.service.DeleteUser(object).subscribe(data => {
      if (data.isSuccess) {
        this.notificationService.successTopRight('Deleted Successfully');
        this.FetchUsersListforUsers();
        this.FetchUsersListForAdmin();
      } else {
        this.notificationService.errorTopRight('Error');
      }
    });

  }
  
  openDeletePopUpForDetail(elementId, DeletePopUpForDetail) {
    this.deleteElementForDetails = elementId;
    this.modalReferenceForDetail = this._matDialog.open(DeletePopUpForDetail, {
      data: { elementId: this.deleteElementForDetails }
    });
  }

  deleteRecordfromDetail() {
    
    let object = {
      id: this.deleteElementForDetails
    };
    this.service.DeleteUser(object).subscribe(data => {
      if (data.isSuccess) {
        this.notificationService.successTopRight('Deleted Successfully');
        if(this.selectedIndex===0){
          this.FetchUsersListforUsers();
          this.modalReferenceForDetail.close();
        }
       if(this.selectedIndex===1)
        { this.FetchUsersListForAdmin();
          this.modalReferenceForDetail.close();
          this.ModalForAdmin.close();
        }
       
      } else {
        this.notificationService.errorTopRight('Error');
      }
    });

  }
  ApplySearch(searchValue: string) {
    if(this.selectedIndex === 0)
      { 
        this.loading = true;
        searchValue = searchValue.trim(); 
        searchValue = searchValue.toLowerCase(); 
        this.apiRequest.search = searchValue;
        this.FetchUsersListforUsers();

      }
      else if(this.selectedIndex === 1){
        this.loading = true;
        searchValue = searchValue.trim(); 
        searchValue = searchValue.toLowerCase(); 
        this.apiRequest.search = searchValue;
        this.FetchUsersListForAdmin();
      }
   
  }
  
  applySort(event) {
    if (this.selectedIndex === 1) {
      this.sortBy = event.active;
      this.sortDirection = event.direction;
  
      this.apiRequest.sortBy = this.sortBy;
      this.apiRequest.sortDirection = this.sortDirection.toLowerCase();
  
      this.FetchUsersListForAdmin();
    }
    else {
      this.sortBy = event.active;
      this.sortDirection = event.direction;
  
      this.apiRequest.sortBy = this.sortBy;
      this.apiRequest.sortDirection = this.sortDirection.toLowerCase();
  
      this.FetchUsersListforUsers();
    }
  }

  editDialog(event, userTemplate) {
    this.data = event;
    this.isEdit = true;
    this.enableButton = false;
    this.selectedUserId = event.id;
    
    // Check the condition and set the form fields accordingly
    const isUserEmailAsUserIdDisabled = window.sessionStorage.getItem('userEmailAsUserId') === 'true'; // Disable if 'true', else enable
   // const isUserIdDisabled = event.userId && isUserEmailAsUserIdDisabled;

    this.UserForm = this._formGroup.group({
        name: event.name,
        email: [{ value: event.email, disabled: isUserEmailAsUserIdDisabled }], // Enable if false, disable if true
        phone: event.phone,
        city: event.city,
        organization: event.organization,
        bpNumber: [{ value: event.bpNumber, disabled: true }],
        tireLevel: event.tireLevel,
        roles: ['User'],
        rewordEarned: event.rewordEarned,
        rewordSpend: event.rewordSpend,
        rewordBalance: event.rewordBalance,
        status: event.status1,
        firstName: event.firstName,
        lastName: event.lastName,
        jobTitle: event.jobTitle,
        location: event.location,
        address1: event.address1,
        address2: event.address2,
        zipCode: event.zipCode,
        stateId: event.stateId,
        isTestUser: event.isTestUser,
        userId: [{ value: event.userId ? event.userId : event.bpNumber, disabled: true }],
        isUserTaxInformation: event.isUserTaxInformation === 'Yes' ? true : false,
        w9Year: event.w9Year === null || event.w9Year === undefined || event.w9Year === '' ? new Date().getFullYear().toString() : event.w9Year,
        w9Name: event.w9Name,
        w9Address: event.w9Address,
        w9City: event.w9City,
        w9ZipCode: event.w9ZipCode,
        w9StateId: event.w9StateId,
        target: event.target
    });

    // Initialize the tax information form
    this.manageUserTaxInformationForm = this._formGroup.group({
        year: this.yearsArray[this.yearsArray.length - 1],
        file: null,
        status: null
    });

    this.onYearChange();
    
    // Open the dialog and fetch user-related data
    this.openUserDialog(userTemplate);
    this.getUserDataById(event.id);
    this.getDynamicFields();
    this.getDynamicFieldsUserHas(event.id);
}


  openUserDialog(template: any) {
    this.modalReference = this._matDialog.open(template, { panelClass: 'custom-container'});
  }
  
  openUserAdd(userTemplate) {
    this.isEdit = false;
    this.data = null;
    this.UserForm = this._formGroup.group({
      name: '',
      email: '',
      phone: null,
      city: null,
      organization: '',
      manager: '',
      bpNumber: '',
      tireLevel: '',
      roles: [''],
      rewordEarned: 0,
      rewordSpend: 0,
      rewordBalance: 0,
      status: '',
      firstName: '',
      lastName: '',
      jobTitle: '',
      location: '',
      address1: null,
      address2: null,
      zipCode: null,
      stateId: null,
      isTestUser: false,
      userId: '',
      isUserTaxInformation: false,
      w9Year: new Date().getFullYear().toString(),
      w9Name: '',
      w9Address: '',
      w9City: '',
      w9ZipCode: '',
      target:'1500000',
      w9StateId: null
    });
    this.UserForm.controls['email'].enable();
    if (!this.data) {
      
      this.data = { id: undefined }; 
    }
    this.openUserDialog(userTemplate);
    this.getDynamicFields();
    this.userDynamicFields = [];

  }
 
 

  SaveorUpdateusers()
  {
    const validateForm = this.checkvalidation();

    if (this.isEdit) {
      const taxFile = this.manageUserTaxInformationForm.get('file').value;
      const taxStatus = this.manageUserTaxInformationForm.get('status').value;
      if (!taxFile || !taxStatus) {
        this.manageUserTaxInformationForm.reset();
      }
    }

    if (validateForm) {

    if(this.data.id === undefined)
      {
        const object = {
          id: null,
          name: this.UserForm.get('firstName').value + (this.UserForm.get('lastName').value ? ' '+this.UserForm.get('lastName').value : ''),
          email: this.UserForm.get('email').value,
          phone: this.UserForm.get('phone').value? this.UserForm.get('phone').value : null,
          city: this.UserForm.get('city').value? this.UserForm.get('city').value : null,
          organization: this.UserForm.get('organization').value,
          manager: null,
          bpNumber: this.UserForm.get('bpNumber').value,
          tireLevel: null,
          roles: ['User'],
          rewordEarned: 0,
          rewordSpend: 0,
          rewordBalance: 0,
          status: this.UserForm.get('status').value,
          firstName: this.UserForm.get('firstName').value,
          lastName: this.UserForm.get('lastName').value,
          jobTitle: this.UserForm.get('jobTitle').value,
          location: this.UserForm.get('location').value,
          address1: this.UserForm.get('address1').value ? this.UserForm.get('address1').value : null,
          address2: this.UserForm.get('address2').value ? this.UserForm.get('address2').value : null,
          zipCode: this.UserForm.get('zipCode').value ? this.UserForm.get('zipCode').value : null,
          stateId: this.UserForm.get('stateId').value ? this.UserForm.get('stateId').value : null,
          isTestUser: this.UserForm.get('isTestUser').value,
          isLmsAdmin: false,
          target:this.UserForm.get('target').value,
          userTaxInformationView : {
            userId: null,
            isUserTaxInformation: this.UserForm.get('isUserTaxInformation').value,
            w9Year: this.UserForm.get('w9Year').value,
            w9Name: this.UserForm.get('w9Name').value,
            w9Address: this.UserForm.get('w9Address').value,
            w9City: this.UserForm.get('w9City').value,
            w9ZipCode: this.UserForm.get('w9ZipCode').value,
            stateId: this.UserForm.get('w9StateId').value
          }
        };
        this.service.SaveorUpdateusers(object).subscribe(data => {
          if (data.isSuccess) {
            this.saveUserDynamicField(data.id);
            this.notificationService.successTopRight('Data saved Successfully');
            this.modalReference.close();
            if (this.title === 'Admin User') {
              this.FetchUsersListForAdmin();
            } else {
              this.FetchUsersListforUsers();
            }
            
          } else if(data.isSuccess==false){
            this.notificationService.errorTopRight(data.message);
          }
        });
      }
      else if(this.data.id)
      {
        const object = {
          id: this.data.id,
          name: this.UserForm.get('firstName').value + (this.UserForm.get('lastName').value ? ' '+this.UserForm.get('lastName').value : ''),
          email: this.UserForm.get('email').value,
          phone: this.UserForm.get('phone').value? this.UserForm.get('phone').value : null,
          city: this.UserForm.get('city').value? this.UserForm.get('city').value : null,
          organization: this.UserForm.get('organization').value,
          manager: null,
          bpNumber: this.UserForm.get('bpNumber').value,
          tireLevel: null,
          roles: ['User'],
          rewordEarned: 0,
          rewordSpend: 0,
          rewordBalance: 0,
          status: this.UserForm.get('status').value,
          firstName: this.UserForm.get('firstName').value,
          lastName: this.UserForm.get('lastName').value,
          jobTitle: this.UserForm.get('jobTitle').value,
          location: this.UserForm.get('location').value,
          address1: this.UserForm.get('address1').value ? this.UserForm.get('address1').value : null,
          address2: this.UserForm.get('address2').value ? this.UserForm.get('address2').value : null,
          zipCode: this.UserForm.get('zipCode').value ? this.UserForm.get('zipCode').value : null,
          stateId: this.UserForm.get('stateId').value ? this.UserForm.get('stateId').value : null,
          isTestUser: this.UserForm.get('isTestUser').value,
          isLmsAdmin: false,
          target:this.UserForm.get('target').value,
          taxFileID: this.manageUserTaxInformationForm.get('file').value,
          taxFileVerificationStatus: this.manageUserTaxInformationForm.get('status').value,
          userTaxInformationView : {
            id: this.data.userTaxInformationId?this.data.userTaxInformationId: null,
            userId: this.data.id,
            isUserTaxInformation: this.UserForm.get('isUserTaxInformation').value,
            w9Year: this.UserForm.get('w9Year').value,
            w9Name: this.UserForm.get('w9Name').value,
            w9Address: this.UserForm.get('w9Address').value,
            w9City: this.UserForm.get('w9City').value,
            w9ZipCode: this.UserForm.get('w9ZipCode').value,
            stateId: this.UserForm.get('w9StateId').value
          }

        };
        this.service.UpdateUser(object).subscribe(data => {
          if (data.isSuccess) {
            this.saveUserDynamicField(data.id);
            this.notificationService.successTopRight('Data updated Successfully');
            this.modalReference.close();
            if (this.title === 'Admin User') {
              this.FetchUsersListForAdmin();
            } else {
              this.FetchUsersListforUsers();
            }
          } else if(data.isSuccess==false){
            this.notificationService.errorTopRight(data.message);
          }
        });
      }
    }
  }
  checkvalidation(): boolean {
    
    if (!checkValidText(this.UserForm.get('bpNumber').value)) {
      this.notificationService.errorTopRight('Please fill user id');
      return false;
    }
   else if (!checkValidEmail(this.UserForm.get('email').value)) {
    this.notificationService.errorTopRight('Please fill email');
    return false;
  } 
  else if (!checkValidText(this.UserForm.get('firstName').value)) {
    this.notificationService.errorTopRight('Please fill first name');
    return false;
  } 
  
  else if (!checkValidText(this.UserForm.get('lastName').value)) {
    this.notificationService.errorTopRight('Please fill last name');
    return false;
  } 
  // else if (!checkValidText(this.UserForm.get('address1').value)) {
  //   this.notificationService.errorTopRight('Please fill address 1');
  //   return false;
  // } 
  // else if (!checkValidText(this.UserForm.get('address2').value)) {
  //   this.notificationService.errorTopRight('Please fill address 2');
  //   return false;
  // } 

  else if (!checkValidText(this.UserForm.get('organization').value)) {
    this.notificationService.errorTopRight('Please fill organization');
    return false;
  }
  else if (!checkValidText(this.UserForm.get('roles').value+'')) {
    this.notificationService.errorTopRight('Please select role');
    return false;
  }
  // else if (!checkValidText(this.UserForm.get('phone').value)) {
  //   this.notificationService.errorTopRight('Please fill Phone number');
  //   return false;
  // }
  // else if (!checkValidText(this.UserForm.get('city').value)) {
  //   this.notificationService.errorTopRight('Please fill city');
  //   return false;
  // } 
  // else if (!this.UserForm.get('stateId').value || this.UserForm.get('stateId').value === '') {
  //   this.notificationService.errorTopRight('Please select State');
  //   return false;
  // }
  // else if (!checkValidText(this.UserForm.get('zipCode').value)) {
  //   this.notificationService.errorTopRight('Please fill Zip Code');
  //   return false;
  // } 
  else if (!checkValidText(this.UserForm.get('status').value + '')) {
    this.notificationService.errorTopRight('Please select account status');
    return false;
  }
   else {
     return true;
   } 
 }
 checkvalidationforNotification()
 {
  if (!checkValidText(this.dialogForm.get('subject').value)) {
    this.notificationService.errorTopRight('Please fill subject');
    return false;
  } 
  else if (!checkValidText(this.dialogForm.get('message').value)) {
    this.notificationService.errorTopRight('Please fill message');
    return false;
  } 
  else {
    return true;
  } 
 }
  getDynamicFields() {
    this.service.GetAllDynamicFields().subscribe(data => {
      this.masterDynamicFields = data.filter(field => !field.isDeleted);
      this.updateUserDynamicFieds();
    });
  }

  getDynamicFieldsUserHas(id) {
    this.service.GetDynamicFieldWithValueByObjectId(id).subscribe(data => {
      this.userDynamicFields = data;
      this.updateUserDynamicFieds();
    });
  }

  updateUserDynamicFieds() {
    
    if (this.masterDynamicFields && this.masterDynamicFields.length > 0 && this.userDynamicFields && this.userDynamicFields.length > 0) {
      this.userCustomFieldData = this._formGroup.array([]);
      const FieldArray = this.userCustomFieldData as FormArray;
      this.masterDynamicFields.forEach(obj => {
        const userAssociateFdIdx = this.userDynamicFields.findIndex(ufd => ufd.dynamicFieldId === obj.id);
        if (userAssociateFdIdx > -1) {
          if (obj.fieldType === 'Date') {
            obj.fieldValue = this.userDynamicFields[userAssociateFdIdx].fieldValue ? new Date(this.userDynamicFields[userAssociateFdIdx].fieldValue) : null;
          } else {
            obj.fieldValue = this.userDynamicFields[userAssociateFdIdx].fieldValue ? this.userDynamicFields[userAssociateFdIdx].fieldValue : ''
          }
          obj.usrAssocId = this.userDynamicFields[userAssociateFdIdx].id;
        } else {
          if (obj.fieldType === 'Date') {
            obj.fieldValue = null
          } else {
            obj.fieldValue = ''
          }
        }
        
        
        (FieldArray).push(this._formGroup.group(obj));

      })
    } else if (this.masterDynamicFields && this.masterDynamicFields.length > 0) {
      this.userCustomFieldData = this._formGroup.array([]);
      const FieldArray = this.userCustomFieldData as FormArray;
      this.masterDynamicFields.forEach(obj => {
        if (obj.fieldType === 'Date') {
          obj.fieldValue = null
        } else {
          obj.fieldValue = ''
        }
        
        (FieldArray).push(this._formGroup.group(obj));

      })
    } else {
      this.userCustomFieldData = this._formGroup.array([]);
    }
  }

  saveUserDynamicField(objectId) {
    const payload = [];
    const userCustomFields = this.userCustomFieldData.getRawValue();
    
    userCustomFields.forEach(fd => {
      let fieldValue = fd.fieldValue;
  
      if (fd.fieldType === 'Number') {
        fieldValue = fieldValue !== null && fieldValue !== '' ? fieldValue.toString() : '';
      }
      
      payload.push({
        id: fd.usrAssocId ? fd.usrAssocId : null,
        fieldValue: fieldValue, 
        objectId: objectId,
        dynamicFieldId: fd.id
      });
    });
  
    this.service.BulkSaveOrUpdateDynamicFieldWithValue(payload).subscribe(data => {
      console.log(data);
    });
  }

  handleCheckBoxClick(event: { item: { id: string, email: string }, checkedList: any[] }) {
    if (event.item) {
      const userId = event.item.id;
      const userEmail = event.item.email;
  
      if (event.checkedList.some(checkedItem => checkedItem.id === userId)) {
        if (!this.selectedUserIds.includes(userId)) {
          this.selectedUserIds.push(userId);
          this.selectedUserEmails.push(userEmail);
        }
      } else {
        this.selectedUserIds = this.selectedUserIds.filter(id => id !== userId);
        this.selectedUserEmails = this.selectedUserEmails.filter(email => email !== userEmail);
      }
    } else {
      this.selectedUserIds = event.checkedList.map(item => item.id);
      this.selectedUserEmails = event.checkedList.map(item => item.email);
    }
  
    // Update selectAllCheckbox based on the selected index and checked items
    const currentDataSource =
      this.selectedIndex === 0 ? this.dataSourceTab1 : this.dataSourceTab2;
  
    this.selectAllCheckbox =
      this.selectedUserIds.length === currentDataSource.length;
  }
  
  
  


getSateFromID(id) {
  if(id) {
    const stateName = this.stateList.filter((item) => item.id === id)
    return stateName[0].value
  }
  return null
}
  DownloadCsv(){
  
    const request={
      itemCount: this.totalRecords,
      pageIndex: 1,
      sortBy: "name",
      search: "",
      sortDirection: "desc",
      filter: []
    }
    if(this.selectedIndex == 0) {
      this.selectedUserIds.forEach(element => {
        this.userarray.push({
          id: element
        })
      });
      this.service.GetUserExportById(this.userarray).subscribe((data: any) => {
        const exportdata: any[] = this.getExportData(data);
        if (exportdata && exportdata.length > 0) {
          this.exportExcelService.exportAsExcelFile(exportdata,'User_Data');
          this.userarray=[];
        } 
      });
  
    }
   else 
    {
      this.selectedUserIds.forEach(element => {
        this.userarray.push({
          id: element
        })
      });
      this.service.GetUserExportById(this.userarray).subscribe((data: any) => {
        const exportdata: any[] = this.getExportData(data);
        if (exportdata && exportdata.length > 0) {
          this.exportExcelService.exportAsExcelFile(exportdata,'Admin_Data');
          this.userarray=[];
        } 
      });
       
    }
    }

    getExportData(result): any[] {
      const data: any[] = [];
      if (result && result.length > 0) {
        result.forEach(element => {
          const exportElement: any = {
            'User ID': element.bpNumber,
            'First Name': element.firstName,
            'Last Name': element.lastName,
            'Email': element.email,
            'Organization': element.organization,
            'Address1': element.address1,
            'Address2': element.address2,
            'City': element.city,
            'StateProvinceName': element.stateProvinceName,
            'StateProvinceCode': element.stateProvinceCode,
            'ZipCode': element.zipCode,
            'Phone': element.phone,
            'Status': element.status,
            'Title': element.title,
            'W9OnFile': element.w9OnFile,
            'W9Year': element.w9Year,
            'W9Name': element.w9Name,
            'W9Address': element.w9Address,
            'W9City': element.w9City,
            'W9State': element.w9State,
            'W9ZipCode': element.w9ZipCode,
            'Deleted': element.deleted,
            'Logs In >1x/mo on average': element.LogsIn1xmoonaverage,
            'TotalLoginCount': element.totalLoginCount,
            'CurrentYearLoginCount': element.currentYearLoginCount,
            // Format dates using DatePipe
            'DateAccountCreated': this.formatDate(element.dateAccountCreated),
            'EnrollmentDate': this.formatDate(element.enrollmentDate),
            'LastLoginDate': this.formatDate(element.lastLoginDate),
            'TotalCoursesCompleted': element.totalCoursesCompleted,
            'TotalCoursesAvailable': element.totalCoursesAvailable,
            'CurrentYearRequiredCoursesCompleted': element.currentYearRequiredCoursesCompleted,
            'CurrentYearRequiredCoursesAvailable': element.currentYearRequiredCoursesAvailable,
            'CurrentYearTotalListPriceSales': element.currentYearTotalListPriceSales,
            'CurrentYearEligibleKohlerSales': element.currentYearEligibleKohlerSales,
            'CurrentYearKohlerSales': element.currentYearKohlerSales,
            'CurrentPointBalance': element.currentPointBalance,
            'CurrentYearPointsEarned': element.currentYearPointsEarned,
            'CurrentYearPointsRedeemed': element.currentYearPointsRedeemed,
            'LifetimePointsEarned': element.lifetimePointsEarned,
            'LifetimePointsRedeemed': element.lifetimePointsRedeemed,
          };
  
          element.dynamicFieldWithValues.forEach(dynamicField => {
            exportElement[dynamicField.field] = this.formatDateString(dynamicField.fieldValue);
          });
  
          data.push(exportElement);
        });
      }
      return data;
    }
  

    formatDate(date: string | Date): string {
      return this.datePipe.transform(date, 'MM/dd/yyyy');
    }
  

formatDateString(dateString: string): string {
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  }
  return dateString; 
}
   

    openUserDynamicField(dynamicAttributes) {
    this.modalReferenceForDynamic = this._matDialog.open(dynamicAttributes, { panelClass: 'custom-container' });
    this.enableButton = false;
    this.loadDynamicFields(); 
  }

  toggleEditMode(index: number) {
    this.editMode[index] = !this.editMode[index];
    const formGroup = this.filtersFormArray.at(index) as FormGroup;
    if (this.editMode[index]) {
      formGroup.get('fieldType').enable();
      formGroup.get('Fieldlabel').enable();
    } else {
      formGroup.get('fieldType').disable();
      formGroup.get('Fieldlabel').disable();
    }
  }

  loadDynamicFields() {
    this.filtersFormArray.clear();
    this.service.GetAllDynamicFields().subscribe(data => {
      if (data && data.length > 0) {
        data.forEach((ele, index) => {
          const lessonForm = this._formGroup.group({
            dynamicFieldId: [ele.id || ''],
            fieldType: [{ value: ele.fieldType || '', disabled: true }],
            Fieldlabel: [{ value: ele.fieldName || '', disabled: true }],
            id: [ele.id || ''],
            isDeleted: ele.isDeleted
          });
          this.filtersFormArray.push(lessonForm);
          this.editMode[index] = false;
        });
      }
    });
  }
  
  
    deleteForDynamicfield() {
      this.service.DeleteDynamicField(this.deletelementfordynamicfeild, {}).subscribe(data => {
        if (data.isSuccess) {
          this.notificationService.successTopRight('Deleted Successfully');
          this.filtersFormArray.removeAt(this.filtersFormArray.controls.findIndex((ctrl) => ctrl.get('id').value === this.deletelementfordynamicfeild));
          this.editMode.splice(this.filtersFormArray.controls.findIndex((ctrl) => ctrl.get('id').value === this.deletelementfordynamicfeild), 1);
          this.modalReferences.close();
        } else {
          this.notificationService.errorTopRight("The field is already in use and can't be deleted");
        }
      });
    }
  

   
 get filtersFormArray() {
    return this.DynamicForm.get('allfieldsarray') as FormArray;
  }

  addNewFieldGroup() {
    const fieldGroup = this._formGroup.group({
      fieldType: [''],
      Fieldlabel: [''],
      isNew: [true] // flag to identify newly added fields
    });
    this.filtersFormArray.push(fieldGroup);
    this.editMode.push(true);
    this.deleteStatic = true;
  }
  
  changePageCount(event) {
    this.apiRequest.itemCount = event;
    this.currentPage === 1
    if (this.selectedIndex === 0) {
      this.FetchUsersListforUsers();
    } else if (this.selectedIndex === 1) {
      this.FetchUsersListForAdmin();
    }
  }
  
  RemoveDataFromArray(index: number) {
    this.filtersFormArray.removeAt(index);
    this.editMode.splice(index, 1);
    this.updateDeleteStaticState();
  }
  
  private updateDeleteStaticState() {
    this.deleteStatic = this.filtersFormArray.length > 0;
  }
  OpenDeletePopUpforDynamicField(index: number, deletepopupforDynamic) {
    const elementId = this.filtersFormArray.at(index).get('id').value;
    this.deletelementfordynamicfeild = elementId;
    this.modalReferences = this._matDialog.open(deletepopupforDynamic, {
      data: { elementId: this.deletelementfordynamicfeild }
    });
  
    this.modalReferences.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.filtersFormArray.removeAt(index);
        this.editMode.splice(index, 1);
        this.updateDeleteStaticState();
      }
    });
  }

  SaveCustomFields() {
    const validateForm = this.checkValidationForCustomFields();
    if (validateForm) {
    const fieldsArray = this.filtersFormArray.value
      .filter((field, index) => field.id === null || this.editMode[index])
      .map(field => ({
        id: field.id || null,
        moduleId: null,
        isDeleted: false,
        isMandatory: true,
        fieldType: field.fieldType,
        fieldName: field.Fieldlabel
      }));
    if (fieldsArray.length === 0) {
      this.notificationService.successTopRight("Saved changes successfully!");
      return;
    }
    this.service.SaveBulkCustomFields(fieldsArray).subscribe(el => {
      if (!el.isSuccess) {
        this.notificationService.errorTopRight("Failed to save the data.");
      } else {
        this.notificationService.successTopRight("Saved changes successfully!");
        this.modalReferenceForDynamic.close()
        this.loadDynamicFields();
        this.deleteStatic=false;
      }
    });
  }

  }
  checkValidationForCustomFields(): boolean {
    let isValid = true;
  
    this.filtersFormArray.controls.forEach((fieldGroup: FormGroup) => {
      const fieldType = fieldGroup.get('fieldType').value;
      const fieldLabel = fieldGroup.get('Fieldlabel').value;
  
      if (!checkValidText(fieldType)) {
        this.notificationService.errorTopRight('Please select field type');
        isValid = false;
      } else if (!checkValidText(fieldLabel)) {
        this.notificationService.errorTopRight('Please fill field label');
        isValid = false;
      }
    });
  
    return isValid;
  }
  
    toggleFieldVisibility(index: number, isDeleted: boolean): void {
      this.filtersFormArray.at(index).get('isDeleted')?.setValue(isDeleted);
      const elementId = this.filtersFormArray.at(index).get('id').value
      const request = {
        id: elementId,
        isDeleted: isDeleted
      };
      this.service.DynamicFieldShowHide(request).subscribe(data => {
        if (data.isSuccess) {
          this.notificationService.successTopRight("Field state updated successfully");
          this.enableButton = false;
          this.loadDynamicFields(); 
        } else {
          this.notificationService.errorTopRight("This field can't be hidden as it is already in use");
          this.enableButton = false;
          this.filtersFormArray.at(index).patchValue({ toggleControl: !isDeleted });
        }
      });
    }
    
    SendBulkUpdate() {
      const validateForm = this.checkvalidationforBulkNotification();
      if (validateForm) {
        this.sendMessage = true;
    
        const isAll = this.selectAllCheckbox;
    
        // Construct the request body
        const requestBody = isAll
          ? [{
              isBroadcast: true,
              userId: null, // Null when broadcasting to all
              creatorUserId: this.loginUser,
              title: this.dialogFormForBulkMessage.get('subject').value,
              message: this.dialogFormForBulkMessage.get('message').value,
              isAlert: false,
              ishighlithed: true
            }]
          : this.selectedUserIds.map(userId => ({
              isBroadcast: true,
              userId: userId, // Include user IDs when not broadcasting to all
              creatorUserId: this.loginUser,
              title: this.dialogFormForBulkMessage.get('subject').value,
              message: this.dialogFormForBulkMessage.get('message').value,
              isAlert: false,
              ishighlithed: true
            }));    
        this.service.BulkUpdate(requestBody, isAll).subscribe(
          data => {
            if (data.isSuccess) {
              this.notificationService.successTopRight('Notification sent successfully');
              this.sendMessage = false;
              this.closeBulkDialog();
            } else {
              this.notificationService.errorTopRight('Error');
            }
          },
          err => {
            this.sendMessage = false;
            this.notificationService.errorTopRight('Error');
            this.closeBulkDialog();
          }
        );
      }
    }    
    
    checkvalidationforBulkNotification()
    {
     if (!checkValidText(this.dialogFormForBulkMessage.get('subject').value)) {
       this.notificationService.errorTopRight('Please fill subject');
       return false;
     } 
     else if (!checkValidText(this.dialogFormForBulkMessage.get('message').value)) {
       this.notificationService.errorTopRight('Please fill message');
       return false;
     } 
     else {
       return true;
     } 
    }

    GetAllModulesIncheckBox() {
      this.service.GetAllModules().subscribe(data => {
      this.modules = data;
      this.initializeFormControls();
      });
      }
      
      initializeFormControls() {
      this.modules.forEach(module => {
      this.form.addControl(module.moduleName, new FormControl(false));
      });
      }

    getTrainingExportData(result: any[]): any[] {
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

    onTaxFileStatusChange() {
      const documentSelected = this.manageUserTaxInformationForm.get('file').value;
      const statusSelected = this.manageUserTaxInformationForm.get('status').value;

      if (!documentSelected) {
        this.notificationService.errorTopRight('Please select a document first');
        this.manageUserTaxInformationForm.get('status').setValue(null); 
        this.enableButton = false; 
      } else {
        this.enableButton = !!documentSelected && !!statusSelected;
      }
    }
    
    

    onTaxFileChange() {
      const documentSelected = this.manageUserTaxInformationForm.get('file').value;
      const statusSelected = this.manageUserTaxInformationForm.get('status').value;
      this.enableButton = !!documentSelected && !!statusSelected;
    }

   
  openAdminAdd(adminAddEdit) {
    this.enableButton = false;
    this.showUserPermissions = false;
    this.isEditForAdmin = false;
    this.data = null;
    this.AdminForm = this._formGroup.group({
      name: '',
      bpNumber: '',
      email: '',
      phone: '',
      roles: [''],
      status: '',
      firstName: '',
      lastName: '',
      isTestUser: false,
      isLmsAdmin: false,
    });

    this.AdminForm.controls['email'].enable();
    this.data = { id: undefined };
    this.openAdminDialog(adminAddEdit);
  }

  openAdminDialog(template: any) {
    this.ModalForAdmin = this._matDialog.open(template, { panelClass: 'custom-container' });
  }

  editAdminDialog(event, adminAddEdit) {
    this.showUserPermissions = true;
    this.data = event;
    this.isEditForAdmin = true;
    this.enableButton = false;

    const isUserEmailDisabled = window.sessionStorage.getItem('userEmailAsUserId') === 'true';

    this.AdminForm = this._formGroup.group({
        name: event.name,
       
        email: [{ value: event.email, disabled: isUserEmailDisabled }],
        bpNumber: [{ value: event.bpNumber, disabled: true }],
        roles: event.role,
        status: event.status1,
        firstName: event.firstName,
        lastName: event.lastName,
        isTestUser: event.isTestUser,
        isLmsAdmin: event.isLmsAdmin,
        userId: [{ value: event.userId ? event.userId : event.bpNumber, disabled: isUserEmailDisabled }],
    });

    this.openAdminDialog(adminAddEdit);
    this.selectedRole = event.role;
    this.rolePermissionForm = this._formGroup.group({});
    this.getUserbyDataForAdmin(event.id, event.role);
}
getUserbyDataForAdmin(id: string, role: string) {
  this.userDataDetail = {};
  
  this.service.getUserDataById(id).subscribe(data => {
      data['dateAccountCreated'] = new Date(data.dateAccountCreated);
      data['lastLoginDate'] = new Date(data.lastLoginDate);
      this.userDataDetail = data;
      this.UserEmail = data.email;

      const storedPermissions = JSON.parse(sessionStorage.getItem('ModuleSettingsPermissions'));
      
      if (data.userModulePerModelDatas === null) {
          this.service.GetRoleIdbyName(role).subscribe((response: any) => {
              const roleId = response[0]?.id;
              if (roleId) {
                  this.GetModulerPermissionByRoleId(roleId);
              }
          }, error => {
              this.notificationService.errorTopRight('Failed to fetch role ID');
          });
      } else {
          // Initialize form
          this.form = this._formGroup.group({});
          
          // Create form controls with permission comparison
          data.userModulePerModelDatas.forEach(module => {
              const hasStoredPermission = storedPermissions[module.moduleName];
              const isEnabled = hasStoredPermission ? hasStoredPermission.isEnabled : false;
              
              this.form.addControl(
                  module.moduleName, 
                  new FormControl({ 
                      value: isEnabled, 
                      disabled: !isEnabled 
                  })
              );
          });

          // Update modules array with combined permissions
          this.modules = data.userModulePerModelDatas.map(module => ({
              ...module,
              isEnabled: storedPermissions[module.moduleName]?.isEnabled || false
          }));

          this.setFormValues(data);
      }
  });
}
  // getUserbyDataForAdmin(id: string, role: string) {
  //   this.userDataDetail = {};
  //   this.service.getUserDataById(id).subscribe(data => {
  //     data['dateAccountCreated'] = new Date(data.dateAccountCreated);
  //     data['lastLoginDate'] = new Date(data.lastLoginDate);
  //     this.userDataDetail = data;
  //     this.UserEmail = data.email;

  //     if (data.userModulePerModelDatas === null) {
  //       const storedPermissions = JSON.parse(sessionStorage.getItem('ModuleSettingsPermissions'));
  //       console.log('storedPermissions', storedPermissions)
  //       console.log(data)
  //       data.userModulePerModelDatas.forEach(element => {
  //         Object.keys(storedPermissions).forEach(x => {
  //           if(x === element.moduleName) {
  //             if(storedPermissions[x]?.isEnabled) {
  //               console.log('check permissions',storedPermissions)
  //               element['checkboxEnabled'] = true;
                
  //             }
  //             else{
  //               element['checkboxEnabled'] = false;
  //               // this.isEnabledCheck=true;
  //             }
  //           }
  //         })
  //       });
  //       console.log('data.modules', data.modulesList)

  //         sessionStorage.setItem('ModulePermissions', JSON.stringify(storedPermissions));
  //       this.service.GetRoleIdbyName(role).subscribe((response: any) => {
  //         const roleId = response[0]?.id;
  //         if (roleId) {
  //           this.GetModulerPermissionByRoleId(roleId);
  //         }
  //       }, error => {
  //         // Handle error
  //         this.notificationService.errorTopRight('Failed to fetch role ID');
  //       });
  //     } else {
  //       this.setFormValues(data);
  //     }
  //   });
  // }

  openRolePermission(dialog) {
    this.manageAdminProfiles = this._matDialog.open(dialog, {
      width: '800px'
    });
    this.selectedRole = null;

    this.onRoleChange({ value: this.RoleList[0] });
  }

  onRoleChange(event) {
    this.selectedRole = event.value;
    this.sortModules(); // Ensure sorting is triggered when role changes
  
    this.rolePermissionForm = this._formGroup.group({});
    this.modules.forEach(module => {
      this.rolePermissionForm.addControl(module.moduleName, new FormControl(false));
    });
  
    this.GetModulerPermissionAccessByRoleId(event.value.id);
  }
  sortModules() {

    if (this.selectedRole.value !== 'Super Admin') {
      this.sortedModules = this.modules
        .filter(module => module.moduleName !== 'Order Redemption Manager' && module.moduleName !== 'Program Configuration')
        .sort((a, b) => a.moduleName.localeCompare(b.moduleName));
    } else {
      this.sortedModules = this.modules.sort((a, b) => a.moduleName.localeCompare(b.moduleName));
    }
  }

  setPermissionFormValues(data: any) {
    this.modules.forEach(module => {
      this.rolePermissionForm.get(module.moduleName).setValue(false);
    });
    if (data.length > 0 && data.userModulePerModelDatas !== null) {
      data.forEach(moduleData => {
        this.rolePermissionForm.get(moduleData.moduleName).setValue(moduleData.isEnabled);
      });
    }
  }

  onRoleChangeForAdminEdit(event) {
    this.showUserPermissions = true; // Show checkboxes when role is selected
    const selectedRole = event.value;
    this.service.GetRoleIdbyName(selectedRole).subscribe((response: any) => {
        const roleId = response[0]?.id;
        if (roleId) {
            this.GetModulerPermissionByRoleId(roleId);
        }
    }, error => {
        this.notificationService.errorTopRight('Failed to fetch role ID');
    });
}

  GetModulerPermissionAccessByRoleId(roleID) {
    this.service.GetModulerPermissionAccessByRoleId(roleID).subscribe((resp) => {
      this.setPermissionFormValues(resp.modules);
      this.sortModules();
    }, error => {
      // Handle error
      this.notificationService.errorTopRight('Failed to fetch module permissions');
    });
  }

  GetModulerPermissionByRoleId(roleID: string) {
    this.service.GetModulerPermissionAccessByRoleId(roleID).subscribe((resp: any) => {
        const storedPermissions = JSON.parse(sessionStorage.getItem('ModuleSettingsPermissions'));
        
        // Merge permissions with priority to API response
        this.modules = resp.modules.map(module => {
            const storedPermission = storedPermissions[module.moduleName];
            return {
                ...module,
                // Enable checkbox if both API and stored permissions are true
                isEnabled: storedPermission?.isEnabled && module.isEnabled
            };
        });

        this.setRolePermissionFormControls();
        this.cd.detectChanges();
    });
}


    
  mergePermissions() {
    this.modules.forEach(module => {
      const roleModule = this.modulePermissions.find(
        roleModule => roleModule.moduleId === module.id
      );
      if (roleModule) {
        this.form.get(module.moduleName).setValue(roleModule.isEnabled);
      } else {
        this.form.get(module.moduleName).setValue(false);
      }
    });
  }

  setFormValues(data: any) {
    this.modules.forEach(module => {
      this.form.get(module.moduleName).setValue(false); // Initialize with false
    });
    if (data.userModulePerModelDatas !== null) {
      data.userModulePerModelDatas.forEach(moduleData => {
        if (moduleData.isEnabled) {
          this.form.get(moduleData.moduleName).setValue(moduleData.isEnabled);
        }
      });
    }
  }

  setRolePermissionFormControls() {
    this.form = this._formGroup.group({});
    
    this.modules.forEach(module => {
        const storedPermissions = JSON.parse(sessionStorage.getItem('ModuleSettingsPermissions'));
        const storedPermission = storedPermissions[module.moduleName];
        
        this.form.addControl(module.moduleName, new FormControl({
            value: module.isEnabled,
            // Enable checkbox only if stored permission exists and is true
            disabled: !(storedPermission?.isEnabled)
        }));
    });
}
    


  setFormValuesFromRole(roleModules: any) {
    roleModules.forEach(roleModule => {
      const userModule = this.userDataDetail.userModulePerModelDatas?.find(
        userModule => userModule.moduleId === roleModule.moduleId
      );
      if (userModule) {
        this.form.get(roleModule.moduleName).setValue(userModule.isEnabled || roleModule.isEnabled);
      } else {
        this.form.get(roleModule.moduleName).setValue(roleModule.isEnabled);
      }
    });
  }
  GetUserModulePermissionByUserId() {
    let payload = {
        userId: window.sessionStorage.getItem('userId')
    };
    const newFilteredModuleArray = [];
    this.service.getPermissionsByUserId(payload).subscribe(data => {
    
    });
}


SaveOrUpdateAdmin() {
  const validateForm = this.checkvalidationforAdmin();
  if (validateForm) {
      const userModulePerModels = this.modules.map(module => ({
          moduleId: module.id || module.moduleId,
          roleId: null,
          isEnabled: this.form.get(module.moduleName)?.value || false
      }));

      const object = {
          id: this.data?.id || null,
          name: this.AdminForm.get('firstName').value + (this.AdminForm.get('lastName').value ? ' ' + this.AdminForm.get('lastName').value : ''),
          email: this.AdminForm.get('email').value,
          phone: '9999999',
          city: 'String',
          organization: 'String',
          manager: null,
          bpNumber: this.AdminForm.get('bpNumber').value,
          tireLevel: null,
          roles: [this.AdminForm.get('roles').value],
          rewordEarned: 0,
          rewordSpend: 0,
          rewordBalance: 0,
          status: this.AdminForm.get('status').value,
          firstName: this.AdminForm.get('firstName').value,
          lastName: this.AdminForm.get('lastName').value,
          isTestUser: this.AdminForm.get('isTestUser').value,
          isLmsAdmin: this.AdminForm.get('isLmsAdmin').value,
          jobTitle: 'String',
          location: 'String',
          address1: 'String',
          address2: 'String',
          zipCode: 'String',
          stateId: null,
          target: 'String',
          userTaxInformationView: {
              userId: this.data?.id || null,
              isUserTaxInformation: false,
              w9Year: 'String',
              w9Name: 'String',
              w9Address: 'String',
              w9City: 'String',
              w9ZipCode: 'String',
              stateId: null,
          },
          userModulePerModels: userModulePerModels
      };

      if (this.data?.id === undefined) {
        this.service.SaveorUpdateusers(object).subscribe({
          next: (response) => {
              if (response.isSuccess) {
                  const newPermissions = this.modules
                      .filter(module => this.form.get(module.moduleName)?.value === true)
                      .map(module => ({
                          moduleId: module.id || module.moduleId,
                          roleId: null,
                          userId: response.id,
                          isEnabled: true
                      }));
      
                  this.service.UpdateSoftPermissionsforUser(newPermissions).subscribe({
                      next: () => {
                          this.notificationService.successTopRight('Data saved and permissions updated successfully');
                          this.ModalForAdmin.close();
                          this.FetchUsersListForAdmin();
                      },
                      error: () => {
                          this.notificationService.errorTopRight('Data saved, but permissions update failed');
                          this.ModalForAdmin.close();
                          this.FetchUsersListForAdmin();
                      }
                  });
              } else {
                  this.notificationService.errorTopRight(response.message);
              }
          },
          error: () => {
              this.notificationService.errorTopRight('Failed to save data');
          }
      });
      } else {
          const newPermissions = this.modules
              .filter(module => this.form.get(module.moduleName)?.value === true)
              .map(module => ({
                  moduleId: module.id || module.moduleId,
                  roleId: null,
                  userId: this.data.id,
                  isEnabled: true
              }));

          this.service.UpdateUser(object).subscribe({
              next: data => {
                  if (data.isSuccess) {
                      this.service.UpdateSoftPermissionsforUser(newPermissions).subscribe({
                          next: () => {
                              this.notificationService.successTopRight('Data updated and permissions updated successfully');
                          },
                          error: () => {
                              this.notificationService.errorTopRight('Data updated, but permissions update failed');
                          }
                      });
                      this.ModalForAdmin.close();
                      this.FetchUsersListForAdmin();
                  } else {
                      this.notificationService.errorTopRight(data.message);
                  }
              },
              error: () => {
                  this.notificationService.errorTopRight('Failed to update data');
              }
          });
      }
  }
}
  


  checkvalidationforAdmin(): boolean {
    if (!checkValidText(this.AdminForm.get('bpNumber').value)) {
      this.notificationService.errorTopRight('Please fill user id');
      return false;
    } else if (!checkValidEmail(this.AdminForm.get('email').value)) {
      this.notificationService.errorTopRight('Please fill email');
      return false;
    } else if (!checkValidText(this.AdminForm.get('firstName').value)) {
      this.notificationService.errorTopRight('Please fill first name');
      return false;
    } else if (!checkValidText(this.AdminForm.get('lastName').value)) {
      this.notificationService.errorTopRight('Please fill last name');
      return false;
    } else if (!checkValidText(this.AdminForm.get('status').value + '')) {
      this.notificationService.errorTopRight('Please select account status');
      return false;
    } else if (!checkValidText(this.AdminForm.get('roles').value + '')) {
      this.notificationService.errorTopRight('Please select role');
      return false;
    } else {
      return true;
    }
  }

  BulkCreateOrUpdateModulerPermissionAccess() {
    const selectedModules = this.modules.map(module => ({

      moduleId: module.id ?? module.moduleId,
      roleId: this.selectedRole?.id,
      permissionId: null,
      isEnabled: this.rolePermissionForm.get(module.moduleName)?.value ?? false
      
    }));
    this.service.BulkCreateOrUpdateModulerPermissionAccess(selectedModules).subscribe((resp) => {
      if (resp.isSuccess) {
        this.notificationService.successTopRight('Permissions Saved Successfully');
        this.manageAdminProfiles.close();
        this.confirmationDialog.close();
       // window.location.reload();
      } else {
        this.notificationService.errorTopRight('Something went wrong.');
      }
    }, error => {
      // Handle error
      this.notificationService.errorTopRight('Failed to save permissions');
    });
  }

  openConfirmationDialog(confirmDialogTemplate) {
    this.confirmationDialog = this._matDialog.open(confirmDialogTemplate, {
      width: '600px',
      disableClose: true
    });
  }
  downloadOldPermissions() {
    this.service.DownloadReportforOldRoles(this.selectedRole.id, {}).subscribe((data: any) => {
      const formattedData = data.map((item: any) => ({
        'Module Name': item.moduleName
      }));
  
      const excelData = [
        { 'Module Name': `Role: ${this.selectedRole.value}` },
        {},
        { 'Module Name': 'Module Name' },
        ...formattedData
      ];
  
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData, { skipHeader: true });
      const workbook: XLSX.WorkBook = { Sheets: { 'Permissions': worksheet }, SheetNames: ['Permissions'] };
      XLSX.writeFile(workbook, 'OldPermissionsReport.xlsx');
    });
  }
  
  
  
  // proceedBulkUpdate() {
  //   const selectedModules = this.modules.map(module => ({
  //     moduleId: module.id,
  //     roleId: this.selectedRole.id,
  //     permissionId: null,
  //     isEnabled: this.rolePermissionForm.get(module.moduleName).value
  //   }));
  
  //   this.service.BulkCreateOrUpdateModulerPermissionAccess(selectedModules).subscribe(
  //     (resp) => {
  //       if (resp.isSuccess) {
  //         this.notificationService.successTopRight('Permissions Saved Successfully');
  //         this.manageAdminProfiles.close();
  //         this.confirmationDialog.close();
  //       } else {
  //         this.notificationService.errorTopRight('Something went wrong.');
  //       }
  //     },
  //     (error) => {
  //       this.notificationService.errorTopRight('Failed to save permissions');
  //     }
  //   );
  // }
  openPopUpforVerifyDoc(elementId, detail) {
    this.dataforVeifyDoc = elementId;
    this.modelRefForTaxConfirm = this._matDialog.open(detail, {});
   }

  VerifyDocumentwithoutFile(){
    this.service.VerifyDocumentwithoutFile(this.dataforVeifyDoc).subscribe(data=>{
      if(data.isSuccess)
      {
        this.notificationService.successTopRight('Documents Verified successfully');
        this.modelRefForTaxConfirm.close();
      }
    })
  }

  getGridSettings(): DataGridColumnHeader[] {
    return [

      {
        columnName: 'successCount',
        columnTitleKey: 'Success Files',
        columnValue: 'successCount',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      },
      {
        columnName: 'actiions',
        columnTitleKey: 'View Success Logs',
        columnValue: 'actiions',
        type: this.columnType.BUTTON,
        button: {
          buttonAction: 'for_view_success',
          icon: 'visibility',
          isIconSvg: true,
          tooltipKey: 'View',
          buttonClass: 'btn-color-600 view-icon',
        },
        show: true,
        sort: false,
      },
      {
        columnName: 'errorCount',
        columnTitleKey: 'Error Files',
        columnValue: 'errorCount',
        type: this.columnType.TEXT,
        button: {
          buttonAction: 'for_edit',
          icon: 'edit',
          isIconSvg: true,
          tooltipKey: 'edit',
          buttonClass: 'btn-color-600',
        },
        show: true,
        sort: true,
      },
      {
        columnName: 'Actions',
        columnTitleKey: 'View Error Logs',
        columnValue: 'Actions',
        type: this.columnType.BUTTON,
        button: {
          buttonAction: 'for_view_error',
          icon: 'visibility',
          isIconSvg: true,
          tooltipKey: 'View',
          buttonClass: 'btn-color-600 view-icon',
        },
        show: true,
        sort: false,
      },
      {
        columnName: 'download',
        columnTitleKey: 'Download Log File',
        columnValue: 'download',
        type: this.columnType.BUTTON,
        button: {
          buttonAction: 'for_download',
          icon: 'download',
          isIconSvg: true,
          tooltipKey: 'download',
          buttonClass: 'btn-color-600',
        },
        show: true,
        sort: false,
      },
    ]
  }
  getGridSettingsforSuccess(): DataGridColumnHeader[] {
    return [
      {
        columnName: 'fileName',
        columnTitleKey: 'File Name',
        columnValue: 'fileName',
        type: this.columnType.TEXT_W_ELLIP_L,
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
      },

    ];
  }
  getGridSettingsforFailed(): DataGridColumnHeader[] {
    return [
      {
        columnName: 'fileName',
        columnTitleKey: 'File Name',
        columnValue: 'fileName',
        type: this.columnType.TEXT_W_ELLIP_L,
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
      },
      {
        columnName: 'errorName',
        columnTitleKey: 'Error Reason',
        columnValue: 'errorName',
        type: this.columnType.TEXT_W_ELLIP,
        show: true,
        sort: true,
      },
    ];
  }

  openDialogforBulkUploadTaxinfo(userTaxInformation) {
    this.loadingPercent = 0;
    this.actualLoadingPercent = 0;
    this.modelRefForBulkUploadTax = this._matDialog.open(userTaxInformation, {
      width: '900px', 
      height: 'auto',  
      disableClose: false
    });
    this.GetProgressTaxDocument1099();
    this.taxDocumentForm = this._formGroup.group({
      'file': new FormControl(),
    });
  }

  GetProgressTaxDocument1099() {
    this.loadingPercent = 0;
    this.dataSource = [];
    this.dataSourceForView = [];
    this.loading = true;

    this.service.GetProgressTaxDocument1099(this.apiRequest1099).subscribe(data => {
      this.actualLoadingPercent = data.results.find(result => result.percentageCompletion !== undefined)?.percentageCompletion || 0;
      this.dataSource = data.results;
     

      this.calculateTotalPages1099();
      this.loading = false;

      if (this.actualLoadingPercent <= 100) {
        this.startLoading();
      }

      this.progressInLoading();
    });
  }
  

  startLoading() {
    this.isStart = true;
    if (this.actualLoadingPercent === 100) {
      this.loadingPercent = 100;
      this.progressInLoading();
    } else {
      this.intervalId = setInterval(() => {
        if (this.loadingPercent < this.actualLoadingPercent) {
          this.loadingPercent += 1;
        } else {
          clearInterval(this.intervalId);
        }
      }, 20);
    }
  }

  progressInLoading() {
    if (this.loadingPercent === this.actualLoadingPercent) {
      clearInterval(this.intervalId);
      this.res = of("Item Loaded");
    }
  }

  calculateTotalPages1099() {
    this.totalPages1099 = Math.ceil(this.totalRecords1099 / this.apiRequest1099.itemCount);
    this.pages1099 = Array.from({ length: this.totalPages1099 }, (_, i) => i + 1);
  }


  onPageChange1099(pageIndex1099: number) {
    if (pageIndex1099 < 1 || pageIndex1099 > this.totalPages1099) return;
    this.apiRequest1099.pageIndex = pageIndex1099;
    this.pageIndex1099 = pageIndex1099;
    this.GetProgressTaxDocument1099();
  }
  changePageCount1099(event) {
    this.apiRequest1099.itemCount = event;
    this.apiRequest1099.pageIndex = 1; 
    this.pageIndex1099 = 1;
    this.GetProgressTaxDocument1099();
  }

  handleSortChange1099(event) {
    this.sortBy = event.active;
    this.sortDirection = event.direction;

    this.apiRequest1099.sortBy = this.sortBy;
    this.apiRequest1099.sortDirection = this.sortDirection.toLowerCase();
    this.GetProgressTaxDocument1099();
  }
  handleButtonClickForView(event, transactionDetails) {
    const rowData = event.item;
    this.ItemId = rowData.importHistoryId;

   
 
    if (event.buttonAction === 'for_view_success') {
      this.transactionModal = this._matDialog.open(transactionDetails, { width: '800px' });
      this.apiRequestForView.objectName = "Success";
      this.gridColumnsView = this.getGridSettingsforSuccess();
    } else if (event.buttonAction === 'for_view_error') {
      this.transactionModal = this._matDialog.open(transactionDetails, { width: '800px' });
      this.apiRequestForView.objectName = "Error";
      this.gridColumnsView = this.getGridSettingsforFailed();
    }
    else if (event.buttonAction ==='for_download')
    {
      this.DownloadCsvLogFor1099()
    }
  
    this.GetProgressTaxDocument1099View();
  }
  GetProgressTaxDocument1099View() {
    this.dataSourceForView = [];
    this.dataloading = true;
  
    this.service.TaxInfoFiles(this.ItemId, this.apiRequestForView).subscribe(data => {
      this.dataSourceForView = data.results.filter((log) => log.status === this.apiRequestForView.objectName);
  
      this.fileNames = this.dataSourceForView.map(log => log.fileName);
      this.fileNamesError = this.dataSourceForView.map(log => log.errorName);
  
      this.totalRecordsforView = data.totalRecords;
  
      this.calculateTotalPagesForView();
  
      this.dataloading = false;
    }, error => {
      this.dataloading = false;
    });
  }
  
  calculateTotalPagesForView() {
    this.totalPagesforView = Math.ceil(this.totalRecordsforView / this.apiRequestForView.itemCount);
    this.pagesforView = Array.from({ length: this.totalPagesforView }, (_, i) => i + 1);
  }
  changePageCountforView(event: number) {
    this.apiRequestForView.itemCount = event; 
    this.apiRequestForView.pageIndex = 1; 
    this.currentPageforView = 1;
    this.GetProgressTaxDocument1099View(); 
  }

  onPageChangeforView(pageIndex: number) {
    if (pageIndex < 1 || pageIndex > this.totalPagesforView) return;
    this.apiRequestForView.pageIndex = pageIndex;
    this.currentPageforView = pageIndex;
    this.GetProgressTaxDocument1099View();
  }
 
  handleSortChangeforView(event) {
    this.sortBy = event.active;
    this.sortDirection = event.direction;

    this.apiRequestForView.sortBy = this.sortBy;
    this.apiRequestForView.sortDirection = this.sortDirection.toLowerCase();

    this.GetProgressTaxDocument1099View();
  }
SaveTaxDocuments() {
    
    this.service.BulkUploadTaxInfo({}).subscribe(data=>{
      if(data.isSuccess)
      {
        this.notificationService.successTopRight(data.message);
        this.GetProgressTaxDocument1099();
      }else{
        this.notificationService.errorTopRight(data.message);
      }
    })
  }
  onTaxDocumentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedTaxDocument = file;
    }
  }
  SaveTaxDocuments1() {
    if (!this.selectedTaxDocument) {
      this.notificationService.errorTopRight('Please select a file before uploading.');
      return;
    }
    const formData = new FormData();
    formData.append('file', this.selectedTaxDocument);
    // this.service.BulkUploadTaxInfo(formData).subscribe((resp) => {
    //   if (resp.isSuccess) {
    //     this.notificationService.successTopRight('Tax Information Uploaded Successfully.');
    //     this.modelRefForBulkUploadTax.close();
    //   } else {
    //     this.notificationService.errorTopRight('Failed to upload tax information.');
    //   }
    // });
  }

  SaveBulkUploadTaxInfo(){
    this.service.BulkUploadTaxInfo(this.dataforBulkUploadTax).subscribe(data=>{
      if(data.isSuccess)
      {
        this.notificationService.successTopRight('Tax Document added successfully');
        this.modelRefForTaxConfirm.close();
      }
    })
  }
  removeFile(): void {
    this.selectedTaxDocument = null;
  }
  DownloadWordDoc() {
    const fileUrl = 'assets/Steps for Bulk Upload 1099 forms.docx'; 
    const a = document.createElement('a'); 
    a.href = fileUrl; 
    a.download = 'Steps_for_Bulk_Upload_1099_Forms.docx';
    a.click();
  }

  DownloadCsvLogFor1099() {
    const requestforSuccess = {
      itemCount: 10000,
      pageIndex: 1,
      sortBy: "createdDate",
      search: "",
      sortDirection: "desc",
      objectName: "Success",
      filter: []
    };
    const requestforError = {
      itemCount: 10000,
      pageIndex: 1,
      sortBy: "createdDate",
      search: "",
      sortDirection: "desc",
      objectName: "Error",
      filter: []
    };

    // Fetch Success Data
    this.service.TaxInfoFiles(this.ItemId, requestforSuccess).subscribe((successData: any) => {
      const successExportData = this.getExportDatafor1099(successData.results, 'Success');

      // Fetch Error Data
      this.service.TaxInfoFiles(this.ItemId, requestforError).subscribe((errorData: any) => {
        const errorExportData = this.getExportDatafor1099(errorData.results, 'Error');

        const wb = XLSX.utils.book_new();
        const wsSuccess = XLSX.utils.json_to_sheet(successExportData);
        const wsError = XLSX.utils.json_to_sheet(errorExportData);

        XLSX.utils.book_append_sheet(wb, wsSuccess, 'Success');
        XLSX.utils.book_append_sheet(wb, wsError, 'Error');

        XLSX.writeFile(wb, 'Log_Data.xlsx');
      });
    });
  }

  getExportDatafor1099(result, status): any[] {
    const data: any[] = [];
    if (result && result.length > 0) {
      result.forEach(element => {
        const exportElement: any = {
          'File Name': element.fileName,
          'Status': element.status,
          'File Path':element.filePath
        };
        if (status === 'Success') {
          exportElement['User ID'] = element.bpNumber;
        }
        if (status === 'Error') {
          exportElement['Error Reason'] = element.errorName;
        }
       
        data.push(exportElement);
      });
    }
    return data;
  }


  
  
}
