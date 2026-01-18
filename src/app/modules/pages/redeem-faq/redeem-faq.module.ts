import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RedeemFAQComponent } from './redeem-faq.component';
import { Route, RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { RedeemNeoService } from '../redeem-neo/redeem-neo.service';


export const routes: Route[] = [
  {
      path     : '',
      component: RedeemFAQComponent
  }
];

@NgModule({
  declarations: [
    RedeemFAQComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule
  ],
  providers: [RedeemNeoService]
})
export class RedeemNeoModule { }
