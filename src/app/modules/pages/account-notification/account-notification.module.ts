import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountNotificationComponent } from './account-notification.component';
import { Route, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslocoModule } from '@ngneat/transloco';
import { SharedModule } from 'app/shared/shared.module';
import { AccountNotificationService } from './account-notification.service';
import { PaginationModule } from 'app/shared/component/pagination/pagination.module';
import { ViewHtmlModule } from 'app/shared/component/view-html/view-html.module';

export const routes: Route[] = [
  {
      path     : '',
      component: AccountNotificationComponent
  }
];

@NgModule({
  declarations: [
    AccountNotificationComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    MatRippleModule,
    ViewHtmlModule,
    MatSidenavModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    TranslocoModule,
    PaginationModule,
    SharedModule
  ],
  providers: [
    AccountNotificationService
  ]
})
export class AccountNotificationModule { }
