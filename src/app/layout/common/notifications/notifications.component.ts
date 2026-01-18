import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatButton } from '@angular/material/button';
import { Subject, takeUntil } from 'rxjs';
import { Notification } from 'app/layout/common/notifications/notifications.types';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import { Router } from '@angular/router';
import moment from 'moment';

@Component({
    selector: 'notifications',
    templateUrl: './notifications.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'notifications'
})

export class NotificationsComponent implements OnInit, OnDestroy {
    @ViewChild('notificationsOrigin') private _notificationsOrigin: MatButton;
    @ViewChild('notificationsPanel') private _notificationsPanel: TemplateRef<any>;

    @Input() totalUnreadCount: number;
    @Input() editMode = false;

    notifications: Notification[];
    private _overlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    pageLimit = 10;
    sortBy = '';
    userId = '';
    sortDirection = '';
    totalRecords = 0;
    totalPages = 0;
    currentPage = 1;
    apiRequest = {
        pageIndex: 1,
        sortBy: '',
        itemCount: 7,
        sortDirection: '',
        search: '',
        filter: []
    };

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _notificationsService: NotificationsService,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
        private _router: Router
    ) { }

    ngOnInit(): void {
        if (sessionStorage.getItem('userId')) {
            this.userId = sessionStorage.getItem('userId');
        }
        this.getNotificationList();

        // Retrieve the totalUnreadCount from session storage
        const storedCount = sessionStorage.getItem('totalUnreadCount');
        if (storedCount) {
            this.totalUnreadCount = +storedCount;
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.complete();

        if (this._overlayRef) {
            this._overlayRef.dispose();
        }
    }

    openPanel(): void {
        if (!this._notificationsPanel || !this._notificationsOrigin) {
            return;
        }

        if (!this._overlayRef) {
            this._createOverlay();
        }
        this._overlayRef.attach(new TemplatePortal(this._notificationsPanel, this._viewContainerRef));
    }

    closePanel(): void {
        this._overlayRef.detach();
    }

    getNotificationList(): void {
        this.notifications = [];
        this.apiRequest.pageIndex = 1;

        this._notificationsService.getNotificationList(this.userId, this.apiRequest).subscribe(data => {
            this.notifications = data.results.map((notification: any) => {
                if (notification?.createdDateTime) {
                    notification.createdDateTime = moment.utc(notification.createdDateTime)
                        .utcOffset('-04:00')
                        .format('MM/DD/YYYY h:mm A');
                }
                if (notification?.scheduledDateTime) {
                    notification.scheduledDateTime = moment.utc(notification.scheduledDateTime)
                        .utcOffset('-04:00')
                        .format('MM/DD/YYYY h:mm A');
                }

                return notification;
            });

            this.totalRecords = data.totalRecords;
            this.totalPages = Math.ceil(this.totalRecords / this.apiRequest.itemCount);
            this._changeDetectorRef.markForCheck();

            // Update the unread count using customRecordCount and store it in session storage
            this.updateUnreadCount(data.customRecordCount);
        });
    }

    markAllAsRead(): void {
        this._notificationsService.markAllAsRead().subscribe();
    }

    toggleRead(notification: Notification): void {
        notification.read = !notification.read;
        this._notificationsService.update(notification.id, notification).subscribe();
    }

    delete(notification: Notification): void {
        this._notificationsService.delete(notification.id).subscribe();
    }

    private _createOverlay(): void {
        this._overlayRef = this._overlay.create({
            hasBackdrop: true,
            backdropClass: 'fuse-backdrop-on-mobile',
            scrollStrategy: this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position()
                .flexibleConnectedTo(this._notificationsOrigin._elementRef.nativeElement)
                .withLockedPosition(true)
                .withPush(true)
                .withPositions([
                    {
                        originX: 'end',
                        originY: 'bottom',
                        overlayX: 'end',
                        overlayY: 'top'
                    },
                    {
                        originX: 'end',
                        originY: 'top',
                        overlayX: 'end',
                        overlayY: 'bottom'
                    },
                    {
                        originX: 'end',
                        originY: 'bottom',
                        overlayX: 'end',
                        overlayY: 'top'
                    },
                    {
                        originX: 'end',
                        originY: 'top',
                        overlayX: 'end',
                        overlayY: 'bottom'
                    }
                ])
        });

        this._overlayRef.backdropClick().subscribe(() => {
            this._overlayRef.detach();
        });
    }

    handleNotification(): void {
        this.closePanel();
        this._router.navigate(['notifications']);
    }

    // Method to update the totalUnreadCount
    updateUnreadCount(count: number): void {
        this.totalUnreadCount = count;
        // Store the updated count in session storage
        sessionStorage.setItem('totalUnreadCount', count.toString());
    }
}