import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { COLUMN_TYPE, DataGridColumnHeader } from 'app/shared/component/data-grid/data-grid.service';
import { CurriculumService } from './curriculum.service';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from 'app/shared/notification/notification';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-curriculum',
  templateUrl: './curriculum.component.html',
  styleUrls: ['./curriculum.component.scss']
})
export class CurriculumComponent {
 gridColumns: DataGridColumnHeader[];
  @ViewChild('deleteDialog') deleteDialog: TemplateRef<any>;
  columnType = COLUMN_TYPE;
  loading = false;
  event: { pageIndex: number; pageSize: number; };
  sortBy = '';
  modalReference: any;
  sortDirection = '';
  totalRecords = 0;
  formFilter: FormGroup;
  selectedTab: boolean = true;
  selectedTabIndex: number = 0;
  dataSource = [
];

  apiRequest = {
    itemCount: 25,
    pageIndex: 1,
    pageLimit: 10,
    sortBy: "createDate",
    search: "",
    sortDirection: "desc",
    filter: []
  };
  pages: number[] = [];
  totalPages: number;
  deletelement: any;
  cirriculumId: any;
  currentPage = 1;

  constructor(private router: Router,
    private service: CurriculumService, 
    private _formGroup: FormBuilder, 
    private _matDialog: MatDialog,
    private route: ActivatedRoute,
    private _notificationService:NotificationService,
    private modalService: BsModalService
  ) {
    
  }

  ngOnInit(): void {
    this.gridColumns = this.getGridSettings();
   this.GetCirriculumPaginated();
  }

  
  getGridSettings(): DataGridColumnHeader[] {
    return [
      {
        columnName: 'name',
        columnTitleKey: 'Curriculum Name',
        columnValue: 'name',
        type: this.columnType.TEXT,
        show: true,
       sort: true,
      }, 
      {
        columnName: 'description',
        columnTitleKey: 'Curriculum Description',
        columnValue: 'description',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      }, 
      {
      columnName: 'action',
        columnTitleKey: 'Actions',
        columnValue: 'id',
        type: this.columnType.POPOVER,
        buttonArray: true,
        headerClass: 'width-150px',
        buttons: [
          {
            buttonAction: 'for_edit',
            icon: 'edit',
            tooltipKey: 'Edit',
            buttonClass: 'btn-color-600',
            disableBtnParam: 'disableEdit'
          },
          {
            buttonAction: 'for_language',
            icon: 'language',
            tooltipKey: 'Create Language',
            buttonClass: 'btn-color-600'
          },
        ],
        show: true,
        sort: false,
      }
    ]
  }

  handleButtonClick(event,content) {
    if (event.buttonAction === 'for_edit') {
      this.editdialog(event.item.curriculumCopyId,event.item.language,event.item.id,event.buttonAction);
    } else if (event.buttonAction === 'for_delete') {
      this.openDeletePopUp(event.item.id,content)
    }
    if (event.buttonAction === 'for_language') {
      if (event.item.languages && 
          event.item.languages.includes('English') && 
          event.item.languages.includes('Spanish') && 
          event.item.languages.includes('French')) {
          this._notificationService.errorTopRight('All three language versions are created');
          return;
      }
      this.editdialog(event.item.curriculumCopyId, event.item.language, event.item.id, event.buttonAction);
  } 

  }
  
  editdialog(event, lang,ids,buttonAction)
  {
    this.router.navigate(['/curriculum/curriculum-edit-add/'+event+'/'+lang +'/'+ids+'/'+buttonAction]
    )

  }

  openDeletePopUp(elementId: number, content: TemplateRef<any>) {
    this.deletelement = elementId;
    this.modalReference = this._matDialog.open(content, {
      data: { elementId: this.deletelement }
    });
  }

  DeleteCirriculum() {
    let object = {
      curriculumId: this.deletelement
    };
    // this.service.DeleteCirriculum(object).subscribe(data => {
    //   if (data.isSuccess) {
    //     this._notificationService.successTopRight('Deleted Successfully');
    //     this.GetCirriculumPaginated();
    //   } else {
    //     this._notificationService.errorTopRight('Cannot be deleted already assigned to some course');
    //   }
    // });
  }


  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalRecords / this.apiRequest.itemCount);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onPageChange(pageIndex: number) {
    if (pageIndex < 1 || pageIndex > this.totalPages) return;
    this.apiRequest.pageIndex = pageIndex;
    this.currentPage = pageIndex;
    this.GetCirriculumPaginated();
  }
AddCourse()
{
  this.router.navigate(['/curriculum/curriculum-edit-add']);
}

 languageNameToCode(language: string): string {
  const mappings: { [key: string]: string } = {
    'English': 'EN',
    'Spanish': 'SP',
    'French': 'FR'
  };
  return mappings[language] || language;
}
GetCirriculumPaginated() {
  this.dataSource = [];
  this.loading = true;
  this.service.CurriculumList(this.apiRequest, this.selectedTab).subscribe(data => {
    if (data && data.results) {
      this.dataSource = data.results.map(curriculum => ({
        ...curriculum,
        name: `${curriculum.name} (${curriculum.languages.map(lang => this.languageNameToCode(lang)).join(', ')})`,
        //disableEdit: curriculum.name === 'REQUIRED MONTHLY TRAINING'
      }));
      
      this.totalRecords = data.totalRecords;
      this.calculateTotalPages();
    }
    this.loading = false;
  });
}

handleSortChange(event) {
  this.apiRequest.sortBy = event.active;
  this.apiRequest.sortDirection = event.direction.toLowerCase();
  
  this.GetCirriculumPaginated();
}
onTabChanged(event: any): void {
  this.selectedTabIndex = event.index;
  this.selectedTab = this.selectedTabIndex === 0 ? true : false;
  this.GetCirriculumPaginated();
}
changePageCount(event) {
  this.apiRequest.itemCount = event;
  this.currentPage === 1
  this.GetCirriculumPaginated();
}
ApplySearch(searchValue: string, inputElement: HTMLInputElement) {
  if(searchValue === '') {
    inputElement.value = '';
  }
  this.loading = true;
  searchValue = searchValue.trim(); 
  searchValue = searchValue.toLowerCase(); 
  this.apiRequest.search = searchValue;
  this.GetCirriculumPaginated();
}
clearSearch(inputElement: HTMLInputElement) {
  inputElement.value = '';
  this.apiRequest.search = '';
  this.GetCirriculumPaginated();
}
}
