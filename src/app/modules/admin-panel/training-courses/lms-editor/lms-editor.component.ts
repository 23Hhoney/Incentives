import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, Renderer2, HostListener, TemplateRef, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { NotificationService } from 'app/shared/notification/notification';
import { TrainingCoursesService } from '../training-courses.service';
import { forkJoin, of, switchMap } from 'rxjs';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { SlideStateService } from '../slidestate.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
interface PageElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  style?: any;
  fieldId?: string;
  fieldValueId?: string;
  contentFileId?: string;
  file?: File;
  videoFile?: File;
  isMandatory?: boolean;
  requireUserToWatch?: boolean;
  groupId?: string;
  autoPlay?: boolean;
  videoUrl?: string;
  localVideoUrl?: string;
  sanitizedVideoUrl?: any;
  isYoutubeOrVimeo?: boolean;
  pendingVideoFile?: File;
  zIndex?: number;
  hyperlink?: string;
  audioFile?: File;
  oldContentFileId?: string;
  xPercent?: number;
  yPercent?: number;
  widthPercent?: number;
  heightPercent?: number;
  modified?: boolean;
  needsReplacement?: boolean;
  isCenteredHorizontally?: boolean;
  isCenteredVertically?: boolean;
  lmsGroupId ?: string;
  lmsGroupFieldId?: string;
  isSavedToAPI?: boolean;
  shouldAdjustHeight?: boolean;

}

@Component({
  selector: 'app-lms-editor',
  templateUrl: './lms-editor.component.html',
  styleUrls: ['./lms-editor.component.scss']
})

export class LmsEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef;
  videoUrlCache = new Map<string, SafeResourceUrl>();
  @ViewChild('confirmDeleteDialog') confirmDeleteDialog: TemplateRef<any>;
  @ViewChild('confirmEditorDialog') confirmEditorDialog: TemplateRef<any>;
  @ViewChild('confirmEditorDialogInaddMode') confirmEditorDialogInaddMode: TemplateRef<any>;

  // Dialog reference
  dialogRef: MatDialogRef<any>;
  dialogRefinAddMode: MatDialogRef<any>;

  // Grid configuration - fixed to 24x24
  gridColumns = 24;
  gridRows = 24;
  gridGutter = 10; // px
  cellWidth = 0;
  cellHeight = 0;

  elements: PageElement[] = [];
  selectedElement: PageElement | null = null;
  lastSelectedElement: PageElement | null = null;
  hoveredElement: PageElement | null = null;
  currentCropImage: string | null = null;
  showCropper: boolean = false;
  canvasWidth: number;
  canvasHeight: number;
  dragging = false;
  resizing = false;
  resizeHandle = '';
  startX = 0;
  startY = 0;
  startWidth = 0;
  startHeight = 0;
  offsetX = 0;
  offsetY = 0;
  showGridBlocks = false;
  showTextFormatPanel = false;
  alignmentGuides: { xPercent?: number; yPercent?: number }[] = [];
  showBlockMenu = false;
  SelectedSlideId: any;
  SlideType: any;
  showToolbar: boolean = false;
  public Editor = ClassicEditor;
  public editorData = '';
  showCKEditor: boolean = false;
  uploadedVideoData: any;
  // Image dialog variables
  showImageDialog = false;
  imageUrl = '';
  tempImageElement: PageElement | null = null;
  centerLineColor: string = 'blue';
  // Video dialog variables
  showVideoDialog = false;
  videoUrl = '';
  tempVideoElement: PageElement | null = null;
  sanitizedVideoUrl: SafeResourceUrl = null;
  localVideoUrl: string = null;
  isYoutubeOrVimeo: boolean = false;
  // Button dialog variables
  showButtonDialog = false;
  buttonText = '';
  buttonColor = '#007bff';
  buttonTextColor = '#ffffff';
  tempButtonElement: PageElement | null = null;
  ckeConfig: any;

  canvasBackgroundColor = '#ffffff';
  buttonStyle = {
    bold: false,
    italic: false,
    underline: false
  };
  requireUserToWatch = false;
  uploadedVideo: File | null = null;
  uploadedAudio: File | null = null;
  // Add this property
  showCenterLine = false;
  showAudioDialog: boolean;
  pendingVideoFile: File | null = null;
  ACCEPTED_VIDEO_FORMATS: string[] = ['video/mp4', 'video/webm', 'video/ogg'];
  MAX_FILE_SIZE: number = 25 * 1024 * 1024; // 25MB
  tempVideoUrl: string | null = null;
  CourseId: any;
  CourseIdNew: any;
  selectedLanguage: any;
  buttonAction: any;
  showHyperlinkDialog = false;
  hyperlinkUrl = '';
  showCropDialog = false;
  cropperInstance: any = null;
  cropImageSrc: string = '';
  autoPlay: boolean;
  startWidthPercent: number = 0; 
  startHeightPercent: number = 0; 
  startXPercent: number = 0; 
  startYPercent: number = 0; 
  cellWidthPercent: number = 5; 
  cellHeightPercent: number = 5; 
  gridGutterPercent: number = 1;
  Math = Math;
  buttonHyperlink: string = '';
  resizeListener: () => void;
  hasUnsavedChanges: boolean = false;
  originalElements: string = '';
  editorControl = new FormControl('');
  editorInstance: any;
   MIN_VIDEO_WIDTH_PERCENT = 20; 
  MIN_VIDEO_HEIGHT_PERCENT = 20; 
  originalImageContent: string = null;
  croppedImageResult: string = null;
  isLoading = false;
  loadingMessage = '';
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
  isEditMode: boolean;
  modalReferenceforSlideConfirm: any;
  pendingRequest: any;
  pendingIsUpdate: boolean;
  pendingCurrentSlideId: any;
  isNewSlide: boolean = false; // Track i
  
  // Angular Editor Properties
  HomePageEditorConfig: AngularEditorConfig = {
    sanitize: false,
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '400px',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
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
  
  // Font sizes for dropdown
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
  
  fonts: string[] = ['Arial', 'Times New Roman', 'Verdana', 'HelveticaNeueMedium', 'HelveticaNeuelight', 'HelveticaNeueBold'];
  
  // Headings
  headings = [
    { name: 'Heading 1', fontSize: '44px', lineHeight: '1.1', fontWeight: '700' },
    { name: 'Heading 2', fontSize: '40px', lineHeight: '1.1', fontWeight: '700' },
    { name: 'Heading 3', fontSize: '36px', lineHeight: '1.15', fontWeight: '600' },
    { name: 'Heading 4', fontSize: '32px', lineHeight: '1.2', fontWeight: '600' },
    { name: 'Heading 5', fontSize: '28px', lineHeight: '1.2', fontWeight: '600' },
    { name: 'Default', fontSize: '14px', lineHeight: '1.5', fontWeight: '400' },
  ];
  
  // Dropdown states
  showFontSizeDropdown = false;
  showFontFamilyDropdown = false;
  showHeadingDropdown = false;
  showTextColorPicker = false;
  showBgColorPicker = false;
  
  // Color picker properties
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
  selectedFontSize: string | null = null;
  selectedFontFamily: string | null = null;
  
  // RGB values for color pickers
  textColorR: number = 0;
  textColorG: number = 0;
  textColorB: number = 0;
  bgColorR: number = 255;
  bgColorG: number = 255;
  bgColorB: number = 255;
  
  private savedSelectionForFontSize: Range | null = null;
  private savedSelectionForHeading: Range | null = null;
  private colorPickerClickListener: ((e: MouseEvent) => void) | null = null;
  
  // Getters for RGB display
  get selectedTextColorRgb(): string {
    return `rgb(${this.textColorR}, ${this.textColorG}, ${this.textColorB})`;
  }
  get selectedBgColorRgb(): string {
    return `rgb(${this.bgColorR}, ${this.bgColorG}, ${this.bgColorB})`;
  }
  
  
  constructor(
    private renderer: Renderer2,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private notificationService: NotificationService,
    private service: TrainingCoursesService,
    private cdr: ChangeDetectorRef,
    private slideStateService: SlideStateService,
    private ngZone: NgZone

  ) { }

  ngOnInit() {
    this.SelectedSlideId = this.route.snapshot.params['slideId'];
    
    // Store the slide ID in the service
    if (this.SelectedSlideId) {
      this.slideStateService.setSelectedSlideId(this.SelectedSlideId);
    }
    
    this.SlideType = this.route.snapshot.params['slideType'];
    this.CourseId = this.route.snapshot.params['id'];
    this.CourseIdNew = this.route.snapshot.params['ids'];
    this.selectedLanguage = this.route.snapshot.params['lang'];
    this.buttonAction = this.route.snapshot.params['buttonAction'];
    this.isEditMode = this.route.snapshot.params['isEdit'] === 'true';

    // Add default video or audio element based on slide type
    if (this.SlideType === 'video') {
      this.addDefaultVideoElement();
    } else if (this.SlideType === 'audio-content') {
      this.addDefaultAudioElement();
    }
    // Initialize CKEditor config
    this.ckeConfig = {
  allowedContent: true,
  extraAllowedContent: '*(*); span[*]; div[*]; h1[*]; h2[*]; h3[*]; h4[*]; h5[*]; h6[*]; p[*]',
  extraPlugins: 'divarea',
  removePlugins: 'exportpdf',
  forcePasteAsPlainText: false,
  height: '75px',
  autoGrow_minHeight: 75,
  autoGrow_maxHeight: 300,
  autoGrow_bottomSpace: 0,
  font_defaultLabel: 'Arial',
  fontSize_defaultLabel: '12',
  font_names: 'Arial;Times New Roman;Verdana;Tahoma;Calibri;Courier New',
  toolbarGroups: [
    { name: 'document', groups: ['mode', 'document', 'doctools'] },
    { name: 'clipboard', groups: ['clipboard', 'undo'] },
    { name: 'editing', groups: ['find', 'selection', 'spellchecker', 'editing'] },
    '/',
    { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
    { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi', 'paragraph'] },
    { name: 'links', groups: ['links'] },
    { name: 'insert', groups: ['insert'] },
    '/',
    { name: 'styles', groups: ['styles'] },
    { name: 'colors', groups: ['colors'] },
    { name: 'tools', groups: ['tools'] },
    { name: 'others', groups: ['others'] },
  ],

  // 👇 Simplified font size dropdown with plain number labels
  fontSize: {
    options: [
      { title: '8', model: '8pt' },
      { title: '9', model: '9pt' },
      { title: '10', model: '10pt' },
      { title: '11', model: '11pt' },
      { title: '12', model: '12pt' },
      { title: '14', model: '14pt' },
      { title: '16', model: '16pt' },
      { title: '18', model: '18pt' },
      { title: '20', model: '20pt' },
      { title: '22', model: '22pt' },
      { title: '24', model: '24pt' },
      { title: '26', model: '26pt' },
      { title: '28', model: '28pt' },
      { title: '36', model: '36pt' },
      { title: '48', model: '48pt' },
      { title: '72', model: '72pt' }
    ],
    supportAllValues: false
  },

  removeButtons:
    'Source,Save,NewPage,Preview,Print,Templates,Cut,Copy,Paste,PasteText,PasteFromWord,Undo,Redo,Find,Replace,SelectAll,Scayt,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Strike,Subscript,Superscript,CopyFormatting,CreateDiv,Blockquote,BidiLtr,BidiRtl,Language,Unlink,Anchor,Image,Flash,Table,HorizontalRule,Smiley,SpecialChar,PageBreak,Iframe,Maximize,ShowBlocks,About'
};



    // Load slide data
    this.loadSlideData();
    setTimeout(() => {
      this.originalElements = JSON.stringify(this.elements);
      this.hasUnsavedChanges = false;
    }, 1000); 
  }

  private markElementsAsModified() {
    this.hasUnsavedChanges = JSON.stringify(this.elements) !== this.originalElements;
  }
  trackChanges() {
    this.elements.forEach(element => element.modified = true);
    this.hasUnsavedChanges = true;
  }
  checkForUnsavedChanges(): boolean {
    return this.hasUnsavedChanges;
  }

  @HostListener('window:resize')
  onResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.calculateGridDimensions();
      this.initializeGrid(); // Recalculate grid on resize
    }, 100);
  }
   hasSlideContent(): boolean {
    if (!this.elements || this.elements.length === 0) {
      return false;
    }

    return this.elements.some(element => {
      switch (element.type) {
        case 'text':
          return element.content && element.content.trim() !== '' && element.content.trim() !== '<p></p>';
        case 'image':
          return element.content && element.content.trim() !== '';
        case 'video':
          return element.content && element.content.trim() !== '';
        case 'audio':
          return element.content && element.content.trim() !== '';
        case 'button':
          return element.content && element.content.trim() !== '';
        default:
          return false;
      }
    });
  }
  private resizeTimeout: any;

  ngAfterViewInit() {
    this.initializeGrid();
    setTimeout(() => {
      this.showGridBlocks = true;
      setTimeout(() => this.showGridBlocks = false, 1000);
    }, 0);
    this.resizeListener = this.renderer.listen('window', 'resize', () => {
      this.updateElementPositions();
    });

    // Initial conversion to percentage-based positions
    this.convertElementsToPercentages();
    this.initializeZIndexValues();
    window.addEventListener('resize', this.handleWindowResize.bind(this));
  }

  ngOnDestroy() {
    // Clean up all event listeners
    document.removeEventListener('mousemove', this.onDragMove);
    document.removeEventListener('mouseup', this.onDragEnd);
    document.removeEventListener('mousemove', this.onResizeMove);
    document.removeEventListener('mouseup', this.onResizeEnd);
    window.removeEventListener('resize', this.onWindowResize);
    if (this.resizeListener) {
      this.resizeListener();
    }
    window.removeEventListener('resize', this.handleWindowResize.bind(this));

  }

  snapToElement(element: PageElement, targetElement: PageElement) {
    const targetCenterX = targetElement.xPercent + (targetElement.widthPercent / 2);
    const targetCenterY = targetElement.yPercent + (targetElement.heightPercent / 2);
    
    // Position the element so its center aligns with the target's center
    element.xPercent = targetCenterX - (element.widthPercent / 2);
    element.yPercent = targetCenterY - (element.heightPercent / 2);
    
    // Ensure the element stays within canvas boundaries (0-100%)
    element.xPercent = Math.max(0, Math.min(100 - element.widthPercent, element.xPercent));
    element.yPercent = Math.max(0, Math.min(100 - element.heightPercent, element.yPercent));
    
    // Update the absolute positions
    this.updateElementAbsolutePosition(element);
    
    // Mark changes as unsaved
    this.hasUnsavedChanges = true;
  }
  updateElementAbsolutePosition(element: PageElement) {
    if (!this.canvas) return;
    
    const canvasWidth = this.canvas.nativeElement.offsetWidth;
    const canvasHeight = this.canvas.nativeElement.offsetHeight;
    
    element.x = (element.xPercent / 100) * canvasWidth;
    element.y = (element.yPercent / 100) * canvasHeight;
    element.width = (element.widthPercent / 100) * canvasWidth;
    element.height = (element.heightPercent / 100) * canvasHeight;
  }
  selectElement(element: any, event: MouseEvent) {
    event.stopPropagation();
    this.selectedElement = element;
    
    if (event.shiftKey && this.lastSelectedElement && this.lastSelectedElement.id !== element.id) {
      this.snapToElement(element, this.lastSelectedElement);
    }
    
    this.lastSelectedElement = element;
    this.showCenterLine = true;
    
    const centerX = element.xPercent + (element.widthPercent / 2);
    element.isCenteredHorizontally = Math.abs(centerX - 50) < 1;
  }
  
  convertElementsToPercentages() {
    const canvasWidth = this.canvas.nativeElement.offsetWidth;
    const canvasHeight = this.canvas.nativeElement.offsetHeight;

    this.elements.forEach(element => {
      element.xPercent = (element.x / canvasWidth) * 100;
      element.yPercent = (element.y / canvasHeight) * 100;
      element.widthPercent = (element.width / canvasWidth) * 100;
      element.heightPercent = (element.height / canvasHeight) * 100;
    });
  }
  handleWindowResize() {
    if (this.elements && this.elements.length > 0) {
      const canvasElement = this.canvas.nativeElement;
      const canvasRect = canvasElement.getBoundingClientRect();
      
      this.canvasWidth = canvasRect.width;
      this.canvasHeight = canvasRect.height;
      
      this.elements.forEach(element => {
        this.updateElementAbsolutePosition(element);
        
        if (element.xPercent + element.widthPercent > 100) {
          element.xPercent = 100 - element.widthPercent;
          this.updateElementAbsolutePosition(element);
        }
        
        if (element.yPercent + element.heightPercent > 100) {
          element.yPercent = 100 - element.heightPercent;
          this.updateElementAbsolutePosition(element);
        }
      });
      this.cdr.detectChanges();
    }
  }

   updateElementPositions() {
    const canvasWidth = this.canvas.nativeElement.offsetWidth;
    const canvasHeight = this.canvas.nativeElement.offsetHeight;

    this.elements.forEach(element => {
      // Update absolute positions based on percentages
      element.x = (element.xPercent / 100) * canvasWidth;
      element.y = (element.yPercent / 100) * canvasHeight;
      element.width = (element.widthPercent / 100) * canvasWidth;
      element.height = (element.heightPercent / 100) * canvasHeight;
    });
  }
  // Helper method to add default video element (updated for percentages)
  addDefaultVideoElement() {
    const canvasWidth = this.canvas.nativeElement.offsetWidth;
    const canvasHeight = this.canvas.nativeElement.offsetHeight;
    
    // Use a standard 16:9 aspect ratio for videos
    const widthPercent = 40; // 40% of canvas width
    const width = (widthPercent / 100) * canvasWidth;
    
    // Calculate height based on 16:9 aspect ratio
    const aspectRatio = 16/9;
    const height = width / aspectRatio;
    const heightPercent = (height / canvasHeight) * 100;
    
    // Center the element
    const xPercent = (50 - widthPercent / 2);
    const yPercent = (50 - heightPercent / 2);
    
    this.elements.push({
      id: '00000000-0000-0000-0000-000000000000',
      type: 'video',
      x: (xPercent / 100) * canvasWidth,
      y: (yPercent / 100) * canvasHeight,
      width: width,
      height: height,
      xPercent,
      yPercent,
      widthPercent,
      heightPercent,
      content: '',
      requireUserToWatch: false,
      isYoutubeOrVimeo: false,
      sanitizedVideoUrl: null,
      localVideoUrl: null
    });
  }
  
  
  
  
  // Helper method to add default audio element (updated for percentages)
  addDefaultAudioElement() {
    const canvasWidth = this.canvas.nativeElement.offsetWidth;
    const canvasHeight = this.canvas.nativeElement.offsetHeight;
    const widthPercent = 40;
    const heightPercent = 10;
    const xPercent = (50 - widthPercent / 2);
    const yPercent = (50 - heightPercent / 2);
  
    this.elements.push({
      id: '00000000-0000-0000-0000-000000000000',
      type: 'audio',
      x: (xPercent / 100) * canvasWidth,
      y: (yPercent / 100) * canvasHeight,
      width: (widthPercent / 100) * canvasWidth,
      height: (heightPercent / 100) * canvasHeight,
      xPercent,
      yPercent,
      widthPercent,
      heightPercent,
      content: '',
      requireUserToWatch: false,
      autoPlay: false
    });
  }
  calculateGridDimensions() {
    this.cellWidthPercent = (100 / this.gridColumns) - this.gridGutterPercent; 
    this.cellHeightPercent = (100 / this.gridRows) - this.gridGutterPercent;
  }


  snapToGrid(value: number | { xPercent: number, yPercent: number }): number | { xPercent: number, yPercent: number } {
    if (typeof value !== 'number' && 'xPercent' in value && 'yPercent' in value) {
      const gridPos = this.pixelToGridPercent(value.xPercent, value.yPercent);
      return this.gridToPixelPercent(gridPos.col, gridPos.row);
    }
    const cellSize = this.cellWidthPercent + this.gridGutterPercent;
    return Math.round(value / cellSize) * cellSize;
  }
  calculateRelativePosition(element, parentElement) {
    const parentRect = parentElement.getBoundingClientRect();
    
    const relativeX = (element.xPercent / 100) * parentRect.width;
    const relativeY = (element.yPercent / 100) * parentRect.height;
    
    return { x: relativeX, y: relativeY };
  }
  
  startDrag(event: MouseEvent, element: PageElement) {
    event.preventDefault();
    event.stopPropagation();
        
    if (event.target instanceof HTMLElement && event.target.isContentEditable) return;
        
    this.dragging = true;
    this.selectedElement = element;
    
    this.showGridBlocks = true;
    this.showCenterLine = true;
    
    this.findAlignmentGuides();
         
    const canvasRect = this.canvas.nativeElement.getBoundingClientRect();
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.offsetX = event.clientX - (element.x + canvasRect.left);
    this.offsetY = event.clientY - (element.y + canvasRect.top);
    
    // Bring the element to front when dragging starts
    this.bringElementToFront(element);
        
    document.addEventListener('mousemove', this.onDragMove);
    document.addEventListener('mouseup', this.onDragEnd);
  }
  
  bringElementToFront(element: PageElement) {
    // Find the highest z-index
    // const highestZIndex = this.elements.reduce(
    //   (max, el) => (el.zIndex !== undefined && el.zIndex > max ? el.zIndex : max),
    //   0
    // );
    
    // // Set the selected element's z-index to be higher than the highest
    // element.zIndex = highestZIndex + 1;
  }
  
  


  onDragMove = (event: MouseEvent) => {
    if (this.dragging && this.selectedElement) {
      const canvasRect = this.canvas.nativeElement.getBoundingClientRect();
      const canvasWidth = canvasRect.width;
      const canvasHeight = canvasRect.height;
          
      let newX = event.clientX - this.offsetX - canvasRect.left;
      let newY = event.clientY - this.offsetY - canvasRect.top;
          
      let newXPercent = (newX / canvasWidth) * 100;
      let newYPercent = (newY / canvasHeight) * 100;
          
      newXPercent = Math.max(0, Math.min(100 - this.selectedElement.widthPercent, newXPercent));
      newYPercent = Math.max(0, Math.min(100 - this.selectedElement.heightPercent, newYPercent));
          
      this.selectedElement.xPercent = newXPercent;
      this.selectedElement.yPercent = newYPercent;
          
      this.selectedElement.x = (newXPercent / 100) * canvasWidth;
      this.selectedElement.y = (newYPercent / 100) * canvasHeight;
          
      const centerX = 50;
      const elementCenterX = this.selectedElement.xPercent + (this.selectedElement.widthPercent / 2);
      const centerY = 50;
      const elementCenterY = this.selectedElement.yPercent + (this.selectedElement.heightPercent / 2);
      
      this.selectedElement.isCenteredHorizontally = Math.abs(elementCenterX - centerX) < 0.5;
      this.selectedElement.isCenteredVertically = Math.abs(elementCenterY - centerY) < 0.5;
      
      if (Math.abs(elementCenterX - centerX) < 1) {
        this.selectedElement.xPercent = centerX - (this.selectedElement.widthPercent / 2);
        this.selectedElement.x = (this.selectedElement.xPercent / 100) * canvasWidth;
      }
      
      if (Math.abs(elementCenterY - centerY) < 1) {
        this.selectedElement.yPercent = centerY - (this.selectedElement.heightPercent / 2);
        this.selectedElement.y = (this.selectedElement.yPercent / 100) * canvasHeight;
      }
          
      this.findAlignmentGuides();
    }
  };
  
  
  
