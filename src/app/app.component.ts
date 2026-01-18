import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FuseTranslationLoaderService } from './core/services/translation-loader.service';
import { AuthService } from './core/auth/auth.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import moment from 'moment';
import { NotificationsService } from './layout/common/notifications/notifications.service';
import { GoogleAnalyticsService } from './shared/google-analytics.service';
import { IncentiveAdminPanelService } from './modules/incentive-admin-panel/incentive-admin-panel.service';
declare var gtag: Function;
@Component({
    selector   : 'app-root',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  notifications: any[] = [];
  apiRequest = {
    pageIndex: 1,
    itemCount: 10 // adjust itemCount if needed
  };
  totalRecords: number = 0;
  totalUnreadCount: number = 0;
  totalPages: number = 0;
  userId: any;
  intervalId: any;
  public _localLang;
  private path: string = "/assets/images";
  role: any;

  constructor(
    private translateService: TranslateService,
    private notificationsService: NotificationsService,
    private authService: AuthService,
    private router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _fuseTranslationLoaderService: FuseTranslationLoaderService,
    private domSanitizer: DomSanitizer,
    public matIconRegistry: MatIconRegistry,
    private gaService: GoogleAnalyticsService,
    private _incentiveAdminService :  IncentiveAdminPanelService,
    @Inject(DOCUMENT) private document: Document
  ) {
    if (sessionStorage.getItem('accessToken')) {
      this.authService.setAuthenticated(true);
    } else {
      this.authService.setAuthenticated(false);
    }
    let baseHref = this.document.getElementsByTagName('base')[0].getAttribute('href') || '';
    if (baseHref !== '/') {
      this.path = baseHref + 'assets/images';
    }
    this.matIconRegistry
      .addSvgIcon("cart-cus", this.setPath(`${this.path}/cart.svg`))
      .addSvgIcon("filter-cus", this.setPath(`${this.path}/filter.svg`))
      .addSvgIcon("export-queue-cus", this.setPath(`${this.path}/export-queue.svg`))
      .addSvgIcon("Image-cus", this.setPath(`${this.path}/Image.svg`))
      .addSvgIcon("key-cus", this.setPath(`${this.path}/key.svg`))
      .addSvgIcon("list-cus", this.setPath(`${this.path}/list.svg`))
      .addSvgIcon("Moveup2-cus", this.setPath(`${this.path}/Moveup2.svg`))
      .addSvgIcon("Moveup-cus", this.setPath(`${this.path}/Moveup.svg`))
      .addSvgIcon("Search-cus", this.setPath(`${this.path}/Search.svg`))
      .addSvgIcon("Star-cus", this.setPath(`${this.path}/Star.svg`))
      .addSvgIcon("User-cus", this.setPath(`${this.path}/User.svg`))
      .addSvgIcon("sms-cus", this.setPath(`${this.path}/sms.svg`))
      .addSvgIcon("Settings-cus", this.setPath(`${this.path}/Settings.svg`))
      .addSvgIcon("Logout-cus", this.setPath(`${this.path}/Logout.svg`))
      .addSvgIcon("Settings-btn-cus", this.setPath(`${this.path}/Settingsbtn.svg`))
      .addSvgIcon("download-btn-cus", this.setPath(`${this.path}/downloadbtn.svg`))
      .addSvgIcon("user-sync", this.setPath(`${this.path}/userSync.svg`))
      .addSvgIcon("e-remove", this.setPath(`${this.path}/ERemove.svg`))
      .addSvgIcon("e-remove-white", this.setPath(`${this.path}/ERemoveWhite.svg`))
      .addSvgIcon("pen", this.setPath(`${this.path}/pen.svg`))
      .addSvgIcon("delete", this.setPath(`${this.path}/delete.svg`))
      .addSvgIcon("simple-cart-cus", this.setPath(`${this.path}/cartSimple.svg`))
      .addSvgIcon("users-three", this.setPath(`${this.path}/usersThree.svg`))
      .addSvgIcon("star-cus-report-queue", this.setPath(`${this.path}/starCusReportQueue.svg`))
      .addSvgIcon("users-three-sidebar", this.setPath(`${this.path}/usersThreeSidebar.svg`))
      .addSvgIcon("chart-line-up", this.setPath(`${this.path}/chartLineUp.svg`))
      .addSvgIcon("user-switch", this.setPath(`${this.path}/userSwitch.svg`))
      .addSvgIcon("chart-line-up-sidebar", this.setPath(`${this.path}/chartLineUpSidebar.svg`))
      .addSvgIcon("user-switch-sidebar", this.setPath(`${this.path}/userSwitchSidebar.svg`))
      .addSvgIcon("plus-circle-dark", this.setPath(`${this.path}/plusCircleDark.svg`))
      .addSvgIcon("trash3-fill", this.setPath(`${this.path}/trash3-fill.svg`))
      .addSvgIcon("duplicate", this.setPath(`${this.path}/duplicate.svg`));
  }

  isValidMeasurementId(measurementId: string): boolean {
    const regex = /^G-[A-Z0-9]{10}$/;
    return regex.test(measurementId);
  }

  ngOnInit(): void {
    this.userId = window.sessionStorage.getItem('userId');
    this.role = window.sessionStorage.getItem('usertype');

    this._incentiveAdminService.getProgramConfigruationdata().subscribe(data => {
      if (data && data.length>0) {
        let measureMentId = data[0].googleAnalytics	
        if(this.isValidMeasurementId(measureMentId))
        {
          // this.gaService.loadGoogleAnalytics(measureMentId);
          GoogleAnalyticsService.loadGoogleAnalytics(measureMentId)
        }
        else {
          console.log('skipping google analytics configurations');
        }
      }
  });
    

    if (this.role === 'normaluser') {
      if (!this.userId) {
        this.retryFetchUserIdAndCallApi();
      } else {
        this.getNotificationList();
      }
      this.intervalId = setInterval(() => {
        if (this.userId) {
          this.getNotificationList();
        }
      }, 30000);
    }

    // Retrieve the totalUnreadCount from session storage
    const storedCount = sessionStorage.getItem('totalUnreadCount');
    if (storedCount) {
      this.totalUnreadCount = +storedCount;
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  retryFetchUserIdAndCallApi(): void {
    let attempts = 0;
    const maxAttempts = 10;

    const checkUserIdInterval = setInterval(() => {
      this.userId = window.sessionStorage.getItem('userId');

      if (this.userId) {
        // UserId found, stop retrying and call API
        clearInterval(checkUserIdInterval);
        this.getNotificationList();
      } else if (attempts >= maxAttempts) {
        // Maximum attempts reached, stop retrying
        clearInterval(checkUserIdInterval);
        console.error('Failed to retrieve userId from sessionStorage.');
      }

      attempts++;
    }, 500); // Retry every 500 milliseconds
  }

  getNotificationList(): void {
    this.notifications = [];
    this.apiRequest.pageIndex = 1;

    this.notificationsService.getNotificationList(this.userId, this.apiRequest).subscribe(data => {
      this.notifications = data.results.map((notification: any) => {
        if (notification?.createdDateTime) {
          notification.createdDateTime = moment.utc(notification.createdDateTime)
            .utcOffset('-04:00') // Set the desired timezone offset
            .format('MM/DD/YYYY h:mm A');
        }
        if (notification?.scheduledDateTime) {
          notification.scheduledDateTime = moment.utc(notification.scheduledDateTime)
            .utcOffset('-04:00') // Set the desired timezone offset
            .format('MM/DD/YYYY h:mm A');
        }
        return notification;
      });

      this.totalRecords = data.totalRecords;
      this.totalPages = Math.ceil(this.totalRecords / this.apiRequest.itemCount);
      this._changeDetectorRef.markForCheck();

      // Update the unread count using customRecordCount and store it in session storage
      this.totalUnreadCount = data.customRecordCount;
      sessionStorage.setItem('totalUnreadCount', this.totalUnreadCount.toString());
    });
  }

  private setPath(url: string): SafeResourceUrl {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
