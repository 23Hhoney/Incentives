import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { DataGridModule } from 'app/shared/component/data-grid/data-grid.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule } from '@angular-material-components/datetime-picker';
import { NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { ViewHtmlComponent } from './view-html.component';

@NgModule({
  declarations: [ViewHtmlComponent],
  imports: [
    CommonModule,
    SharedModule,
    DataGridModule,
    NgxMatNativeDateModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    CKEditorModule
  ],
  exports: [
    ViewHtmlComponent
  ],
  entryComponents: [
    ViewHtmlComponent
  ]
})
export class ViewHtmlModule { }