onDragEnd = () => {
  this.dragging = false;
  this.showGridBlocks = false;
  this.alignmentGuides = [];
  
  
  document.removeEventListener('mousemove', this.onDragMove);
  document.removeEventListener('mouseup', this.onDragEnd);
  this.markElementsAsModified();
};

  

startResize(event: MouseEvent, element: any, handle: string) {
  event.preventDefault();
  event.stopPropagation();
  
  // Get the canvas element
  const canvasElement = this.canvas.nativeElement;
  const canvasRect = canvasElement.getBoundingClientRect();
  
  // Store the initial mouse position
  const initialMouseX = event.clientX;
  const initialMouseY = event.clientY;
  
  // Store the initial element dimensions and position
  const initialX = element.xPercent;
  const initialY = element.yPercent;
  const initialWidth = element.widthPercent;
  const initialHeight = element.heightPercent;
  
  // Calculate aspect ratio if needed
  const aspectRatio = initialWidth / initialHeight;
  
  const mouseMoveHandler = (moveEvent: MouseEvent) => {
    const deltaX = moveEvent.clientX - initialMouseX;
    const deltaY = moveEvent.clientY - initialMouseY;
    
    const deltaXPercent = (deltaX / canvasRect.width) * 100;
    const deltaYPercent = (deltaY / canvasRect.height) * 100;
    
    let newX = initialX;
    let newY = initialY;
    let newWidth = initialWidth;
    let newHeight = initialHeight;
    
    if (handle.includes('left')) {
      newX = initialX + deltaXPercent;
      newWidth = initialWidth - deltaXPercent;
    } else if (handle.includes('right')) {
      newWidth = initialWidth + deltaXPercent;
    }
    
    if (handle.includes('top')) {
      newY = initialY + deltaYPercent;
      newHeight = initialHeight - deltaYPercent;
    } else if (handle.includes('bottom')) {
      newHeight = initialHeight + deltaYPercent;
    }
    
    const minSize = element.type === 'video' ? 20 : 5;
    
    if (newWidth >= minSize && newHeight >= minSize) {
      element.xPercent = newX;
      element.yPercent = newY;
      element.widthPercent = newWidth;
      element.heightPercent = newHeight;
      
      const elementCenterX = (element.xPercent + (element.widthPercent / 2));
      const elementCenterY = (element.yPercent + (element.heightPercent / 2));
      
      element.isCenteredHorizontally = Math.abs(elementCenterX - 50) < 0.5;
      element.isCenteredVertically = Math.abs(elementCenterY - 50) < 0.5;

      this.hasUnsavedChanges = true;
    }
  };
  
  const mouseUpHandler = () => {
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
  };
  
  document.addEventListener('mousemove', mouseMoveHandler);
  document.addEventListener('mouseup', mouseUpHandler);
}

  onResizeMove = (event: MouseEvent) => {
    if (this.resizing && this.selectedElement) {
      this.handleResize(event);
    }
  };

  onResizeEnd = () => {
    this.resizing = false;
    this.showGridBlocks = false;
    this.alignmentGuides = [];
    
    // Clear centering flags when resize ends
    if (this.selectedElement) {
      this.selectedElement.isCenteredHorizontally = false;
      this.selectedElement.isCenteredVertically = false;
    }
    
    document.removeEventListener('mousemove', this.onResizeMove);
    document.removeEventListener('mouseup', this.onResizeEnd);
    this.markElementsAsModified();
  };
  
  

  handleResize(event: MouseEvent) {
    if (!this.selectedElement || !this.canvas?.nativeElement) return;
    
    const canvasWidth = this.canvas.nativeElement.offsetWidth;
    const canvasHeight = this.canvas.nativeElement.offsetHeight;
    const deltaXPercent = ((event.clientX - this.startX) / canvasWidth) * 100;
    const deltaYPercent = ((event.clientY - this.startY) / canvasHeight) * 100;
    
    let newWidthPercent = this.startWidthPercent;
    let newHeightPercent = this.startHeightPercent;
    let newXPercent = this.startXPercent;
    let newYPercent = this.startYPercent;
    
    // Determine minimum width and height based on element type
    const minWidthPercent = this.selectedElement.type === 'video' ? 
      this.MIN_VIDEO_WIDTH_PERCENT : this.cellWidthPercent;
    const minHeightPercent = this.selectedElement.type === 'video' ? 
      this.MIN_VIDEO_HEIGHT_PERCENT : this.cellHeightPercent;
    
    switch (this.resizeHandle) {
      case 'top-left':
        newWidthPercent = Math.max(minWidthPercent, this.startWidthPercent - deltaXPercent);
        newHeightPercent = Math.max(minHeightPercent, this.startHeightPercent - deltaYPercent);
        newXPercent = this.startXPercent + (this.startWidthPercent - newWidthPercent); 
        newYPercent = this.startYPercent + (this.startHeightPercent - newHeightPercent); 
        break;
      case 'top-right':
        newWidthPercent = Math.max(minWidthPercent, this.startWidthPercent + deltaXPercent);
        newHeightPercent = Math.max(minHeightPercent, this.startHeightPercent - deltaYPercent);
        newYPercent = this.startYPercent + (this.startHeightPercent - newHeightPercent); 
        break;
      case 'bottom-left':
        newWidthPercent = Math.max(minWidthPercent, this.startWidthPercent - deltaXPercent);
        newHeightPercent = Math.max(minHeightPercent, this.startHeightPercent + deltaYPercent);
        newXPercent = this.startXPercent + (this.startWidthPercent - newWidthPercent); 
        break;
      case 'bottom-right':
        newWidthPercent = Math.max(minWidthPercent, this.startWidthPercent + deltaXPercent);
        newHeightPercent = Math.max(minHeightPercent, this.startHeightPercent + deltaYPercent);
        break;
      case 'top-center':
        newHeightPercent = Math.max(minHeightPercent, this.startHeightPercent - deltaYPercent);
        newYPercent = this.startYPercent + (this.startHeightPercent - newHeightPercent); 
        break;
      case 'bottom-center':
        newHeightPercent = Math.max(minHeightPercent, this.startHeightPercent + deltaYPercent);
        break;
      case 'left-center':
        newWidthPercent = Math.max(minWidthPercent, this.startWidthPercent - deltaXPercent);
        newXPercent = this.startXPercent + (this.startWidthPercent - newWidthPercent); 
        break;
      case 'right-center':
        newWidthPercent = Math.max(minWidthPercent, this.startWidthPercent + deltaXPercent);
        break;
    }
    
    // Apply global constraints
    newWidthPercent = Math.max(minWidthPercent, Math.min(100, newWidthPercent));
    newHeightPercent = Math.max(minHeightPercent, Math.min(100, newHeightPercent));
    newXPercent = Math.max(0, Math.min(100 - newWidthPercent, newXPercent));
    newYPercent = Math.max(0, Math.min(100 - newHeightPercent, newYPercent));
    
    // Snap to grid
    const widthInCells = Math.round(newWidthPercent / (this.cellWidthPercent + this.gridGutterPercent));
    const heightInCells = Math.round(newHeightPercent / (this.cellHeightPercent + this.gridGutterPercent));
    newWidthPercent = (widthInCells * (this.cellWidthPercent + this.gridGutterPercent)) - this.gridGutterPercent;
    newHeightPercent = (heightInCells * (this.cellHeightPercent + this.gridGutterPercent)) - this.gridGutterPercent;
    
    const gridPos = this.pixelToGridPercent(newXPercent, newYPercent);
    const snappedPos = this.gridToPixelPercent(gridPos.col, gridPos.row);
    newXPercent = snappedPos.xPercent;
    newYPercent = snappedPos.yPercent;
    
    // Update element properties
    this.selectedElement.xPercent = newXPercent;
    this.selectedElement.yPercent = newYPercent;
    this.selectedElement.widthPercent = newWidthPercent;
    this.selectedElement.heightPercent = newHeightPercent;
    const elementCenterX = (this.selectedElement.xPercent + (this.selectedElement.widthPercent / 2));
    const elementCenterY = (this.selectedElement.yPercent + (this.selectedElement.heightPercent / 2));
    
    this.selectedElement.isCenteredHorizontally = Math.abs(elementCenterX - 50) < 0.5;
    this.selectedElement.isCenteredVertically = Math.abs(elementCenterY - 50) < 0.5;
    
    this.findAlignmentGuides();
  }
  

  pixelToGridPercent(xPercent: number, yPercent: number): { col: number; row: number } {
    const col = Math.round(xPercent / (this.cellWidthPercent + this.gridGutterPercent));
    const row = Math.round(yPercent / (this.cellHeightPercent + this.gridGutterPercent));
    return { col, row };
  }

  gridToPixelPercent(col: number, row: number): { xPercent: number; yPercent: number } {
    const xPercent = (col * (this.cellWidthPercent + this.gridGutterPercent)) - this.gridGutterPercent;
    const yPercent = (row * (this.cellHeightPercent + this.gridGutterPercent)) - this.gridGutterPercent;
    return { xPercent, yPercent };
  }

  toggleBlockMenu() {
    this.showBlockMenu = !this.showBlockMenu;
  }

  hideBlockMenu() {
    this.showBlockMenu = false;
  }

  onElementHover(element: PageElement) {
    this.hoveredElement = element;
  }

  onElementLeave() {
    this.hoveredElement = null;
  }


  getToolbarPosition() {
    if (!this.selectedElement) return {};

    return {
      position: 'absolute',
      top: `${this.selectedElement.y - 40}px`,
      left: `${this.selectedElement.x}px`,
      zIndex: '100'
    };
  }

  deselectAll() {
    this.selectedElement = null;
    this.hoveredElement = null;
    this.dragging = false;
    this.resizing = false;
    this.showCenterLine = false;
    this.showGridBlocks = false;
    this.showTextFormatPanel = false;
  }
  updateElementContent(element: PageElement, event: Event) {
    const target = event.target as HTMLElement;
    if (element && target) {
      element.content = target.innerText;
      this.markElementsAsModified();
    }
    
  }

  isGridCellHighlighted(row: number, col: number): boolean {
    if (!this.selectedElement) return false;

    const startPos = this.pixelToGridPercent(this.selectedElement.xPercent, this.selectedElement.yPercent);
    const endPos = this.pixelToGridPercent(
      this.selectedElement.xPercent + this.selectedElement.widthPercent,
      this.selectedElement.yPercent + this.selectedElement.heightPercent
    );

    return col >= startPos.col && col <= endPos.col && row >= startPos.row && row <= endPos.row;
  }

  getCellWidth(): number {
    if (!this.canvas) return 60;
    const canvasWidth = this.canvas.nativeElement.offsetWidth;
    return (canvasWidth * this.cellWidthPercent) / 100; 
  }

  getCellHeight(): number {
    if (!this.canvas) return 60; 
    const canvasHeight = this.canvas.nativeElement.offsetHeight;
    return (canvasHeight * this.cellHeightPercent) / 100; 
  }

  initializeGrid() {
    if (!this.canvas) return;

    const style = document.documentElement.style;
    style.setProperty('--grid-columns', this.gridColumns.toString());
    style.setProperty('--grid-rows', this.gridRows.toString());
    style.setProperty('--grid-gutter', `${this.gridGutterPercent}%`); 
    style.setProperty('--grid-color', 'rgba(200, 200, 200, 0.3)');
    style.setProperty('--grid-highlight-color', 'rgba(0, 123, 255, 0.2)');
    style.setProperty('--cell-max-width', `${this.cellWidthPercent}%`);
    style.setProperty('--row-height', `${this.cellHeightPercent}%`);

    this.elements.forEach(element => {
      const gridPos = this.pixelToGridPercent(element.xPercent, element.yPercent);
      const snappedPos = this.gridToPixelPercent(gridPos.col, gridPos.row);

      element.xPercent = snappedPos.xPercent;
      element.yPercent = snappedPos.yPercent;

      const widthInCells = Math.round(element.widthPercent / (this.cellWidthPercent + this.gridGutterPercent));
      const heightInCells = Math.round(element.heightPercent / (this.cellHeightPercent + this.gridGutterPercent));
      element.widthPercent = (widthInCells * (this.cellWidthPercent + this.gridGutterPercent)) - this.gridGutterPercent;
      element.heightPercent = (heightInCells * (this.cellHeightPercent + this.gridGutterPercent)) - this.gridGutterPercent;
    });

    window.removeEventListener('resize', this.onWindowResize);
    window.addEventListener('resize', this.onWindowResize);
  }


   onWindowResize = () => {
    this.initializeGrid();
  };

  findAlignmentGuides() {
    if (!this.selectedElement || !this.canvas) return;
    
    // Clear previous guides
    this.alignmentGuides = [];
    
    const canvasWidth = this.canvas.nativeElement.offsetWidth;
    const canvasHeight = this.canvas.nativeElement.offsetHeight;
    
    // Add center guides for the canvas
    const canvasCenterX = 50;
    const canvasCenterY = 50;
    
    const selectedCenterX = this.selectedElement.xPercent + (this.selectedElement.widthPercent / 2);
    const selectedCenterY = this.selectedElement.yPercent + (this.selectedElement.heightPercent / 2);
    
    // Check for canvas center alignment
    if (Math.abs(selectedCenterX - canvasCenterX) < 1) {
      this.alignmentGuides.push({ xPercent: canvasCenterX });
      // Snap to center
      this.selectedElement.xPercent = canvasCenterX - (this.selectedElement.widthPercent / 2);
      this.selectedElement.isCenteredHorizontally = true;
    } else {
      this.selectedElement.isCenteredHorizontally = false;
    }
    
    if (Math.abs(selectedCenterY - canvasCenterY) < 1) {
      this.alignmentGuides.push({ yPercent: canvasCenterY });
      // Snap to center
      this.selectedElement.yPercent = canvasCenterY - (this.selectedElement.heightPercent / 2);
      this.selectedElement.isCenteredVertically = true;
    } else {
      this.selectedElement.isCenteredVertically = false;
    }
    
    // Check alignment with other elements
    this.elements.forEach(element => {
      if (element.id === this.selectedElement?.id) return;
      
      // Convert percentages to pixels for alignment comparison
      const selX = (this.selectedElement.xPercent / 100) * canvasWidth;
      const selY = (this.selectedElement.yPercent / 100) * canvasHeight;
      const selWidth = (this.selectedElement.widthPercent / 100) * canvasWidth;
      const selHeight = (this.selectedElement.heightPercent / 100) * canvasHeight;
      const elX = (element.xPercent / 100) * canvasWidth;
      const elY = (element.yPercent / 100) * canvasHeight;
      const elWidth = (element.widthPercent / 100) * canvasWidth;
      const elHeight = (element.heightPercent / 100) * canvasHeight;
      
      // Horizontal alignment guides (within 1% tolerance)
      const tolerance = 1 / 100 * canvasWidth; // 1% of canvas width in pixels
      
      // Left edges alignment
      if (Math.abs(selX - elX) < tolerance) {
        this.alignmentGuides.push({ xPercent: element.xPercent });
        this.selectedElement.xPercent = element.xPercent;
      }
      
      // Right edges alignment
      if (Math.abs(selX + selWidth - (elX + elWidth)) < tolerance) {
        this.alignmentGuides.push({ xPercent: element.xPercent + element.widthPercent - this.selectedElement.widthPercent });
        this.selectedElement.xPercent = element.xPercent + element.widthPercent - this.selectedElement.widthPercent;
      }
      
      // Vertical alignment guides (within 1% tolerance)
      const verticalTolerance = 1 / 100 * canvasHeight; // 1% of canvas height in pixels
      
      // Top edges alignment
      if (Math.abs(selY - elY) < verticalTolerance) {
        this.alignmentGuides.push({ yPercent: element.yPercent });
        this.selectedElement.yPercent = element.yPercent;
      }
      
      // Bottom edges alignment
      if (Math.abs(selY + selHeight - (elY + elHeight)) < verticalTolerance) {
        this.alignmentGuides.push({ yPercent: element.yPercent + element.heightPercent - this.selectedElement.heightPercent });
        this.selectedElement.yPercent = element.yPercent + element.heightPercent - this.selectedElement.heightPercent;
      }
      
      // Center alignment
      const elCenterX = elX + elWidth / 2;
      const selCenterX = selX + selWidth / 2;
      if (Math.abs(selCenterX - elCenterX) < tolerance) {
        const centerXPercent = element.xPercent + (element.widthPercent / 2) - (this.selectedElement.widthPercent / 2);
        this.alignmentGuides.push({ xPercent: element.xPercent + (element.widthPercent / 2) });
        this.selectedElement.xPercent = centerXPercent;
      }
      
      const elCenterY = elY + elHeight / 2;
      const selCenterY = selY + selHeight / 2;
      if (Math.abs(selCenterY - elCenterY) < verticalTolerance) {
        const centerYPercent = element.yPercent + (element.heightPercent / 2) - (this.selectedElement.heightPercent / 2);
        this.alignmentGuides.push({ yPercent: element.yPercent + (element.heightPercent / 2) });
        this.selectedElement.yPercent = centerYPercent;
      }
    });
    
    // Update absolute positions after any snapping
    this.updateElementAbsolutePosition(this.selectedElement);
  }
  addElement(type: 'text' | 'image' | 'video' | 'button' | 'audio') {
    const canvasWidth = this.canvas.nativeElement.offsetWidth;
    const canvasHeight = this.canvas.nativeElement.offsetHeight;
          
    let widthPercent = 30;         
    let heightPercent = 20;
    let yPositionPercent = 50;    
  
    if (type === 'image') {
      widthPercent = 40;
      heightPercent = 30;
    } else if (type === 'video') {
      widthPercent = 50;
      heightPercent = 40;
    } else if (type === 'button') {
      widthPercent = 20;
      heightPercent = 8;
    } else if (type === 'text') {
      widthPercent = 30;
      heightPercent = 10;       
      yPositionPercent = 10;
    }
          
    // Center the element
    const xPercent = (50 - widthPercent / 2);
    const yPercent = (yPositionPercent - heightPercent / 2);
          
    const highestZIndex = this.elements.reduce((max, el) => 
      el.zIndex !== undefined && el.zIndex > max ? el.zIndex : max, 0);
          
    const newElement: PageElement = {
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // ✅ Updated to use unique ID
      type,
      x: (xPercent / 100) * canvasWidth,
      y: (yPercent / 100) * canvasHeight,
      width: (widthPercent / 100) * canvasWidth,
      height: (heightPercent / 100) * canvasHeight,
      xPercent,
      yPercent,
      widthPercent,
      heightPercent,
      content: '',
      zIndex: highestZIndex + 1,
      style: {
        bold: false,
        italic: false,
        underline: false,
        fontSize: 14,
        color: '#000000',
        backgroundColor: 'transparent',
        textAlign: 'center'
      }
    };
          
    if (type === 'text') {
      newElement.content = '<span style="font-family: HelveticaNeuelight; font-size: 18px;">Enter your text here</span>';
    } else if (type === 'button') {
      newElement.content = 'Click me';
      newElement.hyperlink = '';
      newElement.style.fontSize = 16;
      newElement.style.color = '#ffffff';
      newElement.style.backgroundColor = '#007bff';
    } else if (type === 'video') {
      newElement.videoUrl = '';
      newElement.sanitizedVideoUrl = '';
      newElement.localVideoUrl = null;
      newElement.requireUserToWatch = false;
      newElement.isYoutubeOrVimeo = false;
    } else if (type === 'audio') {
      newElement.requireUserToWatch = false;
      newElement.autoPlay = false;
    }
          
    this.elements.push(newElement);
    this.selectedElement = newElement;
    this.showGridBlocks = true;
    setTimeout(() => (this.showGridBlocks = false), 1500);
        
    setTimeout(() => {
      this.editElement(newElement);
            
      if (type === 'text') {
        setTimeout(() => this.adjustTextElementHeight(newElement), 300);
      }
    }, 100);
        
    this.markElementsAsModified();
  }
  adjustTextElementHeight(element: PageElement, forceAdjust: boolean = false) {
    if (element.type !== 'text') return;
    if (!forceAdjust && !element.shouldAdjustHeight) return;
    
    setTimeout(() => {
      const elementId = `element-${element.id || element.contentFileId}`;
      const domElement = document.getElementById(elementId);
      if (!domElement) return;
      
      const textDiv = domElement.querySelector('.ck-content') as HTMLElement;
      if (!textDiv) return;
      
      const canvasHeight = this.canvas.nativeElement.offsetHeight;
      const containerWidth = domElement.offsetWidth;
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        position: absolute;
        visibility: hidden;
        width: ${containerWidth}px;
        height: auto;
        padding: 8px;
        box-sizing: border-box;
        white-space: normal;
        overflow-wrap: break-word;
        line-height: 1.5;
      `;
      // Clone the content with all its styles
      tempContainer.innerHTML = textDiv.innerHTML;
      document.body.appendChild(tempContainer);
      
      const contentHeight = tempContainer.scrollHeight;
      document.body.removeChild(tempContainer);
      
      // Add extra buffer for padding and line-height variations
      const paddingBuffer = 40;
      const totalHeight = contentHeight + paddingBuffer;
      const newHeightPercent = (totalHeight / canvasHeight) * 100;
      
      element.heightPercent = Math.max(newHeightPercent, 5);
      element.height = (element.heightPercent / 100) * canvasHeight;
      
      if (!forceAdjust) {
        element.shouldAdjustHeight = false;
      }
      
      this.cdr.detectChanges();
      this.markElementsAsModified();
    }, 250);
  }

  editElement(element: any) {
    this.selectedElement = element;
  
    if (element.type === 'text') {
      const defaultContent = '<span style="font-family: HelveticaNeuelight; font-size: 18px;">Enter your text here</span>';
      this.editorControl.setValue(element.content || defaultContent);
      this.detectFormattingFromContent(element.content || defaultContent);
      
      setTimeout(() => {
        this.showCKEditor = true;
        setTimeout(() => {
          if (this.editorInstance) {
            try {
              this.editorInstance.setData(this.editorControl.value);
              this.editorInstance.focus();
            } catch (e) {}
          }
        }, 300);
      }, 100);
    } else if (element.type === 'button') {
      this.buttonText = element.content || 'Click me';
      this.buttonHyperlink = element.hyperlink || '';
      this.buttonColor = element.style?.backgroundColor || '#007bff';
      this.buttonTextColor = element.style?.color || '#ffffff';
      this.showButtonDialog = true;
    } else if (element.type === 'image') {
      this.imageUrl = element.content || '';
      this.tempImageElement = element;
      this.showImageDialog = true;
    } else if (element.type === 'video') {
      // Only set videoUrl to element.content if it's a YouTube/Vimeo video
      this.videoUrl = element.isYoutubeOrVimeo ? (element.videoUrl || element.content || '') : '';
      this.localVideoUrl = element.localVideoUrl || null;
      this.requireUserToWatch = element.requireUserToWatch || false;
      this.isYoutubeOrVimeo = element.isYoutubeOrVimeo || false;
      this.uploadedVideo = element.localVideoUrl ? element.localVideoUrl as File : null;
  
      // Check if the videoUrl is a valid YouTube/Vimeo URL
      if (this.videoUrl && !this.isYoutubeOrVimeo) {
        this.isYoutubeOrVimeo = this.videoUrl.includes('youtube.com') ||
                               this.videoUrl.includes('youtu.be') ||
                               this.videoUrl.includes('vimeo.com');
      }
  
      // Trigger URL processing only if it's a valid YouTube/Vimeo URL
      if (this.videoUrl && this.isYoutubeOrVimeo) {
        this.onVideoUrlInput();
      } else {
        // Clear sanitizedVideoUrl for local videos or invalid URLs
        this.sanitizedVideoUrl = null;
      }
  
      this.showVideoDialog = true;
    } else if (element.type === 'audio') {
      // Check if this is a replace operation (has existing content)
      const isReplaceOperation = element.content || element.contentFileId;
      
      if (isReplaceOperation) {
        // Clear existing audio content for replace operation
        element.file = null;
        element.content = null;
        element.contentFileId = null;
        element.isSavedToAPI = false;
      }
      
      this.requireUserToWatch = element.requireUserToWatch || false;
      this.autoPlay = element.autoPlay || false;
      this.showAudioDialog = true;
    }
    this.markElementsAsModified();
  }




  getSafeHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
  duplicateElement(element: PageElement) {
    const duplicate: PageElement = JSON.parse(JSON.stringify(element));
    
    // Generate unique IDs for the new element
    duplicate.id = `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    duplicate.fieldId = undefined;
    duplicate.fieldValueId = undefined;
    duplicate.contentFileId = undefined;
    
    duplicate.groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Offset position
    if (duplicate.x !== undefined && duplicate.y !== undefined) {
      duplicate.x = element.x + this.cellWidth + this.gridGutter;
      duplicate.y = element.y + this.cellHeight + this.gridGutter;
    }
    
    duplicate.xPercent = element.xPercent + 5;
    duplicate.yPercent = element.yPercent + 5;
    
    // Find the highest z-index and increment it
    const highestZIndex = this.elements.reduce((max, el) => 
      el.zIndex !== undefined && el.zIndex > max ? el.zIndex : max, 0);
    duplicate.zIndex = highestZIndex + 1; 
    
    // Handle image files differently
    if (element.type === 'image') {
      duplicate.file = null;
      
      const addElementAfterProcessing = () => {
        this.elements.push(duplicate);
        this.selectedElement = duplicate;
        this.showGridBlocks = true;
        setTimeout(() => this.showGridBlocks = false, 1500);
        this.markElementsAsModified();
      };
      
      if (element.content && typeof element.content === 'string' && element.content.startsWith('data:image')) {
        this.base64ToFile(element.content, `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`)
          .then(file => {
            duplicate.file = file;
            addElementAfterProcessing();
          })
          .catch(err => {
            console.error('Error converting base64 to file:', err);
            this.notificationService.errorTopRight('Error duplicating image');
          });
        return;
      }
      else if (element.content && typeof element.content === 'string' && !element.content.startsWith('data:')) {
        this.urlToFile(element.content)
          .then(file => {
            duplicate.file = file;
            addElementAfterProcessing();
          })
          .catch(err => {
            console.error('Error converting URL to file:', err);
            this.notificationService.errorTopRight('Error duplicating image');
          });
        return;
      }
    }
    
    // For non-image elements or images without content to process
    this.elements.push(duplicate);
    this.selectedElement = duplicate;
    this.showGridBlocks = true;
    setTimeout(() => this.showGridBlocks = false, 1500);
    this.markElementsAsModified(); // ✅ Mark changes
  }
  

  
  urlToFile(url: string): Promise<File> {
    return new Promise((resolve, reject) => {
      fetch(url, {
        mode: 'cors', 
        cache: 'no-cache'
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        return response.blob();
      })
      .then(blob => {
        // Extract filename from URL
        const urlParts = url.split('/');
        const filename = urlParts[urlParts.length - 1] || `image-${Date.now()}.png`;
        
        // Create a File object from the blob
        const file = new File([blob], filename, { type: blob.type });
        resolve(file);
      })
      .catch(error => {
        console.error('Error fetching image:', error);
        reject(error);
      });
    });
  }
   base64ToFile(base64String: string, filename: string): Promise<File> {
    return new Promise((resolve, reject) => {
      try {
        // Extract the base64 data
        const dataUrlParts = base64String.split(',');
        const mimeMatch = dataUrlParts[0].match(/:(.*?);/);
        
        if (!mimeMatch || dataUrlParts.length < 2) {
          reject(new Error('Invalid base64 string format'));
          return;
        }
        
        const mime = mimeMatch[1];
        const bstr = atob(dataUrlParts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        
        const file = new File([u8arr], filename, { type: mime });
        resolve(file);
      } catch (error) {
        reject(error);
      }
    });
  }
  // Save button
  onSaveClick(confirmBox: TemplateRef<any>) {
    this.service.getAllCourseLanguages(this.CourseIdNew).subscribe(data => {
      if (!this.isEditMode) {
        if (data && data.length > 1) {
          this.openConfirmDialogs(confirmBox);
        } else {
          this.executeSave(false);
        }
      } else {
        this.executeSave(false);
      }
    });
  }
  
  confirmYes() {
    // User wants to push to alternate versions, so pushToAlternateVersions should be TRUE
    this.executeSave(true, false);
    this.modalReferenceforSlideConfirm.close();
  }
  
  confirmNo() {
    // User doesn't want to push to alternate versions, so pushToAlternateVersions should be FALSE
    this.executeSave(false, true);
    
    this.modalReferenceforSlideConfirm.close();
    
    this.service.DeleteFromAlternateLanguageSlides(
      window.sessionStorage.getItem('exportReqId'),
      this.selectedLanguage
    ).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          // Handle success
        } else {
          // Handle failure
        }
      },
      error: (error) => {
        // Handle error
      }
    });
  }
  
  private executeSave(pushToAlternateVersions: boolean, callSlideUpdateApi: boolean = false) {
    if (this.SlideType === 'content') {
      // Image validation for content slide
      const imageElements = this.elements.filter(element => element.type === 'image');
      const emptyImageElements = imageElements.filter(element => !element.content);
  
      if (emptyImageElements.length > 0) {
        this.notificationService.errorTopRight('Please upload all images before saving');
        return;
      }
  
      this.saveContentSlide(pushToAlternateVersions);
    } 
    else if (this.SlideType === 'audio-content') {
      // Audio element validation
      const audioElement = this.elements.find(element => element.type === 'audio');
      if (!audioElement) {
        this.notificationService.errorTopRight('No audio element found');
        return;
      }
  
      if (!audioElement.content && !audioElement.file) {
        this.notificationService.errorTopRight('Please upload audio content before saving');
        return;
      }
  
      // Image validation for audio-content slide
      const imageElements = this.elements.filter(element => element.type === 'image');
      const emptyImageElements = imageElements.filter(element => !element.content);
  
      if (emptyImageElements.length > 0) {
        this.notificationService.errorTopRight('Please upload all images before saving');
        return;
      }
  
      this.saveAudioContentSlide(pushToAlternateVersions);
    } 
    else {
      this.saveSlideData(pushToAlternateVersions);
    }
  
    this.originalElements = JSON.stringify(this.elements);
    this.hasUnsavedChanges = false;
    this.isEditMode = true;
  }
  
  resetUnsavedChangesTracking() {
    this.originalElements = JSON.stringify(this.elements);
    
    this.hasUnsavedChanges = false;

  }
  confirmEditWithout() {
    if (this.SelectedSlideId) {
      this.slideStateService.setSelectedSlideId(this.SelectedSlideId);
      localStorage.setItem('selectedSlideId', this.SelectedSlideId);
    }
    const isEdit = this.isEditMode ? 'true' : 'false';
    
    this.router.navigate([
      '/training-courses/training-courses-editor/' +
      this.CourseIdNew + '/' +
      this.selectedLanguage + '/' +
      this.CourseId + '/' +
      this.buttonAction + '/' +
      isEdit
    ], {
      state: { selectedSlideId: this.SelectedSlideId }
    });
    
    this.closeAllDialogs();
  }
  confirmAddWithoutSavingData() {
    if (this.SelectedSlideId) {
      this.slideStateService.setSelectedSlideId(this.SelectedSlideId);
      localStorage.setItem('selectedSlideId', this.SelectedSlideId);
    }
  
    this.service.DeleteLmsSlideAll(window.sessionStorage.getItem('exportReqId')).subscribe({
      next: (response) => {
        console.log('Delete API called', response);
        if (response.isSuccess) {
          console.log('All slides deleted successfully');
        }
        // Navigate regardless of success/failure
        this.navigateToEditor();
      },
      error: (error) => {
       
        this.navigateToEditor();
      }
    });
  
    this.closeAllDialogs();
  }
  navigateToEditor() {
    const isEdit = 'false';
    this.router.navigate([
      '/training-courses/training-courses-editor/' +
      this.CourseIdNew + '/' +
      this.selectedLanguage + '/' +
      this.CourseId + '/' +
      this.buttonAction + '/' +
      isEdit
    ], {
      state: { selectedSlideId: this.SelectedSlideId }
    });
  }
  
  @HostListener('window:beforeunload', ['$event'])
