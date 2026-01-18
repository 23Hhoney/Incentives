import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreviewEmailTemplateComponent } from './preview-email-template.component';
import { Route, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { AppComponent } from 'app/app.component';
import { DateRangePickerModule } from 'app/shared/component/date-range-picker/date-range-picker.module';
import { ViewHtmlModule } from 'app/shared/component/view-html/view-html.module';
import { SharedModule } from 'app/shared/shared.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';



export const routes: Route[] = [
  {
      path     : '',
      component: PreviewEmailTemplateComponent
  }
];

@NgModule({
  declarations: [
    PreviewEmailTemplateComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatTabsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatButtonModule,
    MatTableModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatSidenavModule,
    MatRadioModule,
    DateRangePickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatMomentDateModule,
    NgxMaterialTimepickerModule,
    MatCheckboxModule,
    MatDividerModule,
    MatIconModule,
    MatDialogModule,
    MatMenuModule,
    FormsModule,
    MatToolbarModule,
    MatProgressBarModule,
    ViewHtmlModule,
    MatSortModule,
    SharedModule,
    CommonModule,
    CKEditorModule,
    ModalModule.forRoot(),
  ],
  bootstrap: [AppComponent],
     providers: [
      {
        provide: MatDialogRef,
        useValue: {}
      },
   ],
})
export class PreviewEmailTemplateModule { }
