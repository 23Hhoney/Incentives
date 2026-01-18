import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
import { UserExportComponent } from './user-export.component';

const routes: Routes = []=[
  {
    path     : '',
   component: UserExportComponent,
  }
];

@NgModule({
  declarations: [UserExportComponent],
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
export class UserExportModule { }
