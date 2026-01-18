import { Component, OnInit, ViewEncapsulation, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CalendarEvent } from 'angular-calendar';

import { MatColors } from '@fuse/mat-colors';

import { CalendarEventModel } from 'app/main/apps/calendar/event.model';
import { CalendarPickerEvent, PageEnums, CalendarEventEnums } from '../calendar-picker-contract';
import { CalendarPickerService } from '../calendar-picker/calendar-picker.service';
import { NotificationService } from 'app/shared/notification/notification.service';
import { CalendarEventDB } from 'app/main/contracts/Calendar/calendar.CalendarEvent.model';
import { ObjectId } from 'app/main/contracts/master-data/master.ObjectId.model';

@Component({
  selector: 'app-calendar-modal',
  templateUrl: './calendar-modal.component.html',
  styleUrls: ['./calendar-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CalendarModalComponent implements OnInit, OnDestroy {

    action: string;
    event: CalendarPickerEvent;
    eventForm: FormGroup;
    dialogTitle: string;
    presetColors = MatColors.presets;
    
    startTime: string;
    endTime: string;
    isViewOnly = true;
    page = '';
    pageType = PageEnums;

    eventBackRes;
    isUpdateCall: boolean;

    /**
     * Constructor
     *
     * @param {MatDialogRef<CalendarModalComponent>} matDialogRef
     * @param _data
     * @param {FormBuilder} _formBuilder
     */
    constructor(
        public matDialogRef: MatDialogRef<CalendarModalComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _formBuilder: FormBuilder, private calendarPickerService: CalendarPickerService,
        private notificationService: NotificationService
    )
    {
        this.event = _data.event;
        this.action = _data.action;
        this.isViewOnly = _data.isViewOnly;
        if (this._data.page !== undefined) {
            this.page = this._data.page;
        }
        console.log('==================inot the view=============', _data);
        if ( this.action === 'edit' )
        {
            this.dialogTitle = this.event.title;
        }
        else
        {
            this.dialogTitle = 'New Event';
            this.event = new CalendarEventModel({
                start: _data.date,
                end  : _data.date
            });
        }

        this.eventForm = this.createEventForm();
    }

    ngOnInit(): void {
        this.eventBackRes = this.calendarPickerService.getCalendarEventBackRes().subscribe(
            obj => {
                if (obj !== undefined) {
                    if (obj === 'Success') {
                        if (this.isUpdateCall) {
                            this.notificationService.successTopRight('Data successfully updated.');
                            this.matDialogRef.close(['save', this.eventForm]);
                        } else {
                            this.notificationService.successTopRight('Data successfully saved.');
                            this.matDialogRef.close(this.eventForm);
                        }
                    } else if (obj === 'Failed') {
                        this.notificationService.successTopRight('Data not saved.');
                    }
                }
            }
        );
    }

    ngOnDestroy(): void {
        this.eventBackRes.unsubscribe();
        this.calendarPickerService.setCalendarEventBackRes(undefined);
    }

  // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Create the event form
     *
     * @returns {FormGroup}
     */

    saveCalendarEvent(): void {
        const colorObj = this.eventForm.get('color').value;
        const metaObj = this.eventForm.get('meta').value;
        let calEventType: string;
        if (this.page === this.pageType.HOLIDAY) {
            calEventType = CalendarEventEnums.HOLIDAY;
        }
        const eventObj: CalendarEventDB = {
            // allDay: this.eventForm.get('allDay').value, 
            start: this.eventForm.get('start').value, 
            end: this.eventForm.get('end').value,
            title: this.eventForm.get('title').value, 
            description: metaObj.notes, 
            noOfDayNotification: this.eventForm.get('noOfDayNotification').value,
            restricted: this.eventForm.get('restricted').value, 
            notifyEmployee: this.eventForm.get('notifyEmp').value,
            primaryColor: colorObj.primary, 
            secondaryColor: colorObj.secondary,
            location: metaObj.location,
            type: calEventType
        };
        // console.log('===============event obj==============', eventObj);
        this.isUpdateCall = false;
        this.calendarPickerService.setCalendarPickerObj(eventObj);
    }

    updateCalendarEvent(): void {
        const colorObj = this.eventForm.get('color').value;
        const metaObj = this.eventForm.get('meta').value;
        const objectId: ObjectId = {$oid: this.event.id + ''};
        let calEventType: string;
        if (this.page === this.pageType.HOLIDAY) {
            calEventType = CalendarEventEnums.HOLIDAY;
        }
        const eventObj: CalendarEventDB = {
            _id: objectId,
            // allDay: this.eventForm.get('allDay').value, 
            start: this.eventForm.get('start').value, 
            end: this.eventForm.get('end').value,
            title: this.eventForm.get('title').value, 
            description: metaObj.notes, 
            noOfDayNotification: this.eventForm.get('noOfDayNotification').value,
            restricted: this.eventForm.get('restricted').value, 
            notifyEmployee: this.eventForm.get('notifyEmp').value,
            primaryColor: colorObj.primary, 
            secondaryColor: colorObj.secondary,
            location: metaObj.location,
            type: calEventType,
            calendarEventId: this.event.calendarEventId
        };
        this.isUpdateCall = true;
        // console.log('===============event obj update==============', eventObj);
        this.calendarPickerService.setCalendarPickerObj(eventObj);
    }

    createEventForm(): FormGroup
    {
        this.startTime = this.getDateTime(this.event.start).time;
        this.endTime = this.getDateTime(this.event.end).time;
        return new FormGroup({
            title : new FormControl({value: this.event.title, disabled: this.isViewOnly ? true : false }),
            start : new FormControl({value: this.event.start, disabled: this.isViewOnly ? true : false }),
            end   : new FormControl({value: this.event.end, disabled: this.isViewOnly ? true : false }),
            restricted: new FormControl({value: this.event.restricted, disabled: this.isViewOnly ? true : false}),
            notifyEmp: new FormControl({value: this.event.notifyEmployee, disabled: this.isViewOnly ? true : false}),
            noOfDayNotification: new FormControl({value: this.event.noOfDayNotification, disabled: this.isViewOnly ? true : false}),
            color : this._formBuilder.group({
                primary  : new FormControl({value: this.event.color.primary, disabled: this.isViewOnly ? true : false }),
                secondary: new FormControl({value: this.event.color.secondary, disabled: this.isViewOnly ? true : false })
            }),
            meta  :
                this._formBuilder.group({
                    location: new FormControl({value: this.event.meta.location, disabled: this.isViewOnly ? true : false }),
                    notes   : new FormControl({value: this.event.meta.notes, disabled: this.isViewOnly ? true : false })
                })
        });
    }

    startTimeChange(): void {
        const sDate: Date = new Date(this.eventForm.controls['start'].value);
        if (sDate !== null && sDate !== undefined) {
            const parsedTime: string[] = this.startTime.split(':');
            sDate.setHours(parseInt(parsedTime[0], 10));
            sDate.setMinutes(parseInt(parsedTime[1], 10));
        }
        this.eventForm.controls['start'].setValue(sDate);

    }

    endTimeChange(): void {
        const eDate: Date = new Date(this.eventForm.controls['end'].value);
        if (eDate !== null && eDate !== undefined) {
            const parsedTime: string[] = this.endTime.split(':');
            eDate.setHours(parseInt(parsedTime[0], 10));
            eDate.setMinutes(parseInt(parsedTime[1], 10));
        }
        this.eventForm.controls['end'].setValue(eDate);
    }

    getDateTime(date: Date): DateTime {
        let tempTime = '';
        if ((date.getHours() + '').length === 1) {
            tempTime = '0' + date.getHours();
        } else {
            tempTime = date.getHours() + '';
        }

        if ((date.getMinutes() + '').length === 1) {
            tempTime = tempTime + ':0' + date.getMinutes();
        } else {
            tempTime = tempTime + ':' + date.getMinutes();
        }
        const dateTime: DateTime = {
            date: date.getDate() + '-' + date.getMonth() + 1 + '-' + date.getFullYear(),
            time: tempTime
        };
        return dateTime;
    }

}

export interface DateTime {
    date: string;
    time: string;
}
