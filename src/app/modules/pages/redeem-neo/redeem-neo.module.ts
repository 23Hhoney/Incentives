import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RedeemNeoComponent } from './redeem-neo.component';
import { Route, RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { RedeemNeoService } from './redeem-neo.service';


export const routes: Route[] = [
  {
      path     : '',
      component: RedeemNeoComponent
  }
];

@NgModule({
  declarations: [
    RedeemNeoComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule
  ],
  providers: [RedeemNeoService]
})
export class RedeemNeoModule { }
