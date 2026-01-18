import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IncentiveAdminPanelService } from '../incentive-admin-panel.service';
import { Router } from '@angular/router';
import { NotificationService } from 'app/shared/notification/notification';

@Component({
  selector: 'app-user-export',
  templateUrl: './user-export.component.html',
  styleUrls: ['./user-export.component.scss']
})
export class UserExportComponent {
  userExportForm: FormGroup;;
  yearsArray = [];
  userID = null;
  constructor(private _formGroup: FormBuilder, private service: IncentiveAdminPanelService, private router: Router, private notification: NotificationService) {
    const startYear = 1980;
    const currentYear = new Date().getFullYear();
    this.yearsArray = [];
    for (let year = startYear; year <= currentYear; year++) {
      this.yearsArray.push(year.toString());
    }
    this.userExportForm = this._formGroup.group({
      excludeInactive: 'no',
      excludeTestUser: 'no',
      period: currentYear.toString(), 
    })
    this.userID = sessionStorage.getItem('userId')
  }

  submitUserExportForm() {
    const transformedArray = Object.entries(this.userExportForm.value).map(([key, value]) => ({
      oid: key,
      value: value
    }));
    const requestObj = {
      requesteduserId: this.userID,
      filter: transformedArray,
      object: 'user_export',
      customeColumn: null
    }
    this.service.exportUser(requestObj).subscribe((resp) => {
      if (resp.isSuccess) {
        this.router.navigate(['report-queue'], {queryParams: {filter: 'user_export'}})
        this.notification.successTopRight('Request Submitted Successfully')
      }
      else{
        this.notification.errorTopRight(resp.message)
      }
    })
  }
}
