import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { TermsofuseComponent } from './termsofuse.component';



export const routes: Route[] = [
  {
      path     : '',
      component: TermsofuseComponent
  }
];

@NgModule({
  declarations: [
    TermsofuseComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule
  ]
})
export class TermsofuseModule { }
