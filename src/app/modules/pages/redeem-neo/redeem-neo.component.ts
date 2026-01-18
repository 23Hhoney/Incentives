import { Component } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SharedService } from 'app/shared/shared-service';
import { NotificationService } from 'app/shared/notification/notification';
import { RedeemNeoService } from './redeem-neo.service';
import { ModernService } from 'app/layout/layouts/horizontal/modern/modern.service';
import { IncentiveAdminPanelService } from 'app/modules/incentive-admin-panel/incentive-admin-panel.service';
import { AuthService } from 'app/core/auth/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-redeem-neo',
  templateUrl: './redeem-neo.component.html',
  styleUrls: ['./redeem-neo.component.scss']
})
export class RedeemNeoComponent {
  redeemedPoints = new FormControl(null);
  redeemedBalance = null;
  showCustomAlert = false
  paymentSuccessfull = false;
  isSubmitting = false;
  responseData = null;
  isLocked = true;
  userId = null;
  remainingPoints = 0;
  remainingBalance = null;
  loadSettings: boolean;
  constructor(private notification: NotificationService, private matDialog: MatDialog, 
    private fb: FormBuilder, private _sharedService: 
    SharedService, private redeemNeo: RedeemNeoService, private _modernService: ModernService,
    private _incentiveAdminService: IncentiveAdminPanelService,
    private _authService : AuthService, private _router: Router) {
    this.userId = sessionStorage.getItem('userId')
    this.loadSettings = true;
    this._incentiveAdminService.GetProgramConfiguration().subscribe((settings:any) =>{
      if(settings && settings.length >0) {
          let neoClaimAllowed = settings[0].userNeoCurrency;
          if(!neoClaimAllowed){
            this._authService.signOut();
            this._router.navigate(['/sign-out']);
          } else {
            window.sessionStorage.setItem("userOnbe",JSON.stringify(settings[0].userOnbe))
            window.sessionStorage.setItem("userNeoCurrency",JSON.stringify(settings[0].userNeoCurrency))
            this.getAvailablePoints();
            this.loadSettings = false
          }
          
      }
   })
    
  }

  ngOnInit() {
    this.redeemedPoints.valueChanges.subscribe(value => {
      const result = (value - 2) * (1 / 1.2825);
      if(result < 0) {
        this.redeemedBalance = 0
      } else {
        this.redeemedBalance = +(result - 0.5).toFixed(0);
        if(this.redeemedBalance < 0) {
          this.redeemedBalance = 0
        }
        this.redeemedBalance = this.redeemedBalance.toFixed(0)
      }
    });
  }

  generateRandomString(length = 12) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

  PaymentRequestForSandBox() {
    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setUTCHours(23, 59, 59, 0);

    const req = {
      "startDate": startDate.toISOString(),
      "endDate": endDate.toISOString(),
      neocurrencyOrderViewModel: {
        "custom1": this.generateRandomString(),
        "brands": [
          {
            "id": 5716,
            "denomination": this.redeemedBalance.toString(),
            "quantity": this.redeemedPoints.value.toString()
          }
        ]
      }
    };

    this.redeemNeo.CreateOrderForNeoCurrency(req).subscribe(
      (resp) => {
        this.isSubmitting = false;
        if (resp.isSuccess) {
          this.notification.successTopRight('Points Redeemed Successfully.');
          this.responseData = resp.data;
          this.paymentSuccessfull = true;
          this.getAvailablePoints();
        } else {
          this.notification.errorTopRight('Something went wrong. Please try again, or contact support at tritonsupport@kohlerpreferredpartners.com.')
        }
      },
      (error) => {
        this.isSubmitting = false;
        this.notification.errorTopRight('Something went wrong. Please try again, or contact support at tritonsupport@kohlerpreferredpartners.com.')
      }
    );
  }

  getAvailablePoints() {
    const payload = {userId: sessionStorage.getItem('userId')}
    this._modernService.getPointsAndSalesSummaryCalculation(payload).subscribe(data=>{
      if(data?.remaining_Points) {
        this.remainingPoints = data?.remaining_Points.toFixed(0);
        const result = (this.remainingPoints - 2) * (1 / 1.2825);
        this.remainingBalance = +(result - 0.5).toFixed(0);
        // this.isLocked = data?.isPointsLocked ? true : false;
        this._sharedService.setTotalPoints(data.remaining_Points);
        this._sharedService.setIsPointLocked(data?.isPointsLocked);
      } else {
        this.remainingPoints = 0.00;
        this.remainingBalance = 0.00;
        // this.isLocked = true;
      }
      this.isLocked = data?.isPointsLocked ? true : false;
    })
  }
  formatNumberWithCommas(value: number): string {
    if (value == null) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  redeemPointsBalance() {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    this._incentiveAdminService.GetProgramConfiguration().subscribe((settings: any) => {
      if (settings && settings.length > 0) {
        let neoClaimAllowed = settings[0].userNeoCurrency;
        if (!neoClaimAllowed) {
          this._authService.signOut();
          this._router.navigate(['/sign-out']);
        } else {
          if (this.remainingPoints <= 0) {
            this.notification.errorTopRight("Available points are '0' or negative, you cannot redeem.");
            this.isSubmitting = false;
            return;
          }

          if (this.isLocked) {
            this.isSubmitting = false;
            return this.showCustomAlert = true;
          }

          if (+this.redeemedPoints.value < 4) {
            this.notification.errorTopRight('Minimum 4 points are required to redeem.');
            this.isSubmitting = false;
          } else if (+this.redeemedPoints.value > 12827) {
            this.notification.errorTopRight(`Maximum 12,827 points can be redeemed.`);
            this.isSubmitting = false;
          } else if (+this.redeemedPoints.value > this.remainingPoints) {
            this.notification.errorTopRight(`You can only redeem up to ${this.remainingPoints} points.`);
            this.isSubmitting = false;
          } else {
            this.PaymentRequestForSandBox();
          }
        }
      }
    });
  }
    

  manageCardRedeem() {
    window.open('https://redeem.yourdigitalreward.com/reward-choice/'+this.responseData?.codes)
  }
}
