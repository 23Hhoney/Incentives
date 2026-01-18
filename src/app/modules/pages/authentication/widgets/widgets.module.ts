import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetsComponent } from './widgets.component';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgChartsModule } from 'ng2-charts';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';



@NgModule({
  declarations: [WidgetsComponent],
  imports: [
    CommonModule,
    MatIconModule,
    CdkDrag,
    FormsModule,
    CKEditorModule,
    NgChartsModule,
  ],
  exports: [
    WidgetsComponent
  ]
})
export class WidgetsModule { }
