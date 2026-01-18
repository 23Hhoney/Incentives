import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { IncentiveAdminHomeComponent } from './incentive-admin-home.component';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { SharedModule } from 'app/shared/shared.module';
import { HomeService } from 'app/modules/pages/home/home.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatRippleModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DataGridModule } from 'app/shared/component/data-grid/data-grid.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { AppComponent } from 'app/app.component';
import { ModernService } from 'app/layout/layouts/horizontal/modern/modern.service';
import { NgChartsModule } from 'ng2-charts';
import { ViewHtmlModule } from 'app/shared/component/view-html/view-html.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SafeEmbedUrlPipes } from 'app/modules/pages/authentication/safe-emebe-urls.pipe';


export const routes: Route[] = [
  {
      path     : '',
      component: IncentiveAdminHomeComponent
  }
];

@NgModule({
  declarations: [
    IncentiveAdminHomeComponent    
  ],
    imports: [
      RouterModule.forChild(routes),
      CommonModule,
      MatButtonModule,
      MatButtonToggleModule,
      MatDividerModule,
      MatIconModule,
      ViewHtmlModule,
      MatMenuModule,
      MatProgressSpinnerModule,
      MatProgressBarModule,
      MatRippleModule,
      MatSidenavModule,
      MatSortModule,
      MatTableModule,
      NgxChartsModule,
      MatTabsModule,
      NgApexchartsModule,
      SharedModule,
      NgChartsModule,
    ],
  providers: [
    HomeService,
    ModernService
  ]
})
export class IncentiveAdminHomeModule { }
