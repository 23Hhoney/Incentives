import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ManageWebsiteService } from '../authentication/manage-website/manage-website.service';

@Component({
  selector: 'app-program-rules',
  templateUrl: './program-rules.component.html',
  styleUrls: ['./program-rules.component.scss']
})
export class ProgramRulesComponent {
  showPublishedPage = false;
  publishedPage = null;
  sectionsArray = [];
  prItems: Array<{ title: string; items: any[] }> = []; 
  iframeSrc= null
  isPreview: boolean;
  draftId: any;
  selectedItemUrl: string | null = null; // Track the selected item's blobUrl
  isIframeAllowed: boolean;
  showIframe: boolean = true;

  blockedContentHtml: string | null = null;
  private blockedHosts: string[] = []; 
  private readonly KOHLER_WARRANTY_URL = 'https://assist.kohler.com/en/warranty';
   constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private manageWebsiteContent: ManageWebsiteService,
    private route: ActivatedRoute
  ) {
    this.prItems = []; 

    this.route.queryParamMap.subscribe(params => {
      this.isPreview = params.get('isPreview') === 'true';
      this.draftId = params.get('draftId');
    });

    this.manageWebsiteContent.GetAllCMSMenu(false).subscribe((res: any[]) => {
      const filteredRes = res.filter(item => !item.menuId.startsWith('DRFT_') && item.menuId !== 'DRFT_RESTORED');
      filteredRes.forEach((items) => {
        if (items.menuId === 'PR') {
          this.publishedPage = items;
        }
      });

      if (this.draftId != null) {
        this.showPublishedPage = true;
        this.fetchCMSContainer(this.draftId, false);
      } else if (this.publishedPage) {
        this.showPublishedPage = true;
        this.fetchCMSContainer(this.publishedPage.id, true);
      } else {
        this.showPublishedPage = false;
      }
    });
  }

  fetchCMSContainer(id: string, isPublished: boolean) {
    this.manageWebsiteContent.GetAllCMSContainer(id, isPublished).subscribe((resp: any[]) => {
      // Create a map to group items by bannerSubHeading for PR menu
       this.prItems = [];
      const sectionMap = new Map<string, any[]>();

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

        // Group items by bannerSubHeading for PR menu
        if (this.publishedPage?.menuId === 'PR') {
          section.getAllCMSContainerViews.forEach((container) => {
            container.getAllCMSItemViews.forEach((item) => {
              // Only include items with a valid url or content
              if (item.url || item.content) {
                const subHeading = item.bannerSubHeading || 'General Information';
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
                  fileName: item.newHeadings?.[0]?.text || this.extractFileName(item.url || item.content || ''),
                  url: item.content || item.url || '',
                  content: item.content || '',
                  type: item.type || 'pdf',
                  panelType: item.panelType || 'pdf',
                  fullBleed: item.fullBleed || '',
                  fitWidth: item.fitWidth || '',
                  opacity: item.opacity || '',
                  autoPlay: item.autoPlay || false,
                  requireUserToWatch: item.isRequired || false
                });
              }
            });
          });
        }

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

              let buttonStyle: any = {};
              if (items.type === 'button' && items.salesHeading) {
                try {
                  buttonStyle = typeof items.salesHeading === 'string' ? JSON.parse(items.salesHeading) : items.salesHeading;
                } catch (e) {
                  console.warn('Failed to parse button salesHeading for item', items.id, ':', e);
                }
              }

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

      // Populate prItems dynamically from sectionMap
     if (this.publishedPage.menuId === 'PR') {
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
    });
  }
  getSafeURl(text): SafeResourceUrl {
    if (!text) {return null};
    return this.sanitizer.bypassSecurityTrustResourceUrl(text);
  }
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
 ;
  prFile = null;

  collapsed = true;
  navBarData = [
    {
      icon: 'fal, fa-home',
      label: 'Dashboard'
    }
  ]

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }
isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

  ngOnInit() {
    this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl('assets/2025_Preferred Partner_Q1.pdf');

  }

   handleLinkChange(url: string) {
    this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.selectedItemUrl = url;
    console.log(this.iframeSrc);
    this.selectedItemUrl = url; // Track the selected URL
    this.showIframe = false;
    this.blockedContentHtml = null;

    if (!url) {
      this.iframeSrc = null;
      this.selectedItemUrl = null; // Reset selection if no URL
     
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
      this.selectedItemUrl = null; // Reset selection for non-renderable files
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
     
      return;
    }

    try {
      const isWebUrl = url.startsWith('http');

      if (isWebUrl) {
        if (url === this.KOHLER_WARRANTY_URL) {
          this.setBlockedContent(url);
          this.iframeSrc = null;
          this.selectedItemUrl = null; 
         
          return;
        }
      }
    } catch (e) {}

    this.showIframe = true;
    this.iframeSrc = this.getSafeURl(url);
  
  }

  private clearFileInput(): void {
    this.prFile = null;
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  private setBlockedContent(url: string): void {
    this.blockedContentHtml = `
      <div class="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p class="mb-4">
          The embedded content for this URL is blocked by application settings (likely due to security policies of the source site).
        </p>
        <a href="${url}" target="_blank" class="text-blue-600 hover:text-blue-800 font-medium underline">
          Click on the Link to open the URL saved
        </a>
      </div>
    `;
  }


  navigateToAccount() {
    this.router.navigate(['/dashboards'])
  }
getFileExtension(filePath: string): string {
  if (!filePath) return '';
  const fileExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mp3', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.ppt', '.pptx'];
  const lowerCasePath = filePath.toLowerCase();
  const isFile = fileExtensions.some(ext => lowerCasePath.endsWith(ext));
  if (isFile) {
    const extension = lowerCasePath.split('.').pop() || '';
    return extension ? `.${extension}` : '';
  }
  return ''; // Return empty string for webpage URLs
}
extractFileName(url: string): string {
  if (!url) return '';
  const parts = url.split('/');
  return parts[parts.length - 1] || '';
}
trackByItemUrl(index: number, item: any): string {
  return item.blobUrl; // Use blobUrl as the unique identifier
}
}
