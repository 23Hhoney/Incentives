import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { MatDividerModule } from '@angular/material/divider';
import { ViewHtmlModule } from 'app/shared/component/view-html/view-html.module';
import { PreviewCourseComponent } from './preview-course.component';
import { SafeHtmlPipe } from 'app/pipes/safe-html.pipe';


export const routes: Route[] = [
  {
      path     : '',
      component: PreviewCourseComponent
  }
];

@NgModule({
  declarations: [
    PreviewCourseComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    MatDividerModule,
    ViewHtmlModule,
    SafeHtmlPipe
  ]
})
export class PreviewCourseModule { }
