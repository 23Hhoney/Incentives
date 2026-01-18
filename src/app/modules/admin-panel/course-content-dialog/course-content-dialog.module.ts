import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DataGridModule } from 'app/shared/component/data-grid/data-grid.module';
import { SharedModule } from 'app/shared/shared.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatRippleModule } from '@angular/material/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { AppComponent } from 'app/app.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ViewHtmlModule } from 'app/shared/component/view-html/view-html.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { FilterModule } from 'app/shared/component/filter/filter.module';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { CourseContentDialogComponent } from './course-content-dialog.component';
export const routes: Route[] = [
  {
      path     : '',
      component: CourseContentDialogComponent
  }
];

@NgModule({
  declarations: [
    CourseContentDialogComponent,
   ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    ViewHtmlModule,
    MatDividerModule,
    FilterModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    MatRippleModule,
    MatSidenavModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    SharedModule,
    DataGridModule,
    MatToolbarModule,
    MatListModule,
    MatDialogModule,
    DragDropModule,
    MatToolbarModule,
    MatExpansionModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatTooltipModule,
    ReactiveFormsModule,
    CKEditorModule,
    PopoverModule,
    ModalModule.forRoot(),
    ToastrModule.forRoot({preventDuplicates: true,
      timeOut: 3000}),
  ],
  bootstrap: [AppComponent],
     providers: [
      {
        provide: MatDialogRef,
        useValue: {}
      },
   ]
})
export class CourseContentDialogModule { }
