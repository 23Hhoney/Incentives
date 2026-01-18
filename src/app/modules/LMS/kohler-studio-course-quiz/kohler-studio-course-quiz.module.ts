import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KohlerStudioCourseQuizComponent } from './kohler-studio-course-quiz.component';
import { Route, RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';



export const routes: Route[] = [
  {
      path     : '',
      component: KohlerStudioCourseQuizComponent
  }
];

@NgModule({
  declarations: [
    KohlerStudioCourseQuizComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    MatRippleModule,
    MatSidenavModule,
    MatRadioModule,
    MatFormFieldModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    SharedModule,
  ]
})
export class KohlerStudioCourseQuizModule { }
