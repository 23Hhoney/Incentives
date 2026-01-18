import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange } from '@angular/core';
import { COLUMN_TYPE, DataGridColumnHeader } from './data-grid.service';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent implements OnInit, OnChanges {
  
  @Input() gridSettings: DataGridColumnHeader[];
  @Input() dataSource: any;
  @Input() loading: boolean;
  @Input() pageIndex: number = 1;
  @Input() totalRecordCount: number = 10;
  @Input() pages;
  @Input() nodataMessage: any;
  @Input() searchMessageKeyword: any = '';
  @Input() pageSize: number = 10;
  @Input() sortBy = '';
  @Input() searchKey = 'subject';
  @Input() sortDirection = '';
  @Input() enableRowClick = false;
  @Input() showPagination = true;
  @Input() t: (args: any) => void;
  copiedTableData: any;

  displayedColumns: string[];
  columnType = COLUMN_TYPE;

  @Output() fetchPageData: EventEmitter<any> = new EventEmitter<any>();
  @Output() linkClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() buttonClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() emitRecordCount: EventEmitter<any> = new EventEmitter<any>();
  @Output() checkboxClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() sortChangeClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowClick: EventEmitter<any> = new EventEmitter<any>();

  allSelected = false;
  someSelected = false;
  showActions = false;
  usertype = null;
  showAllRecords = false;
  allRecords = [5, 10, 25, 50, 100,]
  ngOnInit(): void {
    this.usertype = sessionStorage.getItem('usertype')
    this.displayedColumns = new Array();
    for (const colObj of this.gridSettings) {
      this.displayedColumns.push(colObj.columnName);
    }
  }
  
  ngOnChanges(changes: { [propertyName: string]: SimpleChange }): void {
    if (this.dataSource) {
      if (changes['gridSettings']) {
        // console.log('changed');
        this.displayedColumns = new Array();
        for (const colObj of this.gridSettings) {
          if (colObj.show)
            this.displayedColumns.push(colObj.columnName);
        }
      }
      if (changes['dataSource'] || changes['loading']) {
        this.displayedColumns = new Array();
        for (const colObj of this.gridSettings) {
          this.displayedColumns.push(colObj.columnName);
        }
      }
      if(changes['dataSource']) {
        if (this.allSelected) {
          this.dataSource.map((data) => {
            data.checked = true;
          });
          this.emitCheckboxClick(null, 'checked');
        }
        this.copiedTableData = [];
        this.copiedTableData = [...this.dataSource];
        this.searchData(this.searchMessageKeyword)
      }
    }
    if(changes['searchMessageKeyword']) {
      this.searchData(this.searchMessageKeyword)
    }
  }
  selectAllRecords(recordsCount, event) {
    event.stopPropagation();
    event.preventDefault();
    this.showAllRecords = false;
    this.totalRecordCount = recordsCount;
    this.emitRecordCount.emit(recordsCount);
  }
  searchData(keyWord) {
    this.dataSource = [];
    if(keyWord === null || keyWord === '' || keyWord === undefined) {
      this.dataSource = [...this.copiedTableData]
    } else {
      this.copiedTableData.forEach((item) => {
        if(item[this.searchKey].replace(/[ ,?`']/g, '').toString().toLowerCase().includes(keyWord.replace(/[ ,?`']/g, '').toString().toLowerCase())) {
          this.dataSource.push(item)
        } else if(item['fileName'].replace(/[ ,?`']/g, '').toString().toLowerCase().includes(keyWord.replace(/[ ,?`']/g, '').toString().toLowerCase())) {
          this.dataSource.push(item)
        }
      })
    }
  }

  getPageData(event) {
    if (event > 0 && this.pages.length >= event) {
      this.fetchPageData.emit(event);
    }
  }
  toggleActionClose() {
    this.dataSource.forEach((item) => {
      if(item && item?.open) {
        item.open = false;
      }
    })
    this.showActions = false;
  }
  formatNumberWithCommas(value: number): string {
    if (value == null) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  handleButtonClick(item, column) {
    this.buttonClick.emit({item: item, buttonAction: column.button.buttonAction});
  }

  handleButtonClickArray(item, column, index) {
    item.open = false;
    this.showActions = false;
    this.buttonClick.emit({item: item, buttonAction: column.buttonAction, index});
  }

  handleLinkClick(item) {
    this.linkClick.emit({item: item});
  }

  handleCheckBoxClick(item: any, checkboxParameter: string) {
    this.checkboxClick.emit({item: item, checkedList: this.dataSource.filter(obj => obj[checkboxParameter])});
    this.updateSelectAllState(checkboxParameter);
    this.emitCheckboxClick(item, checkboxParameter);
  }
updateSelectAllState(checkboxParameter: string) {
    const allRows = this.dataSource.filter(row => !row.disableCheckbox);
    const selectedRows = allRows.filter(row => row[checkboxParameter]);

    this.allSelected = selectedRows.length === allRows.length;
    this.someSelected = selectedRows.length > 0 && !this.allSelected;
  }
  handleRowClick(item) {
    this.rowClick.emit({item: item});
  }
  toggleAllRows(event: MatCheckboxChange, checkboxParameter: string) {
    this.allSelected = event.checked;
    this.someSelected = false;
    this.dataSource.forEach(row => {
      if (!row.disableCheckbox) {
        row[checkboxParameter] = this.allSelected;
      }
    });
    this.emitCheckboxClick(null, checkboxParameter);
  }
  emitCheckboxClick(item: any, checkboxParameter: string) {
    const checkedList = this.dataSource.filter(obj => obj[checkboxParameter]);
    this.checkboxClick.emit({ item, checkedList });
  }

  isSelectAll(columnTitleKey: string): boolean {
    return columnTitleKey.toLowerCase() === 'select all';
  }

  splitColumnTitle(columnTitleKey: string): string[] {
    return columnTitleKey.split(' ');
  }
  getFormattedDate(dateValue: any): string {
    if (!dateValue || dateValue === 'N/A') {
      return 'N/A';
    }
  
    // Ensure compatibility with Safari by converting MM-dd-yyyy to yyyy-MM-dd
    const dateParts = dateValue.split('-'); // Split by '-'
    if (dateParts.length === 3) {
      const formattedDate = `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`; // yyyy-MM-dd
      return new Date(formattedDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    }
    
    return dateValue; // Fallback in case the format isn't as expected
  }
  getFormattedName(name: string): string {
    if (!name) return '';

    // Define language replacements
    const languageMap: { [key: string]: string } = {
        'English': 'EN',
        'French': 'FR',
        'Spanish': 'SP'
    };

    // Replace the language with its abbreviation
    let formattedName = name;
    Object.keys(languageMap).forEach(lang => {
        if (name.includes(lang)) {
            formattedName = name.replace(lang, `<span class="lang-badge">${languageMap[lang]}</span>`);
        }
    });

    return formattedName;
}
}
