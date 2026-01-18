import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropComponent } from '../drag-drop.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FileDirective } from './file.directive';
import { FileDropDirective } from './file-drop.directive';
import { MaterialModule } from 'app/main/angular-material-elements/material.module';

@NgModule({
  declarations: [DragDropComponent, FileDirective, FileDropDirective],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [DragDropComponent],
  entryComponents: [DragDropComponent]
})
export class DragDropModule { }
