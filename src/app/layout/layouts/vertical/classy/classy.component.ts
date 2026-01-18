import { Component, HostListener, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { User } from 'app/core/user/user.types';
import { UserService } from 'app/core/user/user.service';
import { BooleanInput } from '@angular/cdk/coercion';
import { FuseConfigService } from '@fuse/services/config';
import { LoggedInSessionContract, SharedService } from 'app/shared/shared-service';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector     : 'classy-layout',
    templateUrl  : './classy.component.html',
    styleUrls: ['classy.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ClassyLayoutComponent implements OnInit, OnDestroy
{
    static ngAcceptInputType_showAvatar: BooleanInput;
    /* eslint-enable @typescript-eslint/naming-convention */

    @Input() showAvatar: boolean = true;
    isMenuOpen: boolean = false;  // Set initial state to true to show left arrow with logo

    isScreenSmall: boolean;
    navigation: Navigation;
    user: User;
    showMenuIcon = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    pageTitle = '';
    gotoRoute = '';
    fullWidth = true;
    isMenuClosed = false;
    gotoRouteLabel = '';
    showGoToBtn = false;
    userRole = '';
    loggedInUserData: LoggedInSessionContract;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _navigationService: NavigationService,
        private _userService: UserService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseConfigService: FuseConfigService,
        private _sharedService: SharedService,
        private _authService: AuthService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number
    {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.userRole = window.sessionStorage.getItem("usertype");
        this.fullWidth = window.innerWidth < 1319;
        // this.showMenuIcon = sessionStorage.getItem('usertype') === 'incentiveadmin';
        // Subscribe to navigation data
        this._router.events.subscribe(event => {
            if(event instanceof NavigationEnd) {
                this.pageTitle = '';
                this._activatedRoute.children[0].data.subscribe(data => {
                    // console.log('==================heeeeyyy',data);
                    if (data) {
                        this.pageTitle = data.title;
                        this.gotoRoute = data.gotoRoute;
                        this.gotoRouteLabel = data.gotoRouteLabel;
                        this.showGoToBtn = data.showGoToBtn;
                    }
                })
            }
          });
          this.pageTitle = '';
          this._activatedRoute.children[0].data.subscribe(data => {
            // console.log('==================heeeeyyy',data);
            if (data) {
                this.pageTitle = data.title;
                this.gotoRoute = data.gotoRoute;
                this.gotoRouteLabel = data.gotoRouteLabel;
                this.showGoToBtn = data.showGoToBtn;
            }
          })
       
        /* this._activatedRoute.snapshot.data.subscribe(rdata => {
            console.log(rdata);

        }) */
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) => {
                this.navigation = navigation;
            });

        // Subscribe to the user service
        this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: User) => {
                this.user = user;
            });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {
                const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>('mainNavigation');
                if ( navigation ) {
                    this.isMenuClosed = navigation.opened
                }
                this.isScreenSmall = !matchingAliases.includes('md');
            });
            
        this._sharedService._loggedInDetails$.subscribe((data:LoggedInSessionContract) =>{
            if(data)
                this.loggedInUserData = data;
    
            });
            let payload ={
                userId:  window.sessionStorage.getItem('userId')
            }
            this._authService.getPermissionsByUserId(payload).subscribe(data=>{
            })
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
    @HostListener('window:resize', ['$event'])
    onWindowResize() {
        this.fullWidth = window.innerWidth<1319;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void {
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);
    
        if (navigation) {
            navigation.toggle();
            this.isMenuOpen = !this.isMenuOpen;
        }
    }
    signOut(): void
    {
        this._router.navigate(['/sign-out']);
    }
    RoutetoProfile()
    {
        this._router.navigate(['/pages/settings'])
    }

    handleRouteHome() {

        var userType = window.sessionStorage.getItem("usertype");
        // incentiveadmin lemsadmin
        
        if(userType == 'incentiveadmin')
            this._router.navigate(['incentive-admin-home']);
        else 
            this._router.navigate(['dashboards']);
        
    }

    getIcon(title) {
        if(title){
            if(title == 'Points Credit File Upload') return 'assets/images/Moveup2.svg';
            else if(title == "SKU List Manager") return 'assets/images/hamburger.svg';
            else if(title=="Login Report") return 'assets/images/userSwitchSidebar.svg';
            else if(title=="Push Report") return 'assets/images/chartLineUpSidebar.svg';
            else if(title=="User Export Report") return 'assets/images/usersThreeSidebar.svg'; 
            else if(title=="Order Redemption Report") return 'assets/images/cart.svg'; 
            else if(title=="Points Credit Report (Sales)") return 'assets/images/Star.svg'; 
            else if(title=="Admin User Manager") return 'assets/images/key-img_1.svg';
            else if(title=="Points Credit Manager") return 'assets/images/Star.svg'; 
            else if(title=="Order Redemption Manager") return 'assets/images/cart.svg'; 
            else if(title=="Send Messages") return 'assets/images/sms.svg'; 
            else if(title=="Program Configuration") return 'assets/images/Settings.svg';
            else if(title=="Report Queue")return 'assets/images/export-queue.svg';
            else if(title=="Home") return 'assets/images/Image.svg';
        }

        return 'assets/images/Account.png';
    }


goToLEMSAdmin()
  {
    this.setLayout('modern');
    this._router.navigateByUrl('/dashboards');
  }

  setLayout(layout: string): void
  {
      // Clear the 'layout' query param to allow layout changes
      this._router.navigate([], {
          queryParams        : {
              layout: null
          },
          queryParamsHandling: 'merge'
      }).then(() => {

          // Set the config
          this._fuseConfigService.config = {layout};
      });
  }
}
