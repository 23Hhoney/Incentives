import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { UsersRewardsCreditReportComponent } from './users-rewards-credit-report.component';
import { RouterModule, Routes } from '@angular/router';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AppComponent } from 'app/app.component';
import { DataGridModule } from 'app/shared/component/data-grid/data-grid.module';
import { DateRangePickerModule } from 'app/shared/component/date-range-picker/date-range-picker.module';
import { SharedModule } from 'app/shared/shared.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { DatePickersModule } from 'app/shared/component/date-pickers/date-pickers.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {NativeDateAdapter} from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';


const routes: Routes = []=[
  {
    path     : '',
   component: UsersRewardsCreditReportComponent,
  }
];

@NgModule({
  declarations: [UsersRewardsCreditReportComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    DatePickersModule,
    MatPaginatorModule,
    MatTabsModule,
    SharedModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatToolbarModule,
    DateRangePickerModule,
    MatNativeDateModule,
    MatDatepickerModule,
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
      NativeDateAdapter,
      DatePipe
   ]
})
export class UsersRewardsCreditReportModule { }
