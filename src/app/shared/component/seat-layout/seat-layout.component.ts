import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { subMinutes } from 'date-fns';
import { Button } from '../data-grid/data-grid.service';

export interface BusInfo {
  busNumber: any;
  config: BusConfig;
  seatLayout: SeatsLayout[];
}

export interface SeatsLayout {
  rowName: string;
  seats: Seats[];
}

export interface BusConfig {
  primaryPartition: Number;
  secondaryPartition: Number;
}

export interface Seats {
  seatNumber: string;
  available: boolean;
  selected: boolean;
  occupant: any;
}

export interface DropdownData {
  id: string;
  name: string;
  class?: string;
  section?: string;
  rollnumber?: number;
  seatName?: string;
}

@Component({
  selector: 'app-seat-layout',
  templateUrl: './seat-layout.component.html',
  styleUrls: ['./seat-layout.component.scss']
})
export class SeatLayoutComponent implements OnInit {

   // vehicleNo = 'HR26AC5558';
    //vehicleNo: '';
  @Input() seatLayout: any;
  //   @Input() busConfig = 1;
  seatSelected = {
    seatNum: 0,
    seatName: '',
    available: false,
    selected: false,
    occupantId: 0,
    occupantName: '',
    isPass: false
  };
  seatDetails: any;
  student: any;
  data: any;
  @Input() haveMultiAssociation = false;
  @Input() selectPlaceHolder = 'Select';
  @Input() dropdownList: DropdownData[] = [];
  @Input() showAssignPanel: boolean;
  @Input() loading: boolean;
  @Input() vehicleNo: string;

  @Output() emitData = new EventEmitter<any>(); 

  
  constructor(public _snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }


  // STUDENT DROPDOWN CHANGE FUNCTION //
  selectStudent(student): void {
    this.student = student.value;
    this.seatDetails = student.value;
    this.seatLayout.forEach(element => {
      element.seats.forEach(data => {
        if (data.occupantId === student.value.id)
        {
          this.seatDetails = data;
        }
        if (data.seatName === this.seatSelected.seatName) {
          data.selected = false;
        }
      });
    });
    this.seatSelected = {
      seatNum: 0,
      seatName: student.value.seatName,
      available: true,
      selected: false,
      occupantId: student.value.id,
      occupantName: '',
      isPass: false
    };
  }



  // SEAT SELECTION FUNCTION //
  selectSeat(seat: any): void {

    if (this.student != null) {
      if (seat.occupantName === '' || seat.occupantName === null) {
        this.seatLayout.forEach(element => {
          element.seats.forEach(data => {
            if (data.occupantId === this.seatSelected.occupantId) {
              data.occupantName = '',
              data.occupantId = 0,
                data.available = true;
              data.selected = false;
            }
          });
        });
        this.seatSelected = seat;
        this.seatDetails = seat;
        seat.occupantName = this.student.name;
        seat.occupantId = this.student.id;
        seat.available = false;
        this.student.seatName = seat.seatName;
        seat.selected = true;
        const message = 'Seat Number ' + seat.seatName + ' assigned to ' + this.student.name;
        this._snackBar.open(message, 'Dismiss', {
          duration: 2000,
        });
        
      }
      else {
        if (seat.occupantId === this.student.id) {
          seat.occupantName = '';
          seat.occupantId = 0;
          seat.available = true;
          seat.selected = false;
          this.student.seatName = '';
          this._snackBar.open( this.student.name + ' removed from ' + seat.seatName, 'Dismiss', {
            duration: 4000,
          });
        }
        else
        {
          this._snackBar.open('A Student is already assigned to this Seat', 'Dismiss', {
            duration: 4000,
          });
        }
      }
    }
    else {
      if (this.showAssignPanel) {
      this._snackBar.open('Please select a Student', 'Dismiss', {
        duration: 4000,
      });
     }
    }

    /* if (seat.selected === false) {
       seat.selected = true;
       seat.occupantName = this.student.name;
       const message = 'Seat Number ' + seat.seatName + ' assigned to ' + this.student.name;
       this._snackBar.open(message, 'Dismiss' , {
         duration: 2000,
       });
       this.seatSelected = seat;
       this.seatDetails = seat;
     }
     else {
       seat.selected = false;
       seat.occupantName = '';
       this.seatSelected = null;
       this.seatDetails = null;
     } */

  }

    onSubmit(): void {
        const updatedLayout = [];
        this.seatLayout.forEach( obj => {
           obj.seats.forEach( seat => {
                seat.selected = false;
           });
        });
        this.seatLayout.forEach( obj => {
            updatedLayout.push({
                rowName: obj.rowName,
                rowOrder: obj.rowOrder,
                seats: obj.seats,
                vehicleId: obj.vehicleId,
                vehicleRowSeatId: obj.vehicleRowSeatId
            });
        });
        this.emitData.emit(updatedLayout);
        console.log('======emit data====', updatedLayout);
    }


}



/*
  currentSeat(): boolean {
    let mySeat = false;
    this.seatLayout.forEach(row => {
      row.seats.forEach(seat => {
        if (seat.seatName = this.student.seatName) {
          mySeat = true;
        }
      });
    });
    console.log(mySeat);
    return mySeat;
  }

*/
