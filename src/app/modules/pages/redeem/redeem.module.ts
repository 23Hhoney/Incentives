import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RedeemComponent } from './redeem.component';
import { Route, RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { RedeemService } from './redeem.service';


export const routes: Route[] = [
  {
      path     : '',
      component: RedeemComponent
  }
];

@NgModule({
  declarations: [
    RedeemComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule
  ],
  providers: [RedeemService]
})
export class RedeemModule { }
