import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent implements OnInit, OnDestroy {
    
    flag: string;
    confirmDialogData: ConfirmDialogData = {
        title: 'Title',
        message: 'Message',
        closeBtnLabel: 'No',
        confirmBtnLabel: 'Yes'
    } as ConfirmDialogData;
    constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
    public dialog: MatDialogRef<ConfirmationDialogComponent>) { }

    ngOnInit(): void {
        this.flag = undefined;
        if (this.data !== undefined) {
            this.confirmDialogData = this.data;
        }
    }

    /* called when click on close icon */
    onClose(): void {
        this.flag = 'No';
        this.dialog.close(false);
    }

    onConfirm(): void {
        this.flag = 'Yes';
        this.dialog.close(true);
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        if (this.flag !== undefined) {
            this.dialog.close(this.flag === 'Yes' ? true : false);
        } else {
            this.dialog.close(false);
        }
    }

}

export interface ConfirmDialogData {
    title: string;
    message: string;
    closeBtnLabel: string;
    confirmBtnLabel: string;
}
