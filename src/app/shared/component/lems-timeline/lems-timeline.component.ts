import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-lems-timeline',
  templateUrl: './lems-timeline.component.html',
  styleUrls: ['./lems-timeline.component.scss']
})
export class LemsTimelineComponent implements OnInit {

  @Input() logs: Array<any>;
  @Output() getDetails = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    // this.logs = [
    //   { 
    //     dateTime: '2020-06-30T07:58:07.917+0000',
    //     type: 'Email',
    //     agentName: 'Sanjeev Kumar',
    //     to: 'sanjeevkumar@gmail.com',
    //     contactNo: 9810374839,
    //     caller_number: 9810374839
    //   },
    //   { 
    //     dateTime: '2020-07-29T08:43:07.917+0000',
    //     type: 'Call',
    //     agentName: 'Nitish Kumar',
    //     to: 'nitish.kumar@gmail.com',
    //     contactNo: 9810374839,
    //     caller_number: 9810374839
    //   },
    //   { 
    //     dateTime: '2020-06-22T02:15:07.917+0000',
    //     type: 'SMS',
    //     agentName: 'Sushil Sirswa',
    //     to: 'sushil.sirswa50@gmail.com',
    //     contactNo: 9810374839,
    //     caller_number: 9810374839
    //   },
    //   { 
    //     dateTime: '2020-06-20T07:57:07.917+0000',
    //     type: 'Email',
    //     agentName: 'Dinesh Yadav',
    //     to: 'dinesh.neon@gmail.com',
    //     contactNo: 9810374839,
    //     caller_number: 9810374839
    //   }
    // ];
  }

  sendDetails(obj): void {
    this.getDetails.emit(obj);
  }

}
