import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent {
  
  @Input() title = '';
  @Input() message = '';
  @Input() cancelBtnName = '';
  @Input() confirmBtnName = '';

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Output() confirmCall: EventEmitter<any> = new EventEmitter();

  constructor(
  ) { }

  ngOnInit(): void {
    
  }
  confirm(): void {
    this.confirmCall.emit();
  }

  
  closeCall(): void {
    this.closeModal.emit();
  }
}
