import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarPickerComponent } from './calendar-picker/calendar-picker.component';
import { MaterialModule } from 'app/main/angular-material-elements/material.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { ColorPickerModule } from 'ngx-color-picker';
import { CalendarModule as AngularCalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { CalendarService } from 'app/main/apps/calendar/calendar.service';
import { CalendarModalComponent } from './calendar-modal/calendar-modal.component';
import { ConfirmationDialogModule } from '../modal/confirmation-dialog/confirmation-dialog.module';
import { CalendarPickerService } from './calendar-picker/calendar-picker.service';
import { DateRangePickerModule } from '../date-range-picker/date-range-picker.module';
import { ApplicableSelectModule } from '../applicable-select/applicable-select.module';
import { CalendarPickerViewComponent } from './calendar-picker-view/calendar-picker-view.component';
import { CalendarPickerViewService } from './calendar-picker-view/calendar-picker-view.service';

@NgModule({
  declarations: [CalendarPickerComponent, CalendarModalComponent, CalendarPickerViewComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FuseSharedModule,
    ColorPickerModule, DateRangePickerModule, ApplicableSelectModule,
    ConfirmationDialogModule,
    AngularCalendarModule.forRoot({
        provide   : DateAdapter,
        useFactory: adapterFactory
    }),
  ],
  providers: [
    CalendarService, CalendarPickerService, CalendarPickerViewService
  ],
  exports: [
      CalendarPickerComponent, CalendarPickerViewComponent
  ],
  entryComponents: [
    CalendarModalComponent, CalendarPickerViewComponent
  ]
})
export class CalendarPickerModule { }