unloadNotification($event: any): void {
  if (this.hasUnsavedChanges) {
    $event.returnValue = true;
  }
}
closeEditor() {
  console.log('=== DEBUG closeEditor ===');
  console.log('isEditMode:', this.isEditMode);
  console.log('hasSlideContent():', this.hasSlideContent());
  console.log('checkForUnsavedChanges():', this.checkForUnsavedChanges());
  
  if (!this.isEditMode) {
    this.routeToSlideEditorinAddMode();
    return;
  }
  
  if (this.isEditMode && this.checkForUnsavedChanges()) {
    console.log('Opening dialog because there are unsaved changes');
    this.routeToSlideEditor();
    return;
  }
  
  console.log('Exiting directly without dialog - no unsaved changes');
  this.confirmEditWithout();
}


handleAddModeWithoutContent() {
  this.deleteSlideAndNavigateBack();
  this.service.DeleteLmsSlideAll(window.sessionStorage.getItem('exportReqId')).subscribe({
    next: (response) => {
      if (response.isSuccess) {
        this.confirmEditWithout();
      }
    },
    error: (error) => {
      console.error('Error deleting slides:', error);
      // Handle error appropriately
    }
  });
}


deleteSlideAndNavigateBack() {
  this.service.DeleteSlides({}, this.SelectedSlideId).subscribe({
    next: (response) => {
      if (response.isSuccess) {
        this.closeAllDialogs(); // Use centralized method
      } else {
        console.error('Failed to delete slide');
      }
    },
    error: (error) => {
      console.error('Error deleting slide:', error);
    }
  });
}
  openConfirmDialogs(confirmBox: TemplateRef<any>) {
    this.modalReferenceforSlideConfirm = this.dialog.open(confirmBox, {
      width: '400px'
    });
  }
  routeToSlideEditor() {
    this.closeAllDialogs();
    
    this.dialogRef = this.dialog.open(this.confirmEditorDialog, {
      width: '450px',
      disableClose: true 
    });
  }
  
 
