import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RedeemDirectGiftCardFAQComponent } from './redeem-direct-gift-card-faq.component';
import { Route, RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { RedeemNeoService } from '../redeem-neo/redeem-neo.service';


export const routes: Route[] = [
  {
      path     : '',
      component: RedeemDirectGiftCardFAQComponent
  }
];

@NgModule({
  declarations: [
    RedeemDirectGiftCardFAQComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule
  ],
  providers: [RedeemNeoService]
})
export class RedeemDirectGiftCardFAQModule { }
