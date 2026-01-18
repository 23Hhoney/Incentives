import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'app/main/angular-material-elements/material.module';
import { FormsModule } from '@angular/forms';
import { FuseSharedModule } from '@fuse/shared.module';
import { FlexModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { ViewPermissionComponent } from './view-permission.component';

@NgModule({
    declarations: [ViewPermissionComponent],

    imports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        FuseSharedModule,
        FlexModule,
        TranslateModule
    ],
    exports: [ViewPermissionComponent]
})
export class ViewPermissionModule { }
