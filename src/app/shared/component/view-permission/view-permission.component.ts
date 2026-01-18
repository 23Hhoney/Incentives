import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-view-permission',
  templateUrl: './view-permission.component.html',
  styleUrls: ['./view-permission.component.scss']
})
export class ViewPermissionComponent implements OnInit {

    constructor() { }


    @Input() roles: string;
    

    ngOnInit(): void {

    }

    showAll(): void{

    }


}
