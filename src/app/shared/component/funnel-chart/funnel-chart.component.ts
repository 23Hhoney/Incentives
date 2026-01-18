import { OnInit, ElementRef, ViewChild, Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import * as Highcharts from 'highcharts';

declare var require: any;
let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');
let highcharts3d = require('highcharts/highcharts-3d');
let funnel3d = require('highcharts/modules/funnel3d');
let cylinder = require('highcharts/modules/cylinder');
let exporting = require('highcharts/modules/exporting');

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);
highcharts3d(Highcharts);
funnel3d(Highcharts);
exporting(Highcharts);
cylinder(Highcharts);

@Component({
    selector: 'funnel-chart',
    templateUrl: './funnel-chart.component.html',
    styleUrls: ['./funnel-chart.component.scss'],

})
export class FunnelChartComponent implements OnInit,OnChanges {

    @ViewChild("funnelContainer", { read: ElementRef }) container: ElementRef;
    options: any;
    @Input() chartData: any[];
    @Input() legendName: any;
    chart: Highcharts.Chart;

    @Output() selectFilter = new EventEmitter<{data: any }>();

    constructor() {

    }
    ngOnInit() {
        console.log('In chart');
        this.initFunnel();
    }
    
    ngOnChanges(){
        if(this.chart && this.chart.series.length>0) {
            this.chart.series[0].setData(this.chartData);
        }
    }

    initFunnel() {
        
        this.options = {
            chart: {
                type: 'funnel3d',
                options3d: {
                    enabled: true,
                    alpha: 10,
                    depth: 50,
                    viewDistance: 50
                }
            },
            credits: {
                enabled: false
            },
            exporting: { enabled: false },
            title: {
                text: undefined
            },
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b> ({point.y:,.0f})',
                        allowOverlap: true,
                        y: 10
                    },
                    neckWidth: '25%',
                    neckHeight: '25%',
                    width: '70%',
                    height: '70%'
                }
            },
            series: [{
                name: this.legendName,
                data: this.chartData
            }]
        };
        this.chart = Highcharts.chart(this.container.nativeElement, this.options);
    }
}