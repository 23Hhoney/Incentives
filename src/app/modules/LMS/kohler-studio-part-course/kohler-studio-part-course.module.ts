import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KohlerStudioPartCourseComponent } from './kohler-studio-part-course.component';
import { Route, RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ViewHtmlModule } from 'app/shared/component/view-html/view-html.module';
import { SafeHtmlPipe } from 'app/pipes/safe-html.pipe';

export const routes: Route[] = [
  {
      path     : '',
      component: KohlerStudioPartCourseComponent
  }
];

@NgModule({
  declarations: [
    KohlerStudioPartCourseComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    ViewHtmlModule,
    SafeHtmlPipe
  ]
})
export class KohlerStudioPartCourseModule { }
