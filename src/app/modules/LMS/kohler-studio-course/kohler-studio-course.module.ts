import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KohlerStudioCourseComponent } from './kohler-studio-course.component';
import { Route, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { SharedModule } from 'app/shared/shared.module';
import { AppComponent } from 'app/app.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ViewHtmlModule } from 'app/shared/component/view-html/view-html.module';
import { SafeHtmlPipe } from 'app/pipes/safe-html.pipe';

export const routes: Route[] = [
  {
      path     : '',
      component: KohlerStudioCourseComponent
  }
];

@NgModule({
  declarations: [
    KohlerStudioCourseComponent
  
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
    ViewHtmlModule,
    MatRippleModule,
    MatSidenavModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatFormFieldModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatDividerModule,
    SharedModule,
    SafeHtmlPipe
  ],
  providers: [AppComponent]
})
export class KohlerStudioCourseModule { }