routeToSlideEditorinAddMode() {
  // Close any existing dialogs first
  this.closeAllDialogs();
  
  this.dialogRefinAddMode = this.dialog.open(this.confirmEditorDialogInaddMode, {
    width: '450px',
    disableClose: true 
  });
}
closeAllDialogs() {
  if (this.dialogRef) {
    this.dialogRef.close();
    this.dialogRef = null;
  }
  if (this.dialogRefinAddMode) {
    this.dialogRefinAddMode.close();
    this.dialogRefinAddMode = null;
  }
}


  loadSlideData() {
    this.service.GetAllLmsSlideGroupFieldsandData(this.SelectedSlideId).subscribe({
      next: (data) => {
        if (data) {
          this.elements = [];  
          const canvasWidth = this.canvas.nativeElement.offsetWidth;
          const canvasHeight = this.canvas.nativeElement.offsetHeight;
  
  
          const videoData = data.uploadLmsSlideFileModelData?.find(x => x.type === 'video');
          const audioData = data.uploadLmsSlideFileModelData?.find(x => x.type === 'audio-content');
  
          if (this.SlideType === 'video' && videoData) {
            try {
              const position = JSON.parse(videoData.position || '{}');
              const xPercent = position.xPercent || 0;
              const yPercent = position.yPercent || 0;
              const widthPercent = position.widthPercent || 40;
              const heightPercent = position.heightPercent || 30;
  
              const videoElement = {
                id: videoData.id,
                type: 'video',
                x: (xPercent / 100) * canvasWidth,
                y: (yPercent / 100) * canvasHeight,
                width: (widthPercent / 100) * canvasWidth,
                height: (heightPercent / 100) * canvasHeight,
                xPercent,
                yPercent,
                widthPercent,
                heightPercent,
                content: videoData.content || '',
                requireUserToWatch: videoData.isRequired,
                isYoutubeOrVimeo: false,
                sanitizedVideoUrl: null,
                localVideoUrl: null
              };
  
              if (videoData.content && (
                videoData.content.includes('youtube.com') ||
                videoData.content.includes('youtu.be') ||
                videoData.content.includes('vimeo.com'))) {
                videoElement.isYoutubeOrVimeo = true;
                this.processVideoElement(videoElement);
              } else if (videoData.url && videoData.url.trim() !== 'http://172.191.225.236:8080/Admin/LmsSlides/videoPath/') {
                videoElement.localVideoUrl = this.getSafeVideoUrl(videoData.url);
              } else if (videoData.content) {
                videoElement.localVideoUrl = this.getSafeVideoUrl(videoData.content);
              }
  
              this.elements.push(videoElement);
            } catch (e) {
              console.error('Error parsing video data:', e);
              this.addDefaultVideoElement();
            }
          }
          else if (this.SlideType === 'video') {
            this.addDefaultVideoElement();
          }
  
          if (this.SlideType === 'audio-content'&& audioData) {
            try {
              const position = JSON.parse(audioData.position || '{}');
              const xPercent = position.xPercent || 0;
              const yPercent = position.yPercent || 0;
              const widthPercent = position.widthPercent || 40;
              const heightPercent = position.heightPercent || 10;
  
              const audioElement = {
                id: audioData.id,
                type: 'audio',
                x: (xPercent / 100) * canvasWidth,
                y: (yPercent / 100) * canvasHeight,
                width: (widthPercent / 100) * canvasWidth,
                height: (heightPercent / 100) * canvasHeight,
                xPercent,
                yPercent,
                widthPercent,
                heightPercent,
                content: audioData.fileName ? audioData.url : audioData.content,
                requireUserToWatch: audioData.isRequired || false,
                autoPlay: audioData.isPlay || false
              };
  
              this.elements.push(audioElement);
            } catch (e) {
              console.error('Error parsing audio data:', e);
              this.addDefaultAudioElement();
            }
          }
          else if (this.SlideType === 'audio-content') {
            this.addDefaultAudioElement();
          }
  
          // Load text, button, and image elements
          if (data.lmsSlideGroupViewDatas?.length) {
            data.lmsSlideGroupViewDatas.forEach((group) => {
              group.lmsSlideGroupFieldViews.forEach((field) => {
                try {
                  const defaultValue = JSON.parse(field.defaultValue || '{}');
                  const position = defaultValue.position || {};
                  const xPercent = position.xPercent || 0;
                  const yPercent = position.yPercent || 0;
                  const widthPercent = defaultValue.widthPercent || (group.name === 'text' ? 20 : group.name === 'image' ? 30 : 10);
                  const heightPercent = defaultValue.heightPercent || (group.name === 'text' ? 10 : group.name === 'image' ? 20 : 5);
  
                  if (group.name === 'image') {
                    if (field.lmsSlideContentFileViewData && field.lmsSlideContentFileViewData.length > 0) {
                      field.lmsSlideContentFileViewData.forEach((imageFile, fileIndex) => {
                        try {
                          const contentObj = imageFile.content ? JSON.parse(imageFile.content) : {};
                          const imagePosition = contentObj.position || position;
                          
                          const imageElement = {
                            id: imageFile.id,
                            fieldId: field.id,
                            fieldValueId: field.lmsSlideGroupFieldsValueViewData?.id,
                            type: 'image',
                            x: (imagePosition.xPercent / 100) * canvasWidth,
                            y: (imagePosition.yPercent / 100) * canvasHeight,
                            width: ((contentObj.dimensions?.widthPercent || widthPercent) / 100) * canvasWidth,
                            height: ((contentObj.dimensions?.heightPercent || heightPercent) / 100) * canvasHeight,
                            xPercent: imagePosition.xPercent,
                            yPercent: imagePosition.yPercent,
                            widthPercent: contentObj.dimensions?.widthPercent || widthPercent,
                            heightPercent: contentObj.dimensions?.heightPercent || heightPercent,
                            content: imageFile.url,
                            contentFileId: imageFile.id,
                            groupId: group.id,
                            zIndex: contentObj.zIndex !== undefined ? contentObj.zIndex : fileIndex,
                            hyperlink: contentObj.hyperlink || ''
                          };
  
                          this.elements.push(imageElement);
                        } catch (e) {
                          console.error(`Error parsing image file data:`, e, imageFile);
                        }
                      });
                    } else {
                      // Create an empty image element if no files exist
                      const imageElement = {
                        id: '00000000-0000-0000-0000-000000000000',
                        fieldId: field.id,
                        type: 'image',
                        x: (xPercent / 100) * canvasWidth,
                        y: (yPercent / 100) * canvasHeight,
                        width: (widthPercent / 100) * canvasWidth,
                        height: (heightPercent / 100) * canvasHeight,
                        xPercent,
                        yPercent,
                        widthPercent,
                        heightPercent,
                        content: '',
                        groupId: group.id
                      };
  
                      this.elements.push(imageElement);
                    }
                  }
                  else {
                    const elementType = (group.name === 'button' || field.controlTypeId === 1) ? 'button' : 'text';
                    let content = field.lmsSlideGroupFieldsValueViewData?.htmlEditorValue || '';
          
                    if (elementType === 'button' && content.startsWith('<')) {
                      const tempDiv = document.createElement('div');
                      tempDiv.innerHTML = content;
                      content = tempDiv.textContent || tempDiv.innerText || '';
                    }
          
                    const element = {
                      id: group.id,
                      fieldId: field.id,
                      fieldValueId: field.lmsSlideGroupFieldsValueViewData?.id,
                      type: elementType,
                      x: (xPercent / 100) * canvasWidth,
                      y: (yPercent / 100) * canvasHeight,
                      width: (widthPercent / 100) * canvasWidth,
                      height: (heightPercent / 100) * canvasHeight,
                      xPercent,
                      yPercent,
                      widthPercent,
                      heightPercent,
                      content,
                      style: defaultValue.style || {},
                      // ADD THIS LINE - Set high z-index for text/buttons
                      zIndex: defaultValue.zIndex || (elementType === 'text' ? 1000 : elementType === 'button' ? 1001 : 1)
                    };
          
                    if (elementType === 'button' && defaultValue.hyperlink !== undefined) {
                      element['hyperlink'] = defaultValue.hyperlink;
                    }
          
                    this.elements.push(element);
                  }
          
                  // After loading all elements, initialize proper z-index order
                  setTimeout(() => {
                    this.initializeZIndexValues();
                  }, 100);
                }
                 catch (e) {
                  console.error(`Error parsing ${group.name} field:`, e, field);
                }
              });
            });
          }
        }
      },
      error: (error) => {
        console.error('Error loading slide data:', error);
        this.notificationService.errorTopRight('Error loading slide data');
      }
    });
  }
  getSafeAudioUrl(url: string): SafeResourceUrl {
    if (!url) return '';
    try {
      // Try to sanitize the URL
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    } catch (error) {
      console.error('Error sanitizing URL:', error);
      return '';
    }
  }
  
  // Add this helper method to calculate percentage positions for all elements
  private calculatePercentagePositions() {
    // Make sure canvas is available
    if (!this.canvas || !this.canvas.nativeElement) {
      console.warn('Canvas not available for percentage calculations');
      return;
    }
  
    const canvasWidth = this.canvas.nativeElement.offsetWidth;
    const canvasHeight = this.canvas.nativeElement.offsetHeight;
  
    if (canvasWidth === 0 || canvasHeight === 0) {
      // Try again in a moment
      setTimeout(() => this.calculatePercentagePositions(), 100);
      return;
    }
  
    this.elements.forEach(element => {
      // Calculate and store percentage values
      element.xPercent = (element.x / canvasWidth) * 100;
      element.yPercent = (element.y / canvasHeight) * 100;
      element.widthPercent = (element.width / canvasWidth) * 100;
      element.heightPercent = (element.height / canvasHeight) * 100;
    });
  }
  
  /// Image upload methods

  onImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
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
      
      // Store the file in the selected element or temp element
      if (this.selectedElement && this.selectedElement.needsReplacement) {
        this.selectedElement.file = file;
      } else if (this.tempImageElement) {
        this.tempImageElement.file = file;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

// Add these properties to your component
private croppingElement: any = null;
private originalElementState: any = null;
private imageLoaded = false; // Add this flag

cropImage(): void {
  if (!this.selectedElement || this.selectedElement.type !== 'image') {
    console.error('Selected element is not a valid image.');
    return;
  }

  // Store references to the element being cropped
  this.croppingElement = this.selectedElement;
  this.originalElementState = {
    content: this.selectedElement.content,
    file: this.selectedElement.file,
    contentFileId: this.selectedElement.contentFileId
  };

  this.showCenterLine = false;
  this.imageLoaded = false; // Reset the flag

  // Check if content is a URL (API endpoint)
  if (this.isUrl(this.selectedElement.content)) {
    fetch(this.selectedElement.content)
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
        this.resetCropperState();
      });
  } else {
    // Handle base64 content directly
    this.loadImageForCropping(this.selectedElement.content);
  }
}
loadImageForCropping(base64Image: string): void {
  // Create a new image element to get actual dimensions
  const img = new Image();
  img.onload = () => {
    // Get the actual dimensions of the image
    const actualWidth = img.naturalWidth;
    const actualHeight = img.naturalHeight;
    
    // Update cropper settings based on actual image dimensions
    this.cropperSettings = {
      ...this.cropperSettings,
      // Don't resize the image, keep original dimensions
      resizeToWidth: null,
      onlyScaleDown: true,
      containWithinAspectRatio: false // Allow free cropping
    };

    // Create a canvas with the exact image dimensions
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Set canvas to exact image dimensions - no scaling
      canvas.width = actualWidth;
      canvas.height = actualHeight;
      
      // Draw the image at its natural size
      ctx.drawImage(img, 0, 0, actualWidth, actualHeight);
      
      // Get the image data without any compression or scaling
      const normalizedBase64 = canvas.toDataURL('image/png', 1.0);
      
      // Set the image for cropping
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
    this.fallbackImageLoad(base64Image);
  };
  
  img.src = base64Image;
}


fallbackImageLoad(base64Image: string): void {
  this.currentCropImage = base64Image;
  this.showCropper = true;
  this.imageLoaded = true;
}

// Helper method to check if a string is a URL
private isUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch (_) {
    return false;
  }
}

applyCrop(): void {
  if (this.croppingElement && this.croppedImageResult) {
    // Update the element's content immediately
    this.croppingElement.content = this.croppedImageResult;
    
    // Convert the cropped image to a file with proper naming
    const timestamp = Date.now();
    const filename = `cropped-image-${timestamp}.png`;
    
    this.base64ToFiles(this.croppedImageResult, filename)
      .then(file => {
        // Update the element's file reference
        this.croppingElement.file = file;
        this.croppingElement.needsReplacement = true;
        this.croppingElement.oldContentFileId = this.originalElementState.contentFileId;
        
        // Mark elements as modified
        this.markElementsAsModified();
        
        // Reset cropping state
        this.resetCropperState();
        
        console.log('Crop applied successfully');
      })
      .catch(err => {
        console.error('Error converting cropped image to file:', err);
        // Revert if conversion fails
        this.cancelCrop();
      });
  } else {
    console.warn('No cropping element or cropped result available');
    this.cancelCrop();
  }
}

cancelCrop(): void {
  if (this.croppingElement && this.originalElementState) {
    // Restore the original state
    this.croppingElement.content = this.originalElementState.content;
    this.croppingElement.file = this.originalElementState.file;
    this.croppingElement.contentFileId = this.originalElementState.contentFileId;
    this.croppingElement.needsReplacement = false;
  }
  
  this.resetCropperState();
}

onImageCropped(event: ImageCroppedEvent): void {
  this.croppedImageResult = event.base64;
}


