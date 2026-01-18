import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { Route, RouterModule } from '@angular/router';
import { DataGridModule } from 'app/shared/component/data-grid/data-grid.module';
import { ExportQueueComponent } from './export-queue.component';

export const routes: Route[] = [
  {
      path     : '',
      component: ExportQueueComponent
  }
];

@NgModule({
  declarations: [
    ExportQueueComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    DataGridModule,
  ],
  providers: [
    
    DatePipe
 ]
})
export class ExportQueueModule { }
