import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { EmailTemplateAddEditComponent } from './email-template-add-edit.component';
import { NgxMatNativeDateModule, NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Routes, RouterModule } from '@angular/router';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { AppComponent } from 'app/app.component';
import { DataGridModule } from 'app/shared/component/data-grid/data-grid.module';
import { ViewHtmlModule } from 'app/shared/component/view-html/view-html.module';
import { SharedModule } from 'app/shared/shared.module';



const routes: Routes = []=[
  {
    path     : '',
   component: EmailTemplateAddEditComponent,
  }
];

@NgModule({
  declarations: [EmailTemplateAddEditComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    DataGridModule,
    NgxMatNativeDateModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxMatDatetimePickerModule,
    MatTooltipModule,
    ViewHtmlModule,
    NgxMatTimepickerModule,
    CKEditorModule
  ],
  bootstrap: [AppComponent],
     providers: [
      DatePipe
   ]
})

export class EmailTemplateAddEditModule { }



