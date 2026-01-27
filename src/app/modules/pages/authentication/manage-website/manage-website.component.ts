import { ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, QueryList, Renderer2, SecurityContext, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from 'app/shared/notification/notification';
import { ChartOptions, ChartData } from 'chart.js';
import { ChartType } from 'ng-apexcharts';
import { BaseChartDirective } from 'ng2-charts';
import { Subscription } from 'rxjs';
import { ManageWebsiteService } from './manage-website.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { URLService } from 'app/modules/url-service/url.service';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { CdkDragDrop, CdkDragEnd, moveItemInArray ,CdkDragStart, CdkDragMove, Point, DragRef } from '@angular/cdk/drag-drop';
import { environment } from 'environments/environment';
import { ThemePalette } from '@angular/material/core';
import * as moment from 'moment';
import { forEach } from 'lodash';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { COLUMN_TYPE, DataGridColumnHeader } from 'app/shared/component/data-grid/data-grid.service';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { AngularEditorComponent, AngularEditorConfig } from "@kolkov/angular-editor";
import { AuthService } from 'app/core/auth/auth.service';

interface PageElement {
  id: string;
  containerId: string;
  type?: string;
  dataType?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  uploadId?: string;
  fileName?: string | null;
  zIndex: number;
  style: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    lineHeight?: string;
    padding?: string;
    fontFamily?: string;
  };
  content: string;
  modified?: boolean;
  isSavedToAPI?: boolean;
  shouldAdjustHeight?: boolean;
  userResizedManually?: boolean;
  text?: string;
  hyperlink?: string;
  bannerHeading?: string;
  bannerSubHeading?: string;
  newHeadings?: { text: string; x: number; y: number }[];
  className?: string;
  files?: File[];
  images?: string[];
  currentIndex?: number;
  videoUrl?: string;
  localVideoUrl?: string | null;
  sanitizedVideoUrl?: SafeResourceUrl | null;
  isYoutubeOrVimeo?: boolean;
  chartDataType?: string;
  requireUserToWatch?: boolean;
  position?: number;
  autoPlay?: boolean;
  file?: File;
  embedUrl?: string;
  tempAudioUrl?: string;
  tempVideoUrl?: string;
  title?: string;
  subtitle?: string;
  blobUrl?: string;
  showControls?: boolean;
  listenProgress?: number;
  tempContent?: string;
  isCenteredHorizontally?: boolean;
  isCenteredVertically?: boolean;
  contentFileId?: string;
  fullBleed?: string;
  fitWidth?: string;
  opacity?: string;
  ImageFile?: File;
  videoFile?: File;
  audioFile?: File;
  templateId?: string;
  selectedTimePeriod?: string;
  isVideo?: boolean;
  uniqueId?: string;
  audioUrl?: string;
  croppedWidth?: number;
  croppedHeight?: number;
  needsReplacement?: boolean;
  oldContentFileId?: string;
  lastSavedHtml?: string;
  getAllCMSItemViews?: {
    id?: string;
    templateId?: string;
    uploadId?: string;
    isVideo?: boolean;
    uniqueId?: string;
    bannerHeading?: string;
    bannerSubHeading?: string;
    newHeadings?: { text: string; x: number; y: number }[];
    content?: string;
    file?: File;
    addToTemplate?: boolean;
    containerId?: string;
    fullBleed?: string;
    fitWidth?: string;
    opacity?: string;
    autoPlay?: boolean;
    requireUserToWatch?: boolean;
    url?: string;
    type?: string;
    panelType?: string;
    iFrame:string;
  }[];
  chartHeading?: string;
  salesHeading?: string;
  
  iFrame:string;
  // New button-specific properties
  buttonText?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  buttonBold?: boolean;
  buttonItalic?: boolean;
  buttonUnderline?: boolean;
  buttonStyle?:any;
  isEdit?: boolean;
   pieChartData?: any[];
  lineChartData?: any;
  barChartData?: any;
}
interface Section {
  id: string;
  items: PageElement[];
  height?: number;
  position?: number;
  type?: string;
}

interface EditorHeading {
  name: string;
  class: string;
  fontSize: string;
  lineHeight: string;
}



export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: 'MM/DD/YYYY, HH:mm',
  },
  display: {
    dateInput: 'MM/DD/YYYY, HH:mm', 
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-manage-website',
  templateUrl: './manage-website.component.html',
  styleUrls: ['./manage-website.component.scss'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
  ]
})
export class ManageWebsiteComponent implements OnInit , OnDestroy  {
  isAdmin: boolean = false;
    editorTempText: string;
currentUserId: string | null = null;
lockedDraftId: string | null = null;
  charts = [
  { name: 'Pie Chart' },
  { name: 'Line Chart' },
  { name: 'Bar Chart' }
];

  moment = moment;
  scheduledDate: Date = new Date();
  isOn: boolean = true;
 @ViewChild('scrollContainerItem') scrollContainerItem!: ElementRef;
 @ViewChild('faqEditContainer') faqEditContainer!: ElementRef<HTMLDivElement>;
  selectedImages: string[] = [];
  currentImageIndex: number = 0;
  sectionsArray: Section[] = [];
  originalSections: string = '';
  selectedElement: PageElement | null = null;
  hoveredElement: PageElement | null = null;
  lastSelectedElement: PageElement | null = null;
  selectedFontFamily = null;
  addSection: boolean = false;
  isEditingSection: number | null = null;
  imageUrl: string | null = null;
  selectedFileName: string | null = null;
  videoUrl: string = '';
  videoUrls: { [key: string]: string } = {};
  currentSelectedNewElement: string = '';
  localVideoUrl: string = null;
   videoAutoPlay: boolean = false;
  videoMuteByDefault: boolean = false;
  videoLoop: boolean = false;
      deletePRIndex: number;
  deletePRItemIndex: number;
  sanitizedVideoUrl: SafeResourceUrl = null;
  isYoutubeOrVimeo: boolean = false;
  requireUserToWatch: boolean = false;
   buttonText: string = '';
  buttonHyperlink: string = '';
  buttonColor: string = '#007bff';
  buttonTextColor: string = '#ffffff';
  buttonBold: boolean = false;
  buttonItalic: boolean = false;
  buttonUnderline: boolean = false;
  showButtonDialog: boolean = false;
  selectedItemIndex: number = -1;
  selectedItem: any = null;
  selectedSectionIndex: number = -1;
  containerPopup: boolean = false;
  showGridBlocks: boolean[] = [];
  alignmentGuides: { xPercent?: number; yPercent?: number }[][] = [];
  showCenterLine: boolean = false;
  mobileView: boolean = false;
  selectedDraftItem: any = { id: '00000000-0000-0000-0000-000000000000' }; // Mock for demo
  sectionContainer: Section = { id: '', items: [] };
  indexToPush: number | null = null;
  showResizeDropdown: number | null = null;
  selectedContainerSize: number = 50;
  hideAddSection: boolean = false;
  isSmallScreen = false;
  hideSideWindow = false;
  @ViewChild(BaseChartDirective) baseChart!: BaseChartDirective;
  @ViewChild('vimeoPlayer', { static: false }) videoPlayer: ElementRef;
  clonedSection = null;
  slideContainer = []
  slideContainers: { [containerIndex: number]: any[] } = {};
  sliderFlag = null;
  localAsset = 'assets/images/kohler_logo.png';
  logoUrl = 'assets/images/kohler_logo.png';
  logoId = null;
  existingFileName: string | null = null;
  logoTitle = null;
  showLogoPopup = false;
  disableDrag = false;
  headingObject = null;
  draftItem = null;
  dateForm: FormGroup;
  originalDate: Date;
  hours: number[] = Array.from({length: 24}, (_, i) => i); // 0-23 hours
  minutes: number[] = Array.from({length: 60}, (_, i) => i); // 0-59 minutes
  sharedUrl = null;
  LinkDate = null;
  showTypeSelectionPopup = false;
  @ViewChild('popupRef') popupRef: ElementRef;
  selectedContainerType: any;
  selectedItemId: string | null = null;
  publishLinkDate = null;
  shareLinkDate = null;
  LinkId = null;
// Simple font sizes - direct pixel values, no confusing class names
fontSizes = [
  { name: '8',  class: 'kl-editor-size-small' },
  { name: '10', class: 'kl-editor-size-medium' },
  { name: '12', class: 'kl-editor-size-large' },
  { name: '14', class: 'kl-editor-size-x-large' },
  { name: '16', class: 'kl-editor-size-xx-large' },
  { name: '18', class: 'kl-editor-size-xxx-large' },
  { name: '20', class: 'kl-editor-size-xxxx-large' },
  { name: '22', class: 'kl-editor-size-huge' },
  { name: '24', class: 'kl-editor-size-x-huge' },
  { name: '26', class: 'kl-editor-size-xx-huge' },
  { name: '28', class: 'kl-editor-size-giant' },
  { name: '32', class: 'kl-editor-size-32' },
  { name: '36', class: 'kl-editor-size-36' },
  { name: '40', class: 'kl-editor-size-40' },
  { name: '44', class: 'kl-editor-size-44' },
  { name: '48', class: 'kl-editor-size-48' },
  { name: '56', class: 'kl-editor-size-56' },
  { name: '64', class: 'kl-editor-size-64' },
  { name: '72', class: 'kl-editor-size-72' },
  { name: '84', class: 'kl-editor-size-84' },
  { name: '96', class: 'kl-editor-size-96' }
];
@ViewChild('editorRef', { static: false }) editorElementRef: any;
fonts: string[] = ['Arial', 'Times New Roman', 'Verdana', 'HelveticaNeueMedium', 'HelveticaNeuelight','HelveticaNeueBold'];
showDropdown = false;
  selectedFontSize: string | null = null;
  private savedSelection: Range | null = null;
  @ViewChild('editorRef') editor;
  @ViewChildren('editorRef_') editors: QueryList<any>;
  otherPagesEditorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    sanitize: false,
    height: 'auto',
    minHeight: '300px',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'HelveticaNeueLight',
    toolbarHiddenButtons: [
      ['subscript', 'superscript', 'fontName', 'removeFormat', 'undo', 'redo', 'indent', 'outdent', 'strikeThrough', 'justifyFull', 'heading'],
      ['insertImage', 'insertVideo', 'insertHorizontalRule', 'toggleEditorMode'],
      ['fontSize'], ['customClasses'], ['textColor', 'backgroundColor']
    ],
    customClasses: [
    { name: '8', class: 'kl-editor-size-small', tag: 'span' },
    { name: '10', class: 'kl-editor-size-medium', tag: 'span' },
    { name: '12', class: 'kl-editor-size-large', tag: 'span' },
    { name: '14', class: 'kl-editor-size-x-large', tag: 'span' },
    { name: '16', class: 'kl-editor-size-xx-large', tag: 'span' },
    { name: '18', class: 'kl-editor-size-xxx-large', tag: 'span' },
    { name: '20', class: 'kl-editor-size-xxxx-large', tag: 'span' },
    { name: '22', class: 'kl-editor-size-huge', tag: 'span' },
    { name: '24', class: 'kl-editor-size-x-huge', tag: 'span' },
    { name: '26', class: 'kl-editor-size-xx-huge', tag: 'span' },
    { name: '28', class: 'kl-editor-size-giant', tag: 'span' }],
  };
  otherPagesTallEditorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    sanitize: false,
    height: '450px', // <-- explicitly set this
    minHeight: '450px', // <-- optional
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'HelveticaNeueLight',
    toolbarHiddenButtons: [
      ['subscript', 'superscript', 'fontName', 'removeFormat', 'undo', 'redo', 'indent', 'outdent', 'strikeThrough', 'justifyFull'],
      ['insertImage', 'insertVideo', 'insertHorizontalRule', 'toggleEditorMode'],
      ['fontSize'],['customClasses'], ['textColor', 'backgroundColor']
    ],
    customClasses: [
      { name: '8', class: 'kl-editor-size-small', tag: 'span' },
      { name: '10', class: 'kl-editor-size-medium', tag: 'span' },
      { name: '12', class: 'kl-editor-size-large', tag: 'span' },
      { name: '14', class: 'kl-editor-size-x-large', tag: 'span' },
      { name: '16', class: 'kl-editor-size-xx-large', tag: 'span' },
      { name: '18', class: 'kl-editor-size-xxx-large', tag: 'span' },
      { name: '20', class: 'kl-editor-size-xxxx-large', tag: 'span' },
      { name: '22', class: 'kl-editor-size-huge', tag: 'span' },
      { name: '24', class: 'kl-editor-size-x-huge', tag: 'span' },
      { name: '26', class: 'kl-editor-size-xx-huge', tag: 'span' },
      { name: '28', class: 'kl-editor-size-giant', tag: 'span' }],
    };
  faqPagesTallEditorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    sanitize: false,
    minHeight: '300px',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'HelveticaNeueBold',
    toolbarHiddenButtons: [
      [
        'subscript',
        'superscript',
        'fontName',
        'removeFormat',
        'undo',
        'redo',
        'indent',
        'outdent',
        'strikeThrough',
        'justifyFull',
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'toggleEditorMode',
        'fontSize',
        'textColor',
        'backgroundColor',
        'code',
        'customClasses',
        'insertUnorderedList',
        'insertOrderedList',
        'heading',
      ]
    ]
  };

  // FAQ Answer Editor Config - normal text, no bold by default
  faqAnswerEditorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    sanitize: false,
    minHeight: '300px',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'HelveticaNeueLight',
    toolbarHiddenButtons: [
      [
        'subscript',
        'superscript',
        'fontName',
        'removeFormat',
        'undo',
        'redo',
        'indent',
        'outdent',
        'strikeThrough',
        'justifyFull',
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'toggleEditorMode',
        'fontSize',
        'textColor',
        'backgroundColor',
        'code',
        'customClasses',
        'insertUnorderedList',
        'insertOrderedList',
        'heading',
      ]
    ]
  };

  otherPagesNoAlignEditorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    sanitize: false,
    height: 'auto',
    minHeight: '200px',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'HelveticaNeueLight',
    toolbarHiddenButtons: [
      ['subscript', 'superscript', 'fontName', 'removeFormat', 'undo', 'redo', 'indent', 'outdent', 'strikeThrough', 'justifyFull'],
      ['insertImage', 'insertVideo', 'insertHorizontalRule', 'toggleEditorMode'],
      ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
      ['fontSize'],['customClasses'], ['textColor', 'backgroundColor']
    ],
    customClasses: [
    { name: '8', class: 'kl-editor-size-small', tag: 'span' },
    { name: '10', class: 'kl-editor-size-medium', tag: 'span' },
    { name: '12', class: 'kl-editor-size-large', tag: 'span' },
    { name: '14', class: 'kl-editor-size-x-large', tag: 'span' },
    { name: '16', class: 'kl-editor-size-xx-large', tag: 'span' },
    { name: '18', class: 'kl-editor-size-xxx-large', tag: 'span' },
    { name: '20', class: 'kl-editor-size-xxxx-large', tag: 'span' },
    { name: '22', class: 'kl-editor-size-huge', tag: 'span' },
    { name: '24', class: 'kl-editor-size-x-huge', tag: 'span' },
    { name: '26', class: 'kl-editor-size-xx-huge', tag: 'span' },
    { name: '28', class: 'kl-editor-size-giant', tag: 'span' }],
  };
  ChartEditorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    sanitize: false,
    height: 'auto',
    minHeight: '200px',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    toolbarHiddenButtons: [
      ['subscript', 'superscript', 'fontName', 'removeFormat', 'undo', 'redo', 'indent', 'outdent', 'strikeThrough', 'justifyFull'],
      ['insertImage', 'insertVideo', 'insertHorizontalRule', 'toggleEditorMode'],
      ['fontSize'],['customClasses'], ['textColor', 'backgroundColor']
    ],

    customClasses: [
      { name: '8', class: 'kl-editor-size-small' },
      { name: '10', class: 'kl-editor-size-medium' },
      { name: '12', class: 'kl-editor-size-large' },
      { name: '14', class: 'kl-editor-size-x-large' },
      { name: '16', class: 'kl-editor-size-xx-large' },
      { name: '18', class: 'kl-editor-size-xxx-large'},
      { name: '20', class: 'kl-editor-size-xxxx-large' },
    ],
  };
  HomePageEditorConfig: AngularEditorConfig = {
    sanitize: false,
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '400px',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'HelveticaNeuelight',
    toolbarHiddenButtons: [
      ['subscript', 'superscript', 'fontName', 'removeFormat', 'undo', 'redo', 'indent', 'outdent', 'strikeThrough', 'justifyFull', 'heading'],
      ['insertImage', 'insertVideo', 'insertHorizontalRule', 'toggleEditorMode'],
      ['fontSize'], ['customClasses'], ['textColor', 'backgroundColor']
    ],
    customClasses: [
      { name: '16', class: 'kl-editor-size-small', tag: 'span' },
      { name: '20', class: 'kl-editor-size-medium', tag: 'span' },
      { name: '24', class: 'kl-editor-size-large', tag: 'span' },
      { name: '28', class: 'kl-editor-size-x-large', tag: 'span' },
      { name: '32', class: 'kl-editor-size-xx-large', tag: 'span' },
      { name: '36', class: 'kl-editor-size-xxx-large', tag: 'span' },
      { name: '40', class: 'kl-editor-size-xxxx-large', tag: 'span' },
      { name: '44', class: 'kl-editor-size-huge', tag: 'span' },
      { name: '48', class: 'kl-editor-size-x-huge', tag: 'span' },
      { name: '52', class: 'kl-editor-size-xx-huge', tag: 'span' },
      { name: '56', class: 'kl-editor-size-giant', tag: 'span' },
      { name: '64', class: 'kl-editor-size-32', tag: 'span' },
      { name: '72', class: 'kl-editor-size-36', tag: 'span' },
      { name: '80', class: 'kl-editor-size-40', tag: 'span' },
      { name: '88', class: 'kl-editor-size-44', tag: 'span' },
      { name: '96', class: 'kl-editor-size-48', tag: 'span' },
      { name: '112', class: 'kl-editor-size-56', tag: 'span' },
      { name: '128', class: 'kl-editor-size-64', tag: 'span' },
      { name: '144', class: 'kl-editor-size-72', tag: 'span' },
      { name: '168', class: 'kl-editor-size-84', tag: 'span' },
      { name: '192', class: 'kl-editor-size-96', tag: 'span' }
    ]
  };
  HomePageNoAllignEditorConfig: AngularEditorConfig = {
    sanitize: false,
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '200px',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'HelveticaNeueLight',
    toolbarHiddenButtons: [
      ['subscript', 'superscript', 'fontName', 'removeFormat', 'undo', 'redo', 'indent', 'outdent', 'strikeThrough', 'justifyFull'],
      ['insertImage', 'insertVideo', 'insertHorizontalRule', 'toggleEditorMode'],
      ['fontSize'],['customClasses'], ['textColor', 'backgroundColor'],
      ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull']
    ],

    customClasses: [
      { name: '8', class: 'kl-editor-size-small', tag: 'span' },
      { name: '10', class: 'kl-editor-size-medium', tag: 'span' },
      { name: '12', class: 'kl-editor-size-large', tag: 'span' },
      { name: '14', class: 'kl-editor-size-x-large', tag: 'span' },
      { name: '16', class: 'kl-editor-size-xx-large', tag: 'span' },
      { name: '18', class: 'kl-editor-size-xxx-large', tag: 'span' },
      { name: '20', class: 'kl-editor-size-xxxx-large', tag: 'span' },
      { name: '22', class: 'kl-editor-size-huge', tag: 'span' },
      { name: '24', class: 'kl-editor-size-x-huge', tag: 'span' },
      { name: '26', class: 'kl-editor-size-xx-huge', tag: 'span' },
      { name: '18', class: 'kl-editor-size-xxx-large', tag: 'span' },
      { name: '20', class: 'kl-editor-size-xxxx-large', tag: 'span' },
      { name: '28', class: 'kl-editor-size-giant', tag: 'span' }],
  };
  sectionObject = {
    isPie: false,
    isLine: false,
    isbar: false,
    academy: false,
    all: false,
    credit: false,
    redemption: false,
    article: true,
    messages: false,
    singlepanel: false,
    text: false,
    goalTracker: true,
    trainingMonth: false,
  }
  videoFiles = null;
  editHeaderFlag = false
  showMenu = false;
  showGroupforadmin = false;
  showGroupforadminsins = false;
  showGroup = false;
  homeText = 'Home';
  dialogRef: MatDialogRef<any>;
  trainingEmbededVideo = null;
  isPublishedView: boolean = false;
  blobUrls: Map<string, string> = new Map();
  audioBlobUrls: Map<string, string> = new Map();

  currentEditingSectionIndex: number = -1;
  previousLink = null;
  showLink = false;
  isChild = false;
  showChild = false; 
  editChild = true;
  showSectionEditForm = false;
  selectedItemUrl: string | null = null;
  // @ViewChild("myckeditorTI1") ckeditorTI1: CKEditorComponent;
  // @ViewChild("myckeditorTI2") ckeditorTI2: CKEditorComponent;
  navigationArray = [];
  draftItems: any[] = [];
  changeSelectedPage = null;
  isPublishPageSelected = false;
  changeSelectedDraftPage = null;
  publishedHomePageId: string = null;
  selectedDraftId: string = null;
  draftCount: number = 0;
  maxDraftsReached: boolean = false;
  // home component data
  draft: any;
  private safeUrls: { [key: string]: SafeResourceUrl } = {};
  tempChartHeading: string = '';
  tempText: string = '';
  
  ytdSales: number = 0; 
  pieChartOptions: ChartOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          pointStyle: 'circle',
          boxWidth: 10,
          padding: 20,
          font: {
            size: 12,
            lineHeight: 1.5,
          },
        }
      }
    },
    maintainAspectRatio: false, 
  };
  
  private carouselSubscription: Subscription;

  totalCourse = 0;
  currentCarousel = 0;
  totalAttempted = 0;
  view = [700, 400]
  remainingPoints = 0;
  pointsCredited = 0;
  targetValue = '0';
  totalSales = 0;
  isSalesSelected = false;
  salesHeading = '';

  pieChartData = [];
  lineChartData: any = { labels: [], datasets: [] };
  barChartData: any = { labels: [], datasets: [] };
  showManagePage = false;
  pieChartType: ChartType = 'pie';
  colorScheme = {
    domain: ["#C94D6D", "#4174C9", "#876B8E", "#8DBCCC", "#8FAAC6", "#8C4D57", "#b89dc7", "#966577", "#95a3de", "#fb9ad4", "#99738a", "#ccbdaf", "#97c4a0", "#c9adc9", "#e3ccba", "#bfe0b8", "#b7d2f7", "#d0c7f2", "#b6f0bf", "#d6bfd6"]
  };

  lineChartOptions: ChartOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          pointStyle: 'circle'
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value:number = context.raw as number;
            if (this.isSalesSelected ) {
              return `Sales: $${this.formatNumberWithCommas(value.toFixed(2))}`;
            } else if (!this.isSalesSelected) {
              return `Points: ${this.formatNumberWithCommas(value)}`;
            }
            return `${context.dataset.label}: ${value}`;
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dev'];
  lineChartDataset = [
    {
      "label": "Sales: $0.00",
      "data": [
        0
      ],
      "borderColor": "blue",
      "fill": false
    },
    {
      "label": "Points: 350",
      "data": [
        350
      ],
      "borderColor": "pink",
      "fill": false
    }
  ];

  lineChartType: ChartType = 'line';
  apiRequest = {
    itemCount:4,
    pageIndex: 1,
    pageLimit: 4,
    sortBy: "name",
    search: "",
    sortDirection: "desc",
    filter: []
  };
  currentDate = new Date();
  notiApiRequest = {
    itemCount:3,
    pageIndex: 1,
    pageLimit: 3,
    sortBy: "",
    search: "",
    sortDirection: "",
    filter: []
  }
  lineChartLoading = false;
  enableManagePage = false;
  sideNavArray = [];
  previousValue: string = '';
  deletedMenuNames: string[] = [];
  sideNavSubItemArray = []
  pieChartLoading = false;
  pointsAndSummaryLoading = false;
  isCurriculumLoading = false;
  isTransactionLoading = false;
  userType = 'normaluser';
  isNotificationLoading = false;
  curriculumData = [];
  transactionData = []
  selectedManagePageId = null;
  selectedManagePage = null;
  notifications = {customRecordCount: 0, totalRecords: 0, results: []};
  data: any;
  userName = sessionStorage.getItem('name')
  siteForm: FormGroup;
  manageForm: FormGroup;
  manageNavForm: FormGroup;
  childNavForm: FormGroup;
  sectionEditForm: FormGroup;
  fileName = null;
  originalBase64Logo: string | null = null;
  isExistingLogo: boolean = false;
  file = null;
  showMenuManagePage = false
  showChildMenuName = false;
  modalReference: any;
  @ViewChild('dialogBoxNotification') dialogBoxNotification: TemplateRef<any>;
  deleteDraftItem = null;
  deleteItem = null;
  deleteElement: any = null; 
  TemplatesArray = [];
  showTemplateswindow = false;
  previousStateStogage = []
  currentStateIndex = 0;
  slideContainertoRemove = null;
  containerIndex = null;
  hideAddNavOption = false;
  cellWidthPercent: number = 5;
  cellHeightPercent: number = 5; 
  gridGutterPercent: number = 0.4;
 cellWidthPx: number = 0;
  cellHeightPx: number = 25;
  gridGutterPx: number = 0;
  cellSizePx = 35;
  gridColumns: number = 50;
  gridRows: number = 100;
  idealCellWidth = 80;
  idealCellHeight = 45;
  highlightedElementIds: Set<string> = new Set();
  alignmentTolerancePx = 5; // pixels
  public date: moment.Moment;
  public disabled = false;
  public showSpinners = true;
  public showSeconds = false;
  public touchUi = false;
  public enableMeridian = false;
  public maxDate: moment.Moment;
  public stepHour = 1;
  public stepMinute = 1;
  public stepSecond = 1;
  editingDraftId: string | null = null;
  showCropper: boolean = false;
  currentCropImage: string | null = null;
  croppedImageResult: string | null = null;
  imageLoaded: boolean = false;
  croppingElement: any = null;
    originalElementState: any = null;

editDraftName: string = '';
  public color: ThemePalette = 'primary';
  GetLockPageofAdmin: boolean;
  ScheduleNotificationModel: any;
  MenuName: any;

  safeIframeUrl: SafeResourceUrl;
  containerSizes = [
    { value: 'wfull', label: '100%', width: 100 },
    { value: 'wtwobythree', label: '66%', width: 66 },
    { value: 'wonebytwo', label: '50%', width: 50 },
    { value: 'wonebythree', label: '33%', width: 33 }
  ];
  @ViewChild('canvas') canvas!: ElementRef;

  isLoading: boolean = false;
  loadingMessage: string = '';
  showCKEditor: boolean = false;
  showImageDialog: boolean = false;
  showVideoDialog: boolean = false;
  showHyperlinkDialog: boolean = false;
  startX: number = 0;
  startY: number = 0;
  startWidthPercent: number = 0;
  startHeightPercent: number = 0;
  startXPercent: number = 0;
  startYPercent: number = 0;
  offsetX: number = 0;
  offsetY: number = 0;
  resizeHandle: string = '';
  resizeTimeout: any;
  resizeListener: () => void;
  MIN_VIDEO_WIDTH_PERCENT: number = 30;
  MIN_VIDEO_HEIGHT_PERCENT: number = 30;
  MIN_AUDIO_WIDTH_PERCENT: number = 10; 
  MIN_AUDIO_HEIGHT_PERCENT: number = 5;
  hasUnsavedChanges: boolean = false;
  dragging: boolean = false;
  resizing: boolean = false;
  cropperSettings = {
    maintainAspectRatio: false,
    format: 'png',
    resizeToWidth: null,
    onlyScaleDown: false,
    roundCropper: false,
    alignImage: 'center',
    cropperMinWidth: 100,
    autoCrop: true,
    containWithinAspectRatio: false,
    cropperStaticWidth: undefined,
    cropperStaticHeight: undefined,
    imageQuality: 1,
    transform: {},
    canvasRotation: 0
  };
  editorControl = new FormControl('');
  hyperlinkUrl: string;
  editorInstance: any;
  showAudioDialog: boolean;
  audioSourceType: 'upload' | 'embed' = 'upload';
  audioEmbedUrl: string = '';
  audioTitle: string = '';
  audioSubtitle: string = '';
  showControls: boolean = true;
  autoPlay: boolean = false;
  selectedMenuId :string;
  screenWidth: number = window.innerWidth;

  @ViewChild('deleteConfirmation') deleteConfirmation!: TemplateRef<any>;

  deleteType: 'element' | 'section' = 'element';
  deleteSectionIndex: number | null = null;
  deleteItemIndex: number | null = null;

  deleteDialogRef: any;
  exportOptions = [
    {
      type: 'Redemption',
      label: 'Export Redemption Details to Excel',
      isExporting: false,
    },
    {
      type: 'credit',
      label: 'Export Credit Details to Excel',
      isExporting: false,
    },
    {
      type: 'all',
      label: 'Export Transaction Summary to Excel',
      isExporting: false,
    }
  ];
  gridColumnsDataGrid: DataGridColumnHeader[];
  dataSource = [];
  pages: number[] = [];
  currentPage = 1;
  loading = false
  sortBy = '';
  sortDirection = '';
  columnType = COLUMN_TYPE;
    private readonly BASE_ZINDEX = 10;
    private readonly MIN_ZINDEX = 1;
    private readonly MAX_ZINDEX = 1000;
    private readonly NORMALIZE_THRESHOLD = 50;
    pieChartDataSets = {
    currentMonth: {
      quantity: [
        { name: 'Category A: 400 units', value: 40 },
        { name: 'Category B: 300 units', value: 30 },
        { name: 'Category C: 200 units', value: 20 },
        { name: 'Category D: 100 units', value: 10 },
        { name: 'Category E: 50 units', value: 5 }
      ],
      sales: [
        { name: 'Category A: $4000', value: 40 },
        { name: 'Category B: $3000', value: 30 },
        { name: 'Category C: $2000', value: 20 },
        { name: 'Category D: $1000', value: 10 },
        { name: 'Category E: $500', value: 5 }
      ],
      points: [
        { name: 'Category A: 4000 pts', value: 40 },
        { name: 'Category B: 3000 pts', value: 30 },
        { name: 'Category C: 2000 pts', value: 20 },
        { name: 'Category D: 1000 pts', value: 10 },
        { name: 'Category E: 500 pts', value: 5 }
      ]
    },
    currentYear: {
      quantity: [
        { name: 'Category A: 3500 units', value: 35 },
        { name: 'Category B: 2500 units', value: 25 },
        { name: 'Category C: 2500 units', value: 25 },
        { name: 'Category D: 1500 units', value: 15 },
        { name: 'Category E: 500 units', value: 5 }
      ],
      sales: [
        { name: 'Category A: $35000', value: 35 },
        { name: 'Category B: $25000', value: 25 },
        { name: 'Category C: $25000', value: 25 },
        { name: 'Category D: $15000', value: 15 },
        { name: 'Category E: $5000', value: 5 }
      ],
      points: [
        { name: 'Category A: 35000 pts', value: 35 },
        { name: 'Category B: 25000 pts', value: 25 },
        { name: 'Category C: 25000 pts', value: 25 },
        { name: 'Category D: 15000 pts', value: 15 },
        { name: 'Category E: 5000 pts', value: 5 }
      ]
    },
    previousYear: {
      quantity: [
        { name: 'Category A: 5000 units', value: 50 },
        { name: 'Category B: 2000 units', value: 20 },
        { name: 'Category C: 1500 units', value: 15 },
        { name: 'Category D: 1500 units', value: 15 },
        { name: 'Category E: 0 units', value: 0 }
      ],
      sales: [
        { name: 'Category A: $50000', value: 50 },
        { name: 'Category B: $20000', value: 20 },
        { name: 'Category C: $15000', value: 15 },
        { name: 'Category D: $15000', value: 15 },
        { name: 'Category E: $0', value: 0 }
      ],
      points: [
        { name: 'Category A: 50000 pts', value: 50 },
        { name: 'Category B: 20000 pts', value: 20 },
        { name: 'Category C: 15000 pts', value: 15 },
        { name: 'Category D: 15000 pts', value: 15 },
        { name: 'Category E: 0 pts', value: 0 }
      ]
    },
    lifetime: {
      quantity: [
        { name: 'Category A: 45000 units', value: 45 },
        { name: 'Category B: 25000 units', value: 25 },
        { name: 'Category C: 20000 units', value: 20 },
        { name: 'Category D: 10000 units', value: 10 },
        { name: 'Category E: 5000 units', value: 5 }
      ],
      sales: [
        { name: 'Category A: $450000', value: 45 },
        { name: 'Category B: $250000', value: 25 },
        { name: 'Category C: $200000', value: 20 },
        { name: 'Category D: $100000', value: 10 },
        { name: 'Category E: $50000', value: 5 }
      ],
      points: [
        { name: 'Category A: 450000 pts', value: 45 },
        { name: 'Category B: 250000 pts', value: 25 },
        { name: 'Category C: 200000 pts', value: 20 },
        { name: 'Category D: 100000 pts', value: 10 },
        { name: 'Category E: 50000 pts', value: 5 }
      ]
    }
  };

  private lineChartDataSets = {
    currentMonth: {
      quantity: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Quantity: 1000 units',
            data: [250, 300, 200, 250],
            borderColor: 'blue',
            fill: false
          }
        ]
      },
      sales: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Sales: $10000',
            data: [2500, 3000, 2000, 2500],
            borderColor: 'blue',
            fill: false
          }
        ]
      },
      points: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Points: 1000 pts',
            data: [2500, 3000, 2000, 2500],
            borderColor: 'pink',
            fill: false
          }
        ]
      }
    },
    currentYear: {
      quantity: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Quantity: 12000 units',
            data: [1000, 1200, 800, 1100, 900, 1000, 950, 1050, 1100, 1150, 1200, 1000],
            borderColor: 'blue',
            fill: false
          }
        ]
      },
      sales: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Sales: $120000',
            data: [10000, 12000, 8000, 11000, 9000, 10000, 9500, 10500, 11000, 11500, 12000, 10000],
            borderColor: 'blue',
            fill: false
          }
        ]
      },
      points: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Points: 12000 pts',
            data: [1000, 1200, 800, 1100, 900, 1000, 950, 1050, 1100, 1150, 1200, 1000],
            borderColor: 'pink',
            fill: false
          }
        ]
      }
    },
    previousYear: {
      quantity: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Quantity: 10000 units',
            data: [800, 900, 700, 850, 800, 900, 750, 800, 850, 900, 950, 800],
            borderColor: 'blue',
            fill: false
          }
        ]
      },
      sales: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Sales: $100000',
            data: [8000, 9000, 7000, 8500, 8000, 9000, 7500, 8000, 8500, 9000, 9500, 8000],
            borderColor: 'blue',
            fill: false
          }
        ]
      },
      points: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Points: 10000 pts',
            data: [800, 900, 700, 850, 800, 900, 750, 800, 850, 900, 950, 800],
            borderColor: 'pink',
            fill: false
          }
        ]
      }
    },
    lifetime: {
      quantity: {
        labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
        datasets: [
          {
            label: 'Quantity: 50000 units',
            data: [5000, 6000, 7000, 7500, 8000, 8500, 9000],
            borderColor: 'blue',
            fill: false
          }
        ]
      },
      sales: {
        labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
        datasets: [
          {
            label: 'Sales: $500000',
            data: [50000, 60000, 70000, 75000, 80000, 85000, 90000],
            borderColor: 'blue',
            fill: false
          }
        ]
      },
      points: {
        labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
        datasets: [
          {
            label: 'Points: 50000 pts',
            data: [5000, 6000, 7000, 7500, 8000, 8500, 9000],
            borderColor: 'pink',
            fill: false
          }
        ]
      }
    },
    yearVsYear: {
      quantity: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Previous Year: 10000 units',
            data: [800, 900, 700, 850, 800, 900, 750, 800, 850, 900, 950, 800],
            borderColor: 'gray',
            fill: false
          },
          {
            label: 'Current Year: 12000 units',
            data: [1000, 1200, 800, 1100, 900, 1000, 950, 1050, 1100, 1150, 1200, 1000],
            borderColor: 'blue',
            fill: false
          }
        ]
      },
      sales: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Previous Year: $100000',
            data: [8000, 9000, 7000, 8500, 8000, 9000, 7500, 8000, 8500, 9000, 9500, 8000],
            borderColor: 'gray',
            fill: false
          },
          {
            label: 'Current Year: $120000',
            data: [10000, 12000, 8000, 11000, 9000, 10000, 9500, 10500, 11000, 11500, 12000, 10000],
            borderColor: 'blue',
            fill: false
          }
        ]
      },
      points: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Previous Year: 10000 pts',
            data: [800, 900, 700, 850, 800, 900, 750, 800, 850, 900, 950, 800],
            borderColor: 'gray',
            fill: false
          },
          {
            label: 'Current Year: 12000 pts',
            data: [1000, 1200, 800, 1100, 900, 1000, 950, 1050, 1100, 1150, 1200, 1000],
            borderColor: 'pink',
            fill: false
          }
        ]
      }
    }
  };

  private barChartDataSets = {
    currentMonth: {
      quantity: {
        totalSales: 1000,
        targetValue: 1500,
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [
            {
              label: 'Quantity: 1000 units',
              data: [250, 300, 200, 250],
              backgroundColor: 'blue'
            }
          ]
        }
      },
      sales: {
        totalSales: 10000,
        targetValue: 15000,
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [
            {
              label: 'Sales: $10000',
              data: [2500, 3000, 2000, 2500],
              backgroundColor: 'blue'
            }
          ]
        }
      },
      points: {
        totalSales: 1000,
        targetValue: 1500,
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [
            {
              label: 'Points: 1000 pts',
              data: [2500, 3000, 2000, 2500],
              backgroundColor: 'pink'
            }
          ]
        }
      }
    },
    currentYear: {
      quantity: {
        totalSales: 12000,
        targetValue: 15000,
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Quantity: 12000 units',
              data: [1000, 1200, 800, 1100, 900, 1000, 950, 1050, 1100, 1150, 1200, 1000],
              backgroundColor: 'blue'
            }
          ]
        }
      },
      sales: {
        totalSales: 120000,
        targetValue: 150000,
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Sales: $120000',
              data: [10000, 12000, 8000, 11000, 9000, 10000, 9500, 10500, 11000, 11500, 12000, 10000],
              backgroundColor: 'blue'
            }
          ]
        }
      },
      points: {
        totalSales: 12000,
        targetValue: 15000,
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Points: 12000 pts',
              data: [1000, 1200, 800, 1100, 900, 1000, 950, 1050, 1100, 1150, 1200, 1000],
              backgroundColor: 'pink'
            }
          ]
        }
      }
    },
    previousYear: {
      quantity: {
        totalSales: 10000,
        targetValue: 13000,
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Quantity: 10000 units',
              data: [800, 900, 700, 850, 800, 900, 750, 800, 850, 900, 950, 800],
              backgroundColor: 'blue'
            }
          ]
        }
      },
      sales: {
        totalSales: 100000,
        targetValue: 130000,
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Sales: $100000',
              data: [8000, 9000, 7000, 8500, 8000, 9000, 7500, 8000, 8500, 9000, 9500, 8000],
              backgroundColor: 'blue'
            }
          ]
        }
      },
      points: {
        totalSales: 10000,
        targetValue: 13000,
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Points: 10000 pts',
              data: [800, 900, 700, 850, 800, 900, 750, 800, 850, 900, 950, 800],
              backgroundColor: 'pink'
            }
          ]
        }
      }
    },
    lifetime: {
      quantity: {
        totalSales: 50000,
        targetValue: 60000,
        data: {
          labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
          datasets: [
            {
              label: 'Quantity: 50000 units',
              data: [5000, 6000, 7000, 7500, 8000, 8500, 9000],
              backgroundColor: 'blue'
            }
          ]
        }
      },
      sales: {
        totalSales: 500000,
        targetValue: 600000,
        data: {
          labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
          datasets: [
            {
              label: 'Sales: $500000',
              data: [50000, 60000, 70000, 75000, 80000, 85000, 90000],
              backgroundColor: 'blue'
            }
          ]
        }
      },
      points: {
        totalSales: 50000,
        targetValue: 60000,
        data: {
          labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
          datasets: [
            {
              label: 'Points: 50000 pts',
              data: [5000, 6000, 7000, 7500, 8000, 8500, 9000],
              backgroundColor: 'pink'
            }
          ]
        }
      }
    },
    yearVsYear: {
      quantity: {
        totalSales: 22000,
        targetValue: 28000,
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Previous Year: 10000 units',
              data: [800, 900, 700, 850, 800, 900, 750, 800, 850, 900, 950, 800],
              backgroundColor: 'gray'
            },
            {
              label: 'Current Year: 12000 units',
              data: [1000, 1200, 800, 1100, 900, 1000, 950, 1050, 1100, 1150, 1200, 1000],
              backgroundColor: 'blue'
            }
          ]
        }
      },
      sales: {
        totalSales: 220000,
        targetValue: 280000,
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Previous Year: $100000',
              data: [8000, 9000, 7000, 8500, 8000, 9000, 7500, 8000, 8500, 9000, 9500, 8000],
              backgroundColor: 'gray'
            },
            {
              label: 'Current Year: $120000',
              data: [10000, 12000, 8000, 11000, 9000, 10000, 9500, 10500, 11000, 11500, 12000, 10000],
              backgroundColor: 'blue'
            }
          ]
        }
      },
      points: {
        totalSales: 22000,
        targetValue: 28000,
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Previous Year: 10000 pts',
              data: [800, 900, 700, 850, 800, 900, 750, 800, 850, 900, 950, 800],
              backgroundColor: 'gray'
            },
            {
              label: 'Current Year: 12000 pts',
              data: [1000, 1200, 800, 1100, 900, 1000, 950, 1050, 1100, 1150, 1200, 1000],
              backgroundColor: 'pink'
            }
          ]
        }
      }
    }
  };
  isFontSizeManuallySet: boolean = false;
  prItems: Array<{ title: string; items: any[] }> = []; 
  collapsed = false;
  iframeSrc = null;
  prIndex = null;
  prAddFrom: FormGroup;
  showPRAddFrom = false
  prFile = null;
prItemIndex = null;
  menuAddForm: FormGroup;
showAddMenuDialog: boolean = false;
showDeleteFaqDialog = false;
faqToDeleteIndex: number | null = null;
faqModel:any;
@ViewChild('dialogBoxFaq') dialogBoxFaq: TemplateRef<any>;
showFontSizeDropdown = false;
showFontFamilyDropdown = false;
showHeadingDropdown = false;
showTextColorPicker = false;
showBgColorPicker = false;
selectedTextColor: string = '#000000';
selectedBgColor: string = '#ffffff';
textColorHex: string = '#000000';
bgColorHex: string = '#ffffff';
textColorHsv = { h: 0, s: 0, v: 0 };
bgColorHsv = { h: 0, s: 100, v: 100 };
isCanvasDragging = false;
isHueDragging = false;
activeColorPicker: 'text' | 'bg' | null = null;
selectedHeading: string | null = null;
// RGB values for color pickers (RGB-only UI)
textColorR: number = 0;
textColorG: number = 0;
textColorB: number = 0;
bgColorR: number = 255;
bgColorG: number = 255;
bgColorB: number = 255;
// Getters to display RGB in UI
get selectedTextColorRgb(): string {
  return `rgb(${this.textColorR}, ${this.textColorG}, ${this.textColorB})`;
}
get selectedBgColorRgb(): string {
  return `rgb(${this.bgColorR}, ${this.bgColorG}, ${this.bgColorB})`;
}
// Simple headings - direct pixel values, no CSS class dependency
headings = [
  { name: 'Heading 1', fontSize: '44px', lineHeight: '1.1', fontWeight: '700' },
  { name: 'Heading 2', fontSize: '40px', lineHeight: '1.1', fontWeight: '700' },
  { name: 'Heading 3', fontSize: '36px', lineHeight: '1.1', fontWeight: '600' },
  { name: 'Heading 4', fontSize: '32px', lineHeight: '1.1', fontWeight: '600' },
  { name: 'Heading 5', fontSize: '28px', lineHeight: '1.1', fontWeight: '600' },
  { name: 'Default', fontSize: '14px', lineHeight: '1', fontWeight: '400' },
];
@ViewChild('aeEditor') aeEditor!: AngularEditorComponent;
@ViewChildren('ae', { read: AngularEditorComponent })
homeEditors!: QueryList<AngularEditorComponent>;
  switchDraftIndex = 0
private suppressSelectionUpdate = false; // used by your selectionchange handler
readonly SIZE_PX_TO_LABEL: Record<number,string> = {
  16: '16', 20: '20', 24: '24', 28: '28', 32: '32', 36: '36', 40: '40', 44: '44', 48: '48', 52: '52', 56: '56',
  64: '64', 72: '72', 80: '80', 88: '88', 96: '96', 112: '112', 128: '128', 144: '144', 168: '168', 192: '192'
};
private suppressFontSizeUpdate = false;

private readonly SECTION_DEFAULT_VH = 16;     // For new/empty sections
private readonly SECTION_MIN_CONTENT_VH = 8;  // Absolute minimum when content exists
private readonly SECTION_PADDING_VH = 6;      // Top + bottom padding when fitting content
private readonly SECTION_MIN_VH = 16; 
private readonly SECTION_MIN_COMPACT_VH = 6; 
private updateSectionHeightDebounceTimer: any = null;
private updateSectionHeightsTimer: any = null;
private readonly SECTION_MAX_VH = 1200; 
  allowedSizes: any;
  isIframeAllowed: boolean;
  showIframe: boolean = true;

  blockedContentHtml: string | null = null;
  private blockedHosts: string[] = []; 
  private readonly KOHLER_WARRANTY_URL = 'https://assist.kohler.com/en/warranty';

  constructor(private sanitizer: DomSanitizer,private urlService: URLService, private _matDialog: MatDialog, private router: Router, private _formbuilder: FormBuilder, private notificationService: NotificationService, private manageWebsiteService: ManageWebsiteService, private fb: FormBuilder, private changeDetectorRef: ChangeDetectorRef, private renderer: Renderer2,private cdRef: ChangeDetectorRef,private eRef: ElementRef,private ngZone: NgZone, private cdr: ChangeDetectorRef,private _authService: AuthService,) {
    let chartWidth = window.innerWidth > 1100 ? 244 : window.innerWidth <= 1100 && window.innerWidth > 700 ? window.innerWidth - 240 : window.innerWidth <= 700 && window.innerWidth > 400 ? window.innerWidth - 150 : window.innerWidth - 80;
    this.view = [chartWidth, 300];
    this.siteForm = this._formbuilder.group({
      site: null,
    })
    this.manageForm = this._formbuilder.group({
      name: [null, Validators.required],
    })
    this.manageNavForm = this._formbuilder.group({
      name: [null, Validators.required],
      menuType : [null, Validators.required],
      url: null,
    })
    this.childNavForm = this._formbuilder.group({
      name: [null, Validators.required],
      menuType : ['basic'],
      itemId: [null],
      url: null,
    })
    this.gridColumnsDataGrid = this.getGridSettings();
    this.initialiseDateForm();
    this.selectedManagePageId = null;
    this.selectedMenuId = 'HM';
    this.checkScreenSize();
    
  }

  @HostListener('window:resize', [])
  onResizeWindow() {
    this.checkScreenSize();
    const width = (event.target as Window).innerWidth;
    this.handleResponsiveLayout(width);
  }

  stackingMode: 'block' | 'grid' = 'grid';
  handleResponsiveLayout(width: number) {
    if (width <= 480) {
      this.storedMobileView = JSON.parse(JSON.stringify(this.sectionsArray));
      this.sectionsArray.forEach(section => {
        section.items = this.reorderCMSItemsByPosition(section.items);
      });
      this.stackingMode = 'block';
    } else if (width > 480 && width <= 830) {
      // Stack widgets vertically (block mode)
      this.stackingMode = 'block';
    } else {
      // Use grid layout
      this.stackingMode = 'grid';
    }
    // Existing logic for restoring mobile view if needed
    if (width > 480) {
      if(this.storedMobileView && this.storedMobileView.length > 0) {
        this.sectionsArray = JSON.parse(JSON.stringify(this.storedMobileView));
        this.storedMobileView = null;
      }
      if (this.selectedMenuId !== 'TOU' && this.selectedMenuId !== 'FAQ' && this.selectedMenuId !== 'NT' && this.selectedMenuId !== 'FD' && this.selectedMenuId !== 'CU' && this.selectedMenuId !== 'PP' && this.selectedMenuId !== 'AC' && this.selectedMenuId !== 'TR' && this.selectedMenuId !== 'PR') {
        setTimeout(() => {
          this.updateSectionHeights();
        }, 200);
      }
    }
  }
  checkScreenSize() {
    this.isSmallScreen = window.innerWidth < 1290;
  }
   initialiseDateForm() {
    const now = moment().seconds(0).milliseconds(0).toDate();
    this.dateForm = this.fb.group({
      date: [now],
      hour: [now.getHours()],
      minute: [now.getMinutes()]
    });
    this.originalDate = now;
  }
  getGridSettings(): DataGridColumnHeader[] {
    return [
     
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
     
    ]
  }
  
  ngOnInit() {
    this.iframeSrc = null;

    this.fetchNavigationArray().then(() => {
      this.autoSelectHomepage();
    });

    this.initializeChartTimePeriod();
    window.addEventListener('resize', this.updateScreenWidth.bind(this));

    if (this.selectedMenuId === 'FAQ') {
      document.body.classList.add('faq-mode');
    } else {
      document.body.classList.remove('faq-mode');
    }

    this.sectionEditForm = this._formbuilder.group({
      title: new FormControl('', Validators.required)
    });

    document.addEventListener('selectionchange', () => {
      this.updateSelectedFont(); // size
      //this.updateSelectedFontFamily();  // family
    });
    this.currentUserId = window.sessionStorage.getItem('userId');
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: BeforeUnloadEvent): void {
    if (this.lockedDraftId && this.currentUserId) {
      this.releaseLockBeacon();
    }
  }

  private releaseLockBeacon(): void {
    const unlockRequest = {
      userId: this.currentUserId,
      menuId: this.lockedDraftId,
      lockAdmin: false
    };

    const url = `${environment.apiUrl}/api/CMS/SaveOrUpdateLockMenu`;
    const jsonData = JSON.stringify(unlockRequest);
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Try sendBeacon first (best for unloads)
    const beaconSuccess = navigator.sendBeacon(url, blob);

    // Fallback to fetch with keepalive (slightly more reliable)
    if (!beaconSuccess) {
      try {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: jsonData,
          keepalive: true
        });
      } catch (err) {
        console.warn('Unlock draft send failed:', err);
      }
    }
  }

  onWindowResize = () => {
    this.cdr.detectChanges();
  };
  ngAfterViewInit() {
    // Save original sections or other initialization
    this.initializeSections();

    // Listen to window resize
    this.resizeListener = this.renderer.listen('window', 'resize', () => {
      this.handleWindowResize();
    });
    // Removed selectionchange listener - font size should only update on explicit user action
  }

  ngOnDestroy() {

    document.removeEventListener('mousemove', this.onResizeMove);
    document.removeEventListener('mouseup', this.onResizeEnd);
    if (this.resizeListener) {
      this.resizeListener();
    }
    this.blobUrls.forEach(url => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    this.blobUrls.clear();
    if (this.localVideoUrl && this.localVideoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.localVideoUrl);
      this.localVideoUrl = null;
    }
    window.removeEventListener('resize', this.updateScreenWidth.bind(this));
    // Removed selectionchange listener cleanup
  }

  initializeChartTimePeriod() {
    const defaultTimePeriod = 'currentYear'; // Default time period for all charts
    this.sectionsArray.forEach((section, sectionIndex) => {
      section.items.forEach((item, itemIndex) => {
        if (item.className === 'Pie Chart' || item.className === 'Line Chart' || item.className === 'Bar Chart') {
          // Set default time period if not already set
          if (!item.selectedTimePeriod) {
            item.selectedTimePeriod = defaultTimePeriod;
          }
          
          // Ensure chart data is initialized properly
          const timePeriod = item.selectedTimePeriod || defaultTimePeriod;
          const chartDataType = item.chartDataType && ['quantity', 'sales', 'points'].includes(item.chartDataType)
            ? item.chartDataType
            : 'quantity';
          
          if (item.className === 'Pie Chart' && (!item.pieChartData || item.pieChartData.length === 0)) {
            item.pieChartData = this.pieChartDataSets[timePeriod]?.[chartDataType] || this.pieChartDataSets['currentYear']?.['quantity'] || [];
          }
          if (item.className === 'Line Chart' && (!item.lineChartData || !item.lineChartData.labels)) {
            item.lineChartData = this.lineChartDataSets[timePeriod]?.[chartDataType] || { labels: [], datasets: [] };
          }
          if (item.className === 'Bar Chart' && (!item.barChartData || !item.barChartData.labels)) {
            const barData = this.barChartDataSets[timePeriod]?.[chartDataType] || { data: { labels: [], datasets: [] } };
            item.barChartData = barData.data || { labels: [], datasets: [] };
          }
        }
      });
    });
    // Trigger change detection to ensure dropdowns reflect the initial selection
    this.changeDetectorRef.detectChanges();
    
    // Initialize chart sizes after a delay to ensure DOM is rendered
    setTimeout(() => {
      this.initializeAllChartSizes();
    }, 800);
  }
  
  initializeAllChartSizes() {
    let chartsFound = false;
    this.sectionsArray.forEach((section, sectionIndex) => {
      section.items.forEach((item, itemIndex) => {
        if (item.className === 'Pie Chart' || item.className === 'Line Chart' || item.className === 'Bar Chart') {
          chartsFound = true;
          // Set a good default size immediately
          if (!item['chartView'] || item['chartView'][0] < 150) {
            item['chartView'] = [160, 160];
          }
          this.setChartSize(item, sectionIndex, itemIndex);
        }
      });
    });
    this.changeDetectorRef.detectChanges();
    
    // Retry after a short delay if charts were found but containers might not be ready
    if (chartsFound) {
      setTimeout(() => {
        this.sectionsArray.forEach((section, sectionIndex) => {
          section.items.forEach((item, itemIndex) => {
            if (item.className === 'Pie Chart' || item.className === 'Line Chart' || item.className === 'Bar Chart') {
              this.setChartSize(item, sectionIndex, itemIndex);
            }
          });
        });
        this.changeDetectorRef.detectChanges();
      }, 800);
    }
  }
  onTimePeriodChange(timePeriod: string, item: any, chartType: string) {
    const defaultPieData = [];
    const defaultLineData = { labels: [], datasets: [] };
    const defaultBarData = { labels: [], datasets: [] };

    // Ensure chartDataType is valid
    const chartDataType = item.chartDataType && ['quantity', 'sales', 'points'].includes(item.chartDataType)
      ? item.chartDataType
      : 'quantity'; // Fallback to Quantity if undefined or invalid

    if (chartType === 'Pie Chart') {
      item.pieChartData = this.pieChartDataSets[timePeriod]?.[chartDataType] || defaultPieData;
    } else if (chartType === 'Line Chart') {
      item.lineChartData = this.lineChartDataSets[timePeriod]?.[chartDataType] || defaultLineData;
    } else if (chartType === 'Bar Chart') {
      const barData = this.barChartDataSets[timePeriod]?.[chartDataType] || {
        totalSales: 0,
        targetValue: 0,
        data: defaultBarData
      };
      this.totalSales = barData.totalSales;
      this.targetValue = barData.targetValue;
      item.barChartData = barData.data;
    }

    console.log(`ChartType: ${chartType}, TimePeriod: ${timePeriod}, ChartDataType: ${chartDataType}, Data:`,
      chartType === 'Pie Chart' ? item.pieChartData :
        chartType === 'Line Chart' ? item.lineChartData : item.barChartData);

    this.changeDetectorRef.detectChanges();
  }
  initializeSections() {
    this.sectionsArray.forEach((section, i) => {
      this.showGridBlocks[i] = false;
      this.alignmentGuides[i] = [];
      this.convertElementsToPercentages(i);
      this.initializeZIndexValues(i);
    });
    setTimeout(() => {
      this.sectionsArray.forEach((_, i) => {
        this.showGridBlocks[i] = true;
        setTimeout(() => (this.showGridBlocks[i] = false), 10);
      });
    }, 0);
  }


  convertElementsToPercentages(sectionIndex: number) {
    const sectionElement = document.querySelector(`.added-section-editing-area:nth-child(${sectionIndex + 1})`);
    if (!sectionElement) return;
    const sectionRect = sectionElement.getBoundingClientRect();
    const sectionWidth = sectionRect.width;
    const sectionHeight = sectionRect.height;
    this.sectionsArray[sectionIndex].items.forEach(item => {
      item.xPercent = (item.x / sectionWidth) * 100;
      item.yPercent = (item.y / sectionHeight) * 100;
      item.widthPercent = (item.width / sectionWidth) * 100;
      item.heightPercent = (item.height / sectionHeight) * 100;
    });
  }

  handleWindowResize() {
    this.sectionsArray.forEach((section, i) => {
      const sectionElement = document.querySelector(`.added-section-editing-area:nth-child(${i + 1})`);
      if (!sectionElement) return;
      const sectionRect = sectionElement.getBoundingClientRect();
      section.items.forEach(item => {
        this.updateElementAbsolutePosition(item, sectionRect);
        if (item.xPercent + item.widthPercent > 100) {
          item.xPercent = 100 - item.widthPercent;
          this.updateElementAbsolutePosition(item, sectionRect);
        }
        if (item.yPercent + item.heightPercent > 100) {
          item.yPercent = 100 - item.heightPercent;
          this.updateElementAbsolutePosition(item, sectionRect);
        }
      });
    });
    this.changeDetectorRef.detectChanges();
    
    // Reinitialize chart sizes on window resize
    setTimeout(() => {
      this.initializeAllChartSizes();
    }, 100);
  }

  updateElementAbsolutePosition(item: PageElement, sectionRect: DOMRect) {
    if (!sectionRect) return;

    // Calculate grid cell size
    const gridRowHeight = sectionRect.height / this.gridRows;
    const gridColWidth = sectionRect.width / this.gridColumns;

    // Convert percentages into absolute px values
    item.x = (item.xPercent / 100) * sectionRect.width;
    item.y = (item.yPercent / 100) * sectionRect.height;

    item.width = (item.widthPercent / 100) * sectionRect.width;
    item.height = (item.heightPercent / 100) * sectionRect.height;

    // Snap to grid if enabled
    if (this.snapToGrid) {
      item.x = Math.round(item.x / gridColWidth) * gridColWidth;
      item.y = Math.round(item.y / gridRowHeight) * gridRowHeight;
      item.width = Math.round(item.width / gridColWidth) * gridColWidth;
      item.height = Math.round(item.height / gridRowHeight) * gridRowHeight;
    }

  }



  snapToElement(item: PageElement, targetElement: PageElement, sectionIndex: number) {
    const targetCenterX = targetElement.xPercent + (targetElement.widthPercent / 2);
    const targetCenterY = targetElement.yPercent + (targetElement.heightPercent / 2);
    item.xPercent = targetCenterX - (item.widthPercent / 2);
    item.yPercent = targetCenterY - (item.heightPercent / 2);
    item.xPercent = Math.max(0, Math.min(100 - item.widthPercent, item.xPercent));
    item.yPercent = Math.max(0, Math.min(100 - item.heightPercent, item.yPercent));
    const sectionElement = document.querySelector(`.added-section-editing-area:nth-child(${sectionIndex + 1})`);
    if (sectionElement) {
      this.updateElementAbsolutePosition(item, sectionElement.getBoundingClientRect());
    }
    this.markElementsAsModified();
  }
  checkPageLockStatus() {
    this.GetLockPageofAdmin = window.sessionStorage.getItem('isDraftLocked') === 'true';
  }

  showLockedNotification() {
    this.notificationService.errorTopRight('This draft is currently being edited by some other admin.Please try again later');
  }
  autoSelectHomepage() {
    const homepageItem = this.navigationArray.find(item => item.menuId === 'HM');
    if (homepageItem) {
      // Find the index of the Homepage in the navigation array
      const homepageIndex = this.navigationArray.findIndex(item => item.menuId === 'HM');
      
      // Select the Homepage
      this.confirmDraftExit(homepageIndex);
    }
  }

  trackByFn(index: number, item: any): number {
    return item == undefined ? index: item.id;
  }
 @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.hasUnsavedChanges) {
      $event.returnValue = true;
    }
  }
  
  closeManagePopupForm(event) {
    event.stopPropagation(); 
    this.showManagePage = false;
    this.showMenuManagePage = false;
  }

  confirmDraftExit(i) {
    // Clear selection in navigation array except the selected one
    this.navigationArray.forEach((items, index) => {
      if(i === index) {
        items['selected'] = true;
        this.showChild = false;
        this.fetchCMSMenu();
        this.getLogoHeader();
        this.selectedManagePageId = items.id;
        this.selectedManagePage = items;
        this.previousStateStogage = []
        this.currentStateIndex = 0;
        
        // Clear selected draft ID
        this.selectedDraftId = null;
        
        this.manageWebsiteService.GetKeyValidation(this.selectedManagePageId, 'publish').subscribe((validationResp) => {
          if((validationResp?.id && validationResp?.key && validationResp?.validDateTime) && !validationResp?.expire) {
            const utcDate = new Date(validationResp?.validDateTime + 'Z');
            const estDate = new Intl.DateTimeFormat('en-US', {
              timeZone: 'America/New_York',
              month: '2-digit', day: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit', hour12: false
            }).format(utcDate);
            this.publishLinkDate = estDate.replace(',', '');
          } else {
            this.publishLinkDate = null;
          }
        });
        
        this.getPublishedContainers();
      } else {
        items['selected'] = false;
      }
    });
    
    // IMPORTANT: Explicitly deselect all draft items
    if (this.draftItems && this.draftItems.length > 0) {
      this.draftItems.forEach(draft => {
        draft['selected'] = false;
        
        // Also close any open submenus
        draft['showSubMenu'] = false;
      });
    }
    
    this.exitEditing();
  }

  selectPage(item, i, popup) {
    this.showTypeSelectionPopup = false;
    this.selectedMenuId= item.menuId;
    this.selectedDraftId='';   
    this.showChild = true;
    if(this.editChild) {
      this.switchDraftIndex = i;
      this.changeSelectedPage = item;
      this.isPublishPageSelected = true;
      this.modalReference = this._matDialog.open(popup);
    } else {
      this.showPRAddFrom = false;
      this.storedMobileView = false;
      switch (item.menuId) {
        case 'FAQ':        
          this.showChild = false;    
          this.addSection = false;
          this.exitEditing();
          this.isPublishedView =true;
          this.selectedDraftId = item.id;
          this.selectOtherPage('FAQ');
          //  this.selectedDraftId = item.id;
          // this.selectFQ();
          break;
        case 'TOU':    
          this.showChild = false;    
          this.addSection = false;
          this.exitEditing();
          this.isPublishedView = true;
          this.selectedDraftId = item.id;
          this.selectTOU();
          break;
        case 'NT':    
          this.showChild = false;    
          this.addSection = false;
          this.exitEditing();
          this.isPublishedView =true;
          this.selectedDraftId = item.id;
          this.selectOtherPage('NT');
          break;
        case 'FD':    
          this.showChild = false;    
          this.addSection = false;
          this.exitEditing();
          this.isPublishedView =true;
          this.selectedDraftId = item.id;
          this.selectOtherPage('FD');
          break;
        case 'CU':
            this.showChild = false;    
            this.addSection = false;
            this.exitEditing();
            this.isPublishedView =true;
            this.selectedDraftId = item.id;
            this.selectCU();
            break;
        case 'PP':
          this.showChild = false;    
          this.addSection = false;
          this.exitEditing();
          this.isPublishedView =true;
          this.selectedDraftId = item.id;
          this.selectPP();
          break;
        case 'AC':
          this.showChild = false;
          this.addSection = false;
          this.exitEditing();
          this.isPublishedView = true;
          this.selectedDraftId = item.id;
          this.selectOtherPage('AC');
          //this.selectAC();
          break;
        case 'TR':
          this.showChild = false;
          this.addSection = false;
          this.exitEditing();
          this.isPublishedView = true;
          this.selectedDraftId = item.id;
          this.selectOtherPage('TR');
          //this.selectPR();
          break;
          case 'PR':
            this.showChild = false;
            this.addSection = false;
            this.exitEditing();
            this.isPublishedView = true;
            this.selectedDraftId = item.id;
            this.selectOtherPage('PR');
            //this.selectPR();
            break;
        default:
          this.confirmDraftExit(i);
          break;
      } 
    }
  }
  confirmExitEditing() {
    this.exitEditing();
    this.getContainers();
    this.getLogoHeader();
    this.fetchCMSMenu()
    this.closeModel();
  }
  navigateToHome() {
     if (this.lockedDraftId) {
        const unlockRequest = {
            userId: this.currentUserId,
            menuId: this.lockedDraftId,
            lockAdmin: false 
        };

        this.manageWebsiteService.SaveorUpdateLockDraftPage(unlockRequest).subscribe({
            next: () => {
                this.lockedDraftId = null; // Clear the lock state
                this.GetLockPageofAdmin = false; // Reset the flag
            },
            error: (err) => {
                console.error('Failed to release lock:', err);
            }
        });
    }
    this.router.navigate(['/incentive-admin-home'])
  }
  selectChild() {
    this.showChild = true;
    this.navigationArray.forEach((items, index) => {
      items['selected'] = false;
    })
    const homePage = this.navigationArray.filter(x => x.menuId === 'HM')
    this.selectedManagePageId = homePage[0].id;
    this.manageWebsiteService.GetKeyValidation(this.selectedManagePageId, 'draft').subscribe((validationResp) => {
      if((validationResp?.id && validationResp?.key && validationResp?.validDateTime) && !validationResp?.expire) {
        const utcDate = new Date(validationResp?.validDateTime + 'Z');
        const estDate = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/New_York',
          month: '2-digit', day: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: false
        }).format(utcDate);
        this.shareLinkDate = estDate.replace(',', '');
      } else {
        this.shareLinkDate = null;
      }
    })
    this.getContainers();
    this.getLogoHeader();
    this.fetchCMSMenu()
  }
  selectFQ() {
    this.showChild = true;
    this.navigationArray.forEach((items, index) => {     
      if(items.menuId === 'FAQ') {        
        items['selected'] = true;
        }else{
        items['selected'] = false;
        }
    })
    const homePage = this.navigationArray.filter(x => x.menuId === 'FAQ')
    this.selectedManagePageId = homePage[0].id;
    this.selectedManagePage = homePage[0];
    this.getContainers();
    this.getLogoHeader();
    this.fetchCMSMenu()
  }
  selectOtherPage(type) {
    // this.showChild = true;
    this.navigationArray.forEach((items, index) => {
      if(items.menuId === type) {        
      items['selected'] = true;
      }else{
      items['selected'] = false;
      }
    })
    const homePage = this.navigationArray.filter(x => x.menuId === type)
    this.selectedManagePageId = homePage[0].id;
    this.selectedManagePage = homePage[0];
    this.getPublishedContainers();
    this.getLogoHeader();
    this.fetchCMSMenu()
  }
  selectTOU() {
    // this.showChild = true;
    this.navigationArray.forEach((items, index) => {
      if(items.menuId === 'TOU') {        
      items['selected'] = true;
      }else{
      items['selected'] = false;
      }
    })
    const homePage = this.navigationArray.filter(x => x.menuId === 'TOU')
    this.selectedManagePageId = homePage[0].id;
    this.selectedManagePage = homePage[0];
    this.getPublishedContainers();
    this.getLogoHeader();
    this.fetchCMSMenu()
  }
  selectCU(){

    this.navigationArray.forEach((items, index) => {
      if(items.menuId === 'CU') {        
      items['selected'] = true;
      }else{
      items['selected'] = false;
      }
    })
    const homePage = this.navigationArray.filter(x => x.menuId === 'CU')
    this.selectedManagePageId = homePage[0].id;
    this.selectedManagePage = homePage[0];
    this.getPublishedContainers();
    this.getLogoHeader();
    this.fetchCMSMenu()
  }  

  selectPP() {
    // this.showChild = true;
    this.navigationArray.forEach((items, index) => {
      if(items.menuId === 'PP') {        
      items['selected'] = true;
      }else{
      items['selected'] = false;
      }
    })
    const homePage = this.navigationArray.filter(x => x.menuId === 'PP')
    this.selectedManagePageId = homePage[0].id;
    this.selectedManagePage = homePage[0];
    this.getPublishedContainers();
    this.getLogoHeader();
    this.fetchCMSMenu()
  }
  deleteSlidePermanently(i, item) {
    this.manageWebsiteService.DeleteCMSContainerFile(item.getAllCMSItemViews[item['selectedIndex']].id,item.id, {}).subscribe((resp) => {
      item.getAllCMSItemViews.splice(item['selectedIndex'], 1);
      if(item.getAllCMSItemViews.length === 0) {
        this.sectionsArray.splice(i, 1);
       
      }
      for (let sections of this.previousStateStogage) {
        for (let panelItem of sections) {
          if (panelItem.type === 'panel') {
            panelItem.getAllCMSItemViews = panelItem.getAllCMSItemViews.filter(
              (imageItem) => imageItem.id !== item.getAllCMSItemViews[item['selectedIndex']].id
            );
          }
        }
      }
      this.closeModel()
    })
  }
  removeContainer(i: number, item: any, content: any) {
    if (item.type === 'panel' && item.getAllCMSItemViews && item.getAllCMSItemViews.length > 0) {
      const selectedIndex = item.selectedIndex || 0;
      const selectedItem = item.getAllCMSItemViews[selectedIndex];
      
      if (selectedItem && (selectedItem.id === '00000000-0000-0000-0000-000000000000' || !selectedItem.id)) {
        item.getAllCMSItemViews.splice(selectedIndex, 1);
        if (item.getAllCMSItemViews.length === 0) {
          this.sectionsArray.splice(i, 1);
        }
        this.storeState();
      } else {
        this.containerIndex = i;
        this.slideContainertoRemove = item;
        this.modalReference = this._matDialog.open(content);
      }
    } else {
      this.sectionsArray.splice(i, 1);
      this.storeState();
    }
  }

  onDateChange(event: any): void {
    this.updateSelectedDateTime();
  }

  onTimeChange(): void {
    this.updateSelectedDateTime();
  }

  updateSelectedDateTime() {
    const date = this.dateForm.get('date')?.value;
    const hour = this.dateForm.get('hour')?.value;
    const minute = this.dateForm.get('minute')?.value;

    if (date && hour != null && minute != null) {
      const newDate = moment(date)
        .set({ hour, minute, second: 0, millisecond: 0 })
        .toDate();
      this.originalDate = newDate;
    }
  }

  updateDateTimeToNow() {
    const now = moment().seconds(0).milliseconds(0).toDate();
    this.dateForm.patchValue({
      date: now,
      hour: now.getHours(),
      minute: now.getMinutes()
    });
    this.originalDate = now;
  }

  isDateValids(): boolean {
    const date = this.dateForm.get('date')?.value;
    const hour = this.dateForm.get('hour')?.value;
    const minute = this.dateForm.get('minute')?.value;

    if (date && hour != null && minute != null) {
      const selectedDate = moment(date)
        .set({ hour, minute, second: 0, millisecond: 0 });
      return selectedDate.isAfter(moment());
    }
    return false;
  }

  displayFn = (date: any): string => {
    if (!date) return '';
    const hour = this.dateForm.get('hour')?.value;
    const minute = this.dateForm.get('minute')?.value;
    if (hour != null && minute != null) {
      return moment(date)
        .set({ hour, minute })
        .format('MM/DD/YYYY, HH:mm');
    }
    return moment(date).format('MM/DD/YYYY');
  };
  get formattedDate(): string {
    const date = this.dateForm.get('date')?.value;
    const hour = this.dateForm.get('hour')?.value;
    const minute = this.dateForm.get('minute')?.value;
    
    if (date && hour != null && minute != null) {
      return moment(date)
        .set({ hour, minute })
        .format('MM/DD/YYYY, HH:mm');
    }
    return date ? moment(date).format('MM/DD/YYYY') : '';
  }

  padZero(num: number, size: number = 2): string {
    let s = num.toString();
    while (s.length < size) s = '0' + s;
    return s;
  }
  changeSubLink(items, i) {
    this.sideNavSubItemArray.forEach((item, index) => {
      if(index === i) {
        item['showLink'] = true;
        this.showLink = true
        this.previousLink = item.routerLink;
      } else {
        item['showLink'] = false;
      }
    })
    this.isChild = true;
    this.sideNavArray.forEach((item) => {
      item['showLink'] = false;
    })
  }
  changeLink(items, i) {
    this.sideNavArray.forEach((item, index) => {
      if(index === i) {
        item['showLink'] = true;
        this.showLink = true
        this.previousLink = item.routerLink;
      } else {
        item['showLink'] = false;
      }
    })
    this.isChild = false;
    this.sideNavSubItemArray.forEach((item) => {
      item['showLink'] = false;
    })
  }
  checkSlideValidation(containerIndex: number) {
    const container = this.sectionContainer.items[containerIndex];
    const slideContainer = this.getSlideContainerForContainer(containerIndex);
    
    if (container['isVideo']) {
      return !!(slideContainer[0].Content || slideContainer[0].url);
    } else {
      return slideContainer.every(item => item.url);
    }
  }
  
  checkBannerSlideValidation(containerIndex: number) {
    const container = this.sectionContainer.items[containerIndex];
    const slideContainer = this.getSlideContainerForContainer(containerIndex);
    
    if (container['isVideo']) {
      return !!(slideContainer[0].Content || slideContainer[0].url);
    } else {
      return slideContainer.every(item => item.url);
    }
  }
  
  openSlideTemplateDialog(isVideo: boolean, content: any, containerIndex: number) {
    const container = this.sectionContainer.items[containerIndex];
    const slideContainer = this.getSlideContainerForContainer(containerIndex);
    
    container['isVideo'] = isVideo;
    this.sliderFlag = isVideo;
    
    if ((slideContainer.length === 1 && slideContainer[0].url) ||
        slideContainer.length > 1 ||
        (slideContainer.length === 1 && slideContainer[0].Content)) {
      this.modalReference = this._matDialog.open(content);
    } else {
      this.selectslideType(this.sliderFlag, containerIndex);
    }
  }
  
  selectslideType(isVideo: boolean, containerIndex: number) {
    const container = this.sectionContainer.items[containerIndex];
    container['isVideo'] = isVideo;
    
    this.slideContainers[containerIndex] = [{
      "id": '00000000-0000-0000-0000-000000000000',
      "isVideo": isVideo,
      "uniqueId": this.getNanoTimestampWithRandomString(),
      "url": "",
      "Content": "",
      "bannerHeading": "",
      "bannerSubHeading": "",
      "newHeadings": [
        {
          "text": "<p><span style=\"font-size:24px;\"><span style=\"color:#ffffff;\">​​​​​​​NEWS YOU CAN USE</span></span></p>\n",
          "x": 2.76100086281277,
          "y": 13.768115942028986
        },
        {
          "text": "<h2><span style=\"color:#ffffff;\">​​​​​​​Q1 2025 Program Overview</span></h2>\n",
          "x": 2.76100086281277,
          "y": 24.879227053140095
        },
        {
          "text": "<p><span style=\"color:#ffffff;\"><span style=\"font-size:24px;\">​​​​​​​Learn more about the Kohler Preferred Partners Program today!</span></span></p>\n",
          "x": 2.8472821397756687,
          "y": 43.47826086956522
        }
      ],
      "type": isVideo ? "Video" : "image",
      "panelType": "panel",
      "fullBleed": "",
      "fitWidth": "",
      "opacity": ""
    }];
    
    // Show the panel for this container
    container['showPanel'] = true;
  }
  
  cancelLinkChange(items) {
    this.showLink = false
    items['showLink'] = !items['showLink']
    items.routerLink = this.previousLink;
  }
  saveLinkChange() {
    if (this.previousLink) {
      const urlRegex = /^(https?:\/\/|www\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[^\s]*)?$/;
      const isValid = urlRegex.test(this.previousLink);

      if (!isValid) {
        this.notificationService.errorTopRight('Please enter a valid URL.');
        return;
      }
    }
    if(this.isChild) {
      this.sideNavSubItemArray.forEach((item) => {
        if(item['showLink']) {
          this.showLink = false
          item.routerLink = this.previousLink;
        }
        item['showLink'] = false;
      })
    } else {
      this.sideNavArray.forEach((item) => {
        if(item['showLink']) {
          this.showLink = false
          item.routerLink = this.previousLink;
        }
        item['showLink'] = false;
      })
    }
  }
  GetAllCMTempalteFile() {
    this.manageWebsiteService.GetAllCMTempalteFile().subscribe((resp) => {
      if(resp.length && resp.length > 0) {
        this.TemplatesArray = resp;
        this.showTemplateswindow = true;
      } else {
        this.TemplatesArray = [];
        this.notificationService.errorTopRight('No templates found.')
      }
    })
  }
  
  confirmDeleteCMSTempalteFile() {
    this.manageWebsiteService.DeleteCMSTempalteFile(this.deleteItem.id).subscribe((resp) => {
      if (resp.isSuccess) {
        this.notificationService.successTopRight('Template deleted successfully.');
        this.GetAllCMTempalteFile();
      }
      this.modalReference.close(); // Close the dialog
    });
  }  
  openTemplatePopup() {
    this.GetAllCMTempalteFile()
  }
  
  changeEditHeader() {
    if (this.editHeaderFlag) {
      this.bulkSave();
    } else {
      this.sideNavArray.forEach((item) => {
        item['isEdit'] = false;
      });
      this.editHeaderFlag = true;
      this.fetchCMSMenuAfterSubmit();
    }
  }
  openPublishDraftSchedule(item: any, i: number, content: any): void {
    this.draftItem = item;
    this.modalReference = this._matDialog.open(content);
  }

  openDraftSchedule(content) {
    this.modalReference = this._matDialog.open(content);
  }
  scheduleJob() {
    const date = this.dateForm.get('date')?.value;
    const hour = this.dateForm.get('hour')?.value;
    const minute = this.dateForm.get('minute')?.value;

    if (date && hour != null && minute != null) {
      const scheduleDateTime = moment(date)
        .set({ hour, minute, second: 0, millisecond: 0 })
        .toDate();

      this.manageWebsiteService.GetAllCMSMenu(true).subscribe((containerResp) => {
        this.manageWebsiteService.GetAllCMSHeader(false).subscribe((headerResp) => {
          this.manageWebsiteService.GetAllCMSContainer(this.selectedManagePageId, false).subscribe((resp) => {
            const reqObj = {
              scheduleDateTime,
              cmsHeaderview: headerResp[0],
              lmsSlideGroupView: containerResp,
              cmsContainerView: resp
                .filter((items) => !(items.type === 'panel' && (!items.getAllCMSItemViews || items.getAllCMSItemViews.length === 0)))
                .map((items) => ({
                  type: items.type,
                  className: items.className,
                  containerId: items.containerId,
                  id: items.id,
                  isVideo: items.isVideo,
                  text: items.text,
                  chartHeading: items.chartHeading,
                  salesHeading: items.salesHeading,
                  cmsItemViews: items.getAllCMSItemViews && items.getAllCMSItemViews.length > 0
                    ? items.getAllCMSItemViews.map((item) => ({
                        templateId: items.type ? item.id : null,
                        isVideo: item.isVideo,
                        bannerHeading: item.bannerHeading,
                        newHeadings: item.newHeadings,
                        uniqueId: item.uniqueId,
                        bannerSubHeading: item.bannerSubHeading,
                      })) 
                    : items.getAllCMSItemViews,
                  iFrame: this.sanitizer.bypassSecurityTrustResourceUrl(items.iFrame)
                }))
            };

            const isRestoreDraft = this.selectedDraftItem?.symbolName === "Draft Restored";

            this.manageWebsiteService.ScheduleJob(this.draftItem.id, reqObj, this.selectedMenuId, isRestoreDraft).subscribe((resp) => {
              if (resp.isSuccess) {
                this.notificationService.successTopRight('Draft scheduled successfully.');
                this.fetchNavigationArray();
                this.modalReference.close();
                this.initialiseDateForm();
              } else {
                this.notificationService.errorTopRight('Something went wrong.');
              }
            });
          });
        });
      });
    } else {
      this.notificationService.errorTopRight('Please select a valid date and time to schedule the draft.');
      this.dateForm.markAllAsTouched();
    }
  }
  createHomePageDraftPopup(content) {
    this.modalReference = this._matDialog.open(content, {
      width: '500px',
      minWidth: '400px',
      maxWidth: '90vw'
    });
  }
  createdeleteDraftPopup(item, content) {
    this.MenuName = item.menuName;
    this.deleteDraftItem = item;
    this.modalReference = this._matDialog.open(content);
  }
  
  async deleteDraftMenuItem() {
    if (!this.deleteDraftItem) return;
    
    if (this.MenuName && !this.deletedMenuNames.includes(this.MenuName)) {
      this.deletedMenuNames.push(this.MenuName);
    }
    
    if(this.deleteDraftItem.subMenuId) {
      const itemIndex = this.sideNavSubItemArray.findIndex((item) => item.id === this.deleteDraftItem.id);
      if (itemIndex !== -1) {
        this.sideNavSubItemArray.splice(itemIndex, 1);
      }
    } else {
      const itemIndex = this.sideNavArray.findIndex((item) => item.id === this.deleteDraftItem.id);
      if (itemIndex !== -1) {
        this.sideNavArray.splice(itemIndex, 1);
      }
    }
    
    try {
      const resp = await this.manageWebsiteService.DeleteCMSMenu({}, this.deleteDraftItem.id).toPromise();
      if (resp.isSuccess) {
        this.notificationService.successTopRight('Page Deleted Successfully.');
        this.hideAddNavOption = false;
        if(this.deleteDraftItem.menuId === 'collapsable') {
          for (const subItem of this.sideNavSubItemArray) {
            if (this.deleteDraftItem.id === subItem.subMenuId && subItem.menuId !== 'KRC' && subItem.menuId !== 'KRGC') {
              try {
                const subResp = await this.manageWebsiteService.DeleteCMSMenu({}, subItem.id).toPromise();
                if (subResp.isSuccess) {
                  this.sideNavSubItemArray = this.sideNavSubItemArray.filter(item => item.id !== subItem.id);
                }
              } catch (error) {
                console.log('Error deleting sub-menu item.');
              }
            }
          }
        }
        this.modalReference.close();
      } else {
        this.notificationService.errorTopRight('Something went wrong.');
      }
    } catch (error) {
      this.notificationService.errorTopRight('Error deleting page.');
    }
  }
  
  createHomePageDraft(value) {
    this.manageWebsiteService.Save5drafts(this.selectedManagePage.menuId).subscribe((resp) => {
      if (resp.isSuccess) {
        const newDraftId = resp.id; // Store the new draft ID
        
        this.manageWebsiteService.RecallPublishDataInDraft({}, newDraftId,this.selectedManagePage.menuId,true).subscribe((recallResp) => {
          const reqObj = [];
          this.navigationArray.forEach((nav) => {
            if (nav.menuId === this.selectedMenuId) {
              nav.draftDeleted = false;
            } 
            reqObj.push({ ...nav });
          });
          this.previousStateStogage = []
          this.currentStateIndex = 0;
          
          // Fetch the updated navigation array and select the new draft
          this.fetchNavigationArray().then(() => {
            // Find and select the newly created draft
            this.selectNewlyCreatedDraft(newDraftId);
          });
          
          this.notificationService.successTopRight('Draft Created Successfully');
          if (this.modalReference) {
            this.modalReference.close();
          }
        });
      } else {
        this.notificationService.errorTopRight('Draft name already exists');
      }
    });
     // this.manageWebsiteService.CloneCMSMenu(false).subscribe((cloneResp) => {
    //   if(cloneResp.isSuccess) {
    
    //   }
    // })
  }
  
  selectNewlyCreatedDraft(draftId: string) {
    const newDraft = this.draftItems.find(draft => draft.id === draftId);
    if (newDraft) {
      this.selectedDraftId = draftId;
      
      // Deselect all items in navigationArray
      this.navigationArray.forEach(navItem => {
        navItem['selected'] = false;
      });
      
      // Deselect all other drafts and select the new one
      this.draftItems.forEach(draft => {
        draft['selected'] = draft.id === draftId;
        
        if (draft['selected']) {
          this.selectedDraftItem = draft;
        }
      });
      
      // Call your existing selectDraft method if it handles additional logic
      this.selectDraft(newDraft);
      
      // Optionally scroll to the draft item
      setTimeout(() => {
        const draftElement = document.querySelector(`[data-draft-id="${draftId}"]`);
        if (draftElement) {
          draftElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300); // Slightly longer timeout to ensure DOM is updated
    }
  }

  deletePageDraft() {
    const req = {
      menuId: this.draftItem.id
    }
    
    // Store the ID of the draft being deleted
    const deletedDraftId = this.draftItem.id;
    
    this.manageWebsiteService.DraftDelete(req).subscribe((resp) => {
      if(resp.isSuccess) {
        const reqObj = [];
        this.navigationArray.forEach((nav) => {
          if (nav.id === deletedDraftId) {
            nav.draftDeleted = true;
          }
          reqObj.push({ ...nav });
        });
        
        this.manageWebsiteService.BulkSaveOrUpdateCMSMenu(reqObj, false).subscribe((resp) => {
          if (resp.isSuccess) {
            this.showChild = false;
            this.selectedManagePageId = null;
            this.selectedDraftId = null;
            
            // Fetch updated navigation array
            this.fetchNavigationArray().then(() => {
              this.selectHomepage();
            });
            
            this.getLogoHeader();
            this.notificationService.successTopRight('Draft deleted Successfully');
          } else {
            this.notificationService.errorTopRight('Something went wrong.');
          }
        })
      } else {
        this.manageWebsiteService.GetAllCMSContainer(deletedDraftId, false).subscribe((resp) => {
          if(!resp || resp.length === 0) {
            const reqObj = [];
            this.navigationArray.forEach((nav) => {
              if (nav.id === deletedDraftId) {
                nav.draftDeleted = true;
              }
              reqObj.push({ ...nav });
            });
            
            this.manageWebsiteService.BulkSaveOrUpdateCMSMenu(reqObj, false).subscribe((resp) => {
              if (resp.isSuccess) {
                this.showChild = false;
                this.selectedManagePageId = null;
                this.selectedDraftId = null; 
                
                this.fetchNavigationArray().then(() => {
                  this.selectHomepage();
                });
                
                this.getLogoHeader();
                this.notificationService.successTopRight('Draft deleted Successfully');
              } else {
                this.notificationService.errorTopRight('Something went wrong.');
              }
            })
          }
        })
      }
    })
  }
  
  selectHomepage() {
    this.showTypeSelectionPopup = false;
    this.fetchNavigationArray(true).then(() => {
      const homepage = this.navigationArray.find(nav => nav.menuId === 'HM');
      
      if (homepage) {
        this.navigationArray.forEach(navItem => {
          navItem['selected'] = navItem.id === homepage.id;
        });
        
        this.draftItems.forEach(draft => {
          draft['selected'] = false;
        });
        
        this.selectedManagePageId = homepage.id;
        this.selectedDraftId = null;
        this.selectedDraftItem = null;
        this.isEditingSection = null;
        this.containerPopup = false;
        this.getPublishedContainers();
      }
    });
  }
  
  cancelSchedule(item) {
    this.manageWebsiteService.CancelledScheduleJob({
      menuId: item.id,
      currentJobId: item.scheduledId
    }).subscribe((resp) => {
      if (resp.isSuccess) {
        this.notificationService.successTopRight('Scheduled cancelled successfully.');
        this.fetchNavigationArray(true).then(() => {
          const draft = this.draftItems.find(d => d.id === item.id);
          if (draft) {
            this.selectDraft(draft);
          }
        });
  
      } else {
        this.notificationService.errorTopRight('Something went wrong.');
      }
    });
  }

  publishPage(item, exitDraftDialog) {
    const publishedPageId = this.selectedDraftItem?.id;
        
    if (!publishedPageId) {
      this.notificationService.errorTopRight('Cannot find published homepage ID.');
      return;
    }
        
    this.manageWebsiteService.CheckScheduledDraftAlreadyExists().subscribe(
      (response: any) => {
        if (response.isSuccess) {
          this.openScheduledDraftWarningDialog();
        } else {
          this.proceedWithPublishing(item, publishedPageId, exitDraftDialog);
        }
      },
      (error) => {
        console.error('Error checking scheduled draft:', error);
        this.notificationService.errorTopRight('Error checking scheduled drafts.');
      }
    );
  }
  // Updated method with proper null checks
  proceedWithPublishing(item, publishedPageId, exitDraftDialog) {
    let storedPublishedMenuId = this.selectedMenuId;
    this.manageWebsiteService.GetAllCMSContainer(publishedPageId, false).subscribe((containerResp) => {
      if (!containerResp || containerResp.length === 0) {
        this.notificationService.errorTopRight('No container found for the published homepage.');
        return;
      }

      // Process the response to match the new BulkSaveOrUpdateCMSPublishContainer structure
      const publishedPageContainer = containerResp.map((section) => ({
        "id": section.id,
        "position": section.position,
        "lmsSlideGroupViews": section.getAllCMSContainerViews && section.getAllCMSContainerViews.length > 0
          ? section.getAllCMSContainerViews.map((items) => ({
            "sectionId": section.id,
            "styles": typeof items.styles === 'string' ? JSON.parse(items.styles) : (items.styles || { "top": 0, "left": 0, "height": 0, "zindex": 1 }),
            "containerSize": items.containerSize || 0,
            "type": items.type || "string",
            "containerId": items.containerId || "string",
            "position": items.position || 0,
            "isVideo": items.isVideo || false,
            "className": items.className || "string",
            "salesHeading": items.salesHeading || "string",
            "chartHeading": items.chartHeading || "string",
            "text": items.text || "string",
            "iFrame":items.iFrame || "string",
            "chartDropdown": ['Pie Chart', 'Line Chart', 'Bar Chart'].includes(item.type)
              ? (item.selectedTimePeriod || 'currentMonth')
              : '',
            "chartDataType": ['Pie Chart', 'Line Chart', 'Bar Chart'].includes(item.type)
          ? (item.chartDataType ) 
          : '',
            "cmsItemViews": (items.getAllCMSItemViews && Array.isArray(items.getAllCMSItemViews))
              ? items.getAllCMSItemViews.map((item) => ({
                "templateId": publishedPageId,
                "uniqueId": item.uniqueId || "string",
                "isVideo": item.isVideo || false,
                "bannerHeading": item.bannerHeading || "string",
                "bannerSubHeading": item.bannerSubHeading || "string",
                "newHeadings": (item.newHeadings && Array.isArray(item.newHeadings))
                  ? item.newHeadings.map((heading) => ({
                    "text": heading.text || heading || "string",
                    "x": heading.x || 0,
                    "y": heading.y || 0
                  }))
                  : []
              }))
              : []
          }))
          : []
      }));

      if (publishedPageContainer && publishedPageContainer.length > 0) {
        // Determine if the draft is a restored draft based on symbolName
        const isRestoreDraft = this.selectedDraftItem?.symbolName === "Draft Restored";

        // Update the API call to include IsRestoreDraft query parameter
        this.manageWebsiteService.BulkSaveOrUpdateCMSPublishContainer(
          publishedPageId,
          publishedPageContainer,
          this.selectedMenuId,
          isRestoreDraft
        ).subscribe((publishResp) => {
          if (publishResp.isSuccess) {
            const req = {
              menuId: publishedPageId
            };
            this.manageWebsiteService.DraftDelete(req).subscribe((resp) => {
              if (resp.isSuccess) {
                // Handle successful deletion if needed
              }
            });
            if(isRestoreDraft)
            {
            this.notificationService.successTopRight('Published Successfully');

            }
           else{
            this.notificationService.successTopRight(`${item.menuName} Published Successfully.`);
           }
            this.showChild = false;
            this.fetchCMSMenu();
            this.getLogoHeader();
            this.fetchNavigationArray();
            this.navigationArray.forEach((menuItem, menuItemIndex) => {
              if(menuItem.menuId === storedPublishedMenuId) {
                this.selectPage(menuItem, menuItemIndex, exitDraftDialog)
              }
            })
            this.modalReference.close();
          } else {
            this.notificationService.errorTopRight('Something went wrong.');
          }
        });
      } else {
        this.notificationService.errorTopRight('No container found for this page.');
      }
    });
  }
  // Method to open the warning dialog
  openScheduledDraftWarningDialog() {
    this.ScheduleNotificationModel = this._matDialog.open(this.dialogBoxNotification, {
      width: '600px',
      disableClose: true
    });
  }
  
  // Method to close the dialog
  closeModels() {
    if (this.ScheduleNotificationModel) {
      this.ScheduleNotificationModel.close();
    }
  }

  openDeleteConfirmationDialog(id: any, content: any) {
    this.deleteElement = id;
    this.modalReference = this._matDialog.open(content, {
      data: { elementId: this.deleteElement }
    });
  }

  deleteDraftMenu() {
    if (!this.deleteElement) return;
    this.manageWebsiteService.DeleteCMSMenu({}, this.deleteElement).subscribe((resp) => {
      if (resp.isSuccess) {
        this.notificationService.successTopRight('Page Deleted Successfully.');
        this.fetchCMSMenu();
        this.selectedManagePageId = null;
        this.modalReference.close();
      } else {
        this.notificationService.errorTopRight('Something went wrong.');
      }
    });
  }

 bulkSave() {
    
    this.sideNavArray.forEach((item) => {
      item['isEdit'] = false;
    });
    
    this.sideNavSubItemArray.forEach((item) => {
      item['isEdit'] = false;
    });
    
    // Filter out items with menuId starting with "DRFT_" or equal to "DRFT_RESTORED"
    const filteredSideNavArray = this.sideNavArray.filter(item => 
      !item.menuId.startsWith('DRFT_') && item.menuId !== 'DRFT_RESTORED'
    );
    
    const filteredSideNavSubItemArray = this.sideNavSubItemArray.filter(item => 
      !item.menuId.startsWith('DRFT_') && item.menuId !== 'DRFT_RESTORED'
    );
    
    let req = [
      ...filteredSideNavArray.map((items) => ({
        "id": items.id,
        "menuName": items.menuName,
        "menuId": items.menuId,
        "routerLink": items.routerLink,
        "symbolName": items.symbolName,
        "subMenuId": items.subMenuId,
        "draftDeleted": items.draftDeleted,
        "scheduledDateTime": items.scheduledDateTime,
        "scheduledId": items.scheduledId,
        "createdDateTime": items.createdDateTime,
        "modifyDateTime": items.modifyDateTime,
        "tenantCode": items.tenantCode,
        "isPublish": items.isPublish,
        "isDelete": items.isDelete,
        "isShare": items.isShare,
        "isHide": items.isHide,
        "publishedId": items.publishedId ? items.publishedId : '00000000-0000-0000-0000-000000000000'
      })),
      ...filteredSideNavSubItemArray.map((items) => ({
        "id": items.id,
        "menuName": items.menuName,
        "menuId": items.menuId,
        "routerLink": items.routerLink,
        "symbolName": items.symbolName,
        "subMenuId": items.subMenuId,
        "draftDeleted": items.draftDeleted,
        "scheduledDateTime": items.scheduledDateTime,
        "scheduledId": items.scheduledId,
        "createdDateTime": items.createdDateTime,
        "modifyDateTime": items.modifyDateTime,
        "tenantCode": items.tenantCode,
        "isPublish": items.isPublish,
        "isDelete": items.isDelete,
        "isShare": items.isShare,
        "isHide": items.isHide,
        "publishedId": items.publishedId ? items.publishedId : '00000000-0000-0000-0000-000000000000'
      }))
    ];
    
    this.manageWebsiteService.BulkSaveOrUpdateHeaderCMSMenu(req, false).subscribe((resp) => {
      if(resp.isSuccess) {
        // Call DeleteCMSMenuforNewMenu for each stored menu name
        const deletePromises = this.deletedMenuNames.map(menuName => {
          return this.manageWebsiteService.DeleteCMSMenuforNewMenu(menuName).toPromise();
        });
        
        // Wait for all delete operations to complete
        Promise.all(deletePromises)
          .then(() => {
            this.notificationService.successTopRight('Changes Saved Successfully.');
            this.fetchCMSMenu();
            this.editHeaderFlag = false;
            // Clear the stored menu names after successful deletion
            this.deletedMenuNames = [];
          })
          .catch(error => {
            console.error('Error deleting menus:', error);
            this.notificationService.errorTopRight('Error deleting some menus.');
          });
      } else {
        this.notificationService.errorTopRight('Something went wrong.');
      }
    });
  }

  processTrainingVideo() {
    this.sectionsArray.forEach((section) => {
      section.items.forEach((item) => {
        if (item.type === 'TrainingMonth' && item.text) {
          this.trainingEmbededVideo = this.sanitizer.bypassSecurityTrustResourceUrl(item.text);
        }
      });
    });
  }
  
   initializeStateManagement() {
    this.previousStateStogage = [];
    this.currentStateIndex = 0;
    this.previousStateStogage.push(this.deepCopy(this.sectionsArray));
  }
  
  showManagePagePopup() {
    this.showManagePage = true;
    this.manageForm = this._formbuilder.group({
      name: [null, Validators.required],
    })
  }
 saveManagePage(event) {
    event.stopPropagation();
    if(this.manageForm.invalid) {
      this.notificationService.errorTopRight('Please Provide Page Name')
    } else {
      let inputName = this.manageForm.value.name.toLowerCase().trim();

      let isDuplicate = this.navigationArray.some(
        (item) => item.menuName.toLowerCase().trim() === inputName
      );

      if (isDuplicate) {
        this.notificationService.errorTopRight('Please Provide Unique Name');
      }else {
        this.manageWebsiteService.SaveOrUpdateCMSMenu({
          "id": "00000000-0000-0000-0000-000000000000",
          "menuName": this.manageForm.value.name,
          "menuId": "",
          "routerLink": "",
          "symbolName": "",
          "subMenuId": "",
          "tenantCode": environment.tentantcode,
          "isHide": false,
          "isShare": true,
          "isPublish": true,
          "isDelete": true,
          "publishedId": '00000000-0000-0000-0000-000000000000'
        },false).subscribe((resp) => {
          if(resp.isSuccess) {
            this.notificationService.successTopRight('New page created successfully.')
            this.showManagePage = false;
            this.showMenuManagePage = false;
            // this.fetchCMSMenuAfterSubmit();
          }
        })
      }
    }
  }
 
 editNavigationName(items, i) {
    // items['isEdit'] = true;
    let duplicateEntry = this.sideNavArray.some(item => item['isEdit'] === true) || this.sideNavSubItemArray.some(item => item['isEdit'] === true)
    if(duplicateEntry) {
      this.notificationService.errorTopRight('Only one navigation item can be edited at a time.')
    } else {
      items['isEdit'] = true;
      this.previousValue = items.menuName
      this.hideAddNavOption = true;
    }
  }
 checkDuplicateNavigation(menuName, items) {
    if (!menuName || menuName.trim() === '') {
      this.notificationService.errorTopRight('Name cannot be empty');
      return;
    }

    let inputName = menuName.toLowerCase().trim(); // keep internal spaces

    let isDuplicate =
      this.sideNavArray.some(
        item => item.menuName.toLowerCase().trim() === inputName
      ) ||
      this.sideNavSubItemArray.some(
        item => item.menuName.toLowerCase().trim() === inputName
      );

    // Check previous value only if it exists
    let previousInputName = this.previousValue?.toLowerCase().trim() || '';

    if (isDuplicate && inputName !== previousInputName) {
      this.notificationService.errorTopRight('Please Provide Unique Name');
    } else {
      items.menuName = menuName;
      items['isEdit'] = false;
      this.hideAddNavOption = false;
    }
  }

  saveChildManageUrlPage(event) {
    event.stopPropagation();
    if (this.childNavForm.invalid) {
      this.notificationService.errorTopRight('Please fill all the mandatory fields.');
    } else {
      let inputName = this.childNavForm.value.name.toLowerCase().trim(); // keep internal spaces

      let isDuplicate =
        this.sideNavArray.some(
          item => item.menuName.toLowerCase().trim() === inputName
        ) ||
        this.sideNavSubItemArray.some(
          item => item.menuName.toLowerCase().trim() === inputName
        );

      if (isDuplicate) {
        return this.notificationService.errorTopRight('Please Provide Unique Name');
      }
      if (this.childNavForm.value.url) {
        const urlRegex = /^(https?:\/\/|www\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[^\s]*)?$/;
        const isValid = urlRegex.test(this.childNavForm.value.url);

        if (!isValid) {
          this.notificationService.errorTopRight('Please enter a valid URL.');
          return;
        }
      }
      this.manageWebsiteService.SaveOrUpdateCMSMenu({
        "id": "00000000-0000-0000-0000-000000000000",
        "menuName": this.childNavForm.value.name,
        "menuId": this.childNavForm.value.menuType,
        "routerLink": this.childNavForm.value.url ? this.childNavForm.value.url : '',
        "symbolName": "",
        "subMenuId": this.childNavForm.value.itemId,
        "tenantCode": environment.tentantcode,
        "isHide": false,
        "isShare": false,
        "isPublish": false,
        "isDelete": true,
        "publishedId": '00000000-0000-0000-0000-000000000000'
      },false).subscribe((resp) => {
        if(resp.isSuccess) {
          this.notificationService.successTopRight('New sub menu created successfully.')
          this.showManagePage = false;
          this.showMenuManagePage = false;
          this.fetchCMSMenuAfterSubmit();
        }
      })
    }
  }
  saveManageUrlPage(event) {
    event.stopPropagation();
    if(this.manageNavForm.invalid) {
      this.notificationService.errorTopRight('Please fill all the mandatory fields.')
    } else {
      let inputName = this.manageNavForm.value.name.toLowerCase().trim().replace(/\s+/g, '');
      let isDuplicate =
        this.sideNavArray.some(item => item.menuName.toLowerCase().trim().replace(/\s+/g, '') === inputName) ||
        this.sideNavSubItemArray.some(item => item.menuName.toLowerCase().trim().replace(/\s+/g, '') === inputName);
      if (isDuplicate) {
        return this.notificationService.errorTopRight('Please Provide Unique Name');
      }
      if (this.manageNavForm.value.url) {
        const urlRegex = /^(https?:\/\/|www\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[^\s]*)?$/;
        const isValid = urlRegex.test(this.manageNavForm.value.url);

        if (!isValid) {
          this.notificationService.errorTopRight('Please enter a valid URL.');
          return;
        }
      }
      this.manageWebsiteService.SaveOrUpdateCMSMenu({
        "id": "00000000-0000-0000-0000-000000000000",
        "menuName": this.manageNavForm.value.name,
        "menuId": this.manageNavForm.value.menuType,
        "routerLink": this.manageNavForm.value.url ? this.manageNavForm.value.url : '',
        "symbolName": "",
        "subMenuId": "",
        "tenantCode": environment.tentantcode,
        "isHide": false,
        "isShare": false,
        "isPublish": false,
        "isDelete": true,
        "publishedId": '00000000-0000-0000-0000-000000000000'
      },false).subscribe((resp) => {
        if(resp.isSuccess) {
          this.notificationService.successTopRight('New menu created successfully.')
          this.showManagePage = false;
          this.showMenuManagePage = false;
          this.fetchCMSMenuAfterSubmit();
        }
      })
    }
  }
  onResize(event) {
    let chartWidth = event.target.innerWidth > 1100 ? 244 : event.target.innerWidth <= 1100 && event.target.innerWidth > 700 ? event.target.innerWidth - 240 : event.target.innerWidth <= 700 && event.target.innerWidth > 400 ? event.target.innerWidth - 150 : event.target.innerWidth - 80;
    this.view = [chartWidth, 300];
  }
  extractFileNameFromUrls(url: string): string {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1] || 'existing-logo';
  }
  changeLogoPopup() {
    this.showLogoPopup = !this.showLogoPopup;

    if (this.showLogoPopup) {
      // When opening popup, initialize form and logo state
      this.siteForm.get('site')?.setValue(this.logoTitle || ''); // Set site title
      if (this.originalBase64Logo && this.originalBase64Logo.startsWith('data:image/')) {
        this.logoUrl = this.originalBase64Logo;
        this.isExistingLogo = true;
        this.file = null;
        this.fileName = this.existingFileName || 'Current Logo';
      } else if (this.logoUrl && this.logoUrl !== this.localAsset) {
        this.isExistingLogo = true;
        this.file = null;
        this.fileName = this.existingFileName || 'Current Logo';
      } else {
        this.logoUrl = this.localAsset;
        this.fileName = '';
        this.isExistingLogo = false;
      }
      // Refresh data to ensure latest API state
      this.getLogoHeader();
    } else {
      // When closing popup, reset to original state
      this.siteForm.get('site')?.enable(); // Ensure form is enabled
      if (!this.file && this.originalBase64Logo) {
        this.logoUrl = this.originalBase64Logo;
        this.fileName = this.existingFileName || 'Current Logo';
      } else if (!this.file && !this.originalBase64Logo) {
        this.logoUrl = this.localAsset;
        this.fileName = '';
      }
      this.isExistingLogo = false;
    }
  }

  getLogoHeader() {
    this.manageWebsiteService.GetAllCMSHeader(true).subscribe((resp) => {
      if (resp && resp.length > 0) {
        this.logoId = resp[0].id;
        this.logoUrl = resp[0].logo || this.localAsset; // Fallback to localAsset if logo is empty
        this.logoTitle = resp[0].title;
        this.existingFileName = resp[0].fileName || this.extractFileNameFromUrls(resp[0].logo) || 'Current Logo';
        this.originalBase64Logo = resp[0].logo || null;
        // Update form if popup is open
        if (this.showLogoPopup) {
          this.siteForm.get('site')?.setValue(this.logoTitle || '');
          this.fileName = this.existingFileName || 'Current Logo';
        }
      } else {
        this.logoUrl = this.localAsset;
        this.logoTitle = null;
        this.existingFileName = null;
        this.originalBase64Logo = null;
        this.fileName = '';
        if (this.showLogoPopup) {
          this.siteForm.get('site')?.setValue('');
        }
      }
    });
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];

      // Validate file size (5MB = 5 * 1024 * 1024 bytes)
      const maxSizeInBytes = 5 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        this.notificationService.errorTopRight('File size must be less than 5MB');
        input.value = '';
        return;
      }

      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif'];

      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        this.notificationService.errorTopRight('Please upload a valid image file (PNG, JPG, JPEG, GIF)');
        input.value = '';
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.file = reader.result as string;
        this.fileName = file.name;
        this.isExistingLogo = false;

        // Clean up previous object URL if it exists
        if (this.logoUrl && this.logoUrl.startsWith('blob:')) {
          URL.revokeObjectURL(this.logoUrl);
        }

        this.logoUrl = this.file;
        this.siteForm.get('site')?.disable();
      };
    }
  }
  clearLogo(event: Event) {
    event.stopPropagation();

    // Clean up object URL if it exists
    if (this.logoUrl && this.logoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.logoUrl);
    }

    this.file = null;
    this.fileName = '';
    this.isExistingLogo = false;
    this.logoUrl = this.localAsset;
    this.siteForm.get('site')?.enable();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  saveSiteInfo() {
    const siteTitle = this.siteForm.value.site || '';
    if (siteTitle.length > 30) {
      this.notificationService.errorTopRight('Site title cannot exceed 30 characters');
      return;
    }

    // Allow saving with just a title if no logo is provided
    if (!this.file && !this.isExistingLogo && !this.siteForm.value.site) {
      this.notificationService.errorTopRight('Either logo or site title is required');
      return;
    }

    const payload = {
      id: this.logoId,
      title: this.siteForm.get('site')?.disabled ? this.logoTitle : this.siteForm.value.site || '',
      logo: this.file || (this.isExistingLogo ? this.originalBase64Logo : ''), // Send empty string if logo is cleared
      tenantCode: environment.tentantcode,
      fileName: this.fileName || this.existingFileName || ''
    };

    this.manageWebsiteService.SaveOrUpdateCMSHeader(true, payload).subscribe((resp) => {
      if (resp.isSuccess) {
        this.getLogoHeader();
        this.showLogoPopup = false;
        this.notificationService.successTopRight('Changes saved successfully.');
      }
    });
  }

  addNewSlide() {
    this.slideContainer.push({
      "id": '00000000-0000-0000-0000-000000000000',
      "isVideo": false,
      "url": "",
      "uniqueId": this.getNanoTimestampWithRandomString(),
      "Content": "",
      "bannerHeading": "",
      "bannerSubHeading": "",
      "newHeadings": [],
      "type": "image",
      "panelType": "panel",
      "fullBleed": "",
      "fitWidth": "",
      "opacity": ""
    })
    this.sectionContainer.items[0]['isEdit'] = false;
    this.sectionContainer.items[0]['showPanel'] = true;
  }
  addNewExistingSlide(item) {
    this.slideContainer.push({
      id: '00000000-0000-0000-0000-000000000000',
      "isVideo": false,
      "url": "",
      "Content": "",
      "uniqueId": this.getNanoTimestampWithRandomString(),
      "bannerHeading": "",
      "bannerSubHeading": "",
      "newHeadings": [],
      "type": "image",
      "panelType": "panel",
      "fullBleed": "",
      "fitWidth": "",
      "opacity": ""
    })
    item['isEdit'] = false;
    item['showPanel'] = true;
  }

  editSlides(container: any, containerIndex: number) {
    container['showPanel'] = true;
    
    // Load existing slides into the slide container for editing
    if (container.getAllCMSItemViews && container.getAllCMSItemViews.length > 0) {
      this.slideContainers[containerIndex] = container.getAllCMSItemViews.map((item: any) => ({ ...item }));
      container['isVideo'] = container.getAllCMSItemViews[container['selectedIndex']]?.['isVideo'] || false;
    } else {
      // Initialize with default slide if no existing slides
      this.slideContainers[containerIndex] = [{
        "id": '00000000-0000-0000-0000-000000000000',
        "isVideo": false,
        "url": "",
        "Content": "",
        "uniqueId": this.getNanoTimestampWithRandomString(),
        "bannerHeading": "",
        "bannerSubHeading": "",
        "newHeadings": [
          {
            "text": "<p><span style=\"font-size:24px;\"><span style=\"color:#ffffff;\">​​​​​​​NEWS YOU CAN USE</span></span></p>\n",
            "x": 2.76100086281277,
            "y": 13.768115942028986
          },
          {
            "text": "<h2><span style=\"color:#ffffff;\">​​​​​​​Q1 2025 Program Overview</span></h2>\n",
            "x": 2.76100086281277,
            "y": 24.879227053140095
          },
          {
            "text": "<p><span style=\"color:#ffffff;\"><span style=\"font-size:24px;\">​​​​​​​Learn more about the Kohler Preferred Partners Program today!</span></span></p>\n",
            "x": 2.8472821397756687,
            "y": 43.47826086956522
          }
        ],
        "type": "image",
        "panelType": "panel",
        "fullBleed": "",
        "fitWidth": "",
        "opacity": ""
      }];
    }
  }
  

  deepCopyWithFile(obj: any): any {
    const copy = JSON.parse(JSON.stringify(obj));
    if (obj.getAllCMSItemViews && obj.getAllCMSItemViews.length > 0) {
      obj.getAllCMSItemViews.forEach((view: any, index: number) => {
        if (view.ImageFile instanceof File) {
          copy.getAllCMSItemViews[index].ImageFile = view.ImageFile;
        }
      });
    }
    return copy;
  }
  deepCopyContainerWithFile(getAllCMSItemViews: any): any {
    const copy = JSON.parse(JSON.stringify(getAllCMSItemViews));
    if (getAllCMSItemViews && getAllCMSItemViews.length > 0) {
      getAllCMSItemViews.forEach((view: any, index: number) => {
        if (view.ImageFile instanceof File) {
          copy[index].ImageFile = view.ImageFile;
        }
      });
    }
    return copy;
  }
      
  editExistingSlide(item, i){
    if(item.type === 'panel') {
      this.clonedSection = this.deepCopyWithFile(item)
      this.sectionContainer.items[0] = this.deepCopyWithFile(item)
      this.slideContainer = this.deepCopyContainerWithFile(item.getAllCMSItemViews);
      this.addSection = true;
    }
    this.sectionsArray.splice(i, 1)
    // this.slideContainer.push(item.getAllCMSItemViews[item['selectedIndex']])
    item['isEdit'] = true;
    item['showPanel'] = true;
  }

  removeSlide(containerIndex: number) {
    const container = this.sectionContainer.items[containerIndex];
    
    // Reset slide container for this specific container
    this.slideContainers[containerIndex] = [{
      "id": '00000000-0000-0000-0000-000000000000',
      "isVideo": false,
      "url": "",
      "Content": "",
      "uniqueId": this.getNanoTimestampWithRandomString(),
      "bannerHeading": "",
      "bannerSubHeading": "",
      "newHeadings": [
        {
          "text": "<p><span style=\"font-size:24px;\"><span style=\"color:#ffffff;\">​​​​​​​NEWS YOU CAN USE</span></span></p>\n",
          "x": 2.76100086281277,
          "y": 13.768115942028986
        },
        {
          "text": "<h2><span style=\"color:#ffffff;\">​​​​​​​Q1 2025 Program Overview</span></h2>\n",
          "x": 2.76100086281277,
          "y": 24.879227053140095
        },
        {
          "text": "<p><span style=\"color:#ffffff;\"><span style=\"font-size:24px;\">​​​​​​​Learn more about the Kohler Preferred Partners Program today!</span></span></p>\n",
          "x": 2.8472821397756687,
          "y": 43.47826086956522
        }
      ],
      "type": "image",
      "panelType": "panel",
      "fullBleed": "",
      "fitWidth": "",
      "opacity": ""
    }];
    
    container['showPanel'] = false;
    container['selectedIndex'] = 0;
    this.videoFiles = null;
  }
  
  // saveExistingSlide() {
  //   const PanelConatiner = this.sectionsArray.filter(x => x.type === 'panel');
  //   if (this.slideContainer['isEdit'] = true) {
  //     PanelConatiner[0].getAllCMSItemViews.splice(PanelConatiner[0]['selectedIndex'], 1);
  //   }
  //   PanelConatiner[0].getAllCMSItemViews.push({...this.slideContainer});
  //   PanelConatiner[0]['showPanel'] = false;
  //   PanelConatiner[0]['selectedIndex'] = 0;
  //   this.slideContainer.push({
  //     "id": '00000000-0000-0000-0000-000000000000',
  //     "isVideo": false,
  //     "url": "",
  //     "Content": "",
  //     "uniqueId": this.getNanoTimestampWithRandomString(),
  //     "bannerHeading": "",
  //     "bannerSubHeading": "",
  //     "newHeadings": [],
  //     "type": "image",
  //     "panelType": "panel",
  //     "fullBleed": "",
  //     "fitWidth": "",
  //     "opacity": ""
  //   })
  // }
  // saveSlide(containerIndex: number) {
  //   const container = this.sectionContainer.items[containerIndex];
  //   const slideContainer = this.getSlideContainerForContainer(containerIndex);
    
  //   this.videoFiles = null;
    
  //   // Deep copy the slide container to avoid reference issues
  //   container.getAllCMSItemViews = slideContainer.map(item => ({ ...item }));
    
  //   console.log(`Container ${containerIndex} getAllCMSItemViews:`, container.getAllCMSItemViews);
    
  //   container['showPanel'] = false;
  //   container['selectedIndex'] = 0;
    
  //   // Reset slide container for this specific container
  //   this.slideContainers[containerIndex] = [{
  //     "id": '00000000-0000-0000-0000-000000000000',
  //     "isVideo": false,
  //     "url": "",
  //     "Content": "",
  //     "uniqueId": this.getNanoTimestampWithRandomString(),
  //     "bannerHeading": "",
  //     "bannerSubHeading": "",
  //     "newHeadings": [
  //       {
  //         "text": "<p><span style=\"font-size:24px;\"><span style=\"color:#ffffff;\">​​​​​​​NEWS YOU CAN USE</span></span></p>\n",
  //         "x": 2.76100086281277,
  //         "y": 13.768115942028986
  //       },
  //       {
  //         "text": "<h2><span style=\"color:#ffffff;\">​​​​​​​Q1 2025 Program Overview</span></h2>\n",
  //         "x": 2.76100086281277,
  //         "y": 24.879227053140095
  //       },
  //       {
  //         "text": "<p><span style=\"color:#ffffff;\"><span style=\"font-size:24px;\">​​​​​​​Learn more about the Kohler Preferred Partners Program today!</span></span></p>\n",
  //         "x": 2.8472821397756687,
  //         "y": 43.47826086956522
  //       }
  //     ],
  //     "type": "image",
  //     "panelType": "panel",
  //     "fullBleed": "",
  //     "fitWidth": "",
  //     "opacity": ""
  //   }];
  // }
  
  onVideoFileSelect(event: Event, containerIndex: number) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['mp4', 'webm', 'ogg'];
      
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        this.notificationService.errorTopRight('Please upload a valid video file (MP4, WEBM, OGG)');
        input.value = '';
        return;
      }
      
      const blobUrl = URL.createObjectURL(file);
      const slideContainer = this.getSlideContainerForContainer(containerIndex);
      slideContainer[0].url = blobUrl;
      slideContainer[0]['VideoFile'] = file;
      slideContainer[0].Content = '';
      input.value = '';
    }
  }
  
  
  markToAddTemplate(item) {
    item['addToTemplate'] = !item['addToTemplate'];
    if(item['addToTemplate']) {
      this.notificationService.successTopRight('The image has been marked for addition to the templates. It will be added once you save the changes.')
    }
  }
  removeAddedVideoSlide(containerIndex: number) {
    const slideContainer = this.getSlideContainerForContainer(containerIndex);
    slideContainer[0].url = '';
    slideContainer[0].Content = '';
    slideContainer[0]['VideoFile'] = null;
    slideContainer[0]['EmbeddedVideo'] = '';
  }
  
  // sanitizeVideoUrl(url: string): SafeResourceUrl {
  //   return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  // }
  addNewSLide() {
    this.slideContainer.push({
      "id": '00000000-0000-0000-0000-000000000000',
      "isVideo": false,
      "url": "",
      "Content": "",
      "uniqueId": this.getNanoTimestampWithRandomString(),
      "bannerHeading": "",
      "bannerSubHeading": "",
      "newHeadings": [],
      "type": "image",
      "panelType": "panel",
      "fullBleed": "",
      "fitWidth": "",
      "opacity": ""
    })
    this.sectionContainer.items[0]['showPanel'] = true
  }
  onVideoUrlChange(value: string, containerIndex: number): void {
    const slideContainer = this.getSlideContainerForContainer(containerIndex);
    slideContainer[0].url = '';
    
    if (this.isValidVideoUrl(value)) {
      if (value.includes('vimeo.com')) {
        this.urlService.getVimeoEmbedUrl(value).subscribe((resp) => {
          const embedUrl = this.urlService.extractIframeUrl(resp.html);
          if (embedUrl === '' || embedUrl === null) {
            this.notificationService.errorTopRight('Provided URL is not valid.');
          } else {
            slideContainer[0].Content = embedUrl;
            slideContainer[0]['EmbeddedVideo'] = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
          }
        });
      } else {
        const embedUrl = this.urlService.constructEmbedUrl(value);
        if (embedUrl === '' || embedUrl === null) {
          this.notificationService.errorTopRight('Provided URL is not valid.');
        } else {
          slideContainer[0].Content = embedUrl;
          slideContainer[0]['EmbeddedVideo'] = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
        }
      }
    } else {
      slideContainer[0]['EmbeddedVideo'] = '';
      this.notificationService.errorTopRight('Please provide valid youtube or vimeo url.');
    }
  }
  
  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.sideNavArray, event.previousIndex, event.currentIndex);
  }
  dropSubItem(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.sideNavSubItemArray, event.previousIndex, event.currentIndex);
  }
  onBannerFileSelect(event: Event, item: any, containerIndex: number) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif'];
      
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        this.notificationService.errorTopRight('Please upload a valid image file (PNG, JPG, JPEG, GIF)');
        input.value = '';
        return;
      }
      
      const blobUrl = URL.createObjectURL(file);
      item.url = blobUrl;
      item['ImageFile'] = file;
      input.value = '';
    }
  }
  getVideoContent(containerIndex: number): string {
    const slideContainer = this.getSlideContainerForContainer(containerIndex);
    return slideContainer[0]?.Content || '';
  }
  
  setVideoContent(containerIndex: number, value: string): void {
    const slideContainer = this.getSlideContainerForContainer(containerIndex);
    if (slideContainer[0]) {
      slideContainer[0].Content = value;
    }
  }
  getSlideContainerForContainer(containerIndex: number): any[] {
    if (!this.slideContainers[containerIndex]) {
      this.slideContainers[containerIndex] = [{
        "id": '00000000-0000-0000-0000-000000000000',
        "isVideo": false,
        "url": "",
        "Content": "",
        "uniqueId": this.getNanoTimestampWithRandomString(),
        "bannerHeading": "",
        "bannerSubHeading": "",
        "newHeadings": [
          {
            "text": "<p><span style=\"font-size:24px;\"><span style=\"color:#ffffff;\">​​​​​​​NEWS YOU CAN USE</span></span></p>\n",
            "x": 2.76100086281277,
            "y": 13.768115942028986
          },
          {
            "text": "<h2><span style=\"color:#ffffff;\">​​​​​​​Q1 2025 Program Overview</span></h2>\n",
            "x": 2.76100086281277,
            "y": 24.879227053140095
          },
          {
            "text": "<p><span style=\"color:#ffffff;\"><span style=\"font-size:24px;\">​​​​​​​Learn more about the Kohler Preferred Partners Program today!</span></span></p>\n",
            "x": 2.8472821397756687,
            "y": 43.47826086956522
          }
        ],
        "type": "image",
        "panelType": "panel",
        "fullBleed": "",
        "fitWidth": "",
        "opacity": ""
      }];
    }
    return this.slideContainers[containerIndex];
  }
  
  

  handleMenuClick() {
    this.showMenu = this.showMenu ? false : true;
    this.showLink = false;
    this.showMenuManagePage = false;
  }
  duplicateClone(item, i) {
    const newItem = this.deepCopy(item);
    newItem.id = '00000000-0000-0000-0000-000000000000',
    newItem.containerId = this.getNanoTimestampWithRandomString(),
    this.sectionsArray.splice(i + 1, 0, newItem);
    this.storeState();
  }

  removeContainerFromSection(containerIndex: number) {
    if (containerIndex >= 0 && containerIndex < this.sectionContainer.items.length) {
      const removedContainer = this.sectionContainer.items[containerIndex];
      this.updateSectionObject(removedContainer.type, false);
      this.sectionContainer.items.splice(containerIndex, 1);
      this.showResizeDropdown = null;
    }
  }


    resizeContainerContent(container: any, oldWidth: number, newWidth: number) {
      const selectedIndex = container.selectedIndex || 0;
      if (container.getAllCMSItemViews[selectedIndex] && container.getAllCMSItemViews[selectedIndex].newHeadings) {
        const ratio = newWidth / oldWidth;
        container.getAllCMSItemViews[selectedIndex].newHeadings.forEach((textItem: any) => {
          textItem.x = textItem.x * ratio;
         
        });
      }
    }
    updateSectionObject(type: string, isAdding: boolean) {
      switch (type) {
        case 'Pie Chart':
          this.sectionObject.isPie = isAdding;
          break;
        case 'Line Chart':
          this.sectionObject.isLine = isAdding;
          break;
        case 'Bar Chart':
          this.sectionObject.isbar = isAdding;
          break;
        case 'All':
          this.sectionObject.all = isAdding;
          break;
        case 'Credit':
          this.sectionObject.credit = isAdding;
          break;
        case 'Redemptions':
          this.sectionObject.redemption = isAdding;
          break;
        case 'Messages':
          this.sectionObject.messages = isAdding;
          break;
        case 'Academy':
          this.sectionObject.academy = isAdding;
          break;
        case 'TrainingMonth':
          this.sectionObject.trainingMonth = isAdding;
          break;
        case 'Text':
          this.sectionObject.text = isAdding;
          break;
      }
    }

  getContainerClass(containerSize: string): string {
    return containerSize || 'container-full';
  }

  // Get container size label
  getContainerSizeLabel(containerSize: string): string {
    const size = this.containerSizes.find(s => s.value === containerSize);
    return size ? size.label : '100%';
  }


  addAnotherBannerImage(item) {
    const checkImages = this.slideContainer.every(item => item.url);
    if(checkImages) {
      this.slideContainer.push({
        "id": '00000000-0000-0000-0000-000000000000',
        "isVideo": false,
        "url": "",
        "Content": "",
        "uniqueId": this.getNanoTimestampWithRandomString(),
        "bannerHeading": "",
        "bannerSubHeading": "",
        "newHeadings": [
          {
            "text": "<p><span style=\"font-size:24px;\"><span style=\"color:#ffffff;\">​​​​​​​NEWS YOU CAN USE</span></span></p>\n",
            "x": 2.76100086281277,
            "y": 13.768115942028986
          },
          {
            "text": "<h2><span style=\"color:#ffffff;\">​​​​​​​Q1 2025 Program Overview</span></h2>\n",
            "x": 2.76100086281277,
            "y": 24.879227053140095
          },
          {
            "text": "<p><span style=\"color:#ffffff;\"><span style=\"font-size:24px;\">​​​​​​​Learn more about the Kohler Preferred Partners Program today!</span></span></p>\n",
            "x": 2.8472821397756687,
            "y": 43.47826086956522
          }
        ],
        "type": "image",
        "panelType": "panel",
        "fullBleed": "",
        "fitWidth": "",
        "opacity": ""
      })
    } else {
      this.notificationService.errorTopRight('Please add images to all slides.')
    }
  }

  
  addNewBannerText(item) {
    const selectedIndex = item['selectedIndex'];
    const textItems = item.getAllCMSItemViews[selectedIndex].newHeadings;
  
    const imageRef = document.querySelector('.carousel-item img') as HTMLElement;
    if (!imageRef) return;
  
    const imageRect = imageRef.getBoundingClientRect();
    const imageWidth = imageRect.width;
    const imageHeight = imageRect.height;
  
    let newX = 65;
    let newY = 65;
    const padding = 10;
    const textWidth = 100;
    const textHeight = 30;
  
    const isOverlapping = (x: number, y: number) => {
      return textItems.some(item => 
        x < item.x + textWidth + padding && 
        x + textWidth + padding > item.x &&
        y < item.y + textHeight + padding &&
        y + textHeight + padding > item.y
      );
    };
  
    while (isOverlapping(newX, newY)) {
      newX += 20;
      if (newX + textWidth > imageWidth) { 
        newX = 65;
        newY += 40;
      }
      if (newY + textHeight > imageHeight) { 
        break;
      }
    }
  
    textItems.push({ text: '', x: newX, y: newY });
  }  
  // sanitizeHtml(html: string): SafeHtml {
  //   return this.sanitizer.bypassSecurityTrustHtml(html);
  // }
 
  removeNewBannerText(i, item) {
    item.getAllCMSItemViews[this.sectionContainer.items[0]['selectedIndex']].newHeadings.splice(i, 1)
  }
  removeImageSlide(index: number, containerIndex: number) {
    const slideContainer = this.getSlideContainerForContainer(containerIndex);
    if (slideContainer.length > 1) {
      slideContainer.splice(index, 1);
    }
  }
  removeBannerImageSlide(index) {
    this.slideContainer.splice(index, 1)
    // if(this.slideContainer.length === 1 && !this.slideContainer[0]['url'])
    // this.sectionContainer.items[0].getAllCMSItemViews = [];
  }
  onDragBannerEnd(event: CdkDragEnd, textItem: any, item) {
    const { x, y } = event.source.getFreeDragPosition();
    const imgElement = document.getElementById('imageRef2') as HTMLImageElement;
    const imageRect = imgElement.getBoundingClientRect();
    
    const textElement = event.source.element.nativeElement;
    const textRect = textElement.getBoundingClientRect();
  
    textItem.x = Math.max(0, Math.min(x, imageRect.width - textRect.width));
    textItem.y = Math.max(0, Math.min(y, imageRect.height - textRect.height));
    textElement.style.transform = 'none';
  
    this.preventOverlap(textItem, textRect, true, item);
  }

  // resizeContainer(newSize: string) {
  //   const container = document.querySelector('.carousel-item') as HTMLElement;
  //   if (!container) return;

  //   const oldWidth = container.clientWidth;
  //   const oldHeight = container.clientHeight;

  //   this.sectionContainer.items[0].className = newSize;

  //   setTimeout(() => {
  //       const newWidth = container.clientWidth;
  //       const newHeight = container.clientHeight;

  //       this.sectionContainer.items[0].getAllCMSItemViews[this.sectionContainer.items[0]['selectedIndex']]
  //           .newHeadings.forEach((textItem) => {
  //               textItem.x = (textItem.x * newWidth) / oldWidth;
  //               textItem.y = (textItem.y * newHeight) / oldHeight;
  //           });
  //   }, 50);
  // }
  resizeitemContainer(newSize: string, item) {
    const container = document.querySelector('.carousel-item') as HTMLElement;
    if (!container) return;

    const oldWidth = container.clientWidth;
    const oldHeight = container.clientHeight;

    item.className = newSize;

    setTimeout(() => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;

        item.getAllCMSItemViews[item['selectedIndex']]
            .newHeadings.forEach((textItem) => {
                textItem.x = (textItem.x * newWidth) / oldWidth;
                textItem.y = (textItem.y * newHeight) / oldHeight;
            });
    }, 50);
  }

  
  
  getClass(item) {
    if(!item['addnewSection']){
      return item.className
    } else return 'w-full'
  }
  isValidVideoUrl(url: string): boolean {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
    const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/\d+/;
    return youtubeRegex.test(url) || vimeoRegex.test(url);
  }

  addSectionWithPosition(item ,i) {
    this.sectionContainer = {
      id: this.getNanoTimestampWithRandomString(),
      items: [],
    };
    if(item['addnewSection']) {
      item['addnewSection'] = !item['addnewSection']
      this.indexToPush = 0
    } else {
      this.indexToPush = i+1
      item['addnewSection'] = !item['addnewSection']
    }
  }

  fetchNavigationArray(preserveSelection = false) {
    return new Promise<void>((resolve) => {
      this.manageWebsiteService.GetAllCMSMenu(false).subscribe((res) => {
        this.enableManagePage = false;

        let currentSelectedDraftId = preserveSelection ? this.selectedDraftId : null;
        let currentSelectedPageId = preserveSelection ? this.selectedManagePageId : null;

        res.forEach((item) => {
          item['selected'] = false;
          if (item.menuId === 'HM' && item?.draftDeleted) {
            this.enableManagePage = true;
          }
          if (item.modifyDateTime) {
            const utcDate = new Date(item.modifyDateTime + 'Z');
            const estDate = new Intl.DateTimeFormat('en-US', {
              timeZone: 'America/New_York',
              month: '2-digit', day: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit', hour12: false
            }).format(utcDate);
            item['draftDate'] = estDate.replace(',', '');
          } else {
            item['draftDate'] = null;
          }
          if (item.createdDateTime) {
            const utcDate = new Date(item.createdDateTime + 'Z');
            const estDate = new Intl.DateTimeFormat('en-US', {
              timeZone: 'America/New_York',
              month: '2-digit', day: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit', hour12: false
            }).format(utcDate);
            item['publishDate'] = estDate.replace(',', '');
          } else {
            item['publishDate'] = null;
          }
          if (item.scheduledDateTime) {
            const utcDate = new Date(item.scheduledDateTime + 'Z');
            const estDate = new Intl.DateTimeFormat('en-US', {
              timeZone: 'America/New_York',
              month: '2-digit', day: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit', hour12: false
            }).format(utcDate);
            item['scheduledDate'] = estDate.replace(',', '');
          } else {
            item['scheduledDate'] = null;
          }
          // Add restoreDateTime formatting
          if (item.restoreDateTime) {
            const utcDate = new Date(item.restoreDateTime + 'Z');
            const estDate = new Intl.DateTimeFormat('en-US', {
              timeZone: 'America/New_York',
              month: '2-digit', day: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit', hour12: false
            }).format(utcDate);
            item['restoreDate'] = estDate.replace(',', '');
          } else {
            item['restoreDate'] = null;
          }

          if (item.menuId === 'HM') {
            this.publishedHomePageId = item.publishedId || item.id;
          }
        });

        this.navigationArray = res.filter(items =>
          !((items.menuId === '' && items.isPublish) ||
            (items.menuId === 'HM' && items.isPublish) ||
            (items.menuId === 'KRC') ||
            (items.menuId === 'KRGC') ||
            (items.subMenuId) ||
            (items.menuId && items.menuId.startsWith('DRFT_')))
        );

        this.draftItems = res.filter(item =>
          item.menuId && item.menuId.startsWith('DRFT_')
        );

        if (currentSelectedDraftId) {
          this.navigationArray.forEach(navItem => {
            navItem['selected'] = false;
          });
          this.draftItems.forEach(draft => {
            draft['selected'] = draft.id === currentSelectedDraftId;
            if (draft['selected']) {
              this.selectedDraftItem = draft;
            }
          });
        } else if (currentSelectedPageId) {
          this.navigationArray.forEach(navItem => {
            navItem['selected'] = navItem.id === currentSelectedPageId;
          });
          this.draftItems.forEach(draft => {
            draft['selected'] = false;
          });
        } else {
          this.navigationArray.forEach(navItem => {
            navItem['selected'] = false;
          });
          this.draftItems.forEach(draft => {
            draft['selected'] = false;
          });
        }

        this.navigationArray.sort((a, b) => {
          if (a.menuId === 'HM') return -1;
          if (b.menuId === 'HM') return 1;
          return 0;
        });
       this.draftItems.sort((a, b) => {
          // Place restored drafts at the bottom
          if (a.symbolName === 'Draft Restored' && b.symbolName !== 'Draft Restored') {
            return 1;
          }
          if (b.symbolName === 'Draft Restored' && a.symbolName !== 'Draft Restored') {
            return -1;
          }
          // For non-restored drafts or both restored, sort by modifyDateTime (newest first)
          const dateA = a.modifyDateTime ? new Date(a.modifyDateTime) : new Date(0);
          const dateB = b.modifyDateTime ? new Date(b.modifyDateTime) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        this.draftCount = this.draftItems.length;
        this.sideNavSubItemArray = res.filter(item =>
          item.menuId === 'KRC' || item.menuId === 'KRGC' || item.subMenuId
        );
        this.fetchCMSMenu()
      

        resolve();
      }, error => {
        console.error('Error fetching navigation array:', error);
        resolve();
      });
    });
  }
  
  
  fetchCMSMenuAfterSubmit() {
    this.manageWebsiteService.GetAllCMSMenu(false).subscribe((res) => {
      this.enableManagePage = false;
      
      // Process date formatting for each item
      res.forEach((item) => {
        if(item.menuId === 'HM' && item?.draftDeleted) {
          this.enableManagePage = true;
        }
        
        if(item.modifyDateTime) {
          const utcDate = new Date(item.modifyDateTime + 'Z');
          const estDate = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/New_York',
            month: '2-digit', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false
          }).format(utcDate);
          item['draftDate'] = estDate.replace(',', '');
        } else {
          item['draftDate'] = null;
        }
        
        if(item.createdDateTime) {
          const utcDate = new Date(item.createdDateTime + 'Z');
          const estDate = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/New_York',
            month: '2-digit', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false
          }).format(utcDate);
          item['publishDate'] = estDate.replace(',', '');
        } else {
          item['publishDate'] = null;
        }
        
        if(item.scheduledDateTime) {
          const utcDate = new Date(item.scheduledDateTime + 'Z')
          const estDate = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/New_York',
            month: '2-digit', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false
          }).format(utcDate);
          item['scheduledDate'] = estDate.replace(',', '');
        } else {
          item['scheduledDate'] = null;
        }
      });
      
      // Filter out items with menuId starting with "DRFT_" or equal to "DRFT_RESTORED"
      const filteredRes = res.filter(item => 
        !item.menuId.startsWith('DRFT_') && item.menuId !== 'DRFT_RESTORED'
      );
      
      // Apply your existing filtering logic on the filtered results
      this.sideNavArray = filteredRes.filter(items => 
        !((items.menuId === '' && items.isPublish) ||
          (items.menuId === 'HM' && items.isPublish) ||
          (items.menuId === 'KRC') ||
          (items.menuId === 'KRGC') || 
          (items.subMenuId))
      );
      
      this.sideNavSubItemArray = filteredRes.filter(item => 
        item.menuId === 'KRC' || item.menuId === 'KRGC' || item.subMenuId
      );
    });
  }

 fetchCMSMenu() {
  this.manageWebsiteService.GetAllCMSMenu(false).subscribe((res) => {
    this.enableManagePage = false;

    res.forEach((item) => {
      if (item.menuId === 'HM' && item?.draftDeleted) {
        this.enableManagePage = true;
      }

      // Initialize showGroup for collapsable and RD menu items
      if (item.menuId === 'collapsable' || item.menuId === 'RD') {
        item['showGroup'] = false; // Default to false (submenu hidden)
      }

      if (item.modifyDateTime) {
        const utcDate = new Date(item.modifyDateTime + 'Z');
        const estDate = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/New_York',
          month: '2-digit', day: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: false
        }).format(utcDate);
        item['draftDate'] = estDate.replace(',', '');
      } else {
        item['draftDate'] = null;
      }

      if (item.createdDateTime) {
        const utcDate = new Date(item.createdDateTime + 'Z');
        const estDate = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/New_York',
          month: '2-digit', day: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: false
        }).format(utcDate);
        item['publishDate'] = estDate.replace(',', '');
      } else {
        item['publishDate'] = null;
      }

      if (item.scheduledDateTime) {
        const utcDate = new Date(item.scheduledDateTime + 'Z');
        const estDate = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/New_York',
          month: '2-digit', day: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: false
        }).format(utcDate);
        item['scheduledDate'] = estDate.replace(',', '');
      } else {
        item['scheduledDate'] = null;
      }
    });

    const filteredRes = res.filter(item =>
      !item.menuId.startsWith('DRFT_') && item.menuId !== 'DRFT_RESTORED'
    );

    this.sideNavArray = filteredRes.filter(items =>
      !((items.menuId === '' && items.isPublish) ||
        (items.menuId === 'HM' && items.isPublish) ||
        (items.menuId === 'KRC') ||
        (items.menuId === 'KRGC') ||
        (items.subMenuId))
    );

    this.sideNavSubItemArray = filteredRes.filter(item =>
      item.menuId === 'KRC' || item.menuId === 'KRGC' || item.subMenuId
    );
    // Ensure homepage submenus are correctly associated
    // if (this.selectedManagePageId === this.publishedHomePageId) {
    //   this.showChild = true; // Ensure published homepage uses items.id
    // }
  });
}
  exitDraftConfirmation(exitDraft) {
    this.exitEditing();
    if(this.isPublishPageSelected) {
      this.selectPage(this.changeSelectedPage, this.switchDraftIndex, exitDraft)
    } else {
      this.selectDraft(this.changeSelectedDraftPage, exitDraft,this.changeSelectedPage)
    }
  }

  async selectDraft(draft, exitDraft?, parentMenu?) {
    this.containerPopup = false;
    this.showTypeSelectionPopup = false;
    this.isEditingSection = null;
    // Reset the lock status for the new selection
    this.GetLockPageofAdmin = false;

    // --- LOCKING LOGIC START ---
    try {
        // 1. Check if the draft is currently locked
        const lockCheckResArray = await this.manageWebsiteService.GetLockDraftPage(draft.id).toPromise();
        const lockCheckRes = lockCheckResArray && lockCheckResArray.length > 0 ? lockCheckResArray[0] : null;

        let shouldAcquireLock = true;

        if (lockCheckRes && lockCheckRes.userId && lockCheckRes.lockAdmin === true) {
            if (lockCheckRes.userId !== this.currentUserId) {
                // Scenario 1: Lock held by ANOTHER user
                this.GetLockPageofAdmin = true; // Set the flag to true to disable editing controls
                console.log(`Draft locked by another admin (User ID: ${lockCheckRes.userId}). Allowing view access.`);
                shouldAcquireLock = false; // PREVENT the current user from trying to acquire the lock
            } else {
                // Lock held by CURRENT user - proceed to re-acquire/update lock status
                console.log(`Lock already held by current user: ${this.currentUserId}. Reacquiring/updating lock.`);
            }
        }
        
        // 2. Unlock the previously held draft if a different draft was selected
        if (this.lockedDraftId && this.lockedDraftId !== draft.id) {
            console.log(`Unlocking previous draft: ${this.lockedDraftId}`);
            const unlockRequest = {
                userId: this.currentUserId,
                menuId: this.lockedDraftId,
                lockAdmin: false // Signal to release the lock
            };
            await this.manageWebsiteService.SaveorUpdateLockDraftPage(unlockRequest).toPromise();
            this.lockedDraftId = null;
        }

        // 3. Acquire/Update the lock for the new draft (Scenario 2)
        if (shouldAcquireLock) {
            const lockRequest = {
                userId: this.currentUserId,
                menuId: draft.id,
                lockAdmin: true
            };

            await this.manageWebsiteService.SaveorUpdateLockDraftPage(lockRequest).toPromise();
            this.lockedDraftId = draft.id; // Record the new lock
        }

    } catch (error) {
        // Handle API failure. Allow viewing but keep UI controls disabled as a precaution.
        console.error('Locking API failed:', error);
        this.GetLockPageofAdmin = true; // Set to true to disable editing controls
        // NO ALERT or RETURN here, allow the user to continue to the view mode.
    }

    if (this.editChild && exitDraft) {
        this.changeSelectedPage = parentMenu;
        this.changeSelectedDraftPage = draft;
        this.isPublishPageSelected = false;
        this.switchDraftIndex = this.getDraftIndex(draft);
        this.modalReference = this._matDialog.open(exitDraft);
    } else {
        this.showPRAddFrom = false;
        this.storedMobileView = null;
        if (parentMenu?.menuId != null && parentMenu?.menuId != undefined && parentMenu?.menuId != '') {
            this.selectedManagePage = parentMenu;
            this.selectedMenuId = parentMenu.menuId;
        }
        this.previousStateStogage = []
        this.currentStateIndex = 0;
        this.showChild = true;
        // this.fetchNavigationArray();

        this.selectedDraftItem = draft;

        this.navigationArray.forEach(item => {
            item['selected'] = false;
        });

        this.draftItems.forEach(item => {
            item['selected'] = item.id === draft.id;
        });

        this.selectedDraftId = draft.id;
        this.showChild = true;
        this.manageWebsiteService.GetKeyValidation(this.selectedDraftId, 'draft').subscribe((validationResp) => {
            if(!(validationResp?.id && validationResp?.key && validationResp?.validDateTime) || validationResp?.expire) {
                this.shareLinkDate = null;
                this.LinkDate = null;
            } else {
                const baseUrl = window.location.origin;
                const fullUrl = `${baseUrl}/IncentiveWeb/shared-published-page?id=${validationResp.id}&key=${validationResp.key}&isd=false`;
                this.sharedUrl = fullUrl;
                if(validationResp?.validDateTime) {
                    const utcDate = new Date(validationResp?.validDateTime + 'Z');
                    const estDate = new Intl.DateTimeFormat('en-US', {
                        timeZone: 'America/New_York',
                        month: '2-digit', day: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', hour12: false
                    }).format(utcDate);
                    this.LinkDate = estDate.replace(',', '');
                    this.shareLinkDate = estDate.replace(',', '');
                } else {
                    this.shareLinkDate = null;
                    this.LinkDate = null;
                }
            }
        })

        this.getContainersForDraft();
        this.fetchNavigationArray(true);
        this.getLogoHeader();
    }
}
  
  // Helper method to get draft index
  getDraftIndex(draft: any): number {
    return this.draftItems.findIndex(item => item.id === draft.id);
  }
  canShowDraftAction(draft: any, actionType: string): boolean {
    if (!draft) return false;
      
    if (draft.symbolName === "Draft Restored") {
      return actionType === 'publish';
    }
    return true;
  }
  
  canShowDraftActions(draft: any, actionType: string): boolean {
    if (!draft) return false;
  
    if (draft.menuId === "DRFT_RESTORED") {
      return actionType === 'publish'; 
    }
  
    return true; 
  }
  getSelectedDraft(): any {
    if (!this.selectedDraftId) return null;
    return this.draftItems.find(draft => draft.id === this.selectedDraftId);
  }
  
getRegularDraftsCount(): number {
  return this.draftItems.filter(item => 
    item.parentMenuId == this.selectedManagePage.menuId && 
    item.symbolName !== 'Draft Restored'
  ).length;
}

getTotalDraftsCount(): number {
  return this.draftItems.filter(item => 
    item.parentMenuId == this.selectedManagePage.menuId
  ).length;
}

getCreateDraftButtonLabel(): string {
  const totalCount = this.getTotalDraftsCount();
  const regularCount = this.getRegularDraftsCount();
  
  switch(this.selectedMenuId){
    case 'HM':
      // Show "/5" only if regular drafts are less than 5, otherwise just show the total count
      return regularCount < 5 ? `Create Draft - ${regularCount}/5` : `Create Draft - ${regularCount}`; 
    case 'TOU':
    case 'NT': 
    case 'FD': 
    case 'CU': 
    case 'PP': 
    case 'AC':
    case 'TR':
    case 'FAQ':
    case 'PR':
      return `Create Draft`; // Don't show count for TOU
    default:
      // Same logic for other menu items
      return regularCount < 5 ? `Create Draft - ${totalCount}/5` : `Create Draft - ${totalCount}`;
  }
}

getCurrentPageName(){
  switch(this.selectedMenuId){
    case 'HM':
      return 'Home Page';
      break;
    case 'FAQ':
      return 'FAQ';
      break;
    case 'TOU':
      return 'Terms Of Use';
      break;
    case 'CU':
      return 'Contact Us';
      break;
    case 'PP':
      return 'Privacy Policy';
      break;
    case 'NT':
      return 'Notifications';
      break;
    case 'FD':
      return 'Feedback';
      break;
    default:
      return 'Home Page';
      break;
    case 'AC':
      return 'Academy';
      break;
    case 'TR':
      return 'Terms of Use';
      break;
    case 'PR':
      return 'Program Rules';
      break;
  }
}
  
  
  closeModel() {
    this.modalReference.close()
  }
  isDateValid(validDateTime: string): boolean {
    const validDate = new Date(validDateTime).toISOString().split("T")[0];
    const currentDate = new Date().toISOString().split("T")[0];
  
    return validDate >= currentDate;
  }
  
  // const validDateTime = "2025-03-01T06:11:46.9983224";
  sharePublishPage(item, content) {
    this.LinkId = item.id;
    this.manageWebsiteService.GetKeyValidation(item.id, 'publish').subscribe((validationResp) => {
      if(!(validationResp?.id && validationResp?.key && validationResp?.validDateTime) || validationResp?.expire) {
        this.manageWebsiteService.SaveOrUpdateShareLink(item.id, 'publish').subscribe((resp) => {
          this.manageWebsiteService.GetKeyValidation(item.id, 'publish').subscribe((newValidationResp) => {
            const baseUrl = window.location.origin;
            const fullUrl = `${baseUrl}/IncentiveWeb/shared-published-page?id=${resp.id}&key=${resp.data}&isd=true`;
            this.sharedUrl = fullUrl;
            if(newValidationResp?.validDateTime) {
              const utcDate = new Date(newValidationResp?.validDateTime + 'Z');
              const estDate = new Intl.DateTimeFormat('en-US', {
                timeZone: 'America/New_York',
                month: '2-digit', day: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: false
              }).format(utcDate);
              this.LinkDate = estDate.replace(',', '');
              this.publishLinkDate = estDate.replace(',', '');
            } else {
              this.LinkDate = null;
              this.publishLinkDate = null;
            }
            this.modalReference = this._matDialog.open(content);
          })
        })
      } else {
        const baseUrl = window.location.origin;
        const fullUrl = `${baseUrl}/IncentiveWeb/shared-published-page?id=${validationResp.id}&key=${validationResp.key}&isd=true`;
        this.sharedUrl = fullUrl;
        if(validationResp?.validDateTime) {
          const utcDate = new Date(validationResp?.validDateTime + 'Z');
          const estDate = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/New_York',
            month: '2-digit', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false
          }).format(utcDate);
          this.LinkDate = estDate.replace(',', '');
          this.publishLinkDate = estDate.replace(',', '');
        } else {
          this.publishLinkDate = null;
          this.LinkDate = null;
        }
        this.modalReference = this._matDialog.open(content);
      }
  
    })
  }
  generateNewLink(content) {
    this.manageWebsiteService.SaveOrUpdateShareLink(this.LinkId, this.showChild ? 'draft' : 'publish').subscribe((resp) => {
      this.manageWebsiteService.GetKeyValidation(this.LinkId, this.showChild ? 'draft' : 'publish').subscribe((newValidationResp) => {
        const baseUrl = window.location.origin;
        const fullUrl = `${baseUrl}/IncentiveWeb/shared-published-page?id=${resp.id}&key=${resp.data}&isd=${!this.showChild}`;
        this.sharedUrl = fullUrl;
        // this.notificationService.warningTopRight('The link is valid for 15 days unless reset. Resetting will expire it immediately.')
        if(newValidationResp?.validDateTime) {
          const utcDate = new Date(newValidationResp?.validDateTime + 'Z');
          const estDate = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/New_York',
            month: '2-digit', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false
          }).format(utcDate);
          this.LinkDate = estDate.replace(',', '');
          if(this.showChild) {
            this.shareLinkDate = estDate.replace(',', '');
          } else {
            this.publishLinkDate = estDate.replace(',', '');
          }
          this.modalReference.close()
          this.modalReference = this._matDialog.open(content);
          this.notificationService.successTopRight('New link generated successfully.')
        } else {
          if(this.showChild) {
            this.shareLinkDate = null;
          } else {
            this.publishLinkDate = null;
          }
          this.LinkDate = null;
          this.closeModel();
        }
      })
    })
  }
  shareDraftPage(item, content) {
    this.LinkId = item.id
    this.manageWebsiteService.GetKeyValidation(item.id, 'draft').subscribe((validationResp) => {
      if(!(validationResp?.id && validationResp?.key && validationResp?.validDateTime) || validationResp?.expire) {
        this.manageWebsiteService.SaveOrUpdateShareLink(item.id, 'draft').subscribe((resp) => {
          this.manageWebsiteService.GetKeyValidation(item.id, 'draft').subscribe((newValidationResp) => {
            const baseUrl = window.location.origin;
            const fullUrl = `${baseUrl}/IncentiveWeb/shared-published-page?id=${resp.id}&key=${resp.data}&isd=false`;
            this.sharedUrl = fullUrl;
            // this.notificationService.warningTopRight('The link is valid for 15 days unless reset. Resetting will expire it immediately.')
            if(newValidationResp?.validDateTime) {
              const utcDate = new Date(newValidationResp?.validDateTime + 'Z');
              const estDate = new Intl.DateTimeFormat('en-US', {
                timeZone: 'America/New_York',
                month: '2-digit', day: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: false
              }).format(utcDate);
              this.LinkDate = estDate.replace(',', '');
              this.shareLinkDate = estDate.replace(',', '');
            } else {
              this.LinkDate = null;
              this.shareLinkDate = null;
            }
            this.modalReference = this._matDialog.open(content);
          })
        })
      } else {
        const baseUrl = window.location.origin;
        const fullUrl = `${baseUrl}/IncentiveWeb/shared-published-page?id=${validationResp.id}&key=${validationResp.key}&isd=false`;
        this.sharedUrl = fullUrl;
        if(validationResp?.validDateTime) {
          const utcDate = new Date(validationResp?.validDateTime + 'Z');
          const estDate = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/New_York',
            month: '2-digit', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false
          }).format(utcDate);
          this.LinkDate = estDate.replace(',', '');
          this.shareLinkDate = estDate.replace(',', '');
        } else {
          this.LinkDate = null;
          this.shareLinkDate = null;
        }

        // this.notificationService.warningTopRight('The link is valid for 15 days unless reset. Resetting will expire it immediately.')
        this.modalReference = this._matDialog.open(content);
      }

    })
    // this.manageWebsiteService.SaveOrUpdateShareLink(item.id, 'draft').subscribe((resp) => {
    //   const baseUrl = window.location.origin;
    //   const fullUrl = `${baseUrl}/IncentiveWeb/shared-published-page?id=${resp.id}&key=${resp.data}&isd=false`;
    //   this.sharedUrl = fullUrl;
    //   this.notificationService.warningTopRight('The link is valid for 15 days unless reset. Resetting will expire it immediately.')
    //   this.modalReference = this._matDialog.open(content);
    // })
  }
  copyToHomePage(): void {
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}/IncentiveWeb/dashboards`;
  
    if (navigator.clipboard && window.isSecureContext) {
      // Modern approach using Clipboard API
      navigator.clipboard.writeText(fullUrl).then(() => {
        this.notificationService.successTopRight('Link copied successfully.');
      }).catch(() => {
        this.fallbackCopyToClipboardHomepage(fullUrl);
      });
    } else {
      this.fallbackCopyToClipboardHomepage(fullUrl); // Use fallback for non-HTTPS
    }
  }
  
  private fallbackCopyToClipboardHomepage(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed'; // Prevents scrolling to the bottom
    textArea.style.opacity = '0'; // Hide the textarea
    document.body.appendChild(textArea);
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length); // Select text
    try {
      document.execCommand('copy'); // Legacy copy method
      this.notificationService.successTopRight('Link copied successfully.');
    } catch (err) {
      this.notificationService.errorTopRight('Unable to copy the link. Please copy it manually.');
    }
    document.body.removeChild(textArea);
  }
  
  copyToClipboard(): void {
    if (navigator.clipboard && window.isSecureContext) {
      // Modern approach using Clipboard API
      navigator.clipboard.writeText(this.sharedUrl).then(() => {
        this.notificationService.successTopRight('Link copied successfully.');
      }).catch(() => {
        this.fallbackCopyToClipboard();
      });
    } else {
      this.fallbackCopyToClipboard(); // Use fallback for non-HTTPS
    }
  }
  
  private fallbackCopyToClipboard(): void {
    const textArea = document.createElement('textarea');
    textArea.value = this.sharedUrl;
    textArea.style.position = 'fixed'; // Prevents scrolling to the bottom
    textArea.style.opacity = '0'; // Hide the textarea
    document.body.appendChild(textArea);
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length); // Select text
    try {
      document.execCommand('copy'); // Legacy copy method
      this.notificationService.successTopRight('Link copied successfully.');
    } catch (err) {
      this.notificationService.errorTopRight('Unable to copy the link. Please copy it manually.');
    }
    document.body.removeChild(textArea);
  }
  
  addNavigation() {
    this.showMenu = false;
    this.showGroup = false;
    this.showManagePagePopup()
  }
  onMenuTypeChange(event) {
    if (event.value === 'collapsable') {
      this.showChildMenuName = true;
      this.manageNavForm.get('url')?.clearValidators();
      this.manageNavForm.get('url')?.reset();
    } else {
      this.showChildMenuName = false;
      this.manageNavForm.get('url');
    }
    this.manageNavForm.get('url')?.updateValueAndValidity();
  }
  addNavigationByMenu() {
    this.showGroup = false;
    this.showMenuManagePage = true;
    this.showChildMenuName = false;
    this.manageNavForm = this._formbuilder.group({
      name: [null, Validators.required],
      menuType : ['basic', Validators.required],
      url: null,
    })
    this.showChildMenuName = false;
    this.manageNavForm.get('url');
  }
  createSubMenu(item) {
    item['createChild'] = true;
    this.childNavForm = this._formbuilder.group({
      name: [null, Validators.required],
      menuType : ['basic'],
      itemId: item.id,
      url: [null],
    })
  }
  storeState() {
    if (this.currentStateIndex < this.previousStateStogage.length - 1) {
      this.previousStateStogage = this.previousStateStogage.slice(0, this.currentStateIndex);
    }
    if (this.previousStateStogage.length >= 100) {
      this.previousStateStogage.shift();
    }
    this.previousStateStogage.push(this.deepCopy(this.sectionsArray));
    this.currentStateIndex = this.previousStateStogage.length;
  }
  resetState() {
    this.previousStateStogage = []
    this.currentStateIndex = 0;
  }
  
  undoChanges() {
    if (this.currentStateIndex > 1) {
      this.currentStateIndex -= 1;
      this.sectionsArray = this.deepCopy(this.previousStateStogage[this.currentStateIndex-1]);
    }
    if(this.selectedMenuId !== 'TOU' && this.selectedMenuId !== 'FAQ' && this.selectedMenuId !== 'CU' && this.selectedMenuId !== 'PP' && this.selectedMenuId !== 'NT' && this.selectedMenuId !== 'FD' && this.selectedMenuId !== 'AC' && this.selectedMenuId !== 'TR' && this.selectedMenuId !== 'PR') { 
      setTimeout(() => {
        this.updateSectionHeights();
      }, 200);
    }
    this.changeDetectorRef.detectChanges();
  }
  
  redoChanges() {
    if ((this.currentStateIndex <= this.previousStateStogage.length-1) && this.previousStateStogage.length > 1) {
      this.currentStateIndex += 1;
      this.sectionsArray = this.deepCopy(this.previousStateStogage[this.currentStateIndex-1]);
    }
    if(this.selectedMenuId !== 'TOU' && this.selectedMenuId !== 'FAQ' && this.selectedMenuId !== 'CU' && this.selectedMenuId != 'PP' && this.selectedMenuId !== 'NT' && this.selectedMenuId !== 'FD' && this.selectedMenuId !== 'AC' && this.selectedMenuId !== 'TR' && this.selectedMenuId !== 'PR') {
      setTimeout(() => {
        this.updateSectionHeights();
      }, 200);
    }
    this.changeDetectorRef.detectChanges();
  }
  deepCopy(item) {
    return JSON.parse(JSON.stringify(item))
  }
  startEditingDraft(draft: any): void {
    this.editingDraftId = draft.id;
    this.editDraftName = draft.menuName;
    draft.showSubMenu = false; 
  }
  

  saveDraftName(draft: any): void {
    const trimmedName = this.editDraftName.trim();

    if (!trimmedName) {
      this.notificationService.errorTopRight('Draft name cannot be empty');
      return;
    }

    if (trimmedName.length > 30) {
      this.notificationService.errorTopRight('Draft name cannot exceed 30 characters');
      return;
    }

    const originalName = draft.menuName;
    draft.menuName = trimmedName;

    // ✅ Don’t exit edit mode yet — wait for successful API response
    this.updateDraftNameApi(draft, originalName);
  }
  
  updateDraftNameApi(draft: any, originalName: string): void {
  const requestObj = {
    id: draft.id,
    menuName: draft.menuName,
    menuId: draft.menuId,
    routerLink: draft.routerLink || '',
    symbolName: draft.symbolName || '',
    tenantCode: draft.tenantCode,
    isHide: draft.isHide || false,
    isShare: draft.isShare || false,
    isPublish: draft.isPublish || false,
    isDelete: draft.isDelete || false,
    publishedId: draft.publishedId ? draft.publishedId : '00000000-0000-0000-0000-000000000000',
    subMenuId: draft.subMenuId || null,
    draftDeleted: draft.draftDeleted || false,
    scheduledDateTime: draft.scheduledDateTime || null,
    scheduledId: draft.scheduledId || null
  };

  this.manageWebsiteService.SaveOrUpdateCMSMenuName(requestObj).subscribe({
    next: (resp) => {
      if (resp.isSuccess) {
        this.notificationService.successTopRight('Draft name updated successfully');
        
        // ✅ Exit edit mode only after success
        this.editingDraftId = null;

        this.fetchNavigationArray().then(() => {
          this.reSelectDraft(draft.id);
        });
      } else {
        this.notificationService.errorTopRight('Draft name already exists');
        const draftInList = this.draftItems.find(d => d.id === draft.id);
        if (draftInList) {
          draftInList.menuName = originalName;
        }
        // ❌ Don’t clear editingDraftId — stay in edit mode
      }
    },
    error: (error) => {
      this.notificationService.errorTopRight('Draft name already exists');
      const draftInList = this.draftItems.find(d => d.id === draft.id);
      if (draftInList) {
        draftInList.menuName = originalName;
      }
      // ❌ Don’t clear editingDraftId — stay in edit mode
    }
  });
}

  cancelEditingDraft(): void {
    this.editingDraftId = null;
  }
  reSelectDraft(draftId: string) {
    const draftToSelect = this.draftItems.find(draft => draft.id === draftId);
    
    if (draftToSelect) {
      this.selectedDraftId = draftId;
      this.selectedDraftItem = draftToSelect;
      this.navigationArray.forEach(navItem => {
        navItem['selected'] = false;
      });
      this.draftItems.forEach(draft => {
        draft['selected'] = draft.id === draftId;
      });
    }
  }  

getPublishedContainers() {
  this.isPublishedView = true;
  const selectedId = this.selectedManagePageId;
  this.trainingEmbededVideo = null;

  this.manageWebsiteService.GetAllCMSContainer(selectedId, true).subscribe((resp) => {
    // Reset prItems to avoid duplication
    this.prItems = [];

    // Create a map to group items by bannerSubHeading for PR menu
    const sectionMap = new Map<string, any[]>();

    // Process the API response
    this.sectionsArray = resp.map((section, sectionIndex) => {
      const parsedStylesArray = section.getAllCMSContainerViews.map(item => {
        try {
          // Parse styles string once and ensure numeric values
          const styles = typeof item.styles === 'string' ? JSON.parse(item.styles) : item.styles || {};
          if (typeof styles.top === 'string') styles.top = parseFloat(styles.top);
          if (typeof styles.left === 'string') styles.left = parseFloat(styles.left);
          if (typeof styles.height === 'string') styles.height = parseFloat(styles.height);
          if (typeof styles.width === 'string') styles.width = parseFloat(styles.width);
          return styles;
        } catch (e) {
          console.warn('Failed to parse styles for item', item.id, ':', e);
          return { top: 0, left: 0, height: 50, width: 100 }; // Fallback in vh
        }
      });

      // Group items by bannerSubHeading for PR menu
      if (this.selectedMenuId === 'PR') {
        section.getAllCMSContainerViews.forEach((container) => {
          container.getAllCMSItemViews.forEach((item) => {
            // Only include items with a valid url or content
            if (item.url || item.content) {
              const subHeading = item.bannerSubHeading; 
              if (!sectionMap.has(subHeading)) {
                sectionMap.set(subHeading, []);
              }
              sectionMap.get(subHeading)!.push({
                id: item.uploadId || item.id,
                isVideo: item.isVideo || false,
                title: item.bannerHeading || '',
                newHeadings: item.newHeadings || [],
                uniqueId: item.uniqueId,
                bannerSubHeading: item.bannerSubHeading,
                videoFile: null,
                ImageFile: null,
                blobUrl: item.content || item.url || '',
                fileName: item.newHeadings?.[0]?.text || '',
                url: item.url || '',
                content: item.content || '',
                type: item.type || 'pdf',
                panelType: item.panelType || 'pdf',
                fullBleed: item.fullBleed || '',
                fitWidth: item.fitWidth || '',
                opacity: item.opacity || '',
                autoPlay: item.autoPlay || false,
                requireUserToWatch: item.requireUserToWatch || item.isRequired || false
              });
            }
          });
        });
      }

      return {
        id: section.id,
        position: section.position !== undefined ? section.position : sectionIndex,
        height: parseFloat(this.getSectionArrayMaxHeight(sectionIndex)), // Use vh-based height
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

            if (items.type === 'image' && items.getAllCMSItemViews?.length) {
              images = items.getAllCMSItemViews.map(item => item.url).filter(url => !!url);
            } else if (items.type === 'video' || (items.type === 'TrainingMonth' && items.text && (items.text.includes('youtu') || items.text.includes('youtube.com/embed/')))) {
              let videoItem = items.getAllCMSItemViews?.[0];

              // Initialize video properties
              autoPlay = items.autoPlay || false;
              requireUserToWatch = items.isRequired || items.requireUserToWatch || false;
              loop = false;

              // Handle video from getAllCMSItemViews
              if (items.type === 'video' && videoItem) {
                if (videoItem.url) {
                  localVideoUrl = videoItem.url;
                  videoUrl = null;
                  isYoutubeOrVimeo = false;
                } else if (videoItem.content && (videoItem.content.includes('youtu') || videoItem.content.includes('youtube.com/embed/'))) {
                  videoUrl = videoItem.content;
                  isYoutubeOrVimeo = true;
                }
                // Override with videoItem-specific properties
                autoPlay = videoItem.autoPlay || items.autoPlay || false;
                requireUserToWatch = videoItem.requireUserToWatch || videoItem.isRequired || items.isRequired || items.requireUserToWatch || false;
                if (videoItem.bannerHeading) {
                  try {
                    const loopData = typeof videoItem.bannerHeading === 'string' ? 
                      JSON.parse(videoItem.bannerHeading) : videoItem.bannerHeading;
                    loop = loopData.loop || false;
                  } catch (e) {
                    console.warn('Failed to parse loop from bannerHeading:', videoItem.bannerHeading);
                  }
                }
              }
              // Handle video from items.text (e.g., TrainingMonth or YouTube/Vimeo URLs)
              if (items.text && (items.text.includes('youtu') || items.text.includes('youtube.com/embed/'))) {
                videoUrl = items.text;
                isYoutubeOrVimeo = true;
                // For TrainingMonth or text-based videos, use item-level properties if not overridden
                if (items.type === 'TrainingMonth') {
                  autoPlay = items.autoPlay || false;
                  requireUserToWatch = items.isRequired || items.requireUserToWatch || false;
                  // If loop is stored in items.bannerHeading or another field, parse it
                  if (items.bannerHeading) {
                    try {
                      const loopData = typeof items.bannerHeading === 'string' ? 
                        JSON.parse(items.bannerHeading) : items.bannerHeading;
                      loop = loopData.loop || false;
                    } catch (e) {
                      console.warn('Failed to parse loop from items.bannerHeading:', items.bannerHeading);
                    }
                  }
                }
              }
              // Normalize YouTube URLs to embed format
              if (videoUrl && (videoUrl.includes('youtube.com/watch?v=') || videoUrl.includes('youtu.be/'))) {
                if (videoUrl.includes('youtube.com/watch?v=')) {
                  const videoId = videoUrl.split('v=')[1]?.split('&')[0];
                  videoUrl = `https://www.youtube.com/embed/${videoId}`;
                } else if (videoUrl.includes('youtu.be/')) {
                  const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
                  videoUrl = `https://www.youtube.com/embed/${videoId}`;
                }
              }
            } else if (items.type === 'audio' && items.getAllCMSItemViews?.length) {
              const audioItem = items.getAllCMSItemViews[0];
              audioUrl = audioItem.url || audioItem.content || null;
              // Set audio-specific properties
              autoPlay = audioItem.autoPlay || items.autoPlay || false;
              requireUserToWatch = audioItem.requireUserToWatch || audioItem.isRequired || items.isRequired || items.requireUserToWatch || false;
              if (audioItem.bannerHeading) {
                try {
                  const loopData = typeof audioItem.bannerHeading === 'string' ? 
                    JSON.parse(audioItem.bannerHeading) : audioItem.bannerHeading;
                  loop = loopData.loop || false;
                } catch (e) {
                  console.warn('Failed to parse loop from audioItem.bannerHeading:', audioItem.bannerHeading);
                }
              }
            }
            if (this.selectedMenuId === 'FAQ') {
              this.faqs = items.chartHeading ? JSON.parse(items.chartHeading) : [];
            }

            // Handle text content
            let textContent: string = '';
            if (items.type === 'greeting') {
              textContent = items.text || ''; // Use API-provided text directly for greetings
              if (textContent && !textContent.includes('text-align: center')) {
                console.warn('Greeting text missing text-align: center for item', items.id, ':', textContent);
                // Add text-align: center if missing
                textContent = textContent.replace(/<h3>/, '<h3 style="text-align: center;">');
              }
            } else if (items.text) {
              textContent = items.text;
            } else if (items.getAllCMSItemViews?.length && items.getAllCMSItemViews[0].content) {
              const firstItem = items.getAllCMSItemViews[0];
              if (firstItem.type === 'text' || items.type === 'text' || items.type === 'textbox') {
                textContent = firstItem.content;
              }
            }

            // Positioning fallbacks in vh
            const defaultLeft = idx * 20; // Spread items in vh
            const defaultTop = 10;
            const defaultWidth = items.containerSize || 30;
            const defaultHeight = this.getDefaultHeightForType(items.type);

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
              iFrame: this.sanitizer.bypassSecurityTrustResourceUrl(items.iFrame),
              hyperlink: items.text || items.chartHeading || items.salesHeading || '',
              buttonStyle: buttonStyle,
              styles: parsedStyles,
              xPercent: fitWidthData.xPercent ?? (parsedStyles.left != null ? parseFloat(parsedStyles.left) : defaultLeft), // vh
              yPercent: fitWidthData.yPercent ?? (parsedStyles.top != null ? parseFloat(parsedStyles.top) : defaultTop), // vh
              widthPercent: fitWidthData.widthPercent ?? (items.containerSize || 30),
              heightPercent: fitWidthData.heightPercent ?? (parsedStyles.height || this.getDefaultHeightForType(items.type)),
              zIndex: fitWidthData.zindex ?? (parsedStyles.zindex || (idx + 1)),
              x: 0,
              y: 0,
              width: 0,
              height: 0,
              autoPlay: autoPlay,
              requireUserToWatch: requireUserToWatch,
              loop: loop,
              images: images,
              localVideoUrl: localVideoUrl,
              videoUrl: videoUrl,
              audioUrl: audioUrl,
              isYoutubeOrVimeo: isYoutubeOrVimeo,
              tempVideoUrl: !isYoutubeOrVimeo ? videoUrl : null,
              currentIndex: 0,
              fileName: items.getAllCMSItemViews?.[0]?.url ? this.extractFileNameFromUrl(items.getAllCMSItemViews[0].url) : null,
              title: items.getAllCMSItemViews?.[0]?.bannerHeading || '',
              subtitle: items.getAllCMSItemViews?.[0]?.bannerSubHeading || '',
              showControls: true,
              selectedTimePeriod: items.chartDropdown || 'currentYear',
              chartDataType: items.chartDataType,
              chartView: (items.type === 'Pie Chart' || items.type === 'Line Chart' || items.type === 'Bar Chart') ? [160, 160] : undefined,
              pieChartData: items.type === 'Pie Chart' ? this.pieChartDataSets[items.chartDropdown || 'currentMonth']?.[items.chartDataType || 'quantity'] || [] : undefined,
              lineChartData: items.type === 'Line Chart' ? this.lineChartDataSets[items.chartDropdown || 'currentYear']?.[items.chartDataType || 'quantity'] || { labels: [], datasets: [] } : undefined,
              barChartData: items.type === 'Bar Chart' ? this.barChartDataSets[items.chartDropdown || 'currentYear']?.[items.chartDataType || 'quantity']?.data || { labels: [], datasets: [] } : undefined,
              listenProgress: 0,
              getAllCMSItemViews: items.getAllCMSItemViews.map((item) => {
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
                  requireUserToWatch: item.isRequired || false
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

    // Populate prItems dynamically from sectionMap
    if (this.selectedMenuId === 'PR') {
      sectionMap.forEach((items, subHeading) => {
        this.prItems.push({
          title: subHeading === 'imp' ? 'Important Information' : 
                 subHeading === 'gen' ? 'General Information' : 
                 subHeading === 'Important Information' ? 'Important Information' : subHeading,
          items: items
        });
      });

      // Sort prItems by title to maintain consistent order
      this.prItems.sort((a, b) => a.title.localeCompare(b.title));

      // Function to check if an item is a PDF
      const isPdf = (item) => {
        return (
          item &&
          ((item.fileName && item.fileName.toLowerCase().endsWith('.pdf')) ||
            (item.blobUrl && item.blobUrl.toLowerCase().includes('.pdf')))
        );
      };

      const isViewableWebPage = (url: string): boolean => {
        return this.isValidUrl(url) &&
          !url.toLowerCase().endsWith('.doc') &&
          !url.toLowerCase().endsWith('.docx') &&
          !url.toLowerCase().endsWith('.xls') &&
          !url.toLowerCase().endsWith('.xlsx') &&
          !url.toLowerCase().endsWith('.csv') &&
          !url.toLowerCase().endsWith('.ppt') &&
          !url.toLowerCase().endsWith('.pptx');
      };

      // Find the first valid item across all sections
      const firstValidItem = this.prItems.flatMap(section => section.items).find(item => isPdf(item) || isViewableWebPage(item.blobUrl));
      if (firstValidItem) {
        this.iframeSrc = this.getSafeURl(firstValidItem.blobUrl);
        this.selectedItemUrl = firstValidItem.blobUrl;
        this.collapsed = true;
      } else {
        this.iframeSrc = null;
        this.collapsed = false;
      }
    }

    if (this.selectedMenuId !== 'TOU' && this.selectedMenuId !== 'FAQ' && this.selectedMenuId !== 'CU' && this.selectedMenuId !== 'PP' && this.selectedMenuId !== 'NT' && this.selectedMenuId !== 'FD' && this.selectedMenuId !== 'AC' && this.selectedMenuId !== 'TR' && this.selectedMenuId !== 'PR') {
      requestAnimationFrame(() => this.updateSectionHeights());
    }
    
    // Initialize chart data and sizes after sections are loaded
    this.initializeChartTimePeriod();
    
    this.changeDetectorRef.detectChanges();
    if (window.innerWidth <= 480) {
      this.storedMobileView = JSON.parse(JSON.stringify(this.sectionsArray));
      this.sectionsArray.forEach(section => {
        section.items = this.reorderCMSItemsByPosition(section.items);
      });
    }
  });
}

convertToEmbedUrl(url: string): string {
  if (!url) return '';

  // Handle YouTube Shorts URLs
  if (url.includes('youtube.com/shorts/') || url.includes('youtu.be/shorts/')) {
    const shortsMatch = url.match(/(?:youtube\.com\/shorts\/|youtu\.be\/shorts\/)([a-zA-Z0-9_-]+)/);
    if (shortsMatch) {
      return `https://www.youtube.com/embed/${shortsMatch[1]}`;
    }
  }

  // Handle regular YouTube URLs
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }

  // Handle youtu.be URLs
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    if (videoId && !videoId.includes('shorts/')) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }

  // Handle Vimeo URLs
  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
    if (videoId) {
      return `https://player.vimeo.com/video/${videoId}`;
    }
  }

  return url;
}


// Check if the URL is from YouTube or Vimeo
isExternalVideo(url: string): boolean {
  if (!url) return false;
  return (
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('vimeo.com')||
    url.includes('youtube.com/shorts/') ||
    url.includes('youtu.be/shorts/')
  );
}
formatHyperlink(link: string): string {
  if (!link) return null;
  if (link.match(/^https?:\/\//)) return link;
  if (link.includes('@')) return `mailto:${link}`;
  if (link.match(/^[\d\(\)\-\s\+]+$/)) return `tel:${link}`;
  return `https://${link}`;
}

openTypeSelectionPopup(event?: Event) {
  if (event && typeof (event as Event).stopPropagation === 'function') {
    (event as Event).stopPropagation();
  }
  // open the popup
  this.showTypeSelectionPopup = !this.showTypeSelectionPopup;
}

closeTypeSelectionPopup() {
  this.showTypeSelectionPopup = false;
}

selectContainerType(type: 'freeForm' | 'widgets' | null | undefined) {
  console.log('editingSection:', this.editingSection, 'isEditingSection:', this.isEditingSection);

  if (this.editingSection) {
    this.notificationService.errorTopRight('Please save the current section before adding a new one.');
    this.showTypeSelectionPopup = false;
    return;
  }

  // If type is null or undefined, default to "freeForm"
  this.selectedContainerType = type ?? 'freeForm';

  console.log('Selected container type:', this.selectedContainerType);

  this.showTypeSelectionPopup = false;

  this.addNewSection(); 
}


getContainersForDraft() {
  this.isPublishedView = false;
  const selectedId = this.selectedDraftId;
  this.trainingEmbededVideo = null;

  this.manageWebsiteService.GetAllCMSContainer(selectedId, false).subscribe((resp) => {
    // Reset prItems to avoid duplication
    this.prItems = [];

    // Create a map to group items by bannerSubHeading for PR menu
    const sectionMap = new Map<string, any[]>();

    // Process the API response
    this.sectionsArray = resp.map((section) => {
      if (!this.selectedContainerType) {
       this.selectedContainerType = section.sectionType ?? "freeForm";
      }

      const parsedStylesArray = section.getAllCMSContainerViews.map(item => {
        try {
          if (typeof item.styles === 'string') {
            return JSON.parse(item.styles);
          }
          return item.styles || {};
        } catch (e) {
          console.warn('Failed to parse triple-encoded styles:', item.styles, e);
          try {
            return typeof item.styles === 'string' ? JSON.parse(item.styles) : (item.styles || {});
          } catch (e2) {
            console.warn('Fallback parsing also failed:', e2);
            return {};
          }
        }
      });

     

      // Group items by bannerSubHeading for PR menu
      if (this.selectedMenuId === 'PR') {
        section.getAllCMSContainerViews.forEach((container) => {
          container.getAllCMSItemViews.forEach((item) => {
            if (item.url || item.content) {
              const subHeading = item.bannerSubHeading;
              if (!sectionMap.has(subHeading)) {
                sectionMap.set(subHeading, []);
              }
              sectionMap.get(subHeading)!.push({
                id: item.uploadId || item.id,
                isVideo: item.isVideo || false,
                title: item.bannerHeading || '',
                newHeadings: item.newHeadings || [],
                uniqueId: item.uniqueId,
                bannerSubHeading: item.bannerSubHeading,
                videoFile: null,
                ImageFile: null,
                blobUrl: item.content || item.url || '',
                fileName: item.newHeadings?.[0]?.text || '',
                url: item.url || '',
                content: item.content || '',
                type: item.type || 'pdf',
                panelType: item.panelType || 'pdf',
                fullBleed: item.fullBleed || '',
                fitWidth: item.fitWidth || '',
                opacity: item.opacity || '',
                autoPlay: item.autoPlay || false,
                requireUserToWatch: item.requireUserToWatch || item.isRequired || false
              });
            }
          });
        });
      }

      return {
        id: section.id,
        position: section.position,
        type: section.sectionType,
        height: section.getAllCMSContainerViews.reduce((max, item, idx) => {
          const styles = parsedStylesArray[idx];
          const heightPercent = styles.height || this.getDefaultHeightForType(item.type);
          const topPercent = styles.top || 10;
          return Math.max(max, ((topPercent + heightPercent) / 100 * 400));
        }, 400),
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
            } catch (e) {
              console.warn('Failed to parse FitWidth:', items.fitWidth);
            }

            let buttonStyle: any = {};
            if (items.type === 'button' && items.salesHeading) {
              try {
                buttonStyle = typeof items.salesHeading === 'string' ? JSON.parse(items.salesHeading) : items.salesHeading;
              } catch (e) {
                console.warn('Failed to parse button salesHeading:', items.salesHeading);
                buttonStyle = {};
              }
            }

            let images: string[] = [];
            let localVideoUrl: string | null = null;
            let videoUrl: string | null = null;
            let audioUrl: string | null = null;
            let content: string | null = null;
            let textContent: string | null = null;
            let iframeContent: string | null = null;
            let isYoutubeOrVimeo: boolean = false;
            let fileName: string | null = null;
            let autoPlay: boolean = false;
            let loop: boolean = false;
            let requireUserToWatch: boolean = false;

            if (items.type === 'PP') {

              if (items['showChartHeading'] === undefined) items['showChartHeading'] = false;
              if (items['showSalesHeading'] === undefined) items['showSalesHeading'] = false;
              if (items['showIFrame'] === undefined) items['showIFrame'] = false;

              if (items.isVideo === true || items.isVideo === false) {
              }

              else if (items.salesHeading && items.salesHeading.trim().length > 0) {
                items.isVideo = true;  
              }
              else {
                items.isVideo = false; 
              }

              if (items.text && items.text.includes('<') && !items.text.startsWith('http')) {
                if (!items.chartHeading) items.chartHeading = items.text;
                items.text = 'https://www.kohlercompany.com/privacy/';
              }
            }


            if (items.type === 'greeting') {
              const hour = new Date().getHours();
              const greetingMessage =
                hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
            
              const html = items.text?.trim();
            
              if (html) {
                // ✅ Just use DB text as-is (don’t replace greeting)
                textContent = html;
              } else {
                // ✅ Only generate when DB has nothing
                textContent = `<h3 style="text-align:center;">
                    <span 
                      class="kl-editor-size-x-large"
                      style="color:#02479c !important; font-family: HelveticaNeueBold; font-size:19px;">
                      [Good Morning/Afternoon/Evening], [First Name]
                    </span>
                  </h3>
                `;
              }
            }
            

            if (items.type === 'image' && items.getAllCMSItemViews?.length) {
              images = items.getAllCMSItemViews.map(item => item.url).filter(url => !!url);
            }
            else if (items.type === 'video' && items.getAllCMSItemViews?.length) {
              const videoItem = items.getAllCMSItemViews[0];
              autoPlay = videoItem.autoPlay || false;
              requireUserToWatch = videoItem.requireUserToWatch || videoItem.isRequired || false;
              if (videoItem.bannerHeading) {
                try {
                  const loopData = typeof videoItem.bannerHeading === 'string' ? 
                    JSON.parse(videoItem.bannerHeading) : videoItem.bannerHeading;
                  loop = loopData.loop || false;
                } catch (e) {
                  console.warn('Failed to parse loop from bannerHeading:', videoItem.bannerHeading);
                }
              }
              if (videoItem.url) {
                localVideoUrl = videoItem.url;
                videoUrl = null;
                isYoutubeOrVimeo = false;
                fileName = this.extractFileNameFromUrl(videoItem.url);
              } else if (videoItem.content) {
                videoUrl = this.convertToEmbedUrl(videoItem.content);
                localVideoUrl = null;
                isYoutubeOrVimeo = this.isExternalVideo(videoItem.content);
              }
              content = videoItem.content;
            }  else if (items.type === 'text') {
              textContent = items.text;
            } else if (items.type === 'button') {
              textContent = items.text;
              content = items.text;
            } else if (items.type === 'TrainingMonth') {
              textContent = items.text;
              if (items.text && this.isValidVideoUrl(items.text)) {
                videoUrl = this.getEmbedUrl(items.text);
                isYoutubeOrVimeo = true;
              }
            }

            if (this.selectedMenuId === 'FAQ') {
              this.faqs = items.chartHeading ? JSON.parse(items.chartHeading) : [];
            }

            return {
              type: items.type,
              className: items.className,
              containerId: items.containerId,
              id: items.id,
              containerSize: items.containerSize || 33,
              isVideo: items.isVideo || (videoUrl ? true : false),
              text: textContent || items.text || '',
              content: content || textContent || items.text || '',
              iFrame: this.sanitizer.bypassSecurityTrustResourceUrl(items.iFrame) || '',
              selectedIndex: 0,
              chartHeading: items.chartHeading,
              salesHeading: items.salesHeading,
              hyperlink: items.chartHeading || '',
              buttonStyle: buttonStyle,
              selectedTimePeriod: items.chartDropdown || 'currentYear',
              chartDataType: items.chartDataType,
              chartView: (items.type === 'Pie Chart' || items.type === 'Line Chart' || items.type === 'Bar Chart') ? [160, 160] : undefined,
              pieChartData: items.type === 'Pie Chart' ? this.pieChartDataSets[items.chartDropdown || 'currentMonth']?.[items.chartDataType || 'quantity'] || [] : undefined,
              lineChartData: items.type === 'Line Chart' ? this.lineChartDataSets[items.chartDropdown || 'currentYear']?.[items.chartDataType || 'quantity'] || { labels: [], datasets: [] } : undefined,
              barChartData: items.type === 'Bar Chart' ? this.barChartDataSets[items.chartDropdown || 'currentYear']?.[items.chartDataType || 'quantity']?.data || { labels: [], datasets: [] } : undefined,
              styles: parsedStyles,
              xPercent: fitWidthData.xPercent ?? (parsedStyles.left != null ? parseFloat(parsedStyles.left) : 10),
              yPercent: fitWidthData.yPercent ?? (parsedStyles.top != null ? parseFloat(parsedStyles.top) : 10),
              widthPercent: fitWidthData.widthPercent ?? (items.containerSize || 30),
              heightPercent: fitWidthData.heightPercent ?? (parsedStyles.height || this.getDefaultHeightForType(items.type)),
              zIndex: fitWidthData.zindex ?? (parsedStyles.zindex || 1),
              x: 0,
              y: 0,
              width: 0,
              height: 0,
              autoPlay: items.autoPlay || false,
              requireUserToWatch: items.isRequired || false,
              images: images,
              localVideoUrl: localVideoUrl,
              videoUrl: videoUrl,
              audioUrl: audioUrl,
              isYoutubeOrVimeo: videoUrl ? true : false,
              getAllCMSItemViews: items.getAllCMSItemViews.map((item) => {
                let itemFitWidthData: any = {};
                try {
                  itemFitWidthData = item.fitWidth ? JSON.parse(item.fitWidth) : {};
                } catch (e) {
                  console.warn('Failed to parse item FitWidth:', item.fitWidth);
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
                  panelType: item.panelType || 'panel',
                  fullBleed: item.fullBleed,
                  fitWidth: item.fitWidth,
                  opacity: item.opacity,
                  autoPlay: item.autoPlay || false,
                  requireUserToWatch: item.isRequired || false,
                  iFrame: this.sanitizer.bypassSecurityTrustResourceUrl(item.iFrame)
                };
              })
            };
          })
      };
    }).sort((a, b) => a.position - b.position);
// 🔥 Now safe to reflow after sectionsArray exists
this.sectionsArray.forEach((section, idx) => {
  if (section.type === 'widgets') {
    this.reflowSection(idx);
  }
});

    // Set selectedContainerType to the first section's type (or adjust based on your logic)
    this.selectedContainerType = this.sectionsArray[0]?.type || 'freeForm';

    // Populate prItems dynamically from sectionMap
    if (this.selectedMenuId === 'PR') {
      sectionMap.forEach((items, subHeading) => {
        this.prItems.push({
          title: subHeading === 'imp' ? 'Important Information' : 
                 subHeading === 'gen' ? 'General Information' : 
                 subHeading === 'Important Information' ? 'Important Information' : subHeading,
          items: items
        });
      });

      this.prItems.sort((a, b) => a.title.localeCompare(b.title));

      const isPdf = (item) => {
        return (
          item &&
          ((item.fileName && item.fileName.toLowerCase().endsWith('.pdf')) ||
            (item.blobUrl && item.blobUrl.toLowerCase().includes('.pdf')))
        );
      };

      const isViewableWebPage = (url: string): boolean => {
        return this.isValidUrl(url) &&
          !url.toLowerCase().endsWith('.doc') &&
          !url.toLowerCase().endsWith('.docx') &&
          !url.toLowerCase().endsWith('.xls') &&
          !url.toLowerCase().endsWith('.xlsx') &&
          !url.toLowerCase().endsWith('.csv') &&
          !url.toLowerCase().endsWith('.ppt') &&
          !url.toLowerCase().endsWith('.pptx');
      };

      const firstValidItem = this.prItems.flatMap(section => section.items).find(item => isPdf(item) || isViewableWebPage(item.blobUrl));
      if (firstValidItem) {
        this.iframeSrc = this.getSafeURl(firstValidItem.blobUrl);
        this.selectedItemUrl = firstValidItem.blobUrl;
        this.collapsed = true;
      } else {
        this.iframeSrc = null;
        this.collapsed = false;
      }
    }

    this.originalSections = JSON.stringify(this.sectionsArray);
    if (this.selectedMenuId !== 'TOU' && this.selectedMenuId !== 'FAQ' && this.selectedMenuId !== 'CU' && this.selectedMenuId !== 'PP' && this.selectedMenuId !== 'NT' && this.selectedMenuId !== 'FD' && this.selectedMenuId !== 'AC' && this.selectedMenuId !== 'TR' && this.selectedMenuId !== 'PR') {
      setTimeout(() => {
        this.sectionsArray.forEach((_, i) => this.updateSectionHeightDynamic(i));
      }, 200);
    }

    // Initialize chart data and sizes after sections are loaded
    this.initializeChartTimePeriod();

    if (window.innerWidth <= 480) {
      this.storedMobileView = JSON.parse(JSON.stringify(this.sectionsArray));
      this.sectionsArray.forEach(section => {
        section.items = this.reorderCMSItemsByPosition(section.items);
      });
    }

    this.changeDetectorRef.detectChanges();
  });
}
isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

setIframeSource(fileUrl: string): void {
  const ext = fileUrl.split('.').pop()?.toLowerCase();
  const blockList = ['doc', 'docx', 'xls', 'xlsx'];

  if (blockList.includes(ext || '')) {
    this.iframeSrc = null; // blank iframe
  } else {
    this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);
  }
}


storedMobileView = null;
reorderCMSItemsByPosition(items: any[]): any[] {
  return items.slice().sort((a, b) => {
    const aTop = a.styles?.top ?? 0;
    const bTop = b.styles?.top ?? 0;

    if (aTop !== bTop) {
      return aTop - bTop; // Sort by top (Y position)
    }

    const aLeft = a.styles?.left ?? 0;
    const bLeft = b.styles?.left ?? 0;

    if (aLeft !== bLeft) {
      return aLeft - bLeft; // Sort by left (X position)
    }

    const aHeight = a.styles?.height ?? 0;
    const bHeight = b.styles?.height ?? 0;

    return aHeight - bHeight; // Optional: Sort by height if needed
  });
}

switchToMobileView() {
  this.storedMobileView = JSON.parse(JSON.stringify(this.sectionsArray));
  this.sectionsArray.forEach(section => {
    section.items = this.reorderCMSItemsByPosition(section.items);
  });
  this.mobileView = true;
  this.cdRef.detectChanges(); // 🔄 Force update
}


goBackToDesktop() {
  if (this.storedMobileView) {
    this.sectionsArray = JSON.parse(JSON.stringify(this.storedMobileView));
  }
  this.mobileView = false;
  this.cdRef.detectChanges();

  if (!['TOU', 'FAQ', 'CU', 'PP', 'NT', 'FD', 'AC', 'TR', 'PR'].includes(this.selectedMenuId)) {
    setTimeout(() => {
      this.updateSectionHeights();
    }, 200);
  }
}



  isEditingMode(sectionIndex: number): boolean {
  return this.editingSection && this.isEditingSection === sectionIndex;
}

isDataSaved(item: any): boolean {
  // Check if the item has been saved (not a blob URL and has proper ID)
  if (item.type === 'video') {
    if (item.isYoutubeOrVimeo) {
      return !!item.videoUrl && !item.videoUrl.startsWith('blob:');
    } else {
      return !!item.localVideoUrl && !item.localVideoUrl.startsWith('blob:');
    }
  }
  return true; // For other types, assume saved
}

getContainers() {
    this.isPublishedView = false;
  const selectedId = this.selectedDraftId;
  this.trainingEmbededVideo = null;

  this.manageWebsiteService.GetAllCMSContainer(selectedId, false).subscribe((resp) => {
    // Reset prItems to avoid duplication
    this.prItems = [];

    // Create a map to group items by bannerSubHeading for PR menu
    const sectionMap = new Map<string, any[]>();

    // Process the API response
    this.sectionsArray = resp.map((section) => {
      if (!this.selectedContainerType) {
        this.selectedContainerType = section.sectionType ?? "freeForm";
      }

      const parsedStylesArray = section.getAllCMSContainerViews.map(item => {
        try {
          if (typeof item.styles === 'string') {
            return JSON.parse(item.styles);
          }
          return item.styles || {};
        } catch (e) {
          console.warn('Failed to parse triple-encoded styles:', item.styles, e);
          try {
            return typeof item.styles === 'string' ? JSON.parse(item.styles) : (item.styles || {});
          } catch (e2) {
            console.warn('Fallback parsing also failed:', e2);
            return {};
          }
        }
      });
      if (this.selectedMenuId === 'PR') {
        section.getAllCMSContainerViews.forEach((container) => {
          container.getAllCMSItemViews.forEach((item) => {
            if (item.url || item.content) {
              const subHeading = item.bannerSubHeading;
              if (!sectionMap.has(subHeading)) {
                sectionMap.set(subHeading, []);
              }
              sectionMap.get(subHeading)!.push({
                id: item.uploadId || item.id,
                isVideo: item.isVideo || false,
                title: item.bannerHeading || '',
                newHeadings: item.newHeadings || [],
                uniqueId: item.uniqueId,
                bannerSubHeading: item.bannerSubHeading,
                videoFile: null,
                ImageFile: null,
                blobUrl: item.content || item.url || '',
                fileName: item.newHeadings?.[0]?.text || '',
                url: item.url || '',
                content: item.content || '',
                type: item.type || 'pdf',
                panelType: item.panelType || 'pdf',
                fullBleed: item.fullBleed || '',
                fitWidth: item.fitWidth || '',
                opacity: item.opacity || '',
                autoPlay: item.autoPlay || false,
                requireUserToWatch: item.requireUserToWatch || item.isRequired || false
              });
            }
          });
        });
      }

      return {
        id: section.id,
        position: section.position,
        type: section.sectionType,
        height: section.getAllCMSContainerViews.reduce((max, item, idx) => {
          const styles = parsedStylesArray[idx];
          const heightPercent = styles.height || this.getDefaultHeightForType(item.type);
          const topPercent = styles.top || 10;
          const bottomEdge = topPercent + heightPercent;
          return Math.max(max, bottomEdge);
        }, 50),
        items: section.getAllCMSContainerViews
          .filter((items) => !(
            (items.type === 'panel' || items.type === 'image' || items.type === 'video' || items.type === 'audio') &&
            (!items.getAllCMSItemViews || items.getAllCMSItemViews.length === 0)
          ))
          .map((items, idx) => {
            const parsedStyles = parsedStylesArray[idx];

            let buttonStyle: any = {};
            if (items.type === 'button' && items.salesHeading) {
              try {
                buttonStyle = typeof items.salesHeading === 'string' ? JSON.parse(items.salesHeading) : items.salesHeading;
              } catch (e) {
                console.warn('Failed to parse button salesHeading:', items.salesHeading);
                buttonStyle = {};
              }
            }

            let images: string[] = [];
            let localVideoUrl: string | null = null;
            let videoUrl: string | null = null;
            let audioUrl: string | null = null;
            let content: string | null = null;
            let fileName: string | null = null;
            let isYoutubeOrVimeo: boolean = false;
            let textContent: string | null = null;
            let autoPlay: boolean = false;
            let loop: boolean = false;
            let requireUserToWatch: boolean = false;

            if (items.type === 'greeting') {
              const hour = new Date().getHours();
              const greetingMessage =
                hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
            
              const html = items.text?.trim();
            
              if (html) {
                // ✅ Just use DB text as-is (don’t replace greeting)
                textContent = html;
              } else {
                // ✅ Only generate when DB has nothing
                textContent = 
                 `
                  <h3 style="text-align:left;">
                    <span 
                      class="kl-editor-size-x-large"
                      style="color:#02479c !important; font-family: HelveticaNeueBold; font-size:19px;">
                      [Good Morning/Afternoon/Evening], [First Name]
                    </span>
                  </h3>
                `;
              }
            }
            
            if (items.type === 'image' && items.getAllCMSItemViews?.length) {
              images = items.getAllCMSItemViews.map(item => item.url).filter(url => !!url);
              if (images.length > 0) {
                fileName = this.extractFileNameFromUrl(images[0]);
              }
            } else if (items.type === 'video' && items.getAllCMSItemViews?.length) {
              const videoItem = items.getAllCMSItemViews[0];
              autoPlay = videoItem.autoPlay || false;
              requireUserToWatch = videoItem.requireUserToWatch || videoItem.isRequired || false;
              if (videoItem.bannerHeading) {
                try {
                  const loopData = typeof videoItem.bannerHeading === 'string' ? 
                    JSON.parse(videoItem.bannerHeading) : videoItem.bannerHeading;
                  loop = loopData.loop || false;
                } catch (e) {
                  console.warn('Failed to parse loop from bannerHeading:', videoItem.bannerHeading);
                }
              }
              if (videoItem.url) {
                localVideoUrl = videoItem.url;
                videoUrl = null;
                isYoutubeOrVimeo = false;
                fileName = this.extractFileNameFromUrl(videoItem.url);
              } else if (videoItem.content) {
                videoUrl = this.convertToEmbedUrl(videoItem.content);
                localVideoUrl = null;
                isYoutubeOrVimeo = this.isExternalVideo(videoItem.content);
              }
              content = videoItem.content;
            } else if (items.type === 'audio' && items.getAllCMSItemViews?.length) {
              const firstItem = items.getAllCMSItemViews[0];
              audioUrl = firstItem.url || firstItem.content || items.text || null;
              content = firstItem.content || items.text || null;
              if (audioUrl) {
                fileName = this.extractFileNameFromUrl(audioUrl);
              }
            } else if (items.type === 'text' || items.type === 'button' || items.type === 'TrainingMonth') {
              textContent = items.text;
              if (items.type === 'TrainingMonth' && items.text && this.isValidVideoUrl(items.text)) {
                videoUrl = this.getEmbedUrl(items.text);
                isYoutubeOrVimeo = true;
              }
            }
            if (this.selectedMenuId === 'FAQ') {
              this.faqs = items.chartHeading ? JSON.parse(items.chartHeading) : [];
            }

            return {
              type: items.type,
              className: items.className,
              containerId: items.containerId,
              id: items.id,
              containerSize: items.containerSize || 30,
              isVideo: items.type === 'video' ? true : (items.isVideo === true || items.isVideo === false ? items.isVideo : false),
              text: textContent || items.text || '',
              content: content || textContent || items.text || '',
              selectedIndex: 0,
              chartHeading: items.chartHeading,
              salesHeading: items.salesHeading,
              iFrame: this.sanitizer.bypassSecurityTrustResourceUrl(items.iFrame) || '',
              hyperlink: items.chartHeading || items.salesHeading || '',
              buttonStyle: buttonStyle,
              styles: parsedStyles,
              xPercent: parsedStyles.left != null ? parseFloat(parsedStyles.left) : 0,
              yPercent: parsedStyles.top != null ? parseFloat(parsedStyles.top) : 10,
              widthPercent: items.containerSize || 30,
              heightPercent: parsedStyles.height || this.getDefaultHeightForType(items.type),
              zIndex: parsedStyles.zindex || 1,
              x: 0,
              y: 0,
              width: 0,
              height: 0,
              autoPlay: autoPlay,
              loop: loop,
              requireUserToWatch: requireUserToWatch,
              videoUrl: videoUrl,
              localVideoUrl: localVideoUrl,
              isYoutubeOrVimeo: isYoutubeOrVimeo,
              tempVideoUrl: !isYoutubeOrVimeo ? localVideoUrl : null,
              images: images,
              audioUrl: audioUrl,
              currentIndex: 0,
              fileName: fileName,
              title: items.getAllCMSItemViews?.[0]?.bannerHeading || '',
              subtitle: items.getAllCMSItemViews?.[0]?.bannerSubHeading || '',
              showControls: true,
              selectedTimePeriod: items.chartDropdown || 'currentYear',
              chartDataType: items.chartDataType,
              chartView: (items.type === 'Pie Chart' || items.type === 'Line Chart' || items.type === 'Bar Chart') ? [160, 160] : undefined,
              pieChartData: items.type === 'Pie Chart' ? this.pieChartDataSets[items.chartDropdown || 'currentMonth']?.[items.chartDataType || 'quantity'] || [] : undefined,
              lineChartData: items.type === 'Line Chart' ? this.lineChartDataSets[items.chartDropdown || 'currentYear']?.[items.chartDataType || 'quantity'] || { labels: [], datasets: [] } : undefined,
              barChartData: items.type === 'Bar Chart' ? this.barChartDataSets[items.chartDropdown || 'currentYear']?.[items.chartDataType || 'quantity']?.data || { labels: [], datasets: [] } : undefined,
              listenProgress: 0,
              getAllCMSItemViews: items.getAllCMSItemViews.map((item) => ({
                id: item.uploadId || item.id,
                isVideo: item.isVideo === true || item.isVideo === false ? item.isVideo : item.type === 'video',
                bannerHeading: item.bannerHeading,
                newHeadings: item.newHeadings || [],
                uniqueId: item.uniqueId,
                bannerSubHeading: item.bannerSubHeading,
                videoFile: null,
                ImageFile: null,
                url: items.type === 'pdf' && item.url ? item.url : items.type === 'pdf' ? '' : (item.url || items.text || ''),
                content: items.type === 'pdf' && item.content ? item.content : items.type === 'pdf' ? '' : (item.content || items.text || ''),
                type: item.type,
                panelType: item.panelType || 'panel',
                fullBleed: item.fullBleed,
                fitWidth: item.fitWidth,
                opacity: item.opacity,
                autoPlay: item.autoPlay || false,
                requireUserToWatch: item.requireUserToWatch || item.isRequired || false
              }))
            };
          })
      };
    }).sort((a, b) => a.position - b.position);

    this.sectionsArray.forEach((section, idx) => {
      if (section.type === 'widgets') {
        this.reflowSection(idx);
      }
    });

    if (this.selectedMenuId === 'PR') {
      sectionMap.forEach((items, subHeading) => {
        this.prItems.push({
          title: subHeading === 'imp' ? 'Important Information' : 
                 subHeading === 'gen' ? 'General Information' : 
                 subHeading === 'Important Information' ? 'Important Information' : subHeading,
          items: items.sort((a, b) => (a.position || 0) - (b.position || 0)) // Sort items by position
        });
      });

      // Remove the sorting by title to preserve saved order
      // this.prItems.sort((a, b) => a.title.localeCompare(b.title));

      const isPdf = (item) => {
        return (
          item &&
          ((item.fileName && item.fileName.toLowerCase().endsWith('.pdf')) ||
            (item.blobUrl && item.blobUrl.toLowerCase().includes('.pdf')))
        );
      };

      const isViewableWebPage = (url: string): boolean => {
        return this.isValidUrl(url) &&
          !url.toLowerCase().endsWith('.doc') &&
          !url.toLowerCase().endsWith('.docx') &&
          !url.toLowerCase().endsWith('.xls') &&
          !url.toLowerCase().endsWith('.xlsx') &&
          !url.toLowerCase().endsWith('.csv') &&
          !url.toLowerCase().endsWith('.ppt') &&
          !url.toLowerCase().endsWith('.pptx');
      };

      const firstValidItem = this.prItems.flatMap(section => section.items).find(item => isPdf(item) || isViewableWebPage(item.blobUrl));
      if (firstValidItem) {
        this.iframeSrc = this.getSafeURl(firstValidItem.blobUrl);
        this.selectedItemUrl = firstValidItem.blobUrl;
        this.collapsed = true;
      } else {
        this.iframeSrc = null;
        this.collapsed = false;
      }
    }

    this.originalSections = JSON.stringify(this.sectionsArray);
    if (this.selectedMenuId !== 'TOU' && this.selectedMenuId !== 'FAQ' && this.selectedMenuId !== 'CU' && this.selectedMenuId !== 'PP' && this.selectedMenuId !== 'NT' && this.selectedMenuId !== 'FD' && this.selectedMenuId !== 'AC' && this.selectedMenuId !== 'TR' && this.selectedMenuId !== 'PR') {
      setTimeout(() => {
        this.updateSectionHeights();
      }, 500);
    }
    
    // Initialize chart data and sizes after sections are loaded
    this.initializeChartTimePeriod();
    
    if (window.innerWidth <= 480) {
      this.storedMobileView = JSON.parse(JSON.stringify(this.sectionsArray));
      this.sectionsArray.forEach(section => {
        section.items = this.reorderCMSItemsByPosition(section.items);
      });
    }

    this.changeDetectorRef.detectChanges();
  });

}
trackByItemUrl(index: number, item: any): string {
  return item.blobUrl; // Use blobUrl as the unique identifier
}


extractFileNameFromUrl(url: string): string {
  if (!url) return '';
  
  try {
    let fileName = '';
    
    const urlParts = url.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    
    const cleanPart = lastPart.split('?')[0];
    
    if (cleanPart.includes('.')) {
      fileName = cleanPart;
    } else {
      const meaningfulParts = urlParts.filter(part => 
        part.includes('.') || 
        (part.length > 10 && !part.includes('http') && !part.includes('Admin'))
      );
      fileName = meaningfulParts.length > 0 ? meaningfulParts[meaningfulParts.length - 1] : cleanPart;
    }
    
    fileName = fileName.replace(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}[-_]?/i, '');
    
    return fileName || 'Unknown file';
  } catch (error) {
    console.warn('Error extracting filename from URL:', url, error);
    return 'Unknown file';
  }
}

getSafeEmbedUrl(url: string | null): SafeResourceUrl | null {
  if (url && url.includes('youtu')) {
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\n]+)/)?.[1];
    if (videoId) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
    }
  } else if (url && url.includes('vimeo')) {
    const videoId = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/)?.[1];
    if (videoId) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://player.vimeo.com/video/${videoId}`);
    }
  }
  return null;
}
updateSectionHeights(sectionIndex?: number): void {
  if (this.updateSectionHeightsTimer) clearTimeout(this.updateSectionHeightsTimer);

  this.updateSectionHeightsTimer = setTimeout(() => {
    const indices = sectionIndex !== undefined 
      ? [sectionIndex] 
      : this.sectionsArray.map((_, i) => i);

    indices.forEach(idx => {
      const section = this.sectionsArray[idx];
      if (!section) return;

      if (!section.items || section.items.length === 0) {
        this.setSectionHeight(idx, 16);
        return;
      }

      let maxBottom = 0;
      const viewportHeight = window.innerHeight;

      if ((section.type || '').toLowerCase() === 'widgets') {
        const gap = window.innerWidth < 768 ? 0.4 : 0.6;
        const rowHeights: number[] = [];
        let curRowWidth = 0;
        let curRowHeight = 0;

        section.items.forEach(item => {
          const w = item.widthPercent ?? 33;
          const h = item.heightPercent ?? 25;

          if (curRowWidth === 0 || curRowWidth + gap + w > 100) {
            if (curRowWidth > 0) rowHeights.push(curRowHeight);
            curRowWidth = w;
            curRowHeight = h;
          } else {
            curRowWidth += gap + w;
            curRowHeight = Math.max(curRowHeight, h);
          }
        });
        if (curRowWidth > 0) rowHeights.push(curRowHeight);

        const gaps = Math.max(0, rowHeights.length - 1) * 2;
        maxBottom = rowHeights.reduce((a, b) => a + b, 0) + gaps + 8;

      } else {
        section.items.forEach(item => {
          const top = item.yPercent ?? 0;
          let height = item.heightPercent ?? 25;

          if (item.type === 'text' || item.type === 'greeting') {
            const elementDom = document.getElementById('element-' + item.id);
            if (elementDom) {
              const actualHeightPx = elementDom.scrollHeight || elementDom.offsetHeight;
              const actualHeightVh = (actualHeightPx / viewportHeight) * 100;
              height = Math.max(height, actualHeightVh);
            }
          }

          maxBottom = Math.max(maxBottom, top + height);
        });
        maxBottom += 0.5;
      }

      const finalHeight = Math.max(8, Math.ceil(maxBottom));
      this.setSectionHeight(idx, finalHeight);
    });

    this.changeDetectorRef.detectChanges();
  }, 80);
}

private setSectionHeight(sectionIndex: number, vh: number): void {
  const el = this.scrollContainerItem?.nativeElement?.children?.[sectionIndex];
  if (!el) return;

  const section = this.sectionsArray[sectionIndex]; // ← Fixed!

  el.style.height = `${vh}vh`;
  el.style.minHeight = (!section?.items || section.items.length === 0) ? '16vh' : '1px';
}
getSafeURl(url: string): SafeResourceUrl | null {
  if (!url) return null; // ⚠️ Do not return '' here

  if (this.safeUrls[url]) {
    return this.safeUrls[url];
  }

  const safe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  this.safeUrls[url] = safe;
  return safe;
}


getSectionArrayMaxHeight(sectionIndex: number): string {
  const section = this.sectionsArray[sectionIndex];
  if (!section?.items?.length) return '50vh';
  
  let maxHeight = 0;
  section.items.forEach(item => {
    const itemTopVh = this.VIEWPORT_SCALE.topOffset + (item.yPercent / 100) * this.VIEWPORT_SCALE.height * 100;
    const itemHeightVh = (item.heightPercent / 100) * this.VIEWPORT_SCALE.height * 100;
    const bottomEdge = itemTopVh + itemHeightVh;
    
    if (bottomEdge > maxHeight) {
      maxHeight = bottomEdge;
    }
  });
  
  // Add padding and ensure minimum height
  const finalHeight = Math.max(maxHeight + 10, 50) <= 50 && this.selectedMenuId =='CU' || this.selectedMenuId == 'PP'? 80 : Math.max(maxHeight + 10, 50);

  return `${finalHeight}vh`;
}

isTouchingBoundary(item: any, sectionIndex: number): boolean {
  // Check if item is at the very top of the section (yPercent == 0 or close)
  return item.yPercent <= 0 || item.top === 0;
}

  
  // Add helper method for default heights
  getDefaultHeightForType(type: string): number {
    switch(type) {
      case 'text': return 10;
      case 'image': return 30;
      case 'video': return 40;
      case 'audio': return 15;
      case 'button': return 8;
      case 'Pie Chart':
      case 'Line Chart':
      case 'Bar Chart': return 35;
      default: return 25;
    }
  }
  saveTemplateContent(content): Promise<void> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('Id', '00000000-0000-0000-0000-000000000000');
      formData.append('BannerHeading', content.bannerHeading);
      formData.append('BannerSubHeading', content.bannerSubHeading);
      formData.append('UniqueId', content.uniqueId);
      formData.append('newHeadings', JSON.stringify(content.newHeadings));
      formData.append('file', content.ImageFile);
      if(content.id === '00000000-0000-0000-0000-000000000000' || !content.id) {
        this.manageWebsiteService.UploadCMSTempalteFile(formData).subscribe({
          next: (resp) => {
            if (resp.isSuccess) {
              console.log('Saved Successfully');
              resolve();
            } else {
              console.warn('Failed to save');
              reject('UploadCMSContainerFile failed');
            }
          },
          error: (err) => reject(err)
        });
      } else {
        const reqObj = {
          "id": content.id,
          "bannerHeading": content.bannerHeading,
          "newHeadings": content.newHeadings,
          "bannerSubHeading": content.bannerSubHeading,
          "tenantCode": environment.tentantcode
        }
        this.manageWebsiteService.LikeCMSTempalteFile(reqObj).subscribe({
          next: (resp) => {
            if (resp.isSuccess) {
              console.log('Saved Successfully');
              resolve();
            } else {
              console.warn('Failed to save');
              reject('LikeCMSTempalteFile failed');
            }
          },
          error: (err) => reject(err)
        });
      }
    });
  }


 
  openDeletetemplateDialog(item: any, content: any) {
    this.deleteItem = item; // Store item for deletion
    this.modalReference = this._matDialog.open(content);
  }
  
  sanitizeVideoUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }




  calculateWidth(totalCourse: number, totalAttempted: number): number {
    if (totalCourse === 0) {
      return 0;
    }
    const result = (totalAttempted / totalCourse) * 100;
    return parseFloat(result.toFixed(2));
  }
  getItemClass(index: number, items: any[], currentItem: string): string {
    let rowIndex = Math.floor(index / 2);
    let rowItems = items.slice(rowIndex * 2, rowIndex * 2 + 2);
  
    let hasAcademy = rowItems.includes("Academy");
  
    if (currentItem === "Academy") {
      return "academy-item";
    }
  
    if (rowItems.length === 1) {
      return "single-item";
    }
  
    return hasAcademy ? "flex-item" : "equal-item";
  }
  formatNumberWithCommas(value): string {
    if (value == null) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
 
    
     async processVimeoUrl(url: string): Promise<string | null> {
      return new Promise((resolve, reject) => {
        this.urlService.getVimeoEmbedUrl(url).subscribe(
          (resp) => {
            const embedUrl = this.urlService.extractIframeUrl(resp.html);
            if (!embedUrl) {
              this.notificationService.errorTopRight('Provided URL is not valid.');
              resolve(null);
            } else {
              resolve(embedUrl);
            }
          },
          (error) => {
            reject(error);
          }
        );
      });
    }
    
    private generateSectionId(): string {
      return 'section-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
  toggleResizeDropdown(containerIndex: number) {
    this.showResizeDropdown = this.showResizeDropdown === containerIndex ? null : containerIndex;
  }



  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
 

  preventOverlap(currentItem: any, currentRect: DOMRect, flag, container) {
    const textItems = flag ? container.getAllCMSItemViews[container['selectedIndex']].newHeadings : this.sectionContainer.items[0].getAllCMSItemViews[this.sectionContainer.items[0]['selectedIndex']].newHeadings;
    
    for (let item of textItems) {
      if (item !== currentItem) {
        const existingRect = document.querySelector(`[ngStyle*="'top.px': ${item.y}, 'left.px': ${item.x}"]`)?.getBoundingClientRect();
        
        if (existingRect && this.isOverlapping(currentRect, existingRect)) {
          currentItem.y += existingRect.height + 10;
        }
      }
    }
  }
  
  isOverlapping(rect1: DOMRect, rect2: DOMRect): boolean {
    return (
      rect1.left < rect2.right &&
      rect1.right > rect2.left &&
      rect1.top < rect2.bottom &&
      rect1.bottom > rect2.top
    );
  }
  
 
  onDragStartItem(event: CdkDragStart) {
    this.hideAddSection = true
  }


  onDragEndItem(event: CdkDragEnd, currentIndex: number) {
    this.hideAddSection = false;
    // this.scrollToTop();
  }

  toggleSalesGraph(checked) {
    this.isSalesSelected = checked;
    window.sessionStorage.setItem('isSalesSelected', JSON.stringify(this.isSalesSelected));
    this.lineChartData.datasets = [this.isSalesSelected ? this.lineChartDataset[0] : this.lineChartDataset[1]];
    if (this.baseChart) {
      this.baseChart.update();
    }
  }

  getNanoTimestampWithRandomString(): string {
    const timestamp = Date.now().toString(36);
    const randomString = Math.random().toString(36).substring(2, 10);
    return `${timestamp}-${randomString}`;
  }

  addNewSection() {
    const newSection: Section = {
      id: `00000000-0000-0000-0000-000000000000`,
      items: [],
      height: 300,
      type: this.selectedContainerType,
    };
    this.sectionsArray.unshift(newSection);
    this.showGridBlocks.push(false);
    this.alignmentGuides.push([]);
    this.isEditingSection = null; 
    this.editingSection = false; 
    this.addSection = this.selectedMenuId == 'FAQ' || this.selectedMenuId == 'TOU' || this.selectedMenuId === 'CU' || this.selectedMenuId == 'PP' || this.selectedMenuId === 'NT' || this.selectedMenuId === 'FD' || this.selectedMenuId === 'AC' || this.selectedMenuId === 'TR' || this.selectedMenuId === 'PR' ? true:false; 
    this.markElementsAsModified();
    this.changeDetectorRef.detectChanges();
    this.storeState();
    if(this.selectedMenuId !== 'FAQ' && this.selectedMenuId !== 'TOU' && this.selectedMenuId !== 'CU' && this.selectedMenuId !== 'PP' && this.selectedMenuId !== 'NT' && this.selectedMenuId !== 'FD' && this.selectedMenuId !== 'AC' && this.selectedMenuId !== 'TR' && this.selectedMenuId !== 'PR') {
      setTimeout(() => {
        this.updateSectionHeights();
      }, 100);
    }
    
  }

  generateUniqueId(): string {
    return 'section_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
 
  
 cancelSection(): void {
    if (
      this.sectionsArray.length > 0 &&
      this.sectionsArray[this.sectionsArray.length - 1].items &&
      this.sectionsArray[this.sectionsArray.length - 1].items.length === 0
    ) {
      this.sectionsArray.pop();
      this.showGridBlocks.pop();
      this.alignmentGuides.pop();
    }

    this.addSection = false;
    this.isEditingSection = null;
    this.containerPopup = false;
    this.selectedContainerType = null;
    this.showTypeSelectionPopup = false;

    this.markElementsAsModified();
    this.changeDetectorRef.detectChanges();
  }

  // Clear section items
  clearSection(): void {
    if (this.isEditingSection !== null) {
      this.sectionsArray[this.isEditingSection].items = [];
      this.showGridBlocks[this.isEditingSection] = false;
    }
  }
 

  // Stop editing section
  stopEditingSection(): void {
    this.isEditingSection = null;
    this.showGridBlocks = [];
    this.containerPopup = false;
  }
  
  toggleContainerPopup(event?: Event, sectionIndex?: number): void {
    if (event && typeof (event as Event).stopPropagation === 'function') {
      (event as Event).stopPropagation();
    }
    this.containerPopup = !this.containerPopup;
    console.log('toggleContainerPopup', this.containerPopup, 'sectionIndex:', sectionIndex);
  }
  
  addContainer(type: string) {
    if (this.isEditingSection !== null && this.selectedContainerSize) {
      const newContainer = {
        id: Date.now(),
        type: type,
        widthPercent: this.selectedContainerSize,
        heightPercent: 25, 
        xPercent: 10,
        yPercent: 10,
        content: this.getDefaultContent(type),
        style: this.getDefaultStyle(type)
      };
      
      //this.sectionsArray[this.isEditingSection].items.push(newContainer);
      this.containerPopup = false;
     // this.selectedContainerSize = 50; 
    }
  }
  
  getDefaultContent(type: string): string {
    switch(type) {
      // case 'text': return 'Good Morning, Kohler Admin';
      case 'button': return 'Click me';
      case 'image': return '';
      case 'video': return '';
      default: return '';
    }
  }
  
  getDefaultStyle(type: string): any {
    switch(type) {
      case 'text': 
        return { fontSize: 16, color: '#000000', backgroundColor: 'transparent' };
      case 'button': 
        return { backgroundColor: '#007bff', color: '#ffffff' };
      default: 
        return {};
    }
  }

  closeContainerPopup(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
  editingSection = false;
exitEditing() {
    this.editingSection = false;
    this.editChild = false;
    this.editHeaderFlag = false;
    this.isEditingSection = null;
    this.containerPopup = false;

    if (this.lockedDraftId) {
        const unlockRequest = {
            userId: this.currentUserId,
            menuId: this.lockedDraftId,
            lockAdmin: false 
        };

        this.manageWebsiteService.SaveorUpdateLockDraftPage(unlockRequest).subscribe({
            next: () => {
                console.log(`Lock released for draft ID: ${this.lockedDraftId}`);
                this.lockedDraftId = null; // Clear the lock state
                this.GetLockPageofAdmin = false; // Reset the flag
            },
            error: (err) => {
                console.error('Failed to release lock:', err);
            }
        });
    }
}

disableEditing(i: number) {
  if (this.sectionsArray[i]?.items && this.sectionsArray[i]?.items.length > 0) {
    this.storeState();
    // Reset isEdit for all items in the section
    this.sectionsArray[i].items.forEach((item: PageElement) => {
      if (item.isEdit) {
        item.isEdit = false;
      }
    });
    this.editingSection = false;
    this.isEditingSection = null;
    this.selectedElement = null;
    this.selectedItemIndex = null;
    this.containerPopup = false;
  //  this.updateSectionHeightDynamic(i);
    this.changeDetectorRef.detectChanges();
  } else {
    this.notificationService.errorTopRight('Empty section cannot be saved.');
  }
}

  editSection(index: number) {
  this.editingSection = true;
  this.showCenterLine = false;
  this.isEditingSection = index;
  this.containerPopup = false;
  this.showTypeSelectionPopup = false;

  this.selectedContainerType = this.sectionsArray[index]?.type || null;

  this.showGridBlocks[index] = true;

  setTimeout(() => {
    this.calculateGridColumns(index); 
   // this.updateSectionHeightDynamic(index);
  });

  this.storeState();
  this.changeDetectorRef.detectChanges();

  if (this.selectedMenuId !== 'HM') {
    this.editElement(this.sectionsArray[0].items[0], 0, 0);
  }
}


  async saveContainer() {
    // Validate sections
    this.sectionsArray.forEach((section, idx) => {
      if (section.type === 'widgets') {
        this.reflowSection(idx);
      }
    });

    const isSectionsEmpty = !this.sectionsArray || this.sectionsArray.length === 0;
    const hasEmptySections = this.sectionsArray.some(section => !section.items || section.items.length === 0);
    if (isSectionsEmpty || hasEmptySections) {
      this.notificationService.errorTopRight('The draft page cannot have empty sections. Please add content to all sections.');
      return;
    }

    // Validate media files
    const mediaValidationResult = this.validateMediaFiles();
    if (!mediaValidationResult.isValid) {
      this.notificationService.errorTopRight(mediaValidationResult.message);
      return;
    }
    const faqContainer = this.sectionsArray
      .flatMap(section => section.items)
      .find(item => item.type === 'FAQ');

    if (faqContainer && Array.isArray(this.faqs)) {
      const invalidFaq = this.faqs.find(f => !f.question?.trim() || !f.answer?.trim());
      if (invalidFaq) {
        this.notificationService.errorTopRight('FAQ cannot be saved with blank question or answer.');
        return;
      }
    }

    // Filter out invalid image elements
    this.sectionsArray = this.sectionsArray.map(section => ({
      ...section,
      items: section.items.filter(container => {
        if (container.type === 'image') {
          return container.images?.length > 0 || container.files?.length > 0;
        }
        return true; // Keep other types
      })
    }));

    // Recheck for empty sections after filtering
    if (this.sectionsArray.some(section => section.items.length === 0)) {
      this.notificationService.errorTopRight('The draft page cannot have empty sections after validation. Please add content.');
      return;
    }

    this.previousStateStogage = [];
    this.currentStateIndex = 0;

    const req: any[] = [];

    this.sectionsArray.forEach((section: Section, sectionIndex: number) => {
      if (section.type === 'widgets') {
        const totalItems = section.items.length;
        const totalWidth = 100;
        const gapPercent = window.innerWidth < 768 ? 0.4 : 0.6; // Reduce gap for smaller screens
        const totalGaps = totalItems > 1 ? (totalItems - 1) * gapPercent : 0;
        const totalItemWidth = section.items.reduce((sum, item) => sum + (item.widthPercent || 30), 0);

        if (totalItemWidth + totalGaps > totalWidth) {
          const scaleFactor = (totalWidth - totalGaps) / totalItemWidth;
          section.items.forEach(item => {
            item.widthPercent = (item.widthPercent || 30) * scaleFactor;
          });
        }
      }

      const sectionId = section.id || `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const lmsSlideGroupViews = section.items.map((container: PageElement, containerIndex: number) => {
        const isButton = container.type === 'button';
        const isChart = ['Pie Chart', 'Line Chart', 'Bar Chart'].includes(container.type || '');
      
      
        const adjustedX = container.xPercent ?? 0;
        const adjustedY = container.yPercent ?? 0;
                    
        return {
          sectionId: sectionId,
          type: container.type,
          containerId: container.containerId || this.getNanoTimestampWithRandomString(),
          id: container.id || `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          heading: "string",
          style: "string",
          containerSize: container.widthPercent || 33,
          styles: {
            top: adjustedY,
            left: adjustedX,
            height: container.heightPercent ?? 25,
            zindex: container.zIndex ?? 1,
            croppedWidth: container.croppedWidth ?? undefined,
            croppedHeight: container.croppedHeight ?? undefined
          },
          
          
          position: containerIndex,
          isVideo: container.type === 'video' ? true : (container.type === 'PP' ? (container.isVideo || false) : false),
          className: container.className || 'wfull',

          // Preserve chart text exactly; do not fall back to container.content for charts
          text: isChart
            ? (container.text ?? '')
            : (
              container.type === 'TOU' || container.type === 'FAQ' || container.type === 'CU' ||
              container.type === 'PP' || container.type === 'NT' || container.type === 'FD' ||
              container.type === 'AC' || container.type === 'TR' || container.type === 'pdf' ||
              container.type === 'TrainingMonth' || container.type === 'image' || container.type === 'text' || container.type === 'greeting'
            )
              ? (container.text ?? '')
              : (container.content ?? container.text ?? ''),

          chartHeading: container.type === 'FAQ' ? JSON.stringify(this.faqs)
            : ['Pie Chart', 'Line Chart', 'Bar Chart', 'All', 'Credit', 'Redemptions', 'Messages', 'Academy', 'TrainingMonth'].includes(container.type || '')
              ? (container.chartHeading || '')
              : isButton ? container.chartHeading
                : container.chartHeading || container.salesHeading || '',

          salesHeading: container.type === 'AC' || container.type === 'CU' || container.type === 'PP' ? (container.salesHeading || '') : isButton
            ? JSON.stringify({
                zIndex: container.zIndex || 1,
                color: container.buttonStyle?.color || '#ffffff',
                backgroundColor: container.buttonStyle?.backgroundColor || '#007bff',
                fontWeight: container.buttonStyle?.fontWeight || 'normal',
                fontStyle: container.buttonStyle?.fontStyle || 'normal',
                textDecoration: container.buttonStyle?.textDecoration || 'none'
              })
            : ['All', 'Credit', 'Redemptions', 'Messages', 'Academy', 'TrainingMonth'].includes(container.type || '')
              ? container.text || `${container.type} Sales Placeholder`
              : '',

          iFrame: null,

          chartDropdown: ['Pie Chart', 'Line Chart', 'Bar Chart'].includes(container.type)
            ? (container.selectedTimePeriod || 'currentYear')
            : '',

          chartDataType: ['Pie Chart', 'Line Chart', 'Bar Chart'].includes(container.type)
            ? (container.chartDataType)
            : '',

          cmsItemViews: container.type === 'pdf'
            ? (() => {
              // prItems must exist and not be empty
              if (!this.prItems || this.prItems.length === 0) {
                this.notificationService.errorTopRight('PDF cannot be saved: no PDF sections found.');
                throw new Error('EMPTY_PDF_SECTIONS');
              }

              // Every PDF section must contain at least one item
              const empty = this.prItems.find((s: any) => !s.items || s.items.length === 0);
              if (empty) {
                this.notificationService.errorTopRight(
                  `Page cannot be saved "${empty.title ?? 'Untitled'}" no file attached.`
                );
                throw new Error('EMPTY_PDF_SECTION_ITEMS');
              }

              // Build views
              return this.prItems.flatMap((section: any, index: number) =>
                section.items.map((item: any, itemIndex: number) => ({
                  templateId: item.templateId || item.id || '00000000-0000-0000-0000-000000000000',
                  isVideo: item.isVideo || false,
                  uniqueId: item.uniqueId || `${container.id}-pr-item-${index}-${itemIndex}`,
                  bannerHeading: item.title || '',
                  bannerSubHeading: section.title,
                  newHeadings: item.fileName ? [{ text: item.fileName, x: 0, y: 0 }] : [],
                  url: item.blobUrl && !String(item.blobUrl).startsWith('blob:') ? item.blobUrl : '',
                  content: item.content,
                  type: 'pdf',
                  panelType: 'pdf',
                  position: itemIndex
                }))
              );
            })()
                : container.type === 'image' && container.images?.length
                  ? container.images.map((image: string, index: number) => {
                  const imageUniqueId = container.getAllCMSItemViews?.[index]?.uniqueId || `${container.id}-image-${index}`;
                  return {
                    templateId: container.type === 'template image' ? container.templateId || '00000000-0000-0000-0000-000000000000' : '00000000-0000-0000-0000-000000000000',
                    isVideo: false,
                    uniqueId: imageUniqueId,
                    bannerHeading: container.bannerHeading || '',
                    bannerSubHeading: container.bannerSubHeading || '',
                    url: image,
                    content: container.getAllCMSItemViews?.[index]?.content || '',
                    type: 'image',
                    panelType: 'image',
                    newHeadings: (container.newHeadings || []).map((heading, idx) => ({
                      text: heading.text || '',
                      x: heading.x || idx * 10,
                      y: heading.y || idx * 10
                    })),
                    croppedWidth: container.croppedWidth || undefined,
                    croppedHeight: container.croppedHeight || undefined
                  };
            })
              : container.type === 'video'
                ? [{
                  templateId: container.templateId || '00000000-0000-0000-0000-000000000000',
                  isVideo: true,
                  uniqueId: container.getAllCMSItemViews?.[0]?.uniqueId || `${container.id}-video`,
                  bannerHeading: container.bannerHeading || '',
                  bannerSubHeading: container.bannerSubHeading || '',
                  url: container.isYoutubeOrVimeo ? (container.videoUrl || '') : (container.localVideoUrl && !container.localVideoUrl.startsWith('blob:') ? container.localVideoUrl : ''),
                  content: container.isYoutubeOrVimeo ? (container.videoUrl || '') : (container.localVideoUrl && !container.localVideoUrl.startsWith('blob:') ? container.localVideoUrl : ''),
                  type: 'video',
                  panelType: 'video',
                  newHeadings: (container.newHeadings || []).map((heading, idx) => ({
                    text: heading.text || '',
                    x: heading.x || idx * 10,
                    y: heading.y || idx * 10
                  }))
                }]
                : container.type === 'audio'
                  ? [{
                    templateId: container.templateId || '00000000-0000-0000-0000-000000000000',
                    isVideo: false,
                    uniqueId: container.getAllCMSItemViews?.[0]?.uniqueId || `${container.id}-audio`,
                    bannerHeading: container.title || container.bannerHeading || '',
                    bannerSubHeading: container.subtitle || container.bannerSubHeading || '',
                    url: container.audioUrl && !container.audioUrl.startsWith('blob:') ? container.audioUrl : '',
                    content: container.audioUrl && !container.audioUrl.startsWith('blob:') ? container.audioUrl : '',
                    type: 'audio',
                    panelType: 'audio',
                    newHeadings: (container.newHeadings || []).map((heading, idx) => ({
                      text: heading.text || '',
                      x: heading.x || idx * 10,
                      y: heading.y || idx * 10
                    }))
                  }]
                  : container.type === 'panel'
                    ? (container.getAllCMSItemViews || []).map((item) => ({
                      templateId: item.templateId || item.uploadId || '00000000-0000-0000-0000-000000000000',
                      isVideo: item.isVideo || false,
                      uniqueId: item.uniqueId || `${container.id}-panel-item-${Date.now()}`,
                      bannerHeading: item.bannerHeading || '',
                      bannerSubHeading: item.bannerSubHeading || '',
                      url: item.url && !item.url.startsWith('blob:') ? item.url : '',
                      content: item.content || '',
                      type: 'panel',
                      panelType: 'panel',
                      newHeadings: (item.newHeadings || []).map((heading, idx) => ({
                        text: heading.text || '',
                        x: heading.x || idx * 10,
                        y: heading.y || idx * 10
                      }))
                    }))
                    : []
        };
      });

      req.push({
        id: sectionId,
        position: sectionIndex,
        sectionType: this.sectionsArray[sectionIndex]?.type || null,
        lmsSlideGroupViews
      });
    });

    try {
      await new Promise<void>((resolve, reject) => {
        this.manageWebsiteService.BulkSaveOrUpdateCMSContainer(req, this.selectedDraftItem.id).subscribe({
          next: (resp) => {
            if (resp.isSuccess) {
              this.notificationService.successTopRight('Draft saved successfully.');
              this.exitEditing();
              resolve();
            } else {
              this.notificationService.errorTopRight('Failed to save sections.');
              reject('Bulk save failed');
            }
          },
          error: (err) => {
            this.notificationService.errorTopRight('Error saving sections.');
            reject(err);
          }
        });
      });

      // Handle additional content saving for specific container types
      for (let section of this.sectionsArray) {
        for (let container of section.items) {
          if (container.type === 'image' && (container.files?.length || container.needsReplacement)) {
            for (let [index, file] of (container.files || []).entries()) {
              const imageUniqueId = container.getAllCMSItemViews?.[index]?.uniqueId || `${container.id}-image-${index}`;
              await this.saveContainerContent(
                {
                  id: container.id,
                  uploadId: container.getAllCMSItemViews?.[0]?.id,
                  containerId: container.containerId,
                  content: container.images?.[index] || '',
                  ImageFile: container.needsReplacement ? container.file : file,
                  isVideo: false,
                  uniqueId: imageUniqueId,
                  bannerHeading: container.bannerHeading || '',
                  bannerSubHeading: container.bannerSubHeading || '',
                  newHeadings: (container.newHeadings || []).map((heading, idx) => ({
                    text: heading.text || '',
                    x: heading.x || idx * 10,
                    y: heading.y || idx * 10
                  })),
                  fullBleed: container.fullBleed || '',
                  fitWidth: JSON.stringify({
                    xPercent: container.xPercent ?? 0,
                    yPercent: container.yPercent ?? 0,
                    widthPercent: container.widthPercent ?? 33,
                    heightPercent: container.heightPercent ?? 25,
                    style: container.style || {},
                    croppedWidth: container.croppedWidth ?? undefined,
                    croppedHeight: container.croppedHeight ?? undefined
                  }),
                  opacity: container.opacity || '',
                  templateId: container.templateId || '00000000-0000-0000-0000-000000000000',
                  autoPlay: container.autoPlay || false,
                  requireUserToWatch: container.requireUserToWatch || false,
                  modified: container.needsReplacement || container.modified
                },
                this.selectedDraftItem.id,
                container.type
              );
            }
            container.needsReplacement = false;
            container.oldContentFileId = null;
          } else if (container.type === 'video') {
            const videoUniqueId = container.getAllCMSItemViews?.[0]?.uniqueId || `${container.id}-video`;
            const hasVideoFile = container.file && container.file instanceof File;
            const hasVideoUrl = container.isYoutubeOrVimeo && container.videoUrl && !container.videoUrl.startsWith('blob:');
            const hasBlobUrl = container.localVideoUrl && container.localVideoUrl.startsWith('blob:');
            if (!hasVideoFile && !hasVideoUrl && !hasBlobUrl) {
              console.warn(`Skipping video container ${container.id}: No valid video content provided`);
              continue;
            }
            await this.saveContainerContent(
              {
                id: container.id,
                containerId: container.containerId,
                uploadId: container.getAllCMSItemViews?.[0]?.id,
                content: hasVideoFile || hasBlobUrl ? '' : (container.videoUrl || ''),
                videoFile: container.file || null,
                isVideo: true,
                uniqueId: videoUniqueId,
                isYoutubeOrVimeo: container.isYoutubeOrVimeo,
                videoUrl: container.isYoutubeOrVimeo ? container.videoUrl : null,
                localVideoUrl: hasVideoFile || hasBlobUrl ? container.localVideoUrl : null,
                bannerHeading: container.bannerHeading || '',
                bannerSubHeading: container.bannerSubHeading || '',
                newHeadings: (container.newHeadings || []).map((heading, idx) => ({
                  text: heading.text || '',
                  x: heading.x || idx * 10,
                  y: heading.y || idx * 10
                })),
                fullBleed: container.fullBleed || '',
                fitWidth: JSON.stringify({
                  xPercent: container.xPercent ?? 0,
                  yPercent: container.yPercent ?? 0,
                  widthPercent: container.widthPercent ?? 33,
                  heightPercent: container.heightPercent ?? 25,
                  zIndex: container.zIndex ?? 1,
                  style: container.style || {}
                }),
                opacity: container.opacity || '',
                templateId: container.templateId || '00000000-0000-0000-0000-000000000000',
                autoPlay: container.autoPlay || false,
                requireUserToWatch: container.requireUserToWatch || false
              },
              this.selectedDraftItem.id,
              container.type
            );
          } else if (container.type === 'audio') {
            const audioUniqueId = container.getAllCMSItemViews?.[0]?.uniqueId || `${container.id}-audio`;
            const hasAudioFile = container.audioFile && container.audioFile instanceof File;
            const hasValidAudioUrl = container.embedUrl || (container.audioUrl && !container.audioUrl.startsWith('blob:'));
            const hasBlobUrl = (container.tempAudioUrl && container.tempAudioUrl.startsWith('blob:')) ||
              (container.blobUrl && container.blobUrl.startsWith('blob:'));
            if (hasAudioFile || hasValidAudioUrl || hasBlobUrl) {
              await this.saveContainerContent(
                {
                  id: container.id,
                  containerId: container.containerId,
                  uploadId: container.getAllCMSItemViews?.[0]?.id,
                  content: hasAudioFile || hasBlobUrl ? '' : (container.embedUrl || container.audioUrl || ''),
                  audioFile: container.audioFile || null,
                  audioUrl: hasAudioFile ? null : (hasValidAudioUrl ? (container.embedUrl || container.audioUrl) : null),
                  tempAudioUrl: hasAudioFile ? null : container.tempAudioUrl || null,
                  blobUrl: hasAudioFile ? null : container.blobUrl || null,
                  isVideo: false,
                  uniqueId: audioUniqueId,
                  bannerHeading: container.title || container.bannerHeading || '',
                  bannerSubHeading: container.subtitle || container.bannerSubHeading || '',
                  newHeadings: (container.newHeadings || []).map((heading, idx) => ({
                    text: heading.text || '',
                    x: heading.x || idx * 10,
                    y: heading.y || idx * 10
                  })),
                  fullBleed: container.fullBleed || '',
                  fitWidth: JSON.stringify({
                    xPercent: container.xPercent ?? 0,
                    yPercent: container.yPercent ?? 0,
                    widthPercent: container.widthPercent ?? 33,
                    heightPercent: container.heightPercent ?? 25,
                    zIndex: container.zIndex ?? 1,
                    style: container.style || {}
                  }),
                  opacity: container.opacity || '',
                  templateId: container.templateId || '00000000-0000-0000-0000-000000000000',
                  autoPlay: container.autoPlay || false,
                  requireUserToWatch: container.requireUserToWatch || false
                },
                this.selectedDraftItem.id,
                container.type
              );
            } else {
              console.warn(`Skipping audio container ${container.id}: No valid audio content found`);
            }
          } else if (container.type === 'panel') {
            for (const item of container.getAllCMSItemViews || []) {
              const panelUniqueId = item.uniqueId || `${container.id}-panel-item-${Date.now()}`;
              await this.saveContainerContent(
                {
                  id: item.id || '00000000-0000-0000-0000-000000000000',
                  containerId: container.containerId,
                  content: item.content && !item.content.startsWith('blob:') ? item.content : '',
                  ImageFile: item.file || null,
                  isVideo: item.isVideo || false,
                  uniqueId: panelUniqueId,
                  bannerHeading: item.bannerHeading || '',
                  bannerSubHeading: item.bannerSubHeading || '',
                  newHeadings: (item.newHeadings || []).map((heading, idx) => ({
                    text: heading.text || '',
                    x: heading.x || idx * 10,
                    y: heading.y || idx * 10
                  })),
                  fullBleed: item.fullBleed || '',
                  fitWidth: JSON.stringify({
                    xPercent: container.xPercent ?? 0,
                    yPercent: container.yPercent ?? 0,
                    widthPercent: container.widthPercent ?? 33,
                    heightPercent: container.heightPercent ?? 25,
                    zIndex: container.zIndex ?? 1,
                    style: container.style || {}
                  }),
                  opacity: item.opacity || '',
                  templateId: item.templateId || item.uploadId || '00000000-0000-0000-0000-000000000000',
                  autoPlay: item.autoPlay || false,
                  requireUserToWatch: item.requireUserToWatch || false
                },
                this.selectedDraftItem.id,
                'panel'
              );
              if (item.addToTemplate) {
                await this.saveTemplateContent(item);
              }
            }
          } 
          else if (container.type === 'pdf') {
            
            // If prItems is missing or empty, show error and stop
            if (!this.prItems || this.prItems.length === 0) {
              this.notificationService.errorTopRight('PDF section cannot be empty. Please upload at least one file.');
              return;
            }

            for (let sectionIndex = 0; sectionIndex < this.prItems.length; sectionIndex++) {
              const section = this.prItems[sectionIndex];
              const sectionItems = section.items || [];

              // If a section has no items, throw error and stop
              if (sectionItems.length === 0) {
                this.notificationService.errorTopRight(`PDF section "${section.title || ''}" has no items. Please add a file.`);
                return;
              }

              for (let i = 0; i < sectionItems.length; i++) {
                const item = sectionItems[i];
                const panelUniqueId = item.uniqueId || `${container.id}-pr-item-${sectionIndex}-${i}`;

                await this.saveContainerContent(
                  {
                    id: container.id,
                    containerId: container.containerId,
                    uploadId: item.id || '00000000-0000-0000-0000-000000000000',
                    blobUrl: item.content || item.url,
                    content: item.content,
                    ImageFile: item.file || null,
                    isVideo: item.isVideo || false,
                    uniqueId: panelUniqueId,
                    bannerHeading: item.title || '',
                    bannerSubHeading: section.title,
                    newHeadings: item.fileName ? [{ text: item.fileName, x: 0, y: 0 }] : [],
                    fullBleed: '',
                    fitWidth: JSON.stringify({
                      xPercent: container.xPercent ?? 0,
                      yPercent: container.yPercent ?? 0,
                      widthPercent: container.widthPercent ?? 33,
                      heightPercent: container.heightPercent ?? 25,
                      zIndex: container.zIndex ?? 1,
                      style: container.style || {}
                    }),
                    opacity: item.opacity || '',
                    templateId: item.templateId || item.uploadId || '00000000-0000-0000-0000-000000000000',
                    autoPlay: item.autoPlay || false,
                    requireUserToWatch: item.requireUserToWatch || false,
                    position: i
                  },
                  this.selectedDraftItem.id,
                  'pdf'
                );
              }
            }
          }
        }
      }

      if (this.showChild) {
        await this.getContainers();
      } else {
        await this.getPublishedContainers();
      }

      this.exitEditing();
      this.hasUnsavedChanges = false;
      this.originalSections = JSON.stringify(this.sectionsArray);
      this.changeDetectorRef.detectChanges();
    } catch (error) {
      this.notificationService.errorTopRight('An error occurred while saving. Please try again.');
    }
  }
  
  private validateMediaFiles(): { isValid: boolean; message: string } {
    for (let sectionIndex = 0; sectionIndex < this.sectionsArray.length; sectionIndex++) {
      const section = this.sectionsArray[sectionIndex];

      for (let containerIndex = 0; containerIndex < section.items.length; containerIndex++) {
        const container = section.items[containerIndex];
        const containerLocation = `Section ${sectionIndex + 1}, Item ${containerIndex + 1}`;

        if (container.type === 'image') {
          const hasImageFiles = container.files && container.files.length > 0;
          const hasImageUrls = container.images && container.images.length > 0;
          if (!hasImageFiles && !hasImageUrls) {
            return {
              isValid: false,
              message: `Image container in ${containerLocation} requires an image file or URL.`
            };
          }
        } else if (container.type === 'video') {
        const hasVideoFile = container.file && container.file instanceof File;
        const hasValidVideoUrl = container.isYoutubeOrVimeo && container.videoUrl && !container.videoUrl.startsWith('blob:');
        const hasValidLocalVideo = container.localVideoUrl && (container.localVideoUrl.startsWith('blob:') || !container.isYoutubeOrVimeo);

        console.log(`Validating video container ${containerLocation}:`, {
          hasVideoFile,
          hasValidVideoUrl,
          hasValidLocalVideo,
          file: container.file,
          localVideoUrl: container.localVideoUrl,
          isYoutubeOrVimeo: container.isYoutubeOrVimeo,
          videoUrl: container.videoUrl
        }); // Debug log

        if (!hasVideoFile && !hasValidVideoUrl && !hasValidLocalVideo) {
          return {
            isValid: false,
            message: `Video container in ${containerLocation} requires a video file or valid URL.`
          };
        }
      }
        
        else if (container.type === 'audio') {
          const hasAudioFile = container.file && container.file instanceof File;
          const hasValidAudioUrl = container.audioUrl && !container.audioUrl.startsWith('blob:');
          const hasValidContent = container.content && !container.content.startsWith('blob:');
          const hasTempAudioUrl = container.tempAudioUrl && container.tempAudioUrl.startsWith('blob:');
          const hasBlobUrl = container.blobUrl && container.blobUrl.startsWith('blob:');
          const hasEmbedUrl = container.embedUrl;

          if (!hasAudioFile && !hasValidAudioUrl && !hasValidContent &&
            !hasTempAudioUrl && !hasBlobUrl && !hasEmbedUrl) {
            return {
              isValid: false,
              message: `Audio container in ${containerLocation} requires an audio file or URL.`
            };
          }
        }
      }
    }

    return { isValid: true, message: '' };
  }

  async saveContainerContent(content: Partial<PageElement>, menuId: string, type: string): Promise<void> {
    const formData = new FormData();

    const isNewRecord = content.modified || !content.isSavedToAPI ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(content.id || '');

    const idToUse = (type === 'video' || type === 'audio' || type === 'image' || type === 'pdf') && content.uploadId
      ? content.uploadId
      : (isNewRecord ? '00000000-0000-0000-0000-000000000000' : (content.id || '00000000-0000-0000-0000-000000000000'));

    formData.append('Id', idToUse);
    formData.append('MenuId', menuId);
    formData.append('ContainerId', content.containerId || this.getNanoTimestampWithRandomString());
    formData.append('UniqueId', content.uniqueId || `${content.id || 'element'}-${Date.now()}`);
    formData.append('Type', type);
    formData.append('PanelType', type === 'panel' ? 'panel' : type);
    formData.append('Status', 'draft');
    formData.append('isCopy', 'false');
    if (content.position !== undefined) {
    formData.append('Position', content.position.toString()); // Add position to formData
  }

    if (type === 'pdf' && content.ImageFile) {
      formData.append('file', content.ImageFile);
    }
    if (type === 'pdf') {
      formData.append('Content', content.content || '');
    }
   if (type === 'video') {
    const hasVideoFile = content.videoFile && content.videoFile instanceof File;
    if (hasVideoFile) {
      formData.append('file', content.videoFile);
    } else if (content.isYoutubeOrVimeo && content.videoUrl) {
      formData.append('Content', content.videoUrl);
    } else if (content.localVideoUrl && content.localVideoUrl.startsWith('blob:')) {
      try {
        const fileToUpload = await this.blobUrlToFile(content.localVideoUrl, `video-${Date.now()}.mp4`);
        if (fileToUpload) {
          formData.append('file', fileToUpload);
          console.log(`Converted blob URL to file for upload: ${content.localVideoUrl}`); // Debug log
        } else {
          this.notificationService.errorTopRight('Failed to convert video blob to file');
          throw new Error('Failed to convert blob URL to file');
        }
      } catch (error) {
        this.notificationService.errorTopRight('Failed to process video file');
        throw error;
      }
    } else if (content.localVideoUrl && !content.localVideoUrl.startsWith('blob:')) {
      formData.append('Content', content.localVideoUrl);
    } else {
      this.notificationService.errorTopRight('No valid video content provided');
      throw new Error('No valid video content provided');
    }
    formData.append('AutoPlay', String(content.autoPlay || false));
    formData.append('IsRequired', String(content.requireUserToWatch || false));
  }
    
    else if (type === 'audio') {
      formData.append('AutoPlay', String(content.autoPlay || false));
      formData.append('IsRequired', String(content.requireUserToWatch || false));
      formData.append('ShowControls', String(content.showControls || true));

      const hasAudioFile = content.audioFile && content.audioFile instanceof File;
      if (hasAudioFile) {
        formData.append('file', content.audioFile);
      } else if (content.tempAudioUrl && content.tempAudioUrl.startsWith('blob:')) {
        try {
          const fileToUpload = await this.blobUrlToFile(content.tempAudioUrl, `audio-${Date.now()}.mp3`);
          if (fileToUpload) {
            formData.append('file', fileToUpload);
          } else {
            throw new Error('Failed to convert tempAudioUrl to file');
          }
        } catch (error) {
          this.notificationService.errorTopRight('Failed to process audio file.');
          throw error;
        }
      } else if (content.audioUrl && !content.audioUrl.startsWith('blob:')) {
        formData.append('Content', content.audioUrl);
      } else if (content.embedUrl) {
        formData.append('Content', content.embedUrl);
      } else if (content.content && !content.content.startsWith('blob:')) {
        formData.append('Content', content.content);
      } else {
        this.notificationService.errorTopRight('No valid audio content provided.');
        throw new Error('No audio content provided');
      }
    } else if (type === 'image') {
      if (content.ImageFile && content.ImageFile instanceof File) {
        formData.append('file', content.ImageFile);
      } else if (content.content && !content.content.startsWith('blob:')) {
        formData.append('Content', content.content);
      } else {
        this.notificationService.errorTopRight('No valid image content provided.');
        throw new Error('No image content provided');
      }
      if (content.croppedWidth && content.croppedHeight) {
        formData.append('CroppedWidth', content.croppedWidth.toString());
        formData.append('CroppedHeight', content.croppedHeight.toString());
      }
    }

    formData.append('FullBleed', content.fullBleed || '');
    formData.append('FitWidth', content.fitWidth || '');
    formData.append('Opacity', content.opacity || '');
    formData.append('BannerHeading', content.bannerHeading || content.title || '');
    formData.append('BannerSubHeading', content.bannerSubHeading || content.subtitle || '');
    formData.append('newHeadings', JSON.stringify(content.newHeadings || []));

    if ((type === 'video' || type === 'audio') && !formData.has('file') && !formData.get('Content')) {
      this.notificationService.errorTopRight(`No ${type} content provided for upload.`);
      throw new Error(`No ${type} content provided`);
    }

    return new Promise((resolve, reject) => {
      this.manageWebsiteService.UploadCMSContainerFile(formData).subscribe({
        next: (resp) => {
          if (resp.isSuccess) {
            if (resp.data?.id) {
              content.id = resp.data.id;
              content.isSavedToAPI = true;
              content.modified = false;
            }

            if (resp.data?.url) {
              if (type === 'video') {
                if (content.localVideoUrl && content.localVideoUrl.startsWith('blob:')) {
                  URL.revokeObjectURL(content.localVideoUrl);
                }
                content.localVideoUrl = resp.data.url;
                content.isYoutubeOrVimeo = false;
                content.videoFile = null;
              } else if (type === 'audio') {
                if (content.tempAudioUrl && content.tempAudioUrl.startsWith('blob:')) {
                  URL.revokeObjectURL(content.tempAudioUrl);
                }
                if (content.audioUrl && content.audioUrl.startsWith('blob:')) {
                  URL.revokeObjectURL(content.audioUrl);
                }
                content.audioUrl = resp.data.url;
                content.tempAudioUrl = null;
                content.blobUrl = null;
                content.audioFile = null;
              } else if (type === 'image') {
                if (!content.images) content.images = [];
                content.images = [resp.data.url];
                content.files = [];
                content.file = null;
                content.fileName = null;
              }
            }

            resolve();
          } else {
            this.notificationService.errorTopRight(`Failed to save ${type} content.`);
            reject(new Error(`Upload failed for ${type}`));
          }
        },
        error: (err) => {
          this.notificationService.errorTopRight(`Error saving ${type} content: ${err.message}`);
          reject(err);
        }
      });
    });
  }

  async blobUrlToFile(blobUrl: string, fileName: string): Promise<File | null> {
    try {
      const response = await fetch(blobUrl);
      if (!response.ok) {
        this.notificationService.errorTopRight(`Failed to process video file: Invalid blob URL`);
        return null;
      }
      const blob = await response.blob();
      if (!blob || blob.size === 0) {
        this.notificationService.errorTopRight('Failed to process video file: Empty blob');
        return null;
      }
      const file = new File([blob], fileName, { type: blob.type || 'video/mp4' });
      return file;
    } catch (error) {
      this.notificationService.errorTopRight('Failed to process video file');
      return null;
    }
  }

isNonInteractiveWidget(type: string): boolean {
  const nonInteractiveTypes = [
    'Pie Chart',
    'Line Chart',
    'Bar Chart',
    'All',
    'Credit',
    'Redemptions',
    'Academy',
    'Messages',
    'TrainingMonth'
  ];
  return nonInteractiveTypes.includes(type);
}
  stopEditing(): void {
    this.isEditingSection = null;
    this.showGridBlocks = [];
    this.sectionContainer = { id: '', items: [] };
  }

  newContainer(type: string, sectionIndex: number, chartDataType?: string) {
  if (sectionIndex < 0 || sectionIndex >= this.sectionsArray.length) {
    return;
  }

  const sectionElement = document.querySelector(`.added-section-editing-area:nth-child(${sectionIndex + 1})`);
  if (!sectionElement) {
    return;
  }

  const usedWidthPercent = this.sectionsArray[sectionIndex].items.reduce((total, item) => {
    return total + (item.widthPercent || 0);
  }, 0);

  let widthPercent: number;
  let heightPercent: number;
  let gapPercent = window.innerWidth < 768 ? 0.4 : 0.6;

  switch (type) {
    case 'image':
      widthPercent = 30;
      heightPercent = 30;
      break;
    case 'video':
      widthPercent = this.MIN_VIDEO_WIDTH_PERCENT || 30;
      heightPercent = this.MIN_VIDEO_HEIGHT_PERCENT || 30;
      break;
    case 'button':
      widthPercent = 9.5;
      heightPercent = 6.5;
      break;
    case 'text':
      widthPercent = 30;
      heightPercent = 8;
      break;
    case 'audio':
      widthPercent = 30;
      heightPercent = 20;
      break;
    case 'greeting':
      widthPercent = 48;
      heightPercent = 7.5;
      break;
    case 'Pie Chart':
    case 'Line Chart':
    case 'Bar Chart':
      widthPercent = window.innerWidth < 768 ? 25 : 30;
      heightPercent = 60;
      break;
    case 'TrainingMonth':
      widthPercent = 50;
      heightPercent = 60;
      break;
    case 'All':
    case 'Credit':
    case 'Redemptions':
    case 'Messages':
    case 'Academy':
      widthPercent = 30;
      heightPercent = 60;
      break;
    case 'FAQ':
    case 'TOU':
      widthPercent = 90;
      heightPercent = 30;
      break;
    case 'CU':
    case 'PP':
    case 'NT':
    case 'FD':
    case 'AC':
    case 'TR':
    case 'pdf':
      widthPercent = 90;
      heightPercent = 70;
      break;
    default:
      widthPercent = 30;
      heightPercent = 20;
  }

  const totalItems = this.sectionsArray[sectionIndex].items.length + 1;
  const totalWidth = 100;
  const availableWidth = totalWidth;

  if (this.selectedContainerType === 'widgets' && (usedWidthPercent + widthPercent + (totalItems > 1 ? gapPercent : 0) > availableWidth)) {
    this.notificationService.errorTopRight('Size is not available to add container');
    return;
  }

  const sectionRect = sectionElement.getBoundingClientRect();
  const scrollContainer = this.scrollContainerItem?.nativeElement;
  const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0;
  const scrollLeft = scrollContainer ? scrollContainer.scrollLeft : 0;
  const TOP_MARGIN_PERCENT = 2;
  const BOTTOM_MARGIN_PERCENT = 1;
  const LEFT_MARGIN_PERCENT = 5;
  const VERTICAL_GAP_PERCENT = 2;

  let xPercent: number;
  let yPercent: number;

  if (this.selectedContainerType === 'widgets') {
    const items = this.sectionsArray[sectionIndex].items;
    if (items.length === 0) {
      xPercent = 0;
      yPercent = TOP_MARGIN_PERCENT;
    } else {
      const lastItem = items[items.length - 1];
      const nextX = (lastItem.xPercent || 0) + (lastItem.widthPercent || 0) + gapPercent;
      if (nextX + widthPercent <= 100) {
        xPercent = nextX;
        yPercent = lastItem.yPercent || TOP_MARGIN_PERCENT;
      } else {
        xPercent = 0;
        const maxYPercent = items.reduce((max, item) => {
          const itemBottom = (item.yPercent || 0) + (item.heightPercent || 0);
          return Math.max(max, itemBottom);
        }, 0);
        yPercent = maxYPercent + VERTICAL_GAP_PERCENT;
      }
    }
  }
  else {
    const items = this.sectionsArray[sectionIndex].items;
    if (items.length === 0) {
      xPercent = ((scrollLeft / sectionRect.width) * 100) + LEFT_MARGIN_PERCENT;
      yPercent = ((scrollTop / sectionRect.height) * 100) + TOP_MARGIN_PERCENT;
    } else {
      const lastItem = items[items.length - 1];
      const nextX = (lastItem.xPercent || 0) + (lastItem.widthPercent || 0) + LEFT_MARGIN_PERCENT;

      if (nextX + widthPercent <= 100) {
        xPercent = nextX;
        yPercent = lastItem.yPercent || TOP_MARGIN_PERCENT;
      } else {
        xPercent = ((scrollLeft / sectionRect.width) * 100) + LEFT_MARGIN_PERCENT;
        const maxYPercent = items.reduce((max, item) => {
          const itemBottom = (item.yPercent || 0) + (item.heightPercent || 0);
          return Math.max(max, itemBottom);
        }, 0);
        yPercent = maxYPercent + VERTICAL_GAP_PERCENT;
      }
    }

    xPercent = Math.max(LEFT_MARGIN_PERCENT, Math.min(xPercent, 100 - widthPercent - LEFT_MARGIN_PERCENT));
    yPercent = Math.max(TOP_MARGIN_PERCENT, Math.min(yPercent, 100 - heightPercent - BOTTOM_MARGIN_PERCENT));
  }

  let newZIndex = Math.min(this.getMaxZIndex(sectionIndex) + 1, 10);

  if (newZIndex >= 10) {
    this.normalizeZIndexes(sectionIndex);
    newZIndex = Math.min(this.getMaxZIndex(sectionIndex) + 1, 10);
  }

  /* ⭐ NEW — proper 2-heading setup for charts */
  let performanceHeading = '';
  let chartText = '';

  if (['Pie Chart', 'Line Chart', 'Bar Chart'].includes(type)) {
    performanceHeading = `
      <p style="font-size:14px; font-family: HelveticaNeueLight; margin:0;">
        Performance
      </p>
    `;

    switch (chartDataType) {
      case 'sales':
        chartText = `
          <h3 style="font-size:24px; font-family: HelveticaNeueBold; color:#02479c; margin:4px 0 0 0;">
            Total Sales
          </h3>
        `;
        break;
      case 'points':
        chartText = `
          <h3 style="font-size:24px; font-family: HelveticaNeueBold; color:#02479c; margin:4px 0 0 0;">
            Total Points
          </h3>
        `;
        break;
      default:
        chartText = `
          <h3 style="font-size:24px; font-family: HelveticaNeueBold; color:#02479c; margin:4px 0 0 0;">
            Total Quantity
          </h3>
        `;
    }
  }
  /* ⭐ NEW ends */

  const getGreetingText = () => {
    const hour = new Date().getHours();
    let greeting = 'Good Evening';

    if (hour < 12) {
      greeting = 'Good Morning';
    } else if (hour < 18) {
      greeting = 'Good Afternoon';
    }

    return `
      <h3 style="text-align:left;">
        <span 
          class="kl-editor-size-x-large"
          style="color:#02479c !important; font-family: HelveticaNeueBold; font-size:19px;">
          [Good Morning/Afternoon/Evening], [First Name]
        </span>
      </h3>
    `;
  };

  const newElement: PageElement = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    containerId: this.getNanoTimestampWithRandomString(),
    type,
    x: (xPercent / 100) * sectionRect.width,
    y: (yPercent / 100) * sectionRect.height,
    width: (widthPercent / 100) * sectionRect.width,
    height: (heightPercent / 100) * sectionRect.height,
    xPercent,
    yPercent,
    widthPercent,
    heightPercent,
    zIndex: newZIndex,
    style: this.getDefaultStyle(type),
    content: this.getDefaultContent(type),

    /* ⭐ replaced only where chart text & heading go — rest unchanged */
    text: chartText ||
      (type === 'text'
        ? `<h3 style="text-align:left;"><span class="kl-editor-size-x-large" style="color:#02479c !important; font-family: HelveticaNeuelight; font-size:19px;">Enter your text here</span></h3>`
        : type === 'greeting'
          ? getGreetingText()
          : type === 'FAQ'
            ? '<h3><span style="font-size:calc(1.5vw + 1.5vh);">FAQ</span></h3>\n'
            : type === 'TOU'
              ? '<h3><span style="font-size:calc(1.5vw + 1.5vh);">Terms of Use<span style="color:#02479c;">Your Terms of Use Details</span></span></h3>\n'
              : type === 'CU'
                ? '<h3><span style="font-size:calc(1.5vw + 1.5vh);">Contact Us<span style="color:#02479c;">Your Contact Us Details</span></span></h3>\n'
                : type === 'PP'
                  ? '<h3><span style="font-size:calc(1.5vw + 1.5vh);">Privacy Policy<span style="color:#02479c;">Privacy Policy Details</span></span></h3>\n'
                  : type === 'NT'
                    ? '<h3><span style="font-size:calc(1.5vw + 1.5vh);">Notifications</span></h3>\n'
                    : type === 'FD'
                      ? '<h3><span style="font-size:calc(1.5vw + 1.5vh);">Feedback</span></h3>\n'
                      : type === 'TR'
                        ? '<h3><span style="font-size:calc(1.5vw + 1.5vh);">Account Transactions</span></h3>\n'
                        : type === 'pdf'
                          ? '<h3><span style="font-size:calc(1.5vw + 1.5vh);">Program Rules</span></h3>\n'
                          : type === 'AC'
                            ? '<h3><span style="font-size:calc(1.5vw + 1.5vh);">Academy</span></h3>\n'
                            : ''),

    /* ⭐ existing logic kept — only value changed for chart widgets */
    chartHeading:
      performanceHeading ||
      (type === 'TrainingMonth'
        ? '<h2><span style="font-size:calc(1.75vw + 1.75vh);">Training of the Month</span></h2>\n'
        : ['Line Chart', 'Pie Chart', 'Bar Chart'].includes(type)
          ? '<p><span style="font-size:calc(0.75vw + 0.75vh);">Performance</span></p>\n'
          : type === 'Academy'
            ? '<h3><span style="font-size:calc(1.25vw + 1.25vh);">Academy Curriculums</span></h3>\n'
            : type === 'All'
              ? '<h3><span style="font-size:calc(1.25vw + 1.25vh);">All Transactions</span></h3>\n'
              : type === 'Credit'
                ? '<h3><span style="font-size:calc(1.25vw + 1.25vh);">Credit Details</span></h3>\n'
                : type === 'Redemptions'
                  ? '<h3><span style="font-size:calc(1.25vw + 1.25vh);">Redemption Details</span></h3>\n'
                  : type === 'Messages'
                    ? '<h3><span style="font-size:calc(1.25vw + 1.25vh);">You have Messages!</span></h3>\n'
                    : ''),

    iFrame: '<span>enter your iframe link here</span>',
    modified: true,
    isYoutubeOrVimeo: type === 'video' ? false : undefined,
    getAllCMSItemViews: type === 'panel' ? [] : undefined,
    chartDataType: ['Pie Chart', 'Line Chart', 'Bar Chart'].includes(type) ? (chartDataType || 'quantity') : undefined,
    selectedTimePeriod: type === 'Pie Chart' ? 'currentMonth' : 'currentYear',
    pieChartData: type === 'Pie Chart' ? this.pieChartDataSets['currentMonth'][chartDataType || 'quantity'] : undefined,
    lineChartData: type === 'Line Chart' ? this.lineChartDataSets['currentYear'][chartDataType || 'quantity'] : undefined,
    barChartData: type === 'Bar Chart' ? this.barChartDataSets['currentYear'][chartDataType || 'quantity'].data : undefined
  };

  this.currentSelectedNewElement = JSON.stringify(newElement);
  this.sectionsArray[sectionIndex].items.push(newElement);
  this.selectedElement = newElement;
  this.selectedItemIndex = this.sectionsArray[sectionIndex].items.length - 1;
  this.isEditingSection = sectionIndex;
  this.containerPopup = false;
  this.showGridBlocks[sectionIndex] = true;
  this.markElementsAsModified();
  this.changeDetectorRef.detectChanges();
  setTimeout(() => {
    this.showGridBlocks[sectionIndex] = false;
    this.changeDetectorRef.detectChanges();
  }, 2000);

  if (this.selectedContainerType === 'freeForm') {
    this.updateSectionHeightDynamic(sectionIndex);
  }

  if (
    this.selectedMenuId !== 'TOU' &&
    this.selectedMenuId !== 'FAQ' &&
    this.selectedMenuId !== 'CU' &&
    this.selectedMenuId !== 'PP' &&
    this.selectedMenuId !== 'NT' &&
    this.selectedMenuId !== 'FD' &&
    this.selectedMenuId !== 'AC' &&
    this.selectedMenuId !== 'TR' &&
    this.selectedMenuId !== 'PR'
  ) {
    // this.updateSectionHeightDynamic(sectionIndex);
  }
  this.storeState();
}




  normalizeZIndexes(sectionIndex: number) {
    const items = this.sectionsArray[sectionIndex].items;
    if (items.length === 0) return;

    // Sort items by zIndex in ascending order
    const sortedItems = [...items].sort((a, b) => a.zIndex - b.zIndex);

    // Redistribute zIndex values from 1 to 10
    const maxZIndex = 10;
    const minZIndex = 1;
    const step = items.length > 1 ? (maxZIndex - minZIndex) / (items.length - 1) : 0;

    sortedItems.forEach((item, index) => {
      // Assign new zIndex values proportionally
      item.zIndex = Math.round(minZIndex + index * step);
      // Ensure zIndex stays within bounds
      item.zIndex = Math.max(minZIndex, Math.min(maxZIndex, item.zIndex));
    });

    // Update the items array
    this.sectionsArray[sectionIndex].items = sortedItems;
  }

  selectElement(item: PageElement, event: MouseEvent, sectionIndex: number, itemIndex: number) {
    event.stopPropagation();
    const actualElement = this.sectionsArray[sectionIndex].items[itemIndex];
    this.selectedElement = actualElement;
    this.isEditingSection = sectionIndex;
    this.selectedItemIndex = itemIndex;
    this.lastSelectedElement = actualElement;
    if (this.selectedMenuId === 'HM') {
      this.showGridBlocks[sectionIndex] = true;
      
    }
    this.markElementsAsModified();
    this.changeDetectorRef.detectChanges();
  }
moveToFront(sectionIndex: number, itemIndex: number): void {
  const section = this.sectionsArray[sectionIndex];
  if (!section?.items[itemIndex]) return;

  // Get current max z-index
  const currentMax = Math.max(...section.items.map(item => item.zIndex || this.BASE_ZINDEX));
  
  // If already at front, no change needed
  if (section.items[itemIndex].zIndex === currentMax) return;

  // Set new z-index (current max + BASE_ZINDEX, but capped at MAX_ZINDEX)
  section.items[itemIndex].zIndex = Math.min(currentMax + this.BASE_ZINDEX, this.MAX_ZINDEX);
  
  // Normalize if we're approaching the limit
  if (currentMax > this.MAX_ZINDEX - this.NORMALIZE_THRESHOLD) {
    this.normalizeSectionZIndices(sectionIndex);
  }

  this.changeDetectorRef.detectChanges();
}

moveToBack(sectionIndex: number, itemIndex: number): void {
  const section = this.sectionsArray[sectionIndex];
  if (!section?.items[itemIndex]) return;

  // Get current min z-index
  const currentMin = Math.min(...section.items.map(item => item.zIndex || this.BASE_ZINDEX));
  
  // If already at back, no change needed
  if (section.items[itemIndex].zIndex === currentMin) return;

  // Set new z-index (current min - BASE_ZINDEX, but not below MIN_ZINDEX)
  section.items[itemIndex].zIndex = Math.max(currentMin - this.BASE_ZINDEX, this.MIN_ZINDEX);
  
  // Normalize if we're approaching the limit
  if (currentMin < this.MIN_ZINDEX + this.NORMALIZE_THRESHOLD) {
    this.normalizeSectionZIndices(sectionIndex);
  }

  this.changeDetectorRef.detectChanges();
}

// Add this helper method
private normalizeSectionZIndices(sectionIndex: number): void {
  const section = this.sectionsArray[sectionIndex];
  if (!section) return;

  // Sort items by current z-index (ascending)
  const sortedItems = [...section.items].sort((a, b) => (a.zIndex || this.BASE_ZINDEX) - (b.zIndex || this.BASE_ZINDEX));
  
  // Assign sequential z-indexes starting from BASE_ZINDEX
  sortedItems.forEach((item, index) => {
    item.zIndex = index + this.BASE_ZINDEX;
  });
}

// Update your getMaxZIndex method (if you have one) to this:

  onMouseDown(event: MouseEvent, sectionIndex: number, itemIndex: number) {
    event.preventDefault();
    event.stopPropagation();

    const item = this.sectionsArray[sectionIndex].items[itemIndex];
    if (!item) return;

    this.selectElement(item, event, sectionIndex, itemIndex);

    this.dragging = true;
    this.showGridBlocks[sectionIndex] = true;
    this.showCenterLine = true;
    this.selectedElement = item;
    this.isEditingSection = sectionIndex;

    const sectionElement = document.querySelectorAll('.added-section-editing-area')[sectionIndex];
    if (!sectionElement) return;
    const sectionRect = sectionElement.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const elementX = (item.xPercent / 100) * vw + sectionRect.left;
    const elementY = (item.yPercent / 100) * vh + sectionRect.top;

    this.offsetX = event.clientX - elementX;
    this.offsetY = event.clientY - elementY;

    this.startX = event.clientX;
    this.startY = event.clientY;

    setTimeout(() => {
      this.findAlignmentGuides(sectionIndex);
    }, 0);

    // if (this.selectedElement) {
    //   this.bringElementToFront(this.selectedElement, sectionIndex);
    // }

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

 // inside your component class
  onMouseMove = (event: MouseEvent) => {
    if (!this.dragging || !this.selectedElement || this.isEditingSection === null) return;

    const sectionIndex = this.isEditingSection;
    const itemIndex = this.sectionsArray[sectionIndex].items.findIndex(it => it.id === this.selectedElement.id);
    const sectionElement = document.querySelectorAll('.added-section-editing-area')[sectionIndex];
    if (!sectionElement || itemIndex === -1) return;

    const sectionRect = sectionElement.getBoundingClientRect();

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let relativeX = event.clientX - sectionRect.left - this.offsetX;
    let relativeY = event.clientY - sectionRect.top - this.offsetY;

    const itemWidthPx = (this.selectedElement.widthPercent / 100) * vw;
    relativeX = Math.max(0, Math.min(relativeX, sectionRect.width - itemWidthPx));

    // Calculate the canvas center in pixels
    const canvasCenterX = sectionRect.width / 2;
    const elementWidthPx = (this.selectedElement.widthPercent / 100) * vw;
    const elementCenterXPx = relativeX + (elementWidthPx / 2);

    // Define the snapping tolerance in pixels
    const snapTolerancePx = (2 / 100) * vw;

    const isCloseToCenter = Math.abs(elementCenterXPx - canvasCenterX) < snapTolerancePx;

    if (isCloseToCenter) {
      relativeX = canvasCenterX - (elementWidthPx / 2);
      this.selectedElement.isCenteredHorizontally = true;
    } else {
      this.selectedElement.isCenteredHorizontally = false;
    }

    const xPercent = (relativeX / vw) * 100;
    this.selectedElement.xPercent = xPercent;

    const padding = 20;
    const TOP_MARGIN_PERCENT = 2;
    const BOTTOM_MARGIN_PERCENT = 1;
    const topMarginPx = (TOP_MARGIN_PERCENT / 100) * vh;
    const bottomMarginPx = (BOTTOM_MARGIN_PERCENT / 100) * vh;

    relativeY = this.selectedContainerType === 'widgets'
      ? Math.max(topMarginPx, Math.min(relativeY, sectionRect.height - (this.selectedElement.heightPercent / 100) * vh - bottomMarginPx))
      : Math.max(0, relativeY);

    let yPercent = (relativeY / vh) * 100;
    this.selectedElement.yPercent = yPercent;

    requestAnimationFrame(() => {
      const dragElement = document.getElementById(`element-${this.selectedElement.id}`);
      if (dragElement) {
        dragElement.style.left = `${this.selectedElement.xPercent}vw`;
        dragElement.style.top = `${this.selectedElement.yPercent}vh`;
      }
    });

    this.findAlignmentGuides(sectionIndex);

    if (
      this.selectedMenuId !== 'TOU' &&
      this.selectedMenuId !== 'CU' &&
      this.selectedMenuId !== 'FAQ' &&
      this.selectedMenuId !== 'PP' &&
      this.selectedMenuId !== 'NT' &&
      this.selectedMenuId !== 'FD' &&
      this.selectedMenuId !== 'AC' &&
      this.selectedMenuId !== 'TR'
    ) {
      this.updateSectionHeightDynamic(sectionIndex);
    }
    this.markElementsAsModified();
    this.updateElementAlignmentHighlights(this.isEditingSection);
    this.changeDetectorRef.detectChanges();
  };

  onMouseUp = () => {
    if (!this.dragging || !this.selectedElement || this.isEditingSection === null) return;

    const sectionIndex = this.isEditingSection;
    const item = this.selectedElement;

    requestAnimationFrame(() => {
      const dragElement = document.getElementById(`element-${item.id}`);
      if (dragElement) {
        dragElement.style.left = `${item.xPercent}vw`;
        dragElement.style.top = `${item.yPercent}vh`;
      }
    });

    this.dragging = false;
    setTimeout(() => {
      this.showGridBlocks[sectionIndex] = false;
    }, 300);

    this.alignmentGuides[sectionIndex] = [];
    this.offsetX = 0;
    this.offsetY = 0;
    if (
      this.selectedMenuId !== 'TOU' &&
      this.selectedMenuId !== 'CU' &&
      this.selectedMenuId !== 'FAQ' &&
      this.selectedMenuId !== 'PP' &&
      this.selectedMenuId !== 'NT' &&
      this.selectedMenuId !== 'FD' &&
      this.selectedMenuId !== 'AC' &&
      this.selectedMenuId !== 'TR'
    ) {
      this.updateSectionHeightDynamic(sectionIndex);
    }
    this.markElementsAsModified();
    this.storeState();
    this.changeDetectorRef.detectChanges();
    this.highlightedElementIds.clear();

    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };

  updateElementAlignmentHighlights(sectionIndex: number) {
  if (!this.selectedElement) return;

  const section = this.sectionsArray[sectionIndex];
  if (!section) return;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const selectedRect = {
    x: (this.selectedElement.xPercent / 100) * vw,
    y: (this.selectedElement.yPercent / 100) * vh,
    w: (this.selectedElement.widthPercent / 100) * vw,
    h: (this.selectedElement.heightPercent / 100) * vh,
  };

  const selectedEdges = {
    left: selectedRect.x,
    right: selectedRect.x + selectedRect.w,
    top: selectedRect.y,
    bottom: selectedRect.y + selectedRect.h,
    centerX: selectedRect.x + selectedRect.w / 2,
    centerY: selectedRect.y + selectedRect.h / 2,
  };

  this.highlightedElementIds.clear();

  for (const other of section.items) {
    if (other.id === this.selectedElement.id) continue;

    const otherRect = {
      x: (other.xPercent / 100) * vw,
      y: (other.yPercent / 100) * vh,
      w: (other.widthPercent / 100) * vw,
      h: (other.heightPercent / 100) * vh,
    };

    const otherEdges = {
      left: otherRect.x,
      right: otherRect.x + otherRect.w,
      top: otherRect.y,
      bottom: otherRect.y + otherRect.h,
      centerX: otherRect.x + otherRect.w / 2,
      centerY: otherRect.y + otherRect.h / 2,
    };

    // Check alignment within tolerance
    const horizontallyAligned =
      Math.abs(selectedEdges.left - otherEdges.left) < this.alignmentTolerancePx ||
      Math.abs(selectedEdges.right - otherEdges.right) < this.alignmentTolerancePx ||
      Math.abs(selectedEdges.centerX - otherEdges.centerX) < this.alignmentTolerancePx;

    const verticallyAligned =
      Math.abs(selectedEdges.top - otherEdges.top) < this.alignmentTolerancePx ||
      Math.abs(selectedEdges.bottom - otherEdges.bottom) < this.alignmentTolerancePx ||
      Math.abs(selectedEdges.centerY - otherEdges.centerY) < this.alignmentTolerancePx;

    if (horizontallyAligned || verticallyAligned) {
      this.highlightedElementIds.add(other.id);
    }
  }

  this.cdr.detectChanges();
}



  editChartHeading(item, event) {
    item['showChartHeading'] = true;
    event.stopPropagation()
  }


  closeChartHeadingEdit(item, event) {
    item['showChartHeading'] = false;
    event.stopPropagation()
  }
  startChartHeadingEdit(item: PageElement, sectionIndex: number, itemIndex: number): void {

    this.disableDrag = true;

    this.selectElement(item, new MouseEvent('click'), sectionIndex, itemIndex);

    item['isEdit'] = true;
    item['showChartHeading'] = true;

    this.editElement(item, sectionIndex, itemIndex);

    this.changeDetectorRef.detectChanges();

  }

  stripHtmlTags(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html || '';
    return div.textContent || div.innerText || '';
  } 

  saveChartHeading(item: any) {

  const validTypes = [
    'PP', 'FAQ', 'TOU', 'CU', 'AC', 'TR', 'PR', 'FD', 'NT',
    'Pie Chart', 'Line Chart', 'Bar Chart', 'TrainingMonth', 'pdf'
  ];

  if (!validTypes.includes(item.type)) return;

  /* =====================================
     1. SAVE HEADING (chartHeading editor)
     ===================================== */
  if (item['showChartHeading']) {

  let chartHeadingEditorEl = document.querySelector(
      `#element-${item.id}-chartheading .angular-editor-textarea[contenteditable="true"]`
    ) as HTMLElement | null;
    if (!chartHeadingEditorEl) {
      chartHeadingEditorEl = document.querySelector(
        `#element-${item.id} .angular-editor-textarea[contenteditable="true"]`
      ) as HTMLElement | null;
    }
    const html = (chartHeadingEditorEl?.innerHTML ?? item.chartHeading ?? '').trim();
    const plain = this.stripHtmlTags(html).trim();

    if (!plain) {
      this.notificationService.errorTopRight('Heading cannot be empty.');
      return;
    }

    item.chartHeading = this.cleanEditorHtml(html);
    item['showChartHeading'] = false;
  }

  /* =====================================
     2. SAVE TEXT BODY (text editor)
     ===================================== */
  if (item['showTextHeading']) {

   let textEditorEl = document.querySelector(
      `#element-${item.id}-text .angular-editor-textarea[contenteditable="true"]`
    ) as HTMLElement | null;
    if (!textEditorEl) {
      textEditorEl = document.querySelector(
        `#element-${item.id} .angular-editor-textarea[contenteditable="true"]`
      ) as HTMLElement | null;
    }
    const html = (textEditorEl?.innerHTML ?? item.text ?? '').trim();
    const plain = this.stripHtmlTags(html).trim();

    if (!plain) {
      this.notificationService.errorTopRight('Text content cannot be empty.');
      return;
    }

    item.text = this.cleanEditorHtml(html);
    item['showTextHeading'] = false;
  }

  /* =====================================
     3. SAVE IFRAME URL (PP only)
     ===================================== */
  if (item.type === 'PP' && item['showIFrame'] && !item.isVideo) {

    const url = (item.text || '').trim();

    if (!url) {
      this.notificationService.errorTopRight('iFrame URL cannot be empty.');
      return;
    }

    if (!/^https?:\/\/.+/i.test(url)) {
      this.notificationService.errorTopRight('URL must start with http:// or https://');
      return;
    }

    if (
      url.includes('youtube.com') ||
      url.includes('youtu.be') ||
      /\.(doc|docx|xls|xlsx|ppt|pptx|pdf)$/i.test(url)
    ) {
      this.notificationService.errorTopRight(
        'YouTube links and document files are not allowed in iframe.'
      );
      return;
    }

    item['showIFrame'] = false;
  }

  /* =====================================
     4. FINALIZE SAVE
     ===================================== */
  item.modified = true;
  this.markElementsAsModified();

  this.disableDrag = false;
  this.editorTempText = '';

  setTimeout(() => this.updateSectionHeights(), 150);

  this.changeDetectorRef.detectChanges();
  this.notificationService.successTopRight('Content saved successfully.');
}


    
    
  editSalesHeading(item) {
    this.salesHeading = item;
    console.log('salesHEading', this.salesHeading)
  }
  onCancelSalesHeading(sectionIndex: number, itemIndex: number, item: any) {
    this.sectionsArray[sectionIndex].items[itemIndex].salesHeading = this.salesHeading || '';
    console.log(this.sectionsArray[sectionIndex].items[itemIndex].salesHeading, this.salesHeading)
    this.sectionsArray[sectionIndex].items[itemIndex]['showSalesHeading'] = false;
    this.disableDrag = false;
    this.markElementsAsModified();
  }

saveSalesHeading(item: any) {

  const validTypes = [
    'Pie Chart','Line Chart','Bar Chart','All','Credit','Redemptions',
    'Messages','Academy','TrainingMonth','FAQ','TOU',
    'PP','CU','NT','FD','AC','TR','PR'
  ];
  if (!validTypes.includes(item.type)) return;

  if (item['showSalesHeading']) {

    // Read directly from DOM to capture all inline styles from font/color pickers
    // Try both selector patterns: with suffix and without suffix
    let salesHeadingEditorEl = document.querySelector(
      `#element-${item.id}-salesheading .angular-editor-textarea[contenteditable="true"]`
    ) as HTMLElement | null;
    if (!salesHeadingEditorEl) {
      salesHeadingEditorEl = document.querySelector(
        `#element-${item.id} .angular-editor-textarea[contenteditable="true"]`
      ) as HTMLElement | null;
    }
    const salesHtml = (salesHeadingEditorEl?.innerHTML ?? item.salesHeading ?? '').trim();
    const plainText = this.stripHtmlTags(salesHtml);

    if (!plainText) {
      this.notificationService.errorTopRight('Text content cannot be empty.');
      return;
    }

    item.salesHeading = this.cleanEditorHtml(salesHtml); // keep styles
    item['showSalesHeading'] = false;
  }

  item.modified = true;
  this.markElementsAsModified();
  this.changeDetectorRef.detectChanges();
  this.notificationService.successTopRight('Text saved successfully.');
}


  private readonly VIEWPORT_SCALE = {
    width: 0.8,   
    height: 0.7,
    leftOffset: 10, 
    topOffset: 5  
  };

  getElementOptionsPosition(item: PageElement): { [key: string]: string } {
    const top = item.yPercent < 10 ? (item.yPercent + item.heightPercent + 2) : (item.yPercent - 10);
    return {
      top: `${top}%`,
      left: `${item.xPercent + item.widthPercent}%`
    };
  }

// Bring element to front

// Delete element
deleteElements(sectionIndex: number, itemIndex: number): void {
  const section = this.sectionsArray[sectionIndex];
  if (!section || !section.items[itemIndex]) return;

  section.items.splice(itemIndex, 1);
  this.selectedElement = null;
  this.selectedItem = null;
  this.selectedSectionIndex = null;
  this.selectedItemIndex = null;

  // Reflow widgets to remove gaps after deletion
  if (this.selectedContainerType === 'widgets' || section.type === 'widgets') {
    this.reflowSection(sectionIndex);
  }

  if(this.selectedMenuId !== 'TOU' && this.selectedMenuId !== 'CU' && this.selectedMenuId !== 'PP' && this.selectedMenuId !== 'FAQ' && this.selectedMenuId !== 'NT' && this.selectedMenuId !== 'FD' && this.selectedMenuId !== 'AC' && this.selectedMenuId !== 'TR' && this.selectedMenuId !== 'PR') {
    this.updateSectionHeightDynamic(sectionIndex);
  }
  this.changeDetectorRef.detectChanges();
}
 markElementsAsModified() {
  this.hasUnsavedChanges = JSON.stringify(this.sectionsArray) !== this.originalSections;
  this.sectionsArray.forEach((section) => {
    section.items.forEach((item) => {
      if (['Pie Chart', 'Line Chart', 'Bar Chart'].includes(item.type)) {
        // item.text = item.chartHeading; // Sync chartHeading to text
      }
    });
  });
}

  trackChanges() {
    this.sectionsArray.forEach(section => {
      section.items.forEach(item => (item.modified = true));
    });
    this.hasUnsavedChanges = true;
  }

  checkForUnsavedChanges(): boolean {
    console.log('hasunsaved',this.hasUnsavedChanges)
    return this.hasUnsavedChanges;
  }

isValidKohlerQuizUrl(url: string): boolean {
  const quizRegex = /\/kohler-studio-course-quiz\/[a-f0-9-]{36}\?courseStatus=Active(&selectedLanguage=[a-zA-Z]+)?$/i;
  const courseRegex = /\/kohler-studio-course\/[a-f0-9-]{36}\/[a-f0-9-]{36}\/[a-zA-Z]+(\?courseStatus=Active(&selectedLanguage=[a-zA-Z]+)?)?$/i;

  return quizRegex.test(url) || courseRegex.test(url);
}


editElement(item: PageElement, sectionIndex: number, itemIndex: number) {
  console.log('item', item);
  this.selectedElement = item;
  this.selectedItemIndex = itemIndex;
  this.isEditingSection = sectionIndex;
  this.selectedElement = this.sectionsArray[sectionIndex].items[itemIndex];

  // Determine greeting based on system time for default value
  const getGreetingText = () => {
    const hour = new Date().getHours();
    let greeting = 'Good Evening';
  
    if (hour < 12) {
      greeting = 'Good Morning';
    } else if (hour < 18) {
      greeting = 'Good Afternoon';
    }
  
    return `
      <h3 style="text-align:left;">
        <span 
          class="kl-editor-size-x-large"
          style="color:#02479c !important; font-family: HelveticaNeuelight; font-size:19px;">
          [Good Morning/Afternoon/Evening], [First Name]
        </span>
      </h3>
    `;
  };  
  

  switch (item.type) {
    case 'text':
    case 'greeting':
      this.editorControl.setValue(item.text || getGreetingText());
      setTimeout(() => {
        this.showCKEditor = true;
      }, 100);
      break;

    case 'image':
      if (item.images && item.images.length > 0) {
        this.imageUrl = item.images[0];
      } else {
        this.imageUrl = null;
      }
      this.selectedFileName = item.fileName || null;
      this.hyperlinkUrl = item.text || null;
      this.showImageDialog = true;
      break;

    case 'video':
      this.videoUrl = item.videoUrl || item.content || '';
      this.localVideoUrl = item.localVideoUrl || item.blobUrl || null;
      this.isYoutubeOrVimeo = this.isExternalVideo(this.videoUrl);
      this.sanitizedVideoUrl = this.isYoutubeOrVimeo ? this.sanitizer.bypassSecurityTrustResourceUrl(this.convertToEmbedUrl(this.videoUrl)) : null;
      this.videoAutoPlay = item.autoPlay || false;
      if (item.getAllCMSItemViews && item.getAllCMSItemViews.length > 0) {
        const firstItem = item.getAllCMSItemViews[0];
        this.videoAutoPlay = firstItem.autoPlay || this.videoAutoPlay;
        this.videoMuteByDefault = firstItem.requireUserToWatch || false;
        this.videoLoop = false;
        try {
          if (firstItem.bannerHeading) {
            const bannerHeadingData = typeof firstItem.bannerHeading === 'string' ? JSON.parse(firstItem.bannerHeading) : firstItem.bannerHeading;
            this.videoLoop = bannerHeadingData.loop || false;
          }
        } catch (error) {
          this.videoLoop = false;
        }
      } else {
        this.videoMuteByDefault = item.requireUserToWatch || false;
        this.videoLoop = false;
        try {
          if (item.bannerHeading) {
            const bannerHeadingData = typeof item.bannerHeading === 'string' ? JSON.parse(item.bannerHeading) : item.bannerHeading;
            this.videoLoop = bannerHeadingData.loop || false;
          }
        } catch (error) {
          this.videoLoop = false;
        }
      }
      this.selectedFileName = item.fileName || (item.file ? item.file.name : null);
      this.showVideoDialog = true;
      break;

    case 'audio':
      this.audioTitle = item.title || '';
      this.audioSubtitle = item.subtitle || '';
      this.showControls = item.showControls !== false;
      this.requireUserToWatch = item.requireUserToWatch || false;
      this.autoPlay = item.autoPlay || false;
      this.selectedFileName = item.fileName || (item.file ? item.file.name : null);
      if (item.getAllCMSItemViews && item.getAllCMSItemViews.length > 0) {
        const firstItem = item.getAllCMSItemViews[0];
        this.audioTitle = firstItem.bannerHeading || this.audioTitle;
        this.audioSubtitle = firstItem.bannerSubHeading || this.audioSubtitle;
        this.autoPlay = firstItem.autoPlay ?? this.autoPlay;
      }
      if (item.embedUrl || (item.audioUrl && !item.audioUrl.startsWith('blob:'))) {
        this.audioSourceType = 'embed';
        this.audioEmbedUrl = item.embedUrl || item.audioUrl || item.content || '';
      } else {
        this.audioSourceType = 'upload';
        this.audioEmbedUrl = '';
        if (item.file && item.file instanceof File) {
          if (!item.tempContent || !item.tempContent.startsWith('blob:')) {
            item.tempContent = URL.createObjectURL(item.file);
            item.blobUrl = item.tempContent;
          }
        } else if (item.audioUrl && !item.audioUrl.startsWith('blob:')) {
          item.tempContent = item.audioUrl;
        } else if (item.content && !item.content.startsWith('blob:')) {
          item.tempContent = item.content;
        } else if (item.getAllCMSItemViews && item.getAllCMSItemViews.length > 0) {
          const firstItem = item.getAllCMSItemViews[0];
          item.tempContent = firstItem.url || firstItem.content || '';
        }
      }
      this.showAudioDialog = true;
      break;

    case 'button':
      let existingButtonStyle: any = {};
      if (item.salesHeading) {
        try {
          existingButtonStyle = typeof item.salesHeading === 'string' ? JSON.parse(item.salesHeading) : item.salesHeading;
        } catch (e) {
          existingButtonStyle = {};
        }
      }
      this.buttonText = item.content || item.text || 'Click me';
      this.buttonHyperlink = item.chartHeading || '';
      this.buttonColor = existingButtonStyle.backgroundColor || '#007bff';
      this.buttonTextColor = existingButtonStyle.color || '#ffffff';
      this.buttonBold = existingButtonStyle.fontWeight === 'bold' || false;
      this.buttonItalic = existingButtonStyle.fontStyle === 'italic' || false;
      this.buttonUnderline = existingButtonStyle.textDecoration === 'underline' || false;
      this.showButtonDialog = true;
      break;

    case 'TrainingMonth':
      if (!item['isEdit']) {
        item['isEdit'] = true;
        return;
      }
      if (item.text && item.text.trim() !== '') {
        if (this.isValidKohlerQuizUrl(item.text)) {
          item['isEdit'] = false;
        } else {
          this.notificationService.errorTopRight('Please enter a valid course url.');
        }
      } else {
        item['isEdit'] = false;
      }
      break;

    case 'Pie Chart':
    case 'Line Chart':
    case 'Bar Chart':
    case 'All':
    case 'Credit':
    case 'Redemptions':
    case 'Messages':
    case 'Academy':
    case 'FAQ':
    case 'TOU':
    case 'NT':
    case 'FD':
    case 'CU':
    case 'PP':
    case 'AC':
    case 'TR':
    case 'pdf':
      if (!item['isEdit'] && (item.type === 'TOU' || item.type === 'NT' || item.type === 'FD' || item.type === 'CU' || item.type === 'PP' || item.type === 'AC' || item.type === 'TR' || item.type === 'pdf' || item.type === 'FAQ')) {
        item['showTextHeading'] = false;
        item['showChartHeading'] = false;
      }
      item['isEdit'] = !item['isEdit'];
      console.log('item', item['isEdit']);
      this.sectionsArray[sectionIndex].items.forEach((otherItem, i) => {
        if (
          (otherItem.type === 'Pie Chart' || otherItem.type === 'Line Chart' || otherItem.type === 'Bar Chart' ||
          otherItem.type === 'All' || otherItem.type === 'Credit' || otherItem.type === 'Redemptions' ||
          otherItem.type === 'Messages' || otherItem.type === 'Academy' || otherItem.type === 'TrainingMonth' || 
          otherItem.type === 'FAQ' || otherItem.type === 'TOU' || otherItem.type === 'CU' || otherItem.type === 'PP' || 
          otherItem.type === 'NT' || otherItem.type === 'FD' || otherItem.type === 'AC' || otherItem.type === 'TR' || 
          otherItem.type === 'pdf') &&
          i !== itemIndex
        ) {
          otherItem['isEdit'] = false;
        }
      });
      break;
  }
  this.changeDetectorRef.detectChanges();
}
  isSectionSelected(section: any): boolean {
    return section.items.some(item => item.blobUrl === this.selectedItemUrl);
  }
  getCurrentImageUrl(element: any): string | null {
    
    if (element && element.getAllCMSItemViews && element.getAllCMSItemViews.length > 0) {
      const url = element.getAllCMSItemViews[0].url || null;
      return url;
    }
    
    return null;
  }

  async onVideoUrlInput() {
    this.sanitizedVideoUrl = null;
    this.isYoutubeOrVimeo = false;

    if (!this.videoUrl || this.videoUrl.trim() === '') {
      return;
    }


    if (this.videoUrl.includes('youtube.com') || this.videoUrl.includes('youtu.be')) {
      this.isYoutubeOrVimeo = true;
      this.localVideoUrl = null;
      if (this.videoUrl.includes('youtube.com/shorts/')) {
        const shortsId = this.videoUrl.split('youtube.com/shorts/')[1].split(/[?#]/)[0];
        if (shortsId) {
          const embedUrl = `https://www.youtube.com/embed/${shortsId}`;
          this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
        } else {
        }
      } else {
        const videoId = this.extractYouTubeVideoId(this.videoUrl);
        if (videoId) {
          const embedUrl = `https://www.youtube.com/embed/${videoId}`;
          this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
        } else {
        }
      }
    }
    else if (this.videoUrl.includes('vimeo.com')) {
      this.isYoutubeOrVimeo = true;

      try {
        const oEmbedData = await this.getVimeoOEmbedData(this.videoUrl);

        if (oEmbedData && oEmbedData.html) {
          const embedUrl = this.extractIframeUrl(oEmbedData.html);
          if (embedUrl) {
            this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
          } else {
          }
        } else {
        }
      } catch (error) {

        const videoId = this.extractVimeoVideoId(this.videoUrl);
        if (videoId) {
          const embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=0&title=0&byline=0&portrait=0`;
          this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
        } else {
        }
      }
    }
  }

  extractVimeoVideoId(url: string): string {

    if (!url) return null;

    try {
      const privateShareRegex = /vimeo\.com\/(\d+)\/([a-zA-Z0-9]+)/;
      const privateShareMatch = url.match(privateShareRegex);
      if (privateShareMatch) {
        return privateShareMatch[1];
      }

      const standardRegex = /vimeo\.com\/(\d+)/;
      const standardMatch = url.match(standardRegex);
      if (standardMatch) {
        return standardMatch[1];
      }

      const playerRegex = /player\.vimeo\.com\/video\/(\d+)/;
      const playerMatch = url.match(playerRegex);
      if (playerMatch) {
        return playerMatch[1];
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  getVimeoOEmbedData(vimeoUrl: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const encodedUrl = encodeURIComponent(vimeoUrl);
      const oEmbedUrl = `https://vimeo.com/api/oembed.json?url=${encodedUrl}&width=640`;
      fetch(oEmbedUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          resolve(data);
        })
        .catch(error => {
          this.notificationService.errorTopRight('Failed to fetch Vimeo video data. Please ensure the video is public.');
          reject(error);
        });
    });
  }
  extractIframeUrl(html: string): string {
    if (!html) return '';

    try {
      // Create a temporary DOM element to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      // Find the iframe element
      const iframe = tempDiv.querySelector('iframe');
      if (!iframe) return '';

      // Get the src attribute
      const src = iframe.getAttribute('src');
      if (!src) return '';

      // Add additional parameters for better compatibility
      const url = new URL(src);
      url.searchParams.set('autoplay', '0');
      url.searchParams.set('title', '0');
      url.searchParams.set('byline', '0');
      url.searchParams.set('portrait', '0');

      return url.toString();
    } catch (error) {
      return '';
    }
  }

  extractYouTubeVideoId(url: string): string {
    if (!url) return '';

    if (url.includes('youtube.com/watch')) {
      try {
        const urlObj = new URL(url);
        return urlObj.searchParams.get('v') || '';
      } catch (e) {
        const match = url.match(/[?&]v=([^&#]*)/);
        return match && match[1] ? match[1] : '';
      }
    } else if (url.includes('youtu.be')) {
      const parts = url.split('/');
      return parts[parts.length - 1].split('?')[0] || '';
    }

    return '';
  }

  clearVideo() {
    this.videoUrl = '';
    this.localVideoUrl = null;
    this.sanitizedVideoUrl = null;
    this.isYoutubeOrVimeo = false;
    this.selectedFileName = null; // Clear file name
  }
  cancelVideoDialog(): void {
    this.showVideoDialog = false;
    this.videoUrl = '';
    this.sanitizedVideoUrl = null;
    this.isYoutubeOrVimeo = false;
    this.selectedFileName = null;
    this.videoAutoPlay = false;
    this.videoMuteByDefault = false;
    this.videoLoop = false;

    if (this.localVideoUrl && this.localVideoUrl.startsWith('blob:') && !this.selectedElement?.isSavedToAPI) {
      if (!this.sectionsArray.some(section => section.items.some(item => item.blobUrl === this.localVideoUrl || item.localVideoUrl === this.localVideoUrl))) {
        URL.revokeObjectURL(this.localVideoUrl);
        this.localVideoUrl = null;
      }
    }
    if (this.selectedElement) {
      this.selectedElement.file = null;
      this.selectedElement.blobUrl = '';
    }
    this.changeDetectorRef.detectChanges();
  }
  onVideoUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['video/mp4', 'video/mpeg', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
      if (!validTypes.includes(file.type)) {
        this.notificationService.errorTopRight('Invalid video format. Please use MP4, MPEG, WebM, OGG, MOV, or AVI.');
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        this.notificationService.errorTopRight('Video file size must be less than 100 MB.');
        return;
      }
      if (this.localVideoUrl && this.localVideoUrl.startsWith('blob:') && this.selectedElement?.blobUrl !== this.localVideoUrl) {
        URL.revokeObjectURL(this.localVideoUrl);
      }
      this.localVideoUrl = URL.createObjectURL(file);
      this.selectedFileName = file.name;
      if (!this.selectedElement) {
        this.selectedElement = {
          id: `temp-${Date.now()}`,
          containerId: this.isEditingSection !== null ? `section-${this.isEditingSection}` : '',
          type: 'video',
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          xPercent: 0,
          yPercent: 0,
          widthPercent: 10,
          heightPercent: 10,
          zIndex: 1,
          style: { textAlign: 'left' },
          content: '',
          file: file, // Ensure file is set
          blobUrl: this.localVideoUrl,
          isYoutubeOrVimeo: false,
          iFrame: ''
        };
      } else {
        if (this.selectedElement.blobUrl && this.selectedElement.blobUrl.startsWith('blob:') && this.selectedElement.blobUrl !== this.localVideoUrl) {
          URL.revokeObjectURL(this.selectedElement.blobUrl);
        }
        if (this.selectedElement.id) {
          this.blobUrls.delete(this.selectedElement.id);
        }
        this.selectedElement.file = file; // Ensure file is updated
        this.selectedElement.blobUrl = this.localVideoUrl;
        this.selectedElement.isYoutubeOrVimeo = false;
      }
      this.isYoutubeOrVimeo = false;
      this.sanitizedVideoUrl = null;
      this.videoUrl = '';
      this.blobUrls.set(this.selectedElement.id, this.localVideoUrl); // Track blob URL
      console.log('Video uploaded:', {
        file: this.selectedElement.file,
        localVideoUrl: this.localVideoUrl,
        blobUrl: this.selectedElement.blobUrl
      }); // Debug log
    }
    event.target.value = '';
    this.changeDetectorRef.detectChanges();
  }

  onVideoLoadStart(item: any): void {
  }

  onVideoError(event: any, item: PageElement): void {

    this.notificationService.errorTopRight('Failed to load video. Please ensure the file is valid or re-upload it.');
  }


  saveVideoContent(sectionIndex: number, itemIndex: number): void {
    const item = this.sectionsArray[sectionIndex]?.items[itemIndex];
    if (!item) {
      this.notificationService.errorTopRight('Failed to save video: Invalid item.');
      return;
    }

    const itemKey = `${item.id || sectionIndex + '-' + itemIndex}`;

    // Revoke old blob URL if it exists and is being replaced
    if (this.blobUrls.has(itemKey) && this.blobUrls.get(itemKey) !== this.localVideoUrl) {
      URL.revokeObjectURL(this.blobUrls.get(itemKey));
      this.blobUrls.delete(itemKey);
    }

    // Handle YouTube/Vimeo videos
    if (this.isYoutubeOrVimeo && this.videoUrl && this.sanitizedVideoUrl) {
      item.isYoutubeOrVimeo = true;
      item.videoUrl = this.videoUrl;
      item.sanitizedVideoUrl = this.sanitizedVideoUrl;
      item.localVideoUrl = null;
      item.tempVideoUrl = null;
      item.file = null;
      item.blobUrl = null;
    }
    // Handle newly uploaded local videos
    else if (this.localVideoUrl && this.selectedElement?.file) {
      item.isYoutubeOrVimeo = false;
      item.videoUrl = '';
      item.sanitizedVideoUrl = null;
      item.localVideoUrl = this.localVideoUrl;
      item.tempVideoUrl = this.localVideoUrl;
      item.file = this.selectedElement.file;
      item.blobUrl = this.localVideoUrl;
      this.blobUrls.set(itemKey, this.localVideoUrl);
      item.fileName = this.selectedFileName;
    }
    else if (item.localVideoUrl || item.videoUrl || (item.getAllCMSItemViews && item.getAllCMSItemViews.length > 0)) {
    }
    else {
      this.notificationService.errorTopRight('No video file or URL provided.');
      return;
    }

    // Save video settings
    item.autoPlay = this.videoAutoPlay;
    item.requireUserToWatch = this.videoMuteByDefault;

    // Save loop setting in bannerHeading
    try {
      let bannerHeadingData: any = {};
      if (item.bannerHeading) {
        try {
          bannerHeadingData = typeof item.bannerHeading === 'string' ? JSON.parse(item.bannerHeading) : item.bannerHeading;
        } catch (parseError) {
          bannerHeadingData = { text: item.bannerHeading };
        }
      }
      bannerHeadingData.loop = this.videoLoop;
      item.bannerHeading = JSON.stringify(bannerHeadingData);
    } catch (error) {
    }

    if (item.getAllCMSItemViews && item.getAllCMSItemViews.length > 0) {
      const firstItem = item.getAllCMSItemViews[0];
      firstItem.autoPlay = this.videoAutoPlay;
      firstItem.requireUserToWatch = this.videoMuteByDefault;
      firstItem.bannerHeading = item.bannerHeading;
    }

    item.modified = true;
    item.isSavedToAPI = false;
    this.cancelVideoDialog();
    this.changeDetectorRef.detectChanges();
  }
private isSaving = false;

shouldDisableVideoInteraction(sectionIndex: number, item: any): boolean {
  return this.isSaving || 
         (this.editingSection && this.isEditingSection === sectionIndex) ||
         this.hasUnsavedVideoChanges(item);
}
hasUnsavedVideoChanges(item: any): boolean {
  if (item.type !== 'video') return false;
  
  // Check if there are unsaved blob URLs
  if (item.tempVideoUrl && item.tempVideoUrl.startsWith('blob:')) return true;
  if (item.localVideoUrl && item.localVideoUrl.startsWith('blob:')) return true;
  
  // Check if there's a file waiting to be saved
  if (item.file && item.file instanceof File) return true;
  
  return false;
}

  getVideoLoop(item: any): boolean {
    try {
      let bannerHeadingData: any = {};
      if (item.getAllCMSItemViews && item.getAllCMSItemViews.length > 0 && item.getAllCMSItemViews[0].bannerHeading) {
        bannerHeadingData = typeof item.getAllCMSItemViews[0].bannerHeading === 'string' 
          ? JSON.parse(item.getAllCMSItemViews[0].bannerHeading) 
          : item.getAllCMSItemViews[0].bannerHeading;
      } else if (item.bannerHeading) {
        bannerHeadingData = typeof item.bannerHeading === 'string' ? JSON.parse(item.bannerHeading) : item.bannerHeading;
      }
      return bannerHeadingData.loop ?? false;
    } catch (error) {
      return false;
    }
  }
 getVideoMuteByDefault(item: any): boolean {
    if (item.getAllCMSItemViews && item.getAllCMSItemViews.length > 0) {
      return item.getAllCMSItemViews[0].requireUserToWatch ?? item.requireUserToWatch ?? false;
    }
    return item.requireUserToWatch ?? false;
  }

  getVideoAutoPlay(item: any): boolean {
    if (item.getAllCMSItemViews && item.getAllCMSItemViews.length > 0) {
      return item.getAllCMSItemViews[0].autoPlay ?? item.autoPlay ?? false;
    }
    return item.autoPlay ?? false;
  }

getVideoUrl(item: PageElement): string {
  const url = item.localVideoUrl || item.blobUrl || item.tempVideoUrl || '';
  if (url && url.startsWith('blob:')) {
  }
  if (url && !item.isYoutubeOrVimeo) {
    return url;
  }
  return '';
}
isYoutubeOrVimeoUrl(url: string): boolean {
  if (!url) return false;
  
  const isYoutube = url.includes('youtube.com/watch') || 
                   url.includes('youtu.be/') || 
                   url.includes('youtube.com/shorts/') ||
                   url.includes('youtube.com/embed/');
                   
  const isVimeo = url.includes('vimeo.com/') ||
                 url.includes('player.vimeo.com/');
  
  return isYoutube || isVimeo;
}


onAudioUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 25 * 1024 * 1024;
      if (file.size > maxSize) {
        this.notificationService.errorTopRight('Audio file size should not exceed 25MB');
        event.target.value = '';
        return;
      }

      if (this.validateAudioFile(file)) {
        if (this.selectedElement?.blobUrl && this.selectedElement.blobUrl.startsWith('blob:')) {
          URL.revokeObjectURL(this.selectedElement.blobUrl);
        }

        this.selectedElement.file = file;
        this.selectedElement.tempContent = URL.createObjectURL(file);
        this.selectedElement.blobUrl = this.selectedElement.tempContent;
        this.selectedElement.audioUrl = null;
        this.selectedElement.embedUrl = null;
        this.selectedElement.modified = true;
        this.selectedFileName = file.name;
        this.selectedElement.title = this.audioTitle;
        this.selectedElement.subtitle = this.audioSubtitle;
        this.selectedElement.showControls = this.showControls;
        this.selectedElement.requireUserToWatch = this.requireUserToWatch;
        this.selectedElement.autoPlay = this.autoPlay;
      } else {
        this.notificationService.errorTopRight('Invalid audio file. Supported formats: MP3, WAV, OGG, M4A, AAC, FLAC.');
      }
    }

    event.target.value = '';
    this.changeDetectorRef.detectChanges();
  }


 getAudioPreviewUrl(): string {
    if (this.audioSourceType === 'upload' && this.selectedElement?.tempContent) {
      return this.selectedElement.tempContent;
    } else if (this.audioSourceType === 'upload' && this.selectedElement?.content) {
      return this.selectedElement.content;
    } else if (this.audioSourceType === 'embed' && this.audioEmbedUrl) {
      return this.audioEmbedUrl;
    }
    return '';
  }
  
  isAudioValid(): boolean {
    if (this.audioSourceType === 'upload') {
      return !!(this.selectedElement?.file || this.selectedElement?.content);
    } else if (this.audioSourceType === 'embed') {
      return !!(this.audioEmbedUrl && this.isValidAudioUrl(this.audioEmbedUrl));
    }
    return false;
  }

  isValidAudioUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.toLowerCase();
      return pathname.endsWith('.mp3') || 
             pathname.endsWith('.wav') || 
             pathname.endsWith('.ogg') || 
             pathname.endsWith('.m4a') ||
             pathname.endsWith('.aac') ||
             pathname.endsWith('.flac');
    } catch {
      return false;
    }
  }

 cancelAudioDialog(): void {
    this.showAudioDialog = false;
    this.audioSourceType = 'upload';
    this.audioEmbedUrl = '';
    this.audioTitle = '';
    this.audioSubtitle = '';
    this.showControls = true;
    this.requireUserToWatch = false;
    this.autoPlay = false;
    this.selectedFileName = null;
    this.selectedItemIndex = -1;

    if (this.selectedElement && this.selectedElement.blobUrl && this.selectedElement.blobUrl.startsWith('blob:')) {
      if (!this.sectionsArray.some(section => section.items.some(item => item.blobUrl === this.selectedElement.blobUrl))) {
        URL.revokeObjectURL(this.selectedElement.blobUrl);
      }
      this.selectedElement.blobUrl = null;
      this.selectedElement.file = null;
      this.selectedElement.tempContent = null;
      this.selectedElement.audioUrl = null;
      this.selectedElement.embedUrl = null;
    }

    this.selectedElement = null;
    this.changeDetectorRef.detectChanges();
  }

 saveAudioContent(sectionIndex: number, itemIndex: number): void {
    if (!this.selectedElement || sectionIndex < 0 || itemIndex < 0) {
      this.notificationService.errorTopRight('Invalid element or indices.');
      return;
    }

    const item = this.sectionsArray[sectionIndex].items[itemIndex];
    const itemKey = `${item.id || sectionIndex + '-' + itemIndex}`;

    if (this.blobUrls.has(itemKey) && this.blobUrls.get(itemKey) !== this.selectedElement.blobUrl) {
      URL.revokeObjectURL(this.blobUrls.get(itemKey));
      this.blobUrls.delete(itemKey);
    }

    item.title = this.audioTitle;
    item.subtitle = this.audioSubtitle;
    item.showControls = this.showControls;
    item.requireUserToWatch = this.requireUserToWatch;
    item.autoPlay = this.autoPlay;
    item.modified = true;
    item.isSavedToAPI = false;

    if (this.audioSourceType === 'upload' && this.selectedElement.file) {
      item.file = this.selectedElement.file;
      item.tempAudioUrl = this.selectedElement.tempContent;
      item.blobUrl = this.selectedElement.tempContent;
      item.audioUrl = null;
      item.embedUrl = null;
      item.fileName = this.selectedFileName;
      this.blobUrls.set(itemKey, this.selectedElement.tempContent);
    } else if (this.audioSourceType === 'embed' && this.audioEmbedUrl && this.isValidAudioUrl(this.audioEmbedUrl)) {
      item.embedUrl = this.audioEmbedUrl;
      item.audioUrl = this.audioEmbedUrl;
      item.file = null;
      item.tempAudioUrl = null;
      item.blobUrl = null;
      item.fileName = this.selectedFileName;
    } else {
      this.notificationService.errorTopRight('No valid audio content provided. Please upload a file or provide a valid URL.');
      return;
    }

    this.showAudioDialog = false;
    this.selectedElement = null;
    this.selectedItemIndex = -1;
    this.changeDetectorRef.detectChanges();
  }


 getAudioUrl(item: any): string {
    if (item.audioUrl) {
      return item.audioUrl;
    } else if (item.content) {
      return item.content;
    } else if (item.embedUrl) {
      return item.embedUrl;
    } else if (item.blobUrl) {
      return item.blobUrl;
    } else if (item.tempAudioUrl) {
      return item.tempAudioUrl;
    } else if (item.getAllCMSItemViews?.length > 0) {
      const firstItem = item.getAllCMSItemViews[0];
      const fallbackUrl = firstItem.url || firstItem.content;
      if (fallbackUrl) {
        return fallbackUrl;
      }
    } else if (item.file && item.file instanceof File) {
      if (!item.tempAudioUrl || !item.tempAudioUrl.startsWith('blob:')) {
        if (item.tempAudioUrl && item.tempAudioUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.tempAudioUrl);
        }
        item.tempAudioUrl = URL.createObjectURL(item.file);
        item.blobUrl = item.tempAudioUrl;
      }
      return item.tempAudioUrl;
    }
    return '';
  }

  onAudioEnded(item: PageElement): void {
    if (item.requireUserToWatch) {
      item.listenProgress = 100;
      item.modified = true;
    }
  }

  onAudioTimeUpdate(event: any, item: PageElement): void {
    if (item.requireUserToWatch) {
      const audio = event.target;
      if (audio.duration > 0) {
        const progress = Math.round((audio.currentTime / audio.duration) * 100);
        if (progress > (item.listenProgress || 0)) {
          item.listenProgress = progress;
          item.modified = true;
        }
      }
    }
  }

  isAudioCompleted(item: PageElement): boolean {
    return !item.requireUserToWatch || (item.listenProgress || 0) >= 100;
  }

  // Method to get audio source URL
  getAudioSourceUrl(item: PageElement): string {
    return item.embedUrl || item.content || '';
  }
 onAudioError(event: any, item: any): void {
    
    // Try to recreate blob URL if it's a blob URL error
    if (event.target.src && event.target.src.startsWith('blob:') && item.file) {
      this.recreateAudioUrl(item);
    }
  }
recreateAudioUrl(item: any): void {
    if (item.file && item.file instanceof File) {
      // Clean up old blob URL
      if (item.tempAudioUrl && item.tempAudioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.tempAudioUrl);
      }
      
      // Create new blob URL
      item.tempAudioUrl = URL.createObjectURL(item.file);
      item.blobUrl = item.tempAudioUrl;
      
      this.changeDetectorRef.detectChanges();
    }
  }
  onAudioLoadStart(item: any): void {
  }

  onAudioLoaded(item: any): void {
  }
  // Method to format time duration
  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  // Method to get audio duration
  getAudioDuration(item: PageElement): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration);
      });
      audio.addEventListener('error', () => {
        resolve(0);
      });
      audio.src = this.getAudioSourceUrl(item);
    });
  }
  
  // Method to validate audio file before upload
  validateAudioFile(file: File): boolean {
    const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/flac'];
    const maxSize = 25 * 1024 * 1024; // 25MB
    
    if (!validTypes.includes(file.type)) {
      this.notificationService.errorTopRight('Invalid audio format. Please use MP3, WAV, OGG, M4A, AAC, or FLAC.');
      return false;
    }
    
    if (file.size > maxSize) {
      this.notificationService.errorTopRight('Audio file size must be less than 25 MB.');
      return false;
    }
    
    return true;
  }

 cancelButtonDialog(): void {
  this.showButtonDialog = false;
  
  // Reset dialog values
  this.buttonText = '';
  this.buttonHyperlink = '';
  this.buttonColor = '#007bff';
  this.buttonTextColor = '#ffffff';
  this.buttonBold = false;
  this.buttonItalic = false;
  this.buttonUnderline = false;
}
parseButtonStyle(salesHeading: string) {
  try {
    return salesHeading ? JSON.parse(salesHeading) : {};
  } catch (e) {
    console.warn('Error parsing button style:', e);
    return {};
  }
}

onButtonClick(item: any) {
  if (item.chartHeading && item.chartHeading.trim() !== '') {
    const url = item.chartHeading.startsWith('http') ? item.chartHeading : 'https://' + item.chartHeading;
    window.open(url, '_blank');
  }
}

saveButtonContent(sectionIndex: number, itemIndex: number): void {
  const item = this.sectionsArray[sectionIndex].items[itemIndex];

  if (item.type !== 'button') {
    this.notificationService.errorTopRight('Can only update button elements.');
    return;
  }

  // Set the text
  item.content = this.buttonText;
  item.text = this.buttonText;

  const trimmedLink = typeof this.buttonHyperlink === 'string' ? this.buttonHyperlink.trim() : '';
  item.hyperlink = trimmedLink;
  item.chartHeading = trimmedLink;

  // Build the style object
  const buttonStyleData = {
    backgroundColor: this.buttonColor,
    color: this.buttonTextColor,
    fontWeight: this.buttonBold ? 'bold' : 'normal',
    fontStyle: this.buttonItalic ? 'italic' : 'normal',
    textDecoration: this.buttonUnderline ? 'underline' : 'none',
    zIndex: item.buttonStyle?.zIndex || 1
  };

  item.salesHeading = JSON.stringify(buttonStyleData);
  item.buttonStyle = buttonStyleData;

  // Mark unsaved changes
  this.hasUnsavedChanges = true;
  this.changeDetectorRef.detectChanges();

  // Reset dialog state
  this.showButtonDialog = false;
  this.buttonText = '';
  this.buttonHyperlink = '';
  this.buttonColor = '#007bff';
  this.buttonTextColor = '#ffffff';
  this.buttonBold = false;
  this.buttonItalic = false;
  this.buttonUnderline = false;
}





getButtonStyle(item: any) {
  if (!item._parsedButtonStyle) {
    try {
      item._parsedButtonStyle = item.salesHeading ? JSON.parse(item.salesHeading) : {};
    } catch (e) {
      console.warn('Error parsing button style:', e);
      item._parsedButtonStyle = {};
    }
  }
  return item._parsedButtonStyle;
}

  toggleButtonBold(): void {
    this.buttonBold = !this.buttonBold;
  }

  toggleButtonItalic(): void {
    this.buttonItalic = !this.buttonItalic;
  }

  toggleButtonUnderline(): void {
    this.buttonUnderline = !this.buttonUnderline;
  }
  dragStartHandler(event: CdkDragStart, sectionIndex: number, itemIndex: number) {
    this.dragging = true;
    this.showGridBlocks[sectionIndex] = true;
    this.showCenterLine = true;
    this.findAlignmentGuides(sectionIndex);
    if (this.selectedElement) {
      this.bringElementToFront(this.selectedElement, sectionIndex);
    }
  }
  bringElementToFront(item: PageElement, sectionIndex: number) {
    item.zIndex = this.getMaxZIndex(sectionIndex) + 1;
    this.markElementsAsModified();
    this.changeDetectorRef.detectChanges();
  }

  setChartSize(item, i, j) {
    const container = document.querySelector('.chart-container-'+i+'-'+j) as HTMLElement;
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const width = containerRect.width || container.offsetWidth || 0;
      const height = containerRect.height || container.offsetHeight || 0;
      
      if (item.className === 'Pie Chart') {
        // For pie chart, use the smaller dimension
        const padding = 20;
        const availableWidth = width - padding;
        const availableHeight = height - padding;
        
        // Use minimum to ensure pie fits in both dimensions
        const minDimension = Math.min(availableWidth, availableHeight);
        
        // If container is too small or not ready, use default
        if (minDimension < 100) {
          item.chartView = [160, 160];
        } else {
          // Use 90% of minDimension for good size
          const safeSize = Math.floor(minDimension * 0.90);
          // Limit between 150 and 280 pixels
          const finalSize = Math.max(150, Math.min(safeSize, 280));
          item.chartView = [finalSize, finalSize];
        }
      } else {
        const padding = 40;
        const availableWidth = Math.max(150, width - padding);
        const availableHeight = Math.max(150, height - padding);
        item.chartView = [availableWidth, availableHeight];
      }
      this.changeDetectorRef.detectChanges();
    } else {
      // Container not found, set default
      if (item.className === 'Pie Chart') {
        item.chartView = [160, 160];
        this.changeDetectorRef.detectChanges();
      }
    }
  }
  updateSectionHeightDynamic(sectionIndex: number): void {
    if (this.updateSectionHeightDebounceTimer) {
      clearTimeout(this.updateSectionHeightDebounceTimer);
    }

    this.updateSectionHeightDebounceTimer = setTimeout(() => {
      const section = this.sectionsArray[sectionIndex];
      const items = section?.items || [];
      const isEmpty = items.length === 0;

      let tallestBottom = 0;

      if (this.selectedContainerType === 'widgets') {
        // Widget mode: calculate from row layout
        const gap = window.innerWidth < 768 ? 0.4 : 0.6;
        const rowHeights: number[] = [];
        let curRowWidth = 0;
        let maxRowHeight = 0;

        items.forEach(item => {
          const w = item.widthPercent || 33;
          const h = item.heightPercent || 25;

          if (curRowWidth + w + gap > 100 || curRowWidth === 0 && w >= 100) {
            if (curRowWidth > 0) rowHeights.push(maxRowHeight);
            curRowWidth = w;
            maxRowHeight = h;
          } else {
            curRowWidth += w + gap;
            maxRowHeight = Math.max(maxRowHeight, h);
          }
        });
        if (curRowWidth > 0) rowHeights.push(maxRowHeight);

        const gaps = Math.max(0, rowHeights.length - 1) * 2;
        tallestBottom = rowHeights.reduce((a, b) => a + b, 0) + gaps + 8;

      } else {
        // FREEFORM MODE — This is your case!
        items.forEach(item => {
          const top = item.yPercent || 0;
          const height = item.heightPercent || 25;
          const bottom = top + height;
          if (bottom > tallestBottom) tallestBottom = bottom;
        });
        tallestBottom += 6; // bottom padding
      }

      // Final height
      const finalHeightVH = isEmpty
        ? 16
        : Math.max(8, Math.ceil(tallestBottom));  // Never below 8vh if content exists

      this.applySectionHeightVH(sectionIndex, finalHeightVH);

      this.storeState();
      this.changeDetectorRef.detectChanges();
    }, 80);
  }

  private applySectionHeightVH(sectionIndex: number, vh: number) {
    const sectionElement = this.scrollContainerItem?.nativeElement?.children?.[sectionIndex];
    if (!sectionElement) return;

    // Set the exact calculated height
    sectionElement.style.height = `${vh}vh`;

    // ONLY enforce 16vh min-height when section is empty
    const section = this.sectionsArray[sectionIndex];
    const isEmpty = !section?.items || section.items.length === 0;

    if (isEmpty) {
      sectionElement.style.minHeight = '16vh';
    } else {
      sectionElement.style.minHeight = '0vh';  // or 'unset'
      // Let content define the height
    }
  }
  getDynamicSectionHeight(sectionIndex: number): number {
    const section = this.sectionsArray[sectionIndex];
    const items = section?.items || [];

    if (items.length === 0) return 16;

    if (this.selectedContainerType === 'widgets') {
      return null;
    }

    const vhUnit = window.innerHeight / 100;
    let maxBottomVH = 0;

    items.forEach((item, itemIndex) => {

      if (item.type === 'text' || item.type === 'greeting') {
        const el = document.getElementById(`element-text-${sectionIndex}-${itemIndex}`);
        if (el) {
          const bottomPx = el.offsetTop + el.scrollHeight;
          const bottomVH = bottomPx / vhUnit;
          maxBottomVH = Math.max(maxBottomVH, bottomVH);
        }
        return;
      }

      const topVH = item.yPercent || 0;
      const heightVH = item.heightPercent || 25;
      maxBottomVH = Math.max(maxBottomVH, topVH + heightVH);
    });

    // Minimum + padding buffer
    return Math.max(8, Math.ceil(maxBottomVH + 6));
  }

  
  constrainPosition(sectionIndex: number, itemIndex: number, point: Point, dragRef: DragRef): Point {
    const item = this.sectionsArray[sectionIndex].items[itemIndex];
    const sectionElement = document.querySelector(`.added-section-editing-area:nth-child(${sectionIndex + 1})`);
    if (!sectionElement || !item) return point;
    const sectionRect = sectionElement.getBoundingClientRect();
    let xPercent = (point.x / sectionRect.width) * 100;
    let yPercent = (point.y / sectionRect.height) * 100;
    xPercent = Math.max(0, Math.min(100 - item.widthPercent, xPercent));
    yPercent = Math.max(0, Math.min(100 - item.heightPercent, yPercent));
    const gridPos = this.pixelToGridPercent(xPercent, yPercent);
    const snappedPos = this.gridToPixelPercent(gridPos.col, gridPos.row);
    return {
      x: (snappedPos.xPercent / 100) * sectionRect.width,
      y: (snappedPos.yPercent / 100) * sectionRect.height
    };
  }
  
 startResize(event: MouseEvent, item: PageElement, handle: string, sectionIndex: number) {
    if (this.isChartType(item.type)) return;
    event.preventDefault();
    event.stopPropagation();
    this.resizing = true;
    this.resizeHandle = handle;
    this.selectedElement = item;
    this.isEditingSection = sectionIndex;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startXPercent = item.xPercent;
    this.startYPercent = item.yPercent;
    this.startWidthPercent = item.widthPercent;
    this.startHeightPercent = item.heightPercent;
    document.addEventListener('mousemove', this.onResizeMove);
    document.addEventListener('mouseup', this.onResizeEnd);
  }

  onResizeMove = (event: MouseEvent) => {
    if (!this.resizing || !this.selectedElement || this.isEditingSection === null) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const deltaXvw = ((event.clientX - this.startX) / vw) * 100;
    const deltaYvh = ((event.clientY - this.startY) / vh) * 100;

    let newX = this.startXPercent;
    let newY = this.startYPercent;
    let newW = this.startWidthPercent;
    let newH = this.startHeightPercent;

    const minW = this.getMinWidth(this.selectedElement.type);
    const minH = this.getMinHeight(this.selectedElement.type);

    switch (this.resizeHandle) {
      case 'top-left':
        newW = Math.max(minW, this.startWidthPercent - deltaXvw);
        newH = Math.max(minH, this.startHeightPercent - deltaYvh);
        newX = this.startXPercent + (this.startWidthPercent - newW);
        newY = this.startYPercent + (this.startHeightPercent - newH);
        break;
      case 'top-right':
        newW = Math.max(minW, this.startWidthPercent + deltaXvw);
        newH = Math.max(minH, this.startHeightPercent - deltaYvh);
        newY = this.startYPercent + (this.startHeightPercent - newH);
        break;
      case 'bottom-left':
        newW = Math.max(minW, this.startWidthPercent - deltaXvw);
        newH = Math.max(minH, this.startHeightPercent + deltaYvh);
        newX = this.startXPercent + (this.startWidthPercent - newW);
        break;
      case 'bottom-right':
        newW = Math.max(minW, this.startWidthPercent + deltaXvw);
        newH = Math.max(minH, this.startHeightPercent + deltaYvh);
        break;
      case 'left-center':
        newW = Math.max(minW, this.startWidthPercent - deltaXvw);
        newX = this.startXPercent + (this.startWidthPercent - newW);
        break;
      case 'right-center':
        newW = Math.max(minW, this.startWidthPercent + deltaXvw);
        break;
      case 'top-center':
        newH = Math.max(minH, this.startHeightPercent - deltaYvh);
        newY = this.startYPercent + (this.startHeightPercent - newH);
        break;
      case 'bottom-center':
        newH = Math.max(minH, this.startHeightPercent + deltaYvh);
        break;
    }

    // Prevent overflow
    newX = Math.max(0, newX);
    newY = Math.max(0, newY);
    newW = Math.min(100 - newX, newW);
    newH = Math.max(minH, newH);

    this.selectedElement.xPercent = newX;
    this.selectedElement.yPercent = newY;
    this.selectedElement.widthPercent = newW;
    this.selectedElement.heightPercent = newH;

    this.updateSectionHeightDynamic(this.isEditingSection);
    this.markElementsAsModified();
    this.updateElementAlignmentHighlights(this.isEditingSection);
    this.changeDetectorRef.detectChanges();
  };


  onResizeEnd = () => {
  this.resizing = false;
  if (this.isEditingSection !== null) {
    // Only hide grid if not editing
    if (!this.editingSection) {
      this.showGridBlocks[this.isEditingSection] = false;
      this.alignmentGuides[this.isEditingSection] = [];
    }
  }
  if (this.selectedElement) {
    this.selectedElement.isCenteredHorizontally = false;
    this.selectedElement.isCenteredVertically = false;
  }
  document.removeEventListener('mousemove', this.onResizeMove);
  document.removeEventListener('mouseup', this.onResizeEnd);
  this.markElementsAsModified();
  this.highlightedElementIds.clear();
  this.cdr.detectChanges();
};


  isChartType(type: string | undefined): boolean {
    return type === 'Pie Chart' || type === 'Line Chart' || type === 'Bar Chart';
  }
   getMinWidth(type: string): number {
    switch (type) {
      case 'video':
        return 20; 
      case 'audio':
        return 20;
      case 'image':
        return 10; // 30vw
      case 'button':
        return 10; // 10vw
      case 'text':
        return 5; // 5vw
      default:
        return 5; // 5vw
    }
  }

  getMinHeight(type: string): number {
    switch (type) {
      case 'video':
        return this.MIN_VIDEO_HEIGHT_PERCENT; 
      case 'audio':
        return 10;
      case 'image':
        return 20; // 30vh
      case 'button':
        return 5; // 5vh
      case 'text':
        return 5; // 5vh
      default:
        return 5; // 5vh
    }
  }

  snapToGrid(x: number, y: number, width: number, height: number, handle: string): any {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const cellWidthWithGutter = this.cellWidthPercent + this.gridGutterPercent;
    const cellHeightWithGutter = this.cellHeightPercent + this.gridGutterPercent;

    const widthInCells = Math.round(width / this.cellWidthPercent);
    const heightInCells = Math.round(height / this.cellHeightPercent);

    let snappedWidth = widthInCells * this.cellWidthPercent;
    let snappedHeight = heightInCells * this.cellHeightPercent;

    let snappedX = x;
    let snappedY = y;

    if (!handle.includes('right')) {
      const col = Math.round(x / cellWidthWithGutter);
      snappedX = col * cellWidthWithGutter;
    }

    if (!handle.includes('bottom')) {
      const row = Math.round(y / cellHeightWithGutter);
      snappedY = row * cellHeightWithGutter;
    }

    snappedX = Math.max(0, snappedX);
    snappedY = Math.max(0, snappedY);

    const minWidthVW = (this.getMinWidth(this.selectedElement?.type || '') / vw) * 100;
    const minHeightVH = (this.getMinHeight(this.selectedElement?.type || '') / vh) * 100;

    snappedWidth = Math.max(minWidthVW, snappedWidth);
    snappedHeight = Math.max(minHeightVH, snappedHeight);

    return {
      xPercent: snappedX,
      yPercent: snappedY,
      widthPercent: snappedWidth,
      heightPercent: snappedHeight
    };
  };
  pixelToGridPercent(xPercent: number, yPercent: number): { col: number; row: number } {
    const col = Math.round(xPercent / (this.cellWidthPercent + this.gridGutterPercent));
    const row = Math.round(yPercent / (this.cellHeightPercent + this.gridGutterPercent));
    return { col, row };
  }

  gridToPixelPercent(col: number, row: number): { xPercent: number; yPercent: number } {
    const xPercent = col * (this.cellWidthPercent + this.gridGutterPercent);
    const yPercent = row * (this.cellHeightPercent + this.gridGutterPercent);
    return { xPercent, yPercent };
  }
 
 // inside your component class
  findAlignmentGuides(sectionIndex: number) {
    if (!this.selectedElement || this.isEditingSection !== sectionIndex) return;

    this.alignmentGuides[sectionIndex] = [];

    const canvasCenterY = 50; // center in vh
    const toleranceVW = 2; // For other elements, this tolerance is still useful
    const toleranceVH = 2;

    const selected = this.selectedElement;
    const selX = selected.xPercent;
    const selY = selected.yPercent;
    const selWidth = selected.widthPercent;
    const selHeight = selected.heightPercent;
    const selCenterX = selX + selWidth / 2;
    const selCenterY = selY + selHeight / 2;

    let guide: { xPercent?: number; yPercent?: number } | null = null;

    // The isCenteredHorizontally flag is now managed by onMouseMove.
    // We only check for vertical canvas center alignment here.
    if (Math.abs(selCenterY - canvasCenterY) < toleranceVH) {
      guide = { yPercent: canvasCenterY };
      selected.isCenteredVertically = true;
    } else {
      selected.isCenteredVertically = false;
    }

    // Snap to other elements (same as before)
    if (!guide) {
      for (const item of this.sectionsArray[sectionIndex].items) {
        if (item.id === selected.id) continue;

        const itemX = item.xPercent;
        const itemY = item.yPercent;
        const itemWidth = item.widthPercent;
        const itemHeight = item.heightPercent;
        const itemCenterX = itemX + itemWidth / 2;
        const itemCenterY = itemY + itemHeight / 2;

        // Other alignment checks
        if (Math.abs(selX - itemX) < toleranceVW) {
          guide = { xPercent: itemX };
          break;
        }
        if (Math.abs(selX + selWidth - (itemX + itemWidth)) < toleranceVW) {
          guide = { xPercent: itemX + itemWidth };
          break;
        }
        if (Math.abs(selY - itemY) < toleranceVH) {
          guide = { yPercent: itemY };
          break;
        }
        if (Math.abs(selY + selHeight - (itemY + itemHeight)) < toleranceVH) {
          guide = { yPercent: itemY + itemHeight };
          break;
        }
        if (Math.abs(selCenterX - itemCenterX) < toleranceVW) {
          guide = { xPercent: itemCenterX };
          break;
        }
        if (Math.abs(selCenterY - itemCenterY) < toleranceVH) {
          guide = { yPercent: itemCenterY };
          break;
        }
      }
    }

    if (guide) {
      this.alignmentGuides[sectionIndex] = [guide];
    }
  }


 updateCenterDetection(element: PageElement): void {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const centerX = element.xPercent + element.widthPercent / 2;
    const centerY = element.yPercent + element.heightPercent / 2;

    const screenCenterX = 50;
    const screenCenterY = 50;

    // Tighter tolerance for precise centering
    const tolerance = 0.05; // 0.05% of viewport width

    element.isCenteredHorizontally = Math.abs(centerX - screenCenterX) < tolerance;
    element.isCenteredVertically = Math.abs(centerY - screenCenterY) < tolerance;

    // Snap to exact center if within tolerance
    if (element.isCenteredHorizontally) {
      element.xPercent = 50 - element.widthPercent / 2;
    }
    if (element.isCenteredVertically) {
      element.yPercent = 50 - element.heightPercent / 2;
    }

    // Update pixel values
    element.x = (element.xPercent / 100) * viewportWidth;
    element.y = (element.yPercent / 100) * viewportHeight;

    // Debugging log
  }
  onElementHover(item: PageElement) {
    if (!this.dragging && !this.resizing) {
      this.hoveredElement = item;
    }
  }
  onElementLeave() {
    this.hoveredElement = null;
  }

  updateAlignmentGuides(sectionIndex: number): void {
  const guides: { xPercent?: number; yPercent?: number }[] = [];
  const items = this.sectionsArray[sectionIndex]?.items || [];
  const selected = this.selectedElement;

  if (selected) {
    items.forEach(item => {
      if (item.id !== selected.id) {
        if (Math.abs(item.xPercent - selected.xPercent) < 1) guides.push({ xPercent: item.xPercent });
        if (Math.abs((item.xPercent + item.widthPercent) - (selected.xPercent + selected.widthPercent)) < 1)
          guides.push({ xPercent: item.xPercent + item.widthPercent });
        if (Math.abs(item.yPercent - selected.yPercent) < 1) guides.push({ yPercent: item.yPercent });
        if (Math.abs((item.yPercent + item.heightPercent) - (selected.yPercent + selected.heightPercent)) < 1)
          guides.push({ yPercent: item.yPercent + item.heightPercent });
      }
    });


    this.alignmentGuides[sectionIndex] = guides;
  }
}
  isGridCellHighlighted(row: number, col: number, sectionIndex: number): boolean {
    if (!this.selectedElement || this.isEditingSection !== sectionIndex) return false;

    const start = this.percentToGridCell(this.selectedElement.xPercent, this.selectedElement.yPercent);
    const end = this.percentToGridCell(
      this.selectedElement.xPercent + this.selectedElement.widthPercent,
      this.selectedElement.yPercent + this.selectedElement.heightPercent
    );

    const startRow = Math.max(0, Math.round(start.row));
    const endRow = Math.min(this.gridRows - 1, Math.round(end.row));
    const startCol = Math.max(0, Math.round(start.col));
    const endCol = Math.min(this.gridColumns - 1, Math.round(end.col));

    return col >= startCol && col <= endCol && row >= startRow && row <= endRow;
  }
  calculateGridColumns(sectionIndex: number) {
    const section = document.querySelectorAll('.added-section-editing-area')[sectionIndex];
    if (!section) return;

    const width = section.clientWidth;

    // Fixed number of columns
    this.gridColumns = 50;

    // Ideal gutter width ratio 
    const gutterRatio = 0.25; // 25% of cell width (same as your original layout)

    // Calculate cell width based on total width
    this.cellWidthPx = width / (this.gridColumns + (this.gridColumns - 1) * gutterRatio);

    // Gutter based on ideal ratio (not too big now)
    this.gridGutterPx = this.cellWidthPx * gutterRatio;

    // Cell height proportional to original aspect ratio
    const aspectRatio = this.idealCellHeight / this.idealCellWidth;
    this.cellHeightPx = this.cellWidthPx * aspectRatio;
  }
  // Convert percent → grid cell coordinates
  percentToGridCell(x: number, y: number) {
    const xPx = (x / 100) * window.innerWidth;
    const yPx = (y / 100) * window.innerHeight;

    return {
      col: xPx / (this.cellWidthPx + this.gridGutterPx),
      row: yPx / (this.cellHeightPx + this.gridGutterPx)
    };
  }

  // EXACT CENTER OF THE SECTION (not viewport)
  getSectionCenter(sectionIndex: number): number {
    const section = document.querySelectorAll('.added-section-editing-area')[sectionIndex];
    const wrapper = document.querySelectorAll('.grid-wrapper')[sectionIndex];

    if (!section || !wrapper) return 0;

    const sectionRect = section.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();

    // Center offset = wrapper left (relative) + half width
    return (wrapperRect.left - sectionRect.left) + wrapperRect.width / 2;
  }
  getElementCenterX(sectionIndex: number, itemIndex: number): number {
    const section = document.querySelectorAll('.added-section-editing-area')[sectionIndex];
    const wrapper = document.querySelectorAll('.grid-wrapper')[sectionIndex];

    if (!section || !wrapper) return 0;

    const element = this.sectionsArray[sectionIndex].items[itemIndex];
    if (!element) return 0;

    const sectionRect = section.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();

    const vw = window.innerWidth;

    // absolute screen positions
    const elementLeftOnScreen = (element.xPercent / 100) * vw;
    const elementWidthPx = (element.widthPercent / 100) * vw;
    const elementCenterScreen = elementLeftOnScreen + elementWidthPx / 2;

    // convert to wrapper-local coordinates
    const elementCenterRelativeToWrapper = elementCenterScreen - wrapperRect.left;

    return elementCenterRelativeToWrapper;
  }




  moveSectionUp(index: number) {
    if (index > 0) {
      const temp = this.sectionsArray[index];
      this.sectionsArray[index] = this.sectionsArray[index - 1];
      this.sectionsArray[index - 1] = temp;
      const tempGrid = this.showGridBlocks[index];
      this.showGridBlocks[index] = this.showGridBlocks[index - 1];
      this.showGridBlocks[index - 1] = tempGrid;
      const tempGuides = this.alignmentGuides[index];
      this.alignmentGuides[index] = this.alignmentGuides[index - 1];
      this.alignmentGuides[index - 1] = tempGuides;
      if (this.isEditingSection === index) {
        this.isEditingSection = index - 1;
      } else if (this.isEditingSection === index - 1) {
        this.isEditingSection = index;
      }
      this.markElementsAsModified();
      this.changeDetectorRef.detectChanges();
    }
  }

  moveSectionDown(index: number) {
    if (index < this.sectionsArray.length - 1) {
      const temp = this.sectionsArray[index];
      this.sectionsArray[index] = this.sectionsArray[index + 1];
      this.sectionsArray[index + 1] = temp;
      const tempGrid = this.showGridBlocks[index];
      this.showGridBlocks[index] = this.showGridBlocks[index + 1];
      this.showGridBlocks[index + 1] = tempGrid;
      const tempGuides = this.alignmentGuides[index];
      this.alignmentGuides[index] = this.alignmentGuides[index + 1];
      this.alignmentGuides[index + 1] = tempGuides;
      if (this.isEditingSection === index) {
        this.isEditingSection = index + 1;
      } else if (this.isEditingSection === index + 1) {
        this.isEditingSection = index;
      }
      this.markElementsAsModified();
      this.changeDetectorRef.detectChanges();
    }
  }

async duplicateSection(index: number) {
  const originalSection = this.sectionsArray[index];
  const sectionToDuplicate = await this.createCompleteDeepCopy(originalSection);

  sectionToDuplicate.id = `00000000-0000-0000-0000-000000000000`;

  for (let itemIndex = 0; itemIndex < sectionToDuplicate.items.length; itemIndex++) {
    const item: PageElement = sectionToDuplicate.items[itemIndex];
    const timestamp = Date.now();
    const randomPart1 = Math.random().toString(36).substr(2, 9);
    const randomPart2 = Math.random().toString(36).substr(2, 9);
    const uniqueSuffix = `${timestamp}-${itemIndex}-${randomPart1}-${randomPart2}`;

    item.id = `${item.type}-${uniqueSuffix}`;
    item.containerId = this.getNanoTimestampWithRandomString();
    item.modified = true;
    item.isSavedToAPI = false;

    await this.resetAllMediaProperties(item, uniqueSuffix);

    if (item.type === 'video') {
      console.log(`Duplicated video item ${item.id}:`, {
        file: item.file,
        localVideoUrl: item.localVideoUrl,
        isYoutubeOrVimeo: item.isYoutubeOrVimeo,
        videoUrl: item.videoUrl,
        cmsItemViews: item.getAllCMSItemViews
      });
    }
  }

  this.sectionsArray.splice(index + 1, 0, sectionToDuplicate);
  this.showGridBlocks.splice(index + 1, 0, false);
  this.alignmentGuides.splice(index + 1, 0, []);

  this.clearSelection();

  this.markElementsAsModified();
  this.changeDetectorRef.detectChanges();

  if (this.selectedMenuId !== 'TOU' && this.selectedMenuId !== 'FAQ' && this.selectedMenuId !== 'CU' && this.selectedMenuId !== 'PP' && this.selectedMenuId !== 'NT' && this.selectedMenuId !== 'FD' && this.selectedMenuId !== 'AC' && this.selectedMenuId !== 'TR' && this.selectedMenuId !== 'PR') {
    setTimeout(() => {
      this.updateSectionHeights();
    }, 200);
  }
}
async createCompleteDeepCopy(obj: any): Promise<any> {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (obj instanceof File) {
    const blob = await obj.slice(0, obj.size, obj.type);
    const newFile = new File([blob], obj.name, { type: obj.type, lastModified: obj.lastModified });
    console.log('Copied File:', newFile); // Debug log
    return newFile;
  }

  if (obj instanceof Array) {
    return Promise.all(obj.map(item => this.createCompleteDeepCopy(item)));
  }

  if (typeof obj === 'object') {
    const copy: any = {};
    for (const key of Object.keys(obj)) {
      if (key === 'isVideo' && obj.type === 'video') {
        copy[key] = true;
      } else {
        copy[key] = await this.createCompleteDeepCopy(obj[key]);
      }
    }
    return copy;
  }

  return obj;
}

async resetAllMediaProperties(item: PageElement, uniqueSuffix: string): Promise<void> {
  const timestamp = Date.now();
  
  if (item.getAllCMSItemViews && Array.isArray(item.getAllCMSItemViews)) {
    item.getAllCMSItemViews = await Promise.all(item.getAllCMSItemViews.map(async (cmsItem, cmsIndex) => {
      const newCmsItem = await this.createCompleteDeepCopy(cmsItem);
      newCmsItem.uniqueId = `${item.id}-cms-${cmsIndex}-${uniqueSuffix}`;
      newCmsItem.id = '00000000-0000-0000-0000-000000000000';
      
      if (item.type === 'audio' && item.file instanceof File) {
        // Ensure audio file is copied for unsaved audio
        newCmsItem.file = await this.createCompleteDeepCopy(item.file);
        newCmsItem.url = URL.createObjectURL(newCmsItem.file);
        newCmsItem.content = newCmsItem.url;
      } else if (item.type === 'video' && item.file instanceof File) {
        // Ensure video file is copied for unsaved videos
        newCmsItem.file = await this.createCompleteDeepCopy(item.file);
        newCmsItem.url = URL.createObjectURL(newCmsItem.file);
        newCmsItem.content = newCmsItem.url;
      } else if (newCmsItem.file instanceof File) {
        // Preserve file for other unsaved media
        newCmsItem.url = URL.createObjectURL(newCmsItem.file);
        newCmsItem.content = newCmsItem.url;
      } else if (item.type === 'audio') {
        // Check additional fields for saved audio URLs
        const audioUrl = (item.audioUrl && !item.audioUrl.startsWith('blob:')) ? item.audioUrl :
                         (item.text && !item.text.startsWith('blob:')) ? item.text :
                         (item.content && !item.content.startsWith('blob:')) ? item.content :
                         (item.embedUrl && !item.embedUrl.startsWith('blob:')) ? item.embedUrl : null;
        if (audioUrl) {
          try {
            const file = await this.urlToFile(audioUrl, this.extractFileNameFromUrl(audioUrl) || `audio-${cmsIndex}.wav`);
            newCmsItem.file = file;
            newCmsItem.url = file ? URL.createObjectURL(file) : audioUrl;
            newCmsItem.content = newCmsItem.url;
          } catch (error) {
            console.warn(`Failed to convert audio URL to file: ${audioUrl}`, error);
            newCmsItem.file = null;
            newCmsItem.url = audioUrl;
            newCmsItem.content = audioUrl;
          }
        } else {
          newCmsItem.url = null;
          newCmsItem.content = null;
          newCmsItem.file = null;
        }
      } else if (item.type === 'video') {
        // Check additional fields for saved video URLs
        const videoUrl = (item.isYoutubeOrVimeo && item.videoUrl && !item.videoUrl.startsWith('blob:')) ? item.videoUrl :
                         (item.localVideoUrl && !item.localVideoUrl.startsWith('blob:')) ? item.localVideoUrl : null;
        if (videoUrl) {
          try {
            const file = await this.urlToFile(videoUrl, this.extractFileNameFromUrl(videoUrl) || `video-${cmsIndex}.mp4`);
            newCmsItem.file = file;
            newCmsItem.url = file ? URL.createObjectURL(file) : videoUrl;
            newCmsItem.content = newCmsItem.url;
          } catch (error) {
            console.warn(`Failed to convert video URL to file: ${videoUrl}`, error);
            newCmsItem.file = null;
            newCmsItem.url = videoUrl;
            newCmsItem.content = videoUrl;
          }
        } else {
          newCmsItem.url = null;
          newCmsItem.content = null;
          newCmsItem.file = null;
        }
      } else if (newCmsItem.url && !newCmsItem.url.startsWith('blob:')) {
        // Convert non-blob URLs to files for other saved media
        try {
          const file = await this.urlToFile(newCmsItem.url, this.extractFileNameFromUrl(newCmsItem.url) || `media-${cmsIndex}.bin`);
          newCmsItem.file = file;
          newCmsItem.url = file ? URL.createObjectURL(file) : newCmsItem.url;
          newCmsItem.content = newCmsItem.url;
        } catch (error) {
          console.warn(`Failed to convert media URL to file: ${newCmsItem.url}`, error);
          newCmsItem.file = null;
          newCmsItem.url = newCmsItem.url;
          newCmsItem.content = newCmsItem.url;
        }
      } else {
        newCmsItem.url = null;
        newCmsItem.content = null;
        newCmsItem.file = null;
      }
      
      if (newCmsItem.type === 'video') {
        newCmsItem.isVideo = true;
      }
      
      return newCmsItem;
    }));
  }
  
  if (item.newHeadings && Array.isArray(item.newHeadings)) {
    item.newHeadings = await this.createCompleteDeepCopy(item.newHeadings);
  }
  
  if (item.type === 'video') {
    item.isVideo = true;
  }
  
  switch (item.type) {
    case 'image':
      await this.resetImageProperties(item, uniqueSuffix);
      break;
    case 'video':
      await this.resetVideoProperties(item, uniqueSuffix);
      break;
    case 'audio':
      await this.resetAudioProperties(item, uniqueSuffix);
      break;
  }
}
async resetVideoProperties(item: PageElement, uniqueSuffix: string): Promise<void> {
  const originalAutoPlay = item.autoPlay ?? false;
  const originalMuteByDefault = item.requireUserToWatch ?? false;
  const originalLoop = item.bannerHeading ?? '';

  item.fileName = null;

  if (item.isYoutubeOrVimeo && item.videoUrl) {
    item.localVideoUrl = null;
    item.file = null;
  } else if (item.file instanceof File) {
    item.file = await this.createCompleteDeepCopy(item.file);
    item.localVideoUrl = URL.createObjectURL(item.file);
    console.log(`Duplicated video item ${item.id}: file copied, new localVideoUrl: ${item.localVideoUrl}`);
  } else if (item.localVideoUrl && !item.localVideoUrl.startsWith('blob:') && !item.isYoutubeOrVimeo) {
    try {
      const fileName = this.extractFileNameFromUrl(item.localVideoUrl) || `video-${Date.now()}.mp4`;
      item.file = await this.urlToFile(item.localVideoUrl, fileName);
      item.localVideoUrl = item.file ? URL.createObjectURL(item.file) : item.localVideoUrl;
    } catch (error) {
      item.file = null;
      item.localVideoUrl = item.localVideoUrl;
    }
    } else if (item.localVideoUrl && item.localVideoUrl.startsWith('blob:')) {
      try {
        const response = await fetch(item.localVideoUrl);
        const blob = await response.blob();
        item.file = new File([blob], `video-${Date.now()}.mp4`, { type: blob.type });
        item.localVideoUrl = URL.createObjectURL(item.file);
      } catch (error) {
        item.file = null;
        item.localVideoUrl = null;
      }
    } else {
      item.localVideoUrl = null;
      item.file = null;
    }

  // Restore checkbox properties
  item.autoPlay = originalAutoPlay;
  item.requireUserToWatch = originalMuteByDefault;
  item.bannerHeading = originalLoop; 
  item.isVideo = true;

    if (item.getAllCMSItemViews && item.getAllCMSItemViews[0]) {
      item.getAllCMSItemViews[0].uniqueId = `${item.id}-video-${uniqueSuffix}`;
      item.getAllCMSItemViews[0].isVideo = true;
      item.getAllCMSItemViews[0].url = item.isYoutubeOrVimeo ? item.videoUrl : item.localVideoUrl || '';
      item.getAllCMSItemViews[0].content = item.isYoutubeOrVimeo ? item.videoUrl : item.localVideoUrl || '';
      item.getAllCMSItemViews[0].file = item.file || null;
      item.getAllCMSItemViews[0].autoPlay = originalAutoPlay;
      item.getAllCMSItemViews[0].requireUserToWatch = originalMuteByDefault;
      item.getAllCMSItemViews[0].bannerHeading = originalLoop;
    }
}

  async resetImageProperties(item: PageElement, uniqueSuffix: string): Promise<void> {
    item.fileName = null;
    item.file = null;

    if (item.files && item.files.length > 0) {
      // Preserve unsaved image files
      item.files = await Promise.all(item.files.map(async (file) => {
        if (file instanceof File) {
          const blob = await file.slice(0, file.size, file.type);
          return new File([blob], file.name, { type: file.type, lastModified: file.lastModified });
        }
        return null;
      })).then(files => files.filter(file => file !== null) as File[]);
      item.images = item.files.map(file => URL.createObjectURL(file));
    } else if (item.getAllCMSItemViews && item.getAllCMSItemViews[0]?.file instanceof File) {
      // Use CMS item file for unsaved images
      item.files = [await this.createCompleteDeepCopy(item.getAllCMSItemViews[0].file)];
      item.images = item.files.map(file => URL.createObjectURL(file));
    } else if (item.images && item.images.length > 0) {
      // Convert non-blob URLs for saved images
      item.files = await Promise.all(item.images.map(async (url, index) => {
        if (url && !url.startsWith('blob:')) {
          const fileName = this.extractFileNameFromUrl(url) || `image-${index}.jpg`;
          return await this.urlToFile(url, fileName);
        }
        return null;
      })).then(files => files.filter(file => file !== null) as File[]);
      item.images = item.files.map(file => URL.createObjectURL(file));
    } else {
      item.images = [];
      item.files = [];
    }
    
    if (item.getAllCMSItemViews) {
      item.getAllCMSItemViews.forEach((cmsItem, index) => {
        cmsItem.uniqueId = `${item.id}-image-${index}-${uniqueSuffix}`;
        cmsItem.url = item.images[index] || '';
        cmsItem.content = item.images[index] || '';
        cmsItem.file = item.files[index] || null;
      });
    }
  }

  async resetAudioProperties(item: PageElement, uniqueSuffix: string): Promise<void> {
    // Initialize properties
    item.fileName = null;
    item.audioFile = null;
    item.audioUrl = null;
    item.tempAudioUrl = null;
    item.blobUrl = null;

    if (item.file instanceof File) {
      // Copy unsaved audio file from item.file
      item.audioFile = await this.createCompleteDeepCopy(item.file);
      item.audioUrl = URL.createObjectURL(item.audioFile);
      item.tempAudioUrl = item.audioUrl;
      item.blobUrl = item.audioUrl;
    } else if (item.getAllCMSItemViews && item.getAllCMSItemViews[0]?.file instanceof File) {
      // Use CMS item file for unsaved audio
      item.audioFile = await this.createCompleteDeepCopy(item.getAllCMSItemViews[0].file);
      item.audioUrl = URL.createObjectURL(item.audioFile);
      item.tempAudioUrl = item.audioUrl;
      item.blobUrl = item.audioUrl;
    } else {
      // Handle saved audio (non-blob URLs)
      const sourceUrl = (item.audioUrl && !item.audioUrl.startsWith('blob:')) ? item.audioUrl :
                        (item.text && !item.text.startsWith('blob:')) ? item.text :
                        (item.content && !item.content.startsWith('blob:')) ? item.content :
                        (item.embedUrl && !item.embedUrl.startsWith('blob:')) ? item.embedUrl :
                        (item.getAllCMSItemViews && item.getAllCMSItemViews[0]?.url && !item.getAllCMSItemViews[0].url.startsWith('blob:')) ? item.getAllCMSItemViews[0].url : null;
      if (sourceUrl) {
        try {
          const fileName = this.extractFileNameFromUrl(sourceUrl) || `audio-${Date.now()}.wav`;
          item.audioFile = await this.urlToFile(sourceUrl, fileName);
          item.audioUrl = item.audioFile ? URL.createObjectURL(item.audioFile) : sourceUrl; // Preserve original URL if urlToFile fails
          item.tempAudioUrl = item.audioUrl;
          item.blobUrl = item.audioUrl;
          item.content = item.audioUrl; // Ensure content is set for getAudioUrl fallback
        } catch (error) {
          console.warn(`Failed to convert audio URL to file: ${sourceUrl}`, error);
          item.audioFile = null;
          item.audioUrl = sourceUrl; // Preserve original URL
          item.tempAudioUrl = sourceUrl;
          item.blobUrl = sourceUrl;
          item.content = sourceUrl; // Ensure content is set for getAudioUrl fallback
        }
      }
    }
    
    if (item.getAllCMSItemViews && item.getAllCMSItemViews[0]) {
      item.getAllCMSItemViews[0].uniqueId = `${item.id}-audio-${uniqueSuffix}`;
      item.getAllCMSItemViews[0].url = item.audioUrl || '';
      item.getAllCMSItemViews[0].content = item.audioUrl || '';
      item.getAllCMSItemViews[0].file = item.audioFile || null;
    }
  }

async urlToFile(url: string, fileName: string): Promise<File | null> {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      // this.notificationService.errorTopRight(`Failed to fetch media file from ${url}: ${response.statusText}`);
      return null;
    }
    const blob = await response.blob();
    if (!blob || blob.size === 0) {
      // this.notificationService.errorTopRight(`Failed to process media file from ${url}: Empty blob`);
      return null;
    }
    return new File([blob], fileName, { type: blob.type || this.getMimeType(fileName) });
  } catch (error) {
    // this.notificationService.errorTopRight(`Failed to fetch media file from ${url}`);
    return null;
  }
}

getMimeType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'mp4':
      return 'video/mp4';
    case 'wav':
      return 'audio/wav';
    case 'mp3':
      return 'audio/mpeg';
    default:
      return 'application/octet-stream';
  }
}

private clearSelection(): void {
  this.selectedElement = null;
  this.isEditingSection = -1;
  this.selectedItemIndex = -1;
  this.lastSelectedElement = null;
}



deleteSection(index: number) {
  if (this.sectionsArray.length > 1) {
    this.sectionsArray.splice(index, 1);
    this.showGridBlocks.splice(index, 1);
    this.alignmentGuides.splice(index, 1);
    if (this.isEditingSection === index) {
      this.isEditingSection = this.sectionsArray.length > 0 ? 0 : null;
      this.selectedElement = null;
      this.selectedItemIndex = null;
      this.containerPopup = false;
      this.editingSection = this.sectionsArray.length > 0;
    } else if (this.isEditingSection !== null && this.isEditingSection > index) {
      this.isEditingSection--;
    }
    this.markElementsAsModified();
    this.changeDetectorRef.detectChanges();
    this.notificationService.successTopRight('Section deleted successfully');
  } else {
    this.notificationService.errorTopRight('Cannot delete the last section. At least one section must remain.');
  }
}


  // Scroll to top
  scrollToTop(): void {
    if (this.scrollContainerItem && this.scrollContainerItem.nativeElement) {
      this.scrollContainerItem.nativeElement.scrollTop = 0;
    } else {
    }
  }


  getMaxZIndex(sectionIndex: number): number {
    return Math.max(0, ...this.sectionsArray[sectionIndex].items.map(item => item.zIndex));
  }

  getMinZIndex(sectionIndex: number): number {
    return Math.min(0, ...this.sectionsArray[sectionIndex].items.map(item => item.zIndex));
  }

  initializeZIndexValues(sectionIndex: number) {
    this.sectionsArray[sectionIndex].items.forEach((item, index) => {
      item.zIndex = item.zIndex || index + 1;
    });
  }

removeCurrentImage() {
  if (this.selectedElement) {
    this.selectedElement.images = null;
    // Also clear any associated files
    if (this.selectedElement.files) {
      this.selectedElement.files = [];
    }
  }
}

 cancelImageDialog(): void {
  this.showImageDialog = false;
  this.imageUrl = '';
  this.selectedFileName = null;

  if (this.selectedElement && this.originalElementState) {
    // Restore the original state
    this.selectedElement.images = this.originalElementState.images ? [...this.originalElementState.images] : [];
    this.selectedElement.files = this.originalElementState.files ? [...this.originalElementState.files] : [];
    this.selectedElement.fileName = this.originalElementState.fileName || null;
    this.selectedElement.blobUrl = this.originalElementState.blobUrl || null;
    this.selectedElement.file = this.originalElementState.file || null;
    this.selectedElement.modified = this.originalElementState.modified || false;
  }

  // Clean up blob URL if not used elsewhere
  if (this.selectedElement?.blobUrl?.startsWith('blob:')) {
    if (!this.sectionsArray.some(section => section.items.some(item => item.blobUrl === this.selectedElement.blobUrl))) {
      URL.revokeObjectURL(this.selectedElement.blobUrl);
    }
  }

  this.originalElementState = null; // Clear the stored state
  this.changeDetectorRef.detectChanges();
}
  saveImageContent(): void {
    if (!this.selectedElement || !this.imageUrl) {
      this.notificationService.errorTopRight('No image or element selected.');
      return;
    }

    const itemKey = `${this.selectedElement.id}`;
    if (this.blobUrls.has(itemKey) && this.blobUrls.get(itemKey) !== this.imageUrl) {
      URL.revokeObjectURL(this.blobUrls.get(itemKey));
      this.blobUrls.delete(itemKey);
    }

    this.selectedElement.images = [this.imageUrl];
    this.selectedElement.fileName = this.selectedFileName;
    this.selectedElement.text = this.hyperlinkUrl || ''; // Store hyperlink in text property
    this.blobUrls.set(itemKey, this.imageUrl);
    this.selectedElement.modified = true;
    this.selectedElement.isSavedToAPI = false;

    this.showImageDialog = false;
    this.imageUrl = null;
    this.selectedFileName = null;
    this.hyperlinkUrl = null; // Reset hyperlinkUrl
    this.hasUnsavedChanges = true;
    this.changeDetectorRef.detectChanges();
  }

  onImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) {
      return;
    }

    const file = input.files[0];
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      input.value = '';
      this.notificationService.errorTopRight('Only JPG, JPEG, and PNG formats are allowed');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      input.value = '';
      this.notificationService.errorTopRight('Image size should not exceed 5MB');
      return;
    }

    if (!this.selectedElement) {
      this.notificationService.errorTopRight('No element selected for image upload.');
      return;
    }

    // Revoke previous blob URL if it exists
    if (this.selectedElement.blobUrl && this.selectedElement.blobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.selectedElement.blobUrl);
    }

    this.selectedElement.files = [file];
    this.selectedElement.images = [];
    this.selectedFileName = file.name;
    this.imageUrl = URL.createObjectURL(file);
    this.selectedElement.blobUrl = this.imageUrl;
    this.selectedElement.images = [this.imageUrl];
    this.selectedElement.modified = true; // Mark as modified

    input.value = '';
    this.changeDetectorRef.detectChanges();
  }


deleteImage(): void {
  this.imageUrl = null;
  this.selectedFileName = null;
  if (this.selectedElement) {
    this.selectedElement.images = []; // Always use an array
    this.selectedElement.files = [];
    this.selectedElement.fileName = null;
    this.selectedElement.blobUrl = null;
    this.selectedElement.modified = true; // Mark as modified
  }
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
  this.changeDetectorRef.detectChanges();
}

 cropImage(item: PageElement, sectionIndex: number, itemIndex: number): void {
    if (!item || item.type !== 'image' || !item.images || !item.images[0]) {
      console.error('Selected element is not a valid image.');
      this.notificationService.errorTopRight('Selected element is not a valid image.');
      return;
    }

    this.croppingElement = item;
    this.originalElementState = {
      images: [...item.images],
      file: item.file,
      files: item.files ? [...item.files] : [],
      contentFileId: item.contentFileId,
      croppedWidth: item.croppedWidth,
      croppedHeight: item.croppedHeight
    };
    this.selectedItemIndex = itemIndex;
    this.isEditingSection = sectionIndex;
    this.imageLoaded = false;

    if (this.isUrl(item.images[0])) {
      fetch(item.images[0])
        .then((response) => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.blob();
        })
        .then((blob) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        })
        .then((base64Image) => {
          this.loadImageForCropping(base64Image);
        })
        .catch((error) => {
          console.error('Error fetching and converting image for cropper:', error);
          this.notificationService.errorTopRight('Error loading image for cropping.');
          this.resetCropperState();
        });
    } else {
      this.loadImageForCropping(item.images[0]);
    }
  }

  loadImageForCropping(base64Image: string): void {
    const img = new Image();
    img.onload = () => {
      const actualWidth = img.naturalWidth;
      const actualHeight = img.naturalHeight;

      this.cropperSettings = {
        ...this.cropperSettings,
        resizeToWidth: null,
        onlyScaleDown: true,
        containWithinAspectRatio: false
      };

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (ctx) {
        canvas.width = actualWidth;
        canvas.height = actualHeight;
        ctx.drawImage(img, 0, 0, actualWidth, actualHeight);
        const normalizedBase64 = canvas.toDataURL('image/png', 1.0);
        this.currentCropImage = normalizedBase64;
        this.showCropper = true;
        this.imageLoaded = true;
        console.log(`Image loaded for cropping: ${actualWidth}x${actualHeight}`);
      } else {
        console.error('Could not get canvas context');
        this.fallbackImageLoad(base64Image);
      }
    };

    img.onerror = () => {
      console.error('Error loading image for cropping');
      this.notificationService.errorTopRight('Error loading image for cropping.');
      this.fallbackImageLoad(base64Image);
    };

    img.src = base64Image;
  }

  fallbackImageLoad(base64Image: string): void {
    this.currentCropImage = base64Image;
    this.showCropper = true;
    this.imageLoaded = true;
  }

  isUrl(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch (_) {
      return false;
    }
  }

  applyCrop(sectionIndex: number, itemIndex: number): void {
    if (this.croppingElement && this.croppedImageResult) {
      const img = new Image();
      img.onload = () => {
        // Store dimensions
        this.croppingElement!.croppedWidth = img.naturalWidth;
        this.croppingElement!.croppedHeight = img.naturalHeight;

        // Update images and files
        this.croppingElement!.images = [this.croppedImageResult!];
        const timestamp = Date.now();
        const filename = `cropped-image-${timestamp}.png`;

        this.base64ToFiles(this.croppedImageResult!, filename)
          .then(file => {
            this.croppingElement!.files = [file]; // Update files array to match onImageUpload
            this.croppingElement!.file = file; // Maintain compatibility with original structure
            this.croppingElement!.fileName = filename;
            this.croppingElement!.needsReplacement = true;
            this.croppingElement!.oldContentFileId = this.originalElementState.contentFileId;
            this.croppingElement!.modified = true; // Mark as modified
            this.hasUnsavedChanges = true;
            this.markElementsAsModified();
            this.resetCropperState();
            this.changeDetectorRef.detectChanges();
        
          })
          .catch(err => {
            // console.error('Error converting cropped image to file:', err);
            // this.notificationService.errorTopRight('Error applying crop.');
            this.cancelCrop();
          });
      };
      img.onerror = () => {
        console.error('Error loading cropped image for dimensions');
        this.notificationService.errorTopRight('Error processing cropped image.');
        this.cancelCrop();
      };
      img.src = this.croppedImageResult;
    } else {
      console.warn('No cropping element or cropped result available');
      this.notificationService.errorTopRight('No image to crop.');
      this.cancelCrop();
    }
  }

  cancelCrop(): void {
    if (this.croppingElement && this.originalElementState) {
      this.croppingElement.images = this.originalElementState.images;
      this.croppingElement.file = this.originalElementState.file;
      this.croppingElement.files = this.originalElementState.files;
      this.croppingElement.contentFileId = this.originalElementState.contentFileId;
      this.croppingElement.needsReplacement = false;
      this.croppingElement.croppedWidth = this.originalElementState.croppedWidth;
      this.croppingElement.croppedHeight = this.originalElementState.croppedHeight;
    }
    this.resetCropperState();
  }

  onImageCropped(event: ImageCroppedEvent): void {
    this.croppedImageResult = event.base64;
  }

  async base64ToFiles(base64: string, filename: string): Promise<File> {
    try {
      const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
      const mimeType = base64.includes('data:') ? base64.split(';')[0].split(':')[1] : 'image/png';
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      return new File([blob], filename, { type: mimeType });
    } catch (error) {
      console.error('Error in base64ToFiles conversion:', error);
      this.notificationService.errorTopRight('Error converting cropped image.');
      const response = await fetch(base64);
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type });
    }
  }

  resetCropperState(): void {
    this.croppedImageResult = null;
    this.currentCropImage = null;
    this.originalElementState = null;
    this.croppingElement = null;
    this.showCropper = false;
    this.imageLoaded = false;
    this.selectedItemIndex = null;
    this.resetCropperSettings();
  }

  resetCropperSettings(): void {
    this.cropperSettings = {
      maintainAspectRatio: false,
      format: 'png',
      resizeToWidth: null,
      onlyScaleDown: true,
      roundCropper: false,
      alignImage: 'center',
      cropperMinWidth: 50,
      autoCrop: true,
      containWithinAspectRatio: true,
      cropperStaticWidth: undefined,
      cropperStaticHeight: undefined,
      imageQuality: 1,
      transform: {},
      canvasRotation: 0
    };
  }

  onCropperReady(): void {
    console.log('Cropper is ready');
  }

  onLoadImageFailed(): void {
    console.error('Failed to load image in cropper');
    this.resetCropperState();
  }

  
  // Add methods for carousel navigation
  nextImage(item: PageElement): void {
    if (item.images && item.images.length > 1) {
      if (item.currentIndex === undefined) {
        item.currentIndex = 0;
      }
      item.currentIndex = (item.currentIndex + 1) % item.images.length;
    }
  }
  
  prevImage(item: PageElement): void {
    if (item.images && item.images.length > 1) {
      if (item.currentIndex === undefined) {
        item.currentIndex = 0;
      }
      item.currentIndex = item.currentIndex === 0 ? item.images.length - 1 : item.currentIndex - 1;
    }
  }
  
 
  
  
  
  removeImage(index: number): void {
    if (this.selectedElement?.images) {
      this.selectedElement.images.splice(index, 1);
      
      // Update currentIndex if necessary
      if (this.selectedElement.currentIndex !== undefined && 
          this.selectedElement.currentIndex >= this.selectedElement.images.length) {
        this.selectedElement.currentIndex = Math.max(0, this.selectedElement.images.length - 1);
      }
      
      // Update content if we removed images
      if (this.selectedElement.images.length > 0) {
        this.selectedElement.content = this.selectedElement.images[0];
      } else {
        this.selectedElement.content = '';
        this.selectedElement.currentIndex = 0;
      }
    }
  }
  addAnotherImage(): void {
    // Save current image first if exists
    if (this.selectedElement && this.imageUrl) {
      // Initialize images array if it doesn't exist
      if (!this.selectedElement.images) {
        this.selectedElement.images = [];
      }
      
      // Add current image to the array
      this.selectedElement.images.push(this.imageUrl);
      
      // Set content to the first image for backward compatibility
      if (this.selectedElement.images.length === 1) {
        this.selectedElement.content = this.selectedElement.images[0];
        this.selectedElement.currentIndex = 0;
      }
    }
    
    // Reset the file input and keep dialog open
    this.imageUrl = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  saveEditorContent(sectionIndex: number, itemIndex: number) {
  const item = this.sectionsArray?.[sectionIndex]?.items?.[itemIndex];
  if (!item || (item.type !== 'text' && item.type !== 'greeting')) return;

  // Always ensure style exists (fixes undefined errors)
  if (!item.style) item.style = {};

  const itemEl = document.getElementById(`element-text-${sectionIndex}-${itemIndex}`) as HTMLElement | null;

  // Freeze height to avoid jump while saving
  if (itemEl) {
    itemEl.style.height = `${itemEl.offsetHeight}px`;
    itemEl.style.minHeight = `${itemEl.offsetHeight}px`;
  }

  const editorEl = document.querySelector('.home-text-editor .angular-editor-textarea[contenteditable="true"]');
  let rawHtml = (editorEl as HTMLElement)?.innerHTML ?? this.editorControl.value ?? '';

  const plainCheck = rawHtml.replace(/<[^>]+>/g, '').trim();
  if (!plainCheck) {
    this.notificationService.errorTopRight('Content cannot be empty.');
    if (itemEl) itemEl.style.height = itemEl.style.minHeight = 'auto';
    return;
  }

  // Greeting handling
  if (item.type === 'greeting') {
    const normalized = this.normalizeToGreetingPlaceholder(rawHtml);
    const visible = (html: string) =>
      new DOMParser().parseFromString(html, 'text/html').body.textContent?.trim().toLowerCase() || '';

    if (visible(normalized) !== visible(rawHtml)) {
      this.notificationService.errorTopRight('Greeting must match required template.');
      return;
    }

    item.text = normalized;
    item.content = normalized;
  } else {
    item.text = rawHtml;
    item.content = rawHtml;
  }

  // Detect content change
  const oldHtml = (item.lastSavedHtml || '').trim();
  const newHtml = item.text.trim();
  const contentChanged = oldHtml !== newHtml;
  item.lastSavedHtml = newHtml;

  const c = item.text;

  if (c.includes('text-align:center')) item.style.textAlign = 'center';
  else if (c.includes('text-align:right')) item.style.textAlign = 'right';
  else if (c.includes('text-align:justify')) item.style.textAlign = 'justify';
  else item.style.textAlign = 'left';

  if (itemEl) {
    itemEl.style.textAlign = item.style.textAlign || 'left';
  }

  // Default height
  if (!item.heightPercent || item.heightPercent < 5) item.heightPercent = 10;

  this.showCKEditor = false;
  this.markElementsAsModified?.();

  // Only adjust height if content actually changed
  if (this.isEditingSection !== null && contentChanged) {
    this.adjustTextElementHeight(item, this.isEditingSection, itemIndex);
    // Delay updateSectionHeights to allow adjustTextElementHeight to complete (uses requestAnimationFrame)
    setTimeout(() => this.updateSectionHeights(), 150);
  }

  this.changeDetectorRef?.detectChanges();

  // Restore auto height
  setTimeout(() => {
    if (itemEl) {
      itemEl.style.height = 'auto';
      itemEl.style.minHeight = 'auto';
    }
    this.changeDetectorRef?.detectChanges();
  }, 0);
}

  adjustTextElementHeight(item: PageElement, sectionIndex: number, itemIndex: number) {
  const realEl = document.getElementById(`element-text-${sectionIndex}-${itemIndex}`) as HTMLElement;
  if (!realEl) return;

  // ⏳ Wait for font/layout reflow
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {

      const clone = realEl.cloneNode(true) as HTMLElement;

      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.visibility = 'hidden';
      clone.style.height = 'auto';
      clone.style.minHeight = '0';
      clone.style.maxHeight = 'none';
      clone.style.overflow = 'visible';
      clone.style.lineHeight = 'normal';

      document.body.appendChild(clone);

      const pxHeight = clone.scrollHeight;

      document.body.removeChild(clone);

      if (!pxHeight) return;

      const vhUnit = window.innerHeight / 100;
      const newHeightPercent = pxHeight / vhUnit;

      const oldHeight = item.heightPercent || 0;
      if (Math.abs(newHeightPercent - oldHeight) < 0.5) return;

      item.heightPercent = Math.max(newHeightPercent, 5);

      // Grow section
      this.applySectionHeightVH(
        sectionIndex,
        this.getDynamicSectionHeight(sectionIndex)
      );

      this.changeDetectorRef.detectChanges();
    });
  });
}


isEmptyHTML(html: string): boolean {
  if (!html) return true;
  
  const textContent = html.replace(/<[^>]*>/g, '').trim();
  return textContent === '' || textContent === '&nbsp;';
}


trackBySection(index: number, section: any): any {
  return section.id || index;
}

trackByItem(index: number, item: any): any {
  return item.id || index;
}

getElementStyles(item: any): any {
  return {
    'width': item.widthPercent + '%',
    'height': item.heightPercent + '%',
    'top': item.yPercent + '%',
    'left': item.xPercent + '%',
    'z-index': item.zIndex,
    'border': this.selectedElement?.id === item.id ? '2px solid #3273dc' : 
              (this.hoveredElement?.id === item.id ? '1px solid #3273dc' : '1px solid transparent'),
    'box-shadow': this.selectedElement?.id === item.id ? '0 0 8px rgba(50, 115, 220, 0.5)' : 'none',
    'cursor': 'move',
    'user-select': 'none',
    'padding': '2px'
  };
}

getTextStyles(item: any): any {
  return {
    'width': '100%',
    'height': '100%',
    'padding': '8px',
    'overflow': 'hidden',
    'font-size.px': item.style?.fontSize || 14,
    'color': item.style?.color || '#000',
    'background-color': item.style?.backgroundColor || 'transparent',
    'font-weight': item.style?.bold ? 'bold' : 'normal',
    'font-style': item.style?.italic ? 'italic' : 'normal',
    'text-decoration': item.style?.underline ? 'underline' : 'none',
    'display': 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    'text-align': 'center',
    'line-height': '1.1',
    'word-wrap': 'break-word'
  };
}

// Helper method to extract raw HTML from SafeHtml
getRawHtml(content: string | SafeHtml): string {
    if (typeof content === 'string') {
        return content;
    }
    const safeValue = this.sanitizer.sanitize(SecurityContext.HTML, content);
    return safeValue || '';
}
getSafeHtml(content: string): SafeHtml {
  return this.sanitizer.bypassSecurityTrustHtml(content);
}
  saveHyperlink(): void {
    if (this.selectedElement) {
      this.selectedElement.hyperlink = this.hyperlinkUrl;
      this.showHyperlinkDialog = false;
      this.hyperlinkUrl = '';
    }
  }
  
  handleReadClick(notification: any): void {
    notification.isRead = !notification.isRead;
  }

  goToCourse(courseId: string, status: string): void {
    console.log(`Navigating to course ${courseId} with status ${status}`);
  }

openDeleteModal(type: 'element' | 'section', sectionIndex: number, itemIndex?: number) {
  this.deleteType = type;
  this.deleteSectionIndex = sectionIndex;
  this.deleteItemIndex = itemIndex !== undefined ? itemIndex : null;
  this.deleteDialogRef = this._matDialog.open(this.deleteConfirmation, {
    disableClose: true,
    panelClass: ['confirmation-dialog', 'high-z-index']
  });
}
closeChartEditorBeforeDelete(sectionIndex: number, itemIndex: number) {
  const item = this.sectionsArray[sectionIndex].items[itemIndex];
  if (item && (item['isEdit'] || item['showChartHeading'])) {
    item['isEdit'] = false;
    item['showChartHeading'] = false;
    this.changeDetectorRef.detectChanges();
  }
}


toggleDropdown(event: MouseEvent) {
  event.stopPropagation();
  this.showDropdown = !this.showDropdown;

  if (this.showDropdown) {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const parentEl = selection.getRangeAt(0).startContainer.parentElement as HTMLElement;

      if (parentEl) {
        const computedStyle = window.getComputedStyle(parentEl);
        const fontSize = parseInt(computedStyle.fontSize, 10);
        const foundSize = this.fontSizes.find(size => parseInt(size.name, 10) === fontSize);
        this.selectedFontSize = foundSize ? foundSize.name : null;
      }
    }
  }
}


@HostListener('document:click')
closeDropdown() {
  this.showDropdown = false;
}

@HostListener('document:mouseup')
onGlobalMouseUp() {
  this.isCanvasDragging = false;
  this.isHueDragging = false;
}

@HostListener('document:mousemove', ['$event'])
onGlobalMouseMove(event: MouseEvent) {
  if (this.isCanvasDragging && this.activeColorPicker) {
    this.updateCanvasColorGlobal(event);
  }
  if (this.isHueDragging && this.activeColorPicker) {
    this.updateHueColorGlobal(event);
  }
}

updateCanvasColorGlobal(event: MouseEvent) {
  const canvas = document.querySelector(this.activeColorPicker === 'text' ? '.custom-color-picker:first-of-type .color-canvas' : '.custom-color-picker:last-of-type .color-canvas') as HTMLElement;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
  const y = Math.max(0, Math.min(event.clientY - rect.top, rect.height));
  const s = (x / rect.width) * 100;
  const v = 100 - (y / rect.height) * 100;
  
  if (this.activeColorPicker === 'text') {
    this.textColorHsv.s = s;
    this.textColorHsv.v = v;
    this.updateTextColorFromHsv();
  } else {
    this.bgColorHsv.s = s;
    this.bgColorHsv.v = v;
    this.updateBgColorFromHsv();
  }
}

updateHueColorGlobal(event: MouseEvent) {
  const slider = document.querySelector(this.activeColorPicker === 'text' ? '.custom-color-picker:first-of-type .hue-slider' : '.custom-color-picker:last-of-type .hue-slider') as HTMLElement;
  if (!slider) return;
  const rect = slider.getBoundingClientRect();
  const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
  const h = (x / rect.width) * 360;
  
  if (this.activeColorPicker === 'text') {
    this.textColorHsv.h = h;
    this.updateTextColorFromHsv();
  } else {
    this.bgColorHsv.h = h;
    this.updateBgColorFromHsv();
  }
}

initEditorListeners() {
  // Removed all automatic updates - font size and family only change on manual selection
}

updateSelectedFont(): void {
  try {
    if (this.suppressFontSizeUpdate) {
      return;
    }

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    let node: HTMLElement | null = range.startContainer as HTMLElement;

    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement;
    }

    if (!node) return;

    let currentEl: HTMLElement | null = node;
    let foundFontSize: string | null = null;
    let foundHeadingName: string | null = null;

    while (currentEl && currentEl.tagName !== 'DIV') {
      // Check for inline font-size style first (our new approach)
      if (!foundFontSize && currentEl.style.fontSize) {
        foundFontSize = this.getFontSizeFromPx(currentEl.style.fontSize);
      }
      
      // Check computed style as fallback
      if (!foundFontSize) {
        const computed = window.getComputedStyle(currentEl);
        if (computed.fontSize) {
          foundFontSize = this.getFontSizeFromPx(computed.fontSize);
        }
      }
      
      // Match font size to heading
      if (!foundHeadingName && foundFontSize) {
        const fontSize = parseInt(foundFontSize, 10);
        const matchedHeading = this.headings.find(h => {
          const headingSize = parseInt(h.fontSize, 10);
          return Math.abs(headingSize - fontSize) <= 2;
        });
        if (matchedHeading) {
          foundHeadingName = matchedHeading.name;
        }
      }
      
      currentEl = currentEl.parentElement;
    }
    
    if (foundFontSize) {
      this.selectedFontSize = foundFontSize;
    }

    if (foundHeadingName) {
      this.selectedHeading = foundHeadingName;
    } else {
      this.selectedHeading = null;
    }

    const span = node.closest('span') as HTMLElement | null;
    const fam = window.getComputedStyle(span || node).fontFamily.replace(/['"]|/g, "");
    this.selectedFontFamily = fam || "HelveticaNeuelight";

  } catch (err) {
    }
}



confirmDelete() {
  if (this.deleteType === 'element' && this.deleteSectionIndex !== null && this.deleteItemIndex !== null) {
    this.deleteElements(this.deleteSectionIndex, this.deleteItemIndex);
  }
  if (this.deleteType === 'section' && this.deleteSectionIndex !== null) {
    this.deleteSection(this.deleteSectionIndex);
  }
  this.closeModal();
}

closeModal() {
  if (this.deleteDialogRef) {
    this.deleteDialogRef.close();
  }
  this.deleteSectionIndex = null;
  this.deleteItemIndex = null;
}


onCancelHeading(sectionIndex: number, itemIndex: number, item: any) {
  const sectionItem = this.sectionsArray[sectionIndex].items[itemIndex];

  if (this.headingObject?.isChart) {
    if (this.headingObject.heading?.trim()) {
      sectionItem.chartHeading = this.headingObject.heading;
    }
    sectionItem['showChartHeading'] = false;
  } else {
    if (this.headingObject.heading?.trim()) {
      sectionItem.text = this.headingObject.heading;
    }
    sectionItem['showTextHeading'] = false;
    sectionItem['showIFrame'] = false;
  }

  this.disableDrag = false;
  this.markElementsAsModified();
}


editHeading(isChart: boolean, value: string) {
  this.headingObject = {
    isChart: isChart,
    heading: value ? value.toString() : '' // clone the string, avoid reference
  };
 this.editorTempText = value || '';

}

private getEditorHtml(): string {
  const editorEl = document.querySelector(
    '.angular-editor-textarea[contenteditable="true"]'
  ) as HTMLElement | null;

  return editorEl?.innerHTML ?? this.editorTempText ?? '';
}


editorduplicateInstance = null;

onEditorReady(editor: any, text) {
  this.editorduplicateInstance = editor.editor;
  this.editorduplicateInstance.on('change', () => {
    this.refreshToolbar();
  });
  this.editorduplicateInstance.on('selectionChange', () => {
    this.refreshToolbar();
  });
  this.editorduplicateInstance.editable().on('click', () => {
    this.refreshToolbar();
  });
  let savedRanges: any = null;
  this.editorduplicateInstance.on('dialogShow', function (evt: any) {
    const editor = evt.editor;
    const dialog = evt.data;
    
    if (dialog._.name === 'colordialog') {
      const selection = editor.getSelection();
      savedRanges = selection.getRanges();
      dialog.on('show', function () {
        if (savedRanges) {
          const editor = dialog.getParentEditor();
          editor.focus();
          editor.getSelection().selectRanges(savedRanges);
        }
      });

      dialog.on('ok', function () {
        const editor = dialog.getParentEditor();
        if (savedRanges) {
          editor.focus();
          editor.getSelection().selectRanges(savedRanges);
          
          const selectedColor = dialog.getContentElement('picker', 'selectedColor')?.getValue();
          console.log('selectedColor', selectedColor);
          if (selectedColor) {
            editor.getSelection().selectRanges(savedRanges);
            editor.execCommand(selectedColor);
          }
        }

        savedRanges = null;
      });
    }
  });


  setTimeout(() => {
    if(text) {
      editor.editor.focus();
      editor.editor.setData(text)
      editor.editor.selectionChange()
    }
  }, 50);
}
refreshToolbar(): void {
  if (!this.editorduplicateInstance) return;
  this.editorduplicateInstance.selectionChange()
}

isValidVideoUrls(url: string): boolean {
  if (!url || url.trim() === '') {
    return false;
  }

  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)/;
  
  const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/\d+/;
  
  return youtubeRegex.test(url) || vimeoRegex.test(url);
}

getEmbedUrl(url: string): string {
  if (!url) return '';
  
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1].split('&')[0];
    }
    
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  if (url.includes('vimeo.com')) {
    const videoId = url.split('vimeo.com/')[1].split('?')[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }
  
  return url;
}


  toggle(value) {
    this.isOn = value;
  }
  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }
 toggleEditingSection() {
    this.editingSection = !this.editingSection;
  }

  addNewSections() {
    this.sectionEditForm.reset();
    this.prIndex = null;
    this.showSectionEditForm = true;
  }

  editSectionTitle(index: number, section: any) {
    this.prIndex = index;
    this.sectionEditForm.setValue({ title: section.title });
    this.showSectionEditForm = true;
  }

  saveSectionTitle() {
  if (this.sectionEditForm.invalid) {
    this.notificationService.errorTopRight('Section title is required.');
    return;
  }
  const title = this.sectionEditForm.value.title.trim();
  if (this.prIndex !== null) {
    // Edit existing section
    this.prItems[this.prIndex].title = title;
  } else {
    // Add new section
    this.prItems.push({
      title: title,
      items: []
    });
    this.notificationService.successTopRight('Section added successfully.');
  }
  this.showSectionEditForm = false;
  this.changeDetectorRef.detectChanges();
}

  createDeleteSectionPopup(index: number, template: TemplateRef<any>) {
    this.deleteSectionIndex = index;
    this.modalReference = this._matDialog.open(template);
  }

  confirmDeleteSection() {
    if (this.deleteSectionIndex !== null) {
      const section = this.prItems[this.deleteSectionIndex];
      if (section.items.length > 0) {
        this.notificationService.errorTopRight('Cannot delete a section with items. Please remove all items first.');
        this.closeModel();
        return;
      }
      this.prItems.splice(this.deleteSectionIndex, 1);
      this.notificationService.successTopRight('Section deleted successfully.');
      this.closeModel();
      this.changeDetectorRef.detectChanges();
    }
  }

  addNewPrItem(index, item) {
    this.prAddFrom = this._formbuilder.group({
      title: new FormControl('', Validators.required),
      url: new FormControl(''),
      fileName: '',
    });
    this.sectionEditForm = this._formbuilder.group({
      title: new FormControl('', Validators.required)
    });
    this.prIndex = index;
    this.prFile = null;
    this.prItemIndex = null;

    this.showPRAddFrom = true
  }
  isAllowedIframeUrl(url: string): boolean {
    if (!url) return false;

    try {
      const trimmedUrl = url.trim();
      const parsedUrl = new URL(trimmedUrl);
      const hostname = parsedUrl.hostname;

      return (
        hostname === 'www.corporate.kohler.com'
      );
    } catch (e) {
      // Invalid URL format
      return false;
    }
  }
  onSavePrItems() {
    // === Validate Title ===
    if (this.prAddFrom.invalid) {
      return this.notificationService.errorTopRight('Title field is mandatory.');
    }

    let iframeUrl = this.prAddFrom.value.url?.trim();

    // === Auto-add https if missing ===
    if (iframeUrl && iframeUrl.startsWith('www.') && !iframeUrl.startsWith('http')) {
      iframeUrl = 'https://' + iframeUrl;
    }

    this.prAddFrom.get('url')?.setValue(iframeUrl);

    // === URL validation ===
    const urlPattern = /^(https?:\/\/|www\.)[^\s/$.?#].[^\s]*$/i;
    const isValidUrlFormat = urlPattern.test(iframeUrl);

    const lowerUrl = iframeUrl?.toLowerCase() || '';
    const invalidSources = ['youtube.com', 'youtu.be', '.doc', '.docx', '.xls', '.xlsx'];
    const containsInvalidSource = invalidSources.some(src => lowerUrl.includes(src));

    if (iframeUrl && (!isValidUrlFormat || containsInvalidSource)) {
      this.notificationService.errorTopRight('Please provide a valid URL (No YouTube or document links allowed).');
      return;
    }

    // === EDIT MODE ===
    if (this.prItemIndex !== null && +this.prItemIndex >= 0) {
      let contentUrl = this.prAddFrom.value.url?.trim() || '';
      const existingItem = this.prItems[this.prIndex].items[this.prItemIndex];

      // ✅ FIX: Allow save if existing file or URL already present
      if (contentUrl || this.prFile || existingItem.blobUrl || existingItem.content) {
        // Clean old blob URL
        if (existingItem.url && existingItem.url.startsWith('blob:')) {
          URL.revokeObjectURL(existingItem.url);
        }

        const updatedItem = {
          ...existingItem,
          title: this.prAddFrom.value.title,
          content: contentUrl || existingItem.content || '',
          fileName: this.prAddFrom.value.fileName || existingItem.fileName || '',
          url: this.prFile ? URL.createObjectURL(this.prFile) : existingItem.url,
          file: this.prFile || existingItem.file,
          blobUrl:
            this.prFile
              ? URL.createObjectURL(this.prFile)
              : contentUrl || existingItem.blobUrl || '',
          position: this.prItemIndex
        };

        this.prItems[this.prIndex].items[this.prItemIndex] = updatedItem;

        const fileExtension = updatedItem.fileName?.split('.').pop()?.toLowerCase();
        if (!['xlsx', 'xls', 'csv', 'docx'].includes(fileExtension)) {
          this.handleLinkChange(updatedItem.blobUrl);
        } else {
          this.iframeSrc = null;
        }

        this.showPRAddFrom = false;
        this.notificationService.successTopRight('Saved Successfully');
      } else {
        this.notificationService.errorTopRight('File or URL is mandatory to be filled.');
      }

      // === ADD MODE ===
    } else {
      let contentUrl = this.prAddFrom.value.url?.trim() || '';

      if (contentUrl || this.prFile) {
        const newItem = {
          title: this.prAddFrom.value.title,
          content: contentUrl || '',
          url: this.prFile ? URL.createObjectURL(this.prFile) : contentUrl,
          file: this.prFile || null,
          fileName: this.prAddFrom.value.fileName,
          blobUrl: this.prFile
            ? URL.createObjectURL(this.prFile)
            : contentUrl || null,
          position: this.prItems[this.prIndex].items.length
        };

        this.prItems[this.prIndex].items.push(newItem);

        const fileExtension = newItem.fileName?.split('.').pop()?.toLowerCase();
        if (!['xlsx', 'xls', 'csv', 'docx'].includes(fileExtension)) {
          this.handleLinkChange(newItem.blobUrl);
        } else {
          this.iframeSrc = null;
        }

        this.showPRAddFrom = false;
        this.notificationService.successTopRight('Saved Successfully');
      } else {
        this.notificationService.errorTopRight('File or URL is mandatory to be filled.');
      }
    }

    // === Cleanup ===
    this.prFile = null;
    this.prAddFrom.reset();
  }


  editPrItem(index, itemIndex, item) {
    this.prIndex = index;
    this.prItemIndex = +itemIndex;
    this.prAddFrom = this._formbuilder.group({
      title: new FormControl(item.title, Validators.required),
      url: new FormControl(item.content),
      fileName: item.fileName,
    })
    this.showPRAddFrom = true;
  }
  onUrlInput(): void {
    let url = this.prAddFrom.get('url')?.value?.trim();

    this.blockedContentHtml = null;
    this.showIframe = false;
    this.iframeSrc = null;

    if (!url) {
      this.clearFileInput(); // Clears file state if URL input is emptied
      return;
    }

    if (url.startsWith('www.') && !url.startsWith('http')) {
      url = 'https://' + url;
      this.prAddFrom.get('url')?.setValue(url);
    }

    // 2. Clear file input as URL takes precedence
    this.clearFileInput();

    try {

    
      if (url === this.KOHLER_WARRANTY_URL) {
        this.setBlockedContent(url);
      } else {
        // DEFAULT: Treat as Allowed URL
        this.showIframe = true;
        this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      }

    } catch (e) {
      console.warn('URL validation failed, treating as potential file/PDF path:', url);

      // Assume it's a valid internal file/PDF path and try to load it in the iframe
      this.showIframe = true;
      this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }

handleLinkChange(url: string) {
  this.selectedItemUrl = url; // Track the selected URL (KEEP THIS)
  this.showIframe = false;
  this.blockedContentHtml = null;

  if (!url) {
    this.iframeSrc = null;
    this.selectedItemUrl = null; // Reset selection if no URL (KEEP THIS)
    this.changeDetectorRef.detectChanges();
    return;
  }

  if (url.startsWith('www.') && !url.startsWith('http')) {
    url = 'https://' + url;
  }

  if (this.iframeSrc && typeof this.iframeSrc === 'string' && this.iframeSrc.startsWith('blob:')) {
    URL.revokeObjectURL(this.iframeSrc as string);
  }

  const isBlobUrl = url.startsWith('blob:');
  let fileExtension = '';
  let fileName = '';

  if (isBlobUrl) {
    const item = this.prItems.flatMap(section => section.items).find(i => i.blobUrl === url);
    fileExtension = item?.fileName?.split('.').pop()?.toLowerCase() || '';
    fileName = item?.fileName || item?.title || 'download';
  } else {
    fileExtension = url.split('.').pop()?.toLowerCase() || '';
    fileName = url.split('/').pop() || 'download';
  }

  const nonRenderableExtensions = ['xlsx', 'xls', 'csv', 'docx'];

  if (nonRenderableExtensions.includes(fileExtension) && isBlobUrl) {
    this.iframeSrc = null;
    // ❌ REMOVE: this.selectedItemUrl = null;
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.changeDetectorRef.detectChanges();
    return;
  }

  try {
    const isWebUrl = url.startsWith('http');

    if (isWebUrl) {
      if (url === this.KOHLER_WARRANTY_URL) {
        this.setBlockedContent(url);
        this.iframeSrc = null;
        // ❌ REMOVE: this.selectedItemUrl = null;
        this.changeDetectorRef.detectChanges();
        return;
      }
    }
  } catch (e) {}

  this.showIframe = true;
  this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  this.changeDetectorRef.detectChanges(); // Ensure UI updates
}

  onPRFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const allowedTypes = [
      'application/pdf', // PDF
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
      'application/vnd.ms-excel', // XLS
      'text/csv', // CSV
    ];

    if (!allowedTypes.includes(file.type)) {
      this.notificationService.errorTopRight('Only .pdf, .docx, .xlsx, .xls, and .csv files are allowed.');
      input.value = ''; // Reset input
      return;
    }

    this.prFile = file;

    input.value = '';
    // 1. Clear the URL input, as the file takes precedence
    this.prAddFrom.get('url')?.setValue('');
    // 2. Set the file name in the form for display
    this.prAddFrom.get('fileName')?.setValue(this.prFile.name);

    // 3. GENERATE BLOB URL AND TRIGGER PREVIEW LOGIC
    const blobUrl = URL.createObjectURL(file);
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension === 'pdf' || fileExtension === 'docx') {
      this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
    } else {
      this.iframeSrc = null;
    }

    // Handle Excel/CSV files if needed (e.g., parse with SheetJS)
    if (['xlsx', 'xls', 'csv'].includes(fileExtension)) {
      this.handleExcelOrCsv(file);
    }

    console.log('Selected file:', this.prFile);
  }
  private clearFileInput(): void {
    this.prFile = null;
    this.prAddFrom.get('fileName')?.setValue('');
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  private setBlockedContent(url: string): void {
    this.blockedContentHtml = `
      <div class="p-4 bg-gray-50 border border-gray-200 rounded-lg">
       <p class="mb-4">
          This content cannot be previewed (likely due to security policies of the source site).
        </p>
        <a href="${url}" target="_blank" class="text-blue-600 hover:text-blue-800 font-medium underline">
          Click Here to Open the Link
        </a>
      </div>
    `;
  }
  handleExcelOrCsv(file: File): void {
    // Optional: Parse Excel/CSV files using SheetJS
    import('xlsx').then((XLSX) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        // Example: Log parsed data or store it for further use
        console.log('Parsed Excel/CSV:', workbook);

      };
      reader.readAsBinaryString(file);
    }).catch((error) => {
      console.error('Error loading SheetJS:', error);
      this.notificationService.errorTopRight('Failed to process Excel/CSV file.');
    });
  }

  createdeletePrItemPopup(prIndex: number, prItemIndex: number, content: TemplateRef<any>) {
  this.deletePRIndex = prIndex;
  this.deletePRItemIndex = prItemIndex;
  this.modalReference = this._matDialog.open(content);
}
confirmDeletePrItem() {
  const deletedItem = this.prItems[this.deletePRIndex]?.items[this.deletePRItemIndex];

  // Remove item
  this.removePrItem(this.deletePRIndex, this.deletePRItemIndex);

  // Fix: Check if deleted blobUrl matches current iframeSrc
  const currentUrl = (this.iframeSrc as any)?.changingThisBreaksApplicationSecurity;
  if (deletedItem?.blobUrl && currentUrl === deletedItem.blobUrl) {
    const nextItem = this.findNextVisiblePrItem();
    this.iframeSrc = nextItem ? this.sanitizer.bypassSecurityTrustResourceUrl(nextItem.blobUrl) : null;
  }

  this.closeModel();
  console.log(this.iframeSrc);
}
findNextVisiblePrItem(): any | null {
  for (const section of this.prItems) {
    const item = section.items?.find(i => !i.isDeleted);
    if (item) return item;
  }
  return null;
}


closeModelsf() {
  if (this.modalReference) {
    this.modalReference.close();
  }
}
 removePrItem(prIndex: number, prItemIndex: number): void {
  if (this.prItems?.[prIndex]?.items?.length > prItemIndex) {
    this.prItems[prIndex].items.splice(prItemIndex, 1);
    this.notificationService.successTopRight('Item deleted successfully');
  }
}

  faqs = [];
  faqObj = null;
  showFaqDialog = false

addFaq() {
  this.faqs.push({
    question: ``,
    answer: ``
  });

  // ✅ Wait for DOM + layout
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const el = this.faqEditContainer?.nativeElement;
      if (el) {
        el.scrollTo({
          top: el.scrollHeight,
          behavior: 'smooth'
        });
      }
    });
  });
}

 editQuestion(type, index, value) {
  this.faqObj = {
    type,
    index,
    value: value || ''
  };

  // Detect font-family and font-size from existing content, or use defaults
  if (value) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = value;
    
    // Look for font-family in inline styles
    const styledEl = tempDiv.querySelector('[style*="font-family"]') as HTMLElement;
    if (styledEl && styledEl.style.fontFamily) {
      this.selectedFontFamily = styledEl.style.fontFamily.replace(/['"]/g, '').split(',')[0].trim();
    } else {
      this.selectedFontFamily = type === 'ques' ? 'HelveticaNeueBold' : 'HelveticaNeueLight';
    }
    
    // Look for font-size in inline styles
    const sizedEl = tempDiv.querySelector('[style*="font-size"]') as HTMLElement;
    if (sizedEl && sizedEl.style.fontSize) {
      this.selectedFontSize = parseInt(sizedEl.style.fontSize, 10).toString();
    } else {
      this.selectedFontSize = '14';
    }
  } else {
    // No content - use defaults
    this.selectedFontFamily = type === 'ques' ? 'HelveticaNeueBold' : 'HelveticaNeueLight';
    this.selectedFontSize = '14';
  }
  
  this.selectedHeading = null;

  this.showFaqDialog = true;

  setTimeout(() => {
    this.forceFontOnEditor(type);
  }, 150);
}

initFaqEditor(type: 'ques' | 'ans') {
  const editor = document.querySelector('.editor-dialog .angular-editor-textarea') as HTMLElement;
  if (!editor) return;

  // Apply font family to editor container
  const fontFamily = type === 'ques' ? 'HelveticaNeueBold' : 'HelveticaNeueLight';
  editor.style.fontFamily = fontFamily;

  if (type === 'ques') {
    // For Question: Always ensure bold is active
    const currentContent = editor.innerHTML?.trim();
    const hasContent = currentContent && currentContent !== '<p><br></p>' && currentContent !== '<br>' && currentContent !== '';
    
    if (hasContent) {
      // If content exists, wrap it in bold if not already
      if (!editor.innerHTML.includes('<b>') && 
          !editor.innerHTML.includes('<strong>') &&
          !editor.innerHTML.includes('font-weight: bold') &&
          !editor.innerHTML.includes('font-weight:bold')) {
        // Wrap existing content in bold
        editor.innerHTML = `<p><b>${editor.innerText}</b></p>`;
      }
    } else {
      // No content - create empty bold paragraph with zero-width space
      editor.innerHTML = '<p><b>\u200B</b></p>';
    }
    
    // Focus editor first
    editor.focus();
    
    // Position cursor inside the bold tag and trigger selection change
    const boldEl = editor.querySelector('b, strong');
    if (boldEl) {
      const sel = window.getSelection();
      const range = document.createRange();
      
      // Select inside the bold element
      if (boldEl.firstChild) {
        range.setStart(boldEl.firstChild, boldEl.firstChild.textContent?.length || 0);
        range.setEnd(boldEl.firstChild, boldEl.firstChild.textContent?.length || 0);
      } else {
        range.selectNodeContents(boldEl);
        range.collapse(false);
      }
      
      sel?.removeAllRanges();
      sel?.addRange(range);
      
      // Dispatch events to trigger toolbar update
      editor.dispatchEvent(new Event('focus', { bubbles: true }));
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      document.dispatchEvent(new Event('selectionchange'));
    }
    
  } else {
    // For Answer: Normal text
    editor.focus();
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
  }
}
forceFontOnEditor(type: 'ques' | 'ans') {
  const editor = document.querySelector('.editor-dialog .angular-editor-textarea') as HTMLElement;
  if (!editor) return;

  // Apply font family to editor container
  const fontFamily = type === 'ques' ? 'HelveticaNeueBold' : 'HelveticaNeueLight';
  editor.style.fontFamily = fontFamily;

  // Focus editor first
  editor.focus();

  // Check if content already has formatting
  const hasHtmlContent = editor.innerHTML.includes('<span') || 
                          editor.innerHTML.includes('style=') || 
                          editor.innerHTML.includes('<font') ||
                          editor.innerHTML.includes('<b>') ||
                          editor.innerHTML.includes('<strong>');
  
  if (hasHtmlContent) {
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
    return;
  }

  const text = editor.innerText?.trim() || '';

  if (type === 'ques') {
    editor.innerHTML = '<p><br></p>';
    
    const sel = window.getSelection();
    const range = document.createRange();
    const pEl = editor.querySelector('p');
    if (pEl) {
      range.selectNodeContents(pEl);
      range.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
    
    document.execCommand('bold', false, null);
    
    if (text) {
      document.execCommand('insertText', false, text);
    }
  } else {
    if (text) {
      editor.innerHTML = `<p>${text}</p>`;
    }
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
  }
}

applyTypingFont(type: 'ques' | 'ans') {
  const editor = document.querySelector('.angular-editor-textarea') as HTMLElement;
  if (!editor) return;

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);

  if (!editor.innerHTML || editor.innerHTML === '<p><br></p>') {
    // For question: start with bold, for answer: normal text
    if (type === 'ques') {
      editor.innerHTML = `<p><b>&nbsp;</b></p>`;
    } else {
      editor.innerHTML = `<p>&nbsp;</p>`;
    }
  }

  const span = editor.querySelector('span');
  if (span) {
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    newRange.collapse(false);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }
}


  applyDefaultFont() {
    const editorIframe = document.querySelector('.angular-editor-textarea') as HTMLElement;
    if (editorIframe) {
      editorIframe.style.fontFamily = this.selectedFontFamily;
    }

    try {
    } catch (e) {
      console.warn('Could not apply default font:', e);
    }
  }

 saveFaqEdit() {
  // Get latest content directly from the DOM editor
  const editorEl = document.querySelector(
    '.editor-dialog .angular-editor-textarea[contenteditable="true"]'
  ) as HTMLElement | null;

  let latestHtml = editorEl?.innerHTML ?? this.faqObj.value ?? '';
  let value = latestHtml?.trim();

  if (!value || !this.stripHtmlTags(value).trim()) {
    this.notificationService.errorTopRight('Value cannot be blank.');
    return;
  }

  // Process HTML to ensure font-family is present in elements that need it
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = value;
  
  const defaultFontFamily = this.faqObj.type === 'ques' ? 'HelveticaNeueBold' : 'HelveticaNeueLight';
  
  // Helper function to check if any ancestor has font-family set
  const hasAncestorWithFontFamily = (el: HTMLElement): boolean => {
    let parent = el.parentElement;
    while (parent && parent !== tempDiv) {
      if (parent.style.fontFamily) {
        return true;
      }
      parent = parent.parentElement;
    }
    return false;
  };
  
  // Find all text-containing elements and ensure they have font-family
  const allTags = tempDiv.querySelectorAll('b, strong, span, p');
  allTags.forEach((tag: HTMLElement) => {
    // Only add font-family if the element AND its ancestors don't have it
    if (!tag.style.fontFamily && !hasAncestorWithFontFamily(tag)) {
      tag.style.fontFamily = defaultFontFamily;
    }
  });
  
  // If the root content doesn't have styling, wrap it
  if (tempDiv.children.length === 0 || 
      (tempDiv.children.length === 1 && tempDiv.children[0].tagName === 'P' && !tempDiv.querySelector('[style*="font-family"]'))) {
    const plainText = tempDiv.textContent || '';
    if (this.faqObj.type === 'ques') {
      tempDiv.innerHTML = `<p><b style="font-family: ${defaultFontFamily}; font-weight: bold;">${plainText}</b></p>`;
    } else {
      tempDiv.innerHTML = `<p style="font-family: ${defaultFontFamily};">${plainText}</p>`;
    }
  }
  
  value = tempDiv.innerHTML;

  if (this.faqObj.type === 'ques') {
    this.faqs[this.faqObj.index].question = value;
  } else {
    this.faqs[this.faqObj.index].answer = value;
  }

  this.showFaqDialog = false;
}




  deleteFaq(index) {
    this.faqs.splice(index, 1);
  }
  moveFaqUp(index: number) {
    if (index > 0) {
      const temp = this.faqs[index];
      this.faqs[index] = this.faqs[index - 1];
      this.faqs[index - 1] = temp;
    }
  }

  moveFaqDown(index: number) {
    if (index < this.faqs.length - 1) {
      const temp = this.faqs[index];
      this.faqs[index] = this.faqs[index + 1];
      this.faqs[index + 1] = temp;
    }
  }
  duplicateFaq(index: number) {
    const original = this.faqs[index];
    const duplicate = JSON.parse(JSON.stringify(original));
    this.faqs.splice(index + 1, 0, duplicate);
  }
  getDisplayName = (type: string): string => {
    const map: { [key: string]: string } = {
      TOU: 'termsofuse',
      CU: 'Contact Us',
      PP: 'Privacy Policy',
      FAQ: 'FAQ',
      NT: 'Notifications',
      AC: 'Academy',
      PR: 'Program Rules',
      TR: 'Transactions',
      FD: 'Feedback',
      All: 'All',
      Messages: 'Messages',
      Credit: 'Credit',
      Redemptions: 'Redemptions'
    };
    return map[type] || type;
  };

  getVisibleItems(items: any[]) {
    return items.filter(i => !i.isDeleted);
  }

  get sectionContainerStyles(): { [key: string]: string } {
    const baseStyles: { [key: string]: string } = {
      height: '100%',
      width: '100%',
      'overflow-y': 'auto !important',
    };
  
    const isMobile = this.mobileView || this.screenWidth < 768;
  
    const paddedMenus = ['AC', 'CU', 'TOU', 'PP', 'NT', 'FAQ'];
  
    if (paddedMenus.includes(this.selectedMenuId)) {
      const paddedBase: { [key: string]: string } = {
        ...baseStyles,
        'padding-left': isMobile ? '16px' : '96px',
        'padding-right': isMobile ? '16px' : '96px',
      };

      if (!isMobile && (this.selectedMenuId === 'AC' || this.selectedMenuId === 'CU')) {
        delete paddedBase.height;
      }     
      if (this.selectedMenuId === 'FAQ') {
        delete paddedBase['backgroundColor'];
        delete paddedBase['box-shadow'];
        delete paddedBase['border'];
      }
      
      
      if (['TOU', 'PP', 'NT'].includes(this.selectedMenuId)) {
        paddedBase['border-radius'] = isMobile ? '0' : '12px';
      }
  
      return paddedBase;
    }
    
  
    if (this.selectedMenuId === 'FD') {
      return {
        height: isMobile ? 'auto' : '100%',
        width: '100%',
        paddingLeft: isMobile ? '16px' : '96px',
        paddingRight: isMobile ? '16px' : '96px',
        overflowY: 'auto',
        position: 'relative',
      };
    }
  
    if (this.selectedMenuId === 'PR' || this.selectedMenuId === 'TR') {
      return {
        ...baseStyles,
        'padding-top': '40px',
        'padding-left': isMobile ? '16px' : '96px',
        'padding-right': isMobile ? '16px' : '96px',
      };
    }
  
    return {
      ...baseStyles,
      padding: isMobile ? '16px' : '30px',
      'padding-top': '40px',
    };
  }
  
  
  updateScreenWidth() {
    this.screenWidth = window.innerWidth;
  }
  isFaqStyleDisabled(): boolean {
    return this.selectedMenuId === 'FAQ';
  }
  isAlwaysWhiteBackground(): boolean {
  return this.selectedMenuId === 'PP' || this.selectedMenuId === 'TOU';
}
  onPreviewDraft(draft: any): void {
    const draftId = draft?.id;
    const parentMenuId = draft?.parentMenuId;

    if (!draftId || !parentMenuId) {
      console.warn('Cannot preview draft. Missing draftId or parentMenuId.');
      return;
    }
    let previewUrl: string;
    if (parentMenuId == 'AC') {
      previewUrl = `/IncentiveWeb/academy-curriculums?isPreview=true&draftId=${draftId}`;

    }
    else {
      const routeName = this.getDisplayName(parentMenuId)
        .toLowerCase()
        .replace(/\s+/g, '-');
      previewUrl = `/IncentiveWeb/${routeName}?isPreview=true&draftId=${draftId}`;

    }


    window.open(previewUrl, '_blank');
  }

resizeElement(
  type: 'half' | 'twoByTree' | 'full' | 'default',
  item: PageElement,
  sectionIndex: number,
  itemIndex: number
) {
  const sectionElement = this.scrollContainerItem?.nativeElement
    ?.children?.[sectionIndex] as HTMLElement;

  if (!sectionElement) return;

  const sectionRect = sectionElement.getBoundingClientRect();

  let widthPercent: number;
  let heightPercent: number;

  const TOP_MARGIN_PERCENT = 2;
  const BOTTOM_MARGIN_PERCENT = 1;

  switch (type) {
    case 'half':
      widthPercent = 46;
      heightPercent = item.heightPercent || 25;
      break;
    case 'full':
      widthPercent = 92;
      heightPercent = item.heightPercent || 25;
      break;
    case 'twoByTree':
      widthPercent = 60;
      heightPercent = item.heightPercent || 25;
      break;
    default:
      widthPercent = 30;
      heightPercent = item.heightPercent || 25;
      break;
  }

  const items = this.sectionsArray[sectionIndex].items;
  const usedWidthPercent = items.reduce((total, el, idx) => {
    if (idx === itemIndex) return total; 
    return total + (el.widthPercent || 0);
  }, 0);

  if (usedWidthPercent + widthPercent > 100) {
    this.notificationService.errorTopRight('Size is not available for Resizing');
    return;
  }


  item.width = (widthPercent / 100) * sectionRect.width;
  item.height = (heightPercent / 100) * sectionRect.height;

  item.widthPercent = widthPercent;
  item.heightPercent = heightPercent;


  item.xPercent = Math.max(0, Math.min(100 - widthPercent, item.xPercent || 0));
  item.yPercent = Math.max(
    TOP_MARGIN_PERCENT,
    Math.min(100 - heightPercent - BOTTOM_MARGIN_PERCENT, item.yPercent || 0)
  );

  item.x = (item.xPercent / 100) * sectionRect.width;
  item.y = (item.yPercent / 100) * sectionRect.height;

  item.modified = true;
 this.sectionsArray[sectionIndex].items[itemIndex] = item;

  this.reflowSection(sectionIndex);
  this.sectionsArray[sectionIndex].items[itemIndex] = item;
  this.changeDetectorRef.detectChanges();
  this.storeState();
}

swapContainerPosition(sectionIndex: number, itemIndex: number, direction: 'left' | 'right') {
  const items = this.sectionsArray[sectionIndex].items;
  if (!items || items.length <= 1) return;

  const swapIndex = direction === 'left' ? itemIndex - 1 : itemIndex + 1;
  if (swapIndex < 0 || swapIndex >= items.length) return;

  [items[itemIndex], items[swapIndex]] = [items[swapIndex], items[itemIndex]];

   this.reflowSection(sectionIndex);

   const sectionElement = document.querySelector(`.added-section-editing-area:nth-child(${sectionIndex + 1})`);
  if (sectionElement) {
    const sectionRect = sectionElement.getBoundingClientRect();
    for (let el of items) {
      this.updateElementAbsolutePosition(el, sectionRect);
    }
  }

  this.markElementsAsModified();
  this.changeDetectorRef.detectChanges();
  this.storeState();
}

private reflowSection(sectionIndex: number): void {
  const section = this.sectionsArray[sectionIndex];
  if (!section) return;

  const gapPercent = window.innerWidth < 768 ? 0.4 : 0.6;
  const LEFT_MARGIN_PERCENT = 0; 
  const TOP_MARGIN_PERCENT = 2;
  const VERTICAL_GAP_PERCENT = 2;

  let currentX = LEFT_MARGIN_PERCENT;
  let currentY = TOP_MARGIN_PERCENT;
  let rowHeight = 0;

  section.items.forEach((item, idx) => {
    if (currentX + item.widthPercent > 100) {
      currentX = 0; 
      currentY += rowHeight + VERTICAL_GAP_PERCENT;
      rowHeight = 0;
    }

    item.xPercent = currentX;
    item.yPercent = currentY;

    currentX += item.widthPercent + gapPercent;
    rowHeight = Math.max(rowHeight, item.heightPercent || 25);

    item.modified = true;
  });
}


openDeleteFaqDialog(index: number, template: any) {
  this.faqToDeleteIndex = index;
  this.modalReference = this._matDialog.open(template);
}

closeDeleteFaqDialog() {
  if (this.modalReference) {
    this.modalReference.close();
    this.modalReference = null;
  }
}

  confirmDeleteFaq() {
    if (this.faqToDeleteIndex !== null) {
      this.faqs.splice(this.faqToDeleteIndex, 1);
      this.faqToDeleteIndex = null;
    }
    this.closeDeleteFaqDialog();
  }
applySizeKeepingColor(size: { name: string; size: string }) {
  this.showFontSizeDropdown = false;
  
  console.log('applySizeKeepingColor called with size:', size);
  
  if (!this.savedSelectionForFontSize) {
    console.log('No saved selection for font size, returning');
    return;
  }
  
  const sel = window.getSelection();
  if (!sel) {
    console.log('No window.getSelection(), returning');
    return;
  }
  
  sel.removeAllRanges();
  sel.addRange(this.savedSelectionForFontSize);
  
  const range = this.savedSelectionForFontSize;
  if (range.collapsed) {
    console.log('Range is collapsed, returning');
    this.savedSelectionForFontSize = null;
    return;
  }
  
  const selectedText = range.toString();
  console.log('Selected text for font size:', selectedText);
  
  if (!selectedText.trim()) {
    console.log('No text selected for font size, returning');
    this.savedSelectionForFontSize = null;
    return;
  }

  const extractedStyles = this.extractStylesFromSelection(range);
  console.log('Extracted styles for font size:', extractedStyles);
  console.log('backgroundColor:', extractedStyles.backgroundColor);
  
  let parentSpan = range.startContainer as HTMLElement;
  if (parentSpan.nodeType === Node.TEXT_NODE) {
    parentSpan = parentSpan.parentElement as HTMLElement;
  }
  
  let outermostSpan: HTMLElement | null = null;
  let currentEl: HTMLElement | null = parentSpan;
  
  while (currentEl) {
    if (currentEl.classList?.contains('angular-editor-textarea') || 
        currentEl.contentEditable === 'true' ||
        currentEl.tagName === 'DIV' ||
        currentEl.tagName === 'ANGULAR-EDITOR') {
      break;
    }
    if (currentEl.tagName === 'SPAN' || currentEl.tagName === 'FONT') {
      outermostSpan = currentEl;
    }
    currentEl = currentEl.parentElement;
  }

  const wrapper = document.createElement('span');
  const fontSizePx = size.size || (size.name + 'px');
 const fontSizeNumber = Number(fontSizePx.replace('px', ''));
    const lineHeight = fontSizeNumber >= 18 ? 1.1 : 0.9;
    let styleString = `
  font-size: ${fontSizePx};
  line-height: ${lineHeight} !important;
  display: inline;
`;

  // Preserve font-family if it existed (not default HelveticaNeueLight)
  if (extractedStyles.fontFamily && !extractedStyles.fontFamily.includes('HelveticaNeueLight')) {
    styleString += ` font-family: ${extractedStyles.fontFamily};`;
    console.log('Adding font-family to font size wrapper:', extractedStyles.fontFamily);
  }
  
  if (extractedStyles.backgroundColor && extractedStyles.backgroundColor !== 'transparent' && extractedStyles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
    styleString += ` background-color: ${extractedStyles.backgroundColor};`;
    console.log('Adding background color to font size wrapper:', extractedStyles.backgroundColor);
  }
  
  if (extractedStyles.color && extractedStyles.color !== 'rgb(0, 0, 0)' && extractedStyles.color !== '#000000') {
    styleString += ` color: ${extractedStyles.color};`;
  }
  
  wrapper.style.cssText = styleString;
  wrapper.textContent = selectedText; 
  console.log('Final styleString:', styleString);
    if (outermostSpan && outermostSpan.textContent?.trim() === selectedText.trim()) {
      outermostSpan.parentNode?.replaceChild(wrapper, outermostSpan);
    console.log('Replacing entire span:', outermostSpan.outerHTML);
    outermostSpan.parentNode?.replaceChild(wrapper, outermostSpan);
  } else {
    range.deleteContents();
    range.insertNode(wrapper);
  }
  
  console.log('Wrapper inserted:', wrapper.outerHTML);
  sel.removeAllRanges();
  const newRange = document.createRange();
  newRange.selectNodeContents(wrapper);
  sel.addRange(newRange);

  this.ngZone.run(() => {
    this.selectedFontSize = size.name;
  });
  
  this.savedSelectionForFontSize = null;
}

private cleanEditorHtml(html: string): string {
  let textHtml = html || '';

  textHtml = textHtml.replace(
    /<font[^>]*color=["']?([^"'>\s]+)["']?[^>]*>/gi,
    '<span style="color: $1;">'
  );
  textHtml = textHtml.replace(
    /<font[^>]*face=["']?([^"'>\s]+)["']?[^>]*>/gi,
    '<span style="font-family: $1;">'
  );
  textHtml = textHtml.replace(/<\/font>/gi, '</span>');

  textHtml = textHtml.replace(/<span[^>]*>\s*<\/span>/g, '');
  textHtml = textHtml.replace(/\s{2,}/g, ' ');

  textHtml = textHtml.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  textHtml = textHtml.replace(/on\w+="[^"]*"/g, '');

  const allSizeClasses = [
    'kl-editor-size-small', 'kl-editor-size-medium', 'kl-editor-size-large', 'kl-editor-size-x-large',
    'kl-editor-size-xx-large', 'kl-editor-size-xxx-large', 'kl-editor-size-xxxx-large',
    'kl-editor-size-huge', 'kl-editor-size-x-huge', 'kl-editor-size-xx-huge', 'kl-editor-size-giant',
    'kl-editor-size-32', 'kl-editor-size-36', 'kl-editor-size-40', 'kl-editor-size-44',
    'kl-editor-size-48', 'kl-editor-size-56', 'kl-editor-size-64', 'kl-editor-size-72',
    'kl-editor-size-84', 'kl-editor-size-96'
  ];
  allSizeClasses.forEach(cls => {
    const regex = new RegExp(`(${cls})(\\s+${cls})+`, 'g');
    textHtml = textHtml.replace(regex, cls);
  });

  return textHtml.trim();
}

snap(value: number, snapMap: Record<number, number>, max: number): number {
  if (snapMap[value] !== undefined) {
    return snapMap[value];
  }
  return Math.min(value, max);
}

private savedSelectionForFontSize: Range | null = null;

toggleFontSizeDropdown(event: MouseEvent) {
  event.stopPropagation();
  
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    this.savedSelectionForFontSize = sel.getRangeAt(0).cloneRange();
  }
  
  this.showFontSizeDropdown = !this.showFontSizeDropdown;
  this.showFontFamilyDropdown = false;
  this.showHeadingDropdown = false;
  this.showTextColorPicker = false;
  this.showBgColorPicker = false;
}

toggleFontFamilyDropdown(ev: MouseEvent) {
  ev.stopPropagation();
  this.showFontFamilyDropdown = !this.showFontFamilyDropdown;
  this.showTextColorPicker = false;
  this.showBgColorPicker = false;
}

closeDropdowns() {
  this.showFontSizeDropdown = false;
  this.showFontFamilyDropdown = false;
  this.showHeadingDropdown = false;
  this.showTextColorPicker = false;
  this.showBgColorPicker = false;
}

toggleTextColorPicker(event: MouseEvent) {
  event.stopPropagation();
  
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.toString().trim() === '') {
    return;
  }
  
  this.showTextColorPicker = !this.showTextColorPicker;
  this.showBgColorPicker = false;
  this.showFontSizeDropdown = false;
  this.showFontFamilyDropdown = false;
  this.showHeadingDropdown = false;
  if (this.showTextColorPicker) {
    this.updateSelectedTextColor();
    this.addColorPickerClickListener();
  }
}

toggleBgColorPicker(event: MouseEvent) {
  event.stopPropagation();

  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.toString().trim() === '') {
    return;
  }
  
  this.showBgColorPicker = !this.showBgColorPicker;
  this.showTextColorPicker = false;
  this.showFontSizeDropdown = false;
  this.showFontFamilyDropdown = false;
  this.showHeadingDropdown = false;
  if (this.showBgColorPicker) {
    this.updateSelectedBgColor();
    this.addColorPickerClickListener();
  }
}

private colorPickerClickListener: ((e: MouseEvent) => void) | null = null;

addColorPickerClickListener() {
  this.removeColorPickerClickListener();
  
  this.colorPickerClickListener = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.custom-color-picker') && !target.closest('.color-btn')) {
      this.showTextColorPicker = false;
      this.showBgColorPicker = false;
      this.removeColorPickerClickListener();
    }
  };
  
  setTimeout(() => {
    document.addEventListener('click', this.colorPickerClickListener!);
  }, 10);
}

removeColorPickerClickListener() {
  if (this.colorPickerClickListener) {
    document.removeEventListener('click', this.colorPickerClickListener);
    this.colorPickerClickListener = null;
  }
}

updateSelectedTextColor() {
  try {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    let element = range.startContainer as HTMLElement;
    if (element.nodeType === Node.TEXT_NODE) {
      element = element.parentElement as HTMLElement;
    }
    if (!element) return;
    const style = window.getComputedStyle(element);
    const color = style.color;
    const rgb = this.parseRgbString(color);
    if (rgb) {
      // Update RGB fields
      this.textColorR = rgb.r;
      this.textColorG = rgb.g;
      this.textColorB = rgb.b;
      this.selectedTextColor = this.rgbToHex(rgb.r, rgb.g, rgb.b);
      this.textColorHex = this.selectedTextColor;
      const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
      this.textColorHsv = hsv;
    }
  } catch (err) {}
}

updateSelectedBgColor() {
  try {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    let element = range.startContainer as HTMLElement;
    if (element.nodeType === Node.TEXT_NODE) {
      element = element.parentElement as HTMLElement;
    }
    if (!element) return;
    
    let bgColor: string | null = null;
    let currentEl: HTMLElement | null = element;
    
    while (currentEl && !bgColor) {
      const style = window.getComputedStyle(currentEl);
      const bg = style.backgroundColor;
    
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        bgColor = bg;
        break;
      }
      
      const inlineBg = currentEl.style?.backgroundColor;
      if (inlineBg && inlineBg !== 'transparent') {
        bgColor = inlineBg;
        break;
      }
      
      if (currentEl.classList?.contains('angular-editor-textarea') || 
          currentEl.contentEditable === 'true') {
        break;
      }
      
      currentEl = currentEl.parentElement;
    }
    
    if (bgColor) {
      const rgb = this.parseRgbString(bgColor);
      if (rgb) {
        // Update RGB fields
        this.bgColorR = rgb.r;
        this.bgColorG = rgb.g;
        this.bgColorB = rgb.b;
        this.selectedBgColor = this.rgbToHex(rgb.r, rgb.g, rgb.b);
        this.bgColorHex = this.selectedBgColor;
        const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
        this.bgColorHsv = hsv;
        return;
      }
    }
    
    // Default to white
    this.bgColorR = 255;
    this.bgColorG = 255;
    this.bgColorB = 255;
    this.selectedBgColor = '#ffffff';
    this.bgColorHex = '#ffffff';
    this.bgColorHsv = { h: 0, s: 0, v: 100 };
  } catch (err) {}
}

onCanvasMouseDown(event: MouseEvent, type: 'text' | 'bg') {
  this.isCanvasDragging = true;
  this.activeColorPicker = type;
  this.updateCanvasColor(event, type);
}

onCanvasMouseMove(event: MouseEvent, type: 'text' | 'bg') {
  if (this.isCanvasDragging && this.activeColorPicker === type) {
    this.updateCanvasColor(event, type);
  }
}

onCanvasMouseUp() {
  this.isCanvasDragging = false;
}

updateCanvasColor(event: MouseEvent, type: 'text' | 'bg') {
  const rect = (event.target as HTMLElement).closest('.color-canvas')?.getBoundingClientRect();
  if (!rect) return;
  
  const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
  const y = Math.max(0, Math.min(event.clientY - rect.top, rect.height));
  
  const s = (x / rect.width) * 100;
  const v = 100 - (y / rect.height) * 100;
  
  if (type === 'text') {
    this.textColorHsv.s = s;
    this.textColorHsv.v = v;
    this.updateTextColorFromHsv();
  } else {
    this.bgColorHsv.s = s;
    this.bgColorHsv.v = v;
    this.updateBgColorFromHsv();
  }
}

onHueMouseDown(event: MouseEvent, type: 'text' | 'bg') {
  this.isHueDragging = true;
  this.activeColorPicker = type;
  this.updateHueColor(event, type);
}

onHueMouseMove(event: MouseEvent, type: 'text' | 'bg') {
  if (this.isHueDragging && this.activeColorPicker === type) {
    this.updateHueColor(event, type);
  }
}

onHueMouseUp() {
  this.isHueDragging = false;
}

updateHueColor(event: MouseEvent, type: 'text' | 'bg') {
  const rect = (event.target as HTMLElement).closest('.hue-slider')?.getBoundingClientRect();
  if (!rect) return;
  
  const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
  const h = (x / rect.width) * 360;
  
  if (type === 'text') {
    this.textColorHsv.h = h;
    this.updateTextColorFromHsv();
  } else {
    this.bgColorHsv.h = h;
    this.updateBgColorFromHsv();
  }
}

updateTextColorFromHsv() {
  const rgb = this.hsvToRgb(this.textColorHsv.h, this.textColorHsv.s, this.textColorHsv.v);
  // Update RGB fields
  this.textColorR = rgb.r;
  this.textColorG = rgb.g;
  this.textColorB = rgb.b;
  this.selectedTextColor = this.rgbToHex(rgb.r, rgb.g, rgb.b);
  this.textColorHex = this.selectedTextColor;
}

updateBgColorFromHsv() {
  const rgb = this.hsvToRgb(this.bgColorHsv.h, this.bgColorHsv.s, this.bgColorHsv.v);
  // Update RGB fields
  this.bgColorR = rgb.r;
  this.bgColorG = rgb.g;
  this.bgColorB = rgb.b;
  this.selectedBgColor = this.rgbToHex(rgb.r, rgb.g, rgb.b);
  this.bgColorHex = this.selectedBgColor;
}

// RGB input handlers for RGB-only UI
onTextRgbInput(channel: 'r' | 'g' | 'b', value: string | number) {
  let v = parseInt(value as string, 10);
  if (isNaN(v)) v = 0;
  v = Math.max(0, Math.min(255, v));
  if (channel === 'r') this.textColorR = v;
  if (channel === 'g') this.textColorG = v;
  if (channel === 'b') this.textColorB = v;
  // Update HSV to match RGB
  this.textColorHsv = this.rgbToHsv(this.textColorR, this.textColorG, this.textColorB);
  // Update preview color
  this.selectedTextColor = this.rgbToHex(this.textColorR, this.textColorG, this.textColorB);
  this.textColorHex = this.selectedTextColor;
}

onBgRgbInput(channel: 'r' | 'g' | 'b', value: string | number) {
  let v = parseInt(value as string, 10);
  if (isNaN(v)) v = 0;
  v = Math.max(0, Math.min(255, v));
  if (channel === 'r') this.bgColorR = v;
  if (channel === 'g') this.bgColorG = v;
  if (channel === 'b') this.bgColorB = v;
  // Update HSV to match RGB
  this.bgColorHsv = this.rgbToHsv(this.bgColorR, this.bgColorG, this.bgColorB);
  // Update preview color
  this.selectedBgColor = this.rgbToHex(this.bgColorR, this.bgColorG, this.bgColorB);
  this.bgColorHex = this.selectedBgColor;
}

onTextColorHexInput(hex: string) {
  if (!hex.startsWith('#')) {
    hex = '#' + hex;
  }
  this.textColorHex = hex;
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    this.selectedTextColor = hex;
    const rgb = this.hexToRgb(hex);
    if (rgb) {
      const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
      this.textColorHsv = hsv;
    }
  }
}

onBgColorHexInput(hex: string) {
  if (!hex.startsWith('#')) {
    hex = '#' + hex;
  }
  this.bgColorHex = hex;
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    this.selectedBgColor = hex;
    const rgb = this.hexToRgb(hex);
    if (rgb) {
      const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
      this.bgColorHsv = hsv;
    }
  }
}

applyTextColor() {
  const color = this.selectedTextColor;
  document.execCommand('foreColor', false, color);
  this.showTextColorPicker = false;
  this.removeColorPickerClickListener();
}

applyBgColor() {
  const color = this.selectedBgColor;
  document.execCommand('hiliteColor', false, color);
  this.showBgColorPicker = false;
  this.removeColorPickerClickListener();
}

removeBgColor() {
  // Remove background color by applying transparent/inherit background using execCommand
  // This preserves other formatting like bold, italic, font color, etc.
  try {
    // Use hiliteColor with transparent to remove background
    document.execCommand('hiliteColor', false, 'transparent');
  } catch (e) {
    // Fallback: try backColor with transparent
    try {
      document.execCommand('backColor', false, 'transparent');
    } catch (e2) {
      // Final fallback: manually remove background from selection
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedContent = range.cloneContents();
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(selectedContent);
        
        // Remove background-color style from all elements within selection
        const allElements = tempDiv.querySelectorAll('*');
        allElements.forEach((el: any) => {
          if (el.style) {
            el.style.backgroundColor = '';
            el.style.background = '';
          }
        });
        
        // Replace the selection with the modified content
        range.deleteContents();
        const fragment = document.createRange().createContextualFragment(tempDiv.innerHTML);
        range.insertNode(fragment);
      }
    }
  }
  
  this.showBgColorPicker = false;
  this.removeColorPickerClickListener();
}

parseRgbString(color: string): { r: number; g: number; b: number } | null {
  if (!color) return null;
  
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10)
    };
  }
  
  const hexMatch = color.match(/^#?([0-9A-Fa-f]{6})$/);
  if (hexMatch) {
    const hex = hexMatch[1];
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
  }
  
  const shortHexMatch = color.match(/^#?([0-9A-Fa-f]{3})$/);
  if (shortHexMatch) {
    const hex = shortHexMatch[1];
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16)
    };
  }
  
  return null;
}

hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  s = s / 100;
  v = v / 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  
  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : (d / max) * 100;
  const v = max * 100;
  
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return { h, s, v };
}

hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, x)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

private savedSelectionForHeading: Range | null = null;

toggleHeadingDropdown(event: MouseEvent) {
  event.stopPropagation();
  
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    this.savedSelectionForHeading = sel.getRangeAt(0).cloneRange();
  }
  
  this.showHeadingDropdown = !this.showHeadingDropdown;
  this.showFontSizeDropdown = false;
  this.showFontFamilyDropdown = false;
  this.showTextColorPicker = false;
  this.showBgColorPicker = false;
  if (this.showHeadingDropdown) {
    this.updateSelectedHeading();
  }
}

applyHeading(heading: any) {
  this.showHeadingDropdown = false;
  
  console.log('applyHeading called with:', heading);
  console.log('savedSelection:', this.savedSelectionForHeading);
  
  if (!this.savedSelectionForHeading) {
    console.log('No saved selection, returning');
    return;
  }
  
  const sel = window.getSelection();
  if (!sel) {
    console.log('No window.getSelection(), returning');
    return;
  }
  
  sel.removeAllRanges();
  sel.addRange(this.savedSelectionForHeading);
  
  const range = this.savedSelectionForHeading;
  if (range.collapsed) {
    console.log('Range is collapsed, returning');
    this.savedSelectionForHeading = null;
    return;
  }
  
  const selectedText = range.toString();
  console.log('Selected text:', selectedText);
  
  if (!selectedText.trim()) {
    console.log('No text selected, returning');
    this.savedSelectionForHeading = null;
    return;
  }
  
  // Extract styles BEFORE any DOM manipulation
  const extractedStyles = this.extractStylesFromSelection(range);
  console.log('Extracted styles for heading:', extractedStyles);
  console.log('backgroundColor value:', extractedStyles.backgroundColor);
  console.log('color value:', extractedStyles.color);
  
  // STEP 1: Remove all nested spans and get plain text
  // Find the parent span that wraps the selection (if any)
  let parentSpan = range.startContainer as HTMLElement;
  if (parentSpan.nodeType === Node.TEXT_NODE) {
    parentSpan = parentSpan.parentElement as HTMLElement;
  }
  
  // Walk up to find the outermost styling span within the editor
  let outermostSpan: HTMLElement | null = null;
  let currentEl: HTMLElement | null = parentSpan;
  
  while (currentEl) {
    if (currentEl.classList?.contains('angular-editor-textarea') || 
        currentEl.contentEditable === 'true' ||
        currentEl.tagName === 'DIV' ||
        currentEl.tagName === 'ANGULAR-EDITOR') {
      break;
    }
    if (currentEl.tagName === 'SPAN' || currentEl.tagName === 'FONT') {
      outermostSpan = currentEl;
    }
    currentEl = currentEl.parentElement;
  }
  
  // STEP 2: Create the new clean span with only the styles we want
  const wrapper = document.createElement('span');
    const fontSize = heading.fontSize || '14px';
    const fontSizeNumber = parseInt(fontSize, 10);
    const lineHeight = fontSizeNumber >= 18 ? 1.1 : 0.9; // Tighter line-height
    const fontWeight = heading.fontWeight || '400';
    
    let styleString = `font-size: ${fontSize} !important; line-height: ${lineHeight} !important; font-weight: ${fontWeight}; display: inline;`;

  if (extractedStyles.fontFamily && !extractedStyles.fontFamily.includes('HelveticaNeueLight')) {
    styleString += ` font-family: ${extractedStyles.fontFamily};`;
    console.log('Adding font-family to styleString:', extractedStyles.fontFamily);
  }

  // Preserve background color if it existed
  if (extractedStyles.backgroundColor && extractedStyles.backgroundColor !== 'transparent' && extractedStyles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
    styleString += ` background-color: ${extractedStyles.backgroundColor};`;
    console.log('Adding background color to styleString:', extractedStyles.backgroundColor);
  }
  
  // Preserve text color if it existed (but not default black)
  if (extractedStyles.color && extractedStyles.color !== 'rgb(0, 0, 0)' && extractedStyles.color !== '#000000') {
    styleString += ` color: ${extractedStyles.color};`;
  }
  
  wrapper.style.cssText = styleString;
  wrapper.textContent = selectedText; // Use plain text, no HTML nesting
  
  console.log('Final styleString:', styleString);
  
  // STEP 3: Replace content - if we found an outermost span with same text, replace it entirely
  if (outermostSpan && outermostSpan.textContent?.trim() === selectedText.trim()) {
    // The entire span content is selected, replace the whole span
    console.log('Replacing entire span:', outermostSpan.outerHTML);
    outermostSpan.parentNode?.replaceChild(wrapper, outermostSpan);
  } else {
    // Partial selection - just delete and insert
    range.deleteContents();
    range.insertNode(wrapper);
  }
  
  console.log('Wrapper inserted:', wrapper.outerHTML);
  
  // Select the new wrapper
  sel.removeAllRanges();
  const newRange = document.createRange();
  newRange.selectNodeContents(wrapper);
  sel.addRange(newRange);

  this.savedSelectionForHeading = null;

  this.ngZone.run(() => {
    this.selectedHeading = heading.name;
    this.selectedFontSize = this.getFontSizeFromPx(heading.fontSize);
  });
}

private extractStylesFromSelection(range: Range): { backgroundColor: string | null; color: string | null; fontFamily: string | null } {
  let backgroundColor: string | null = null;
  let color: string | null = null;
  let fontFamily: string | null = null;
  const fragment = range.cloneContents();
  const styledElements = fragment.querySelectorAll('span, font');
  styledElements.forEach((el) => {
    if (el instanceof HTMLElement) {
      if (!backgroundColor && el.style.backgroundColor) {
        backgroundColor = el.style.backgroundColor;
      }
      if (!color && el.style.color) {
        color = el.style.color;
      }
      if (!fontFamily && el.style.fontFamily) {
        fontFamily = el.style.fontFamily;
      }
      const bgAttr = el.getAttribute('style');
      if (bgAttr && !backgroundColor) {
        const bgMatch = bgAttr.match(/background(?:-color)?:\s*([^;]+)/i);
        if (bgMatch) {
          backgroundColor = bgMatch[1].trim();
        }
      }
      if (bgAttr && !fontFamily) {
        const fontMatch = bgAttr.match(/font-family:\s*([^;]+)/i);
        if (fontMatch) {
          fontFamily = fontMatch[1].trim();
        }
      }
    }
  });
  
  let node: Node | null = range.startContainer;
  
  while (node) {
    if (node instanceof HTMLElement) {
      if (node.classList?.contains('angular-editor-textarea') || 
          node.contentEditable === 'true' ||
          node.tagName === 'ANGULAR-EDITOR') {
        break;
      }
      
      if (!backgroundColor && node.style.backgroundColor) {
        const bg = node.style.backgroundColor;
        if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
          backgroundColor = bg;
          console.log('Found backgroundColor from inline style:', backgroundColor, 'on element:', node.className);
        }
      }
      if (!color && node.style.color) {
        color = node.style.color;
      }
      if (!fontFamily && node.style.fontFamily) {
        fontFamily = node.style.fontFamily;
        console.log('Found fontFamily from inline style:', fontFamily, 'on element:', node.className);
      }
      
      // Also check the style attribute directly (for rgb values)
      if (!backgroundColor) {
        const styleAttr = node.getAttribute('style');
        if (styleAttr) {
          const bgMatch = styleAttr.match(/background(?:-color)?:\s*([^;]+)/i);
          if (bgMatch) {
            const bgValue = bgMatch[1].trim();
            if (bgValue && bgValue !== 'transparent' && bgValue !== 'rgba(0, 0, 0, 0)') {
              backgroundColor = bgValue;
              console.log('Found backgroundColor from style attribute:', backgroundColor, 'on element:', node.className);
            }
          }
        }
      }
      
      // Check for fontFamily in style attribute
      if (!fontFamily) {
        const styleAttr = node.getAttribute('style');
        if (styleAttr) {
          const fontMatch = styleAttr.match(/font-family:\s*([^;]+)/i);
          if (fontMatch) {
            fontFamily = fontMatch[1].trim();
            console.log('Found fontFamily from style attribute:', fontFamily, 'on element:', node.className);
          }
        }
      }
      
      // Check computed style as fallback
      if (!backgroundColor) {
        const computed = window.getComputedStyle(node);
        if (computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)' && computed.backgroundColor !== 'transparent') {
          backgroundColor = computed.backgroundColor;
          console.log('Found backgroundColor from computed style:', backgroundColor, 'on element:', node.className);
        }
      }
      if (!color) {
        const computed = window.getComputedStyle(node);
        if (computed.color) {
          color = computed.color;
        }
      }
      if (!fontFamily) {
        const computed = window.getComputedStyle(node);
        // Only use computed fontFamily if it's not the default
        if (computed.fontFamily && !computed.fontFamily.includes('HelveticaNeueLight')) {
          fontFamily = computed.fontFamily;
          console.log('Found fontFamily from computed style:', fontFamily, 'on element:', node.className);
        }
      }
    }
    node = node.parentNode;
  }
  
  console.log('Final extracted styles - backgroundColor:', backgroundColor, 'color:', color, 'fontFamily:', fontFamily);
  return { backgroundColor, color, fontFamily };
}
private updateSelectedHeading() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  if (!this.isInsideEditor(range.commonAncestorContainer)) return;

  let element = range.startContainer as HTMLElement;
  if (element.nodeType === Node.TEXT_NODE) {
    element = element.parentElement as HTMLElement;
  }
  
  if (element) {
    const computedStyle = window.getComputedStyle(element);
    const fontSize = parseInt(computedStyle.fontSize, 10);
    const fontWeight = parseInt(computedStyle.fontWeight, 10);

    const matchedHeading = this.headings.find(h => {
      const headingSize = parseInt(h.fontSize, 10);
      return Math.abs(headingSize - fontSize) <= 2; 
     });
    
    if (matchedHeading) {
      this.selectedHeading = matchedHeading.name;
      this.selectedFontSize = fontSize.toString();
    } else {
      this.selectedHeading = null;
      this.selectedFontSize = fontSize.toString();
    }
  } else {
    this.selectedHeading = null;
  }
}

private getFontSizeFromPx(pxValue: string): string {
  const pxNum = parseInt(pxValue, 10);
  
  const exactMatch = this.fontSizes.find(f => {
    const fsize = parseInt(f.name, 10);
    return fsize === pxNum;
  });
  
  if (exactMatch) {
    return exactMatch.name;
  }
  
  let closestMatch = this.fontSizes[0];
  let minDiff = Math.abs(parseInt(closestMatch.name, 10) - pxNum);
  
  for (let i = 1; i < this.fontSizes.length; i++) {
    const fsize = parseInt(this.fontSizes[i].name, 10);
    const diff = Math.abs(fsize - pxNum);
    if (diff < minDiff) {
      minDiff = diff;
      closestMatch = this.fontSizes[i];
    }
  }
  
  return closestMatch.name;
}

private findHeadingClass(node: Node): string | null {
  let el = node instanceof HTMLElement ? node : node.parentElement;

  while (el && el.tagName !== 'DIV') {
    const headingClass = [
      'kl-editor-heading-h1', 'kl-editor-heading-h2', 'kl-editor-heading-h3',
      'kl-editor-heading-h4', 'kl-editor-heading-h5', 'kl-editor-heading-h6',
      'kl-editor-heading-paragraph', 'kl-editor-heading-predefined',
      'kl-editor-heading-standard', 'kl-editor-heading-default', 'kl-editor-Default'
    ].find(cls => el!.classList.contains(cls));

    if (headingClass) {
      return headingClass;
    }

    el = (el as HTMLElement).parentElement;
  }

  return null;
}

private findHeadingElement(node: Node): HTMLElement | null {
  let el = node instanceof HTMLElement ? node : node.parentElement;
  const headingClasses = [
    'kl-editor-heading-h1', 'kl-editor-heading-h2', 'kl-editor-heading-h3',
    'kl-editor-heading-h4', 'kl-editor-heading-h5', 'kl-editor-heading-h6',
    'kl-editor-Default'
  ];

  while (el && el.tagName !== 'DIV') {
    const isHeading = headingClasses.some(cls => el!.classList.contains(cls));
    if (isHeading) {
      return el;
    }
    el = el.parentElement;
  }

  return null;
}

private readonly sizeClasses = [
  'kl-editor-size-small',
  'kl-editor-size-medium',
  'kl-editor-size-large',
  'kl-editor-size-x-large',
  'kl-editor-size-xx-large',
  'kl-editor-size-xxx-large',
  'kl-editor-size-xxxx-large',
  'kl-editor-size-huge',
  'kl-editor-size-x-huge',
  'kl-editor-size-xx-huge',
  'kl-editor-size-giant'
];

private classToName: Record<string, string> = {
  'kl-editor-size-small': '8',
  'kl-editor-size-medium': '10',
  'kl-editor-size-large': '12',
  'kl-editor-size-x-large': '14',
  'kl-editor-size-xx-large': '16',
  'kl-editor-size-xxx-large': '18',
  'kl-editor-size-xxxx-large': '20',
  'kl-editor-size-huge': '22',
  'kl-editor-size-x-huge': '24',
  'kl-editor-size-xx-huge': '26',
  'kl-editor-size-giant': '28',
};
private updateActiveFontSize() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);

  if (!this.isInsideEditor(range.commonAncestorContainer)) return;

  const startSize = this.findFontSizeFromNode(range.startContainer);
  const endSize = this.findFontSizeFromNode(range.endContainer);

  if (sel.type === 'Range' && startSize !== endSize) {
    this.selectedFontSize = 'Mixed';
  } else if (startSize) {
    this.selectedFontSize = startSize;
  } else {
    this.selectedFontSize = '';
  }
}

private findFontSizeFromNode(node: Node | null): string | null {
  let el: HTMLElement | null =
    node && node.nodeType === Node.TEXT_NODE
      ? (node.parentElement as HTMLElement)
      : (node as HTMLElement);

  while (el && el.nodeType === 1) {
    if (el.style.fontSize) {
      return this.getFontSizeFromPx(el.style.fontSize);
    }
    const computed = window.getComputedStyle(el);
    if (computed.fontSize) {
      return this.getFontSizeFromPx(computed.fontSize);
    }
    el = el.parentElement;
  }
  return null;
}

private isInsideEditor(node: Node): boolean {
  const editorRoot = document.querySelector('angular-editor .angular-editor-textarea');
  return editorRoot ? editorRoot.contains(node) : true;
}

private onSelectionChange = () => {
  this.ngZone.run(() => {
    this.updateActiveFontSize();
    this.cdr.markForCheck();
  });
};

private normFont(font: string | null | undefined): string {
  return (font || 'HelveticaNeuelight').replace(/["']/g, '').replace(/\s+/g, '');
}

private placeCaretAfter(el: HTMLElement) {
  const sel = window.getSelection(); if (!sel) return;
  const r = document.createRange();
  r.selectNodeContents(el);
  r.collapse(false);
  sel.removeAllRanges();
  sel.addRange(r);
}

setFontFamily(font: string) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  if (range.collapsed) return;

  const family = this.normFont(font);

  let parentEl = (range.startContainer as Node).parentElement;

  if (parentEl && parentEl.tagName === "SPAN") {
    parentEl.style.fontFamily = family;
    this.placeCaretAfter(parentEl);
  } else {
    const wrap = document.createElement("span");
    wrap.style.fontFamily = family;

    try {
      range.surroundContents(wrap);
      this.placeCaretAfter(wrap);
    } catch {
      const frag = range.extractContents();
      wrap.appendChild(frag);
      range.insertNode(wrap);
      this.placeCaretAfter(wrap);
    }
  }

  this.selectedFontFamily = font;
  this.showFontFamilyDropdown = false;
  this.showDropdown = false;

  setTimeout(() => this.updateSelectedFont());
}

readonly HEADING_SIZE_FALLBACK: Record<string, string> = {
  H1: '32px', H2: '24px', H3: '19px', H4: '16px', H5: '13px', H6: '11px'
};

readonly DEFAULT_SIZE_LABEL = '14';

private nearestEl(n: Node | null): HTMLElement | null {
  return n instanceof HTMLElement ? n : n?.parentElement ?? null;
}

private _el(n: Node | null): HTMLElement | null {
  return n instanceof HTMLElement ? n : n?.parentElement ?? null;
}

private _effectiveSizePxAt(n: Node | null): string {
  const el = this._el(n);
  if (!el) return '';
  const span = el.closest('span') as HTMLElement | null;
  const inline = span?.style?.fontSize?.trim();
  return inline || window.getComputedStyle(el).fontSize;
}

private textWalker(root: Node): TreeWalker {
  return document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
}

private isWhitespaceNode(n: Node): boolean {
  return n.nodeType === Node.TEXT_NODE && !(/\S/.test(n.nodeValue || ''));
}

private trimRangeToNonWhitespace(r: Range): Range {
  const rng = r.cloneRange();
  let startNode = rng.startContainer;
  let startOffset = rng.startOffset;

  if (startNode.nodeType === Node.TEXT_NODE) {
    const t = (startNode as Text).data;
    while (startOffset < t.length && /\s/.test(t[startOffset])) startOffset++;
    rng.setStart(startNode, startOffset);
  }

  let endNode = rng.endContainer;
  let endOffset = rng.endOffset;

  if (endNode.nodeType === Node.TEXT_NODE) {
    const t = (endNode as Text).data;
    while (endOffset > 0 && /\s/.test(t[endOffset - 1])) endOffset--;
    rng.setEnd(endNode, endOffset);
  }

  try { if (rng.compareBoundaryPoints(Range.START_TO_END, rng) > 0) return r; } catch { return r; }
  return rng;
}

private getTextNodesInRange(r: Range): Text[] {
  const nodes: Text[] = [];
  const walker = this.textWalker(r.commonAncestorContainer);
  let n: Node | null;

  while ((n = walker.nextNode())) {
    if (n.nodeType !== Node.TEXT_NODE) continue;
    if (!/\S/.test(n.nodeValue || '')) continue;
    const nr = document.createRange();
    nr.selectNodeContents(n);
    const overlaps = !(nr.compareBoundaryPoints(Range.END_TO_START, r) <= 0 ||
      nr.compareBoundaryPoints(Range.START_TO_END, r) >= 0);
    if (overlaps) nodes.push(n as Text);
  }
  return nodes;
}

private _normalizeFontToken(token: string | null | undefined): string {
  if (!token) return '';
  return token.toLowerCase()
    .replace(/['"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

private _fontAliasMap: Record<string, string> = {
  'arial': 'Arial',
  'times new roman': 'Times New Roman',
  'verdana': 'Verdana',
  'helvetica neue medium': 'HelveticaNeueMedium',
  'helvetica neue light': 'HelveticaNeuelight'
};

private _mapToAllowedFont(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const primary = raw.split(',')[0].trim();
  const norm = this._normalizeFontToken(primary);
  if (!norm) return null;

  if (this._fontAliasMap[norm]) return this._fontAliasMap[norm];

  const found = (this.fonts || []).find((f: string) => {
    return this._normalizeFontToken(f) === norm;
  });
  if (found) return found;

  return null;
}

updateSelectedFontFamily(): void {
  try {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      this.selectedFontFamily = null;
      return;
    }

    const range = sel.getRangeAt(0);

    const effectiveElForNode = (node: Node | null): HTMLElement | null => {
      if (!node) return null;
      if (node.nodeType === Node.ELEMENT_NODE) return node as HTMLElement;
      return (node.parentElement as HTMLElement | null);
    };

    const getComputedFontForNode = (node: Node | null): string | null => {
      const el = effectiveElForNode(node);
      if (!el) return null;
      const ff = (el.style && el.style.fontFamily) ? el.style.fontFamily : window.getComputedStyle(el).fontFamily;
      return ff || null;
    };

    const startFontRaw = getComputedFontForNode(range.startContainer);
    const endFontRaw = getComputedFontForNode(range.endContainer);

    const startKey = (() => {
      if (!startFontRaw) return null;
      const token = startFontRaw.split(',')[0].trim();
      const normalized = this._normalizeFontToken(token);
      const match = this.fonts.find((f: string) => this._normalizeFontToken(f) === normalized);
      if (match) return match;
      const alias = this._fontAliasMap[normalized];
      return alias || null;
    })();

    const endKey = (() => {
      if (!endFontRaw) return null;
      const token = endFontRaw.split(',')[0].trim();
      const normalized = this._normalizeFontToken(token);
      const match = this.fonts.find((f: string) => this._normalizeFontToken(f) === normalized);
      if (match) return match;
      const alias = this._fontAliasMap[normalized];
      return alias || null;
    })();

    if (startKey && endKey && startKey === endKey) {
      this.selectedFontFamily = startKey;
      return;
    }

    if (startKey && !endKey) { this.selectedFontFamily = startKey; return; }
    if (!startKey && endKey) { this.selectedFontFamily = endKey; return; }

    let node: Node | null = range.startContainer;
    while (node) {
      const el = effectiveElForNode(node);
      if (el) {
        const ff = window.getComputedStyle(el).fontFamily || '';
        const token = ff.split(',')[0].trim();
        const normalized = this._normalizeFontToken(token);
        const match = this.fonts.find((f: string) => this._normalizeFontToken(f) === normalized);
        if (match) { this.selectedFontFamily = match; return; }
      }
      node = (node.parentElement as unknown as Node) || null;
    }

    this.selectedFontFamily = null;
  } catch (err) {
    console.warn('updateSelectedFontFamily error', err);
    this.selectedFontFamily = null;
  }
}

private normalizeToGreetingPlaceholder(html: string | null): string {
  const PLACEHOLDER = "[Good Morning/Afternoon/Evening], [First Name]";

  if (!html || !html.trim()) {
    return `
      <h3 style="text-align: center;">
        <span class="kl-editor-size-x-large"
              style="font-size:19px; color:#02479c !important; font-family:HelveticaNeueBold;">
          ${PLACEHOLDER}
        </span>
      </h3>
    `;
  }

  const div = document.createElement("div");
  div.innerHTML = html;

  const walker = document.createTreeWalker(
    div,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        return node.nodeValue && node.nodeValue.trim()
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    } as unknown as NodeFilter
  );

  let placed = false;
  while (walker.nextNode()) {
    const t = walker.currentNode as Text;
    if (!placed) {
      t.nodeValue = PLACEHOLDER;
      placed = true;
    } else {
      t.nodeValue = "";
    }
  }

  if (!placed) {
    const target =
      div.querySelector<HTMLElement>("span.kl-editor-size-x-large") ||
      div.querySelector<HTMLElement>("h1,h2,h3,h4,h5,h6,span,p,div");

    if (target) {
      target.textContent = PLACEHOLDER;
    } else {
      return `
        <h3 style="text-align: center;">
          <span class="kl-editor-size-x-large"
                style="font-size:19px; color:#02479c !important; font-family:HelveticaNeuelight;">
            ${PLACEHOLDER}
          </span>
        </h3>
      `;
    }
  }

  return div.innerHTML;
}

private _ptToPx(pt: number): number {
  return Math.round(pt * 1.333333);
}

private _escapeHtml(unsafe: string): string {
  return unsafe.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as any)[m]);
}

private _allowedSizesSource() {
  if (this.allowedSizes && this.allowedSizes.length) return this.allowedSizes;
  return [
    { px: 11, cls: 'kl-editor-size-small', label: '8' },
    { px: 13, cls: 'kl-editor-size-medium', label: '10' },
    { px: 16, cls: 'kl-editor-size-large', label: '12' },
    { px: 19, cls: 'kl-editor-size-x-large', label: '14' },
    { px: 21, cls: 'kl-editor-size-xx-large', label: '16' },
    { px: 24, cls: 'kl-editor-size-xxx-large', label: '18' },
    { px: 27, cls: 'kl-editor-size-xxxx-large', label: '20' },
    { px: 29, cls: 'kl-editor-size-huge', label: '22' },
    { px: 32, cls: 'kl-editor-size-x-huge', label: '24' },
    { px: 35, cls: 'kl-editor-size-xx-huge', label: '26' },
    { px: 37, cls: 'kl-editor-size-giant', label: '28' },
    { px: 40, cls: 'kl-editor-size-32', label: '32' },
    { px: 45, cls: 'kl-editor-size-36', label: '36' },
    { px: 50, cls: 'kl-editor-size-40', label: '40' },
    { px: 55, cls: 'kl-editor-size-44', label: '44' },
    { px: 60, cls: 'kl-editor-size-48', label: '48' },
    { px: 70, cls: 'kl-editor-size-56', label: '56' },
    { px: 80, cls: 'kl-editor-size-64', label: '64' },
    { px: 90, cls: 'kl-editor-size-72', label: '72' },
    { px: 105, cls: 'kl-editor-size-84', label: '84' },
    { px: 120, cls: 'kl-editor-size-96', label: '96' }
  ];
}

private _nearestAllowed(px?: number) {
  const map = this._allowedSizesSource();
  if (!px || Number.isNaN(px)) return map[0];
  const exact = map.find((m: any) => Math.round(m.px) === Math.round(px));
  if (exact) return exact;
  let nearest = map[0];
  let best = Math.abs(px - nearest.px);
  for (const s of map) {
    const d = Math.abs(px - s.px);
    if (d < best) { best = d; nearest = s; }
  }
  return nearest;
}

private _isBlockTag(tagName: string) {
  return ['P', 'DIV', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'SECTION', 'ARTICLE'].includes(tagName);
}

normalizeEditorContent(root: HTMLElement) {
  if (!root) return;
  const blocks = Array.from(root.querySelectorAll<HTMLElement>('*')).filter(el => this._isBlockTag(el.tagName));
  const map = this._allowedSizesSource();
  blocks.forEach(bel => {
    let px = 0;
    const s = bel.getAttribute('style') || '';
    const mPx = s.match(/font-size\s*:\s*([0-9.]+)px/i);
    const mPt = s.match(/font-size\s*:\s*([0-9.]+)pt/i);
    if (mPx) px = Math.round(parseFloat(mPx[1]));
    else if (mPt) px = this._ptToPx(Math.round(parseFloat(mPt[1])));
    else px = Math.round(parseFloat(window.getComputedStyle(bel).fontSize || '0')) || 0;

    const mapped = this._nearestAllowed(px || undefined);
    if (mapped) {
      map.forEach((a: any) => bel.classList.remove(a.cls));
      bel.classList.add(mapped.cls);
    }
    if ((bel.style as CSSStyleDeclaration).fontSize) {
      (bel.style as CSSStyleDeclaration).fontSize = '';
      if (!bel.getAttribute('style')?.trim()) bel.removeAttribute('style');
    }
  });
}

onPaste(e: ClipboardEvent) {
  const target = e.target as HTMLElement | null;
  if (
    !target ||
    (!target.closest('.angular-editor-textarea') &&
     !target.closest('.editor-host'))
  ) {
    return;
  }

  e.preventDefault();

  const clipboard = e.clipboardData;
  // Get plain text and clean up extra spaces/nbsp
  let text = clipboard?.getData('text/plain') || '';
  // Remove multiple consecutive spaces and trim
  text = text.replace(/\s+/g, ' ').trim();
  
  const fontSize = this.selectedFontSize || '14';
  const fontSizePx = fontSize + 'px';

  // Check if pasting in FAQ dialog editors
  const isFaqQuestionEditor = this.showFaqDialog && this.faqObj?.type === 'ques';
  const isFaqAnswerEditor = this.showFaqDialog && this.faqObj?.type === 'ans';

  // Determine font weight based on editor type
  // FAQ Question: always bold, FAQ Answer: always normal, Others: normal
  const fontWeight = isFaqQuestionEditor ? 'bold' : 'normal';

  // Determine font family based on editor type
  let fontFamily: string;
  if (isFaqQuestionEditor) {
    fontFamily = this.selectedFontFamily || this.faqPagesTallEditorConfig.defaultFontName || 'HelveticaNeueBold';
  } else if (isFaqAnswerEditor) {
    fontFamily = this.selectedFontFamily || this.faqAnswerEditorConfig.defaultFontName || 'HelveticaNeueLight';
  } else {
    fontFamily = this.selectedFontFamily || this.HomePageEditorConfig.defaultFontName || 'inherit';
  }

  // For FAQ editors, always use plain text to strip all source formatting
  // This ensures default styling is applied regardless of source formatting
  if (isFaqQuestionEditor || isFaqAnswerEditor) {
    let safeHtml: string;
    if (isFaqQuestionEditor) {
      // For Question: wrap in <b> tag so bold button shows as active
      safeHtml = `<b style="font-size:${fontSizePx}; font-family:${fontFamily}; font-weight:bold">${this._escapeHtml(text)}</b>`;
    } else {
      // For Answer: normal text
      safeHtml = `<span style="font-size:${fontSizePx}; font-family:${fontFamily}; font-weight:normal">${this._escapeHtml(text)}</span>`;
    }
    document.execCommand('insertHTML', false, safeHtml);
    return;
  }

  // For other editors, process HTML if available
  let html = clipboard?.getData('text/html') || '';
  if (!html) {
    const safeHtml = `<p style="font-size:${fontSizePx}; font-family:${fontFamily}">${this._escapeHtml(text)}</p>`;
    document.execCommand('insertHTML', false, safeHtml);
    return;
  }
  
  // Clean up extra &nbsp; and multiple spaces from HTML before parsing
  html = html.replace(/&nbsp;/gi, ' ');  // Replace all &nbsp; with regular space
  html = html.replace(/\u00A0/g, ' ');   // Replace non-breaking space character with regular space
  html = html.replace(/ {2,}/g, ' ');    // Replace multiple consecutive spaces with single space
  
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const normalizeNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      // Clean up text node value - remove extra spaces and nbsp
      let textValue = node.nodeValue || '';
      textValue = textValue.replace(/\u00A0/g, ' ');  // Replace non-breaking space with regular space
      textValue = textValue.replace(/\s+/g, ' ');     // Replace multiple whitespace with single space
      
      if (!textValue.trim()) return;

      const span = doc.createElement('span');
      span.style.fontSize = fontSizePx;
      span.style.fontFamily = fontFamily;
      span.textContent = textValue;

      node.parentNode?.replaceChild(span, node);
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;

      el.style.removeProperty('font-size');

      el.style.fontFamily = fontFamily;

      Array.from(el.childNodes).forEach(normalizeNode);
    }
  };

  Array.from(doc.body.childNodes).forEach(normalizeNode);

  document.execCommand('insertHTML', false, doc.body.innerHTML);

  setTimeout(() => {
    const root = document.querySelector(
      '.angular-editor .angular-editor-textarea'
    ) as HTMLElement;

    if (root) {
      this.normalizeEditorContent?.(root);
      this.updateSelectedFont?.();
    }
  }, 0);
}




duplicateItem(sectionIndex: number, itemIndex: number) {
  const section = this.sectionsArray?.[sectionIndex];
  const item = section?.items?.[itemIndex];
  if (!item) return;
  if (item.isEdit || item.chartHeading) return;
  this.duplicateElement(sectionIndex, itemIndex);
}


async duplicateElement(sectionIndex: number, itemIndex: number): Promise<void> {
  const section = this.sectionsArray?.[sectionIndex];
  if (!section) return;

  const original = section.items?.[itemIndex];
  if (!original) return;

  const duplicate: PageElement = await this.createCompleteDeepCopy(original);

  const timestamp = Date.now();
  const randomPart1 = Math.random().toString(36).substr(2, 9);
  const randomPart2 = Math.random().toString(36).substr(2, 9);
  const uniqueSuffix = `${timestamp}-${itemIndex}-${randomPart1}-${randomPart2}`;

  duplicate.id = `${duplicate.type}-${uniqueSuffix}`;
  duplicate.containerId = this.getNanoTimestampWithRandomString();
  duplicate.modified = true;
  duplicate.isSavedToAPI = false;

  await this.resetAllMediaProperties(duplicate, uniqueSuffix);

  // offset positions
  const defaultOffset = 40;
  if (typeof original.x === 'number' && typeof original.y === 'number') {
    duplicate.x = (original.x ?? 0) + defaultOffset;
    duplicate.y = (original.y ?? 0) + defaultOffset;
  }
  if (typeof original.xPercent === 'number') duplicate.xPercent = (original.xPercent ?? 0) + 5;
  if (typeof original.yPercent === 'number') duplicate.yPercent = (original.yPercent ?? 0) + 5;

  const highestZIndexInSection = (section.items || []).reduce((max: number, it: PageElement) => {
    return (typeof it.zIndex === 'number' && it.zIndex > max) ? it.zIndex : max;
  }, 0);
  duplicate.zIndex = highestZIndexInSection + 1;

  // insert element after original
  section.items.splice(itemIndex + 1, 0, duplicate);

   if (!Array.isArray(this.showGridBlocks)) this.showGridBlocks = [];
  this.showGridBlocks.splice(sectionIndex + 1, 0, false);

  if (!Array.isArray(this.alignmentGuides)) this.alignmentGuides = [];
  this.alignmentGuides.splice(sectionIndex + 1, 0, []);

  this.selectedElement = duplicate;
  this.markElementsAsModified?.();
  this.changeDetectorRef?.detectChanges?.();

  if (duplicate.type === 'video') {
    console.log(`Duplicated video item ${duplicate.id}:`, {/* debug props */});
  }

  if (this.selectedMenuId !== 'TOU'
    && this.selectedMenuId !== 'FAQ'
    && this.selectedMenuId !== 'CU'
    && this.selectedMenuId !== 'PP'
    && this.selectedMenuId !== 'NT'
    && this.selectedMenuId !== 'FD'
    && this.selectedMenuId !== 'AC'
    && this.selectedMenuId !== 'TR'
    && this.selectedMenuId !== 'PR') {
    setTimeout(() => { this.updateSectionHeights?.(); }, 200);
  }
}

private isGreetingHtmlValid(html: string | null): boolean {
  if (!html) return false;
  const lower = html.toLowerCase();

  // must contain the first-name placeholder
  const hasFirstName = /\[first name\]/i.test(lower);

  // must contain at least one greeting token
  const hasGreetingWord = /\b(good morning|afternoon|evening)\b/i.test(lower)
    || /\[good morning\/afternoon\/evening\]/i.test(lower);

  return !!(hasFirstName && hasGreetingWord);
}
@HostListener('document:click', ['$event'])
clickOutside(event: MouseEvent) {
  if (this.showDropdown && !this.eRef.nativeElement.contains(event.target)) {
    this.showDropdown = false;
  }
}

}
