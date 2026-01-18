import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyPerformanceComponent } from './my-performance.component';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Route, RouterModule } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { SharedModule } from 'app/shared/shared.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgChartsModule } from 'ng2-charts';
import { MyPerformanceService } from './my-performance.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export const routes: Route[] = [
  {
      path     : '',
      component: MyPerformanceComponent
  }
];

@NgModule({
  declarations: [
    MyPerformanceComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatRippleModule,
    NgxChartsModule,
    MatSidenavModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    TranslocoModule,
    SharedModule,
    NgChartsModule
  ],
  providers: [
    MyPerformanceService
  ]
})
export class MyPerformanceModule { }
