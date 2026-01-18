import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-image-select',
  templateUrl: './image-select.component.html',
  styleUrls: ['./image-select.component.scss']
})
export class ImageSelectComponent implements OnInit {

    idAdd = 0;
    idEdit = 1;
    idView = 2;
    idDelete = 3;


  constructor(public dialog: MatDialogRef<ImageSelectComponent>) { }

  ngOnInit(): void {
  }

}
