import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ManageWebsiteService } from '../authentication/manage-website/manage-website.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {
  faqs: any[] = [];
  copiedFaq: any[] = [];
  showPublishedPage = false;
  publishedPage: any = null;
  sectionsArray: any[] = [];
  loader = true;

  constructor(
    private route: ActivatedRoute,
    private manageWebsiteContent: ManageWebsiteService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    const isPreview = this.route.snapshot.queryParamMap.get('isPreview') === 'true';
    const draftId = this.route.snapshot.queryParamMap.get('draftId');

    if (draftId) {
      this.loadDraftFaq(draftId);
    } else {
      this.loadPublishedFaq();
    }
  }

  private loadPublishedFaq(): void {
    this.copiedFaq = [...this.faqs];
    this.loader = true;

    this.manageWebsiteContent.GetAllCMSMenu(false).subscribe((res: any[]) => {
      const filteredRes = res.filter(item => !item.menuId.startsWith('DRFT_') && item.menuId !== 'DRFT_RESTORED');

      filteredRes.forEach((items) => {
        if (items.menuId === 'FAQ') {
          this.publishedPage = items;
        }
      });

      if (this.publishedPage) {
        this.showPublishedPage = true;
        this.fetchAndBuildSections(this.publishedPage.id, true);
      } else {
        this.showPublishedPage = false;
        this.loader = false;
      }
    });
  }

  private loadDraftFaq(draftId: string): void {
    this.copiedFaq = [...this.faqs];
    this.loader = true;

    this.manageWebsiteContent.GetAllCMSMenu(true).subscribe((menus: any[]) => {
      const draftMenu = menus.find(item => item.id === draftId);

      if (draftMenu) {
        this.publishedPage = draftMenu;
        this.showPublishedPage = true;
        // For preview, API flag should be false to get the draft content
        this.fetchAndBuildSections(draftMenu.id, false);
      } else {
        console.warn('Draft menu not found for ID:', draftId);
        this.loader = false;
      }
    });
  }

  private fetchAndBuildSections(pageId: string, flag: boolean): void {
    this.manageWebsiteContent.GetAllCMSContainer(pageId, flag).subscribe((resp: any[]) => {
      this.sectionsArray = resp.map((section, sectionIndex) => {
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

              // Load FAQs from chartHeading if exists
              this.faqs = items.chartHeading ? JSON.parse(items.chartHeading) : [];
              this.copiedFaq = [...this.faqs];

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
                text: items.text || '',
                content: items.text || '',
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
                  bannerSubHeading: item.bannerSubHeading,
                  url: item.url,
                  content: item.content,
                  type: item.type,
                  panelType: item.panelType || 'image',
                  autoPlay: item.autoPlay || false
                }))
              };
            })
        };
      }).sort((a, b) => {
        if (a.position === b.position) {
          return a.id.localeCompare(b.id);
        }
        return a.position - b.position;
      });

      this.sectionsArray.forEach((section, index) => {
        if (index > 0 && section.position === this.sectionsArray[index - 1].position) {
          section.position = this.sectionsArray[index - 1].position + 1;
        }
      });
console.log(this.sectionsArray);
      this.loader = false;
    });
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  removeUnwantedChars(str: string): string {
    return str;
  }

  searchFAQ(value: string): void {
    this.faqs = [];
    if (!value?.trim()) {
      this.faqs = [...this.copiedFaq];
      return;
    }

    const searchValue = value.replace(/[ ,?`']/g, '').toLowerCase();
    this.copiedFaq.forEach(items => {
      const question = items.question.replace(/[ ,?`']/g, '').toLowerCase();
      if (question.includes(searchValue)) {
        this.faqs.push(items);
      }
    });
  }
}
