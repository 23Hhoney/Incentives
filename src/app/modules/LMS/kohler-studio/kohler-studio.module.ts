import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { KohlerStudioComponent } from './kohler-studio.component';
import { SharedModule } from 'app/shared/shared.module';
import { MatDividerModule } from '@angular/material/divider';
import { ViewHtmlModule } from 'app/shared/component/view-html/view-html.module';


export const routes: Route[] = [
  {
      path     : '',
      component: KohlerStudioComponent
  }
];

@NgModule({
  declarations: [
    KohlerStudioComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    MatDividerModule,
    ViewHtmlModule
  ]
})
export class KohlerStudioModule { }
