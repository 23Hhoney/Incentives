import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { PrivacyPolicyComponent } from './privacy-policy.component';
import { Route, RouterModule } from '@angular/router';


export const routes: Route[] = [
  {
      path     : '',
      component: PrivacyPolicyComponent
  }
];

@NgModule({
  declarations: [
    PrivacyPolicyComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule
  ]
})
export class PrivacyPolicyModule { }
