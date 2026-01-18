import { NgModule } from '@angular/core';
import { TimelineComponent } from './timeline.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'app/main/angular-material-elements/material.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { FormsModule } from '@angular/forms';
import { FlexModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [TimelineComponent],
    imports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        FuseSharedModule,
        FlexModule,
        TranslateModule
    ],
    exports: [TimelineComponent],
    entryComponents: [TimelineComponent]
})

export class TimelineModule { }
