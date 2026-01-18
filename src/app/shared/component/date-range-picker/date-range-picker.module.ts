import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateRangePickerComponent } from './date-range-picker/date-range-picker.component';
import { FormsModule } from '@angular/forms';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
@NgModule({
  declarations: [DateRangePickerComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgxDaterangepickerMd.forRoot()
  ],
  exports : [
    DateRangePickerComponent
  ],
  entryComponents: [
    DateRangePickerComponent
  ]
})
export class DateRangePickerModule { }
