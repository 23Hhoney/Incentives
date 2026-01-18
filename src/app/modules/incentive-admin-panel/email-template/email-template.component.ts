import { Component, TemplateRef } from '@angular/core';
import { COLUMN_TYPE, DataGridColumnHeader } from 'app/shared/component/data-grid/data-grid.service';
import { EmailTemplateService } from './email-template.service';
import { NotificationService } from 'app/shared/notification/notification';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-email-template',
  templateUrl: './email-template.component.html',
  styleUrls: ['./email-template.component.scss']
})
export class EmailTemplateComponent {
  gridColumnsTab1: DataGridColumnHeader[];
  sortDirection = '';
  columnType = COLUMN_TYPE;
  event: { pageIndex: number; pageSize: number; };
  totalRecords = 0;
  userTotalRecords = 0;
  loading=false;
  dataSourceTab1 = [];
  filteredDataList=[];
  currentPage = 1;
  pageIndex = 1;
  searchValue = '';
  sortBy = '';
  totalPages: number;
  pages: number[] = [];
  apiRequest = {
    pageIndex: 1,
    sortBy: "createDate",
    itemCount: 25,
    sortDirection: "desc",
    search: "",
    objectName: "",
    filter: [
    ]
  };
  showPdf: boolean = false;
  iframeSrc: SafeResourceUrl;



  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private service: EmailTemplateService,
    private _router: Router,
    private _matDialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {
    this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl('assets/email-tempate-keys.pdf');
  }

  ngOnInit(){
    this.gridColumnsTab1 = this.getGridSettingsTab1();
    this.sortBy = this.apiRequest.sortBy;
    this.EmailTemplateList();
    // this.initializeMessageForm();
  }
  routeToPdf() {
    this.showPdf = true; 
  }
  backToTable() {
    this.showPdf = false;
  }
  getGridSettingsTab1(): DataGridColumnHeader[] {
    return [
      {
        columnName: 'edit',
        columnTitleKey: 'Edit',
        columnValue: 'id',
        type: this.columnType.BUTTON,
        button: {
          buttonAction: 'for_edit',
          icon: 'edit',
          tooltipKey: 'edit',
          buttonClass: 'btn-color-600',
        },
        show: true,
        sort: false,
      },
      {
        columnName: 'view',
        columnTitleKey: 'Preview Template',
        columnValue: 'view',
        type: this.columnType.BUTTON,
        button: {
          buttonAction: 'for_view',
          icon: 'heroicons_solid:eye',
          tooltipKey: 'Preview template',
          isIconSvg: true,
          buttonClass: 'btn-color-600',
        },
        show: true,
        sort: false,
      },
      { columnName: 'name', columnTitleKey: 'Template Name', columnValue: 'name', type: this.columnType.TEXT, show: true, sort: true },
      { columnName: 'EmailFrom', columnTitleKey: 'Email From', columnValue: 'emailFrom', type: this.columnType.TEXT, show: true, sort: true },
      // { columnName: 'EmailBcc', columnTitleKey: 'Email Bcc', columnValue: 'emailBcc', type: this.columnType.TEXT, show: true, sort: true },
      { columnName: 'subject', columnTitleKey: 'Subject', columnValue: 'subject', type: this.columnType.TEXT, show: true, sort: true },

      
    ];
  }
  ApplySearch(searchValue: string) {
    searchValue = searchValue.trim().toLowerCase();
    this.searchValue = searchValue;
    
    if (this.searchValue.length) {
      this.filteredDataList = this.dataSourceTab1.filter(item => {
        return (item?.fileName?.toLowerCase().includes(this.searchValue) ||
                item?.subject?.toLowerCase().includes(this.searchValue));
      });
    } else {
      this.filteredDataList = this.dataSourceTab1;
    }
  }
  
  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalRecords / this.apiRequest.itemCount);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onPageChange(pageIndex: number) {
    if (pageIndex < 1 || pageIndex > this.totalPages) return;
    this.apiRequest.pageIndex = pageIndex;
    this.pageIndex = pageIndex;
    this.EmailTemplateList();
  }

  EmailTemplateList() {
    this.dataSourceTab1 = [];
   
    this.loading = true;
  
    this.service.EmailTemplateList(this.apiRequest).subscribe(data => {
      if (data) {
        if (data.results) {
          this.dataSourceTab1 = data.results;
  
          this.totalRecords = data.totalRecords;
          this.calculateTotalPages(); 
        }
      }
      this.loading = false;
    });
  }
  applySort(event) {
    this.sortBy = event.active; 
    this.sortDirection = event.direction; 
    
    this.apiRequest.sortBy = this.sortBy;
    this.apiRequest.sortDirection = this.sortDirection.toLowerCase();
  
    this.EmailTemplateList();
  }

  changePageCount(event) {
    this.apiRequest.itemCount = event;
    this.currentPage === 1
    this.EmailTemplateList();
  }
  handleButtonClick(event) {
    if (event.buttonAction === 'for_edit') {
      this.editdialog(event.item.id);
    } 
    else if (event.buttonAction === 'for_view') {
      this._router.navigate(['/preview-email-template/'+ event.item.id], {
        queryParams: { id: event.item.id }
      });
    }

    
    // else if (event.buttonAction === 'for_view') {
    //   const currentUrl = window.location.href;
    //   let urlArray = currentUrl.split('/');
    //   const elementsToRemove = ["email-template"];
    //   urlArray = urlArray.filter(item => !elementsToRemove.includes(item));
    //   urlArray.pop(); 
  
    //   this.service.GetTemplateDetails(event.item.id).subscribe((data: any) => {
    //     if (data) {
    //       const templateId = data.id;
    //       const newPath = `preview-email-template/${templateId}`;
    //       const domain = `${window.location.protocol}//${window.location.host}`;
    //       const updatedUrl = `${domain}/${newPath}`;

    //       window.open(updatedUrl, '_blank');
    //     } else {
    //       this.notificationService.errorTopRight('No details found for the selected template.');
    //     }
    //   });
    // }
  }
  
  editdialog(event)
  {
    this._router.navigate(['/email-template/email-template-add-edit/'+ event])
  }
  viewPopUp(elementId: string, viewPopUp: TemplateRef<any>) {
    this.service.GetTemplateDetails(elementId).subscribe((data: any) => {
      console.log('check data',data)
      
    });
  }
  

  sanitizeMessage(message: string): string {
    return message; // Return the message as is to include HTML content
    }

  routeToManageEmailTemplates()
  {
    this._router.navigate(['/email-template/email-template-add-edit']);
  }

}
