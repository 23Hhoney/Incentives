import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AppComponent } from 'app/app.component';
import { MatDialogRef } from '@angular/material/dialog';
import { Route, RouterModule } from '@angular/router';
import { CurriculumManagerAddEditComponent } from './curriculum-manager-add-edit.component';

export const routes: Route[] = [
  {
      path     : '',
      component: CurriculumManagerAddEditComponent
  }
];

@NgModule({
  declarations: [
    CurriculumManagerAddEditComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    CommonModule,
    ModalModule.forRoot(),
  ],
  bootstrap: [AppComponent],
     providers: [
      {
        provide: MatDialogRef,
        useValue: {}
      },
   ],
})
export class CurriculumManagerAddEditModule { }
