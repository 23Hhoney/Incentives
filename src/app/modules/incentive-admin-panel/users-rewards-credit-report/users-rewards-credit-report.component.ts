import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ExportExcelService } from 'app/modules/pages/excel-export-service.service';
import { IncentiveAdminPanelService } from '../incentive-admin-panel.service';
import moment from 'moment';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NotificationService } from 'app/shared/notification/notification';
import { catchError, debounceTime, distinctUntilChanged, map, Observable, of, Subscription, switchMap } from 'rxjs';
import { Users } from '../points-credit-manager/users.types';


@Component({
  selector: 'app-users-rewards-credit-report',
  templateUrl: './users-rewards-credit-report.component.html',
  styleUrls: ['./users-rewards-credit-report.component.scss']
})
export class UsersRewardsCreditReportComponent implements OnInit {
  firstName: string;
  lastName: string;
  email:string;
  companyName:string
  dateSelectionForm: FormGroup;
  dateSelectionShipForm: FormGroup;
  modalReference: any;
  userId: string;
  userSearchControl = new FormControl();
  filteredUsers: Observable<Users[]>;
  selectedUserTooltip: string;
  selectedUserName: string;
  selectedFullname: string;
  private subscription: Subscription;

  constructor(private fb: FormBuilder,
    private service: IncentiveAdminPanelService, 
    private notificationService:NotificationService,
    private _matDialog: MatDialog,
    private modalService: BsModalService,
    private _datePipe: DatePipe,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.setupUserSearchSubscription();
  }

  initForms(): void {
    this.dateSelectionForm = this.fb.group({
      dateType: 'dateProcessed',
      dateProcessedStart: [null],
      dateProcessedEnd: [null],
      userId: this.userSearchControl,
      productLine: [''],
      subCategory: [''],
      organisation: '',
      brand: '',
      category: ''
    });

    this.dateSelectionShipForm = this.fb.group({
      dateType: [false],
      shipDateStart: [null],
      shipDateEnd: [null]
    });

    this.handleDateTypeValueChanges();
  }

  private handleDateTypeValueChanges(): void {
    this.dateSelectionForm.get('dateType').valueChanges.subscribe(value => {
      if (value === 'dateProcessed') {
        this.dateSelectionShipForm.get('dateType').setValue('');
      }
    });

    this.dateSelectionShipForm.get('dateType').valueChanges.subscribe(value => {
      if (value === 'shipDate') {
        this.dateSelectionForm.get('dateType').setValue('');
      }
    });
  }

  private setupUserSearchSubscription(): void {
    this.subscription = this.userSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => this.searchUsers(value || ''))
    ).subscribe(users => {
      this.filteredUsers = of(users);
      if (!this.userSearchControl.value) {
        this.selectedFullname = '';
        this.selectedUserTooltip = '';
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
  
    // Debugging log
    console.log('Selected User:', selectedUser);
  
    if (selectedUser) {
      this.selectedUserTooltip = `${selectedUser.firstName || ''} ${selectedUser.lastName || ''} (${selectedUser.email || ''}) - ${selectedUser.bpNumber || ''}`;
      this.selectedUserName = `${selectedUser.firstName || ''} ${selectedUser.lastName || ''} (${selectedUser.email || ''}) - ${selectedUser.bpNumber || ''}`;
      this.selectedFullname = `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`;
      this.dateSelectionForm.get('userId')?.setValue(selectedUser.bpNumber || '');
  
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
  get isDateProcessedSelected(): boolean {
    return this.dateSelectionForm.get('dateType').value === 'dateProcessed';
  }

  get isShipDateSelected(): boolean {
    return this.dateSelectionShipForm.get('dateType').value === 'shipDate';
  }

  downloadCSV() {
    const customeColumn = [];
    const filterArray = [];

    if (this.isDateProcessedSelected) {
      if (!(this.dateSelectionForm.get('dateProcessedStart')?.value)) {
        this.notificationService.errorTopRight('Please fill processed start date')
        return;
      } else if (!this.dateSelectionForm.get('dateProcessedEnd')?.value) {
        this.notificationService.errorTopRight('Please fill processed end date')
        return;
      }
      const startDate = new Date(this.dateSelectionForm.get('dateProcessedStart').value);
      const utcStartDate = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0));

      filterArray.push({
        oid: "dateProcessedStar",
        value: utcStartDate.toISOString().substring(0, 19) + 'Z',
      });
      const endDate = new Date(this.dateSelectionForm.get('dateProcessedEnd').value);
      const utcEndDate = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999));

      filterArray.push({
        oid: "dateProcessedEnd",
        value: utcEndDate.toISOString().substring(0, 19) + 'Z',
      });
    }

    if (this.isShipDateSelected) {

      if (!(this.dateSelectionShipForm.get('shipDateStart')?.value)) {
        this.notificationService.errorTopRight('Please fill ship/invoice processed start date')
        return;
      } else if (!this.dateSelectionShipForm.get('shipDateEnd')?.value) {
        this.notificationService.errorTopRight('Please fill ship/invoice processed end date')
        return;
      }
      const startDate = new Date(this.dateSelectionShipForm.get('shipDateStart').value);
      const utcStartDate = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0));

      filterArray.push({
        oid: "shippedStartDate",
        value: utcStartDate.toISOString().substring(0, 19) + 'Z',
      });

      const endDate = new Date(this.dateSelectionShipForm.get('shipDateEnd').value);
      const utcEndDate = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999));
      
      filterArray.push({
        oid: "shippedEndDate",
        value: utcEndDate.toISOString().substring(0, 19) + 'Z',
      });
    }

    if (this.dateSelectionForm.get('userId').value) {
      filterArray.push({
        oid: "UserID",
        value: this.dateSelectionForm.get('userId').value
      });
    }
    if (this.dateSelectionForm.get('productLine').value) {
      filterArray.push({
        oid: "ProductLine",
        value: this.dateSelectionForm.get('productLine').value
      });
    }
    if (this.dateSelectionForm.get('subCategory').value) {
      filterArray.push({
        oid: "SubCategory",
        value: this.dateSelectionForm.get('subCategory').value
      });
    }

    if (this.dateSelectionForm.get('organisation').value) {
      filterArray.push({
        oid: "Organisation",
        value: this.dateSelectionForm.get('organisation').value
      });

    }
    if (this.dateSelectionForm.get('brand').value) {
      filterArray.push({
        oid: "Brand",
        value: this.dateSelectionForm.get('brand').value
      });

    }
    if (this.dateSelectionForm.get('category').value) {
      filterArray.push({
        oid: "Category",
        value: this.dateSelectionForm.get('category').value
      });

    }
    const requestObj = {
      requesteduserId: sessionStorage.getItem('userId'),
      filter: filterArray,
      object: 'points_credit_sales_report',
      customeColumn
    };

    this.service.exportPointCreditReport(requestObj).subscribe((resp) => {
      if (resp.isSuccess) {
        this.router.navigate(['report-queue'], { queryParams: { filter: 'points_credit_sales_report' } });
        this.notificationService.successTopRight('Request Submitted Successfully');
      }
      else {
        this.notificationService.errorTopRight(resp.message);
      }
    });
  }
  
}
