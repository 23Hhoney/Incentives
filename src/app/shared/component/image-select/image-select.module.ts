import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'app/main/angular-material-elements/material.module';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { ImageSelectComponent } from './image-select.component';

@NgModule({
    declarations: [
        ImageSelectComponent,
    ],
    imports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        FuseSharedModule,
        TranslateModule
    ],
        exports: [ImageSelectComponent],
        entryComponents: [ImageSelectComponent],
    
    })  
    
export class ImageSelectModule { }
