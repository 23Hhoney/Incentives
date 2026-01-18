import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { KohlerStudioCourseResultComponent } from './kohler-studio-course-result.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export const routes: Route[] = [
  {
      path     : '',
      component: KohlerStudioCourseResultComponent
  }
];

@NgModule({
  declarations: [
    KohlerStudioCourseResultComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    MatRadioModule,
    MatFormFieldModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    SharedModule,
    MatProgressSpinnerModule
  ]
})
export class KohlerStudioCourseResultModule { }
