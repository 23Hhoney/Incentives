import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ManageWebsiteService } from '../authentication/manage-website/manage-website.service';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit {
  showPublishedPage = false;
  publishedPage = null;
  sectionsArray: any[] = [];
  loader = true;
  isTokenPresent = false;
  isPreview = false;

  iframeItems: {
    heading: string;
    url: SafeResourceUrl;
    height: number;
  }[] = [];

  constructor(
    private _router: Router,
    private route: ActivatedRoute,
    private manageWebsiteContent: ManageWebsiteService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.isTokenPresent = !!window.sessionStorage.getItem('accessToken');

    const draftId = this.route.snapshot.queryParamMap.get('draftId');

    if (draftId) {
      this.isPreview = true;
      this.loadDraftPrivacyPolicy(draftId);
    } else {
      this.loadPublishedPrivacyPolicy();
    }
  }

  private loadPublishedPrivacyPolicy(): void {
    this.manageWebsiteContent.GetAllCMSMenu(false).subscribe((res: any[]) => {
      const filteredRes = res.filter(
        item => !item.menuId.startsWith('DRFT_') && item.menuId !== 'DRFT_RESTORED'
      );

      filteredRes.forEach(items => {
        if (items.menuId === 'PP') {
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

  private loadDraftPrivacyPolicy(draftId: string): void {
    this.manageWebsiteContent.GetAllCMSMenu(true).subscribe((menus: any[]) => {
      const draftMenu = menus.find(item => item.id === draftId);

      if (draftMenu) {
        this.publishedPage = draftMenu;
        this.showPublishedPage = true;
        this.fetchAndBuildSections(draftMenu.id, false);
      } else {
        console.warn('Draft menu not found for ID:', draftId);
        this.loader = false;
      }
    });
  }

  private fetchAndBuildSections(pageId: string, flag: boolean): void {
    this.manageWebsiteContent
      .GetAllCMSContainer(pageId, flag)
      .subscribe((resp: any[]) => {

        this.sectionsArray = resp;
        this.iframeItems = [];

        if (this.sectionsArray?.[0]?.getAllCMSContainerViews?.length) {
          this.sectionsArray[0].getAllCMSContainerViews.forEach(item => {
            const value = item.text?.trim();

            if (this.isValidUrl(value)) {
              this.iframeItems.push({
                heading: item.chartHeading || '',
                url: this.getSafeURl(value),
                height: value.toLowerCase().includes('cookie')
                  ? 2600
                  : 5000
              });
            }
          });
        }

        this.loader = false;
      });
  }


  isValidUrl(value: string): boolean {
    if (!value) return false;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  getSafeURl(text: string): SafeResourceUrl {
    if (!text) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(text);
  }

  getRouteLink() {
    if (this.isTokenPresent) {
      this._router.navigate(['/dashboards']);
    } else {
      this._router.navigate(['/sign-in']);
    }
  }
}

