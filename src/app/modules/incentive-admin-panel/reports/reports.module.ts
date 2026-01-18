import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReportsComponent } from './reports.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { AppComponent } from 'app/app.component';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';


const routes: Routes = []=[
  {
    path     : '',
   component: ReportsComponent,
  }
];

@NgModule({
  declarations: [ReportsComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatTableModule,
    SharedModule,
    MatButtonModule,
  ],
  bootstrap: [AppComponent],
     providers: [
      DatePipe
   ]
})

export class ReportsModule { }
