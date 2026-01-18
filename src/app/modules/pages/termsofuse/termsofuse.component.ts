import { Component } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { ManageWebsiteService } from '../authentication/manage-website/manage-website.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-termsofuse',
  templateUrl: './termsofuse.component.html',
  styleUrls: ['./termsofuse.component.scss']
})
export class TermsofuseComponent {
  publishedPage = null;
  showPublishedPage = true;
  sectionsArray = [];
  isPreview: boolean;
  draftId: string = null;

  constructor(private _router: Router, private manageWebsiteContent: ManageWebsiteService, private sanitizer: DomSanitizer, private route: ActivatedRoute) {

    this.route.queryParamMap.subscribe(params => {
      this.isPreview = params.get('isPreview') === 'true';
      this.draftId = params.get('draftId');  
    });
    this.manageWebsiteContent.GetAllCMSMenu(false).subscribe((res: any[]) => {
      const filteredRes = res.filter(item => !item.menuId.startsWith('DRFT_') && item.menuId !== 'DRFT_RESTORED');
      
      filteredRes.forEach((items) => {
        if (items.menuId === 'TOU') {
          this.publishedPage = items;
        }
      });
      if (this.draftId != null) {
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

                  

                  // Handle text content with HTML formatting check
                  let textContent: string = '';
                  if (items.text) {
                    textContent = items.text;
                    // Ensure HTML paragraphs are preserved
                    if (!textContent.includes('<p>') && textContent.trim()) {
                      textContent = `<p>${textContent}</p>`;
                    }
                  } else if (items.getAllCMSItemViews?.length && items.getAllCMSItemViews[0].content) {
                    const firstItem = items.getAllCMSItemViews[0];
                    if (firstItem.type === 'text' || items.type === 'text' || items.type === 'textbox') {
                      textContent = firstItem.content;
                      // Ensure HTML paragraphs are preserved
                      if (!textContent.includes('<p>') && textContent.trim()) {
                        textContent = `<p>${textContent}</p>`;
                      }
                    }
                  }

                  // Positioning fallbacks
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

                  

                  // Handle text content with HTML formatting check
                  let textContent: string = '';
                  if (items.text) {
                    textContent = items.text;
                    // Ensure HTML paragraphs are preserved
                    if (!textContent.includes('<p>') && textContent.trim()) {
                      textContent = `<p>${textContent}</p>`;
                    }
                  } else if (items.getAllCMSItemViews?.length && items.getAllCMSItemViews[0].content) {
                    const firstItem = items.getAllCMSItemViews[0];
                    if (firstItem.type === 'text' || items.type === 'text' || items.type === 'textbox') {
                      textContent = firstItem.content;
                      // Ensure HTML paragraphs are preserved
                      if (!textContent.includes('<p>') && textContent.trim()) {
                        textContent = `<p>${textContent}</p>`;
                      }
                    }
                  }

                  // Positioning fallbacks
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
  isTokenPresent = false;
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  ngOnInit() {
    this.isTokenPresent = !! window.sessionStorage.getItem('accessToken');
  }
  getRouteLink() {
    if (this.isTokenPresent) {
      this._router.navigate(['/dashboards']);
    } else {
      this._router.navigate(['/sign-in']);
    }
  }
}