private async base64ToFiles(base64: string, filename: string): Promise<File> {
  try {
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    const mimeType = base64.includes('data:') ? base64.split(';')[0].split(':')[1] : 'image/png';
    
    // Convert base64 to binary
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
    // Fallback method
    const response = await fetch(base64);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  }
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

resetCropperState(): void {
  this.croppedImageResult = null;
  this.currentCropImage = null;
  this.originalElementState = null;
  this.croppingElement = null;
  this.showCropper = false;
  this.imageLoaded = false;
  this.resetCropperSettings(); 
}
onCropperReady(): void {
  console.log('Cropper is ready');
}

onLoadImageFailed(): void {
  console.error('Failed to load image in cropper');
  this.resetCropperState();
}

  addHyperlink() {
    const link = prompt('Enter hyperlink (URL, email, or phone number):');
    if (link && this.selectedElement) {
      this.selectedElement.content = link;
    }
  }
  openHyperlinkDialog() {
    if (!this.selectedElement || this.selectedElement.type !== 'image') {
      return;
    }

    this.hyperlinkUrl = (this.selectedElement as any).hyperlink || '';

    this.showHyperlinkDialog = true;

    console.log('Opening hyperlink dialog', {
      showDialog: this.showHyperlinkDialog,
      element: this.selectedElement
    });
  }


  saveHyperlink() {
    if (this.selectedElement && this.hyperlinkUrl) {
      // Set hyperlink on the selected element
      this.selectedElement.hyperlink = this.hyperlinkUrl;
      
      // If it's an image, we need to update its content data
      if (this.selectedElement.type === 'image') {
        const index = this.elements.findIndex(el => el.id === this.selectedElement.id);
        if (index !== -1) {
          this.elements[index].hyperlink = this.hyperlinkUrl;
        }
      }    
    }
    this.showHyperlinkDialog = false;
  }
  replaceImage() {
    if (!this.selectedElement || this.selectedElement.type !== 'image') return;

    this.tempImageElement = { ...this.selectedElement };
    

    this.selectedElement.needsReplacement = true;
    
    this.selectedElement.oldContentFileId = this.selectedElement.contentFileId;
    
    this.imageUrl = this.selectedElement.content;
    
    this.showImageDialog = true;
  }
  showFileInput() {
    return this.selectedElement.needsReplacement === true || !this.selectedElement.content;
}
  
duplicateImage() {
  if (this.selectedElement) {
    const duplicate = { ...this.selectedElement, id: '00000000-0000-0000-0000-000000000000',
      groupId: '00000000-0000-0000-0000-000000000000',
      fieldId: '00000000-0000-0000-0000-000000000000',
      fieldValueId: '00000000-0000-0000-0000-000000000000', };
    this.elements.push(duplicate);
    this.selectedElement = duplicate;
  }
}
  
  

deleteImageContent(element: PageElement) {
  if (!element || element.type !== 'image') return;

  // Check if this is an existing image from the API (has contentFileId)
  if (element.contentFileId) {
    // Delete image from server
    const json = {
      uploadId: element.contentFileId,
      groupId: element.groupId,
      flag: "image"
    };

    this.service.DeleteImage(json).subscribe({
      next: (res) => {
        if (res.isSuccess === true) {
          // Success case
          element.content = '';
          element.contentFileId = null;
          this.notificationService.successTopRight('Image deleted successfully');
          this.loadSlideData();
          // this.removeElementFromArray(element);
        } else {
          const errorMessage = res.message || 'Failed to delete image';
          console.error('API Error:', errorMessage, res);
          this.notificationService.errorTopRight(errorMessage);
        }
      },
      error: (error) => {
        // Network or other error
        console.error('Error deleting image:', error);
        //this.notificationService.errorTopRight('Error deleting image from server');
      }
    });
  } else {
    element.content = '';
    this.notificationService.successTopRight('Element deleted successfully');
    this.removeElementFromArray(element);
  }
  this.markElementsAsModified();
}

saveImageContent() {
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  const hasUploadedFile = fileInput && fileInput.files && fileInput.files.length > 0;
  
  if (this.tempImageElement && !this.tempImageElement.content && !hasUploadedFile) {
    this.notificationService.errorTopRight('Please upload an image');
    return;
  }
  
  if (this.selectedElement && this.selectedElement.needsReplacement && !this.selectedElement.file && !hasUploadedFile) {
    this.notificationService.errorTopRight('Please upload an image for replacement');
    return;
  }
  
  if (this.tempImageElement && this.tempImageElement.needsReplacement && !this.tempImageElement.file && !hasUploadedFile) {
    this.notificationService.errorTopRight('Please upload an image for replacement');
    return;
  }
  
  if (this.tempImageElement) {
    this.tempImageElement.content = this.imageUrl;
    
    if (hasUploadedFile) {
      this.tempImageElement.file = fileInput.files[0];
    }
    
    // Handle content file ID
    if (this.tempImageElement.contentFileId) {
      this.tempImageElement.oldContentFileId = this.tempImageElement.contentFileId;
      this.tempImageElement.contentFileId = null;
      (this.tempImageElement as any).needsReplacement = true;
    }
    
    // Copy all properties from tempImageElement back to selectedElement
    if (this.selectedElement) {
      Object.assign(this.selectedElement, this.tempImageElement);
    }
    
    // Reset the file input
    if (fileInput) {
      fileInput.value = '';
    }
  }
  
  this.showImageDialog = false;
  this.tempImageElement = null;
  this.markElementsAsModified();
}

hasValidImageContent(element: any): boolean {
 
  return element && (
    (element.content && element.content.trim() !== '') || 
    element.contentFileId
  );
}
  
  saveButtonContent() {
    if (this.selectedElement && this.selectedElement.type === 'button') {
      this.selectedElement.content = this.buttonText;
      this.selectedElement.hyperlink = this.buttonHyperlink;

      if (!this.selectedElement.style) {
        this.selectedElement.style = {};
      }

      this.selectedElement.style.backgroundColor = this.buttonColor;
      this.selectedElement.style.color = this.buttonTextColor;
    }
    this.showButtonDialog = false;
    this.markElementsAsModified();
  }

  toggleButtonStyle(style: 'bold' | 'italic' | 'underline'): void {
    this.buttonStyle[style] = !this.buttonStyle[style];
    
    if (this.selectedElement && this.selectedElement.type === 'button') {
      if (!this.selectedElement.style) {
        this.selectedElement.style = {};
      }
      
      this.selectedElement.style[style] = this.buttonStyle[style];
      
      this.selectedElement = {...this.selectedElement};
    }
    
    this.markElementsAsModified();
  }


  removeFormatting() {
    this.buttonStyle = { bold: false, italic: false, underline: false };
    
    if (this.selectedElement && this.selectedElement.type === 'button') {
      if (!this.selectedElement.style) {
        this.selectedElement.style = {};
      }
      
      this.selectedElement.style.bold = false;
      this.selectedElement.style.italic = false;
      this.selectedElement.style.underline = false;
      
      this.selectedElement = {...this.selectedElement};

    }
  }



  // video upload methods
  onVideoUpload(event) {
    const fileInput = event.target;
    const file = fileInput.files[0];
    if (!file) return;

    const ACCEPTED_VIDEO_FORMATS = ['video/mp4', 'video/x-m4v', 'video/quicktime'];
    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    const WARNING_FILE_SIZE = 25 * 1024 * 1024;

    if (!ACCEPTED_VIDEO_FORMATS.includes(file.type)) {
      this.notificationService.errorTopRight('Please select a valid video file (MP4, M4V, or MOV)');
      fileInput.value = '';
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      this.notificationService.errorTopRight('File size should be 100MB or less');
      fileInput.value = '';
      return;
    }

    if (file.size > WARNING_FILE_SIZE) {
      this.notificationService.warningTopRight('Uploading a file larger than 25MB may impact application performance while loading.');
    }

    // Clear YouTube/Vimeo related properties
    this.videoUrl = '';
    this.isYoutubeOrVimeo = false;
    this.sanitizedVideoUrl = null;

    // Clean up previous blob URL
    if (this.localVideoUrl && this.localVideoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.localVideoUrl);
    }

    this.pendingVideoFile = file;
    const url = URL.createObjectURL(file);
    this.localVideoUrl = url;

    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      if (this.selectedElement && this.selectedElement.type === 'video') {
        const aspectRatio = video.videoWidth / video.videoHeight;
        const canvasWidth = this.canvas.nativeElement.offsetWidth;
        const canvasHeight = this.canvas.nativeElement.offsetHeight;

        const widthPercent = 40;
        const heightPercent = widthPercent / aspectRatio;

        this.selectedElement.widthPercent = widthPercent;
        this.selectedElement.heightPercent = heightPercent;
        this.selectedElement.width = (widthPercent / 100) * canvasWidth;
        this.selectedElement.height = (heightPercent / 100) * canvasHeight;
      }
      
      // Don't revoke the URL here since we need it for preview and saving
      // URL.revokeObjectURL(video.src);
    };

    video.onerror = () => {
      this.notificationService.errorTopRight('Error loading video file');
      if (this.localVideoUrl && this.localVideoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.localVideoUrl);
      }
      this.localVideoUrl = null;
      this.pendingVideoFile = null;
    };

    video.src = url;
    
    // Force change detection to update preview
    this.cdr.detectChanges();
  }


  saveVideoContent() {
    if (!this.selectedElement || this.selectedElement.type !== 'video') {
      this.showVideoDialog = false;
      return;
    }
        
    // Case 1: No content provided at all
    if (!this.videoUrl && !this.localVideoUrl) {
      this.notificationService.errorTopRight('Please Upload Video file or provide YouTube/Vimeo URL');
      return;
    }
        
    // Process YouTube Shorts URL to convert to standard format
    if (this.videoUrl && this.videoUrl.includes('youtube.com/shorts/')) {
      // Extract the video ID from shorts URL
      const shortsId = this.videoUrl.split('youtube.com/shorts/')[1].split('?')[0];
      // Convert to standard YouTube URL format
      this.videoUrl = `https://www.youtube.com/watch?v=${shortsId}`;
      // Re-sanitize with the new URL
      this.sanitizeVideoUrl(this.videoUrl);
    }
  
    // Case 2: YouTube/Vimeo URL provided but invalid
    if (this.videoUrl && !this.sanitizedVideoUrl && !this.localVideoUrl) {
      if (this.videoUrl.includes('vimeo.com')) {
        this.notificationService.errorTopRight('The Vimeo URL provided is invalid or the video may be private');
      } else if (this.videoUrl.includes('youtube.com') || this.videoUrl.includes('youtu.be')) {
        this.notificationService.errorTopRight('The YouTube URL provided is invalid or the video may be private');
      } else {
        this.notificationService.errorTopRight('Please enter a valid YouTube or Vimeo URL');
      }
      return;
    }
        
    this.selectedElement.requireUserToWatch = this.requireUserToWatch;
        
    if (this.pendingVideoFile && this.localVideoUrl) {
      // Local video file upload case
      this.selectedElement.isYoutubeOrVimeo = false;
      this.selectedElement.localVideoUrl = this.localVideoUrl;
      this.selectedElement.sanitizedVideoUrl = null;
      this.selectedElement.content = 'local-video';
      this.selectedElement.pendingVideoFile = this.pendingVideoFile;
      this.selectedElement.videoFile = this.pendingVideoFile;
      
      // Set proper aspect ratio for local video
      this.setVideoAspectRatio(this.localVideoUrl);
    }
    // For YouTube/Vimeo URLs
    else if (this.videoUrl && this.sanitizedVideoUrl) {
      this.selectedElement.isYoutubeOrVimeo = true;
      this.selectedElement.content = this.videoUrl;
      this.selectedElement.sanitizedVideoUrl = this.sanitizedVideoUrl;
      this.selectedElement.pendingVideoFile = null;
      this.selectedElement.videoFile = null;
      this.selectedElement.localVideoUrl = null;
      this.processVideoElement(this.selectedElement);
      
      // For YouTube/Vimeo, use standard 16:9 aspect ratio
      const canvasWidth = this.canvas.nativeElement.offsetWidth;
      const canvasHeight = this.canvas.nativeElement.offsetHeight;
      
      const aspectRatio = 16/9;
      const currentWidth = this.selectedElement.width;
      const properHeight = currentWidth / aspectRatio;
      
      this.selectedElement.height = properHeight;
      this.selectedElement.heightPercent = (properHeight / canvasHeight) * 100;
      
      // Ensure the video is fully visible
      if (this.selectedElement.y + properHeight > canvasHeight) {
        this.selectedElement.y = Math.max(0, canvasHeight - properHeight);
        this.selectedElement.yPercent = (this.selectedElement.y / canvasHeight) * 100;
      }
      this.markElementsAsModified();
    }
        
    // Close the dialog
    this.showVideoDialog = false;
        
    // Reset dialog state for next use
    this.videoUrl = '';
    this.pendingVideoFile = null;
    this.localVideoUrl = null;
    this.sanitizedVideoUrl = null;
    this.isYoutubeOrVimeo = false;
    this.requireUserToWatch = false;
      
    // Force change detection to ensure UI updates
    this.cdr.detectChanges();
  }
  
  adjustVideoElementSize() {
    if (!this.selectedElement || this.selectedElement.type !== 'video') {
      return;
    }
  
    const canvasWidth = this.canvas.nativeElement.offsetWidth;
    const canvasHeight = this.canvas.nativeElement.offsetHeight;
    
    // Set standard 16:9 aspect ratio if it's a YouTube/Vimeo video
    // For local videos, we'll maintain width and adjust height to prevent cutting
    const aspectRatio = 16/9; // Standard video aspect ratio
    
    // Keep the current width (or set a reasonable default if it's too small)
    const currentWidth = this.selectedElement.width;
    const desiredWidth = Math.max(currentWidth, canvasWidth * 0.4); // At least 40% of canvas width
    
    // Calculate the proper height based on aspect ratio
    const properHeight = desiredWidth / aspectRatio;
    
    // Update the element dimensions
    this.selectedElement.width = desiredWidth;
    this.selectedElement.height = properHeight;
    
    // Update percentage values
    this.selectedElement.widthPercent = (desiredWidth / canvasWidth) * 100;
    this.selectedElement.heightPercent = (properHeight / canvasHeight) * 100;
    
    // Ensure the element is within canvas bounds
    if (this.selectedElement.x + desiredWidth > canvasWidth) {
      this.selectedElement.x = Math.max(0, canvasWidth - desiredWidth);
      this.selectedElement.xPercent = (this.selectedElement.x / canvasWidth) * 100;
    }
    
    if (this.selectedElement.y + properHeight > canvasHeight) {
      this.selectedElement.y = Math.max(0, canvasHeight - properHeight);
      this.selectedElement.yPercent = (this.selectedElement.y / canvasHeight) * 100;
    }
  }
    
  
  
  sanitizeVideoUrl(url: string) {
    if (!url) {
      this.sanitizedVideoUrl = null;
      return;
    }
  
    let videoId: string | null = null;
    
    // YouTube URL patterns
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      // Regular YouTube URL
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      videoId = (match && match[2].length === 11) ? match[2] : null;
      
      if (videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
        this.isYoutubeOrVimeo = true;
      }
    } 
    // Vimeo URL pattern
    else if (url.includes('vimeo.com')) {
      const regExp = /vimeo\.com\/([0-9]+)/;
      const match = url.match(regExp);
      videoId = match ? match[1] : null;
      
      if (videoId) {
        const embedUrl = `https://player.vimeo.com/video/${videoId}`;
        this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
        this.isYoutubeOrVimeo = true;
      }
    }
    
    if (!videoId) {
      this.sanitizedVideoUrl = null;
    }
  }
  
  
  
  
  // Add this helper method to set video aspect ratio
  setVideoAspectRatio(videoUrl: string) {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      if (this.selectedElement && this.selectedElement.type === 'video') {
        // Calculate aspect ratio
        const aspectRatio = video.videoWidth / video.videoHeight;
        
        // Adjust element dimensions based on aspect ratio
        const canvasWidth = this.canvas.nativeElement.offsetWidth;
        const canvasHeight = this.canvas.nativeElement.offsetHeight;
        
        // Get current width in pixels
        const currentWidth = this.selectedElement.width;
        
        // Calculate the proper height based on the actual video aspect ratio
        const properHeight = currentWidth / aspectRatio;
        
        // Update element dimensions
        this.selectedElement.height = properHeight;
        this.selectedElement.heightPercent = (properHeight / canvasHeight) * 100;
        
        // Ensure the video is fully visible within the canvas
        if (this.selectedElement.y + properHeight > canvasHeight) {
          // If the video would extend beyond the bottom of the canvas,
          // adjust the y position to make it fully visible
          this.selectedElement.y = Math.max(0, canvasHeight - properHeight);
          this.selectedElement.yPercent = (this.selectedElement.y / canvasHeight) * 100;
        }
        
        // Force change detection
        this.cdr.detectChanges();
      }
      
      // Clean up
      URL.revokeObjectURL(video.src);
    };
    
    video.onerror = () => {
      // If there's an error loading the video metadata, use a default 16:9 aspect ratio
      if (this.selectedElement && this.selectedElement.type === 'video') {
        const canvasWidth = this.canvas.nativeElement.offsetWidth;
        const canvasHeight = this.canvas.nativeElement.offsetHeight;
        
        const defaultAspectRatio = 16/9;
        const currentWidth = this.selectedElement.width;
        const properHeight = currentWidth / defaultAspectRatio;
        
        this.selectedElement.height = properHeight;
        this.selectedElement.heightPercent = (properHeight / canvasHeight) * 100;
        
        // Ensure the video is fully visible
        if (this.selectedElement.y + properHeight > canvasHeight) {
          this.selectedElement.y = Math.max(0, canvasHeight - properHeight);
          this.selectedElement.yPercent = (this.selectedElement.y / canvasHeight) * 100;
        }
        
        this.cdr.detectChanges();
      }
      
      // Clean up
      URL.revokeObjectURL(video.src);
    };
    
    video.src = videoUrl;
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
    console.error('Error extracting iframe URL:', error);
    return '';
  }
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
    this.pendingVideoFile = null;
    if (this.videoUrl.includes('youtube.com/shorts/')) {
      const shortsId = this.videoUrl.split('youtube.com/shorts/')[1].split(/[?#]/)[0];
      if (shortsId) {
        const embedUrl = `https://www.youtube.com/embed/${shortsId}`;
        this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
      } else {
        console.error('Failed to extract YouTube Shorts video ID from:', this.videoUrl);
      }
    } else {
      const videoId = this.extractYouTubeVideoId(this.videoUrl);
      if (videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
      } else {
        console.error('Failed to extract YouTube video ID from:', this.videoUrl);
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
          throw new Error('Could not extract iframe URL from oEmbed HTML');
        }
      } else {
        throw new Error('Invalid oEmbed response');
      }
    } catch (error) {
      console.error('Error with Vimeo oEmbed:', error);
      
      const videoId = this.extractVimeoVideoId(this.videoUrl);
      if (videoId) {
        const embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=0&title=0&byline=0&portrait=0`;
        this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
        console.log('Vimeo preview URL created (fallback):', embedUrl);
      } else {
        console.error('Failed to extract Vimeo video ID from:', this.videoUrl);
      }
    }
  }
}

  
  isYouTubeOrVimeoLink(url: string): boolean {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  }

  deleteUploadedVideo() {
    this.uploadedVideo = null;
    this.videoUrl = '';
  }

  transformVideoUrl(url: string): SafeResourceUrl {
    if (!url) return '';

    // Check if URL is already in cache
    if (this.videoUrlCache.has(url)) {
      return this.videoUrlCache.get(url);
    }

    let transformedUrl = url;

    // Transform YouTube URLs
    if (url.includes('youtube.com/watch')) {
      const videoId = new URL(url).searchParams.get('v');
      if (videoId) {
        transformedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    } else if (url.includes('youtu.be')) {
      const videoId = url.split('/').pop();
      if (videoId) {
        transformedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    }
    // Transform Vimeo URLs
    else if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      if (videoId) {
        transformedUrl = `https://player.vimeo.com/video/${videoId}`;
      }
    }

    // Cache the transformed URL
    const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(transformedUrl);
    this.videoUrlCache.set(url, safeUrl);
    return safeUrl;
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
  getSafeVideoUrl(url: string) {
    if (!url) return '';

    if (typeof url !== 'string') return url;

    if (url.toString().indexOf('SafeResourceUrl') >= 0) {
      return url;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  async processVideoElement(element) {
    if (!element || element.type !== 'video') {
      return;
    }
    
    const videoUrl = element.content;
    if (!videoUrl) {
      return;
    }
    
    // Check if it's a YouTube or Vimeo URL
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      element.isYoutubeOrVimeo = true;
      const videoId = this.extractYouTubeVideoId(videoUrl);
      if (videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        element.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
      }
    } else if (videoUrl.includes('vimeo.com')) {
      element.isYoutubeOrVimeo = true;
      
      try {
        // Try to get oEmbed data first
        const oEmbedData = await this.getVimeoOEmbedData(videoUrl);
        
        if (oEmbedData && oEmbedData.html) {
          // Extract the iframe URL from the oEmbed HTML
          const embedUrl = this.extractIframeUrl(oEmbedData.html);
          if (embedUrl) {
            element.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
          } else {
            throw new Error('Could not extract iframe URL from oEmbed HTML');
          }
        } else {
          throw new Error('Invalid oEmbed response');
        }
      } catch (error) {
        console.error('Error with Vimeo oEmbed:', error);
        
        // Fallback to the original method if oEmbed fails
        const videoId = this.extractVimeoVideoId(videoUrl);
        if (videoId) {
          const embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=0&title=0&byline=0&portrait=0&responsive=1`;
          element.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
        }
      }
    } else if (videoUrl !== 'local-video') {
      // Assume it's a local/server video URL
      element.isYoutubeOrVimeo = false;
      element.localVideoUrl = videoUrl;
      // Sanitize the URL
      element.localVideoUrl = this.getSafeVideoUrl(element.localVideoUrl);
    }
  }

  saveSlideData(pushToAlternateVersions: boolean = false) {
    const videoElements = this.elements.filter(element => element.type === 'video');
    const emptyVideoElements = videoElements.filter(element =>
      !element.pendingVideoFile &&
      !element.videoFile &&
      !element.sanitizedVideoUrl &&
      !element.localVideoUrl
    );
          
    if (emptyVideoElements.length > 0) {
      this.notificationService.errorTopRight('Please add content to all video elements before saving');
      return;
    }
      
    const isVideoBeingSaved = this.elements.some(element => element.type === 'video' &&
      (element.pendingVideoFile || element.videoFile));
      
    // Fix: Invert the logic to match the intended behavior
    const isEdit = !pushToAlternateVersions;
    
    // Separating new and existing elements - My Personal Comments(Dont Change)
    const newElements = this.elements.filter(element =>
        (!element.id || element.id.startsWith('element-')) &&
        (element.type === 'text' || element.type === 'button')
    );
                
    const existingElements = this.elements.filter(element =>
        element.id && !element.id.startsWith('element-') &&
        (element.type === 'text' || element.type === 'button')
    );
    
    // payload for new elements (First API) - My Personal Comments(Dont Change)
    const newDynamicFieldRequest = newElements.map((element, index) => {
        const defaultValueObj = {
            position: { xPercent: element.xPercent, yPercent: element.yPercent },
            widthPercent: element.widthPercent,
            heightPercent: element.heightPercent,
            style: element.style || {},
            ...(element.type === 'button' && element.hyperlink !== undefined && { hyperlink: element.hyperlink })
        };
        
        return {
            id: '00000000-0000-0000-0000-000000000000',
            lmsSlideId: this.SelectedSlideId,
            name: element.type,
            isDeleted: false,
            isEditable: true,
            sequence: index,
            lmsSlideGroupFieldViews: [{
                id: '00000000-0000-0000-0000-000000000000',
                name: element.type === 'text' ? `Text ${index + 1}` : `Button ${index + 1}`,
                defaultValue: JSON.stringify(defaultValueObj),
                controlTypeId: element.type === 'text' ? 0 : 1,
                sequence: index,
                isMadatory: true,
                isVisible: true,
                isDeleted: false,
                values: element.content || ''
            }],
            language: "en"
        };
    });
    
    // payload for existing elements (First API - position updates) - My Personal Comments(Dont Change)
    const existingDynamicFieldRequest = existingElements.map((element, index) => {
        const defaultValueObj = {
            position: { xPercent: element.xPercent, yPercent: element.yPercent },
            widthPercent: element.widthPercent,
            heightPercent: element.heightPercent,
            style: element.style || {},
            ...(element.type === 'button' && element.hyperlink !== undefined && { hyperlink: element.hyperlink })
        };
        
        return {
            id: element.id,
            lmsSlideId: this.SelectedSlideId,
            name: element.type,
            isDeleted: false,
            isEditable: true,
            sequence: index,
            lmsSlideGroupFieldViews: [{
                id: element.fieldId,
                name: element.type === 'text' ? `Text ${index + 1}` : `Button ${index + 1}`,
                defaultValue: JSON.stringify(defaultValueObj),
                controlTypeId: element.type === 'text' ? 0 : 1,
                sequence: index,
                isMadatory: true,
                isVisible: true,
                isDeleted: false,
                values: element.content || ''
            }],
            language: "en"
        };
    });
    
    // payload for second API (value updates for existing elements) - My Personal Comments(Dont Change)
    const fieldValuesRequest = existingElements.map(element => {
        const defaultValueObj = element.type === 'button' ? {
            position: { xPercent: element.xPercent, yPercent: element.yPercent },
            widthPercent: element.widthPercent,
            heightPercent: element.heightPercent,
            style: element.style || {},
            hyperlink: element.hyperlink
        } : {
            position: { xPercent: element.xPercent, yPercent: element.yPercent },
            content: element.content,
            widthPercent: element.widthPercent,
            heightPercent: element.heightPercent,
            style: element.style || {}
        };
        
        return {
            id: element.fieldValueId || '00000000-0000-0000-0000-000000000000',
            lmsSlideId: this.SelectedSlideId,
            lmsSlideGroupId: element.id,
            lmsSlideGroupFieldId: element.fieldId,
            htmlEditorValue: element.content || '',
            isDeleted: false,
            defaultValue: JSON.stringify(defaultValueObj)
        };
    });
    
    // Combining API calls based on conditions - My Personal Comments(Dont Change)
    const apiCalls = [];
                
    // Adding new elements
    if (newDynamicFieldRequest.length > 0) {
        apiCalls.push(this.service.AddDynamicFieldWithValue(newDynamicFieldRequest, isEdit));
    }
    
    // Updating existing elements' positions - My Personal Comments(Dont Change)
    if (existingDynamicFieldRequest.length > 0) {
        apiCalls.push(this.service.AddDynamicFieldWithValue(existingDynamicFieldRequest, isEdit));
    }
    
    // Updating existing elements' values My Personal Comments(Dont Change)
    if (fieldValuesRequest.length > 0) {
        apiCalls.push(this.service.AddFieldValues(fieldValuesRequest, isEdit));
    }
    
    // If no API calls are needed, just show success and return
    if (apiCalls.length === 0) {
        const videoElement = this.elements.find(element => element.type === 'video');
        if (videoElement) {
          this.saveVideoData(videoElement, isEdit)
          .then(() => {
                    this.notificationService.successTopRight('All changes saved successfully');
                    this.loadSlideData();
                })
                .catch(error => {
                    this.notificationService.errorTopRight('Failed to save video data');
                });
        } else {
            this.notificationService.successTopRight('All changes saved successfully');
            this.loadSlideData();
        }
        return;
    }
    
    // Executing all API calls
    forkJoin(apiCalls).pipe(
        switchMap(responses => {
            // Check if all responses are successful
            const allSuccessful = responses.every(response => response?.isSuccess);
            if (!allSuccessful) {
                throw new Error('One or more API calls failed');
            }
            // Always show success notification here
            this.notificationService.successTopRight('All changes saved successfully');
            return this.service.GetSlideGroupField(this.SelectedSlideId, {});
        })
    ).subscribe({
        next: () => {
            const videoElement = this.elements.find(element => element.type === 'video');
            if (videoElement) {
              this.saveVideoData(videoElement, isEdit)
              .then(() => {
                        if (isVideoBeingSaved) {
                            setTimeout(() => this.loadSlideData(), 2000);
                        } else {
                            // Notification already shown above
                            this.loadSlideData();
                        }
                    })
                    .catch(error => {
                        this.notificationService.errorTopRight('Failed to save video data');
                    });
            } else {
                // Notification already shown above
                this.loadSlideData();
            }
        },
        error: (error) => {
            this.notificationService.successTopRight('All changes saved successfully');
        }
    });
}

saveVideoData(videoElement: any, isEdit?: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('Id', videoElement.id || '00000000-0000-0000-0000-000000000000');
      formData.append('LmsSlideId', this.SelectedSlideId);
      formData.append('IsRequired', String(videoElement.requireUserToWatch || false));
      formData.append('IsPlay', 'false');
      formData.append('Type', 'video');
      formData.append('Position', JSON.stringify({
          xPercent: videoElement.xPercent,
          yPercent: videoElement.yPercent,
          widthPercent: videoElement.widthPercent,
          heightPercent: videoElement.heightPercent
      }));

      // Fix: Use the passed isEdit parameter directly, with proper fallback
      const isEditMode = isEdit !== undefined ? isEdit : false;

      const isPositionUpdateOnly = videoElement.id &&
          !videoElement.pendingVideoFile &&
          !videoElement.videoFile;

      if (isPositionUpdateOnly) {
          if (videoElement.isYoutubeOrVimeo && videoElement.content) {
              formData.append('Content', videoElement.content);
          } else {
              formData.append('File', new Blob([]), '');
          }
      } else if (videoElement.isYoutubeOrVimeo && videoElement.content) {
          formData.append('Content', videoElement.content);
      } else if (videoElement.pendingVideoFile || videoElement.videoFile) {
          const fileToUpload = videoElement.pendingVideoFile || videoElement.videoFile;
          if (fileToUpload) {
              formData.append('File', fileToUpload, fileToUpload.name);
          }
      } else if (videoElement.localVideoUrl) {
          let urlString = typeof videoElement.localVideoUrl === 'string' ?
              videoElement.localVideoUrl :
              videoElement.localVideoUrl.toString().match(/url=(.*?)(?:&|$)/)?.[1] || '';
          if (urlString && urlString.includes('http')) {
              formData.append('Content', urlString);
              const fileName = urlString.split('/').pop();
              if (fileName) formData.append('FileName', fileName);
          } else {
              formData.append('File', new Blob([]), '');
          }
      }

      this.service.UploadVideoAndAudioInSlide(formData, isEditMode).subscribe({
          next: (response) => {
              videoElement.id = response.id;
              if (response.url) {
                  videoElement.localVideoUrl = this.getSafeVideoUrl(response.url);
              }
              videoElement.pendingVideoFile = null;
              resolve();
          },
          error: (error) => {
              this.notificationService.errorTopRight('Error saving video data');
              reject(error);
          }
      });
  });
}





  sendToBack() {
    if (this.selectedElement) {
      // Store the current position and dimensions
      const currentPosition = {
        xPercent: this.selectedElement.xPercent,
        yPercent: this.selectedElement.yPercent,
        widthPercent: this.selectedElement.widthPercent,
        heightPercent: this.selectedElement.heightPercent
      };
  
      // Get all elements and sort by current z-index
      const sortedElements = [...this.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
      
      // Find the selected element and remove it from the sorted array
      const selectedIndex = sortedElements.findIndex(el => el.id === this.selectedElement.id);
      if (selectedIndex > -1) {
        sortedElements.splice(selectedIndex, 1);
      }
      
      // Put the selected element at the beginning (back)
      sortedElements.unshift(this.selectedElement);
      
      // Reassign z-index starting from 1 (never 0 or negative)
      sortedElements.forEach((element, index) => {
        element.zIndex = index + 1;
      });
  
      // Update the DOM to reflect the new z-index values
      this.updateElementStyles();
  
      // Restore the original position and dimensions
      setTimeout(() => {
        if (this.selectedElement) {
          this.selectedElement.xPercent = currentPosition.xPercent;
          this.selectedElement.yPercent = currentPosition.yPercent;
          this.selectedElement.widthPercent = currentPosition.widthPercent;
          this.selectedElement.heightPercent = currentPosition.heightPercent;
          this.cdr.detectChanges();
        }
      }, 0);
    }
  }
  
  bringToFront() {
    if (this.selectedElement) {
      // Store the current position and dimensions
      const currentPosition = {
        xPercent: this.selectedElement.xPercent,
        yPercent: this.selectedElement.yPercent,
        widthPercent: this.selectedElement.widthPercent,
        heightPercent: this.selectedElement.heightPercent
      };
  
      // Get all elements and sort by current z-index
      const sortedElements = [...this.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
      
      // Find the selected element and remove it from the sorted array
      const selectedIndex = sortedElements.findIndex(el => el.id === this.selectedElement.id);
      if (selectedIndex > -1) {
        sortedElements.splice(selectedIndex, 1);
      }
      
      // Put the selected element at the end (front)
      sortedElements.push(this.selectedElement);
      
      // Reassign z-index starting from 1 (never 0 or negative)
      sortedElements.forEach((element, index) => {
        element.zIndex = index + 1;
      });
  
      // Update the DOM to reflect the new z-index values
      this.updateElementStyles();
  
      // Restore the original position and dimensions
      setTimeout(() => {
        if (this.selectedElement) {
          this.selectedElement.xPercent = currentPosition.xPercent;
          this.selectedElement.yPercent = currentPosition.yPercent;
          this.selectedElement.widthPercent = currentPosition.widthPercent;
          this.selectedElement.heightPercent = currentPosition.heightPercent;
          this.cdr.detectChanges();
        }
      }, 0);
    }
  }
    
  updateElementStyles() {
    // Force change detection first
    this.cdr.detectChanges();
    
    // Use setTimeout to ensure DOM is updated
    setTimeout(() => {
      this.elements.forEach(element => {
        const elementId = element.id || element.contentFileId;
        if (elementId) {
          const domElement = document.getElementById(`element-${elementId}`);
          if (domElement) {
            // Apply the z-index directly from the element object
            const zIndex = element.zIndex !== undefined ? element.zIndex : 1;
            domElement.style.zIndex = `${zIndex}`;
            
            // Ensure position is maintained
            domElement.style.position = 'absolute';
            domElement.style.left = `${element.xPercent}%`;
            domElement.style.top = `${element.yPercent}%`;
            domElement.style.width = `${element.widthPercent}%`;
            domElement.style.height = `${element.heightPercent}%`;
            
          } else {
            // Try alternative selector
            const altElement = document.querySelector(`[id="element-${elementId}"]`);
            if (altElement) {
              console.log('Found element with alternative selector');
              (altElement as HTMLElement).style.zIndex = `${element.zIndex !== undefined ? element.zIndex : 1}`;
            }
          }
        }
      });
    }, 10);
  }
  
 saveEditorContent() {
  if (!this.editorControl.value || this.editorControl.value.trim() === '' || this.isEmptyHTML(this.editorControl.value)) {
    this.notificationService.errorTopRight('Content cannot be empty.');
    return;
  }

  if (this.selectedElement && this.selectedElement.type === 'text') {
    const content = this.editorControl.value;
    this.selectedElement.content = content;
    
    if (!this.selectedElement.style) {
      this.selectedElement.style = {};
    }

    this.extractAndApplyStyles(content);
  }
  
  this.showCKEditor = false;
  this.cdr.detectChanges();
  
  // Auto-adjust height after dialog closes and content renders
  if (this.selectedElement && this.selectedElement.type === 'text') {
    this.adjustTextElementHeight(this.selectedElement, true);
  } 
}

extractAndApplyStyles(content: string) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  
  const styledElements = tempDiv.querySelectorAll('[style]');
  
  if (styledElements.length > 0) {
    const firstStyledElement = styledElements[0] as HTMLElement;
    const computedStyle = firstStyledElement.style;
    
    if (computedStyle.color) {
      this.selectedElement.style.color = computedStyle.color;
    }
    
    if (computedStyle.backgroundColor) {
      this.selectedElement.style.backgroundColor = computedStyle.backgroundColor;
    }
    
    if (computedStyle.fontSize) {
      this.selectedElement.style.fontSize = this.convertFontSizeToPixels(computedStyle.fontSize);
    }
    
    if (computedStyle.fontWeight) {
      const fontWeight = computedStyle.fontWeight;
      this.selectedElement.style.bold = fontWeight === 'bold' || fontWeight === '700' || parseInt(fontWeight) >= 700;
    }
    
    if (computedStyle.fontStyle) {
      this.selectedElement.style.italic = computedStyle.fontStyle === 'italic';
    }
    
    if (computedStyle.textDecoration) {
      this.selectedElement.style.underline = computedStyle.textDecoration.includes('underline');
    }
    
    if (computedStyle.textAlign) {
      this.selectedElement.style.textAlign = computedStyle.textAlign;
    }
  }
  
  const paragraphs = tempDiv.querySelectorAll('p');
  if (paragraphs.length > 0) {
    const firstParagraph = paragraphs[0] as HTMLElement;
    if (firstParagraph.style.textAlign) {
      this.selectedElement.style.textAlign = firstParagraph.style.textAlign;
    }
  }
  

  this.parseStylesFromString(content);
}

convertFontSizeToPixels(fontSize: string): number {
  if (!fontSize) return 14; // default
  

  if (fontSize.includes('calc(') && (fontSize.includes('vw') || fontSize.includes('vh'))) {
    return this.calculateVwVhToPixels(fontSize);
  }
  
  if (fontSize.includes('px')) {
    return parseInt(fontSize);
  }
  
  if (fontSize.includes('pt')) {
    return Math.round(parseInt(fontSize) * 1.33);
  }
  
  if (fontSize.includes('em')) {
    return Math.round(parseFloat(fontSize) * 16);
  }
  
  if (fontSize.includes('rem')) {
    return Math.round(parseFloat(fontSize) * 16);
  }
  
  if (fontSize.includes('%')) {
    return Math.round((parseInt(fontSize) / 100) * 16);
  }
  
  return 14; 
}

calculateVwVhToPixels(calcValue: string): number {
  const calcMatch = calcValue.match(/calc\(([^)]+)\)/);
  if (!calcMatch) return 14;
  
  const expression = calcMatch[1];
  
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  const vwMatch = expression.match(/([\d.]+)vw/);
  const vhMatch = expression.match(/([\d.]+)vh/);
  
  let pixels = 0;
  
  if (vwMatch) {
    const vwValue = parseFloat(vwMatch[1]);
    pixels += (vwValue / 100) * viewportWidth;
  }
  
  if (vhMatch) {
    const vhValue = parseFloat(vhMatch[1]);
    pixels += (vhValue / 100) * viewportHeight;
  }
  
  return Math.round(pixels) || 14;
}

parseStylesFromString(content: string) {

  const fontSizeMatch = content.match(/font-size:\s*([^;"']+)/i);
  if (fontSizeMatch) {
    const fontSize = fontSizeMatch[1].trim();
    this.selectedElement.style.fontSize = this.convertFontSizeToPixels(fontSize);
  }
  
  const fontWeightMatch = content.match(/font-weight:\s*([^;"']+)/i);
  if (fontWeightMatch) {
    const fontWeight = fontWeightMatch[1].trim();
    this.selectedElement.style.bold = fontWeight === 'bold' || fontWeight === '700' || parseInt(fontWeight) >= 700;
  }

  const fontStyleMatch = content.match(/font-style:\s*([^;"']+)/i);
  if (fontStyleMatch) {
    this.selectedElement.style.italic = fontStyleMatch[1].trim() === 'italic';
  }
  
 
  const textDecorationMatch = content.match(/text-decoration:\s*([^;"']+)/i);
  if (textDecorationMatch) {
    this.selectedElement.style.underline = textDecorationMatch[1].trim().includes('underline');
  }
  
  const textAlignMatch = content.match(/text-align:\s*([^;"']+)/i);
  if (textAlignMatch) {
    this.selectedElement.style.textAlign = textAlignMatch[1].trim();
  }
}

onEditorReady(editor: any) {
  setTimeout(() => {
    if (this.editorControl.value) {
      editor.editor.focus();
      editor.editor.setData(this.editorControl.value);
      editor.editor.selectionChange();
    }
  }, 50);
}

isEmptyHTML(content: string): boolean {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  return tempDiv.innerText.trim() === '';
}


    getTextAlignment(content: string): string {
      // Default alignment
      let alignment = 'left';
      
      // Check if content has alignment style
      if (content && content.includes('text-align:')) {
        if (content.includes('text-align: center') || content.includes('text-align:center')) {
          alignment = 'center';
        } else if (content.includes('text-align: right') || content.includes('text-align:right')) {
          alignment = 'right';
        } else if (content.includes('text-align: justify') || content.includes('text-align:justify')) {
          alignment = 'justify';
        }
      }
      
      return alignment;
    }

  // audio upload methods
  onAudioUpload(event: any) {
    const file = event.target.files[0];
    
    if (file) {
      const maxSizeInMB = 25;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      
      const validAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/x-wav'];
      
      // Validate file type
      if (!validAudioTypes.includes(file.type)) {
        this.notificationService.errorTopRight('Please upload a valid audio file.');
        // Clear the input
        event.target.value = '';
        return;
      }
      
      // Validate file size
      if (file.size > maxSizeInBytes) {
        this.notificationService.errorTopRight(`File size should not exceed ${maxSizeInMB} MB.`);
        // Clear the input
        event.target.value = '';
        return;
      }
      
      let audioElement = this.elements.find(element => element.type === 'audio');
      if (!audioElement) {
        this.addDefaultAudioElement();
        audioElement = this.elements.find(element => element.type === 'audio');
      }
      
      // Set the new file
      audioElement.file = file;
      
      // Preview the audio
      const reader = new FileReader();
      reader.onload = (e: any) => {
        audioElement.content = e.target.result;
        // You can also set a contentFileId if needed for your backend
        // audioElement.contentFileId = 'temp_' + Date.now();
      };
      reader.onerror = () => {
        this.notificationService.errorTopRight('Error reading audio file.');
        audioElement.file = null;
        audioElement.content = null;
      };
      reader.readAsDataURL(file);
      
      audioElement.isSavedToAPI = false;
    } else {
      // If no file selected, clear the audio element
      const audioElement = this.elements.find(element => element.type === 'audio');
      if (audioElement) {
        audioElement.file = null;
        audioElement.content = null;
        audioElement.contentFileId = null;
      }
    }
  }

  saveAudioContent() {
    const audioElement = this.elements.find(element => element.type === 'audio');
    
    if (!audioElement) {
      this.notificationService.errorTopRight('Audio element not found.');
      return;
    }
    
    if (!audioElement.file) {
      this.notificationService.errorTopRight('Please upload an audio file before saving.');
      return;
    }
    
    if (!audioElement.content) {
      this.notificationService.errorTopRight('Audio file is still processing. Please wait and try again.');
      return;
    }
    
    audioElement.requireUserToWatch = this.requireUserToWatch;
    audioElement.autoPlay = this.autoPlay;
    this.showAudioDialog = false;
    this.markElementsAsModified();
  }
  
  deleteUploadedAudio() {
    const audioElement = this.elements.find(element => element.type === 'audio');
    if (audioElement) {
      audioElement.content = '';
      this.uploadedAudio = null;
      this.notificationService.successTopRight('Uploaded audio deleted successfully');
    }
  }

  saveAudioContentSlide(pushToAlternateVersions: boolean = false) {
    if (!this.SelectedSlideId) {
      this.notificationService.errorTopRight('No slide selected');
      return;
    }
    
    // Step 1: Saving audio element first - My Personal Comments(Dont Change)
    const audioElement = this.elements.find(element => element.type === 'audio');
    
  
    // Tracking if a new audio file is being uploaded - My Personal Comments(Dont Change)
    const isAudioBeingUploaded = !!audioElement.file;
    const isEdit = !pushToAlternateVersions;
     
    // Pass pushToAlternateVersions to saveAudioData
    this.saveAudioData(audioElement, pushToAlternateVersions).then(() => {
      // Separating new and existing elements - My Personal Comments(Dont Change)
      const newTextAndButtonElements = this.elements
        .filter(element =>
          (!element.id || element.id.startsWith('element-')) &&
          (element.type === 'text' || element.type === 'button')
        );
                        
      const existingTextAndButtonElements = this.elements
        .filter(element =>
          element.id && !element.id.startsWith('element-') &&
          (element.type === 'text' || element.type === 'button')
        );
                    
      // Preparing payload for new text/button elements (First API) - My Personal Comments(Dont Change)
      const newTextAndButtonRequest = newTextAndButtonElements.map((element, index) => {
        const defaultValueObj = {
          position: { xPercent: element.xPercent, yPercent: element.yPercent },
          widthPercent: element.widthPercent,
          heightPercent: element.heightPercent,
          style: element.style || {},
          ...(element.type === 'button' && element.hyperlink !== undefined && { hyperlink: element.hyperlink })
        };
                                
        return {
          id: '00000000-0000-0000-0000-000000000000',
          lmsSlideId: this.SelectedSlideId.id || this.SelectedSlideId,
          name: element.type,
          isDeleted: false,
          isEditable: true,
          sequence: index,
          lmsSlideGroupFieldViews: [{
            id: '00000000-0000-0000-0000-000000000000',
            name: element.type === 'text' ? `Text ${index + 1}` : `Button ${index + 1}`,
            defaultValue: JSON.stringify(defaultValueObj),
            controlTypeId: element.type === 'text' ? 0 : 1,
            sequence: index,
            isMadatory: true,
            isVisible: true,
            isDeleted: false,
            values: element.content || ''
          }],
          language: "en"
        };
      });
                
      // Preparing payload for existing text/button elements (First API - position updates)
      const existingTextAndButtonRequest = existingTextAndButtonElements.map((element, index) => {
        const defaultValueObj = {
          position: { xPercent: element.xPercent, yPercent: element.yPercent },
          widthPercent: element.widthPercent,
          heightPercent: element.heightPercent,
          style: element.style || {},
          ...(element.type === 'button' && element.hyperlink !== undefined && { hyperlink: element.hyperlink })
        };
                                
        return {
          id: element.id,
          lmsSlideId: this.SelectedSlideId.id || this.SelectedSlideId,
          name: element.type,
          isDeleted: false,
          isEditable: true,
          sequence: index,
          lmsSlideGroupFieldViews: [{
            id: element.fieldId,
            name: element.type === 'text' ? `Text ${index + 1}` : `Button ${index + 1}`,
            defaultValue: JSON.stringify(defaultValueObj),
            controlTypeId: element.type === 'text' ? 0 : 1,
            sequence: index,
            isMadatory: true,
            isVisible: true,
            isDeleted: false,
            values: element.content || ''
          }],
          language: "en"
        };
      });
                
      // Preparing payload for field values (Second API - value updates) - My Personal Comments(Dont Change)
      const fieldValuesRequest = existingTextAndButtonElements.map(element => {
        const defaultValueObj = element.type === 'button' ? {
          position: { xPercent: element.xPercent, yPercent: element.yPercent },
          widthPercent: element.widthPercent,
          heightPercent: element.heightPercent,
          style: element.style || {},
          hyperlink: element.hyperlink
        } : {
          position: { xPercent: element.xPercent, yPercent: element.yPercent },
          content: element.content,
          widthPercent: element.widthPercent,
          heightPercent: element.heightPercent,
          style: element.style || {}
        };
                                
        return {
          id: element.fieldValueId || '00000000-0000-0000-0000-000000000000',
          lmsSlideId: this.SelectedSlideId.id || this.SelectedSlideId,
          lmsSlideGroupId: element.id,
          lmsSlideGroupFieldId: element.fieldId,
          htmlEditorValue: element.content || '',
          isDeleted: false,
          defaultValue: JSON.stringify(defaultValueObj)
        };
      });
        
      const imageElements = this.elements.filter(element => element.type === 'image');
                
      // Combining API calls
      const apiCalls = [];
                    
      if (newTextAndButtonRequest.length > 0) {
        apiCalls.push(this.service.AddDynamicFieldWithValue(newTextAndButtonRequest, isEdit));
      }
                    
      if (existingTextAndButtonRequest.length > 0) {
        apiCalls.push(this.service.AddDynamicFieldWithValue(existingTextAndButtonRequest, isEdit));
      }
                    
      if (fieldValuesRequest.length > 0) {
        apiCalls.push(this.service.AddFieldValues(fieldValuesRequest, isEdit));
      }
                
      // If there are no API calls for text/button elements but we have images,
      // add a dummy API call to ensure forkJoin doesn't fail
      if (apiCalls.length === 0 && imageElements.length > 0) {
        apiCalls.push(of({ isSuccess: true }));
      }
                
      // If there are no elements at all, show a message and return
      if (apiCalls.length === 0 && imageElements.length === 0) {
        //this.notificationService.infoTopRight('No changes to save');
        return;
      }
                
      forkJoin(apiCalls).pipe(
        switchMap(responses => {
          const allSuccessful = responses.every(response => response?.isSuccess);
          if (!allSuccessful) {
            throw new Error('One or more API calls failed');
          }
          return this.service.GetSlideGroupField(this.SelectedSlideId.id || this.SelectedSlideId, {});
        })
      ).subscribe({
        next: (fields) => {
          if (imageElements.length > 0) {
            const imageGroup = fields.find(field => field.name === 'image');
            if (imageGroup) {
              // Pass isEdit to processImageUploadsForAudio
              this.processImageUploadsForAudio(imageElements, imageGroup, fields, isEdit);
            } else {
              // If no image group exists but we have image elements,
              // create a dummy image group structure
              const dummyImageGroup = {
                id: imageElements[0]?.groupId || '00000000-0000-0000-0000-000000000000',
                name: 'image',
                lmsSlideGroupFieldViews: [
                  {
                    id: imageElements[0]?.fieldId || '00000000-0000-0000-0000-000000000000',
                    name: 'Image 1'
                  }
                ]
              };
              // Pass isEdit to processImageUploadsForAudio
              this.processImageUploadsForAudio(imageElements, dummyImageGroup, fields, isEdit);
            }
          } else {
            // Pass isEdit to saveFieldValues
            this.saveFieldValues(fields, isEdit);
            if (isAudioBeingUploaded) {
              this.hasUnsavedChanges = false;
              this.notificationService.successTopRight('All changes saved successfully');
              setTimeout(() => this.loadSlideData(), 2000);
            } else {
              this.hasUnsavedChanges = false;
              this.notificationService.successTopRight('All changes saved successfully');
              this.loadSlideData();
            }
          }
        },
        error: (error) => {
          console.error('Error saving audio content:', error);
          this.notificationService.errorTopRight('Error saving audio content');
        }
      });
    }).catch(error => {
      console.error('Error saving audio:', error);
      this.notificationService.errorTopRight('Error saving audio');
    });
  }
  


  saveAudioData(audioElement: any, pushToAlternateVersions: boolean = false): Promise<void> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('Id', audioElement.id || '00000000-0000-0000-0000-000000000000');
      formData.append('LmsSlideId', this.SelectedSlideId);
      formData.append('IsRequired', String(audioElement.requireUserToWatch || false));
      formData.append('IsPlay', String(audioElement.autoPlay || false));
      formData.append('Type', 'audio-content');
      formData.append('File', audioElement.file || '');
      formData.append('Position', JSON.stringify({
        xPercent: audioElement.xPercent,
        yPercent: audioElement.yPercent,
        widthPercent: audioElement.widthPercent,
        heightPercent: audioElement.heightPercent
      }));
  
      // Use the passed pushToAlternateVersions parameter instead of reading from route
      const isEdit = !pushToAlternateVersions;
      
      if (audioElement.content) {
        formData.append('Content', '');
      }
  
      this.service.UploadVideoAndAudioInSlide(formData, isEdit).subscribe({
        next: (response) => {
          audioElement.id = response.id;
          if (response.url) {
            audioElement.content = response.url;
          }
          audioElement.file = null;
          resolve();
        },
        error: (error) => {
          this.notificationService.errorTopRight('Error saving audio data');
          reject(error);
        }
      });
    });
  }
  
  processImageUploadsForAudio(imageElements, imageGroup, allFields, isEdit: boolean) {
    this.isLoading = true;
    this.loadingMessage = 'Saving changes, please wait...';
      
    const slideId = this.SelectedSlideId.id || this.SelectedSlideId;
    const fieldMap = {};
          
    imageGroup.lmsSlideGroupFieldViews.forEach((field, index) => {
      fieldMap[`Image ${index + 1}`] = field.id;
    });
          
    const imagePromises = imageElements.map((element, index) => {
      const formData = new FormData();
      const isNewElement = !element.id || element.id === '00000000-0000-0000-0000-000000000000' || element.id.startsWith('element-');
      const isReplacement = (element as any).needsReplacement === true;
                
      let groupId, fieldId;
                
      if (isNewElement) {
        groupId = '00000000-0000-0000-0000-000000000000';
        fieldId = '00000000-0000-0000-0000-000000000000';
      } else {
        groupId = element.groupId || imageGroup.id;
        fieldId = element.fieldId || imageGroup.lmsSlideGroupFieldViews[0]?.id;
      }
                
      const idToUse = isNewElement ? '00000000-0000-0000-0000-000000000000' : element.id;
                
      formData.append('Id', idToUse);
      formData.append('LmsSlideId', slideId);
      formData.append('LmsGroupId', groupId);
      formData.append('LmsGroupFieldId', fieldId);
      formData.append('Type', 'audio-content');
      formData.append('MediaType', 'image');
                
      if (isReplacement && element.oldContentFileId) {
        formData.append('OldContentFileId', element.oldContentFileId);
      }
                
      if (element.file && element.file instanceof File) {
        formData.append('file', element.file);
      } else if (element.file) {
        console.warn('Invalid file object for element:', element);
        formData.append('file', '');
      } else {
        formData.append('file', '');
      }
                
      const transformedPosition = {
        xPercent: element.xPercent,
        yPercent: element.yPercent,
        transform: `translate(${element.xPercent}%, ${element.yPercent}%)`
      };
                
      const zIndex = element.zIndex !== undefined ? element.zIndex : 0;
                
      const contentData = {
        dimensions: {
          widthPercent: element.widthPercent,
          heightPercent: element.heightPercent
        },
        zIndex: zIndex,
        position: transformedPosition,
        id: isNewElement ? null : element.id,
        hyperlink: element.hyperlink || null,
        isReplacement: isReplacement
      };
      
      // Use the passed isEdit parameter instead of reading from route
      formData.append('Position', JSON.stringify(transformedPosition));
      formData.append('Content', JSON.stringify(contentData));
                
      return new Promise((resolve, reject) => {
        this.service.SaveorUpdateImage(formData, isEdit).subscribe({
          next: (response) => {
            if (response && response.id) {
              element.contentFileId = response.id;
              if (isNewElement) element.id = response.id;
                            
              if (response.groupId) element.groupId = response.groupId;
              if (response.fieldId) element.fieldId = response.fieldId;
                            
              // Clear the replacement flags
              (element as any).needsReplacement = false;
              element.oldContentFileId = null;
            }
            resolve(response);
          },
          error: (error) => {
            console.error('Error saving image:', error);
            this.notificationService.errorTopRight('Error saving image');
            reject(error);
          }
        });
      });
    });
          
    return Promise.all(imagePromises)
      .then(() => {
        // Pass isEdit to saveFieldValues
        this.saveFieldValues(allFields, isEdit);
                      
        const isAudioBeingUploaded = !!this.elements.find(element => element.type === 'audio')?.file;
                      
        if (isAudioBeingUploaded) {
          this.notificationService.successTopRight('All changes saved successfully');
          setTimeout(() => {
            this.loadSlideData();
            this.isLoading = false;
          }, 2000);
        } else {
          this.notificationService.successTopRight('All changes saved successfully');
          this.loadSlideData();
          this.isLoading = false;
        }
      })
      .catch(error => {
        console.error('Error in image upload process:', error);
        this.notificationService.errorTopRight('Error saving images');
        this.isLoading = false;
      });
  }
  


  saveContentSlide(pushToAlternateVersions: boolean) {
    if (!this.SelectedSlideId) {
      this.notificationService.errorTopRight('No slide selected');
      return;
    }
          
    // Separating new and existing elements - My Personal Comments(Dont Change)
    const newTextAndButtonElements = this.elements
      .filter(element => 
        (!element.id || element.id.startsWith('element-')) &&
        (element.type === 'text' || element.type === 'button')
      );
          
    const existingTextAndButtonElements = this.elements
      .filter(element => 
        element.id && !element.id.startsWith('element-') &&
        (element.type === 'text' || element.type === 'button')
      );
      
      const isEdit = !pushToAlternateVersions;
      
    // Preparing payload for new text/button elements (First API) - My Personal Comments(Dont Change)
    const newTextAndButtonRequest = newTextAndButtonElements.map((element, index) => {
      const defaultValueObj = {
        position: { xPercent: element.xPercent, yPercent: element.yPercent },
        widthPercent: element.widthPercent,
        heightPercent: element.heightPercent,
        style: element.style || {},
        ...(element.type === 'button' && element.hyperlink !== undefined && { hyperlink: element.hyperlink })
      };
              
      return {
        id: '00000000-0000-0000-0000-000000000000',
        lmsSlideId: this.SelectedSlideId.id || this.SelectedSlideId,
        name: element.type,
        isDeleted: false,
        isEditable: true,
        sequence: index,
        lmsSlideGroupFieldViews: [{
          id: '00000000-0000-0000-0000-000000000000',
          name: element.type === 'text' ? `Text ${index + 1}` : `Button ${index + 1}`,
          defaultValue: JSON.stringify(defaultValueObj),
          controlTypeId: element.type === 'text' ? 0 : 1,
          sequence: index,
          isMadatory: true,
          isVisible: true,
          isDeleted: false,
          values: element.content || ''
        }],
        language: "en"
      };
    });
  
    // Preparing payload for existing text/button elements (First API - position updates)
    const existingTextAndButtonRequest = existingTextAndButtonElements.map((element, index) => {
      const defaultValueObj = {
        position: { xPercent: element.xPercent, yPercent: element.yPercent },
        widthPercent: element.widthPercent,
        heightPercent: element.heightPercent,
        style: element.style || {},
        ...(element.type === 'button' && element.hyperlink !== undefined && { hyperlink: element.hyperlink })
      };
              
      return {
        id: element.id,
        lmsSlideId: this.SelectedSlideId.id || this.SelectedSlideId,
        name: element.type,
        isDeleted: false,
        isEditable: true,
        sequence: index,
        lmsSlideGroupFieldViews: [{
          id: element.fieldId,
          name: element.type === 'text' ? `Text ${index + 1}` : `Button ${index + 1}`,
          defaultValue: JSON.stringify(defaultValueObj),
          controlTypeId: element.type === 'text' ? 0 : 1,
          sequence: index,
          isMadatory: true,
          isVisible: true,
          isDeleted: false,
          values: element.content || ''
        }],
        language: "en"
      };
    });
  
    // Preparing payload for field values (Second API - value updates) - My Personal Comments(Dont Change)
    const fieldValuesRequest = existingTextAndButtonElements.map(element => {
      const defaultValueObj = element.type === 'button' ? {
        position: { xPercent: element.xPercent, yPercent: element.yPercent },
        widthPercent: element.widthPercent,
        heightPercent: element.heightPercent,
        style: element.style || {},
        hyperlink: element.hyperlink
      } : {
        position: { xPercent: element.xPercent, yPercent: element.yPercent },
        content: element.content,
        widthPercent: element.widthPercent,
        heightPercent: element.heightPercent,
        style: element.style || {}
      };
              
      return {
        id: element.fieldValueId || '00000000-0000-0000-0000-000000000000',
        lmsSlideId: this.SelectedSlideId.id || this.SelectedSlideId,
        lmsSlideGroupId: element.id,
        lmsSlideGroupFieldId: element.fieldId,
        htmlEditorValue: element.content || '',
        isDeleted: false,
        defaultValue: JSON.stringify(defaultValueObj)
      };
    });
  
    // Handling image elements - we'll skip creating image groups here
    // and let processImageUploads handle everything
    const imageElements = this.elements.filter(element => element.type === 'image');
  
    // Combining API calls
    const apiCalls = [];
      
    if (newTextAndButtonRequest.length > 0) {
      apiCalls.push(this.service.AddDynamicFieldWithValue(newTextAndButtonRequest, isEdit));
    }
      
    if (existingTextAndButtonRequest.length > 0) {
      apiCalls.push(this.service.AddDynamicFieldWithValue(existingTextAndButtonRequest, isEdit));
    }
      
    if (fieldValuesRequest.length > 0) {
      apiCalls.push(this.service.AddFieldValues(fieldValuesRequest, isEdit));
    }
  
    // If there are no API calls for text/button elements but we have images,
    // add a dummy API call to ensure forkJoin doesn't fail
    if (apiCalls.length === 0 && imageElements.length > 0) {
      apiCalls.push(of({ isSuccess: true }));
    }
  
    // If there are no elements at all, show a message and return
    if (apiCalls.length === 0 && imageElements.length === 0) {
      //this.notificationService.infoTopRight('No changes to save');
      return;
    }
  
    forkJoin(apiCalls).pipe(
      switchMap(responses => {
        const allSuccessful = responses.every(response => response?.isSuccess);
        if (!allSuccessful) {
          throw new Error('One or more API calls failed');
        }
        return this.service.GetSlideGroupField(this.SelectedSlideId.id || this.SelectedSlideId, {});
      })
    ).subscribe({
      next: (fields) => {
        if (imageElements.length > 0) {
          const imageGroup = fields.find(field => field.name === 'image');
          if (imageGroup) {
            // Pass isEdit to processImageUploads
            this.processImageUploads(imageElements, imageGroup, fields, isEdit);
          } else {
            const dummyImageGroup = {
              id: imageElements[0]?.groupId || '00000000-0000-0000-0000-000000000000',
              name: 'image',
              lmsSlideGroupFieldViews: [
                {
                  id: imageElements[0]?.fieldId || '00000000-0000-0000-0000-000000000000',
                  name: 'Image 1'
                }
              ]
            };
            // Pass isEdit to processImageUploads
            this.processImageUploads(imageElements, dummyImageGroup, fields, isEdit);
          }
        } else {
          // Pass isEdit to saveFieldValues
          this.saveFieldValues(fields, isEdit);
          this.notificationService.successTopRight('All changes saved successfully');
          this.hasUnsavedChanges = false;
        }
      },
      error: (error) => {
        console.error('Error saving slide content:', error);
        this.notificationService.errorTopRight('Error saving slide content');
      }
    });
  }
  

  
  processImageUploads(imageElements, imageGroup, allFields, isEdit: boolean) {
    this.isLoading = true;
    this.loadingMessage = 'Saving changes, please wait...';
    
    const slideId = this.SelectedSlideId.id || this.SelectedSlideId;
    const fieldMap = {};
    imageGroup.lmsSlideGroupFieldViews.forEach((field, index) => {
      fieldMap[`Image ${index + 1}`] = field.id;
    });
  
    const imagePromises = imageElements.map((element, index) => {
      const formData = new FormData();
      const isNewElement = !element.id || element.id === '00000000-0000-0000-0000-000000000000' || element.id.startsWith('element-');
      const isReplacement = (element as any).needsReplacement === true;
      
      let groupId, fieldId;
      
      if (isNewElement) {
        groupId = '00000000-0000-0000-0000-000000000000';
        fieldId = '00000000-0000-0000-0000-000000000000';
      } else {
        groupId = element.groupId || imageGroup.id;
        fieldId = element.fieldId || imageGroup.lmsSlideGroupFieldViews[0]?.id;
      }
      
      const idToUse = isNewElement ? '00000000-0000-0000-0000-000000000000' : element.id;
      
      // Use the passed isEdit parameter instead of reading from route
      formData.append('Id', idToUse);
      formData.append('LmsSlideId', slideId);
      formData.append('LmsGroupId', groupId);
      formData.append('LmsGroupFieldId', fieldId);
      formData.append('Type', 'content');
      formData.append('MediaType', 'image');
      
      if (isReplacement && element.oldContentFileId) {
        formData.append('OldContentFileId', element.oldContentFileId);
      }
      
      if (element.file && element.file instanceof File) {
        formData.append('file', element.file);
      } else if (element.file) {
        console.warn('Invalid file object for element:', element);
        formData.append('file', '');
      } else {
        formData.append('file', '');
      }
      
      const transformedPosition = {
        xPercent: element.xPercent,
        yPercent: element.yPercent,
        transform: `translate(${element.xPercent}%, ${element.yPercent}%)`
      };
      
      const zIndex = element.zIndex !== undefined ? element.zIndex : 0;
      
      const contentData = {
        dimensions: {
          widthPercent: element.widthPercent,
          heightPercent: element.heightPercent
        },
        zIndex: zIndex,
        position: transformedPosition,
        id: isNewElement ? null : element.id,
        hyperlink: element.hyperlink || null,
        isReplacement: isReplacement
      };
      
      formData.append('Position', JSON.stringify(transformedPosition));
      formData.append('Content', JSON.stringify(contentData));
      
      return new Promise((resolve, reject) => {
        // Use the passed isEdit parameter
        this.service.SaveorUpdateImage(formData, isEdit).subscribe({
          next: (response) => {
            if (response && response.isSuccess === true) {
              if (response.id) {
                element.contentFileId = response.id;
                if (isNewElement) element.id = response.id;
                
                if (response.groupId) element.groupId = response.groupId;
                if (response.fieldId) element.fieldId = response.fieldId;
                
                (element as any).needsReplacement = false;
                element.oldContentFileId = null;
              }
            }
            resolve(response);
          },
          error: (error) => {
            console.error('Error saving image:', error);
            reject(error);
          }
        });
      });
    });
  
    return Promise.all(imagePromises)
      .then(() => {
        // Pass isEdit to saveFieldValues
        this.saveFieldValues(allFields, isEdit);
        this.notificationService.successTopRight('All changes saved successfully');
        this.loadSlideData();
        this.hasUnsavedChanges = false;
        this.isLoading = false;
      })
      .catch(error => {
        console.error('Error in image upload process:', error);
        this.notificationService.errorTopRight('Error saving images');
        this.isLoading = false;
      });
  }
  
 
  
  


initializeZIndexValues() {
  // Sort elements by type priority (text/button should be on top)
  const typePriority = {
    'image': 1,
    'video': 2, 
    'audio': 3,
    'text': 4,
    'button': 5
  };

  // Sort elements by existing z-index, then by type priority
  this.elements.sort((a, b) => {
    const aZIndex = a.zIndex || 0;
    const bZIndex = b.zIndex || 0;
    
    if (aZIndex === bZIndex) {
      return (typePriority[a.type] || 0) - (typePriority[b.type] || 0);
    }
    return aZIndex - bZIndex;
  });

  // Reassign z-index values starting from 1
  this.elements.forEach((element, index) => {
    element.zIndex = index + 1;
  });

  // Update DOM styles
  this.updateElementStyles();
}
  
  
saveFieldValues(fields, isEdit: boolean) {
  const textAndButtonFields = fields.filter(field =>
    field.name === 'text' || field.name === 'textBox' || field.name === 'button'
  );

  if (textAndButtonFields.length === 0) {
    this.loadSlideData();
    return;
  }

  const fieldValuesRequest = [];
  // Use the passed isEdit parameter instead of reading from route
  
  textAndButtonFields.forEach((field) => {
    const fieldType = field.name;
    
    field.lmsSlideGroupFieldViews.forEach(fieldView => {
      const matchingElements = this.elements.filter(e => {
        if (fieldType === 'button') return e.type === 'button';
        else if (fieldType === 'text' || fieldType === 'textBox') return e.type === 'text';
        return false;
      });

      const element = matchingElements.find(e => {
        if (e.fieldId === fieldView.id) return true;
        
        let defaultPos;
        try {
          defaultPos = JSON.parse(fieldView.defaultValue)?.position;
        } catch (e) {
          defaultPos = null;
        }
        
        if (defaultPos) {
          const positionMatch =
            Math.abs(e.xPercent - defaultPos.xPercent) < 5 &&
            Math.abs(e.yPercent - defaultPos.yPercent) < 5;
          return positionMatch;
        }
        return false;
      });

      if (!element) return;

      element.fieldId = fieldView.id;
      if (fieldView.lmsSlideGroupFieldsValueViewData?.id) {
        element.fieldValueId = fieldView.lmsSlideGroupFieldsValueViewData.id;
      }

      const isButton = fieldType === 'button';

      fieldValuesRequest.push({
        id: element.fieldValueId || fieldView.lmsSlideGroupFieldsValueViewData?.id || '00000000-0000-0000-0000-000000000000',
        lmsSlideId: this.SelectedSlideId.id || this.SelectedSlideId,
        lmsSlideGroupId: field.id,
        lmsSlideGroupFieldId: fieldView.id,
        htmlEditorValue: element.content || '',
        isDeleted: false,
        fieldId: field.id,
        fieldValueId: element.fieldValueId,
        type: fieldType,
        name: fieldView.name,
        sequence: field.sequence,
        defaultValue: isButton ?
          JSON.stringify({
            position: { xPercent: element.xPercent, yPercent: element.yPercent },
            text: element.content,
            widthPercent: element.widthPercent,
            heightPercent: element.heightPercent,
            style: element.style || {}
          }) :
          JSON.stringify({
            position: { xPercent: element.xPercent, yPercent: element.yPercent },
            content: element.content,
            widthPercent: element.widthPercent,
            heightPercent: element.heightPercent,
            style: element.style || {}
          })
      });
    });
  });

  if (fieldValuesRequest.length > 0) {
    // Use the passed isEdit parameter
    this.service.AddFieldValues(fieldValuesRequest, isEdit).subscribe({
      next: (data) => {
        if (data.isSuccess) {
          this.loadSlideData();
        } else {
          this.loadSlideData();
        }
      },
      error: (error) => {
        console.error('Error saving field values:', error);
      }
    });
  } else {
    this.loadSlideData();
  }
}

 
  removeButtonForVideo(index: number) {
    this.openConfirmDialog('button', index);
  }

  // Editor removal methods
  removeEditorForVideo(index: number) {
    this.openConfirmDialog('editor', index);
  }
  openConfirmDialog(type: string, item: any) {
    const message = this.getConfirmationMessage(type);

    this.dialogRef = this.dialog.open(this.confirmDeleteDialog, {
      width: '400px',
      data: {
        type: type,
        item: item,
        message: message
      }
    });
  }

  getConfirmationMessage(type: string): string {
    switch (type) {
      case 'video':
        return 'Are you sure you want to delete this video?';
      case 'audio':
        return 'Are you sure you want to delete this audio?';
      case 'image':
        return 'Are you sure you want to delete this image?';
      case 'text':
        return 'Are you sure you want to delete this text?';
      case 'button':
        return 'Are you sure you want to delete this button?';
      case 'element':
        return 'Are you sure you want to delete this element?';
      default:
        return 'Are you sure you want to delete this item?';
    }
  }

  confirmDelete(type: string, element: PageElement) {
    if (!type || !element) {
      this.dialogRef.close();
      return;
    }

    switch (element.type) {
      case 'video':
        this.removeVideo();
        break;
      case 'audio':
        this.removeAudio();
        break;
      case 'image':
        this.deleteImageContent(element);
        break;
      case 'element':
      case 'text':
      case 'button':
        this.deleteElement(element);
        break;
    }

    this.dialogRef.close();
  }


  deleteElement(element: PageElement) {
    if (element.isMandatory) {
      this.notificationService.errorTopRight('This element is mandatory and cannot be deleted.');
      return;
    }
    
    // Check if fieldId exists and is not a zero UUID before trying to delete dynamic field
    if ((element.type === 'text' || element.type === 'button') && 
        element.fieldId && 
        element.fieldId !== '00000000-0000-0000-0000-000000000000') {
      this.deleteDynamicField(element.fieldId, element.id);
      return;
    }
    
    if (element.type === 'image' && (element.id && element.contentFileId)) {
      const imageId = element.contentFileId || element.id;
      const groupId = element.groupId || element.id;
      const request = {
        uploadId: imageId,
        groupId: groupId,
        flag: 'image'
      };
      this.service.DeleteVideoOrAudiofromSlide(request).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.removeElementFromArray(element);
            this.notificationService.successTopRight('Element deleted successfully');
            this.hasUnsavedChanges = false;
          } else {
            this.notificationService.errorTopRight('Failed to delete image');
          }
        },
        error: (error) => {
          console.error('Error deleting image:', error);
          this.notificationService.errorTopRight('Error deleting image');
        }
      });
      return;
    } else {
      element.content = '';
      this.notificationService.successTopRight('Element deleted successfully');
      this.hasUnsavedChanges = false;
    }
    this.removeElementFromArray(element);
}



  deleteElementFromServer(element: PageElement) {
    if (element.type === 'image' && element.contentFileId) {
      const request = {
        uploadId: element.contentFileId,
        flag: 'image'
      };

      this.service.DeleteVideoOrAudiofromSlide(request).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.removeElementFromArray(element);
            this.notificationService.successTopRight('Image deleted successfully');
            this.hasUnsavedChanges = false;

          } else {
            this.notificationService.errorTopRight('Failed to delete image');
          }
        },
        error: (error) => {
          this.notificationService.errorTopRight('Error deleting image');
        }
      });
    } else {
      // If no specific API handling, just remove from array
      this.removeElementFromArray(element);
    }
  }

  // Method to remove element from the elements array
  removeElementFromArray(element: PageElement) {
    const index = this.elements.findIndex(e => e.id === element.id);
    if (index !== -1) {
      this.elements.splice(index, 1);
      this.hasUnsavedChanges = false;
      if (this.selectedElement && this.selectedElement.id === element.id) {
        this.selectedElement = null;
      }
    }
  }

  removeVideo() {
    const videoElement = this.elements.find(e => e.type === 'video');

    if (videoElement) {
      let videoId = videoElement.id ||
        (this.uploadedVideoData && this.uploadedVideoData.id);

      if (videoId) {
        const request = {
          uploadId: videoId,
          flag: 'video'
        };

        this.service.DeleteVideoOrAudiofromSlide(request).subscribe({
          next: (data) => {
            this.clearVideoData(videoElement);
            this.notificationService.successTopRight('Video removed successfully');
            this.hasUnsavedChanges = false;
          },
          error: (error) => {
            this.clearVideoData(videoElement);
            this.notificationService.successTopRight('Video removed successfully');
          }
        });
      } else {
        this.clearVideoData(videoElement);
        this.notificationService.successTopRight('Video removed successfully');
        this.hasUnsavedChanges = false;
      }
    }
  }

  private clearVideoData(videoElement) {
    videoElement.content = '';

    if ('sanitizedVideoUrl' in videoElement) {
      videoElement.sanitizedVideoUrl = null;
    }
    if ('localVideoUrl' in videoElement) {
      videoElement.localVideoUrl = null;
    }
    if ('isYoutubeOrVimeo' in videoElement) {
      videoElement.isYoutubeOrVimeo = false;
    }

    this.videoUrl = null;
    this.sanitizedVideoUrl = null;
    this.localVideoUrl = null;
    this.uploadedVideoData = null;

    if (this.selectedElement && this.selectedElement.type === 'video') {
      this.selectedElement.content = '';

      if ('sanitizedVideoUrl' in this.selectedElement) {
        this.selectedElement.sanitizedVideoUrl = null;
      }
      if ('localVideoUrl' in this.selectedElement) {
        this.selectedElement.localVideoUrl = null;
      }
    }
  }

  removeAudio() {
    const audioElement = this.elements.find(e => e.type === 'audio');
  
    if (audioElement) {
      let audioId = audioElement.id || audioElement.contentFileId;
  
      if (audioId) {
        const request = {
          uploadId: audioId,
          flag: 'audio'
        };
  
        // Send API request to delete audio
        this.service.DeleteVideoOrAudiofromSlide(request).subscribe({
          next: (data) => {
            this.clearAudioData(audioElement);
            this.notificationService.successTopRight('Audio removed successfully');
            this.hasUnsavedChanges = false;
          },
          error: (error) => {
            this.clearAudioData(audioElement);
            console.error('Error removing audio from API:', error);
            this.notificationService.successTopRight('Audio removed locally');
            this.hasUnsavedChanges = false;
          }
        });
      } else {
        this.clearAudioData(audioElement);
        this.notificationService.successTopRight('Audio removed successfully');
        this.hasUnsavedChanges = false;
      }
    }
  }
  
  // Helper Method to Clear Audio Data
  clearAudioData(audioElement: any) {
    audioElement.content = '';
    audioElement.file = null;
    audioElement.contentFileId = undefined;
  
    if (this.selectedElement && this.selectedElement.type === 'audio') {
      this.selectedElement.content = '';
    }
  }  
  

  deleteDynamicField(fieldId: string,groupId: string) {
    const request = {
      "fieldId": fieldId,
      "groupId": groupId
    };
    console.log('hjahssabj',request)

    this.service.DeleteDynamicField(request).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          // Find and remove the element with this fieldId
          const index = this.elements.findIndex(e => e.fieldId === fieldId);
          if (index !== -1) {
            const element = this.elements[index];
            this.elements.splice(index, 1);

            if (this.selectedElement && this.selectedElement.fieldId === fieldId) {
              this.selectedElement = null;
            }
          }

          this.notificationService.successTopRight('Element deleted successfully');
          this.loadSlideData();
          this.markElementsAsModified();
        } else {
          this.notificationService.errorTopRight('Failed to delete field');
        }
      },
      error: (error) => {
        this.notificationService.errorTopRight('Error deleting field');
      }
    });
  }

  @HostListener('window:keydown', ['$event'])
  // handleKeyboardEvent(event: KeyboardEvent) {
  //   // Delete selected element
  //   if (event.key === 'Delete' && this.selectedElement) {
  //     this.deleteElement(this.selectedElement);
  //   }

  //   if (event.ctrlKey && event.key === 'c' && this.selectedElement) {
  //     localStorage.setItem('copiedElement', JSON.stringify(this.selectedElement));
  //   }

  //   if (event.ctrlKey && event.key === 'v') {
  //     const copiedElement = localStorage.getItem('copiedElement');
  //     if (copiedElement) {
  //       const element = JSON.parse(copiedElement);
  //       this.duplicateElement(element);
  //     }
  //   }

  //   if (event.ctrlKey && event.key === 'z') {
  //   }

  //   if (event.ctrlKey && event.key === 'y') {
  //   }
  // }

  getBackgroundSize(): string {
    return this.showGridBlocks 
      ? `${this.cellWidthPercent + this.gridGutterPercent}% ${this.cellHeightPercent + this.gridGutterPercent}%` 
      : 'auto';
  }

  // ============ Text Editor Methods ============
  
  onPaste(event: ClipboardEvent) {
    // Allow paste in editor
  }

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
        currentEl = currentEl.parentElement;
      }
      
      if (bgColor) {
        const rgb = this.parseRgbString(bgColor);
        if (rgb) {
          this.bgColorR = rgb.r;
          this.bgColorG = rgb.g;
          this.bgColorB = rgb.b;
          this.selectedBgColor = this.rgbToHex(rgb.r, rgb.g, rgb.b);
          this.bgColorHex = this.selectedBgColor;
          const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
          this.bgColorHsv = hsv;
        }
      }
    } catch (err) {}
  }

  parseRgbString(color: string): { r: number; g: number; b: number } | null {
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
  }

  applyHeading(heading: any) {
    this.showHeadingDropdown = false;
    
    if (!this.savedSelectionForHeading) {
      return;
    }
    
    const sel = window.getSelection();
    if (!sel) {
      return;
    }
    
    sel.removeAllRanges();
    sel.addRange(this.savedSelectionForHeading);
    
    const range = this.savedSelectionForHeading;
    if (range.collapsed) {
      this.savedSelectionForHeading = null;
      return;
    }
    
    const selectedText = range.toString();
    
    if (!selectedText.trim()) {
      this.savedSelectionForHeading = null;
      return;
    }
    
    // Extract styles BEFORE any DOM manipulation
    const extractedStyles = this.extractStylesFromSelection(range);
    
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
    
    // Create the new clean span with only the styles we want
    const wrapper = document.createElement('span');
    const fontSize = heading.fontSize || '14px';
    const lineHeight = heading.lineHeight || '1.2';
    const fontWeight = heading.fontWeight || '400';
    
    let styleString = `font-size: ${fontSize}; line-height: ${lineHeight}; font-weight: ${fontWeight}; display: inline;`;

    // Preserve background color if it existed
    if (extractedStyles.backgroundColor && extractedStyles.backgroundColor !== 'transparent' && extractedStyles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      styleString += ` background-color: ${extractedStyles.backgroundColor};`;
    }
    
    // Preserve text color if it existed (but not default black)
    if (extractedStyles.color && extractedStyles.color !== 'rgb(0, 0, 0)' && extractedStyles.color !== '#000000') {
      styleString += ` color: ${extractedStyles.color};`;
    }
    
    // Preserve font-family if it existed
    if (extractedStyles.fontFamily) {
      styleString += ` font-family: ${extractedStyles.fontFamily};`;
    }
    
    wrapper.style.cssText = styleString;
    wrapper.textContent = selectedText;
    
    if (outermostSpan && outermostSpan.textContent?.trim() === selectedText.trim()) {
      outermostSpan.parentNode?.replaceChild(wrapper, outermostSpan);
    } else {
      range.deleteContents();
      range.insertNode(wrapper);
    }
    
    // Select the new wrapper
    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(wrapper);
    sel.addRange(newRange);

    this.ngZone.run(() => {
      this.selectedHeading = heading.name;
      this.selectedFontSize = this.getFontSizeFromPx(heading.fontSize);
    });
    this.savedSelectionForHeading = null;
    
    // Sync editor content with FormControl
    this.syncEditorContent();
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

  /**
   * Detects formatting (font size, heading, font family) from HTML content
   * and updates the dropdown selected values accordingly
   */
  private detectFormattingFromContent(htmlContent: string): void {
    // Reset values first
    this.selectedFontSize = null;
    this.selectedHeading = null;
    this.selectedFontFamily = null;
    
    if (!htmlContent || htmlContent.trim() === '') {
      return;
    }
    
    // Parse HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Find all styled spans
    const allSpans = tempDiv.querySelectorAll('span');
    let detectedFontFamily: string | null = null;
    let detectedFontSize: string | null = null;
    let detectedFontWeight: string | null = null;
    
    // Check each span for font-family
    for (let i = 0; i < allSpans.length; i++) {
      const span = allSpans[i] as HTMLElement;
      
      // Check inline style
      if (span.style.fontFamily && !detectedFontFamily) {
        detectedFontFamily = span.style.fontFamily;
      }
      
      // Also check the style attribute directly for cases where style object doesn't parse correctly
      const styleAttr = span.getAttribute('style') || '';
      if (!detectedFontFamily && styleAttr) {
        const fontFamilyMatch = styleAttr.match(/font-family:\s*([^;]+)/i);
        if (fontFamilyMatch) {
          detectedFontFamily = fontFamilyMatch[1].trim();
        }
      }
      
      if (span.style.fontSize && !detectedFontSize) {
        detectedFontSize = span.style.fontSize;
      }
      
      if (span.style.fontWeight && !detectedFontWeight) {
        detectedFontWeight = span.style.fontWeight;
      }
      if (detectedFontFamily && detectedFontSize && detectedFontWeight) {
        break;
      }
    }
    
    // Set font size
    if (detectedFontSize) {
      const sizeFromPx = this.getFontSizeFromPx(detectedFontSize);
      if (sizeFromPx) {
        this.selectedFontSize = sizeFromPx;
      }
    }
    
    // Set heading based on font size and weight
    if (detectedFontSize && detectedFontWeight) {
      const matchedHeading = this.headings.find(h => {
        const hFontSize = parseInt(h.fontSize, 10);
        const eFontSize = parseInt(detectedFontSize, 10);
        const hFontWeight = h.fontWeight;
        return Math.abs(hFontSize - eFontSize) <= 2 && hFontWeight === detectedFontWeight;
      });
      
      if (matchedHeading) {
        this.selectedHeading = matchedHeading.name;
      }
    }
    
    // Set font family - same as manage-website
    if (detectedFontFamily) {
      // Clean the font family string
      const cleanedFont = detectedFontFamily.replace(/['"]/g, '').trim();
      this.selectedFontFamily = cleanedFont || "HelveticaNeuelight";
    }
  }

  private extractStylesFromSelection(range: Range): { backgroundColor: string | null; color: string | null; fontFamily: string | null; fontSize: string | null } {
    let backgroundColor: string | null = null;
    let color: string | null = null;
    let fontFamily: string | null = null;
    let fontSize: string | null = null;
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
        if (!fontSize && el.style.fontSize) {
          fontSize = el.style.fontSize;
        }
        const bgAttr = el.getAttribute('style');
        if (bgAttr) {
          if (!backgroundColor) {
            const bgMatch = bgAttr.match(/background(?:-color)?:\s*([^;]+)/i);
            if (bgMatch) {
              backgroundColor = bgMatch[1].trim();
            }
          }
          if (!fontFamily) {
            const fontMatch = bgAttr.match(/font-family:\s*([^;]+)/i);
            if (fontMatch) {
              fontFamily = fontMatch[1].trim();
            }
          }
          if (!fontSize) {
            const sizeMatch = bgAttr.match(/font-size:\s*([^;]+)/i);
            if (sizeMatch) {
              fontSize = sizeMatch[1].trim();
            }
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
          }
        }
        if (!color && node.style.color) {
          color = node.style.color;
        }
        if (!fontFamily && node.style.fontFamily) {
          fontFamily = node.style.fontFamily;
        }
        if (!fontSize && node.style.fontSize) {
          fontSize = node.style.fontSize;
        }
        
        // Also check the style attribute directly (for rgb values, font-family, and font-size)
        const styleAttr = node.getAttribute('style');
        if (styleAttr) {
          if (!backgroundColor) {
            const bgMatch = styleAttr.match(/background(?:-color)?:\s*([^;]+)/i);
            if (bgMatch) {
              const bgValue = bgMatch[1].trim();
              if (bgValue && bgValue !== 'transparent' && bgValue !== 'rgba(0, 0, 0, 0)') {
                backgroundColor = bgValue;
              }
            }
          }
          if (!fontFamily) {
            const fontMatch = styleAttr.match(/font-family:\s*([^;]+)/i);
            if (fontMatch) {
              fontFamily = fontMatch[1].trim();
            }
          }
          if (!fontSize) {
            const sizeMatch = styleAttr.match(/font-size:\s*([^;]+)/i);
            if (sizeMatch) {
              fontSize = sizeMatch[1].trim();
            }
          }
        }
        
        // Check computed style as fallback
        if (!backgroundColor) {
          const computed = window.getComputedStyle(node);
          if (computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)' && computed.backgroundColor !== 'transparent') {
            backgroundColor = computed.backgroundColor;
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
          if (computed.fontFamily) {
            fontFamily = computed.fontFamily.replace(/['"]/g, '');
          }
        }
        if (!fontSize) {
          const computed = window.getComputedStyle(node);
          if (computed.fontSize) {
            fontSize = computed.fontSize;
          }
        }
      }
      node = node.parentNode;
    }
    
    return { backgroundColor, color, fontFamily, fontSize };
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
    this.activeColorPicker = null;
  }

  updateCanvasColor(event: MouseEvent, type: 'text' | 'bg') {
    const canvas = event.currentTarget as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    
    x = Math.max(0, Math.min(rect.width, x));
    y = Math.max(0, Math.min(rect.height, y));
    
    const s = (x / rect.width) * 100;
    const v = 100 - (y / rect.height) * 100;
    
    if (type === 'text') {
      this.textColorHsv.s = s;
      this.textColorHsv.v = v;
      const rgb = this.hsvToRgb(this.textColorHsv.h, s, v);
      this.textColorR = rgb.r;
      this.textColorG = rgb.g;
      this.textColorB = rgb.b;
      this.selectedTextColor = this.rgbToHex(rgb.r, rgb.g, rgb.b);
    } else {
      this.bgColorHsv.s = s;
      this.bgColorHsv.v = v;
      const rgb = this.hsvToRgb(this.bgColorHsv.h, s, v);
      this.bgColorR = rgb.r;
      this.bgColorG = rgb.g;
      this.bgColorB = rgb.b;
      this.selectedBgColor = this.rgbToHex(rgb.r, rgb.g, rgb.b);
    }
  }

  onHueMouseDown(event: MouseEvent, type: 'text' | 'bg') {
    this.isHueDragging = true;
    this.activeColorPicker = type;
    this.updateHue(event, type);
  }

  onHueMouseMove(event: MouseEvent, type: 'text' | 'bg') {
    if (this.isHueDragging && this.activeColorPicker === type) {
      this.updateHue(event, type);
    }
  }

  onHueMouseUp() {
    this.isHueDragging = false;
  }

  updateHue(event: MouseEvent, type: 'text' | 'bg') {
    const slider = event.currentTarget as HTMLElement;
    const rect = slider.getBoundingClientRect();
    let x = event.clientX - rect.left;
    x = Math.max(0, Math.min(rect.width, x));
    
    const h = (x / rect.width) * 360;
    
    if (type === 'text') {
      this.textColorHsv.h = h;
      const rgb = this.hsvToRgb(h, this.textColorHsv.s, this.textColorHsv.v);
      this.textColorR = rgb.r;
      this.textColorG = rgb.g;
      this.textColorB = rgb.b;
      this.selectedTextColor = this.rgbToHex(rgb.r, rgb.g, rgb.b);
    } else {
      this.bgColorHsv.h = h;
      const rgb = this.hsvToRgb(h, this.bgColorHsv.s, this.bgColorHsv.v);
      this.bgColorR = rgb.r;
      this.bgColorG = rgb.g;
      this.bgColorB = rgb.b;
      this.selectedBgColor = this.rgbToHex(rgb.r, rgb.g, rgb.b);
    }
  }

  onTextRgbInput(channel: 'r' | 'g' | 'b', value: number) {
    value = Math.max(0, Math.min(255, value || 0));
    
    if (channel === 'r') this.textColorR = value;
    else if (channel === 'g') this.textColorG = value;
    else if (channel === 'b') this.textColorB = value;
    
    this.selectedTextColor = this.rgbToHex(this.textColorR, this.textColorG, this.textColorB);
    this.textColorHsv = this.rgbToHsv(this.textColorR, this.textColorG, this.textColorB);
  }

  onBgRgbInput(channel: 'r' | 'g' | 'b', value: number) {
    value = Math.max(0, Math.min(255, value || 0));
    
    if (channel === 'r') this.bgColorR = value;
    else if (channel === 'g') this.bgColorG = value;
    else if (channel === 'b') this.bgColorB = value;
    
    this.selectedBgColor = this.rgbToHex(this.bgColorR, this.bgColorG, this.bgColorB);
    this.bgColorHsv = this.rgbToHsv(this.bgColorR, this.bgColorG, this.bgColorB);
  }

  applyTextColor() {
    try {
      const colorToApply = this.rgbToHex(this.textColorR, this.textColorG, this.textColorB);
      document.execCommand('foreColor', false, colorToApply);
      this.selectedTextColor = colorToApply;
      this.showTextColorPicker = false;
      this.syncEditorContent();
    } catch (err) {
      console.error('Error applying text color:', err);
    }
  }

  applyBgColor() {
    try {
      const colorToApply = this.rgbToHex(this.bgColorR, this.bgColorG, this.bgColorB);
      document.execCommand('hiliteColor', false, colorToApply);
      this.selectedBgColor = colorToApply;
      this.showBgColorPicker = false;
      this.syncEditorContent();
    } catch (err) {
      console.error('Error applying background color:', err);
    }
  }

  removeBgColor() {
    try {
      document.execCommand('hiliteColor', false, 'transparent');
      this.showBgColorPicker = false;
      this.syncEditorContent();
    } catch (err) {
      console.error('Error removing background color:', err);
    }
  }

  applySizeKeepingColor(size: any) {
    this.showFontSizeDropdown = false;
    
    if (!this.savedSelectionForFontSize) {
      return;
    }
    
    const sel = window.getSelection();
    if (!sel) {
      return;
    }
    
    sel.removeAllRanges();
    sel.addRange(this.savedSelectionForFontSize);
    
    const range = this.savedSelectionForFontSize;
    if (range.collapsed) {
      this.savedSelectionForFontSize = null;
      return;
    }
    
    const selectedText = range.toString();
    
    if (!selectedText.trim()) {
      this.savedSelectionForFontSize = null;
      return;
    }

    const extractedStyles = this.extractStylesFromSelection(range);
    
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
    const lineHeight = fontSizeNumber >= 18 ? 1.2 : 1;
    let styleString = `font-size: ${fontSizePx}; line-height: ${lineHeight}; display: inline;`;
    
    if (extractedStyles.backgroundColor && extractedStyles.backgroundColor !== 'transparent' && extractedStyles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      styleString += ` background-color: ${extractedStyles.backgroundColor};`;
    }
    
    if (extractedStyles.color && extractedStyles.color !== 'rgb(0, 0, 0)' && extractedStyles.color !== '#000000') {
      styleString += ` color: ${extractedStyles.color};`;
    }
    
    // Preserve font-family
    if (extractedStyles.fontFamily) {
      styleString += ` font-family: ${extractedStyles.fontFamily};`;
    }
    
    wrapper.style.cssText = styleString;
    wrapper.textContent = selectedText;
    
    if (outermostSpan && outermostSpan.textContent?.trim() === selectedText.trim()) {
      outermostSpan.parentNode?.replaceChild(wrapper, outermostSpan);
    } else {
      range.deleteContents();
      range.insertNode(wrapper);
    }
    
    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(wrapper);
    sel.addRange(newRange);

    this.ngZone.run(() => {
      this.selectedFontSize = size.name;
    });
    
    this.savedSelectionForFontSize = null;
    
    // Sync editor content with FormControl
    this.syncEditorContent();
  }

  /**
   * Syncs the angular-editor's DOM content with the FormControl value
   */
  private syncEditorContent(): void {
    setTimeout(() => {
      const editorEl = document.querySelector('.home-text-editor .angular-editor-textarea[contenteditable="true"]') as HTMLElement;
      if (editorEl) {
        // Trigger input event to sync FormControl with DOM content
        editorEl.dispatchEvent(new Event('input', { bubbles: true }));
        this.cdr.detectChanges();
      }
    }, 0);
  }

  private normFont(font: string | null | undefined): string {
    return (font || 'HelveticaNeuelight').replace(/["']/g, '').replace(/\s+/g, '');
  }

  private placeCaretAfter(el: HTMLElement) {
    const sel = window.getSelection();
    if (!sel) return;
    const r = document.createRange();
    r.selectNodeContents(el);
    r.collapse(false);
    sel.removeAllRanges();
    sel.addRange(r);
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
    'timesnewroman': 'Times New Roman',
    'verdana': 'Verdana',
    'helvetica neue medium': 'HelveticaNeueMedium',
    'helveticaneuemed': 'HelveticaNeueMedium',
    'helveticaneuemedium': 'HelveticaNeueMedium',
    'helvetica neue light': 'HelveticaNeuelight',
    'helveticaneuelight': 'HelveticaNeuelight',
    'helvetica neue bold': 'HelveticaNeueBold',
    'helveticaneuebold': 'HelveticaNeueBold'
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

  setFontFamily(font: string) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;

    const selectedText = range.toString();
    
    if (!selectedText.trim()) {
      return;
    }

    // Extract existing styles from the selection
    const extractedStyles = this.extractStylesFromSelection(range);
    
    const family = this.normFont(font);

    // Find the parent span and outermost span
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

    // Create new wrapper with preserved styles
    const wrapper = document.createElement('span');
    let styleString = `font-family: ${family}; display: inline;`;
    
    // Preserve font-size if it existed
    if (extractedStyles.fontSize) {
      styleString += ` font-size: ${extractedStyles.fontSize};`;
    }
    
    // Preserve background color if it existed
    if (extractedStyles.backgroundColor && extractedStyles.backgroundColor !== 'transparent' && extractedStyles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      styleString += ` background-color: ${extractedStyles.backgroundColor};`;
    }
    
    // Preserve text color if it existed
    if (extractedStyles.color && extractedStyles.color !== 'rgb(0, 0, 0)' && extractedStyles.color !== '#000000') {
      styleString += ` color: ${extractedStyles.color};`;
    }
    
    wrapper.style.cssText = styleString;
    wrapper.textContent = selectedText;
    
    // Replace or insert the wrapper
    if (outermostSpan && outermostSpan.textContent?.trim() === selectedText.trim()) {
      outermostSpan.parentNode?.replaceChild(wrapper, outermostSpan);
    } else {
      range.deleteContents();
      range.insertNode(wrapper);
    }
    
    // Select the new wrapper
    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(wrapper);
    sel.addRange(newRange);

    this.ngZone.run(() => {
      this.selectedFontFamily = font;
    });
    this.showFontFamilyDropdown = false;
    
    // Sync editor content with FormControl
    this.syncEditorContent();
    
    setTimeout(() => this.updateSelectedFont());
  }

  updateSelectedFont(): void {
    try {
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
        // Check for inline font-size style first
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
      // Silently handle errors
    }
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
}
