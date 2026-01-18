import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { EmailTemplateComponent } from './email-template.component';
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
import { SendMessageService } from '../send-messages/send-message.service';

const routes: Routes = []=[
  {
    path     : '',
   component: EmailTemplateComponent,
  }
];

@NgModule({
  declarations: [EmailTemplateComponent],
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
      DatePipe,
      SendMessageService
   ]
})

export class EmailTemplateModule { }
