import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { ReedemNeocurrencyLearnMoreComponent } from './reedem-neocurrency-learn-more.component';
import { SharedModule } from 'app/shared/shared.module';
import { RedeemService } from '../redeem/redeem.service';



export const routes: Route[] = [
  {
      path     : '',
      component: ReedemNeocurrencyLearnMoreComponent
  }
];

@NgModule({
  declarations: [
    ReedemNeocurrencyLearnMoreComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule
  ],
  providers: [RedeemService]
})
export class ReedemNeocurrencyLearnMoreModule { }
