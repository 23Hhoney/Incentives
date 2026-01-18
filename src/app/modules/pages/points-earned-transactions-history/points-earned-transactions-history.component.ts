import { Component, ViewChild } from '@angular/core';
import { COLUMN_TYPE, DataGridColumnHeader } from 'app/shared/component/data-grid/data-grid.service';
import { PointsEarnedTransactionsHistoryService } from './points-earned-transactions-history.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { NotificationService } from 'app/shared/notification/notification';
import { DatePipe } from '@angular/common';
import * as moment from 'moment-timezone';
@Component({
  selector: 'app-points-earned-transactions-history',
  templateUrl: './points-earned-transactions-history.component.html',
  styleUrls: ['./points-earned-transactions-history.component.scss'],
})
export class PointsEarnedTransactionsHistoryComponent {
  
  gridColumnsTab: DataGridColumnHeader[];
  gridColumnsTab1: DataGridColumnHeader[];
  columnType = COLUMN_TYPE;
  loading = false;
  redeemLoading = false;
  modalReference: any;
  sortBy = '';
  sortDirection = '';
  totalRecords = 0;
  totalRedeemRecords = 0;
  dataSource1 = [];
  dataSource2 = [];
  apiRequest = {
    itemCount: 25,
    pageIndex: 1,
    sortBy: "creadtedDate",
    search: "",
    sortDirection: "",
    filter: []
  };
  apiRequestRedeemHistory = {
    itemCount: 25,
    pageIndex: 1,
    sortBy: "creadtedDate",
    search: "",
    sortDirection: "desc",
    filter: []
  };
  pages: number[] = [];
  redeemPages: number[] = [];
  totalPages: number;
  totalRedeemPages: number;
  deletelement: any;
  cirriculumId: any;
  currentPage = 1;
  currentRedeemPage = 1;
  selectedTabIndex = 0;

  constructor(
    private router: Router,
    private service: PointsEarnedTransactionsHistoryService,
    private _formGroup: FormBuilder,
    private route: ActivatedRoute,
    private _notificationService: NotificationService,
    private datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    this.gridColumnsTab = this.getGridSettings();
    this.gridColumnsTab1 = this.getGridSettings1();
    this.PointsEarnedList();
  }

