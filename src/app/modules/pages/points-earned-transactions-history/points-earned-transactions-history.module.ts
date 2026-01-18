import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PointsEarnedTransactionsHistoryComponent } from './points-earned-transactions-history.component';
import { Route, RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { DataGridModule } from 'app/shared/component/data-grid/data-grid.module';

export const routes: Route[] = [
  {
      path     : '',
      component: PointsEarnedTransactionsHistoryComponent
  }
];

@NgModule({
  declarations: [
    PointsEarnedTransactionsHistoryComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    DataGridModule
  ],
  providers: [
    DatePipe
  ]
})
export class PointsEarnedTransactionsHistoryModule { }
