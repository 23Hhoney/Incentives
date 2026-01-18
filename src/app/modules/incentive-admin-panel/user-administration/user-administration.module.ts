import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserAdministrationComponent } from './user-administration.component';
import { RouterModule, Routes } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SharedModule } from 'app/shared/shared.module';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DataGridModule } from 'app/shared/component/data-grid/data-grid.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { ToastrModule } from 'ngx-toastr';
import { AppComponent } from 'app/app.component';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatNativeDateModule } from '@angular/material/core';
import { DateRangePickerModule } from 'app/shared/component/date-range-picker/date-range-picker.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { DatePickersModule } from 'app/shared/component/date-pickers/date-pickers.module';
import { FilterModule } from 'app/shared/component/filter/filter.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';

const routes: Routes = []=[
  {
    path     : '',
   component: UserAdministrationComponent,
  }
];

@NgModule({
  declarations: [UserAdministrationComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatTabsModule,
    SharedModule,
    MatTooltipModule,
    MatDialogModule,
    MatToolbarModule,
    DateRangePickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatExpansionModule,
    MatMomentDateModule,
    DatePickersModule,
    FilterModule,
    MatProgressSpinnerModule,
    DataGridModule,
    PopoverModule.forRoot(),
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
   ]
})
export class UserAdministrationModule { }
