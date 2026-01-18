import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MyAccountComponent } from './my-account.component';
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
import { NgChartsModule } from 'ng2-charts';
import { ModernService } from 'app/layout/layouts/horizontal/modern/modern.service';
import { AccountTransactionsService } from '../account-transactions/account-transactions.service';
import { MyAccountService } from './my-account.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DataGridModule } from 'app/shared/component/data-grid/data-grid.module';


export const routes: Route[] = [
  {
      path     : '',
      component: MyAccountComponent
  }
];

@NgModule({
  declarations: [
    MyAccountComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatIconModule,
    MatDialogModule,
    MatMenuModule,
    DataGridModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatSidenavModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    TranslocoModule,
    SharedModule,
    NgChartsModule
  ], 
  providers: [
    ModernService,
    AccountTransactionsService,
    MyAccountService,
    DatePipe
  ]
})
export class MyAccountModule { }
