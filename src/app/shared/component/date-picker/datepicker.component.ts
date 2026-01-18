import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-date-picker',
    template: `
    <mat-form-field appearance="outline"  [class]="formfieldClass" *ngIf="fieldAccess === 'MAND'">
        <mat-label>{{label }}*</mat-label>
        <input matInput (dateChange)="getSelectedDate($event.value)"
            [matDatepicker]="id" [formControl]="ctrl">
        <mat-datepicker-toggle matSuffix [for]="id">
        </mat-datepicker-toggle>
        <mat-datepicker #id></mat-datepicker>
    </mat-form-field>

    <mat-form-field appearance="outline"   [class]="formfieldClass" *ngIf="fieldAccess === 'OPT'">
        <mat-label>{{label }}</mat-label>
        <input matInput (dateChange)="getSelectedDate($event.value)"
            [matDatepicker]="id" [formControl]="ctrl">
        <mat-datepicker-toggle matSuffix [for]="id">
        </mat-datepicker-toggle>
        <mat-datepicker #id></mat-datepicker>
    </mat-form-field>


    <mat-form-field appearance="outline"   [class]="formfieldClass" *ngIf="fieldAccess === 'READ'">
        <mat-label>{{label }}</mat-label>
        <input matInput 
            [matDatepicker]="id" [formControl]="ctrl"  readonly>
        <mat-datepicker-toggle matSuffix [for]="id" disabled>
        </mat-datepicker-toggle>
        <mat-datepicker #id></mat-datepicker>
    </mat-form-field>
    `,
    styleUrls: ['./datepicker.component.scss']

    
})
export class DatePickerComponent implements OnInit {
    @Input() ctrl: FormControl;
    @Input() placeholder: string;
    @Input() id;

    @Input() formfieldClass: string;
    @Input() fieldName: string;
    @Input() permissionDetails: any[];
    @Input() label;
    @Input() validationMsg;
    fieldAccess;

    @Output() dateChangeAction = new EventEmitter<{ eventObj: any }>();

    ngOnInit(): void {
        //default is edit
        this.fieldAccess = 'MAND';

        if (!this.placeholder)
            this.placeholder = '';

        if (this.permissionDetails && this.permissionDetails.length > 0) {
            this.permissionDetails.forEach(element => {
                if (element.fieldName === this.fieldName) {
                    this.fieldAccess = element.accessType;
                }
            });
        }

        if('MAND' !== this.fieldAccess) {
            this.ctrl.clearValidators();
        }
        console.log(this.fieldAccess);
    }

    getSelectedDate(event:Date): void {
        this.dateChangeAction.emit({ eventObj: event });
    }

}