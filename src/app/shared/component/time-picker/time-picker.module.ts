import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimePickerComponent } from './time-picker/time-picker.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material';
import { MaterialModule } from 'app/main/angular-material-elements/material.module';

@NgModule({
  declarations: [TimePickerComponent],
  imports: [
    CommonModule,
    NgxMaterialTimepickerModule,
    MaterialModule,
    FormsModule,
  ],
  exports: [TimePickerComponent],
  entryComponents: [TimePickerComponent]
})
export class TimePickerModule { }
