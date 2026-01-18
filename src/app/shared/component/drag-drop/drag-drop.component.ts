import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';

@Component({
  selector: 'app-drag-drop',
  templateUrl: './drag-drop.component.html',
  styleUrls: ['./drag-drop.component.scss']
})
export class DragDropComponent implements OnInit, OnChanges {
  @Input() fileData: any[];
  dragGroup: FormGroup;
  url = '';
  urls = [];
  selectedFile: File;
  fileList: File[] = [];
  listOfFiles: any[] = [];
  j: number;
  k = 0;
  selectedFileNew: string;
  applicationTag: boolean;
  imageTag: boolean;
  dataValue: any;
  @Output() emitOutputData = new EventEmitter<any>();
  constructor(private builder: FormBuilder, iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
      'percentage-discount',
      sanitizer.bypassSecurityTrustResourceUrl('./assets/images/logos/pdf.svg'));
  }
  ngOnInit(): void {
    this.selectedFileNew = '';
    this.applicationTag = false;
    this.imageTag = false;
    this.dragGroup = this.builder.group({
      document: ['']
    });
    console.log('urls', this.urls.length);
  }
  ngOnChanges(): void {
    console.log('fileData drop', this.fileData.length);
    if (this.fileData.length > 0){
      this.fileList = this.fileData;
    this.listOfFiles = [];
    this.urls = [];
    this.fileData.forEach(obj => {
      const ele = {
         name: obj.name,
      };
      this.listOfFiles.push(ele);
    });
    this.fileData.forEach(obj1 => {
      const ele1 = {
         name: obj1.doc
      };
      this.urls.push(ele1);
    });
    console.log('urls', this.urls);
     this.selectedFileNew = this.listOfFiles[0].name;
  }
  else {
    this.urls = [];
    this.selectedFileNew = '';
  }
  console.log('listOfFiles outside if', this.urls, this.listOfFiles);
  }

  // while file browse
  onSelectFile(event: any): void {
    // console.log('****************', event);
    const stringToSplit = event.srcElement.files[0].type;
    const x = stringToSplit.split('/');
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].size < 500000) {
        if (x[0] === 'image' || x[0] === 'application') {
          const filesAmount = event.target.files.length;
          for (let i = 0; i < filesAmount; i++) {
            const selectedFile = event.target.files[i];
            this.fileList.push(selectedFile);
            this.listOfFiles.push(selectedFile.name);
            const reader = new FileReader();
            reader.readAsDataURL(event.target.files[i]);
            reader.onload = (event: any) => {
              this.urls.push(event.target.result);
              // console.log(this.urls);
              this.url = this.urls[0];
              this.selectedFileNew = this.listOfFiles[0];
              this.dragGroup.patchValue({
                document: event.target.result
              });
            };
          }
        }
      }
      else{

      }
      //  if (x[0] === 'application') {
      //     for (this.j = 0; this.j <= event.target.files.length - 1; this.j++) {
      //       const selectedFile = event.target.files[this.j];
      //       this.fileList.push(selectedFile);
      //       this.listOfFiles.push(selectedFile.name);
      //     }
      //   }
      //   else {
      //     for (this.j = 0; this.j <= event.target.files.length - 1; this.j++) {
      //       const selectedFile = event.target.files[this.j];
      //       this.fileList.push(selectedFile);
      //       this.listOfFiles.push(selectedFile.name);
      //     }
      //   }
    }
    // console.log('list', this.listOfFiles);
  }

  // while drag and drop file
  onDragFile(files: FileList): void {
    console.log('****************', files);
    const stringToSplit = files[0].type;
    const x = stringToSplit.split('/');
    if (files && files[0]) {
      if (files[0].size < 500000) {
        if (x[0] === 'image' || x[0] === 'application') {
          const filesAmount = files.length;
          for (let i = 0; i < filesAmount; i++) {
            const selectedFile = files[i];
            this.fileList.push(selectedFile);
            this.listOfFiles.push(selectedFile.name);
            const reader = new FileReader();
            reader.readAsDataURL(files[i]);
            reader.onload = (event: any) => {
              this.urls.push(event.target.result);
              this.url = this.urls[0];
              this.selectedFileNew = this.listOfFiles[0];
              this.dragGroup.patchValue({
                document: event.target.result
              });
            };
          }
        }
      }
      else{
        
      }
      // else if (x[0] === 'application') {
      //   for (this.j = 0; this.j <= files.length - 1; this.j++) {
      //     const selectedFile = files[this.j];
      //     this.fileList.push(selectedFile);
      //     this.listOfFiles.push(selectedFile.name);
      //   }
      // }
      // else {
      //   for (this.j = 0; this.j <= files.length - 1; this.j++) {
      //     const selectedFile = files[this.j];
      //     this.fileList.push(selectedFile);
      //     this.listOfFiles.push(selectedFile.name);
      //   }
      // }
    }
  }
  next(): void {
    // this.k = this.urls.length;

    if (this.k < this.urls.length) {
      this.k++;
      this.url = this.urls[this.k];
      // console.log('urlll', this.url);
      this.selectedFileNew = this.listOfFiles[this.k].name;
    }
  }
  prev(): void {
    if (this.k >= 1) {
      this.k--;
      this.url = this.urls[this.k];
      this.selectedFileNew = this.listOfFiles[this.k].name;
    }
  }
  deleteFile(index): void {
    console.log('index', index);

    // Delete the item from fileNames list
    this.fileList.splice(index, 1);
    // delete file from FileList
    this.urls.splice(index, 1);
    this.listOfFiles.splice(index, 1);
    if (this.listOfFiles.length === 0) {
      this.selectedFileNew = '';
    }
    // console.log('list of file', this.listOfFiles.length);
    this.k--;
    this.url = this.urls[this.k];


  }
  updateData(event): void {
    // console.log('===========log 1=========file===', event);
    this.emitOutputData.emit({ fileData: this.fileList });
    // console.log('===========log 1=========file===', this.fileList);
  }

}
