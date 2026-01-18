import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'app/main/angular-material-elements/material.module';
import { FormsModule } from '@angular/forms';
import { ImageCropComponent } from './image-crop/image-crop.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { FuseSharedModule } from '@fuse/shared.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    FuseSharedModule,
    ImageCropperModule,
    TranslateModule
  ],
  declarations: [
    ImageCropComponent,
  ],
  exports: [ImageCropComponent],
  entryComponents: [ImageCropComponent]
})
export class ImageCropModule { }
