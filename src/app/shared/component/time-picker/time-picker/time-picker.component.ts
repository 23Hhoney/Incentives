import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss']
})
export class TimePickerComponent implements OnInit {

    @Input() time = undefined;
    @Input() containerClass = '';
    @Input() fieldClass = 'wth';
    @Input() viewClass = '';

    /* placeholder */
    @Input() placeholder = 'Select time';

    /* for clear icon*/
    @Input() showClear = true;

    /* for label */
    @Input()  showLabelName = true;
    @Input() labelName = '';

    /* errorLabel */
    @Input() isRequired = true;
    @Input() showError = true;
    @Input() errorMessage = 'Time is required';

    @Input() disabled = false;
    

    /* time format; default time format 12 hr; use 24 for 24hr format */
    @Input() format = 12;
    @Output() emitTime = new EventEmitter<any>(); 
    constructor() { }

    ngOnInit(): void {
    }

    updateTime(event): void {
        this.time = event;
        // console.log(this.time, event);
        this.emitTime.emit(this.time);
    }

    /* clear time value */
    clearTime(): void {
        this.time = undefined;
        this.emitTime.emit(this.time);
    }
}
