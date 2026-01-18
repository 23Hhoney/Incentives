import { Component, Input, OnInit, OnChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { LocaleConfig } from 'ngx-daterangepicker-material';
import { DateFormatCustom } from '../date-range-picker-contract';


@Component({
  selector: 'app-date-range-picker',
  templateUrl: './date-range-picker.component.html',
  styleUrls: ['./date-range-picker.component.scss']
})
export class DateRangePickerComponent implements OnInit, OnChanges {

    /* range: Range = {fromDate: new Date(), toDate: new Date()};
    options: NgxDrpOptions;
    presets: Array<PresetItem> = []; */
    @Input() startDate = new Date();
    @Input() endDate = new Date();
    @Input() containerClasses = 'width-100';
    selected: any;
    @Input() withTimePicker = false;
    @Input() label = 'Date Range';
    @Input() disabled = false;
    @Input() singlePicker = false;

    @Output() emitStartEndDate = new EventEmitter<any>();
    locale: LocaleConfig = {
        format: DateFormatCustom.DATE
    };

    constructor() { }

    ngOnInit(): void {
        if (this.withTimePicker) {
            this.locale.format = DateFormatCustom.DATE_TIME;
        } else {
            this.locale.format = DateFormatCustom.DATE;
        }
    } 
    
    ngOnChanges(changes: { [propertyName: string]: SimpleChange }): void {
        if ((this.startDate && this.endDate)) {
            if (changes['startDate'] || changes['endDate'] || changes['singlePicker']) {
                // console.log('=====data=====', this.startDate, this.endDate);
                if (this.singlePicker) {
                    this.selected = moment(this.startDate);
                } else {
                    this.selected = {startDate: moment(this.startDate), endDate: moment(this.endDate) };
                }
            }
        }
        if (changes['singlePicker']) {
            if (!(this.startDate && this.endDate)) {
                this.selected = null;
            }
        }
        if (changes['withTimePicker'] || changes['singlePicker']) {
            // console.log('===========time========', this.singlePicker);
            if (this.withTimePicker) {
                // this.locale.format = DateFormatCustom.DATE_TIME;
                this.locale = {
                    format: DateFormatCustom.DATE_TIME
                } as LocaleConfig;
            } else {
                this.locale = {
                    format: DateFormatCustom.DATE
                } as LocaleConfig;
            }
            // console.log('===========time========', this.locale);
        }
    }

    /* setupPresets(): void {

        const backDate = (numOfDays) => {
          const t = new Date();
          return new Date(t.setDate(t.getDate() - numOfDays));
        };
        
        const today = new Date();
        const yesterday = backDate(1);
        const minus7 = backDate(7);
        const minus30 = backDate(30);
        const currMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const currMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        
        this.presets =  [
          {presetLabel: 'Yesterday', range: { fromDate: yesterday, toDate: today }},
          {presetLabel: 'Last 7 Days', range: { fromDate: minus7, toDate: today }},
          {presetLabel: 'Last 30 Days', range: { fromDate: minus30, toDate: today }},
          {presetLabel: 'This Month', range: { fromDate: currMonthStart, toDate: currMonthEnd }},
          {presetLabel: 'Last Month', range: { fromDate: lastMonthStart, toDate: lastMonthEnd }}
        ];
      }*/



    updateRange(event): void{
        // console.log('===========log 1============', event);
        if (event.startDate !== null && event.endDate !== null) {
            this.emitStartEndDate.emit({startDate: event.startDate._d, endDate: event.endDate._d});
        } else if (event.startDate !== null) {
            this.emitStartEndDate.emit({startDate: event.startDate._d});
        } else if (event.endDate !== null) {
            this.emitStartEndDate.emit({endDate: event.endDate._d});
        }
    }  

}
