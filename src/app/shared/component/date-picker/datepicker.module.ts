import { NgModule } from '@angular/core';
import { DatePickerComponent } from './datepicker.component';
import { FuseSharedModule } from '../../../../@fuse/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../../main/angular-material-elements/material.module';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
@NgModule({
    declarations: [DatePickerComponent],
     imports: [
        MaterialModule, FuseSharedModule, TranslateModule,
        NgxDaterangepickerMd.forRoot()
    ],
    exports: [DatePickerComponent] ,
    entryComponents: [DatePickerComponent]
  })
  export class DatePickerModule { }