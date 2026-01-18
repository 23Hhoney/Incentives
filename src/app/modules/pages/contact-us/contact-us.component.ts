import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ManageWebsiteService } from '../authentication/manage-website/manage-website.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent {
  showPublishedPage = false;
  publishedPage: any = null;
  sectionsArray: any[] = [];
  isTokenPresent = false;

  constructor(
    private _router: Router,
    private manageWebsiteContent: ManageWebsiteService,
    private sanitizer: DomSanitizer
  ) {
    const urlParams = new URLSearchParams(window.location.search);
    const isPreview = urlParams.get('isPreview') === 'true';
    const draftId = urlParams.get('draftId');

    if (isPreview && draftId) {
      // Load the draft preview
      this.showPublishedPage = true;
      this.loadCMSContainers(draftId, false); // false = preview
    } else {
      // Original published page logic
      this.manageWebsiteContent.GetAllCMSMenu(false).subscribe((res: any[]) => {
        const filteredRes = res.filter(item => !item.menuId.startsWith('DRFT_') && item.menuId !== 'DRFT_RESTORED');
        filteredRes.forEach((items) => {
          if (items.menuId === 'CU') {
            this.publishedPage = items;
          }
        });

        if (this.publishedPage) {
          this.showPublishedPage = true;
          this.loadCMSContainers(this.publishedPage.id, true); // true = published
        } else {
          this.showPublishedPage = false;
        }
      });
    }
  }

  private loadCMSContainers(containerId: string, flag: boolean) {
    this.manageWebsiteContent.GetAllCMSContainer(containerId, flag).subscribe((resp: any[]) => {
      this.sectionsArray = resp.map((section, sectionIndex) => {
        const parsedStylesArray = section.getAllCMSContainerViews.map(item => {
          try {
            const styles = typeof item.styles === 'string' ? JSON.parse(item.styles) : item.styles || {};
            if (typeof styles.top === 'string') styles.top = parseFloat(styles.top);
            if (typeof styles.left === 'string') styles.left = parseFloat(styles.left);
            if (typeof styles.height === 'string') styles.height = parseFloat(styles.height);
            if (typeof styles.width === 'string') styles.width = parseFloat(styles.width);
            return styles;
          } catch {
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
              } catch {}
              
              let buttonStyle: any = {};
              if (items.type === 'button' && items.salesHeading) {
                try {
                  buttonStyle = typeof items.salesHeading === 'string' ? JSON.parse(items.salesHeading) : items.salesHeading;
                } catch {}
              }

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
                isVideo: items.isVideo || false,
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
                getAllCMSItemViews: (items.getAllCMSItemViews || []).map((item) => ({
                  id: item.uploadId || item.id,
                  isVideo: item.isVideo,
                  bannerHeading: item.bannerHeading,
                  newHeadings: item.newHeadings || [],
                  uniqueId: item.uniqueId,
                  bannerSubHeading: item.bannerSubHeading,
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
                }))
              };
            })
        };
      }).sort((a, b) => a.position - b.position);
    });
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  ngOnInit() {
    this.isTokenPresent = !!window.sessionStorage.getItem('accessToken');
  }

  getRouteLink() {
    if (this.isTokenPresent) {
      this._router.navigate(['/dashboards']);
    } else {
      this._router.navigate(['/sign-in']);
    }
  }
  get firstItem() {
    return this.sectionsArray?.[0]?.items?.[0] || null;
  }
  
}
