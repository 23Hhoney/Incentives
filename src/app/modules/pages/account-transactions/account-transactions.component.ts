import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AccountTransactionsService } from './account-transactions.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ExportExcelService } from '../excel-export-service.service';
import { COLUMN_TYPE, DataGridColumnHeader } from 'app/shared/component/data-grid/data-grid.service';
import { format } from 'date-fns';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment-timezone';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ManageWebsiteService } from '../authentication/manage-website/manage-website.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-account-transactions',
  templateUrl: './account-transactions.component.html',
  styleUrls: ['./account-transactions.component.scss']
})
export class AccountTransactionsComponent implements OnInit {
  gridColumns: DataGridColumnHeader[];
  gridColumnsView: DataGridColumnHeader[];
  manageTaxInformationForm: FormGroup;
  columnType = COLUMN_TYPE;
  loading: boolean;
  accountTransactionDetails = null;
  yearsArray = [];
  @ViewChild('transactionDetails') transactionDetails: TemplateRef<any>;
  dateProcessedFlag = true;
  dateOfSaleFlag = true;
  transactionModal: any;
  modal: any;
  isUploadingTaxInformation = false;
  status: any;
  isDownloading: boolean = false; 
  filterTags = [];
  filtersApplied: boolean;
  isExportingRedemption: boolean = false;
  isExportingCredit: boolean = false;
  isExportingAll: boolean = false;
  isExporting: boolean = false; // General loading state for the message
  selectedTransactionType: string;
  invoiceNumber: any;
  invoiceDate: any;
  transcationType: any;
  totalListPrice: any;
  totalRedemptionQuantity: any;
  totalRedemptionPoints: any;
  totalPoints: any;
  showPublishedPage = false;
  publishedPage = null;
  sectionsArray = [];
  isPreview: boolean;
  draftId: string;
  constructor(
    private service: AccountTransactionsService, 
    private _formGroup: FormBuilder, 
    private exportExcelService: ExportExcelService,
    private _matDialog: MatDialog,
    private _formbuilder: FormBuilder,
    private manageWebsiteContent: ManageWebsiteService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute
  ) {
    this.formFilter = this._formGroup.group({
      ProccesedDateStart: new FormControl(),
      ProccesedDateEnd: new FormControl(),
      SaleDateStart: new FormControl(),
      SaleDateEnd: new FormControl()
    });
    this.route.queryParamMap.subscribe(params => {
      this.isPreview = params.get('isPreview') === 'true';
      this.draftId = params.get('draftId');    

      console.log('isPreview',this.isPreview);
    });
    const startYear = 2020;
    const currentYear = new Date().getFullYear();
    this.yearsArray = [];
    for (let year = startYear; year <= currentYear; year++) {
      this.yearsArray.push(year.toString());
    }
    this.manageWebsiteContent.GetAllCMSMenu(false).subscribe((res: any[]) => {
      const filteredRes = res.filter(item => !item.menuId.startsWith('DRFT_') && item.menuId !== 'DRFT_RESTORED');
      
      filteredRes.forEach((items) => {
        if (items.menuId === 'TR') {
          this.publishedPage = items;
        }
      });
      
      if (this.draftId != null) {
        this.showPublishedPage = true;
        this.manageWebsiteContent.GetAllCMSContainer(this.draftId, false).subscribe((resp: any[]) => {
          this.sectionsArray = resp.map((section, sectionIndex) => {
            // Parse styles for all items in this section
            const parsedStylesArray = section.getAllCMSContainerViews.map(item => {
              try {
                const styles = typeof item.styles === 'string' ? JSON.parse(item.styles) : item.styles || {};
                if (typeof styles.top === 'string') styles.top = parseFloat(styles.top);
                if (typeof styles.left === 'string') styles.left = parseFloat(styles.left);
                if (typeof styles.height === 'string') styles.height = parseFloat(styles.height);
                if (typeof styles.width === 'string') styles.width = parseFloat(styles.width);
                return styles;
              } catch (e) {
                console.warn('Failed to parse styles for item', item.id, ':', e);
                return { top: 0, left: 0, height: 50, width: 100 };
              }
            });

            return {
              id: section.id,
              position: section.position !== undefined ? section.position : sectionIndex,
              height: 100,
              items: section.getAllCMSContainerViews
                .filter((items) => !(
                  (items.type === 'panel' || items.type === 'image' || items.type === 'video' || items.type === 'audio') &&
                  (!items.getAllCMSItemViews || items.getAllCMSItemViews.length === 0)
                ))
                .map((items, idx) => {
                  const parsedStyles = parsedStylesArray[idx];
                  let fitWidthData: any = {};
                  
                  try {
                    fitWidthData = items.fitWidth ? JSON.parse(items.fitWidth) : {};
                    if (typeof fitWidthData.xPercent === 'string') fitWidthData.xPercent = parseFloat(fitWidthData.xPercent);
                    if (typeof fitWidthData.yPercent === 'string') fitWidthData.yPercent = parseFloat(fitWidthData.yPercent);
                    if (typeof fitWidthData.widthPercent === 'string') fitWidthData.widthPercent = parseFloat(fitWidthData.widthPercent);
                    if (typeof fitWidthData.heightPercent === 'string') fitWidthData.heightPercent = parseFloat(fitWidthData.heightPercent);
                  } catch (e) {
                    console.warn('Failed to parse fitWidth for item', items.id, ':', e);
                  }

                  // Parse button styling
                  let buttonStyle: any = {};
                  if (items.type === 'button' && items.salesHeading) {
                    try {
                      buttonStyle = typeof items.salesHeading === 'string' ? JSON.parse(items.salesHeading) : items.salesHeading;
                    } catch (e) {
                      console.warn('Failed to parse button salesHeading for item', items.id, ':', e);
                    }
                  }

                  // Handle media URLs
                  let images: string[] = [];
                  let localVideoUrl: string | null = null;
                  let videoUrl: string | null = null;
                  let audioUrl: string | null = null;
                  let isYoutubeOrVimeo: boolean = false;
                  let autoPlay: boolean = false;
                  let loop: boolean = false;
                  let requireUserToWatch: boolean = false;
                  let textContent: string = '';
                  if (items.text) {
                    textContent = items.text;
                    if (!textContent.includes('<p>') && textContent.trim()) {
                      textContent = `<p>${textContent}</p>`;
                    }
                  } else if (items.getAllCMSItemViews?.length && items.getAllCMSItemViews[0].content) {
                    const firstItem = items.getAllCMSItemViews[0];
                    if (firstItem.type === 'text' || items.type === 'text' || items.type === 'textbox') {
                      textContent = firstItem.content;
                      if (!textContent.includes('<p>') && textContent.trim()) {
                        textContent = `<p>${textContent}</p>`;
                      }
                    }
                  }

                  const defaultLeft = idx * 20;
                  const defaultTop = 10;
                  const defaultHeight = 100;

                  return {
                    type: items.type,
                    className: items.className,
                    containerId: items.containerId,
                    id: items.id,
                    containerSize: items.containerSize || 30,
                    isVideo: items.isVideo || (videoUrl ? true : false),
                    text: textContent || items.text || '',
                    content: textContent || items.text || '',
                    selectedIndex: 0,
                    chartHeading: items.chartHeading,
                    salesHeading: items.salesHeading,
                    hyperlink: items.chartHeading || '',
                    buttonStyle: buttonStyle,
                    styles: parsedStyles,
                    xPercent: fitWidthData.xPercent ?? (parsedStyles.left != null ? parseFloat(parsedStyles.left) : defaultLeft),
                    yPercent: fitWidthData.yPercent ?? (parsedStyles.top != null ? parseFloat(parsedStyles.top) : defaultTop),
                    widthPercent: fitWidthData.widthPercent ?? (items.containerSize || 30),
                    heightPercent: fitWidthData.heightPercent ?? (parsedStyles.height || defaultHeight),
                    zIndex: fitWidthData.zindex ?? (parsedStyles.zindex || (idx + 1)),
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                    autoPlay: autoPlay,
                    loop: loop,
                    requireUserToWatch: requireUserToWatch,
                    images: images,
                    localVideoUrl: localVideoUrl,
                    videoUrl: videoUrl,
                    audioUrl: audioUrl,
                    isYoutubeOrVimeo: isYoutubeOrVimeo,
                    tempVideoUrl: !isYoutubeOrVimeo ? videoUrl : null,
                    currentIndex: 0,
                    title: (() => {
                      const bannerHeading = items.getAllCMSItemViews?.[0]?.bannerHeading;
                      if (!bannerHeading) return '';
                      
                      try {
                        const parsed = JSON.parse(bannerHeading);
                        return parsed?.title || parsed || '';
                      } catch (e) {
                        return bannerHeading;
                      }
                    })(),
                    subtitle: items.getAllCMSItemViews?.[0]?.bannerSubHeading || '',
                    buttonUrl: items.getAllCMSItemViews?.[0]?.buttonUrl || items.chartHeading || '',
                    isClickable: items.getAllCMSItemViews?.[0]?.isClickable || !!items.chartHeading,
                    getAllCMSItemViews: (items.getAllCMSItemViews || []).map((item) => {
                      let itemFitWidthData: any = {};
                      try {
                        itemFitWidthData = item.fitWidth ? JSON.parse(item.fitWidth) : {};
                      } catch (e) {
                        console.warn('Failed to parse item fitWidth for item', item.id, ':', e);
                      }
                      
                      return {
                        id: item.uploadId || item.id,
                        isVideo: item.isVideo,
                        bannerHeading: item.bannerHeading,
                        newHeadings: item.newHeadings || [],
                        uniqueId: item.uniqueId,
                        bannerSubHeading: item.bannerSubHeading,
                        videoFile: null,
                        ImageFile: null,
                        url: item.url,
                        content: item.content,
                        type: item.type,
                        panelType: item.panelType || 'image',
                        fullBleed: item.fullBleed,
                        fitWidth: item.fitWidth,
                        opacity: item.opacity,
                        autoPlay: item.autoPlay || false,
                        requireUserToWatch: item.isRequired || false,
                        buttonUrl: item.buttonUrl || '',
                        isClickable: item.isClickable || false
                      };
                    })
                  };
                })
            };
          }).sort((a, b) => {
            if (a.position === b.position) {
              return a.id.localeCompare(b.id);
            }
            return a.position - b.position;
          });

          // Fix duplicate positions
          this.sectionsArray.forEach((section, index) => {
            if (index > 0 && section.position === this.sectionsArray[index - 1].position) {
              section.position = this.sectionsArray[index - 1].position + 1;
            }
          });
        });
      } 
     else if (this.publishedPage) {
        this.showPublishedPage = true;
        this.manageWebsiteContent.GetAllCMSContainer(this.publishedPage.id, true).subscribe((resp: any[]) => {
          this.sectionsArray = resp.map((section, sectionIndex) => {
            // Parse styles for all items in this section
            const parsedStylesArray = section.getAllCMSContainerViews.map(item => {
              try {
                const styles = typeof item.styles === 'string' ? JSON.parse(item.styles) : item.styles || {};
                if (typeof styles.top === 'string') styles.top = parseFloat(styles.top);
                if (typeof styles.left === 'string') styles.left = parseFloat(styles.left);
                if (typeof styles.height === 'string') styles.height = parseFloat(styles.height);
                if (typeof styles.width === 'string') styles.width = parseFloat(styles.width);
                return styles;
              } catch (e) {
                console.warn('Failed to parse styles for item', item.id, ':', e);
                return { top: 0, left: 0, height: 50, width: 100 };
              }
            });

            return {
              id: section.id,
              position: section.position !== undefined ? section.position : sectionIndex,
              height: 100,
              items: section.getAllCMSContainerViews
                .filter((items) => !(
                  (items.type === 'panel' || items.type === 'image' || items.type === 'video' || items.type === 'audio') &&
                  (!items.getAllCMSItemViews || items.getAllCMSItemViews.length === 0)
                ))
                .map((items, idx) => {
                  const parsedStyles = parsedStylesArray[idx];
                  let fitWidthData: any = {};
                  
                  try {
                    fitWidthData = items.fitWidth ? JSON.parse(items.fitWidth) : {};
                    if (typeof fitWidthData.xPercent === 'string') fitWidthData.xPercent = parseFloat(fitWidthData.xPercent);
                    if (typeof fitWidthData.yPercent === 'string') fitWidthData.yPercent = parseFloat(fitWidthData.yPercent);
                    if (typeof fitWidthData.widthPercent === 'string') fitWidthData.widthPercent = parseFloat(fitWidthData.widthPercent);
                    if (typeof fitWidthData.heightPercent === 'string') fitWidthData.heightPercent = parseFloat(fitWidthData.heightPercent);
                  } catch (e) {
                    console.warn('Failed to parse fitWidth for item', items.id, ':', e);
                  }

                  // Parse button styling
                  let buttonStyle: any = {};
                  if (items.type === 'button' && items.salesHeading) {
                    try {
                      buttonStyle = typeof items.salesHeading === 'string' ? JSON.parse(items.salesHeading) : items.salesHeading;
                    } catch (e) {
                      console.warn('Failed to parse button salesHeading for item', items.id, ':', e);
                    }
                  }

                  // Handle media URLs
                  let images: string[] = [];
                  let localVideoUrl: string | null = null;
                  let videoUrl: string | null = null;
                  let audioUrl: string | null = null;
                  let isYoutubeOrVimeo: boolean = false;
                  let autoPlay: boolean = false;
                  let loop: boolean = false;
                  let requireUserToWatch: boolean = false;
                  let textContent: string = '';
                  if (items.text) {
                    textContent = items.text;
                    if (!textContent.includes('<p>') && textContent.trim()) {
                      textContent = `<p>${textContent}</p>`;
                    }
                  } else if (items.getAllCMSItemViews?.length && items.getAllCMSItemViews[0].content) {
                    const firstItem = items.getAllCMSItemViews[0];
                    if (firstItem.type === 'text' || items.type === 'text' || items.type === 'textbox') {
                      textContent = firstItem.content;
                      if (!textContent.includes('<p>') && textContent.trim()) {
                        textContent = `<p>${textContent}</p>`;
                      }
                    }
                  }

                  const defaultLeft = idx * 20;
                  const defaultTop = 10;
                  const defaultHeight = 100;

                  return {
                    type: items.type,
                    className: items.className,
                    containerId: items.containerId,
                    id: items.id,
                    containerSize: items.containerSize || 30,
                    isVideo: items.isVideo || (videoUrl ? true : false),
                    text: textContent || items.text || '',
                    content: textContent || items.text || '',
                    selectedIndex: 0,
                    chartHeading: items.chartHeading,
                    salesHeading: items.salesHeading,
                    hyperlink: items.chartHeading || '',
                    buttonStyle: buttonStyle,
                    styles: parsedStyles,
                    xPercent: fitWidthData.xPercent ?? (parsedStyles.left != null ? parseFloat(parsedStyles.left) : defaultLeft),
                    yPercent: fitWidthData.yPercent ?? (parsedStyles.top != null ? parseFloat(parsedStyles.top) : defaultTop),
                    widthPercent: fitWidthData.widthPercent ?? (items.containerSize || 30),
                    heightPercent: fitWidthData.heightPercent ?? (parsedStyles.height || defaultHeight),
                    zIndex: fitWidthData.zindex ?? (parsedStyles.zindex || (idx + 1)),
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                    autoPlay: autoPlay,
                    loop: loop,
                    requireUserToWatch: requireUserToWatch,
                    images: images,
                    localVideoUrl: localVideoUrl,
                    videoUrl: videoUrl,
                    audioUrl: audioUrl,
                    isYoutubeOrVimeo: isYoutubeOrVimeo,
                    tempVideoUrl: !isYoutubeOrVimeo ? videoUrl : null,
                    currentIndex: 0,
                    title: (() => {
                      const bannerHeading = items.getAllCMSItemViews?.[0]?.bannerHeading;
                      if (!bannerHeading) return '';
                      
                      try {
                        const parsed = JSON.parse(bannerHeading);
                        return parsed?.title || parsed || '';
                      } catch (e) {
                        return bannerHeading;
                      }
                    })(),
                    subtitle: items.getAllCMSItemViews?.[0]?.bannerSubHeading || '',
                    buttonUrl: items.getAllCMSItemViews?.[0]?.buttonUrl || items.chartHeading || '',
                    isClickable: items.getAllCMSItemViews?.[0]?.isClickable || !!items.chartHeading,
                    getAllCMSItemViews: (items.getAllCMSItemViews || []).map((item) => {
                      let itemFitWidthData: any = {};
                      try {
                        itemFitWidthData = item.fitWidth ? JSON.parse(item.fitWidth) : {};
                      } catch (e) {
                        console.warn('Failed to parse item fitWidth for item', item.id, ':', e);
                      }
                      
                      return {
                        id: item.uploadId || item.id,
                        isVideo: item.isVideo,
                        bannerHeading: item.bannerHeading,
                        newHeadings: item.newHeadings || [],
                        uniqueId: item.uniqueId,
                        bannerSubHeading: item.bannerSubHeading,
                        videoFile: null,
                        ImageFile: null,
                        url: item.url,
                        content: item.content,
                        type: item.type,
                        panelType: item.panelType || 'image',
                        fullBleed: item.fullBleed,
                        fitWidth: item.fitWidth,
                        opacity: item.opacity,
                        autoPlay: item.autoPlay || false,
                        requireUserToWatch: item.isRequired || false,
                        buttonUrl: item.buttonUrl || '',
                        isClickable: item.isClickable || false
                      };
                    })
                  };
                })
            };
          }).sort((a, b) => {
            if (a.position === b.position) {
              return a.id.localeCompare(b.id);
            }
            return a.position - b.position;
          });

          // Fix duplicate positions
          this.sectionsArray.forEach((section, index) => {
            if (index > 0 && section.position === this.sectionsArray[index - 1].position) {
              section.position = this.sectionsArray[index - 1].position + 1;
            }
          });
        });
      } else {
        this.showPublishedPage = false;
      }
    });
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  
  ngOnInit(): void {
    this.gridColumns = this.getGridSettings();
    this.loadTransactions('all');
  }

  event: { pageIndex: number; pageSize: number; };
  sortBy = '';
  modalReference: any;
  sortDirection = '';
  totalRecords = 0;
  totalRecordsforView=0;
  formFilter: FormGroup;
  showFilter = false;
  dataSource = null;
  dataSourceForView= null;
  exportOptions = [
    {
      type: 'Redemption',
      label: 'Export Redemption Details to Excel',
      isExporting: this.isExportingRedemption,
    },
    {
      type: 'credit',
      label: 'Export Credit Details to Excel',
      isExporting: this.isExportingCredit,
    },
    {
      type: 'all',
      label: 'Export Transaction Summary to Excel',
      isExporting: this.isExportingAll,
    }
  ];
  apiRequest = {
    itemCount: 25,
    pageIndex: 1,
    sortBy: "creadtedDate",
    search: "",
    sortDirection: "desc",
    filter: []
  };
  apiRequestForView = {
    itemCount: 5,
    pageIndex: 1,
    sortBy: "creadtedDate",
    search: "",
    sortDirection: "desc",
    filter: []
  };
  pages: number[] = [];
  totalPages: number;
  currentPage = 1;
  pagesforView: number[] = [];
  totalpagesForView: number;
  currentPageforView= 1;
  selectedTypeName = 'all';

  getGridSettings(): DataGridColumnHeader[] {
    return [
      // {
      //   columnName: 'invoiceNumber',
      //   columnTitleKey: 'Invoice#',
      //   columnValue: 'invoiceNumber',
      //   type: this.columnType.TEXT_W_ELLIP,
      //   show: true,
      //  sort: true,
      // }, 
      // {
      //   columnName: 'orderNumber',
      //   columnTitleKey: 'Order#',
      //   columnValue: 'orderNumber',
      //   type: this.columnType.TEXT_W_ELLIP_L,
      //   show: true,
      //  sort: true,
      // }, 
      {
        columnName: 'id',
        columnTitleKey: 'Transaction ID',
        columnValue: 'transactionId',
        type: this.columnType.LINK,
        show: true,
        sort: true,
        },
      
      {
        columnName: 'dateProcessed',
        columnTitleKey: 'Date Processed',
        columnValue: 'dateProcessed',
        type: this.columnType.DATE,
        show: true,
        sort: true,
      }, 
      {
        columnName: 'dateOfSale',
        columnTitleKey: 'Invoice Date/ Order Date',
        columnValue: 'dateOfSale',
        type: this.columnType.DATE,
        show: true,
        sort: true,
      }, 
      {
        columnName: 'type',
        columnTitleKey: 'Type',
        columnValue: 'transactionType',
        type: this.columnType.TEXTWITHBACKGROUD,
        show: true,
        sort: true,
        textColor:'white'
      },
      {
        columnName: 'itemQuantity',
        columnTitleKey: 'Item Qty',
        columnValue: 'itemQuantity',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      },
      {
        columnName: 'listPrice',
        columnTitleKey: 'List Price',
        columnValue: 'listPrice',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      },
      {
        columnName: 'totalPoints',
        columnTitleKey: 'Points',
        columnValue: 'totalPoints',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      },
      // {
      //   columnName: 'Actions',
      //   columnTitleKey: 'Actions',
      //   columnValue: 'Actions',
      //   type: this.columnType.BUTTON,
      //   button: {
      //     buttonAction: 'for_view',
      //     icon: 'visibility',
      //     isIconSvg: true,
      //     tooltipKey: 'View',
      //     buttonClass: 'btn-color-600 view-icon',
      //   },
      //   show: true,
      //   sort: false,
      // },
    ]
  }
  getRedemptionGridSettings(): DataGridColumnHeader[] {
    return [
      // {
      //   columnName: 'id',
      //   columnTitleKey: 'Transaction ID',
      //   columnValue: 'id',
      //   type: this.columnType.TEXT_W_ELLIP_L,
      //   show: true,
      //  sort: true,
      // }, 
      // {
      //   columnName: 'orderNumber',
      //   columnTitleKey: 'Order Number',
      //   columnValue: 'orderNumber',
      //   type: this.columnType.TEXT_W_ELLIP_L,
      //   show: true,
      //  sort: true,
      // },  
      {
        columnName: 'id',
        columnTitleKey: 'Transaction ID',
        columnValue: 'transactionId',
        type: this.columnType.LINK,
        show: true,
        sort: true,
        },
      {
        columnName: 'dateProcessed',
        columnTitleKey: 'Date Processed',
        columnValue: 'dateProcessed',
        type: this.columnType.DATE,
        show: true,
        sort: true,
      }, 
      {
        columnName: 'dateOfSale',
        columnTitleKey: 'Invoice Date/ Order Date',
        columnValue: 'dateOfSale',
        type: this.columnType.DATE,
        show: true,
        sort: true,
      }, 
      {
        columnName: 'type',
        columnTitleKey: 'Type',
        columnValue: 'transactionType',
        type: this.columnType.TEXTWITHBACKGROUD,
        show: true,
        sort: true,
        textColor:'white'
      },
      {
        columnName: 'itemQuantity',
        columnTitleKey: 'Item Qty',
        columnValue: 'itemQuantity',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      },
       {
        columnName: 'listPrice',
        columnTitleKey: 'List Price',
        columnValue: 'listPrice',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      },
      {
        columnName: 'totalPoints',
        columnTitleKey: 'Points',
        columnValue: 'totalPoints',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      },
      // {
      //   columnName: 'Actions',
      //   columnTitleKey: 'Actions',
      //   columnValue: 'Actions',
      //   type: this.columnType.BUTTON,
      //   button: {
      //     buttonAction: 'for_view',
      //     icon: 'visibility',
      //     isIconSvg: true,
      //     tooltipKey: 'View',
      //     buttonClass: 'btn-color-600 view-icon',
      //   },
      //   show: true,
      //   sort: false,
      // },
    ]
  }

  getGridSettingsforCredit(): DataGridColumnHeader[] {
    return [
      // {
      //   columnName: 'invoiceDate',
      //   columnTitleKey: 'Invoice Date',
      //   columnValue: 'invoiceDate',
      //   type: this.columnType.DATE,
      //   show: true,
      //   sort: true,
      //   },
      //   {
      //     columnName: 'invoiceNumber',
      //     columnTitleKey: 'Invoice Number',
      //     columnValue: 'invoiceNumber',
      //     type: this.columnType.TEXT,
      //     show: true,
      //     sort: true,
      //   },

      {
        columnName: 'skuName',
        columnTitleKey: 'SKU',
        columnValue: 'skuName',
        type: this.columnType.TEXT_W_ELLIP_L,
        show: true,
        sort: true,
      },
      {
        columnName: 'itemName',
        columnTitleKey: 'Item Name',
        columnValue: 'itemName',
        type: this.columnType.TEXT_W_ELLIP_L,
        show: true,
        sort: true,
      },
      {
        columnName: 'itemQuantity',
        columnTitleKey: 'Quantity',
        columnValue: 'itemQuantity',
        type: this.columnType.TEXT_W_ELLIP_L,
        show: true,
        sort: true,
      },
      {
        columnName: 'totalPoints',
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
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      },
      {
        columnName: 'dateProcessed',
        columnTitleKey: 'Date Added',
        columnValue: 'dateProcessed',
        type: this.columnType.DATE,
        show: true,
        sort: true,
      },
      // {
      //   columnName: 'productLine',
      //   columnTitleKey: 'Product Line',
      //   columnValue: 'productLine',
      //   type: this.columnType.TEXT_W_ELLIP_L,
      //   show: true,
      //   sort: true,
      // },
      // {
      //   columnName: 'brand',
      //   columnTitleKey: 'Brand',
      //   columnValue: 'brand',
      //   type: this.columnType.TEXT_W_ELLIP_L,
      //   show: true,
      //   sort: true,
      // },
     
     
    ];
  }
  getGridSettingsforRedeem(): DataGridColumnHeader[] {
    return [
      {
        columnName: 'dateOfSale',
        columnTitleKey: 'Order Date',
        columnValue: 'orderDate',
        type: this.columnType.DATE,
        show: true,
        sort: true,
        },
      {
        columnName: 'orderNumber',
        columnTitleKey: 'Order Number',
        columnValue: 'orderNumber',
        type: this.columnType.TEXT_W_ELLIP_L,
        show: true,
        sort: true,
      },
      {
        columnName: 'itemName',
        columnTitleKey: 'Item Name',
        columnValue: 'itemName',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      },

      {
        columnName: 'itemQuantity',
        columnTitleKey: 'Item Quantity',
        columnValue: 'itemQuantity',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      },
      {
        columnName: 'totalPoints',
        columnTitleKey: 'Total Points',
        columnValue: 'points',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      },
      {
        columnName: 'dateShipped',
        columnTitleKey: 'Date Shipped',
        columnValue: 'dateShipped',
        type: this.columnType.DATE,
        show: true,
        sort: true,
      },
      {
        columnName: 'shippingMethod',
        columnTitleKey: 'Ship Method',
        columnValue: 'shippingMethod',
        type: this.columnType.TEXT,
        show: true,
        sort: true,
      },
      {
        columnName: 'trackingNumber',
        columnTitleKey: 'Tracking Number',
        columnValue: 'trackingNumber',
        type: this.columnType.TEXT,
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
    ];
  }
    
  
  handleButtonClick(event) {
    console.log(event, 'content');
  
    if (event.buttonAction === 'for_view') {
      const selectedItem = this.dataSource.find(item => item.id === event.item.id);
      if (selectedItem && selectedItem.list) {
        this.dataSourceForView = selectedItem.list.map(listItem => {
          const roundedListPrice = listItem.listPrice ? Math.floor(Number(listItem.listPrice)) : null;
          let itemName = listItem.itemName || 'N/A';
          if (listItem.itemName === 'KOHLER Direct Gift Cards' || listItem.itemName === 'KOHLER Rewards Card') {
            itemName = (roundedListPrice ? `$${roundedListPrice}` : '') + ' ' + listItem.itemName;
          }
  
          return {
            invoiceNumber : selectedItem.invoiceNumber,
            orderNumber:event.item.orderNumber,
            dateShipped:this.formatSelectedDate(listItem.dateShipped) || 'N/A',
            points: this.formatNumberWithCommas(listItem.totalPoints) || 'N/A',
            itemQuantity: this.formatNumberWithCommas(listItem.itemQuantity) || 'N/A',
            listPrice: this.formatNumberWithCommas(listItem.listPrice) || 'N/A',
            skuName: listItem.skuName || 'N/A',
            itemName: itemName, // Use the updated itemName
            shipDate: listItem.shipDate || 'N/A',
            shippingMethod: listItem.shippingMethod || 'N/A',
            productLine: listItem.productLine || 'N/A',
            brand: listItem.brand || 'N/A',
            status: listItem?.itemstatus
          };
        });
      } else {
        this.dataSourceForView = [];
      }
  
      if (selectedItem.transactionType === 'Redemption') {
        this.gridColumnsView = this.getGridSettingsforRedeem();
      } else if (selectedItem.transactionType === 'Credit') {
        this.gridColumnsView = this.getGridSettingsforCredit();
      }
  
      this.apiRequestForView.pageIndex = 1;
      this.currentPage = 1;
      this.transactionModal = this._matDialog.open(this.transactionDetails, { panelClass: 'transaction-details-container' });
    }
  }
  

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }
  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalRecords / this.apiRequest.itemCount);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  calculateTotalPagesforView() {
    this.totalpagesForView = Math.ceil(this.totalRecordsforView / this.apiRequestForView.itemCount);
    this.pagesforView = Array.from({ length: this.totalpagesForView }, (_, i) => i + 1);
  }
  onPageChange(pageIndex: number) {
    if (pageIndex < 1 || pageIndex > this.totalPages) return;
    this.apiRequest.pageIndex = pageIndex;
    this.currentPage = pageIndex;
    this.loadTransactions('all');
  }

