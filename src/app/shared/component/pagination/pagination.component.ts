import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {
  
	@Input() pages = [1];
	@Input() pageIndex = 1;
  @Input() pageSize = 10;
  @Output() pageChange: EventEmitter<number> = new EventEmitter();
  
  getPageData(event) {
    if (event > 0 && this.pages.length >= event) {
      this.pageChange.emit(event);
    }
  }
  
}
