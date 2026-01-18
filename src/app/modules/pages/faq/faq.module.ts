import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { FaqComponent } from './faq.component';

export const routes: Route[] = [
  {
      path     : '',
      component: FaqComponent
  }
];

@NgModule({
  declarations: [
    FaqComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule
  ]
})
export class FaqModule { }