  onPageChangeforView(pageIndex: number) {
    if (pageIndex < 1 || pageIndex > this.totalpagesForView) return;
    this.apiRequestForView.pageIndex = pageIndex;
    this.currentPageforView = pageIndex;
    this.loadTransactionsforView(this.selectedTypeName);
  }

  handleSortChangeforView(event) {
    this.sortBy = event.active;
    this.sortDirection = event.direction;

    this.apiRequestForView.sortBy = this.sortBy;
    this.apiRequestForView.sortDirection = this.sortDirection.toLowerCase();
    
    this.loadTransactionsforView(this.selectedTypeName);
  }

  formatNumberWithCommas(value: number): string {
    if (value == null) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  handleSortChange(event) {
    this.sortBy = event.active;
    this.sortDirection = event.direction;

    this.apiRequest.sortBy = this.sortBy;
    this.apiRequest.sortDirection = this.sortDirection.toLowerCase();
    
    this.loadTransactions(this.selectedTypeName);
  }

  loadTransactions(typename: string) {
    this.selectedTypeName = typename;
    const id = window.sessionStorage.getItem("userId");
    this.dataSource = [];
    this.loading = true;
  
    this.service.TransactionsPagination(id, typename, this.apiRequest).subscribe(data => {
      if (data && data.results) {
        this.dataSource = data.results.map(item => {
          item.dateProcessed = item.dateProcessed
            ? moment.utc(item.dateProcessed).format('MM-DD-YYYY')
            : 'N/A';
  
          item.dateOfSale = item.dateOfSale
            ? moment.utc(item.dateOfSale).format('MM-DD-YYYY')
            : 'N/A';
  
          if (item.itemQuantity) {
            item.itemQuantity = this.formatNumberWithCommas(item.itemQuantity);
          }
  
          if (item.transactionType === 'Redemption') {
            // item.listPrice = 'N/A';
  
            if (item.list?.length) {
              const nestedItem = item.list[0];
              const pointsRedeemed = nestedItem.pointsRedemeed
                ? parseFloat(nestedItem.pointsRedemeed)
                : 0;
  
              item.totalPoints = !isNaN(pointsRedeemed)
                ? pointsRedeemed < 0
                  ? this.formatNumberWithCommas(Math.abs(pointsRedeemed))
                  : `-${this.formatNumberWithCommas(pointsRedeemed)}`
                : '0';
            } else {
              item.totalPoints = '0';
            }
            item.transactionId = item.orderNumber;
          } else if (item.transactionType === 'Credit') {
            if (item.totalPoints) {
              item.totalPoints = this.formatNumberWithCommas(item.totalPoints);
            }
            item.transactionId = item.invoiceNumber;
          }
  
          if (item.pointsRedemeed) {
            item.pointsRedemeed = this.formatNumberWithCommas(item.pointsRedemeed);
          }
  
          item.invoiceNumber = item.invoiceNumber || 'N/A';
          item.orderNumber = item.orderNumber || 'N/A';
  
          return item;
        });
      }
      this.totalRecords = data.totalRecords;
      this.calculateTotalPages();
      this.loading = false;
    });
  }
  
  

  loadTransactionsforView(typename: string) {
    this.selectedTypeName = typename;
    const id = window.sessionStorage.getItem("userId");
    this.dataSourceForView = [];
    this.loading = true;
    this.service.TransactionsPagination(id, typename, this.apiRequestForView).subscribe(data => {
      if (data) {
        if (data.results) {
          this.dataSourceForView = data.results.flatMap(item => {
            if (item.list && item.list.length > 0) {
              return item.list.map(listItem => ({
                points: this.formatNumberWithCommas(listItem.points) || 'N/A',
                itemQuantity: this.formatNumberWithCommas(listItem.itemQuantity) || 'N/A',
                listPrice: this.formatNumberWithCommas(listItem.listPrice) || 'N/A',
                skuName: listItem.skuName || 'N/A',
                itemName: listItem.itemName || 'N/A',
                shipDate : listItem.shipDate = moment.utc(listItem.shipDate)
                .tz('America/New_York').format('MM-DD-YYYY')})) || 'N/A'; 
            } else {
              return [];
            }
          });
        }
        this.totalRecords = data.totalRecords;
        this.calculateTotalPagesforView();
      }
      this.loading = false;
    });
  }

  handleRowClick(event) {
    console.log('status', event);

    this.transcationType =event.item.transactionType
    this.invoiceDate = event.item.dateOfSale;
    this.invoiceNumber = event.item.invoiceNumber;
    this.totalListPrice = event.item.listPrice;
    let totalPoints = 0
    let totalQuantity = 0
    this.totalPoints=this.formatNumberWithCommas(event.item.totalPoints);
    const selectedItem = this.dataSource.find(item => item.id === event.item.id);
    if (selectedItem && selectedItem.list) {
      this.dataSourceForView = selectedItem.list.map(listItem => {
        const roundedListPrice = listItem.listPrice ? Math.floor(Number(listItem.listPrice)) : null;
        let itemName = listItem.itemName || 'N/A';
        if (listItem.itemName === 'KOHLER Direct Gift Cards' || listItem.itemName === 'KOHLER Rewards Card') {
          itemName = (roundedListPrice ? `$${roundedListPrice}` : '') + ' ' + listItem.itemName;
        }
        if (selectedItem.transactionType === 'Redemption') {
          totalPoints = listItem?.totalPoints ? totalPoints + listItem?.totalPoints : totalPoints
          totalQuantity = listItem?.itemQuantity ? totalQuantity + listItem.itemQuantity : totalQuantity
        }

        return {
          invoiceNumber: event.item.invoiceNumber,
          orderNumber: event.item.orderNumber,
          orderDate: event.item.dateOfSale,
          invoiceDate: event.item.dateOfSale,
          trackingNumber: listItem.trackingNumber || 'N/A',
          dateProcessed:moment.utc(listItem.dateProcessed).format('MM-DD-YYYY') || 'N/A',
          dateShipped: listItem.dateShipped || 'N/A',
          points: this.formatNumberWithCommas(listItem.totalPoints) || 'N/A',
          itemQuantity: this.formatNumberWithCommas(listItem.itemQuantity) || 'N/A',
          listPrice: this.formatNumberWithCommas(listItem.listPrice) || 'N/A',
          skuName: listItem.skuName || 'N/A',
          itemName: itemName,
          shipDate: listItem.shipDate || 'N/A',
          shippingMethod: listItem.shippingMethod || 'N/A',
          productLine: listItem.productLine || 'N/A',
          brand: listItem.brand || 'N/A',
          status: listItem?.itemstatus,
          
        };
      });
      if (selectedItem.transactionType === 'Redemption') {
        this.totalRedemptionPoints = this.formatNumberWithCommas(totalPoints) || 'N/A';
        this.totalRedemptionQuantity = this.formatNumberWithCommas(totalQuantity) || 'N/A';
      }
    } else {
      this.dataSourceForView = [];
    }

    if (selectedItem.transactionType === 'Redemption') {
      this.gridColumnsView = this.getGridSettingsforRedeem();
    } else if (selectedItem.transactionType === 'Credit') {
      this.gridColumnsView = this.getGridSettingsforCredit();
    }

    this.apiRequestForView.pageIndex = 1;
    this.currentPage = 1;
    this.transactionModal = this._matDialog.open(this.transactionDetails, { panelClass: 'transaction-details-container' });
  }
  
 
  OnApplyFilter(typename: string) {
    console.log('Applying filters for type:', typename);
    
    this.apiRequest.filter = [];
    this.filterTags = [];
    this.filtersApplied = false; // Initialize as false
  
    // Ensure dateProcessed filter logic
    const today = format(new Date(), 'MM/dd/yyyy');
    if (this.formFilter.value.ProccesedDateStart) {
      const startDate = new Date(this.formFilter.value.ProccesedDateStart);
      startDate.setHours(0, 0, 0, 0);
      const endDate = this.formFilter.value.ProccesedDateEnd ? new Date(this.formFilter.value.ProccesedDateEnd) : new Date();
      endDate.setHours(23, 59, 59, 999);
  
      const startDateIso = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000).toISOString();
      const endDateIso = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000).toISOString();
  
      this.apiRequest.filter.push({
        oid: 'dateProcessed',
        value: {
          startDate: startDateIso,
          endDate: endDateIso || today,
        },
      });
  
      this.filterTags.push({
        oid: 'dateProcessed',
        title: 'Date Processed:',
        value: `${this.formatSelectedDate(this.formFilter.value.ProccesedDateStart)} - ${this.formFilter.value.ProccesedDateEnd ? this.formatSelectedDate(this.formFilter.value.ProccesedDateEnd) : today}`,
      });
  
      this.filtersApplied = true; // Set to true if any filter is applied
    }
  
