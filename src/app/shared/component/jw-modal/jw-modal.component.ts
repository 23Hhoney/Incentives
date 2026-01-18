import { Component, OnInit, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { JwModalService } from './jw-modal.service';


@Component({
  selector: 'app-jw-modal',
  templateUrl: './jw-modal.component.html',
  styleUrls: ['./jw-modal.component.scss']
})
export class JwModalComponent implements OnInit {

  @Input() id: string;
  @Input() fileData: any[];
  @Output() emitData = new EventEmitter<any>();
    fileList: [];
  private element: any;

  constructor(private modalService: JwModalService, private el: ElementRef) {
      this.element = el.nativeElement;
  }

  ngOnInit(): void {
      // ensure id attribute exists
      if (!this.id) {
          return;
      }

      // move element to bottom of page (just before </body>) so it can be displayed above everything else
      document.body.appendChild(this.element);

      // close modal on background click
      this.element.addEventListener('click', el => {
          if (el.target.className === 'app-jw-modal') {
              this.close();
          }
      });

      // add self (this modal instance) to the modal service so it's accessible from controllers
      this.modalService.add(this);
      // console.log('fileData', this.fileData);
  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngOnDestroy(): void {
      this.modalService.remove(this.id);
      this.element.remove();
  }
  closeModal(id: string): void {
    this.modalService.close(id);
}

  // open modal
  open(): void {
      this.element.style.display = 'block';
      document.body.classList.add('app-jw-modal-open');
  }

  // close modal
  close(): void {
      this.element.style.display = 'none';
      document.body.classList.remove('app-jw-modal-open');
  }
  updateRange(event): void{
    // console.log('===========log 1=========file===', event);

    // this.fileList.push(this.fileData);
    this.fileData.push(event.target.files[0]);
    this.emitData.emit({fileData : this.fileData});
}  
removeFile(i): void{
    this.fileData.splice(i, 1);
}
}
