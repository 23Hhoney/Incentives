import { OnInit, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-input',
    template: `
    <mat-form-field [class]="formfieldClass" appearance="outline" *ngIf="fieldAccess === 'MAND'" >
        <mat-label>{{label }}*</mat-label>
        <input [formControl]="ctrl" matInput type="text">
        <mat-error>{{ validationMsg }}</mat-error>
    </mat-form-field>

    <mat-form-field [class]="formfieldClass" appearance="outline" *ngIf="fieldAccess === 'OPT'" >
        <mat-label>{{label }}</mat-label>
        <input [formControl]="ctrl" matInput type="text">
    </mat-form-field>

    <mat-form-field [class]="formfieldClass" appearance="outline" *ngIf="fieldAccess === 'READ'" >
        <mat-label>{{label }}</mat-label>
        <input [formControl]="ctrl" matInput type="text"  readonly>
    </mat-form-field>
    `,
    styleUrls: ['./input.component.css']

    // styles: [`:host { display: block; }`]
})
export class InputComponent implements OnInit {
    @Input() ctrl: FormControl;
    @Input() placeholder: string;

    @Input() formfieldClass: string;
    @Input() fieldName: string;
    @Input() permissionDetails: any[];
    @Input() label;
    @Input() validationMsg;
    fieldAccess;

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

        if ('MAND' !== this.fieldAccess) {
            this.ctrl.clearValidators();
        }
        console.log(this.fieldAccess);
    }

}