    // Similar logic for Sale Date
    if (this.formFilter.value.SaleDateStart) {
      const saleStartDate = new Date(this.formFilter.value.SaleDateStart);
      saleStartDate.setHours(0, 0, 0, 0);
      const saleEndDate = this.formFilter.value.SaleDateEnd ? new Date(this.formFilter.value.SaleDateEnd) : new Date();
      saleEndDate.setHours(23, 59, 59, 999);
  
      const saleStartDateIso = new Date(saleStartDate.getTime() - saleStartDate.getTimezoneOffset() * 60000).toISOString();
      const saleEndDateIso = new Date(saleEndDate.getTime() - saleEndDate.getTimezoneOffset() * 60000).toISOString();
  
      this.apiRequest.filter.push({
        oid: 'dateSale',
        value: {
          startDate: saleStartDateIso,
          endDate: saleEndDateIso || today,
        },
      });
  
      this.filterTags.push({
        oid: 'dateSale',
        title: 'Date of Sale:',
        value: `${this.formatSelectedDate(this.formFilter.value.SaleDateStart)} - ${this.formFilter.value.SaleDateEnd ? this.formatSelectedDate(this.formFilter.value.SaleDateEnd) : today}`,
      });
  
      this.filtersApplied = true; 
    }
  
    this.loadTransactions(this.selectedTypeName);
  }
  
  
  removeFilterLabel(label) {
    this.filterTags = this.filterTags.filter(item => item.oid !== label.oid);
  
    if (label.oid === 'dateProcessed') {
      this.formFilter.get('ProccesedDateStart')?.setValue('');
      this.formFilter.get('ProccesedDateEnd')?.setValue('');
    } else if (label.oid === 'dateSale') {
      this.formFilter.get('SaleDateStart')?.setValue('');
      this.formFilter.get('SaleDateEnd')?.setValue('');
    } else {
      this.formFilter.get(label.oid)?.setValue('');
    }
  
    this.apiRequest.filter = this.apiRequest.filter.filter(filter => {
      if (label.oid === 'dateProcessed') {
        return filter.oid !== 'dateProcessed';
      } else if (label.oid === 'dateSale') {
        return filter.oid !== 'dateSale';
      }
      return filter.oid !== label.oid;
    });
  
    if (this.filterTags.length === 0) {
      this.filtersApplied = false;
    }
  
    this.loadTransactions(this.selectedTypeName);
  }
  
    
  resetFilters() { 
    this.formFilter.reset();
    this.filterTags = [];
    this.apiRequest.filter = [];
    this.filtersApplied=false;
    this.loadTransactions('all');
  }
    
    
  formatSelectedDate(value) {
    const date = new Date(value); 
    const year = date.getFullYear();
    const month = this.padZero(date.getMonth() + 1);
    const day = this.padZero(date.getDate());
    const formattedDate = `${month}/${day}/${year}`;
    return formattedDate
  }
  padZero(num: number, size: number = 2): string {
    let s = num.toString();
    while (s.length < size) s = '0' + s;
    return s;
  }


  resetFitler() {
    this.formFilter.reset();
    this.OnApplyFilter('all');
  }

  TransactionsPaginationType(typename: string): void {
    if(typename === 'Redemption') {
      this.gridColumns = this.getRedemptionGridSettings();
    } else {
      this.gridColumns = this.getGridSettings();
    }
    this.apiRequest.pageIndex = 1;
    this.currentPage = 1;
    this.loadTransactions(typename);
  }

  exportTransactionSummaryToExcel(typename: string, ManageTaxInformation: any) {
    // Set loading state for the specific button
    this.resetExportingState();
    this.setExportingState(typename, true);
  
    const userId = window.sessionStorage.getItem('userId');
    const json = {
      userId,
      transactionType: typename,
      year: 0, // Year will be set in the dialog if needed
    };
  
    this.service.CheckToLargeAllTranscations(json).subscribe(
      (data) => {
        if (data.isSuccess) {
          this.isExporting = false;
          this.handleManageTaxInformationEdit(ManageTaxInformation, typename); // Open modal for year selection
        } else {
          this.exportTransactions(json, typename); // Export directly without modal
        }
      },
      () => {
        this.resetExportingState();
      }
    );
  }
  
  exportTransactions(request, typename: string) {
    this.service.exportTransactionDetailsToExcel(request, false).subscribe(
      (data: any) => {
        if (data) {
          if (typename === 'all') {
            const exportData = this.getExportDataForAll(data, 'all');
            this.exportExcelService.exportAsExcelFile(
              exportData,
              'Transaction_Summary'
            );
          } else {
            const exportData = this.getExportData(data, typename);
            this.exportExcelService.exportAsExcelFile(
              exportData,
              typename === 'Redemption' ? 'Redemption_Details' : 'Credit_Details'
            );
          }
        }
        this.resetExportingState();
      },
      () => {
        this.resetExportingState();
      }
    );
  }
  
  
  resetExportingState() {
    this.isExportingAll = false;
    this.isExportingCredit = false;
    this.isExportingRedemption = false;
    this.isExporting = false;
  }
  
  setExportingState(type: string, state: boolean) {
    if (type === 'all') this.isExportingAll = state;
    else if (type === 'credit') this.isExportingCredit = state;
    else if (type === 'Redemption') this.isExportingRedemption = state;
  
    this.isExporting = state;
  }

  saveUserTaxDocument() {
    this.isDownloading = true; // Start the loader and disable the button
    const userId = window.sessionStorage.getItem('userId');
    const json = {
      userId,
      transactionType: this.selectedTransactionType, // Use the stored transaction type
      year: this.manageTaxInformationForm.get('year').value,
    };
  
    this.service.exportTransactionDetailsToExcel(json, true).subscribe(
      (data: any) => {
        if (data) {
          if (this.selectedTransactionType === 'all') {
            const exportData = this.getExportDataForAll(data, 'all');
            this.exportExcelService.exportAsExcelFile(
              exportData,
              'Transaction_Summary'
            );
          } else {
            const exportData = this.getExportData(data, this.selectedTransactionType);
            this.exportExcelService.exportAsExcelFile(
              exportData,
              this.selectedTransactionType === 'Redemption'
                ? 'Redemption_Details'
                : 'Credit_Details'
            );
          }
        }
        this.isDownloading = false;
        this.modal.close();
      },
      (error) => {
        console.error('Error downloading data:', error);
        this.isDownloading = false;
      }
    );
  }
  
  
  
  handleManageTaxInformationEdit(modal, transactionType: string) {
    this.selectedTransactionType = transactionType; // Store the transaction type
    this.manageTaxInformationForm = this._formbuilder.group({
      year: [this.yearsArray[this.yearsArray.length - 1]], // Initialize form with the latest year
    });
  
    this.modal = this._matDialog.open(modal, {
      panelClass: 'new-modal',
      width: '400px',
    });
  }

  handleCancelManageTaxModal() {
    this.modal.close();
    this.manageTaxInformationForm.reset();
  }

  getExportData(result: any[], type: string): any[] {
    const data: any[] = [];

    if (result) {
      if (type === 'Redemption') {
        const redemptionArray = result.filter(item => item.transactionType === 'Redemption');
        if (redemptionArray.length > 0) {
          redemptionArray.forEach(element => {
            const roundedListPrice = element.listPrice ? Math.floor(Number(element.listPrice)) : null;
            let itemName = element.itemName;

            // Format itemName for special cases
            if (element.itemName == 'KOHLER Direct Gift Cards' || element.itemName == 'KOHLER Rewards Card') {
              itemName = "$" + roundedListPrice + " " + element.itemName;
            }

            // Format totalPointsRedeemed to add "-" if it's positive
            let formattedTotalPointsRedeemed = element.totalPointsRedeemed;
            if (formattedTotalPointsRedeemed) {
              const pointsRedeemed = parseFloat(formattedTotalPointsRedeemed);
              if (!isNaN(pointsRedeemed)) {
                formattedTotalPointsRedeemed = pointsRedeemed < 0
                  ? Math.abs(pointsRedeemed).toFixed(0)
                  : `-${Math.abs(pointsRedeemed).toFixed(0)}`;
              } else {
                formattedTotalPointsRedeemed = '0';
              }
            }

            // Add data to the array
            data.push({
              'Order Number': element.orderNumber,
              'Item Number': element.itemNumber,
              'Item Name': itemName,
              'Total Points Redeemed': formattedTotalPointsRedeemed ? Number(formattedTotalPointsRedeemed) : 0,
              'Item Quantity': element.itemQuantity ? Number(element.itemQuantity) : 0,
              'Order Date': element.orderDate ? moment(element.orderDate).format('MM-DD-YYYY') : null,
              'Date Shipped': element.dateShipped ? moment(element.dateShipped).format('MM-DD-YYYY') : null,
              'Shipping Method': element.shippingMethod,
              'Tracking Number': element.trackingNumber,
              'Cancelled Date (if applicable)': element.cancelledDate,
              'Status': element.status,
              'Transaction Type': element.transactionType,
            });
          });
        } else {
          data.push({
            'Order Number': null,
            'Item Number': null,
            'Item Name': null,
            'Total Points Redeemed': 0,
            'Item Quantity': 0,
            'Order Date': null,
            'Date Shipped': null,
            'Shipping Method': null,
            'Tracking Number': null,
            'Cancelled Date (if applicable)': null,
            'Status': null,
            'Transaction Type': null,
          });
        }
      } else if (type === 'credit') {
        const creditArray = result.filter(item => item.transactionType === 'Credit');
        if (creditArray.length > 0) {
          creditArray.forEach(element => {
            let statusString: string;
            if (element.status === '1') {
              statusString = 'Eligible';
            } else if (element.status === '2' || element.status === '404') {
              statusString = 'Non-Eligible';
            } else {
              statusString = null;
            }

            data.push({
              'Invoice Number': element.invoiceNumber,
              'SKU': element.sku,
              'Status': statusString,
              'Item Quantity': element.itemQuantity ? Number(element.itemQuantity) : 0,
              'Total Points Earned': element.totalPointsEarned ? Number(element.totalPointsEarned) : 0,
              'Total List Price Earned': element.totalListPriceEarned ? Number(element.totalListPriceEarned) : 0,
              'Date Processed': element.dateProcessed ? moment(element.dateProcessed).format('MM-DD-YYYY') : null,
              'Invoice Date': element.invoiceDate ? moment(element.invoiceDate).format('MM-DD-YYYY') : null,
              'Transaction Type': element.transactionType,
            });
          });
        } else {
          data.push({
            'Invoice Number': null,
            'SKU': null,
            'Status': null,
            'Item Quantity': 0,
            'Total Points Earned': 0,
            'Total List Price Earned': 0,
            'Date Processed': null,
            'Invoice Date': null,
            'Transaction Type': null,
          });
        }
      }
    }

    return data;
  }
  
  getExportDataForAll(result, type: string) {
    if (type === 'all'){
      const data = [];

      result.forEach(element => {
        let statusString;
        if (element.status === '1') {
          statusString = 'Eligible';
        } else if (element.status === '2' || element.status === '404') {
          statusString = 'Non-Eligible';
        } else {
          statusString = null;
        }
  
        data.push({
          'Transaction ID': element.invoiceNumber ? element.invoiceNumber : element.orderNumber,
          'Date Processed': element.dateProcessed ? moment(element.dateProcessed).format('MM-DD-YYYY') : null,
          'Date of Sale': element.invoiceDate ? moment(element.invoiceDate).format('MM-DD-YYYY') : 'N/A',
          'Transaction Type': element.transactionType,
          'Item Quantity': element.itemQuantity ? Number(element.itemQuantity) : 0,
          'List Price': element.listPrice ? Number(element.listPrice) : 'N/A',
          'Points':element.totalPoints ? Number(element.totalPoints) : 0,
        });
      });
  
      return data;
    }
    
  }
    
}
