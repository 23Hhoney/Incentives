import { NgModule } from '@angular/core';
import { FunnelChartComponent } from './funnel-chart.component';
import { BrowserModule } from '@angular/platform-browser';



@NgModule({
    declarations: [FunnelChartComponent],
     imports: [
        //BrowserModule
    ],
    exports: [FunnelChartComponent] ,
    entryComponents: [FunnelChartComponent]
  })
  export class FunnelChartModule { }