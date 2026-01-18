import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { COLUMN_TYPE, DataGridColumnHeader } from 'app/shared/component/data-grid/data-grid.service';
import { NotificationService } from 'app/shared/notification/notification';
import { IncentiveAdminPanelService } from '../incentive-admin-panel.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-export-queue',
  templateUrl: './export-queue.component.html',
  styleUrls: ['./export-queue.component.scss']
})
export class ExportQueueComponent {
  userID = null;
  dataSource = [];
  loading = false;
  pages: number[] = [];
  currentPage = 1;
  totalPages: number;
  gridColumnsTab1: DataGridColumnHeader[];
  columnType = COLUMN_TYPE;
  event: { pageIndex: number; pageSize: number; };
  sortBy = '';
  modalReference: any;
  private file: File | null = null;
  sortDirection = '';
  totalRecords = 0;
  apiRequest = {
    pageIndex: 1,
    sortBy: "createDate",
    itemCount: 25,
    sortDirection: "desc",
    search: "",
    filter: []
  };
  displayedColumns: string[] = ['report', 'quickPull'];
  dataSourceReport = [
    {
      report: 'Report Data',
      quickPull: 'Quick Pull Data'
    }
  ];
  
  showDropBox = true;
  uploadResult: any = null;
  fileName: string | null = null;
  objectType = null;
  isPointsCreditEnabled = false;
  isOrderRedemptionEnabled = false;
  isUserExportEnabled = false;
  isPushReportEnabled = false;
  isLoginReportEnabled = false;
  FileId: any;
  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private service:IncentiveAdminPanelService,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute,
   private notification: NotificationService,
  ) {}

  ngOnInit(){
    this.route.queryParams.subscribe(params => {
      this.objectType = params.filter;
    });
    
    if(this.objectType) {
      const filterObject = this.apiRequest.filter.filter(item => item.oid === 'object')
      if(filterObject.length > 0) {
        this.apiRequest.filter.forEach((item) => {
          if(item.oid === 'object') {
            item.value = this.objectType
          }
        })
      } else {
        this.apiRequest.filter.push({
          'oid': 'object',
          'value': this.objectType
        })
      }
    }
    this.gridColumnsTab1 = this.getGridSettingsTab1();
    this.sortBy = this.apiRequest.sortBy;
    this.fetchList();
    this.getModulePermissions();
  
  }

  getObjectTypeForRedeem()
  {
      const filterObject = this.apiRequest.filter.filter(item => item.oid === 'object')
      if(filterObject.length > 0) {
        this.apiRequest.filter.forEach((item) => {
          if(item.oid === 'object') {
            item.value = "order_redemption_report"
          }
        })
      } else {
        this.apiRequest.filter.push({
          'oid': 'object',
          'value': "order_redemption_report"
        })
      }
  }
  getObjectTypeForPointsCredit()
  {
      const filterObject = this.apiRequest.filter.filter(item => item.oid === 'object')
      if(filterObject.length > 0) {
        this.apiRequest.filter.forEach((item) => {
          if(item.oid === 'object') {
            item.value = "points_credit_sales_report"
          }
        })
      } else {
        this.apiRequest.filter.push({
          'oid': 'object',
          'value': "points_credit_sales_report"
        })
      }
  }
  getObjectTypeForLoginReport()
  {
      const filterObject = this.apiRequest.filter.filter(item => item.oid === 'object')
      if(filterObject.length > 0) {
        this.apiRequest.filter.forEach((item) => {
          if(item.oid === 'object') {
            item.value = "login_report"
          }
        })
      } else {
        this.apiRequest.filter.push({
          'oid': 'object',
          'value': "login_report"
        })
      }
  }

  getModulePermissions() {
    const roleId = window.sessionStorage.getItem('userId');
    const roleIds = window.sessionStorage.getItem('roleId');
    this.service.getUserDataById(roleId).subscribe(
      (resp) => {
        let modules;
        if (resp.userModulePerModelDatas === null) {
          this.service.GetModulerPermissionAccessByRoleId(roleIds).subscribe(
            (permissionResp) => {
              console.log('permissionResp',permissionResp)
              modules = permissionResp.modules || permissionResp.data || permissionResp;
              this.setModulePermissions(modules);
            },
            (error) => {
              //this.notificationService.errorTopRight('Failed to fetch module permissions by role ID');
            }
          );
        } else {
          modules = resp.userModulePerModelDatas;
          this.setModulePermissions(modules);
        }
      },
      (error) => {
       // this.notificationService.errorTopRight('Failed to fetch user data');
      }
    );
  }

  setModulePermissions(modules: any[]) {
    if (Array.isArray(modules)) {
      const pointsCreditReportModule = modules.find(module => module.moduleName === 'Points Credit Report (Sales)');
      const orderRedemptionModule = modules.find(module => module.moduleName === 'Order Redemption Report');
      const userExportReportModule = modules.find(module => module.moduleName === 'User Export Report');
      const pushReportModule = modules.find(module => module.moduleName === 'Push Report');
      const loginReport = modules.find(module => module.moduleName === 'Login Report');
  
      this.isPointsCreditEnabled = pointsCreditReportModule ? pointsCreditReportModule.isEnabled : false;
      this.isOrderRedemptionEnabled = orderRedemptionModule ? orderRedemptionModule.isEnabled : false;
      this.isUserExportEnabled = userExportReportModule ? userExportReportModule.isEnabled : false;
      this.isPushReportEnabled = pushReportModule ? pushReportModule.isEnabled : false;
      this.isLoginReportEnabled = loginReport ? loginReport.isEnabled : false;
    } else {
      this.notificationService.errorTopRight('Invalid response structure for module permissions');
    }
  }
  
  

  getGridSettingsTab1(): DataGridColumnHeader[] {
    return [
      { columnName: 'requestedBy', columnTitleKey: 'Requested By', columnValue: 'requestedBy', type: this.columnType.TEXT, show: true, sort: true },
      { columnName: 'RequestAt', columnTitleKey: 'Requested At', columnValue: 'requestAt', type: this.columnType.TEXT, show: true, sort: true },
      { columnName: 'processingCompletedAt', columnTitleKey: 'Processing Completed At', columnValue: 'processingCompletedAt', type: this.columnType.DATE, show: true, sort: true },
      { columnName: 'status', columnTitleKey: 'Status', columnValue: 'status', type: this.columnType.Status, headerClass: 'width-150px', show: true, sort: true  },
      { columnName: 'object', columnTitleKey: 'Object', columnValue: 'object', type: this.columnType.Status, show: true, sort: true },
      { columnName: 'requestedFilter', columnTitleKey: 'Requested Filter', columnValue: 'requestedFilter', type: this.columnType.TEXT, show: true, sort: true },
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
  fetchList() {
    this.dataSource = [];
    this.loading = true;
    this.service.ExportRequestList(this.apiRequest).subscribe(data => {
      if (data) {
        if (data.results) {
          this.dataSource = data.results;
          this.dataSource.forEach(element => {
            if (element?.processingCompletedAt) {
              element.processingCompletedAt = moment.utc(element.processingCompletedAt)
                .tz('America/New_York')
                .format('MM-DD-YYYY');
            }
            if (element?.requestAt) {
              element.requestAt = moment.utc(element.requestAt)
                .tz('America/New_York')
                .format('MM-DD-YYYY');
            }
            if (element?.requestedFilter) {
              element.requestedFilter = JSON.parse(element.requestedFilter);
              let newRequestedFilters = null;
              element.requestedFilter.forEach((items) => {
                const firstObject = items;
                if (moment(firstObject.value, moment.ISO_8601, true).isValid()) {
                  firstObject.value = moment.utc(firstObject.value).format('MM-DD-YYYY');
                }
                const values = Object.values(firstObject);
                if (newRequestedFilters === null) {
                  newRequestedFilters = values.join(', ');
                } else {
                  newRequestedFilters = newRequestedFilters + ', ' + values.join(', ');
                }
              });
              element.requestedFilter = newRequestedFilters;
            }
            if (element.status === "Inprogress") {
              element.status = "In Progress";
            }
            return element;
          });
        }
        this.totalRecords = data.totalRecords;
        this.calculateTotalPages();
      }
      this.loading = false;
    });
  }
  

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalRecords / this.apiRequest.itemCount);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  navigateTo(page) {
    this.router.navigate([`./${page}`])
  }
  navigateToPushReport(route: string, queryParams: any) {
    this.router.navigate([route], { queryParams });
    }

    QtdPullForPointsCreditManager() {
      const filterArray = [];
      const customeColumn = [];
      const currentYear = new Date().getFullYear();
      const startDate = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0));
      filterArray.push({
        oid: "dateProcessedStar",
        value: startDate.toISOString(),
      });
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999); 
      filterArray.push({
        oid: "dateProcessedEnd",
        value: endDate.toISOString(),
      });
    
      const requestObj = {
        requesteduserId: sessionStorage.getItem('userId'),
        filter: filterArray,
        object: 'points_credit_sales_report',
        customeColumn
      };
    
      this.service.exportPointCreditReport(requestObj).subscribe((resp) => {
        if (resp.isSuccess) {
          this.notificationService.successTopRight('Request Submitted Successfully');
          this.router.navigate(['report-queue'], { queryParams: { filter: 'points_credit_sales_report' } });
          this.getObjectTypeForPointsCredit();
          this.fetchList();
        } else {
          this.notificationService.errorTopRight(resp.message);
        }
      });
    }
    

    QtdPullForPointsOrderRedeem() {
      const filterArray = [];
      const customeColumn = [];
      const currentYear = new Date().getFullYear();
    
      // Start date: January 1st of the current year at 00:00:00 UTC
      const startDate = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0));
      filterArray.push({
        oid: "startDate",
        value: startDate.toISOString(),
      });
    
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    
      const localEndDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 19) + 'Z';
    
      filterArray.push({
        oid: "endDate",
        value: localEndDate,
      });
    
      const requestObj = {
        requesteduserId: sessionStorage.getItem('userId'),
        filter: filterArray,
        object: 'order_redemption_report',
        customeColumn
      };
    
      this.service.exportOrderRedemption(requestObj).subscribe(data => {
        if (data.isSuccess) {
          this.notificationService.successTopRight('Request Submitted Successfully');
          this.router.navigate(['report-queue'], {queryParams: {filter: 'order_redemption_report'}});
          this.getObjectTypeForRedeem();
          this.fetchList();
        } else {
          this.notificationService.errorTopRight(data.message);
        }
      });
    }
  

    QtdPullForLoginReport() {
      const filterArray = [];
      const customeColumn = [];
      const currentYear = new Date().getFullYear();
      const startDate = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0));
      filterArray.push({
        oid: "loginStartDate",
        value: startDate.toISOString(),
      });

      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
  
      const localEndDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 19) + 'Z';
    
      filterArray.push({
        oid: "loginEndDate",
        value: localEndDate,
      });
    
      const requestObj = {
        requesteduserId: sessionStorage.getItem('userId'),
        filter: filterArray,
        object: 'login_report',
        customeColumn
      };
    
      this.service.exportLoginReport(requestObj).subscribe(data => {
        if (data.isSuccess) {
          this.notificationService.successTopRight('Request Submitted Successfully');
          this.router.navigate(['report-queue'], {queryParams: {filter: 'login_report'}})
          this.getObjectTypeForLoginReport()
          this.fetchList();
        } else {
          this.notificationService.errorTopRight(data.message);
        }
      });
    }
    
  
  onPageChange(pageIndex: number) {
    if (pageIndex < 1 || pageIndex > this.totalPages) return;
    this.apiRequest.pageIndex = pageIndex;
    this.currentPage = pageIndex;
    this.fetchList();
  }
  handleButtonClick(event) {
    if (event.buttonAction === 'for_edit') {
      this.FileId=event.item.fileId;
      if(event.item.status === 'Complete') {
        this.DownloadImportData(event.item.fileId, event.item.object);
      } else {
        this.notificationService.errorTopRight(`Can't download file, File is in progress`);
      }
    } 
  }
  DownloadImportData(fileId, type){
    this.service.DownloadQueueData(fileId).subscribe(data=>{
      const blob = new Blob([data], { type: 'application/csv' });
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = type === 'Points Credit Report' ? 'PointsCreditReport_'+fileId+'.csv' : type === 'Login Report' ? 'LoginReport_'+fileId+'.csv' : type === 'User Export Report' ? 'UserExportReport_'+fileId+'.csv' : type === 'User Push Report' ? 'UserPushReport_'+fileId+'.csv' : type === 'Order Redemption Report' ? 'OrderRedemptionReport_'+fileId+'.csv' : 'ReportQueue_'+fileId+'.csv';
      a.click();
      URL.revokeObjectURL(objectUrl);
    })
  }
  
  applySort(event) {
    this.sortBy = event.active;
    this.sortDirection = event.direction;
    this.apiRequest.sortBy = this.sortBy;
    this.apiRequest.sortDirection = this.sortDirection.toLowerCase();
    this.fetchList();
  }

  changePageCount(event) {
    this.apiRequest.itemCount = event;
    this.currentPage = 1;
    this.apiRequest.pageIndex = 1;
    this.fetchList();
  }
  submitUserExportFormDirectlyss() {
    // Get the current year
// Get the current date
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
const currentDay = currentDate.getDate().toString().padStart(2, '0');
// Format the date as MM-DD-YYYY
const formattedDate = `${currentYear}`;
    this.userID = sessionStorage.getItem('userId');
    const requestObj = {
      requesteduserId: this.userID,
    filter: [
    { oid: 'excludeInactive', value: 'yes' },
    { oid: 'excludeTestUser', value: 'yes' },
    { oid: 'period', value: formattedDate },  // Current year
    ],
    object: 'user_export',
    customeColumn: null
    };
    this.service.exportUser(requestObj).subscribe((resp) => {
    if (resp.isSuccess) {
    this.notification.successTopRight('Request Submitted Successfully');
    this.fetchList();
    } else {
    this.notification.errorTopRight(resp.message);
    }
    });
    }

    submitUserExportForm() {
      // Get the current date
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
const currentDay = currentDate.getDate().toString().padStart(2, '0');
// Format the date as MM-DD-YYYY
const formattedDate = `${currentYear}`;
    this.userID = sessionStorage.getItem('userId');
      // Predefined custom columns and filter values
      const customeColumn = [
      { column: "User ID", value: "bpNumber" },
      { column: "First Name", value: "firstName" },
      { column: "Last Name", value: "lastName" },
      { column: "Email", value: "email" },
      { column: "Organization", value: "organization" },
      { column: "Address1", value: "address1" },
      { column: "Address2", value: "address2" },
      { column: "City", value: "city" },
      { column: "StateProvinceName", value: "stateProvinceName" },
      { column: "StateProvinceCode", value: "stateProvinceCode" },
      { column: "ZipCode", value: "zipCode" },
      { column: "Phone", value: "phone" },
      { column: "Status", value: "status" },
      { column: "Title", value: "title" },
      { column: "W9OnFile", value: "w9OnFile" },
      { column: "W9Year", value: "w9Year" },
      { column: "W9Name", value: "w9Name" },
      { column: "W9Address", value: "w9Address" },
      { column: "W9City", value: "w9City" },
      { column: "W9State", value: "w9State" },
      { column: "W9ZipCode", value: "w9ZipCode" },
      { column: "Deleted", value: "deleted" },
      { column: "Logs In >1x/mo on average", value: "logsIn1xmoonaverage" },
      { column: "TotalLoginCount", value: "totalLoginCount" },
      { column: "CurrentYearLoginCount", value: "currentYearLoginCount" },
      { column: "DateAccountCreated", value: "dateAccountCreated" },
      { column: "EnrollmentDate", value: "enrollmentDate" },
      { column: "LastLoginDate", value: "lastLoginDate" },
      { column: "TotalCoursesCompleted", value: "totalCoursesCompleted" },
      { column: "TotalCoursesAvailable", value: "totalCoursesAvailable" },
      { column: "CurrentYearRequiredCoursesCompleted", value: "currentYearRequiredCoursesCompleted" },
      { column: "CurrentYearRequiredCoursesAvailable", value: "currentYearRequiredCoursesAvailable" },
      { column: "CurrentYearTotalListPriceSales", value: "currentYearTotalListPriceSales" },
      { column: "CurrentYearEligibleKohlerSales", value: "currentYearEligibleKohlerSales" },
      { column: "CurrentYearKohlerSales", value: "currentYearKohlerSales" },
      { column: "CurrentPointBalance", value: "currentPointBalance" },
      { column: "CurrentYearPointsEarned", value: "currentYearPointsEarned" },
      { column: "CurrentYearPointsRedeemed", value: "currentYearPointsRedeemed" },
      { column: "LifetimePointsEarned", value: "lifetimePointsEarned" },
      { column: "LifetimePointsRedeemed", value: "lifetimePointsRedeemed" }
      ];
      const predefinedFilter = [
      { oid: "excludeInactive", value: "yes" },
      { oid: "excludeTestUser", value: "yes" },
      { oid: 'period', value: formattedDate }
      ];
      const requestObj = {
        requesteduserId: this.userID,
      filter: predefinedFilter,
      object: "push_user_export",
      customeColumn
      };
      // Call the service with the predefined request object
      this.service.UserPushReports(requestObj).subscribe((resp) => {
      if (resp.isSuccess) {
      this.notificationService.successTopRight('Request Submitted Successfully');
      this.fetchList();
      } else {
      this.notificationService.errorTopRight(resp.message);
      }
      });
      }
}
