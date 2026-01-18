import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Route, RouterModule } from '@angular/router';
import { DataGridModule } from 'app/shared/component/data-grid/data-grid.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { OrderRedemptionComponent } from './order-redemption.component';
import { MatDividerModule } from '@angular/material/divider';
import { DatePickersModule } from 'app/shared/component/date-pickers/date-pickers.module';
import { OrderRedemptionService } from './order-redemption.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';


export const routes: Route[] = [
  {
      path     : '',
      component: OrderRedemptionComponent
  }
];

@NgModule({
  declarations: [
    OrderRedemptionComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatDividerModule,
    DatePickersModule,
    MatPaginatorModule,
    MatTabsModule,
    SharedModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatToolbarModule,
    MatIconModule,
    MatExpansionModule,
    NgApexchartsModule,
    MatMomentDateModule,
    MatProgressSpinnerModule,
    DataGridModule,
    ModalModule.forRoot(),
    ToastrModule.forRoot({preventDuplicates: true,
      timeOut: 3000}),
  ],
  providers: [OrderRedemptionService, DatePipe]
})
export class OrderRedemptionModule { }
