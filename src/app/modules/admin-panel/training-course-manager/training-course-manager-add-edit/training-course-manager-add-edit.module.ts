import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { TrainingCourseManagerAddEditComponent } from './training-course-manager-add-edit.component';
import { MatSortModule } from '@angular/material/sort';
import { SharedModule } from 'app/shared/shared.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AppComponent } from 'app/app.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DateRangePickerModule } from 'app/shared/component/date-range-picker/date-range-picker.module';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ViewHtmlModule } from 'app/shared/component/view-html/view-html.module';


export const routes: Route[] = [
  {
      path     : '',
      component: TrainingCourseManagerAddEditComponent
  }
];

@NgModule({
  declarations: [
    TrainingCourseManagerAddEditComponent,
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
export class TrainingCourseManagerAddEditModule { }
