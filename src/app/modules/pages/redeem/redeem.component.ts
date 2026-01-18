import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RedeemService } from './redeem.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { Moment } from 'moment';
import moment from 'moment';
import { SharedService } from 'app/shared/shared-service';
import { NotificationService } from 'app/shared/notification/notification';
import { ModernService } from 'app/layout/layouts/horizontal/modern/modern.service';
import { IncentiveAdminPanelService } from 'app/modules/incentive-admin-panel/incentive-admin-panel.service';
import { AuthService } from 'app/core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-redeem',
  templateUrl: './redeem.component.html',
  styleUrls: ['./redeem.component.scss'],
})
export class RedeemComponent implements OnInit {
  manageCardDialog: any;
  isSubmitting = false;
  redeemedBalance = null;
  showCustomAlert = false;
  paymentSuccessfull = false;
  responseData = null;
  cardDetailForm: FormGroup;
  remainingPoints = 0;
  redeemedPoints = new FormControl(null)
  remainingBalance = null;
  isLocked = true;
  userId = null
  loadSettings: boolean;
  constructor(private notification: NotificationService, private matDialog: MatDialog,
     private service: RedeemService, private _modernService: ModernService, 
     private fb: FormBuilder, private _sharedService: SharedService,
     private _incentiveAdminService: IncentiveAdminPanelService,
    private _authService : AuthService, private _router: Router) {
    this.userId = sessionStorage.getItem('userId')

    this.loadSettings = true;
    this._incentiveAdminService.GetProgramConfiguration().subscribe((settings:any) =>{
      if(settings && settings.length >0) {
          let userOnebeAllowed = settings[0].userOnbe;
          if(!userOnebeAllowed){
            this._authService.signOut();
            this._router.navigate(['/sign-out']);
          } else {
            window.sessionStorage.setItem("userOnbe",JSON.stringify(settings[0].userOnbe))
            window.sessionStorage.setItem("userNeoCurrency",JSON.stringify(settings[0].userNeoCurrency))
            
            this.cardDetailForm = this.fb.group({
              "id": null,
              "userId": this.userId,
              "cardNumber": null,
              "expiryDate": moment().format('MM/YYYY')
            })
            this.getCardDetails();
            this.GetPaymentByUser();
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
  formatNumberWithCommas(value: number): string {
    if (value == null) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
  
  openDialog(dialog) {
    window.open('https://prepaiddigitalsolutions.com')
  }

  chosenYearHandler(normalizedYear: Moment) {
    let ctrlValue = moment(this.cardDetailForm.value.expiryDate, 'MM/YYYY');
    ctrlValue = ctrlValue ? moment(ctrlValue) : moment();
    ctrlValue.year(normalizedYear.year());
    const formattedDate = ctrlValue.format('MM/YYYY');
    this.cardDetailForm.controls.expiryDate.setValue(formattedDate);
  }
  
  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    let ctrlValue = moment(this.cardDetailForm.value.expiryDate, 'MM/YYYY');
    ctrlValue = ctrlValue ? moment(ctrlValue) : moment();
    ctrlValue.month(normalizedMonth.month());
    const formattedDate = ctrlValue.format('MM/YYYY');
    this.cardDetailForm.controls.expiryDate.setValue(formattedDate);
    datepicker.close();
  }
  

  getCardDetails() {
    this.service.GetUserCardDetailsByUser({
      "userId": this.userId
    }).subscribe((resp) => {
      this.cardDetailForm = this.fb.group({
        "id": resp[0].id,
        "userId": this.userId,
        "cardNumber": resp[0].cardNumber,
        "expiryDate": resp[0]?.expiryDate ? moment(resp[0].expiryDate).format('MM/YYYY') : moment().format('MM/YYYY')
      })
    })
  }
  GetPaymentByUser() {
    this.service.GetPaymentByUser({
      "userId": this.userId
    }).subscribe((resp) => {
      console.log(resp)
    })
  }

  SaveOrUpdateUserCardDetails() {
    if(!this.cardDetailForm.value.expiryDate) {
      return this.notification.errorTopRight('Expiry Date is mandatory.')
    }
    if(!this.cardDetailForm.value.cardNumber) {
      return this.notification.errorTopRight('Card Number is mandatory.')
    }
    const req = {...this.cardDetailForm.value}
    req.expiryDate = moment(req.expiryDate, 'MM/YYYY')
    req.expiryDate.month(new Date(req.expiryDate).getMonth()+1)
    this.service.SaveOrUpdateUserCardDetails(req).subscribe((resp) => {
      if(resp.isSuccess) {
        this.notification.successTopRight(resp.message)
      } else {
        this.notification.errorTopRight('Something Went Wrong')
      }
      this.manageCardDialog.close()
    })
  }

  openCardVideo() {
    window.open('https://vimeo.com/772062903/65824d8dd9')
  }
  
  redeemPointsBalance() {
    if (this.remainingPoints <= 0) {
      this.notification.errorTopRight("Available points are '0' or negative, you cannot redeem.");
      return;
    }

    this.isSubmitting = true;

    this._incentiveAdminService.GetProgramConfiguration().subscribe((settings: any) => {
      if (settings && settings.length > 0) {
        let userOnebeAllowed = settings[0].userOnbe;
        if (!userOnebeAllowed) {
          this._authService.signOut();
          this._router.navigate(['/sign-out']);
        } else {
          if (this.isLocked) {
            this.showCustomAlert = true;
            this.isSubmitting = false;
            return;
          }
          if (+this.redeemedPoints.value < 131) {
            this.notification.errorTopRight('Minimum 131 points are required to redeem');
            this.isSubmitting = false;
          } else if (+this.redeemedPoints.value > 12827) {
            this.notification.errorTopRight('Maximum 12,827 points can be redeemed');
            this.isSubmitting = false;
          } else if (+this.redeemedPoints.value > this.remainingPoints) {
            this.notification.errorTopRight(`You can only redeem up to ${this.remainingPoints} points.`);
            this.isSubmitting = false;
          } else {
            const startDate = new Date();
            startDate.setUTCHours(0, 0, 0, 0);

            const endDate = new Date();
            endDate.setUTCHours(23, 59, 59, 0);

            const req = {
              "startDate": startDate.toISOString(),
              "endDate": endDate.toISOString(),
              "point": this.redeemedPoints.value.toString(),
              "paymentId": null,
              "amount": {
                "amount": this.redeemedBalance.toString(),
                "currencyCode": "USD"
              },
              "issuanceProductId": null,
              "locationId": null,
              "endClientId": null,
              "recipient": {
                "participantId": null,
                "firstName": null,
                "lastName": null,
                "address1": null,
                "address2": null,
                "city": null,
                "state": null,
                "postalCode": null,
                "countryCode": null,
                "emailAddress": null,
                "language": null,
                "mobilePhone": null
              },
              "clientData": {
                "clientData1": null,
                "clientData2": null,
                "clientData3": null,
                "clientData4": null,
                "clientData5": null,
                "clientData6": null,
                "clientData7": null,
                "clientData8": null,
                "clientData9": null,
                "clientData10": null
              },
              "physicalCardOptions": {
                "carrierMessage2": null,
                "carrierMessage3": null,
                "fourthLineEmboss": null
              },
              "issuanceEmailOptions": {
                "distributionTemplateId": null,
                "emailMessage": null
              },
              "redemptionOptions": {
                "walletUserName": null,
                "redemptionMessage": null
              }
            };

            this.service.PaymentRequestForOnBe({ ...req }).subscribe((resp) => {
              this.isSubmitting = false;
              if (resp.isSuccess) {
                this.notification.successTopRight('Points Redeemed Successfully.');
                this.responseData = resp.data;
                this.paymentSuccessfull = true;
                this.getAvailablePoints();
              } else {
                this.notification.errorTopRight('Something went wrong. Please try again, or contact support at tritonsupport@kohlerpreferredpartners.com.')
              }
            });
          }
        }
      }
    });
  }
  manageCardRedeem() {
    window.open(this.responseData?.paymentInfo?.redemptionLink);
  }
}
