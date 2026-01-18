import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';
import { Subject, takeUntil } from 'rxjs';
import { FuseVerticalNavigationComponent } from '@fuse/components/navigation/vertical/vertical.component';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseNavigationItem } from '@fuse/components/navigation/navigation.types';
import { SharedService } from 'app/shared/shared-service';
import { defaultNavigation } from 'app/mock-api/common/navigation/data';

@Component({
    selector       : 'fuse-vertical-navigation-group-item',
    templateUrl    : './group.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FuseVerticalNavigationGroupItemComponent implements OnInit, OnDestroy
{
    /* eslint-disable @typescript-eslint/naming-convention */
    static ngAcceptInputType_autoCollapse: BooleanInput;
    private readonly _defaultNavigation: FuseNavigationItem[] = defaultNavigation;
    /* eslint-enable @typescript-eslint/naming-convention */

    @Input() autoCollapse: boolean;
    @Input() item: FuseNavigationItem;
    @Input() name: string;

    private _fuseVerticalNavigationComponent: FuseVerticalNavigationComponent;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseNavigationService: FuseNavigationService,
        private _sharedService: SharedService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
       
        // Get the parent navigation component
        this._fuseVerticalNavigationComponent = this._fuseNavigationService.getComponent(this.name);

        // Subscribe to onRefreshed on the navigation component
        this._fuseVerticalNavigationComponent.onRefreshed.pipe(
            takeUntil(this._unsubscribeAll)
        ).subscribe(() => {

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
        this._sharedService._permissionModules$.subscribe(data =>{
            if(data) {
                this.filterSideBarItems(this._defaultNavigation[0].children, data);
            }
        })
        this.filterSideBarItems(this._defaultNavigation[0].children, JSON.parse(sessionStorage.getItem('Modules')));
    }
    filterSideBarItems(items, data) {
        const userName = window.sessionStorage.getItem('name');
        this.filterNavigation(items, data)
        this.item.children.push({
            id   : 'logout',
            title: `Logout, ${userName}`,
            type : 'basic',
            icon : 'Logout-cus',
            link : '/sign-out'
        })
    }
    filterNavigation(children: any[], modules: any) {
        this.item.children = children.filter(item => {
            if (item.type === 'collapsable') {
                item.children = this.filterSubChildren(item.children, modules);
                return item.children.length > 0;
            }
            return modules.includes(item.moduleKey);
        });
        this._changeDetectorRef.markForCheck();
    }
    filterSubChildren(subChildren, modules) {
        const newChild = subChildren.filter(item => {
            return modules.includes(item.moduleKey);
        });
        return newChild;
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }
}
