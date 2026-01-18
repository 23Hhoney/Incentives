import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicableSelectComponent } from './applicable-select/applicable-select.component';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'app/main/angular-material-elements/material.module';
import { ApplicableFilterPipe } from './applicable-filter.pipe';

@NgModule({
  declarations: [
      ApplicableSelectComponent,
      ApplicableFilterPipe
  ],
  imports: [
    CommonModule, FormsModule, MaterialModule
  ],
  exports: [
      ApplicableSelectComponent
  ],
  entryComponents: [
      ApplicableSelectComponent
  ]
})
export class ApplicableSelectModule { }
