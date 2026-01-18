import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SharedModule } from 'app/shared/shared.module';
import { ContactUsComponent } from './contact-us.component';

export const routes: Route[] = [
  {
      path     : '',
      component: ContactUsComponent
  }
];

@NgModule({
  declarations: [
    ContactUsComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatProgressBarModule,
    SharedModule
  ],
  providers: []
})
export class ContactUsModule { }
