import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LemsTimelineComponent } from './lems-timeline.component';
import { MaterialModule } from 'app/main/angular-material-elements/material.module';
import { FormsModule } from '@angular/forms';
import { FuseSharedModule } from '@fuse/shared.module';
import { FlexModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [LemsTimelineComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    FuseSharedModule,
    FlexModule,
    TranslateModule
  ],
  exports: [LemsTimelineComponent]
})
export class LemsTimelineModule { }
