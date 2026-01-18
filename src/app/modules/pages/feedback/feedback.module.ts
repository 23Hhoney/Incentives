import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SharedModule } from 'app/shared/shared.module';
import { ContactUsService } from './feedback.service';
import { FeedbackComponent } from './feedback.component';

export const routes: Route[] = [
  {
      path     : '',
      component: FeedbackComponent
  }
];

@NgModule({
  declarations: [
    FeedbackComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatProgressBarModule,
    SharedModule
  ],
  providers: [
    ContactUsService
  ]
})
export class FeedbackModule { }
