import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RedeemDirectGiftCardLearnMoreComponent } from './redeem-direct-gift-card-learn-more.component';
import { Route, RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { RedeemNeoService } from '../redeem-neo/redeem-neo.service';


export const routes: Route[] = [
  {
      path     : '',
      component: RedeemDirectGiftCardLearnMoreComponent
  }
];

@NgModule({
  declarations: [
    RedeemDirectGiftCardLearnMoreComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule
  ],
  providers: [RedeemNeoService]
})
export class RedeemDirectGiftCardLearnMoreModule { }
