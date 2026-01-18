import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'app/main/angular-material-elements/material.module';
import { SeatLayoutComponent } from './seat-layout.component';
import { FlexModule } from '@angular/flex-layout';
import { FuseSharedModule } from '@fuse/shared.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [SeatLayoutComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    FuseSharedModule,
    FlexModule,
    TranslateModule
  ],
  exports: [SeatLayoutComponent],
  entryComponents: [SeatLayoutComponent]
})
export class SeatLayoutModule { }
