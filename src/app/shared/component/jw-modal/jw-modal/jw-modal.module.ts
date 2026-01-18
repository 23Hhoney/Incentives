import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JwModalComponent } from '../jw-modal.component';
import { MaterialModule } from 'app/main/angular-material-elements/material.module';

@NgModule({
  declarations: [JwModalComponent],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [JwModalComponent]
})
export class JwModalModule { }
