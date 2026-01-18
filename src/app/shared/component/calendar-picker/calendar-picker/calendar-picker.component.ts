import { Component, OnInit, ViewEncapsulation, Input, OnChanges, SimpleChange, OnDestroy, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { CalendarEventAction, CalendarEvent, CalendarMonthViewDay, CalendarEventTimesChangedEvent } from 'angular-calendar';
import { MatDialogRef, MatDialog, MatSidenav } from '@angular/material';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { Subject } from 'rxjs';
import { CalendarService } from 'app/main/apps/calendar/calendar.service';
import { startOfDay, isSameMonth, isSameDay } from 'date-fns';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { CalendarEventModel } from 'app/main/apps/calendar/event.model';
import { CalendarModalComponent } from '../calendar-modal/calendar-modal.component';
import { ConfirmationDialogComponent, ConfirmDialogData } from '../../modal/confirmation-dialog/confirmation-dialog.component';
import { CalendarPickerEvent, DateTime, PageEnums, CalendarEventEnums } from '../calendar-picker-contract';
import { CalendarPickerService } from './calendar-picker.service';
import { CalendarEventDB } from 'app/main/contracts/Calendar/calendar.CalendarEvent.model';
import { ObjectId } from 'app/main/contracts/master-data/master.ObjectId.model';
import { MatColors } from '@fuse/mat-colors';
import { NotificationService } from 'app/shared/notification/notification.service';
import { SelectLabelOption, SelectReturn, SelectedData } from '../../applicable-select/applicable-select-contract';
import { Department } from 'app/main/contracts/Hris/hris.Department.model';
import { ShiftSimple } from 'app/main/contracts/Hris/hris.ShiftSimple.model';
import { LocationVO } from 'app/main/contracts/master-data/master.Location.model';

@Component({
  selector: 'app-calendar-picker',
  templateUrl: './calendar-picker.component.html',
  styleUrls: ['./calendar-picker.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class CalendarPickerComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {

    @Input() pageTitle: string;
    @Input() holidayList = [];
    actions: CalendarEventAction[];
    activeDayIsOpen: boolean;
    // confirmDialogRef: MatDialogRef<ConfirmationDialogComponent>;
    dialogRef: any;
    events: CalendarPickerEvent[] = [];
    @Input() data: any[];
    refresh: Subject<any> = new Subject();
    selectedDay: any;
    @Input() view = 'week';
    viewDate: Date;

    /* time related input */
    @Input() dayStartHour = 0;
    @Input() dayStartMinute = 0;
    @Input() dayEndHour = 23;
    @Input() dayEndMinute = 59;

    /* add button */
    @Input() isAddBtn = false;
    @Input() isViewOnly: boolean;

    /* behaviour related specific screen */
    @Input() page: string;

    /* data manipulation */
    // calendarEventObj: Holiday = {} as Holiday;
    startTime: string;
    endTime: string;
    event: CalendarPickerEvent = {
        color : {
            primary  : '',
            secondary: ''
        }
    } as CalendarPickerEvent;
    sidenavWidth = 50;
    listWidth = 30;
    eventForm: FormGroup;
    presetColors = MatColors.presets;
    pageType = PageEnums;
    sliderTitle = '';
    action: string;
    @Output() emitEventData = new EventEmitter<any>(); 
    @Output() emitAction = new EventEmitter<any>();
    eventBackRes;
    eventModelRes;
    // isUpdateCall: boolean;
    eventIndex;
    selectedEvent;
    @ViewChild('sidenav') sidenav: MatSidenav;
    @Input() applicableFor: SelectLabelOption[] = [];
    applicableForReplica: SelectLabelOption[] = [];
    updatedApplicable: SelectReturn;
    shiftList: ShiftSimple[] = [];
    departList: Department[] = [];
    locationList: LocationVO[] = [];
    startDate: Date;
    endDate: Date;
    addBtnTitle = 'Add Event';

    constructor(private _matDialog: MatDialog, private _formBuilder: FormBuilder,
        private notificationService: NotificationService,
        private _calendarService: CalendarService, private calendarPickerService: CalendarPickerService ) {
             // Set the defaults
            this.view = 'month';
            this.viewDate = new Date();
            this.activeDayIsOpen = true;
            this.selectedDay = {date: startOfDay(new Date())};
    
            this.actions = this.getActions();
    
            /**
             * Get events from service/server
             */
            // this.setEvents();
    }

    ngOnInit(): void {
        console.log('holidayList **', this.holidayList);
        if (this.page === this.pageType.HOLIDAY) {
            this.addBtnTitle = 'Add Holiday';
        } else if (this.page === this.pageType.EVENT) {
            this.addBtnTitle = 'Add Event';
        }
        this.eventForm = this._formBuilder.group({
            title : '',
            start : new Date(),
            end   : new Date(),
            restricted: false,
            notifyEmp: false,
            noOfDayNotification: null,
            color : this._formBuilder.group({
                primary  : '',
                secondary: ''
            }),
            meta  :
                this._formBuilder.group({
                    location: null,
                    notes   : ''
                }),
            giftRequire: false,
            bannerRequire: false,
            infraRequire: false,
            manpowerRequire: false,
            pampletsRequire: false,
            refreshmentRequire: false,
            venueRequire: false,
            otherRequire: false,
            otherRequirement: ''
        });
        this.refresh.subscribe(updateDB => {
            if ( updateDB )
            {
                this._calendarService.updateEvents(this.events);
            }
        });
        this.eventModelRes = this.calendarPickerService.getCalendarEventModel().subscribe(
            obj => {
                if (obj !== undefined) {
                    this.event = obj;
                }
            }
        );
        this.eventBackRes = this.calendarPickerService.getCalendarEventBackRes().subscribe(
            obj => {
                if (obj !== undefined) {
                    if (obj === 'Success') {
                        if (this.action === 'Edit') {
                            this.notificationService.successTopRight('Data successfully updated.');
                            this.updateEvent('save');
                        } else if (this.action === 'Add') {
                            this.notificationService.successTopRight('Data successfully saved.');
                            this.addNewEvent();
                        } else if (this.action === 'Delete') {
                            this.notificationService.successTopRight('Data successfully deleted.');
                            this.delete();
                        }
                    } else if (obj === 'Failed') {
                        this.notificationService.successTopRight('Data not saved.');
                    }
                }
            }
        );
        /* this._calendarService.onEventsUpdated.subscribe(events => {
            this.setEvents();
            this.refresh.next();
        }); */

    }

    ngOnChanges(changes: {[propertyName: string]: SimpleChange}): void {
        if (this.data !== undefined) {
            if (changes['data']) {
                // debugger;
                this.setEvents();
            }
        }
        if (this.applicableFor !== undefined) {
            if (changes['applicableFor']) {
                this.applicableForReplica = [];
                this.applicableFor.forEach(obj => {
                    this.applicableForReplica.push({
                        label: obj.label,
                        selected: obj.selected,
                        options: obj.options
                    });
                });
            }
        }
    }

    ngAfterViewInit(): void {
        const user = JSON.parse(sessionStorage.getItem('userLogin'));
        this.calendarPickerService.getLocaiton(user.orgId).subscribe(data1 => {
            this.locationList = data1;
        });
    }

    ngOnDestroy(): void {
        this.eventBackRes.unsubscribe();
        this.eventModelRes.unsubscribe();
        this.calendarPickerService.setCalendarEventModel(undefined);
        this.calendarPickerService.setCalendarEventBackRes(undefined);
    }

    getActions(): CalendarEventAction[] {
        let actionReq: CalendarEventAction[] = [];
        if (this.isViewOnly) {
            actionReq = [
                
                {
                    label  : '<i class="material-icons s-16">visibility</i>',
                    onClick: ({event}: { event: CalendarEvent }): void => {
                        this.editEvent('Edit', event); this.sidenav.toggle();
                    }
                },
            ];
        } else {
            actionReq = [
                
                {
                    label  : '<i class="material-icons s-16">edit</i>',
                    onClick: ({event}: { event: CalendarEvent }): void => {
                        this.editEvent('Edit', event); this.sidenav.toggle();
                    }
                },
                {
                    label  : '<i class="material-icons s-16">delete</i>',
                    onClick: ({event}: { event: CalendarEvent }): void => {
                        this.deleteEvent(event);
                    }
                }
            ];
        }

        return actionReq;
    }

    /**
     * Set events
     */
    setEvents(): void
    {
        if (this.events !== undefined) {
            this.events = this.data.map(item => {
                item.actions = this.actions;
                return new CalendarEventModel(item);
            });
        }
        // console.log('============event============', this.events);
    }

    /**
     * Before View Renderer
     *
     * @param {any} header
     * @param {any} body
     */
    beforeMonthViewRender({header, body}): void
    {
        /**
         * Get the selected day
         */
        const _selectedDay = body.find((_day) => {
            return _day.date.getTime() === this.selectedDay.date.getTime();
        });

        if ( _selectedDay )
        {
            /**
             * Set selected day style
             * @type {string}
             */
            _selectedDay.cssClass = 'cal-selected';
        }

    }


    /**
     * Day clicked
     *
     * @param {MonthViewDay} day
     */
    dayClicked(day: CalendarMonthViewDay): void
    {
        const date: Date = day.date;
        const events: CalendarEvent[] = day.events;

        if ( isSameMonth(date, this.viewDate) )
        {
            if ( (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0 )
            {
                this.activeDayIsOpen = false;
            }
            else
            {
                this.activeDayIsOpen = true;
                this.viewDate = date;
            }
        }
        this.selectedDay = day;
        this.refresh.next();
    }

    /**
     * Event times changed
     * Event dropped or resized
     *
     * @param {CalendarEvent} event
     * @param {Date} newStart
     * @param {Date} newEnd
     */
    eventTimesChanged({event, newStart, newEnd}: CalendarEventTimesChangedEvent): void
    {
        event.start = newStart;
        event.end = newEnd;
        // console.warn('Dropped or resized', event);
        this.refresh.next(true);
    }

    /**
     * Delete Event
     *
     * @param event
     */
    deleteEvent(event): void
    {
        // console.log('==========log here====22======', event);
        this.selectedEvent = event;
        this.event = event;
        this.eventIndex = this.events.indexOf(event);
        this.action = 'Delete';
        const dialogRef = this._matDialog.open(ConfirmationDialogComponent,
            {
              panelClass: 'mail-compose-dialog',
              data : {
                title: 'Confimation Dialog',
                message: 'Are you sure to delete the calender event?',
                closeBtnLabel: 'No',
                confirmBtnLabel: 'Yes'
              } as ConfirmDialogData
            });
        dialogRef.afterClosed().subscribe(data => {
            if ( data )
            {
                this.deleteCalendarEvent();
            }
        });

    }

    delete(): void {
        this.events.splice(this.eventIndex, 1);
        this.refresh.next(true);
    }

    /**
     * Edit Event
     *
     * @param {string} action
     * @param {CalendarEvent} event
     */
    editEvent(action: string, event: any): void
    {
        this.action = action;
        this.eventIndex = this.events.indexOf(event);
        this.selectedEvent = event;
        if (this.page === this.pageType.HOLIDAY) {
            this.sliderTitle = 'Edit Holiday';
        } else if (this.page === this.pageType.EVENT) {
            this.sliderTitle = 'Edit Event';
        }
        this.event = event;
        // console.log('==========log here====11======', event);
        this.eventForm = this.createEventForm();
        this.manageApplicableFor();
        
        /* this.dialogRef = this._matDialog.open(CalendarModalComponent, {
            panelClass: 'event-form-dialog',
            data      : {
                event : event,
                action: action,
                isViewOnly: this.isViewOnly,
                page  : this.page
            }
        });
        if (!this.isViewOnly) {
            this.dialogRef.afterClosed()
            .subscribe(response => {
                if ( !response )
                {
                    return;
                }
                const actionType: string = response[0];
                const formData: FormGroup = response[1];
                switch ( actionType )
                {
                   
                    case 'save':

                        this.events[this.eventIndex] = Object.assign(this.events[this.eventIndex], formData.getRawValue());
                        this.refresh.next(true);

                        break;
                    
                    case 'delete':

                        this.deleteEvent(event);

                        break;
                }
            });
        }   */
    }

    updateEvent(type): void {
        const actionType: string = type;
        const formData: FormGroup = this.eventForm;
        switch ( actionType )
        {
            
            case 'save':
                this.events[this.eventIndex] = Object.assign(this.events[this.eventIndex], formData.getRawValue());
                const updatedIdList: number[] = [];
                this.updatedApplicable.data.forEach(obj => {
                    updatedIdList.push(obj.id);
                });
                this.events[this.eventIndex].applicableFor = {type: this.updatedApplicable.type, idList: updatedIdList};
                this.refresh.next(true);

                break;
            
            case 'delete':

                this.deleteEvent(this.selectedEvent);

                break;
        }
        this.sidenav.toggle();
    }

    /**
     * Add Event
     */
    addEvent(): void
    {
        /* this.dialogRef = this._matDialog.open(CalendarModalComponent, {
            panelClass: 'event-form-dialog',
            data      : {
                action: 'new',
                date  : this.selectedDay.date,
                page  : this.page
            }
        });
        this.dialogRef.afterClosed()
            .subscribe((response: FormGroup) => {
                if ( !response )
                {
                    return;
                }
                const newEvent = response.getRawValue();
                newEvent.actions = this.actions;
                this.events.push(newEvent);
                this.refresh.next(true);
        }); */
        this.action = 'Add';
        this.initializeApplicableFor();
        if (this.page === this.pageType.HOLIDAY) {
            this.sliderTitle = 'Add New Holiday';
        } else if (this.page === this.pageType.EVENT) {
            this.sliderTitle = 'Add New Event';
        }
        this.event = new CalendarEventModel({
            start: new Date(),
            end  : new Date()
        });
        
        // console.log('==========log here==========');
        this.eventForm = this.createEventForm();
    }

    addNewEvent(): void {
        // this.eventForm = this.createEventForm();
        this.eventForm.patchValue({
            start: this.startDate,
            end: this.endDate,
            color: {
                primary  : this.event.color.primary,
                secondary: this.event.color.secondary
            }
        });
        const newEvent = this.eventForm.getRawValue();
        const updatedIdList: number[] = [];
        this.updatedApplicable.data.forEach(obj => {
            updatedIdList.push(obj.id);
        });
        newEvent.id = this.event.id; 
        newEvent.applicableFor = {type: this.updatedApplicable.type, idList: updatedIdList};
        newEvent.actions = this.actions;
        this.events.push(newEvent);
        this.refresh.next(true);
        this.sidenav.toggle();
    }


    /* methods for slider */

    createEventForm(): FormGroup
    {
        // this.startTime = this.getDateTime(this.event.start).time;
        // this.endTime = this.getDateTime(this.event.end).time;
        return new FormGroup({
            title : new FormControl({value: this.event.title, disabled: this.isViewOnly ? true : false }),
            start : new FormControl({value: this.event.start, disabled: this.isViewOnly ? true : false }),
            end   : new FormControl({value: this.event.end, disabled: this.isViewOnly ? true : false }),
            // allDay: new FormControl({value: this.event.allDay, disabled: this.isViewOnly ? true : false }),
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
                }),
            
            giftRequire: new FormControl({value: this.event.giftRequire, disabled: this.isViewOnly ? true : false }),
            bannerRequire: new FormControl({value: this.event.bannerRequire, disabled: this.isViewOnly ? true : false }),
            infraRequire: new FormControl({value: this.event.infraRequire, disabled: this.isViewOnly ? true : false }),
            manpowerRequire: new FormControl({value: this.event.manpowerRequire, disabled: this.isViewOnly ? true : false }),
            pampletsRequire: new FormControl({value: this.event.pampletsRequire, disabled: this.isViewOnly ? true : false }),
            refreshmentRequire: new FormControl({value: this.event.refreshmentRequire, disabled: this.isViewOnly ? true : false }),
            venueRequire: new FormControl({value: this.event.venueRequire, disabled: this.isViewOnly ? true : false }),
            otherRequire: new FormControl({value: this.event.otherRequire, disabled: this.isViewOnly ? true : false }),
            otherRequirement: new FormControl({value: this.event.otherRequirement, disabled: this.isViewOnly ? true : false })
        });
    }

    initializeApplicableFor(): void {
        const applicableData: SelectLabelOption[] = [];
        this.applicableFor = [] as SelectLabelOption[];
        this.applicableForReplica.forEach(obj => {
            obj.options.forEach(ele => {ele.checked  = false; });
            applicableData.push({
                label: obj.label,
                selected: obj.selected,
                options: obj.options
            });
        });
        if (applicableData[0] !== undefined) {
            applicableData[0].selected = true;
        }
        this.applicableFor = applicableData as SelectLabelOption[];
    }

    manageApplicableFor(): void {
        const applicableData: SelectLabelOption[] = [];
        this.applicableFor.forEach(obj => {
            obj.options.forEach(ele => {ele.checked  = false; });
            applicableData.push({
                label: obj.label,
                selected: obj.selected,
                options: obj.options
            });
        });
        if (this.event.applicableFor !== null && this.event.applicableFor !== undefined) {
            this.applicableFor = [] as SelectLabelOption[];
            applicableData.forEach(obj => {
                if (obj.label === this.event.applicableFor.type) {
                    obj.selected = true;
                    this.event.applicableFor.idList.forEach(ele => {
                        if (obj.options.filter(data => data.id === ele).length !== 0) {
                            obj.options.find(data => data.id === ele).checked = true;
                        }
                    });
                } else {
                    obj.selected = false;
                    obj.options.forEach(ele => {ele.checked = false; });
                }
            });
            this.applicableFor = applicableData as SelectLabelOption[];
        } else {
            this.initializeApplicableFor();
        }
        
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

    /* used to update date and time */
    updateDateTime(event): void {
        // console.log('========updated output======', event);
        this.startDate = event.startDate;
        this.endDate = event.endDate;
        this.event.start = this.startDate;
        this.event.end = this.endDate;
    }
 
    deleteCalendarEvent(): void {
        const colorObj = this.eventForm.get('color').value;
        const metaObj = this.eventForm.get('meta').value;
        const objectId: ObjectId = {$oid: this.event.id + ''};
        const updatedIdList: number[] = [];
        this.updatedApplicable.data.forEach(obj => {
            updatedIdList.push(obj.id);
        });
        let calEventType: string;
        if (this.page === PageEnums.HOLIDAY) {
            calEventType = CalendarEventEnums.HOLIDAY;
        } else if (this.page ===  PageEnums.EVENT) {
            calEventType = CalendarEventEnums.EVENT;
        }
        const eventObj: CalendarEventDB = {
            _id: objectId,
            start: this.startDate, 
            end: this.endDate,
            title: this.eventForm.get('title').value, 
            description: metaObj.notes, 
            noOfDayNotification: this.eventForm.get('noOfDayNotification').value,
            restricted: this.eventForm.get('restricted').value, 
            notifyEmployee: this.eventForm.get('notifyEmp').value,
            primaryColor: colorObj.primary, 
            secondaryColor: colorObj.secondary,
            location: metaObj.location,
            type: calEventType,
            calendarEventId: this.event.calendarEventId,
            applicableFor: {type: this.updatedApplicable.type, idList: updatedIdList},

            giftRequire: this.eventForm.get('giftRequire').value,
            bannerRequire: this.eventForm.get('bannerRequire').value,
            infraRequire: this.eventForm.get('infraRequire').value,
            manpowerRequire: this.eventForm.get('manpowerRequire').value,
            pampletsRequire: this.eventForm.get('pampletsRequire').value,
            refreshmentRequire: this.eventForm.get('refreshmentRequire').value,
            venueRequire: this.eventForm.get('venueRequire').value,
            otherRequire: this.eventForm.get('otherRequire').value,
            otherRequirement: this.eventForm.get('otherRequirement').value
        };
        this.emitAction.emit('Delete');
        this.emitEventData.emit(eventObj);
    }

    saveCalendarEvent(): void {
        const colorObj = this.eventForm.get('color').value;
        const metaObj = this.eventForm.get('meta').value;
        let calEventType: string;
        const updatedIdList: number[] = [];
        this.updatedApplicable.data.forEach(obj => {
            updatedIdList.push(obj.id);
        });
        if (this.page === PageEnums.HOLIDAY) {
            calEventType = CalendarEventEnums.HOLIDAY;
        } else if (this.page ===  PageEnums.EVENT) {
            calEventType = CalendarEventEnums.EVENT;
        }
        const eventObj: CalendarEventDB = {
            start: this.startDate, 
            end: this.endDate,
            title: this.eventForm.get('title').value, 
            description: metaObj.notes, 
            noOfDayNotification: this.eventForm.get('noOfDayNotification').value,
            restricted: this.eventForm.get('restricted').value, 
            notifyEmployee: this.eventForm.get('notifyEmp').value,
            primaryColor: colorObj.primary, 
            secondaryColor: colorObj.secondary,
            location: metaObj.location,
            type: calEventType,
            applicableFor: {type: this.updatedApplicable.type, idList: updatedIdList},

            giftRequire: this.eventForm.get('giftRequire').value,
            bannerRequire: this.eventForm.get('bannerRequire').value,
            infraRequire: this.eventForm.get('infraRequire').value,
            manpowerRequire: this.eventForm.get('manpowerRequire').value,
            pampletsRequire: this.eventForm.get('pampletsRequire').value,
            refreshmentRequire: this.eventForm.get('refreshmentRequire').value,
            venueRequire: this.eventForm.get('venueRequire').value,
            otherRequire: this.eventForm.get('otherRequire').value,
            otherRequirement: this.eventForm.get('otherRequirement').value
        };
        // console.log('===============event obj==============', eventObj, this.updatedApplicable);
        this.emitAction.emit('Add');
        this.emitEventData.emit(eventObj);
        // this.isUpdateCall = false;
        // this.calendarPickerService.setCalendarPickerObj(eventObj);
    }

    updateCalendarEvent(): void {
        const colorObj = this.eventForm.get('color').value;
        const metaObj = this.eventForm.get('meta').value;
        const objectId: ObjectId = {$oid: this.event.id + ''};
        const updatedIdList: number[] = [];
        this.updatedApplicable.data.forEach(obj => {
            updatedIdList.push(obj.id);
        });
        let calEventType: string;
        if (this.page === PageEnums.HOLIDAY) {
            calEventType = CalendarEventEnums.HOLIDAY;
        } else if (this.page ===  PageEnums.EVENT) {
            calEventType = CalendarEventEnums.EVENT;
        }
        const eventObj: CalendarEventDB = {
            _id: objectId,
            start: this.startDate, 
            end: this.endDate,
            title: this.eventForm.get('title').value, 
            description: metaObj.notes, 
            noOfDayNotification: this.eventForm.get('noOfDayNotification').value,
            restricted: this.eventForm.get('restricted').value, 
            notifyEmployee: this.eventForm.get('notifyEmp').value,
            primaryColor: colorObj.primary, 
            secondaryColor: colorObj.secondary,
            location: metaObj.location,
            type: calEventType,
            calendarEventId: this.event.calendarEventId,
            applicableFor: {type: this.updatedApplicable.type, idList: updatedIdList},

            giftRequire: this.eventForm.get('giftRequire').value,
            bannerRequire: this.eventForm.get('bannerRequire').value,
            infraRequire: this.eventForm.get('infraRequire').value,
            manpowerRequire: this.eventForm.get('manpowerRequire').value,
            pampletsRequire: this.eventForm.get('pampletsRequire').value,
            refreshmentRequire: this.eventForm.get('refreshmentRequire').value,
            venueRequire: this.eventForm.get('venueRequire').value,
            otherRequire: this.eventForm.get('otherRequire').value,
            otherRequirement: this.eventForm.get('otherRequirement').value
        };
        this.emitAction.emit('Edit');
        this.emitEventData.emit(eventObj);
        // this.isUpdateCall = true;
        // console.log('===============event obj update==============', eventObj);
        // this.calendarPickerService.setCalendarPickerObj(eventObj);
    }

}
