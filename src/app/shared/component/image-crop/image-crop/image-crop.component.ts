import { Component, OnInit, Inject, EventEmitter, Output, Input, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { TranslateService } from '@ngx-translate/core';
import { DataUpload } from 'app/main/contracts/master-data/master.DataUpload.model';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-image-crop',
  templateUrl: './image-crop.component.html',
  styleUrls: ['./image-crop.component.scss']
})
export class ImageCropComponent implements OnInit {
     vehicleImage: SafeUrl = null;
    imageChangedEvent: any = '';
    croppedImage: any = '';
    showCropper = false;
    imgsrc = '';
    isCircular = false;
    aspectRatioWidth = 1;
    aspectRatioHeight = 1;
    resizeToWidth = 250;
    title = '';

    @ViewChild(ImageCropperComponent) imageCropper: ImageCropperComponent;

    @Output() emitFile = new EventEmitter<any>(); 
    imageUpload: DataUpload = {} as DataUpload;

  constructor(@Inject(MAT_DIALOG_DATA) private data: any, public translate: TranslateService, private domSanitizer: DomSanitizer,
  public dialog: MatDialogRef<ImageCropComponent>) {}
   
  ngOnInit(): void {
    console.log('=================CropImage', this.data);
    if (this.data.title !== undefined) {
        this.title = this.data.title;
    }
    if (this.data.isCircular !== undefined ) {
        this.isCircular = this.data.isCircular;
    }
    /* if (this.data.aspectRatio !== undefined) {
        this.aspectRatio = this.data.aspectRatio;
    } */
    if (this.data.imageChangedEvent !== undefined) {
        this.imageChangedEvent = this.data.imageChangedEvent;
    }
  }

    fileChangeEvent(event: any): void {
        this.imageChangedEvent = event;

        if (event.srcElement.files) {
          this.imageUpload.isFileChanged = true;
          this.vehicleImage = this.domSanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(event.target.files[0]));
          this.imageUpload.choosedFile = event.target;

      }
    }

    imageCropped(event: ImageCroppedEvent): void {
        this.croppedImage = event.base64;
        console.log(event);
    }

    imageLoaded(event: any): void {
        this.showCropper = true;
      }
    
   
}

