import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FuseConfigService } from '@fuse/services/config';
import { IncentiveAdminPanelService } from 'app/modules/incentive-admin-panel/incentive-admin-panel.service';
import { ManageWebsiteService } from 'app/modules/pages/authentication/manage-website/manage-website.service';
import { LoggedInSessionContract, SharedService } from 'app/shared/shared-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent {
  showMenu = false;
  showGroup = false;
  showGroupforadmin = false;
  showGroupforadminsins = false;
  userId: string | null = null;
  isAdminUser: boolean = false;
  homeText = 'Home';
  hideTransactionsAndNotifications = false;
  showAcademy = false;
  userType: string;
  loggedInUserData: LoggedInSessionContract;
  userOnbe: any;
  userNeoCurrency:any;
  navigationArray = [];
  sideNavSubItemArray = [];
 loggedInDetailsSubscription: Subscription;
  constructor(private service: ManageWebsiteService, private router: Router, private _fuseConfigService: FuseConfigService,private _sharedService : SharedService,private _incentiveAdminService :  IncentiveAdminPanelService
  ) {}
  ngOnInit() {
    this.fetchCMSMenu()
    this.userId = sessionStorage.getItem('email');

    this.userType = sessionStorage.getItem("usertype");
    // Set the flags based on the user ID
    this.isAdminUser = this.userType === 'admin';
    
    this._sharedService._loggedInDetails$.subscribe((data:LoggedInSessionContract) =>{
      this.userId = sessionStorage.getItem('email');
      this.userType = sessionStorage.getItem("usertype")
      this.isAdminUser = this.userType === 'admin';
      if(data)
        this.loggedInUserData = data;
    });
    // this._incentiveAdminService.getProgramConfigruationdata().subscribe(data => {
    //   this.userOnbe=data[0]?.userOnbe;
    //   this.userNeoCurrency=data[0]?.userOnbe;
    //   });
    this.userOnbe=window.sessionStorage.getItem('userOnbe');
    this.userNeoCurrency=window.sessionStorage.getItem('userNeoCurrency');
  }
  ngOnDestroy() {
    if (this.loggedInDetailsSubscription) {
      this.loggedInDetailsSubscription.unsubscribe();
    }
  }
  handleMenuClick() {
    this.showMenu = this.showMenu ? false : true;
   
  }
  fetchCMSMenu() {
    this.service.GetAllCMSMenu(false).subscribe((res) => {
      this.navigationArray = res.filter(items => 
        !((items.menuId === '' && items.isPublish) || 
          (items.menuId === 'HM' && items.isPublish) || 
          (items.menuId === 'KRC') || 
          (items.menuId === 'KRGC') || (items.subMenuId))
      );
      this.sideNavSubItemArray = res.filter(item => item.menuId === 'KRC' || item.menuId === 'KRGC' || item.subMenuId);
    })
  }
  routeToDynamicMenu(tab, url) {
    if(tab.menuId === 'KRC' || tab.menuId === 'KRGC') {
      this.showGroup = !this.showGroup;
      this.showMenu = false;
    } else {
      this.showMenu=!this.showMenu
    }
    if(tab.routerLink === '' || !tab.routerLink) {
      this.router.navigate([url]);
    } else {
      let validUrl = this.getValidUrl(tab.routerLink);
      window.open(validUrl, '_blank');
    }
  }
  getValidUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  }
  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.showGroupforadmin = !this.showGroupforadmin;
  }

  navigateTo(route: string) {
    this.showGroupforadmin = false;
    this.showGroupforadminsins=false;
    this.router.navigate([route]);
  }

  handleLMSClick() {
    this.showAcademy = true;
    this.homeText = this.homeText === 'Home' ? 'Incentive Home' : 'Incentive Home';
    this.hideTransactionsAndNotifications = true;
  }
 
  navigateToRedeemPages(page) {
    if(page === 'Concierge Shopping Request') {
      window.open('https://forms.zohopublic.com/egrinternational/form/ConciergeShoppingRequest/formperma/TFTlTISVX4XY_1g8Lf6HdD0RPbtpHZQVvFwtW47xRew')
    } else if(page === 'Travel Concierge Request') {
      window.open('https://forms.zohopublic.com/egrinternational/form/TravelConciergeRequest/formperma/NpNwhNwJmtLxGiG4N8LVSg0oBS5Id4S1BW3XA1D2RrQ')
    } else {
      window.open('https://forms.zohopublic.com/egrinternational/form/TuitionReimbursementRequestPreferredPartner/formperma/FC8xaQURC_VL7CB3eyOTitM5fJkV0sIzQ_sYgU9TjFI')
    }
  }
  handleHomeClick() {
    this.showAcademy = false;
    this.homeText = 'Home';
    this.hideTransactionsAndNotifications = false;
  }

  gotoIncentiveModule()
  {
    this.setLayout('classy');
    this.router.navigateByUrl('/incentive-admin-home');
  }

  setLayout(layout: string): void
  {
      // Clear the 'layout' query param to allow layout changes
      this.router.navigate([], {
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
