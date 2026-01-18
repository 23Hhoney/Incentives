import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurriculumEditAddComponent } from './curriculum-edit-add.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AppComponent } from 'app/app.component';
import { MatDialogRef } from '@angular/material/dialog';
import { Route, RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';



export const routes: Route[] = [
  {
      path     : '',
      component: CurriculumEditAddComponent
  }
];

@NgModule({
  declarations: [
    CurriculumEditAddComponent,
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
export class CurriculumEditAddModule { }
