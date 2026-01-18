import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountTransactionsComponent } from './account-transactions.component';
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
import { DataGridModule } from 'app/shared/component/data-grid/data-grid.module';
import { DatePickersModule } from 'app/shared/component/date-pickers/date-pickers.module';

export const routes: Route[] = [
  {
      path     : '',
      component: AccountTransactionsComponent
  }
];

@NgModule({
  declarations: [
    AccountTransactionsComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    DataGridModule,
    MatProgressBarModule,
    MatRippleModule,
    MatSidenavModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    TranslocoModule,
    DatePickersModule,
    SharedModule
  ]
})
export class AccountTransactionsModule { }
