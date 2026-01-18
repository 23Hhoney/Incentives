import { OnInit, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-select',
    template: `
    <mat-form-field [class]="formfieldClass" appearance="outline" *ngIf="fieldAccess === 'MAND'" >
      <mat-label>{{label }}*</mat-label>
      <mat-select [formControl]="ctrl" [placeholder]="placeholder" >
        <mat-option *ngFor="let option of options" [value]="option">
          {{ option }}
        </mat-option>
      </mat-select>
      <mat-error>{{ validationMsg }}</mat-error>
    </mat-form-field>

    <mat-form-field [class]="formfieldClass" appearance="outline" *ngIf="fieldAccess === 'OPT'">
      <mat-label>{{label}}</mat-label>
      <mat-select [formControl]="ctrl" [placeholder]="placeholder" >
        <mat-option *ngFor="let option of options" [value]="option">
          {{ option }}
        </mat-option>
      </mat-select>
    </mat-form-field>

    <mat-form-field [class]="formfieldClass" appearance="outline" *ngIf="fieldAccess === 'READ'">
      <mat-label>{{label}} </mat-label>

      <mat-select [formControl]="ctrl" [placeholder]="placeholder"  disabled ="true">
        <mat-option *ngFor="let option of options" [value]="option">
          {{ option }}
        </mat-option>
      </mat-select>
    </mat-form-field>
    `,
    styleUrls: ['./select.component.scss']

    // styles: [`:host { display: block; }`]
})
export class SelectComponent implements OnInit {
    @Input() ctrl: FormControl;
    @Input() options: string[];
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

        if('MAND' !== this.fieldAccess) {
            this.ctrl.clearValidators();
        }
        console.log(this.fieldAccess);
    }

}