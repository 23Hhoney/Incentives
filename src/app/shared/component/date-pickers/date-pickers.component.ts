import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-date-pickers',
  templateUrl: './date-pickers.component.html',
  styleUrls: ['./date-pickers.component.scss']
})
export class DatePickersComponent implements OnInit {
  @Input() formElementName;
  @Input() label;
  @Input() formGroup;
  @Input() disabled = false;
  // @Output() onChange: EventEmitter<any> = new EventEmitter<any>();
  @Input() placeholder = '';

  @Input() isMandatory = false;
  
  constructor() { }

  ngOnInit(): void {
  }
}
