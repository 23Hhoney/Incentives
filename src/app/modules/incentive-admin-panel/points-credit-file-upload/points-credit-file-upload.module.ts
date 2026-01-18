import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { Route, RouterModule } from '@angular/router';
import { PointsCreditFileUploadComponent } from './points-credit-file-upload.component';
import { DataGridModule } from 'app/shared/component/data-grid/data-grid.module';

export const routes: Route[] = [
  {
      path     : '',
      component: PointsCreditFileUploadComponent
  }
];

@NgModule({
  declarations: [
    PointsCreditFileUploadComponent,
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
export class PointsCreditFileUploadModule { }
