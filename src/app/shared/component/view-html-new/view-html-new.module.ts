import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { DataGridModule } from 'app/shared/component/data-grid/data-grid.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule } from '@angular-material-components/datetime-picker';
import { NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { ViewHtmlNewComponent } from './view-html-new.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

@NgModule({
  declarations: [ViewHtmlNewComponent],
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
    ViewHtmlNewComponent
  ],
  entryComponents: [
    ViewHtmlNewComponent
  ]
})
export class ViewHtmlNewModule { }
