import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { CurriculumComponent } from './curriculum.component';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { AppComponent } from 'app/app.component';
import { DataGridModule } from 'app/shared/component/data-grid/data-grid.module';
import { SharedModule } from 'app/shared/shared.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';


export const routes: Route[] = [
  {
      path     : '',
      component: CurriculumComponent
  }
];

@NgModule({
  declarations: [
    CurriculumComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    MatRippleModule,
    MatSidenavModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    SharedModule,
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
   ]
  
})
export class CurriculumModule { }
