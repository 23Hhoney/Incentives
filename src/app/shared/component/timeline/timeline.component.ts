import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit, OnChanges {

  @Input() timelineData: any;
  @Output() timeline = new EventEmitter();
  @Input() loading: boolean;

  action: boolean;
  remarks = '';
  amountDue = 0;
  timelineGroup: FormGroup;
  constructor(private _builder: FormBuilder) { }

  ngOnInit(): void {
    // this.timelineGroup = this._builder.group({
    //   remarks: ''
    // });
    // this.clearCreaLeaValidator();
  }

  // clearCreaLeaValidator(): void {
  //   this.timelineGroup.controls['remarks'].clearValidators();
  // }

  // addcreLeaValidator(): void {
  //   this.timelineGroup.controls['remarks'].setValidators(Validators.required);
  //   this.timelineGroup.controls['remarks'].updateValueAndValidity();
  // }

  ngOnChanges(changes: SimpleChanges): void {
  }

  setConstraints(): void {
    for (let i = 0; i <= this.timelineData.length; i++) {
      if (this.timelineData[i].status === false) {
        for (let j = i + 1; j <= this.timelineData.length; j++) {
          this.timelineData[j].currentUser = false;
        }
      }
    }
  }

  callParent(action: string, employeeId): void {
    
    if (action === 'reject') {
      // this.addcreLeaValidator();
      this.action = false;
      //if (this.timelineGroup.valid){
        console.log('reject');
        const result = {
          action: this.action,
          employeeId: employeeId,
          remarks: this.remarks,
          amountDue: this.amountDue
        };
        this.timeline.emit(result);
     // }
    } else if (action === 'approve') {
      this.action = true;
      console.log('approve');
      const result = {
      action: this.action,
      employeeId: employeeId,
      remarks: this.remarks,
      amountDue: this.amountDue
    };
    this.timeline.emit(result);
    }
    
  }


}
