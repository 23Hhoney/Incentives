import { Component, HostListener, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { ModernService } from './modern.service';
import { SharedService } from 'app/shared/shared-service';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { COLUMN_TYPE, DataGridColumnHeader } from 'app/shared/component/data-grid/data-grid.service';
import { NotificationService } from 'app/shared/notification/notification';
import { KohlerStudioService } from 'app/modules/LMS/kohler-studio/kohler-studio.service';
import { TrainingCourseManagerService } from 'app/modules/admin-panel/training-course-manager/training-course-manager.service';
import { HomeService } from 'app/modules/pages/home/home.service';
import { ManageWebsiteService } from 'app/modules/pages/authentication/manage-website/manage-website.service';
import { environment } from 'environments/environment';

@Component({
    selector     : 'modern-layout',
    templateUrl  : './modern.component.html',
    styleUrls: ['./modern.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ModernLayoutComponent implements OnInit, OnDestroy {
  showSearch = false;
  isScreenSmall: boolean;
  navigation: Navigation;
  manageSearchForm: FormGroup;
  columnType = COLUMN_TYPE;
  totalPages: number;
  sortDirection = '';
  loading = false
  gridColumns: DataGridColumnHeader[] =[];
  dataSource = [];
  event: { pageIndex: number; pageSize: number; };
  sortBy = '';
  formFilter: FormGroup;
  showFilter = true;
  logoTitle = null;
  dropDownValues = [
    { id: 1, value: 'Training Courses' },
    // { id: 2, value: 'Curriculum' },
    { id: 3, value: 'SKU' }
  ];
  pages = [];
  totalRecords = 0;
  currentPage = 1;
  apiRequest = {
    pageIndex: 1,
    sortBy: "",
    itemCount: 10,
    sortDirection: "",
    search: "",
    objectName: "",
    filter: []
  };
  hideNavigation = false;
  modal: any;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  userRole = '';
  shiftMenuBar = false;
  remainingPoints = 0;
  isPointLocked = false;
  unreadCount = 0;
  dialog = null;
  UserName: string;
  isHomePage = false;

  getGridSettings(): DataGridColumnHeader[] {
    return [
      {
        columnName: 'name',
        columnTitleKey: 'Name',
        columnValue: 'name',
        type: this.columnType.LINK,
        show: true,
       sort: true,
      }, 
      {
        columnName: 'startDate',
        columnTitleKey: 'Start Date',
        columnValue: 'startDate',
        type: this.columnType.DATE,
        show: true,
        sort: true,
      }, 
      {
        columnName: 'endDate',
        columnTitleKey: 'End Date',
        columnValue: 'endDate',
        type: this.columnType.DATE,
        show: true,
        sort: true,
      },
      {
        columnName: 'courseId',
        columnTitleKey: 'Course Id',
        columnValue: 'courseId',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      },
      {
        columnName: 'points',
        columnTitleKey: 'Points',
        columnValue: 'points',
        type: this.columnType.COMMANUMBER,
        show: true,
        sort: true,
      },
      {
        columnName: 'status',
        columnTitleKey: 'Status',
        columnValue: 'status',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      },
    ]
  }
  getCurriculmGridSettings(): DataGridColumnHeader[] {
    return [
     
      {
        columnName: 'name',
        columnTitleKey: 'Training Course Name',
        columnValue: 'name',
        type: this.columnType.TEXT_W_ELLIP_L,
        show: true,
       sort: true,
      }, 
      {
        columnName: 'curriculumName',
        columnTitleKey: 'Curriculum Name',
        columnValue: 'curriculumName',
        type: this.columnType.TEXT_W_ELLIP_L,
        show: true,
       sort: true,
      },
      {
        columnName: 'isActive',
        columnTitleKey: 'Status',
        columnValue: 'isActive',
        type: this.columnType.TEXT_W_ELLIP_L,
        show: true,
       sort: true,
      }, 
    ]
  }
  getSkuGridSettings(): DataGridColumnHeader[] {
    return [
      {
        columnName: 'sku',
        columnTitleKey: 'SKU',
        columnValue: 'sku',
        type: this.columnType.TEXT_W_ELLIP_L,
        show: true,
       sort: true,
      }, 
      {
        columnName: 'points',
        columnTitleKey: 'Points',
        columnValue: 'points',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      },
      {
        columnName: 'listPrice',
        columnTitleKey: 'List Price',
        columnValue: 'listPrice',
        type: this.columnType.COMMANUMBER,
        show: true,
        sort: true,
      },
      {
        columnName: 'itemName',
        columnTitleKey: 'Item Name',
        columnValue: 'itemName',
        type: this.columnType.TEXT_W_ELLIP,
        show: true,
        sort: true,
      },
      {
        columnName: 'startDate',
        columnTitleKey: 'Start Date',
        columnValue: 'startDate',
        type: this.columnType.DATE,
        show: true,
        sort: true,
      }, 
      {
        columnName: 'endDate',
        columnTitleKey: 'End Date',
        columnValue: 'endDate',
        type: this.columnType.DATE,
        show: true,
        sort: true,
      }, 
      {
        columnName: 'productLine',
        columnTitleKey: 'Product Line',
        columnValue: 'productLine',
        type: this.columnType.TEXT_W_ELLIP_L,
        show: true,
       sort: true,
      }, 
      {
        columnName: 'category',
        columnTitleKey: 'Category',
        columnValue: 'category',
        type: this.columnType.TEXT,
        show: true,
       sort: true,
      }, 
      // {
      //   columnName: 'sKuType',
      //   columnTitleKey: 'SKU Type',
      //   columnValue: 'sKuType',
      //   type: this.columnType.TEXT,
      //   show: true,
      //  sort: true,
      // }, 
      {
        columnName: 'subcategory',
        columnTitleKey: 'Sub category',
        columnValue: 'subcategory',
        type: this.columnType.TEXT,
        show: true,
       sort: true,
      }, 
    ]
  }
  localAsset = 'assets/images/kohler_logo.png';
  logoUrl = 'assets/images/kohler_logo.png';

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _matDialog: MatDialog,
    private notificationService: NotificationService,
    private _formbuilder: FormBuilder,
    private _router: Router,
    private _navigationService: NavigationService,
    private _fuseMediaWatcherService: FuseMediaWatcherService,
    private _fuseNavigationService: FuseNavigationService,
    private _service: ModernService,
    private _sharedService: SharedService,
    private matDialog: MatDialog,
    private trainingCourseService: TrainingCourseManagerService,
    private KohlerService: KohlerStudioService,
    private manageWebsiteService: ManageWebsiteService
  ) {
    this.hideNavigation = !environment.deployAdmin;
   }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for current year
   */
  get currentYear(): number {
    return new Date().getFullYear();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Check initial route and subscribe to route changes
    this.checkIfHomePage(this._router.url);
    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this._unsubscribeAll)
    ).subscribe((event: NavigationEnd) => {
      this.checkIfHomePage(event.url);
    });
    
    this.getLogoHeader();
    this.UserName=window.sessionStorage.getItem("name");
    this.gridColumns = this.getGridSettings()
    this.shiftMenuBar = window.innerWidth < 890;
    this.userRole = window.sessionStorage.getItem("usertype");
    // Subscribe to navigation data
    this._navigationService.navigation$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((navigation: Navigation) => {
        this.navigation = navigation;
      });

    // Subscribe to media changes
    this._fuseMediaWatcherService.onMediaChange$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ matchingAliases }) => {

        // Check if the screen is small
        this.isScreenSmall = !matchingAliases.includes('md');
      });
    this._sharedService._pointsModule$.subscribe((resp) => {
      if (resp !== null && resp !== undefined) {
        this.remainingPoints = JSON.parse(resp)
      } else {
        this.remainingPoints = 0;
      }
    });
    this._sharedService._isPointLocked$.subscribe((resp) => {
      this.isPointLocked = resp;
    })
    this._sharedService._notificationCount$.subscribe((resp) => {
      this.unreadCount = resp;
    })
    this.getPointsAndSalesSummaryCalculation();
    this.manageSearchForm = this._formbuilder.group({
      firstText: [''],
      secondText: [''],
      dropdownSelect: ['']
    });
  }
  formatNumberWithCommas(value: number): string {
    if (value == null) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  checkIfHomePage(url: string): void {
    this.isHomePage = url === '/dashboards' || url === '/dashboards/' || url.startsWith('/dashboards?');
  }

  getPointsAndSalesSummaryCalculation() {
    this._sharedService.setTotalPoints(0);
    const payload = { userId: sessionStorage.getItem('userId') }
    this._service.getPointsAndSalesSummaryCalculation(payload).subscribe(data => {
      if (data?.remaining_Points) {
        this._sharedService.setTotalPoints(data.remaining_Points);
        this._sharedService.setIsPointLocked(data?.isPointsLocked)
      } else {
        this._sharedService.setTotalPoints(0);
      }
    })
  }
  showPointsOnHold(modal) {
    if (this.isPointLocked && this.userRole === 'normaluser') {
      this.dialog = this.matDialog.open(modal)
    }
  }
  openW9FormPdf() {
    window.open('https://www.irs.gov/pub/irs-pdf/fw9.pdf')
  }
  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.shiftMenuBar = window.innerWidth < 890;
  }

  openServiceRequest() {
    window.open('https://kohler.service-now.com/gdp/form.do')
  }

  /**
   * Toggle navigation
   *
   * @param name
   */
  toggleNavigation(name: string): void {

    const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);

    if (navigation) {
      
      navigation.toggle();
    }
  }
  getLogoHeader() {
    this.manageWebsiteService.GetAllCMSHeader(true).subscribe((resp) => {
      if(resp && resp.length > 0) {
        this.logoUrl = resp[0].logo;
        this.logoTitle = resp[0].title;
      } else {
        this.logoUrl = this.localAsset;
        this.logoTitle = null;
      }
    });
  }

  handleRouteHome() {

    var userType = window.sessionStorage.getItem("usertype");
    // incentiveadmin lemsadmin

    if (userType == 'incentiveadmin')
      this._router.navigate(['incentive-admin-home']);
    else
      this._router.navigate(['dashboards']);

  }
  handleCancelManageTaxModal() {
    this.modal.close();
    this.manageSearchForm.reset();
  }
  handleManageTaxInformationEdit(modal) {
    this.gridColumns = this.getSkuGridSettings();
    this.loading=true;
    this.dataSource = [];
    this.pages = [];
    this.totalRecords = 0;
    this.currentPage = 1;
    this.apiRequest = {
      pageIndex: 1,
      sortBy: "skuType",
      itemCount: 10,
      sortDirection: "asc",
      search: "",
      objectName: "",
      filter: []
    };
    this._service.UserSearch(this.apiRequest, 3).subscribe(response => {
      
      response.data.results.forEach((item) => {
        this.dataSource = response.data.results;
        this.totalRecords = response.data.totalRecords;
        this.pages = response.data.pages;
        if (item.sKuType === '2') {
          item.points = '0';
        } else {
          item.points = Math.floor(item.points);
        }
        if (item.listPrice) {
          item.listPrice = parseFloat(item.listPrice).toFixed(2);
        }
        this.calculateTotalPages();
        this.loading = false;
      });
      });

    this.manageSearchForm = this._formbuilder.group({
      firstText: [''],
      secondText: [''],
      dropdownSelect: [3]
    });
    this.modal = this._matDialog.open(modal, { 
      panelClass: 'user-search',
      width: '80%'
    });
  }

  handleClear() {
    this.manageSearchForm.reset();
  }

  onTypeChange(event) {
  }
  
  handleSearch() {
    const selectedType = this.manageSearchForm.get('dropdownSelect')?.value;
    if (!selectedType) {
      this.notificationService.infoTopRight('Please select type before searching');
      return;
    }
    const searchValue = this.manageSearchForm.get('secondText')?.value;
    if (this.apiRequest.search !== searchValue) {
      this.apiRequest.pageIndex = 1;
      this.currentPage = 1;
    }
    if (selectedType === 1) {
      this.gridColumns = this.getGridSettings();
    } else if (selectedType === 2) {
      this.gridColumns = this.getCurriculmGridSettings();
    } else if (selectedType === 3) {
      this.gridColumns = this.getSkuGridSettings();
    }
  
    this.apiRequest.search = searchValue;
    this.dataSource = [];
    this.loading = true;
    this._service.UserSearch(this.apiRequest, selectedType).subscribe(response => {
      if (selectedType === 3) {
        response.data.results.forEach((item) => {
          if (item.sKuType === '2') {
            item.points = '0';
          } else {
            item.points = Math.floor(item.points);
          }
          if (item.listPrice) {
            item.listPrice = parseFloat(item.listPrice).toFixed(2);
          }
        });
      }
      this.dataSource = response.data.results;
      this.totalRecords = response.data.totalRecords;
      this.pages = response.data.pages;
      this.calculateTotalPages();
      this.loading = false;
    });
  }
  
  
  handleSortChange(event) {
    this.sortBy = event.active;
    this.sortDirection = event.direction;
    this.apiRequest.sortBy = this.sortBy;
    this.apiRequest.sortDirection = this.sortDirection.toLowerCase();
    this.handleSearch()
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalRecords / this.apiRequest.itemCount);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  handleRowClick(event: any) {
    console.log('status',event);
    this._router.navigate(['/kohler-studio-course-quiz/'+ event.item.id]); 
    if (event.item.status == "Completed") {
      this._service.getAllCourseId(event.item.id).subscribe(
        (data: any) => {
          if (data && data.length > 0) {
            this._router.navigate(["/kohler-studio-course-result", data[0].slideQuizId]);
            this.handleCancelManageTaxModal();
          }
        }
      );
    } 
    else {
      this.trainingCourseService.Getallslides(event.item.id).subscribe(data => {
        const slides = data;
        if(slides.length === 0) {
          this.notificationService.errorTopRight('No slides have been added to this course yet.')
        } else if(slides[0]?.slideName.includes('Image')) {
          this._router.navigate(["/kohler-studio-Image-course", event.item.id, slides[0]?.id]);
          this.handleCancelManageTaxModal();
        } else if(slides[0].slideName.includes('Video')) {
          this._router.navigate(["/kohler-studio-course", event.item.id, slides[0]?.id]);
          this.handleCancelManageTaxModal();
        } else if(slides[0].slideName.includes('Text')) {
          this._router.navigate(["/kohler-studio-text-course", event.item.id, slides[0]?.id]);
          this.handleCancelManageTaxModal();
        } else if(slides[0].slideName.includes('Audio')) {
          this._router.navigate(["/kohler-studio-part-course", event.item.id, slides[0]?.id]);
          this.handleCancelManageTaxModal();
        } else if(slides[0].slideName.includes('Quiz')) {
          this.KohlerService.GetAllCourseId(event.item.id).subscribe(data=>{
            if (data) {
              this._router.navigate(["/kohler-studio-course-quiz", data[0].id]);
              this.handleCancelManageTaxModal();
            }
          })
        }
      });
    }
    
  
  }
  goToCourse(courseId, status) {
    
  }
  onPageChange(pageIndex: number) {
    if (pageIndex < 1 || pageIndex > this.totalPages) return;
    this.apiRequest.pageIndex = pageIndex;
    this.currentPage = pageIndex;
    this.handleSearch();
    }

}
