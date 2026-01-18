import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SendMessagesComponent } from './send-messages.component';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from 'app/app.component';
import { SharedModule } from 'app/shared/shared.module';
import { DataGridModule } from 'app/shared/component/data-grid/data-grid.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule } from '@angular-material-components/datetime-picker';
import { NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { ViewHtmlModule } from 'app/shared/component/view-html/view-html.module';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SendMessageService } from './send-message.service';


const routes: Routes = []=[
  {
    path     : '',
   component: SendMessagesComponent,
  }
];

@NgModule({
  declarations: [SendMessagesComponent],
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
export class SendMessagesModule { }
