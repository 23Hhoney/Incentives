import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ExportExcelService } from 'app/modules/pages/excel-export-service.service';
import { DataGridColumnHeader, COLUMN_TYPE } from 'app/shared/component/data-grid/data-grid.service';
import { NotificationService } from 'app/shared/notification/notification';
import { BsModalService } from 'ngx-bootstrap/modal';
import { IncentiveAdminPanelService } from '../incentive-admin-panel.service';
import { DatePipe } from '@angular/common';
import { MatExpansionPanel } from '@angular/material/expansion';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-user-export-push-report',
  templateUrl: './user-export-push-report.component.html',
  styleUrls: ['./user-export-push-report.component.scss']
})
export class UserExportPushReportComponent {
  pushExportForm: FormGroup;
  yearsArray = [];
  dialogForm:FormGroup;
  columnsFormDialog = null
  selectionFormResponse = [];
  userID = null;

  constructor(
    private service: IncentiveAdminPanelService, 
    private _formGroup: FormBuilder, 
    private exportExcelService: ExportExcelService,
    private notificationService:NotificationService,
    private _matDialog: MatDialog,
    private modalService: BsModalService,
    private _datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const startYear = 1980;
    const currentYear = new Date().getFullYear(); 
    this.yearsArray = [];
    for (let year = startYear; year <= currentYear; year++) {
      this.yearsArray.push(year.toString());
    }
    this.pushExportForm = this._formGroup.group({
      excludeInactive: 'no',
      excludeTestUser: 'no',
      period: currentYear.toString(), 
    })
    this.userID = sessionStorage.getItem('userId')
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const isFromAnotherPage = params['from'] === 'anotherPage';
      
      this.GetAllUserColumn(isFromAnotherPage);
    });
  }
  
  GetAllUserColumn(isFromAnotherPage: boolean) {
    this.selectionFormResponse = [];
    this.service.GetAllUserColumn().subscribe((data) => {
      const { customFields, ...filteredResponse } = data;
      const transformedResponse = Object.entries(filteredResponse).map(([key, value]) => ({
        id: key,
        value: value
      }));
      this.selectionFormResponse = transformedResponse;
  
      // Auto-select columns if coming from another page
      if (isFromAnotherPage) {
        this.autoSelectColumns();
      }
    });
  }
  
  autoSelectColumns() {
    const autoSelectedColumns = [
      'bpNumber',
      'firstName',
      'lastName',
      'email',
      'organization',
      'address1',
      'city',
      'stateProvinceName',
      'stateProvinceCode',
      'w9OnFile',
      'currentYearLoginCount',
      'dateAccountCreated',
      'datelastLoginDate',
      'currentYearCoursesCompleted',
      'currentYearCoursesAvailable',
      'currentYearTotalListPriceSales',
      'currentPointBalance',
      'currentYearPointsEarned',
      'currentYearPointsRedeemed'
    ];
  
    this.selectionFormResponse.forEach((item) => {
      if (autoSelectedColumns.includes(item.id)) {
        item.checked = true;
      }
    });
  }
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  submitUserExportForm() {
   
      const customeColumn = [];
      this.selectionFormResponse.forEach((item) => {
        if (item.checked) {
          customeColumn.push({
            column: item.value,
            value: item.id
          });
        }
      });
  
      if (customeColumn.length === 0) {
        this.notificationService.errorTopRight('Please select columns');
        return;
      }
  
      const transformedArray = Object.entries(this.pushExportForm.value).map(([key, value]) => ({
        oid: key,
        value: value
      }));
      const requestObj = {
        requesteduserId: this.userID,
        filter: transformedArray,
        object: 'push_user_export',
        customeColumn
      };
      this.service.UserPushReports(requestObj).subscribe((resp) => {
        if (resp.isSuccess) {
          this.router.navigate(['report-queue'], {queryParams: {filter: 'push_user_export'}});
          this.notificationService.successTopRight('Request Submitted Successfully');
        } else {
          this.notificationService.errorTopRight(resp.message);
        }
      });
  
  }
  

  openDialog(DialogName) {
    this.columnsFormDialog = this._matDialog.open(DialogName);
  }
  toggleSelectAll(event: any) {
    const isChecked = event.checked;
    this.selectionFormResponse.forEach(item => {
      item['checked'] = isChecked;
    });
  }
  
  areAllColumnsSelected(): boolean {
    return this.selectionFormResponse.length > 0 && this.selectionFormResponse.every(item => item['checked']);
  }
}