  getGridSettings(): DataGridColumnHeader[] {
    return [
      {
        columnName: 'invNumber',
        columnTitleKey: 'Invoice Number',
        columnValue: 'invNumber',
        type: this.columnType.TEXT,
        show: true,
       sort: false,
      }, 
      {
        columnName: 'dateShipped',
        columnTitleKey: 'Date Shipped',
        columnValue: 'dateShipped',
        type: this.columnType.TEXT,
        show: true,
        sort: false,
      }, 
      {
        columnName: 'sku',
        columnTitleKey: 'Sku',
        columnValue: 'sku',
        type: this.columnType.TEXT,
        show: true,
        sort: false,
      }, 
      {
        columnName: 'brand',
        columnTitleKey: 'Brand',
        columnValue: 'brand',
        type: this.columnType.TEXT,
        show: true,
        sort: false,
      }, 
      {
        columnName: 'productName',
        columnTitleKey: 'Product Name',
        columnValue: 'productName',
        type: this.columnType.TEXT,
        show: true,
        sort: false,
      }, 
      {
        columnName: 'listPrice',
        columnTitleKey: 'List Price/Item',
        columnValue: 'listPrice',
        type: this.columnType.TEXT,
        show: true,
        sort: false,
      }, 
      {
        columnName: 'totalListPrice',
        columnTitleKey: 'Total List Price',
        columnValue: 'totalListPrice',
        type: this.columnType.TEXT,
        show: true,
        sort: false,
      }, 
      {
        columnName: 'qnty',
        columnTitleKey: 'Quantity',
        columnValue: 'qnty',
        type: this.columnType.TEXT,
        show: true,
        sort: false,
      }, 
      {
        columnName: 'pointPerItem',
        columnTitleKey: 'Points Per Item',
        columnValue: 'pointPerItem',
        type: this.columnType.TEXT,
        show: true,
        sort: false,
      }, 
      {
        columnName: 'pointAwarded',
        columnTitleKey: 'Points Awarded',
        columnValue: 'pointAwarded',
        type: this.columnType.TEXT,
        show: true,
        sort: false,
      }, 
      {
        columnName: 'dateAdd',
        columnTitleKey: 'Date Added',
        columnValue: 'dateAdd',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      }, 
    ]
  }
  getGridSettings1(): DataGridColumnHeader[] {
    return [
      {
        columnName: 'orderDate',
        columnTitleKey: 'Order Date',
        columnValue: 'orderDate',
        type: this.columnType.TEXT,
        show: true,
        sort: false,
      }, 
      {
        columnName: 'orderNumber',
        columnTitleKey: 'Order Number',
        columnValue: 'orderNumber',
        type: this.columnType.TEXT,
        show: true,
        sort: false,
      }, 
      {
        columnName: 'itemName',
        columnTitleKey: 'Item',
        columnValue: 'itemName',
        type: this.columnType.TEXT,
        show: true,
        sort: false,
      }, 
      {
        columnName: 'qnty',
        columnTitleKey: 'Quantity',
        columnValue: 'qnty',
        type: this.columnType.TEXT,
        show: true,
        sort: false,
      }, 
      {
        columnName: 'points',
        columnTitleKey: 'Points / Item',
        columnValue: 'points',
        type: this.columnType.TEXT,
        show: true,
        sort: false,
      }, 
      
    ]
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalRecords / this.apiRequest.itemCount);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  calculateRedeemTotalPages() {
    this.totalRedeemPages = Math.ceil(this.totalRedeemRecords / this.apiRequestRedeemHistory.itemCount);
    this.redeemPages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onPageChange(pageIndex: number) {
    if (pageIndex < 1 || pageIndex > this.totalPages) return;
    this.apiRequest.pageIndex = pageIndex;
    this.currentPage = pageIndex;
    this.PointsEarnedList();
  }

  onRedeemPageChange(pageIndex: number) {
    if (pageIndex < 1 || pageIndex > this.totalRedeemPages) return;
    this.apiRequestRedeemHistory.pageIndex = pageIndex;
    this.currentRedeemPage = pageIndex;
    this.PointsEarnedList();
  }

  PointsEarnedList() {
    const bpNumber = encodeURIComponent(window.sessionStorage.getItem('userId'));
    
    if (this.selectedTabIndex === 0) {

      this.loading = true;
      this.dataSource1 = [];
      this.service.getTransactionListByUser(this.apiRequest, bpNumber).subscribe(data => {
        this.loading = false;
        if (data) {
          if (data.results.length) {
            this.dataSource1 = data.results;
          }
  
          this.dataSource1.forEach(element => {
            if (element.dateAdd) {
              element.dateAdd = moment.utc(element.dateAdd)
                .tz('America/New_York')
                .format('MM-DD-YYYY');
            }
            if (element.dateShipped) {
              element.dateShipped = moment.utc(element.dateShipped)
                .tz('America/New_York')
                .format('MM-DD-YYYY');
            }
            if (element.listPrice) {
              element.listPrice = parseFloat(element.listPrice).toFixed(2);
            }
            if (element.totalListPrice) {
              element.totalListPrice = parseFloat(element.totalListPrice).toFixed(2); 
            }
           
          });
          
          
          this.totalRecords = data.totalRecords;
          this.calculateTotalPages();
        }
      });
    } else if (this.selectedTabIndex === 1) {
      // Fetch data for the second tab
      this.redeemLoading = true;
      this.dataSource2 = [];
      const bpNumberA = encodeURIComponent(window.sessionStorage.getItem('bpNumber'));
      this.service.getRedeemTransactionListByUser(this.apiRequestRedeemHistory, bpNumberA).subscribe(data => {
        this.redeemLoading = false;
        if (data) {
          if (data.results.length) {
            this.dataSource2 = data.results;
          }
  
          this.dataSource2.forEach(element => {
            if (element.orderDate) {
              element.orderDate = moment.utc(element.orderDate)
                .tz('America/New_York')
                .format('MM-DD-YYYY');
            }
            if (element.listPrice) {
              element.listPrice = parseFloat(element.listPrice).toFixed(2); 
            }
            if (element.totalListPrice) {
              element.totalListPrice = parseFloat(element.totalListPrice).toFixed(2); 
            }
            element.itemName = element.itemName || 'N/A';
          });
  
          this.totalRedeemRecords = data.totalRecords;
          this.calculateRedeemTotalPages();
        }
      });
    }
  }
  

  onTabChange(event) {
    this.selectedTabIndex = event.index;
    this.PointsEarnedList();
  }

  changePageCount(event) {
    this.apiRequest.itemCount = event;
    this.currentPage = 1;
    this.apiRequest.pageIndex = 1
    this.PointsEarnedList();
  }
  

  changeRedeemPageCount(event) {
    this.apiRequestRedeemHistory.itemCount = event;
    this.currentRedeemPage = 1;
    this.apiRequestRedeemHistory.pageIndex = 1
    this.PointsEarnedList();
  }
  // handleSortChange(event) {
  //   this.sortBy = event.active;
  //   this.sortDirection = event.direction;

  //   this.apiRequest.sortBy = this.sortBy;
  //   this.apiRequest.sortDirection = this.sortDirection.toLowerCase();
    
  //   this.getSKUImportData();
  // }
  handleSortChange(event) {

    this.sortBy = event.active;
    this.sortDirection = event.direction;

    this.apiRequest.sortBy = this.sortBy;
    this.apiRequest.sortDirection = this.sortDirection.toLowerCase();
    const bpNumber = encodeURIComponent(window.sessionStorage.getItem('bpNumber'));
    if (this.selectedTabIndex === 1)
    {
      this.redeemLoading = true;
      this.dataSource2 = [];
      this.service.getRedeemTransactionListByUser(this.apiRequestRedeemHistory, bpNumber).subscribe(data => {
        this.redeemLoading = false;
        if (data) {
          if (data.results.length) {
            this.dataSource2 = data.results;
          }
  
          this.dataSource2.forEach(element => {
            if (element.orderDate) {
              element.orderDate = moment.utc(element.orderDate)
                .tz('America/New_York')
                .format('MM-DD-YYYY');
            }
            if (element.listPrice) {
              element.listPrice = parseFloat(element.listPrice).toFixed(2); 
            }
            if (element.totalListPrice) {
              element.totalListPrice = parseFloat(element.totalListPrice).toFixed(2); 
            }
            element.itemName = element.itemName || 'N/A';
          });
  
          this.totalRedeemRecords = data.totalRecords;
          this.calculateRedeemTotalPages();
        }
      });

    }
    else if(this.selectedTabIndex === 0){
      this.loading = true;
      this.dataSource1 = [];
      this.service.getTransactionListByUser(this.apiRequest, bpNumber).subscribe(data => {
        this.loading = false;
        if (data) {
          if (data.results.length) {
            this.dataSource1 = data.results;
          }
  
          this.dataSource1.forEach(element => {
            if (element.dateAdd) {
              element.dateAdd = moment.utc(element.dateAdd)
                .tz('America/New_York')
                .format('MM-DD-YYYY');
            }
            if (element.dateShipped) {
              element.dateShipped = moment.utc(element.dateShipped)
                .tz('America/New_York')
                .format('MM-DD-YYYY');
            }
            if (element.listPrice) {
              element.listPrice = parseFloat(element.listPrice).toFixed(2);
            }
            if (element.totalListPrice) {
              element.totalListPrice = parseFloat(element.totalListPrice).toFixed(2); 
            }
           
          });
          
          
          this.totalRecords = data.totalRecords;
          this.calculateTotalPages();
        }
      });
    }
    
  }
}
