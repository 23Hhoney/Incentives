import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { IncentiveAdminPanelService } from '../incentive-admin-panel.service';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from 'app/shared/notification/notification';
import { Router } from '@angular/router';
import moment from 'moment';
import { Users } from '../points-credit-manager/users.types';
import { catchError, debounceTime, distinctUntilChanged, map, Observable, of, startWith, Subscription, switchMap } from 'rxjs';
@Component({
  selector: 'app-login-report',
  templateUrl: './login-report.component.html',
  styleUrls: ['./login-report.component.scss']
})
export class LoginReportComponent {
  dateSelectionForm: FormGroup;
  @ViewChild('userdetails') userdetails: TemplateRef<any>;
  modalReference: any;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  userSearchControl = new FormControl();
  filteredUsers: Observable<Users[]>;
  selectedUserTooltip: string;
  private isUserSelected = false;
  selectedUserName: string;
  selectedFullname: string;
  private subscription: Subscription;

  constructor(private fb: FormBuilder, private service: IncentiveAdminPanelService, private _matDialog: MatDialog,
    private notificationService: NotificationService,
    private _datePipe: DatePipe,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.dateSelectionForm = this.fb.group({
      startDate: null,
      endDate: null,
      email: this.userSearchControl,
      organization: ''
    });

    this.userSearchControl.valueChanges.pipe(
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
    this.subscription = this.userSearchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (this.isUserSelected) {
          this.isUserSelected = false;
          return of([]); 
        }
        return this.searchUsers(value || '');
      })
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
  
    if (selectedUser) {
      this.isUserSelected = true;
      this.selectedUserTooltip = `${selectedUser.firstName || ''} ${selectedUser.lastName || ''} (${selectedUser.email || ''}) - ${selectedUser.bpNumber || ''}`;
      this.selectedUserName = `${selectedUser.firstName || ''} ${selectedUser.lastName || ''} (${selectedUser.email || ''}) - ${selectedUser.bpNumber || ''}`;
      this.selectedFullname = `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`;
      this.dateSelectionForm.get('email')?.setValue(selectedUser.bpNumber || '');
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
    return this.dateSelectionForm.get('dateType').value === 'shipDate';
  }


  downloadCSV() {
    const customeColumn = [];
    const formValues = [];

    if (!(this.dateSelectionForm.get('startDate')?.value)) {
      this.notificationService.errorTopRight('Please fill start date')
      return;
    } else if (!this.dateSelectionForm.get('endDate')?.value) {
      this.notificationService.errorTopRight('Please fill end date')
      return;
    }

    const startDate = new Date(this.dateSelectionForm.get('startDate').value);
    const utcDate = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0));
    formValues.push({
      oid: "loginStartDate",
      value: utcDate.toISOString().substring(0, 19) + 'Z',
    });

    const endDate = new Date(this.dateSelectionForm.get('endDate').value);
    const utcendDate = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999));
    formValues.push({
      oid: "loginEndDate",
      value: utcendDate.toISOString().substring(0, 19) + 'Z',
    });

    if (this.dateSelectionForm.get('email').value) {
      formValues.push({
        oid: "email",
        value: this.dateSelectionForm.get('email').value
      });
    }

    if (this.dateSelectionForm.get('organization').value) {
      formValues.push({
        oid: "organization",
        value: this.dateSelectionForm.get('organization').value
      });
    }

    const object = {
      requesteduserId: sessionStorage.getItem('userId'),
      filter: formValues,
      object: "login_report",
      customeColumn: customeColumn
    };
    console.log('object',object)

    this.service.exportLoginReport(object).subscribe(data => {
      if (data.isSuccess) {
        this.router.navigate(['report-queue'], { queryParams: { filter: 'login_report' } })
        this.notificationService.successTopRight('Request Submitted Successfully')
      }
      else {
        this.notificationService.errorTopRight(data.message)
      }
    });
  }

}



