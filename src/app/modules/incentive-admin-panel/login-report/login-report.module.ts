import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LoginReportComponent } from './login-report.component';
import { RouterModule, Routes } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { SharedModule } from 'app/shared/shared.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DateRangePickerModule } from 'app/shared/component/date-range-picker/date-range-picker.module';
import { MatIconModule } from '@angular/material/icon';
import { DataGridModule } from 'app/shared/component/data-grid/data-grid.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { AppComponent } from 'app/app.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';


const routes: Routes = []=[
  {
    path     : '',
   component: LoginReportComponent,
  }
];

@NgModule({
  declarations: [LoginReportComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatPaginatorModule,
    MatTabsModule,
    SharedModule,
    MatDialogModule,
    MatToolbarModule,
    DateRangePickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatIconModule,
    MatExpansionModule,
    MatMomentDateModule,
    MatProgressSpinnerModule,
    DataGridModule,
    ModalModule.forRoot(),
    ToastrModule.forRoot({preventDuplicates: true,
      timeOut: 3000}),
  ],
  bootstrap: [AppComponent],
     providers: [
      {
        provide: MatDialogRef,
        useValue: {}
      },
      DatePipe
   ]
})
export class LoginReportModule { }
