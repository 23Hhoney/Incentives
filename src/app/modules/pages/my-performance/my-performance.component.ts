import { Component, ViewChild } from '@angular/core';
import { ModernService } from 'app/layout/layouts/horizontal/modern/modern.service';
import { ChartData, ChartOptions } from 'chart.js';
import { ChartType } from 'ng-apexcharts';
import { BaseChartDirective } from 'ng2-charts';
import { MyPerformanceService } from './my-performance.service';
import { SharedService } from 'app/shared/shared-service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-my-performance',
  templateUrl: './my-performance.component.html',
  styleUrls: ['./my-performance.component.scss']
})
export class MyPerformanceComponent {

  @ViewChild(BaseChartDirective) baseChart!: BaseChartDirective;

  pieChartOptions: ChartOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          pointStyle: 'circle',
          boxWidth: 10,
          padding: 20,
          font: {
            size: 12,
            lineHeight: 1.5,
          },
        }
      }
    },
    maintainAspectRatio: false, 
  };
  pointsCredited = 0;
  pointsRedeemed = 0;
  remainingPoints = 0;
  userType = 'normaluser';
  totalSales = 0;
  targetValue = '0';
  poinstAndSummaryIsLoading = false;
  lineChartLoading = false;
  pieChartLoading = false;
  isSalesSelected = false;
  pieChartData = [];
  pieChartType: ChartType = 'pie';

  lineChartOptions: ChartOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          pointStyle: 'circle'
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value:number = context.raw as number;
            if (this.isSalesSelected) {
              return `Sales: $${this.formatNumberWithCommas(value.toFixed(2))}`;
            } else if (!this.isSalesSelected) {
              return `Points: ${this.formatNumberWithCommas(value)}`;
            }
            return `${context.dataset.label}: ${value}`;
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false, // Allow the chart's aspect ratio to be adjusted for smaller screens
    };

  monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dev'];
  lineChartDataset = [];
  lineChartData: ChartData<'line', number[], string | string[]> = {
    labels: [],
    datasets: [{
      label: 'Sales: $0',
      data: [],
      borderColor: 'blue',
      fill: false
    },
    {
      label: 'Points: 0',
      data: [],
      borderColor: 'grey',
      fill: false
    }]
  };
  view = [700, 400];
  colorScheme = {
    domain: ["#C94D6D", "#4174C9", "#876B8E", "#8DBCCC", "#8FAAC6", "#8C4D57", "#b89dc7", "#966577", "#95a3de", "#fb9ad4", "#99738a", "#ccbdaf", "#97c4a0", "#c9adc9", "#e3ccba", "#bfe0b8", "#b7d2f7", "#d0c7f2", "#b6f0bf", "#d6bfd6"]
  };
  lineChartType: ChartType = 'line';

  constructor(
    private _modernService: ModernService,
    private service: MyPerformanceService,
    private _sharedService: SharedService,
    private route: ActivatedRoute,
  ) {
    let chartWidth = window.innerWidth > 1100 ? 400 : window.innerWidth <= 1100 && window.innerWidth > 760 ? window.innerWidth - 533 : window.innerWidth <= 760 && window.innerWidth > 700 ? window.innerWidth - 180 : window.innerWidth - 80;
    this.view = [chartWidth, 400];
  }
  onResize(event) {
    let chartWidth = event.target.innerWidth > 1100 ? 400 : event.target.innerWidth <= 1100 && event.target.innerWidth > 760 ? event.target.innerWidth - 533 : event.target.innerWidth <= 760 && event.target.innerWidth > 700 ? event.target.innerWidth - 180 : event.target.innerWidth - 80;
    this.view = [chartWidth, 400];
  }

  ngOnInit() {
    this.userType = sessionStorage.getItem('usertype');
    this.getPointsAndSalesSummaryCalculation();
    this.getChartData();
  }

  getChartData() {
    this.getLineChartData();
    this.getPieChartData();
  }
  formatNumberWithCommas(value): string {
    if (value == null) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  getPieChartData() {
    this.pieChartLoading = true;
    const payload = {
      userId: sessionStorage.getItem('userId')
    };
    this.service.getPieChartData(payload).subscribe(data => {
      this.pieChartLoading = false;
      if (data && Object.keys(data).length) {
        this.pieChartData = [];
        let total = 0;
        for (let key in data) {
          total += Math.abs(data[key]);
        }
        for (let key in data) {
          let valueForShowing=data[key];
          let value = (Math.abs(data[key]) / total) * 100;
          this.pieChartData.push({
            name: `${key} : ${valueForShowing.toFixed(2)}% (${value.toFixed(0)}%)`,
            value: value
          });
        }
      }
    });
  }

  getLineChartData() {
    this.lineChartLoading = true;
    const payload = {
      userId: sessionStorage.getItem('userId')
    }
    this.service.getLineChartData(payload).subscribe(data => {
      this.lineChartLoading = false;
      if (data) {
        if (data.monthlyPointsSummaries.length) {
          // Find the first month with data
          const firstDataIndex = data.monthlyPointsSummaries.findIndex(item => item.totalSales > 0 || item.totalPointsCredited > 0);
          
          if (firstDataIndex !== -1) {
            const filteredMonthlyPointsSummaries = data.monthlyPointsSummaries.slice(firstDataIndex);
            this.lineChartData.labels = this.monthLabels.slice(firstDataIndex, firstDataIndex + filteredMonthlyPointsSummaries.length);
            
            this.lineChartDataset = [
              {
                label: `Sales: ${this.formatToDollar(data.ytdSales)}`,
                data: filteredMonthlyPointsSummaries.map(item => item.totalSales),
                borderColor: 'blue',
                fill: false
              },
              {
                label: `Points: ${this.formatNumberWithCommas(data.ytdPointsEarned)}`,
                data: filteredMonthlyPointsSummaries.map(item => item.totalPointsCredited),
                borderColor: 'pink',
                fill: false
              }
            ];
          } else {
            // If no non-zero data is found, default to full range
            this.lineChartData.labels = this.monthLabels.slice(0, data.monthlyPointsSummaries.length);
            this.lineChartDataset = [
              {
                label: `Sales: ${this.formatToDollar(data.ytdSales)}`,
                data: data.monthlyPointsSummaries.map(item => item.totalSales),
                borderColor: 'blue',
                fill: false
              },
              {
                label: `Points: ${this.formatNumberWithCommas(data.ytdPointsEarned)}`,
                data: data.monthlyPointsSummaries.map(item => item.totalPointsCredited),
                borderColor: 'pink',
                fill: false
              }
            ];
          }
          
          this.lineChartData.datasets = [this.isSalesSelected ? this.lineChartDataset[0] : this.lineChartDataset[1]];
          if (this.baseChart) {
            this.baseChart.update();
          }
        }
      }
    });
}

  
  formatToDollar(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
  }
  
  getPointsAndSalesSummaryCalculation() {
    this.poinstAndSummaryIsLoading = true;
    const payload = {userId: sessionStorage.getItem('userId')}
    this._modernService.getPointsAndSalesSummaryCalculation(payload).subscribe(data=>{
      if (data) {
        if (data?.targetValue) {
          const targetValue = parseFloat(data?.targetValue);          
          this.targetValue = targetValue.toFixed(2)?.toString();
        } 
        this.remainingPoints = data.remaining_Points;
        this.totalSales = data.total_sales?.toFixed(2) ?? this.totalSales.toFixed(2);
        this.pointsRedeemed = data.total_Points_redeemed;
        
        this._sharedService.setTotalPoints(data.remaining_Points);
        this._sharedService.setIsPointLocked(data?.isPointsLocked)
      }
      this.poinstAndSummaryIsLoading = false;
    })
}

toggleSalesGraph(checked) {
  this.isSalesSelected = checked;
  this.lineChartData.datasets = [this.isSalesSelected ? this.lineChartDataset[0] : this.lineChartDataset[1]];
  if (this.baseChart) {
    this.baseChart.update();
  }
}

}
