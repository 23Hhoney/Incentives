import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ModernService } from 'app/layout/layouts/horizontal/modern/modern.service';
import { TrainingCourseManagerService } from 'app/modules/admin-panel/training-course-manager/training-course-manager.service';
import { KohlerStudioService } from 'app/modules/LMS/kohler-studio/kohler-studio.service';
import { ManageWebsiteService } from 'app/modules/pages/authentication/manage-website/manage-website.service';
import { HomeService } from 'app/modules/pages/home/home.service';
import { NotificationService } from 'app/shared/notification/notification';
import { SharedService } from 'app/shared/shared-service';
import { ChartData, ChartOptions } from 'chart.js';
import moment from 'moment';
import { ApexOptions, ChartType } from 'ng-apexcharts';
import { BaseChartDirective } from 'ng2-charts';
import { firstValueFrom, interval, Subject, Subscription, takeUntil } from 'rxjs';
type PeriodKey = 'currentMonth' | 'currentYear' | 'previousYear' | 'lifetime' | 'yearVsYear';
type MetricKey = 'sales' | 'quantity' | 'points';
// Define a flexible type for barChartData
type SinglePeriodData = {
  totalSales: number;
  targetValue: number;
  data?: any;
};

type YearVsYearData = {
  currentYear: { totalSales: number; targetValue: number };
  previousYear: { totalSales: number; targetValue: number };
  totalSales: number;
  targetValue: number;
  data?: any;
};

type BarChartData = SinglePeriodData | YearVsYearData;

@Component({
  selector: 'app-incentive-admin-home',
  templateUrl: './incentive-admin-home.component.html',
  styleUrls: ['./incentive-admin-home.component.scss'],
})

export class IncentiveAdminHomeComponent {
  charts = [
    { name: 'Pie Chart' },
    { name: 'Line Chart' },
    { name: 'Bar Chart' }
  ];
  isDoughnut = true;
  totalSales = 0;
  targetValue = null;
  @ViewChild(BaseChartDirective) baseChart!: BaseChartDirective;
  seeMore: boolean[] = [];
  sectionsArray = [];
  selectedContainerType: any;
  totalPoints: number = 0;
  currentCarousel = 0;
  notifications: any = { results: [], customRecordCount: 0 };
  pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: ['N/A'],
    datasets: [{
      data: [100],
      backgroundColor: ['rgba(0, 115, 255, 100)']
    }],
  };
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
            const value: number = context.raw as number;
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
    maintainAspectRatio: false
  };
  barChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      y: { beginAtZero: true },
      x: { display: true }
    },
    plugins: {
      legend: { display: true, position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value: number = context.raw as number;
            if (this.isSalesSelected) {
              return `Sales: $${this.formatNumberWithCommas(value.toFixed(2))}`;
            } else if (!this.isSalesSelected) {
              return `Points: ${this.formatNumberWithCommas(value)}`;
            }
            return `Quantity: ${value} units`;
          }
        }
      }
    }
  };
  monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  lineChartData: ChartData<'line', number[], string | string[]> = {
    labels: [],
    datasets: [{
      label: 'Sales: $0',
      data: [],
      borderColor: 'blue',
      fill: false
    }, {
      label: 'Points: 0',
      data: [],
      borderColor: 'grey',
      fill: false
    }]
  };
  lineChartType: ChartType = 'line';
  apiRequest = {
    itemCount: 4,
    pageIndex: 1,
    pageLimit: 4,
    sortBy: "name",
    search: "",
    sortDirection: "desc",
    filter: []
  };
  notiApiRequest = {
    itemCount: 3,
    pageIndex: 1,
    pageLimit: 3,
    sortBy: "",
    search: "",
    sortDirection: "",
    filter: []
  };
  lineChartLoading = false;
  pieChartLoading = false;
  isCurriculumLoading = false;
  isTransactionLoading = false;
  isNotificationLoading = false;
  curriculumData = [];
  isSalesSelected = false;
  transactionData = [];
  data: any;
  lineChartDataset = [];
  userName = sessionStorage.getItem('name');
  userType: string;
  pieChartDataSets = {
    currentMonth: {
      quantity: [
        { name: 'Category A: 400 units', value: 40 },
        { name: 'Category B: 300 units', value: 30 },
        { name: 'Category C: 200 units', value: 20 },
        { name: 'Category D: 100 units', value: 10 },
        { name: 'Category E: 50 units', value: 5 }
      ],
      sales: [
        { name: 'Category A: $4000', value: 40 },
        { name: 'Category B: $3000', value: 30 },
        { name: 'Category C: $2000', value: 20 },
        { name: 'Category D: $1000', value: 10 },
        { name: 'Category E: $500', value: 5 }
      ],
      points: [
        { name: 'Category A: 4000 pts', value: 40 },
        { name: 'Category B: 3000 pts', value: 30 },
        { name: 'Category C: 2000 pts', value: 20 },
        { name: 'Category D: 1000 pts', value: 10 },
        { name: 'Category E: 500 pts', value: 5 }
      ]
    },
    currentYear: {
      quantity: [
        { name: 'Category A: 3500 units', value: 35 },
        { name: 'Category B: 2500 units', value: 25 },
        { name: 'Category C: 2500 units', value: 25 },
        { name: 'Category D: 1500 units', value: 15 },
        { name: 'Category E: 500 units', value: 5 }
      ],
      sales: [
        { name: 'Category A: $35000', value: 35 },
        { name: 'Category B: $25000', value: 25 },
        { name: 'Category C: $25000', value: 25 },
        { name: 'Category D: $15000', value: 15 },
        { name: 'Category E: $5000', value: 5 }
      ],
      points: [
        { name: 'Category A: 35000 pts', value: 35 },
        { name: 'Category B: 25000 pts', value: 25 },
        { name: 'Category C: 25000 pts', value: 25 },
        { name: 'Category D: 15000 pts', value: 15 },
        { name: 'Category E: 5000 pts', value: 5 }
      ]
    },
    previousYear: {
      quantity: [
        { name: 'Category A: 5000 units', value: 50 },
        { name: 'Category B: 2000 units', value: 20 },
        { name: 'Category C: 1500 units', value: 15 },
        { name: 'Category D: 1500 units', value: 15 },
        { name: 'Category E: 0 units', value: 0 }
      ],
      sales: [
        { name: 'Category A: $50000', value: 50 },
        { name: 'Category B: $20000', value: 20 },
        { name: 'Category C: $15000', value: 15 },
        { name: 'Category D: $15000', value: 15 },
        { name: 'Category E: $0', value: 0 }
      ],
      points: [
        { name: 'Category A: 50000 pts', value: 50 },
        { name: 'Category B: 20000 pts', value: 20 },
        { name: 'Category C: 15000 pts', value: 15 },
        { name: 'Category D: 15000 pts', value: 15 },
        { name: 'Category E: 0 pts', value: 0 }
      ]
    },
    lifetime: {
      quantity: [
        { name: 'Category A: 45000 units', value: 45 },
        { name: 'Category B: 25000 units', value: 25 },
        { name: 'Category C: 20000 units', value: 20 },
        { name: 'Category D: 10000 units', value: 10 },
        { name: 'Category E: 5000 units', value: 5 }
      ],
      sales: [
        { name: 'Category A: $450000', value: 45 },
        { name: 'Category B: $250000', value: 25 },
        { name: 'Category C: $200000', value: 20 },
        { name: 'Category D: $100000', value: 10 },
        { name: 'Category E: $50000', value: 5 }
      ],
      points: [
        { name: 'Category A: 450000 pts', value: 45 },
        { name: 'Category B: 250000 pts', value: 25 },
        { name: 'Category C: 200000 pts', value: 20 },
        { name: 'Category D: 100000 pts', value: 10 },
        { name: 'Category E: 50000 pts', value: 5 }
      ]
    }
  };
  private lineChartDataSets = {
    currentMonth: {
      quantity: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Quantity: 1000 units',
            data: [250, 300, 200, 250],
            borderColor: 'blue',
            fill: false
          }
        ]
      },
      sales: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Sales: $10000',
            data: [2500, 3000, 2000, 2500],
            borderColor: 'blue',
            fill: false
          }
        ]
      },
      points: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Points: 1000 pts',
            data: [2500, 3000, 2000, 2500],
            borderColor: 'pink',
            fill: false
          }
        ]
      }
    },
    currentYear: {
      quantity: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Quantity: 12000 units',
            data: [1000, 1200, 800, 1100, 900, 1000, 950, 1050, 1100, 1150, 1200, 1000],
            borderColor: 'blue',
            fill: false
          }
        ]
      },
      sales: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Sales: $120000',
            data: [10000, 12000, 8000, 11000, 9000, 10000, 9500, 10500, 11000, 11500, 12000, 10000],
            borderColor: 'blue',
            fill: false
          }
        ]
      },
      points: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Points: 12000 pts',
            data: [1000, 1200, 800, 1100, 900, 1000, 950, 1050, 1100, 1150, 1200, 1000],
            borderColor: 'pink',
            fill: false
          }
        ]
      }
    },
    previousYear: {
      quantity: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Quantity: 10000 units',
            data: [800, 900, 700, 850, 800, 900, 750, 800, 850, 900, 950, 800],
            borderColor: 'blue',
            fill: false
          }
        ]
      },
      sales: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Sales: $100000',
            data: [8000, 9000, 7000, 8500, 8000, 9000, 7500, 8000, 8500, 9000, 9500, 8000],
            borderColor: 'blue',
            fill: false
          }
        ]
      },
      points: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Points: 10000 pts',
            data: [800, 900, 700, 850, 800, 900, 750, 800, 850, 900, 950, 800],
            borderColor: 'pink',
            fill: false
          }
        ]
      }
    },
    lifetime: {
      quantity: {
        labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
        datasets: [
          {
            label: 'Quantity: 50000 units',
            data: [5000, 6000, 7000, 7500, 8000, 8500, 9000],
            borderColor: 'blue',
            fill: false
          }
        ]
      },
      sales: {
        labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
        datasets: [
          {
            label: 'Sales: $500000',
            data: [50000, 60000, 70000, 75000, 80000, 85000, 90000],
            borderColor: 'blue',
            fill: false
          }
        ]
      },
      points: {
        labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
        datasets: [
          {
            label: 'Points: 50000 pts',
            data: [5000, 6000, 7000, 7500, 8000, 8500, 9000],
            borderColor: 'pink',
            fill: false
          }
        ]
      }
    },
    yearVsYear: {
      quantity: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Previous Year: 10000 units',
            data: [800, 900, 700, 850, 800, 900, 750, 800, 850, 900, 950, 800],
            borderColor: 'gray',
            fill: false
          },
          {
            label: 'Current Year: 12000 units',
            data: [1000, 1200, 800, 1100, 900, 1000, 950, 1050, 1100, 1150, 1200, 1000],
            borderColor: 'blue',
            fill: false
          }
        ]
      },
      sales: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Previous Year: $100000',
            data: [8000, 9000, 7000, 8500, 8000, 9000, 7500, 8000, 8500, 9000, 9500, 8000],
            borderColor: 'gray',
            fill: false
          },
          {
            label: 'Current Year: $120000',
            data: [10000, 12000, 8000, 11000, 9000, 10000, 9500, 10500, 11000, 11500, 12000, 10000],
            borderColor: 'blue',
            fill: false
          }
        ]
      },
      points: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Previous Year: 10000 pts',
            data: [800, 900, 700, 850, 800, 900, 750, 800, 850, 900, 950, 800],
            borderColor: 'gray',
            fill: false
          },
          {
            label: 'Current Year: 12000 pts',
            data: [1000, 1200, 800, 1100, 900, 1000, 950, 1050, 1100, 1150, 1200, 1000],
            borderColor: 'pink',
            fill: false
          }
        ]
      }
    }
  };
  private barChartDataSets = {
    currentMonth: {
      quantity: {
        totalSales: 1000,
        targetValue: 1500,
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [
            {
              label: 'Quantity: 1000 units',
              data: [250, 300, 200, 250],
              backgroundColor: 'blue'
            }
          ]
        }
      },
      sales: {
        totalSales: 10000,
        targetValue: 15000,
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [
            {
              label: 'Sales: $10000',
              data: [2500, 3000, 2000, 2500],
              backgroundColor: 'blue'
            }
          ]
        }
      },
      points: {
        totalSales: 1000,
        targetValue: 1500,
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [
            {
              label: 'Points: 1000 pts',
              data: [2500, 3000, 2000, 2500],
              backgroundColor: 'pink'
            }
          ]
        }
      }
    },
    currentYear: {
      quantity: {
        totalSales: 12000,
        targetValue: 15000,
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Quantity: 12000 units',
              data: [1000, 1200, 800, 1100, 900, 1000, 950, 1050, 1100, 1150, 1200, 1000],
              backgroundColor: 'blue'
            }
          ]
        }
      },
      sales: {
        totalSales: 120000,
        targetValue: 150000,
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Sales: $120000',
              data: [10000, 12000, 8000, 11000, 9000, 10000, 9500, 10500, 11000, 11500, 12000, 10000],
              backgroundColor: 'blue'
            }
          ]
        }
      },
      points: {
        totalSales: 12000,
        targetValue: 15000,
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Points: 12000 pts',
              data: [1000, 1200, 800, 1100, 900, 1000, 950, 1050, 1100, 1150, 1200, 1000],
              backgroundColor: 'pink'
            }
          ]
        }
      }
    },
    previousYear: {
      quantity: {
        totalSales: 10000,
        targetValue: 13000,
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Quantity: 10000 units',
              data: [800, 900, 700, 850, 800, 900, 750, 800, 850, 900, 950, 800],
              backgroundColor: 'blue'
            }
          ]
        }
      },
      sales: {
        totalSales: 100000,
        targetValue: 130000,
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Sales: $100000',
              data: [8000, 9000, 7000, 8500, 8000, 9000, 7500, 8000, 8500, 9000, 9500, 8000],
              backgroundColor: 'blue'
            }
          ]
        }
      },
      points: {
        totalSales: 10000,
        targetValue: 13000,
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Points: 10000 pts',
              data: [800, 900, 700, 850, 800, 900, 750, 800, 850, 900, 950, 800],
              backgroundColor: 'pink'
            }
          ]
        }
      }
    },
    lifetime: {
      quantity: {
        totalSales: 50000,
        targetValue: 60000,
        data: {
          labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
          datasets: [
            {
              label: 'Quantity: 50000 units',
              data: [5000, 6000, 7000, 7500, 8000, 8500, 9000],
              backgroundColor: 'blue'
            }
          ]
        }
      },
      sales: {
        totalSales: 500000,
        targetValue: 600000,
        data: {
          labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
          datasets: [
            {
              label: 'Sales: $500000',
              data: [50000, 60000, 70000, 75000, 80000, 85000, 90000],
              backgroundColor: 'blue'
            }
          ]
        }
      },
      points: {
        totalSales: 50000,
        targetValue: 60000,
        data: {
          labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
          datasets: [
            {
              label: 'Points: 50000 pts',
              data: [5000, 6000, 7000, 7500, 8000, 8500, 9000],
              backgroundColor: 'pink'
            }
          ]
        }
      }
    },
    yearVsYear: {
      quantity: {
        totalSales: 22000,
        targetValue: 28000,
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Previous Year: 10000 units',
              data: [800, 900, 700, 850, 800, 900, 750, 800, 850, 900, 950, 800],
              backgroundColor: 'gray'
            },
            {
              label: 'Current Year: 12000 units',
              data: [1000, 1200, 800, 1100, 900, 1000, 950, 1050, 1100, 1150, 1200, 1000],
              backgroundColor: 'blue'
            }
          ]
        }
      },
      sales: {
        totalSales: 220000,
        targetValue: 280000,
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Previous Year: $100000',
              data: [8000, 9000, 7000, 8500, 8000, 9000, 7500, 8000, 8500, 9000, 9500, 8000],
              backgroundColor: 'gray'
            },
            {
              label: 'Current Year: $120000',
              data: [10000, 12000, 8000, 11000, 9000, 10000, 9500, 10500, 11000, 11500, 12000, 10000],
              backgroundColor: 'blue'
            }
          ]
        }
      },
      points: {
        totalSales: 22000,
        targetValue: 28000,
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Previous Year: 10000 pts',
              data: [800, 900, 700, 850, 800, 900, 750, 800, 850, 900, 950, 800],
              backgroundColor: 'gray'
            },
            {
              label: 'Current Year: 12000 pts',
              data: [1000, 1200, 800, 1100, 900, 1000, 950, 1050, 1100, 1150, 1200, 1000],
              backgroundColor: 'pink'
            }
          ]
        }
      }
    }
  };
  @ViewChild('vimeoPlayer', { static: false }) videoPlayer: ElementRef;
  trainingEmbededVideo = null;
  @ViewChildren(BaseChartDirective) baseCharts!: QueryList<BaseChartDirective>;
  ytdPointsEarned: { [key: number]: number | { currentYear: number; previousYear: number } } = {};
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
  carouselSubscription!: Subscription;
  colorScheme = {
    domain: ["#C94D6D", "#4174C9", "#876B8E", "#8DBCCC", "#8FAAC6", "#8C4D57", "#b89dc7", "#966577", "#95a3de", "#fb9ad4", "#99738a", "#ccbdaf", "#97c4a0", "#c9adc9", "#e3ccba", "#bfe0b8", "#b7d2f7", "#d0c7f2", "#b6f0bf", "#d6bfd6"]
  };
  selectedTimePeriod: string = 'currentYear';
  selectedTimePeriodLine: string;
  selectedTimePeriodPie: string;
  selectedTimePeriodBar: string;
  noPieChartData: boolean = false;
  noBarChartData: boolean = false;
  currentYear: number = new Date().getFullYear();
  previousYear: number = new Date().getFullYear() - 1;
  barChartData: {
    totalSales?: number;
    targetValue?: number;
    currentYear?: { totalSales: number; targetValue: number };
    previousYear?: { totalSales: number; targetValue: number };
  } = {
      totalSales: 0,
      targetValue: 0,
      currentYear: { totalSales: 0, targetValue: 0 },
      previousYear: { totalSales: 0, targetValue: 0 }
    };
  pointsAndSummaryLoading = false;
  isTransactionRedemptionLoading = false;
  isTransactionCreditLoading = false;
  publishedPage = null;
  mandatoryList: any[] = [];
  redemptionTransactionData = [];
  creditTransactionData = [];
  selectedLanguage: 'English';
  originalSections: string = '';
  mobileView = false;
  storedMobileView = null;
  audioAutoplay: boolean = true;
  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;
  @ViewChild('scrollContainerItem') scrollContainerItem!: ElementRef;
  monthValues: string[] = [
    '1', '2', '3', '4', '5', '6',
    '7', '8', '9', '10', '11', '12'
  ];
  isAssigned: boolean;
  staticRedemptionData = [
    { invoiceNumber: 'INV001', dateProcessed: '2025-01-15', transactionType: 'Redemption', totalPoints: 500 },
    { invoiceNumber: 'INV002', dateProcessed: '2025-02-10', transactionType: 'Redemption', totalPoints: 300 },
    { invoiceNumber: 'INV003', dateProcessed: '2025-03-05', transactionType: 'Redemption', totalPoints: 700 }
  ];

  // Static data for All Transactions
  staticTransactionData = [
    { invoiceNumber: 'INV001', dateProcessed: '2025-01-15', transactionType: 'Redemption', totalPoints: 500 },
    { invoiceNumber: 'INV002', dateProcessed: '2025-02-10', transactionType: 'Credit', totalPoints: 1000 },
    { invoiceNumber: 'INV003', dateProcessed: '2025-03-05', transactionType: 'Redemption', totalPoints: 700 },
    { invoiceNumber: 'INV004', dateProcessed: '2025-04-01', transactionType: 'Credit', totalPoints: 800 }
  ];

  // Static data for Credit
  staticCreditData = [
    { invoiceNumber: 'INV002', dateProcessed: '2025-02-10', transactionType: 'Credit', totalPoints: 1000 },
    { invoiceNumber: 'INV004', dateProcessed: '2025-04-01', transactionType: 'Credit', totalPoints: 800 }
  ];

  // Static data for Messages
  staticNotifications = {
    results: [
      { id: 1, title: 'Welcome Message', message: 'Welcome to the Incentive Program!', createdDate: '2025-01-01' },
      { id: 2, title: 'Points Update', message: 'You earned 500 points!', createdDate: '2025-02-01' },
      { id: 3, title: 'New Offer', message: 'Check out our new rewards!', createdDate: '2025-03-01' }
    ],
    customRecordCount: 3
  };

  ytdSales = 120000;
  remainingPoints = 2500;
  pointsCredited = 15000;
  totalCourse = 0;
  totalAttempted = 0;
  totalAvailableCourse = 0;
  totalCompleted = 0;
  totalRequiredCourses = 0;
  totalRequiredCompleted = 0;
  constructor(
    private sanitizer: DomSanitizer,
    private _modernService: ModernService,
    private _router: Router,
    private _homeService: HomeService,
    private _sharedService: SharedService,
    private router: Router,
    private notificationService: NotificationService,
    private trainingCourseService: TrainingCourseManagerService,
    private KohlerService: KohlerStudioService,
    private manageWebsiteContent: ManageWebsiteService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    // local safe JSON parser used inside constructor to avoid noisy try/catch blocks
    const safeParse = (val: any, fallback: any = {}) => {
      if (val == null) return fallback;
      try {
        if (typeof val === 'string') return JSON.parse(val);
        return val;
      } catch (e) {
        console.warn('safeParse failed for value:', val, e);
        return fallback;
      }
    };

    // initialize with a sensible default so template has something before API returns
    this.sectionsArray = [
      {
        items: [
          { className: 'Pie Chart', chartDataType: 'quantity', selectedTimePeriod: 'currentYear' },
          { className: 'Line Chart', chartDataType: 'sales', selectedTimePeriod: 'currentYear' },
          { className: 'Line Chart', chartDataType: 'points', selectedTimePeriod: 'currentYear' },
          { className: 'Bar Chart', chartDataType: 'sales', selectedTimePeriod: 'currentYear' }
        ]
      }
    ];

    // fetch menu first
    this.manageWebsiteContent.GetAllCMSMenu(false).subscribe({
      next: (res: any[]) => {
        try {
          const filteredRes = (res || []).filter(r => !(r.menuId || '').startsWith('DRFT_') && r.menuId !== 'DRFT_RESTORED');

          filteredRes.forEach(menuItem => {
            if ((menuItem.menuId === '' || menuItem.menuId === 'HM') && !menuItem.isPublish) {
              this.publishedPage = menuItem;
            }
          });

          if (this.publishedPage && this.publishedPage.menuId === 'HM') {
            // then fetch containers for that page
            this.manageWebsiteContent.GetAllCMSContainer(this.publishedPage.id, true).subscribe({
              next: (resp: any[]) => {
                try {
                  let lineChartCounter = 0;

                  // Map each section
                  this.sectionsArray = (resp || []).map((section: any, sectionIndex: number) => {
                    this.selectedContainerType = section.sectionType;

                    // parse styles for all views in this section
                    const parsedStylesArray = (section.getAllCMSContainerViews || []).map((item: any) => {
                      const raw = safeParse(item.styles, {});
                      // normalize numeric fields if they are strings
                      ['top', 'left', 'height', 'width', 'zindex'].forEach(key => {
                        if (raw[key] != null && typeof raw[key] === 'string') {
                          const n = parseFloat(raw[key]);
                          raw[key] = isNaN(n) ? raw[key] : n;
                        }
                      });
                      return raw;
                    });

                    // optional: capture dropdown defaults at section-level (if present)
                    (section.getAllCMSContainerViews || []).forEach((item: any) => {
                      if (item.chartDropdown) {
                        switch (item.type) {
                          case 'Pie Chart':
                            this.selectedTimePeriodPie = item.chartDropdown;
                            break;
                          case 'Line Chart':
                            this.selectedTimePeriodLine = item.chartDropdown;
                            break;
                          case 'Bar Chart':
                            this.selectedTimePeriodBar = item.chartDropdown;
                            break;
                        }
                      }
                    });

                    // build the items array for this section
                    const items = (section.getAllCMSContainerViews || [])
                      .filter((items: any) => !(
                        (items.type === 'panel' || items.type === 'image' || items.type === 'video' || items.type === 'audio') &&
                        (!items.getAllCMSItemViews || items.getAllCMSItemViews.length === 0)
                      ))
                      .map((items: any, idx: number) => {
                        const parsedStyles = parsedStylesArray[idx] || {};
                        const fitWidthData = (() => {
                          const parsed = safeParse(items.fitWidth, {});
                          ['xPercent', 'yPercent', 'widthPercent', 'heightPercent', 'zindex'].forEach(k => {
                            if (parsed[k] != null && typeof parsed[k] === 'string') {
                              const n = parseFloat(parsed[k]);
                              parsed[k] = isNaN(n) ? parsed[k] : n;
                            }
                          });
                          return parsed;
                        })();

                        // parse button style if present
                        let buttonStyle: any = {};
                        if (items.type === 'button' && items.salesHeading) {
                          buttonStyle = safeParse(items.salesHeading, {});
                        }

                        // video/audio/image parsing (minimal here — keep your existing logic elsewhere)
                        let images: string[] = [];
                        let localVideoUrl: string | null = null;
                        let videoUrl: string | null = null;
                        let audioUrl: string | null = null;
                        let isYoutubeOrVimeo = false;
                        let autoPlay = false;
                        let loop = false;
                        let requireUserToWatch = false;

                        if (items.type === 'image' && items.getAllCMSItemViews?.length) {
                          images = items.getAllCMSItemViews.map((iv: any) => iv.url).filter((u: any) => !!u);
                        } else if (items.type === 'video' && items.getAllCMSItemViews?.length) {
                          const firstItem = items.getAllCMSItemViews[0];
                          if (firstItem.url) {
                            localVideoUrl = firstItem.url;
                          } else if (firstItem.content && (firstItem.content.includes('youtu') || firstItem.content.includes('youtube.com/embed/'))) {
                            videoUrl = firstItem.content;
                            if (videoUrl.includes('youtube.com/watch?v=')) {
                              const videoId = videoUrl.split('v=')[1]?.split('&')[0];
                              videoUrl = `https://www.youtube.com/embed/${videoId}`;
                            } else if (videoUrl.includes('youtu.be/')) {
                              const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
                              videoUrl = `https://www.youtube.com/embed/${videoId}`;
                            }
                            isYoutubeOrVimeo = true;
                          } else if (items.text && (items.text.includes('youtu') || items.text.includes('youtube.com/embed/'))) {
                            videoUrl = items.text;
                            if (videoUrl.includes('youtube.com/watch?v=')) {
                              const videoId = videoUrl.split('v=')[1]?.split('&')[0];
                              videoUrl = `https://www.youtube.com/embed/${videoId}`;
                            } else if (videoUrl.includes('youtu.be/')) {
                              const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
                              videoUrl = `https://www.youtube.com/embed/${videoId}`;
                            }
                            isYoutubeOrVimeo = true;
                          }
                          autoPlay = firstItem?.autoPlay || false;
                          requireUserToWatch = firstItem?.requireUserToWatch || firstItem?.isRequired || false;
                          if (firstItem?.bannerHeading) {
                            const loopData = safeParse(firstItem.bannerHeading, {});
                            loop = !!loopData.loop;
                          }
                        } else if (items.type === 'audio') {
                          if (items.getAllCMSItemViews?.length) {
                            const audioItem = items.getAllCMSItemViews[0];
                            audioUrl = audioItem?.url || audioItem?.content || null;
                            autoPlay = audioItem?.autoPlay || false;
                            requireUserToWatch = audioItem?.requireUserToWatch || audioItem?.isRequired || false;
                            if (audioItem?.bannerHeading) {
                              const loopData = safeParse(audioItem.bannerHeading, {});
                              loop = !!loopData.loop;
                            }
                          }
                          if (!audioUrl && items.text) audioUrl = items.text;
                        }

                        // TEXT / greeting handling simplified — keep original replacements where needed
                        let textContent = '';
                        if (items.type === 'greeting') {
                          const hour = new Date().getHours();
                          const greetingMessage = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
                          const userName = this.userName ? `, ${this.userName}` : '';
                          if (items.text) {
                            textContent = items.text.replace(/\[Good Morning\/Afternoon\/Evening\], \[First Name\]/, `${greetingMessage}${userName}`);
                          } else {
                            textContent = `<h3 style="text-align:center;"><span class="kl-editor-size-x-large" style="color:#02479c !important; font-family: HelveticaNeuelight; font-size:19px;">${greetingMessage}${userName}</span></h3>`;
                          }
                        } else if (items.text) {
                          textContent = items.text;
                          if (items.type !== 'button' && items.type !== 'TrainingMonth' && !textContent.includes('<p>') && textContent.trim()) {
                            textContent = `<p>${textContent}</p>`;
                          }
                        } else if (items.getAllCMSItemViews?.length && items.getAllCMSItemViews[0].content) {
                          const firstItem = items.getAllCMSItemViews[0];
                          if (firstItem.type === 'text' || items.type === 'text' || items.type === 'textbox') {
                            textContent = firstItem.content;
                            if (items.type !== 'button' && !textContent.includes('<p>') && textContent.trim()) {
                              textContent = `<p>${textContent}</p>`;
                            }
                          }
                        }

                        // default fallback values for layout coordinates
                        const defaultLeft = idx * 20;
                        const defaultTop = 10;
                        const defaultHeight = this.getDefaultHeightForType ? this.getDefaultHeightForType(items.type) : 50;

                        // Determine chart defaults
                        let className = items.className?.trim() || items.type || 'Unknown';
                        if (!['Pie Chart', 'Line Chart', 'Bar Chart'].includes(className)) {
                          className = items.type || 'Unknown';
                        }
                        const chartDataType =
                          ['quantity', 'sales', 'points'].includes(items.chartDataType)
                            ? items.chartDataType
                            : 'quantity';

                        let selectedTimePeriod = items.chartDropdown || items.selectedTimePeriod || '';
                        if (!selectedTimePeriod) {
                          if (className === 'Pie Chart') selectedTimePeriod = 'currentMonth';
                          else if (className === 'Line Chart' || className === 'Bar Chart') selectedTimePeriod = 'currentYear';
                          else selectedTimePeriod = 'currentYear';
                        }

                        return {
                          type: items.type,
                          className,
                          containerId: items.containerId,
                          id: items.id,
                          containerSize: items.containerSize || 30,
                          isVideo: items.isVideo || !!videoUrl,
                          text: textContent || items.text || '',
                          content: textContent || items.text || '',
                          selectedIndex: 0,
                          chartHeading: items.chartHeading,
                          salesHeading: items.salesHeading,
                          hyperlink: items.text || items.chartHeading || items.salesHeading || '',
                          buttonStyle,
                          styles: parsedStyles,
                          xPercent: fitWidthData.xPercent ?? (parsedStyles.left != null ? parseFloat(parsedStyles.left) : defaultLeft),
                          yPercent: fitWidthData.yPercent ?? (parsedStyles.top != null ? parseFloat(parsedStyles.top) : defaultTop),
                          widthPercent: fitWidthData.widthPercent ?? (items.containerSize || 30),
                          heightPercent: fitWidthData.heightPercent ?? (parsedStyles.height || defaultHeight),
                          zIndex: fitWidthData.zindex ?? (parsedStyles.zindex || (idx + 1)),
                          chartDropdown: items.chartDropdown ?? selectedTimePeriod,
                          chartDataType,
                          chartIndex: items.type === 'Line Chart' ? lineChartCounter++ : undefined,
                          x: 0,
                          y: 0,
                          width: 0,
                          height: 0,
                          autoPlay,
                          loop,
                          requireUserToWatch,
                          images,
                          localVideoUrl,
                          videoUrl,
                          audioUrl,
                          isYoutubeOrVimeo,
                          tempVideoUrl: !isYoutubeOrVimeo ? videoUrl : null,
                          currentIndex: 0,
                          title: (() => {
                            const bannerHeading = items.getAllCMSItemViews?.[0]?.bannerHeading;
                            if (!bannerHeading) return '';
                            try {
                              const parsed = JSON.parse(bannerHeading);
                              return parsed?.title || parsed || '';
                            } catch (e) {
                              return bannerHeading;
                            }
                          })(),
                          subtitle: items.getAllCMSItemViews?.[0]?.bannerSubHeading || '',
                          buttonUrl: items.getAllCMSItemViews?.[0]?.buttonUrl || items.chartHeading || '',
                          isClickable: items.getAllCMSItemViews?.[0]?.isClickable || !!items.chartHeading,
                          getAllCMSItemViews: (items.getAllCMSItemViews || []).map((itemView: any) => {
                            const itemFit = safeParse(itemView.fitWidth, {});
                            return {
                              id: itemView.uploadId || itemView.id,
                              isVideo: itemView.isVideo,
                              bannerHeading: itemView.bannerHeading,
                              newHeadings: itemView.newHeadings || [],
                              uniqueId: itemView.uniqueId,
                              bannerSubHeading: itemView.bannerSubHeading,
                              videoFile: null,
                              ImageFile: null,
                              url: itemView.url,
                              content: itemView.content,
                              type: itemView.type,
                              panelType: itemView.panelType || 'image',
                              fullBleed: itemView.fullBleed,
                              fitWidth: itemView.fitWidth,
                              opacity: itemView.opacity,
                              autoPlay: itemView.autoPlay || false,
                              requireUserToWatch: itemView.isRequired || false,
                              buttonUrl: itemView.buttonUrl || '',
                              isClickable: itemView.isClickable || false
                            };
                          })
                        };
                      });

                    return {
                      id: section.id,
                      position: section.position !== undefined ? section.position : sectionIndex,
                      height: parseFloat(this.getSectionArrayMaxHeight ? this.getSectionArrayMaxHeight(sectionIndex) : '0') || 0,
                      items
                    };
                  });

                  // sort to keep positions stable
                  this.sectionsArray.sort((a: any, b: any) => {
                    if (a.position === b.position) return (a.id || '').localeCompare(b.id || '');
                    return a.position - b.position;
                  });

                  // initialize chart time periods AFTER the mapping completes and after Angular's change detection
                  setTimeout(() => {
                    try {
                      this.initializeChartTimePeriod();

                      // ensure distinct positions
                      this.sectionsArray.forEach((section: any, index: number) => {
                        if (index > 0 && section.position === this.sectionsArray[index - 1].position) {
                          section.position = this.sectionsArray[index - 1].position + 1;
                        }
                      });

                      this.originalSections = JSON.stringify(this.sectionsArray);

                      if (window.innerWidth <= 480) {
                        this.storedMobileView = JSON.parse(JSON.stringify(this.sectionsArray));
                        this.sectionsArray.forEach((section: any) => {
                          section.items = this.reorderCMSItemsByPosition ? this.reorderCMSItemsByPosition(section.items) : section.items;
                        });
                      }

                      this.processSections ? this.processSections() : null;
                      requestAnimationFrame(() => this.updateSectionHeights ? this.updateSectionHeights() : null);
                      this.changeDetectorRef.detectChanges();
                    } catch (e) {
                      console.error('Error during post-map initialization:', e);
                    }
                  }, 0);

                } catch (mapErr) {
                  console.error('Error mapping CMS containers:', mapErr);
                }
              },
              error: (err: any) => {
                console.error('GetAllCMSContainer error:', err);
              }
            });
          } // end if publishedPage is HM
        } catch (outerErr) {
          console.error('Error processing CMS menu response:', outerErr);
        }
      },
      error: (err: any) => {
        console.error('GetAllCMSMenu error:', err);
      }
    });
  }

  ngOnInit(): void {
    try {
      const saved = sessionStorage.getItem('isSalesSelected');
      if (saved != null) this.isSalesSelected = JSON.parse(saved);
    } catch { }
    sessionStorage.setItem('isSalesSelected', JSON.stringify(this.isSalesSelected));
    this.userType = sessionStorage.getItem('usertype') ?? this.userType;
    this.startCarousel?.();
    this.updateChartSize?.();
    this.seedStaticDefaultsForVisibleWidgets();
    console.log('ngOnInit: sectionsArray after initialization', JSON.stringify(this.sectionsArray, null, 2));
  }

  initializeChartTimePeriod() {
    this.sectionsArray.forEach(section => {
      section.items.forEach(item => {
        // Set default selectedTimePeriod if not already set
        if (!item.selectedTimePeriod) {
          if (item.className === 'Pie Chart') item.selectedTimePeriod = 'currentMonth';
          else if (item.className === 'Line Chart') item.selectedTimePeriod = 'currentYear';
          else if (item.className === 'Bar Chart') item.selectedTimePeriod = 'currentYear';
        }

        // Ensure chartDataType is valid
        item.chartDataType = ['quantity', 'sales', 'points'].includes(item.chartDataType)
          ? item.chartDataType
          : 'quantity';

        // Populate chart data
        this.onTimePeriodChange(item.selectedTimePeriod, item, item.className);
      });
    });

    // 👇 Important: Force re-render after setting model values
    this.changeDetectorRef.detectChanges();
  }


  onTimePeriodChange(timePeriod: string, item: any, chartType: string) {
    const defaultPieData = [{ name: 'N/A', value: 100 }];
    const defaultLineData = { labels: [], datasets: [] };
    const defaultBarData = { labels: [], datasets: [] };

    const chartDataType = item.chartDataType && ['quantity', 'sales', 'points'].includes(item.chartDataType)
      ? item.chartDataType
      : 'quantity';

    // Convert timePeriod to PeriodKey
    const periodKey = this.periodKeyFrom(timePeriod);

    if (chartType === 'Pie Chart') {
      item.pieChartData = this.pieChartDataSets[periodKey]?.[chartDataType] || defaultPieData;
      this.noPieChartData = item.pieChartData.length === 0;
    } else if (chartType === 'Line Chart') {
      item.lineChartData = this.lineChartDataSets[periodKey]?.[chartDataType] || defaultLineData;
      if (chartDataType === 'points') {
        this.totalPoints = item.lineChartData.datasets[0]?.data.reduce((sum: number, val: number) => sum + val, 0) || 0;
      } else {
        this.totalSales = item.lineChartData.datasets[0]?.data.reduce((sum: number, val: number) => sum + val, 0) || 0;
      }
    } else if (chartType === 'Bar Chart') {
      const barData = this.barChartDataSets[periodKey]?.[chartDataType] || {
        totalSales: 0,
        targetValue: 0,
        data: defaultBarData
      };
      this.totalSales = barData.totalSales || 0;
      this.targetValue = barData.targetValue || 0;
      item.barChartData = barData.data || defaultBarData;
      if (chartDataType === 'points') {
        this.totalPoints = barData.totalSales || 0;
      }
    }

    console.log(`ChartType: ${chartType}, TimePeriod: ${timePeriod}, ChartDataType: ${chartDataType}, Data:`,
      chartType === 'Pie Chart' ? item.pieChartData :
        chartType === 'Line Chart' ? item.lineChartData : item.barChartData);

    this.changeDetectorRef.detectChanges();
  }


  // dropdown -> internal key
  private periodKeyFrom(val: any): PeriodKey {
    const t = String(val || '').toLowerCase().trim();
    if (t.includes('yearvsyear') || t.includes('previous year vs') || t.includes('yoy')) return 'yearVsYear';
    if (t.includes('current month') || t === 'currentmonth') return 'currentMonth';
    if (t.includes('current year') || t === 'currentyear') return 'currentYear';
    if (t.includes('previous year') || t === 'previousyear') return 'previousYear';
    if (t.includes('lifetime')) return 'lifetime';
    return 'currentYear';
  }

  // PIE (ngx-charts expects [{name,value}])
  private setPieFromStatic(item: any, period: PeriodKey) {
    const metric: MetricKey = this.isSalesSelected ? 'sales' : 'quantity';
    const ds = this.pieChartDataSets[period][metric];
    item.pieChartData = ds;
  }

  // LINE (Chart.js)
  private setLineFromStatic(item: any, period: PeriodKey) {
    const sales = this.lineChartDataSets[period].sales;
    const points = this.lineChartDataSets[period].points;
    const series = [{ ...sales.datasets[0] }, { ...points.datasets[0] }];

    item.lineChartData = {
      labels: sales.labels,
      datasets: [this.isSalesSelected ? series[0] : series[1]]
    } as ChartData<'line', number[], string | string[]>;

    this.lineChartDataset = series;
  }

  // BAR totals (blue card)
  private setBarFromStatic(period: PeriodKey) {
    const metric: MetricKey = 'sales';
    const ds = this.barChartDataSets[period][metric];
    this.totalSales = ds.totalSales;
    this.targetValue = ds.targetValue;
  }


  // seed defaults after your sections load
  seedStaticDefaultsForVisibleWidgets() {
    const defaultPie: PeriodKey = 'currentMonth';
    const defaultLine: PeriodKey = 'currentYear';
    const defaultBar: PeriodKey = 'currentYear';

    this.sectionsArray?.forEach((section: any) => {
      section.items?.forEach((it: any) => {
        if (it.type === 'Pie Chart') this.setPieFromStatic(it, it.selectedTimePeriod ? this.periodKeyFrom(it.selectedTimePeriod) : defaultPie);
        if (it.type === 'Line Chart') this.setLineFromStatic(it, it.selectedTimePeriod ? this.periodKeyFrom(it.selectedTimePeriod) : defaultLine);
        if (it.type === 'Bar Chart') this.setBarFromStatic(it.selectedTimePeriod ? this.periodKeyFrom(it.selectedTimePeriod) : defaultBar);
      });
    });
  }

  resizeObserver!: ResizeObserver;


  ngAfterViewInit(): void {
    this.forceReflowOnce();
    this.resizeObserver = new ResizeObserver(() => {
      this.triggerSectionRecalc();
    });

    setTimeout(() => {
      document.querySelectorAll('.element-container').forEach(el => {
        this.resizeObserver.observe(el);
      });
    });
    this.playAudioIfAutoplay();  // try to autoplay when view is ready
  }

  playAudioIfAutoplay(): void {
    if (this.audioAutoplay && this.audioPlayerRef?.nativeElement) {
      const audio = this.audioPlayerRef.nativeElement;

      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.then(() => {
        }).catch(error => {
          // Optionally show a play button here
        });
      }
    }
  }


  ngOnDestroy() {
    this.resizeObserver?.disconnect();
    if (this.carouselSubscription) {
      this.carouselSubscription.unsubscribe();
    }
  }
  reorderCMSItemsByPosition(items: any[]): any[] {
    return items.slice().sort((a, b) => {
      const aTop = a.styles?.top ?? 0;
      const bTop = b.styles?.top ?? 0;

      if (aTop !== bTop) {
        return aTop - bTop; // Sort by top (Y position)
      }

      const aLeft = a.styles?.left ?? 0;
      const bLeft = b.styles?.left ?? 0;

      if (aLeft !== bLeft) {
        return aLeft - bLeft; // Sort by left (X position)
      }

      const aHeight = a.styles?.height ?? 0;
      const bHeight = b.styles?.height ?? 0;

      return aHeight - bHeight; // Optional: Sort by height if needed
    });
  }
  @HostListener('window:resize', [])
  onResizeWindow() {
    const width = (event.target as Window).innerWidth;
    this.handleResponsiveLayout(width);
  }

  handleResponsiveLayout(width: number) {
    if (width <= 480) {
      this.storedMobileView = JSON.parse(JSON.stringify(this.sectionsArray));
      this.sectionsArray.forEach(section => {
        section.items = this.reorderCMSItemsByPosition(section.items);
      });
    } else if (width > 480 && this.storedMobileView) {
      this.sectionsArray = JSON.parse(JSON.stringify(this.storedMobileView));
      this.storedMobileView = null;
      setTimeout(() => {
        this.updateSectionHeights();
      }, 200);
    }
  }

  async processSections() {
    for (const section of this.sectionsArray) {
      for (const item of section.items) {
        if (item.type === 'video') {
          const firstItem = item.getAllCMSItemViews?.[0];
          if (firstItem) {
            item.autoPlay = firstItem.autoPlay || false;
            item.requireUserToWatch = firstItem.requireUserToWatch || firstItem.isRequired || false;

            if (firstItem.bannerHeading) {
              try {
                const loopData = typeof firstItem.bannerHeading === 'string'
                  ? JSON.parse(firstItem.bannerHeading)
                  : firstItem.bannerHeading;
                item.loop = loopData.loop || false;
              } catch (e) {
                item.loop = false;
              }
            }

            if (firstItem.url) {
              item.localVideoUrl = firstItem.url;
              item.isYoutubeOrVimeo = false;
            } else if (firstItem.content && firstItem.content.includes('youtu')) {
              item.videoUrl = this.transformYouTubeUrl(firstItem.content, item.autoPlay, item.loop);
              item.isYoutubeOrVimeo = true;
            } else if (item.text && item.text.includes('youtu')) {
              item.videoUrl = this.transformYouTubeUrl(item.text, item.autoPlay, item.loop);
              item.isYoutubeOrVimeo = true;
            }
          }
        } else if (item.type === 'audio') {
          if (item.getAllCMSItemViews?.length) {
            const audioItem = item.getAllCMSItemViews[0];
            item.audioUrl = audioItem.url || audioItem.content || null;
            item.autoPlay = audioItem.autoPlay !== undefined ? audioItem.autoPlay : false;
            item.requireUserToWatch = audioItem.requireUserToWatch || audioItem.isRequired || false;
          }
          if (!item.audioUrl && item.text) {
            item.audioUrl = item.text;
          }
        } else {
        }
      }
    }
  }

  handleViewAllNotification() {
    this._router.navigate(['notifications'])
  }

  handleViewAllCurriculums() {

    this._router.navigate(['academy-curriculums']);
  }


  checkAutoplaySupport(): void {
    const audio = document.createElement('audio');
    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch(error => {
        console.warn('Autoplay prevented:', error);
        // this.notificationService.warningTopRight('Please interact with the page to enable audio autoplay.');
      });
    }
  }
  onAudioLoaded(audioPlayer: HTMLAudioElement, item: any) {
    if (item.autoPlay) {
      setTimeout(() => {
        audioPlayer.play().catch(err => {
          console.warn('Autoplay failed:', err);
        });
      }, 200);
    }
  }
  parseButtonStyle(salesHeading: string) {
    try {
      return salesHeading ? JSON.parse(salesHeading) : {};
    } catch (e) {
      return {};
    }
  }
  getTrainingVideoUrl(item: any): any {
    let videoUrl: string | null = null;

    if (item.getAllCMSItemViews && item.getAllCMSItemViews.length > 0) {
      const firstItem = item.getAllCMSItemViews[0];
      videoUrl = firstItem.content || firstItem.url;
    }

    if (!videoUrl && item.text) {
      videoUrl = item.text;
    }

    if (videoUrl) {
      // Convert YouTube watch URLs to embed format
      if (videoUrl.includes('youtube.com/watch?v=')) {
        const videoId = videoUrl.split('v=')[1]?.split('&')[0];
        videoUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (videoUrl.includes('youtu.be/')) {
        const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
        videoUrl = `https://www.youtube.com/embed/${videoId}`;
      }

      return this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl);
    }

    // If no video URL found, return null
    return null;
  }


  forceReflowOnce(): void {
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
    });
  }

  updateChartSize(): void {
    const chartWidth = window.innerWidth > 1100 ? 244 :
      window.innerWidth <= 1100 && window.innerWidth > 700 ? window.innerWidth - 240 :
        window.innerWidth <= 700 && window.innerWidth > 400 ? window.innerWidth - 150 :
          window.innerWidth - 80;
    // this.view = [chartWidth, 300];
  }



  // Helper methods to add to your component
  private isValidUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }

    try {
      // Check if it's a valid URL
      if (url.startsWith('http://') || url.startsWith('https://')) {
        new URL(url);
        return true;
      } else if (url.includes('.') && !url.includes(' ')) {
        // Handle cases like "google.com" without protocol
        new URL('https://' + url);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private formatUrl(url: string): string {
    if (!url) return '';

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Add https:// if missing
    return 'https://' + url;
  }

  // Button click handler method
  onButtonClick(item: any): void {
    if (item.isClickable && (item.buttonUrl || item.chartHeading)) {
      const url = item.buttonUrl || item.chartHeading;
      const formattedUrl = this.formatUrl(url);

      try {
        window.open(formattedUrl, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error('Error opening URL:', error);
        // Optionally show user-friendly error message
        alert('Unable to open URL: ' + url);
      }
    }
  }

  setChartSize(item, i, j) {
    const container = document.querySelector('.chart-container-' + i + '-' + j) as HTMLElement;
    if (container) {
      const width = container.offsetWidth ? +container.offsetWidth : 0;
      const height = container.offsetHeight ? container.offsetHeight : 0;
      item['chartView'] = [Math.max(100, width), Math.max(100, height)];
    }
  }

  private updateSectionHeightsTimer: any = null;

  updateSectionHeights(sectionIndex?: number): void {
    if (this.updateSectionHeightsTimer) clearTimeout(this.updateSectionHeightsTimer);

    this.updateSectionHeightsTimer = setTimeout(() => {
      const indices = sectionIndex !== undefined
        ? [sectionIndex]
        : this.sectionsArray.map((_, i) => i);

      indices.forEach(idx => {
        const section = this.sectionsArray[idx];
        if (!section) return;

        if (!section.items || section.items.length === 0) {
          this.setSectionHeight(idx, 16);
          return;
        }

        let maxBottom = 0;
        const viewportHeight = window.innerHeight;

        if ((section.type || '').toLowerCase() === 'widgets') {
          const gap = window.innerWidth < 768 ? 0.4 : 0.6;
          const rowHeights: number[] = [];
          let curRowWidth = 0;
          let curRowHeight = 0;

          section.items.forEach((item, i) => {
            if (item.type === 'Pie Chart') {
              this.setChartSize(item, idx, i);
            }
            const w = item.widthPercent ?? 33;
            const h = item.heightPercent ?? 25;

            if (curRowWidth === 0 || curRowWidth + gap + w > 100) {
              if (curRowWidth > 0) rowHeights.push(curRowHeight);
              curRowWidth = w;
              curRowHeight = h;
            } else {
              curRowWidth += gap + w;
              curRowHeight = Math.max(curRowHeight, h);
            }
          });
          if (curRowWidth > 0) rowHeights.push(curRowHeight);

          const gaps = Math.max(0, rowHeights.length - 1) * 2;
          maxBottom = rowHeights.reduce((a, b) => a + b, 0) + gaps + 8;

        } else {
          // Freeform mode - check actual DOM height for text elements
          section.items.forEach((item, i) => {
            if (item.type === 'Pie Chart') {
              this.setChartSize(item, idx, i);
            }
            const top = item.yPercent ?? 0;
            let height = item.heightPercent ?? 25;

            // For text elements, check the actual rendered height
            if (item.type === 'text' || item.type === 'greeting') {
              const elementDom = document.getElementById('element-' + item.id);
              if (elementDom) {
                const actualHeightPx = elementDom.scrollHeight || elementDom.offsetHeight;
                const actualHeightVh = (actualHeightPx / viewportHeight) * 100;
                // Use the larger of the two: stored height or actual content height
                height = Math.max(height, actualHeightVh);
              }
            }

            maxBottom = Math.max(maxBottom, top + height);
          });
          maxBottom += 0.5;
        }

        const finalHeight = Math.max(8, Math.ceil(maxBottom));
        this.setSectionHeight(idx, finalHeight);
      });

      this.changeDetectorRef.detectChanges();
    }, 80);
  }

  private setSectionHeight(sectionIndex: number, vh: number): void {
    const el = this.scrollContainerItem?.nativeElement?.children?.[sectionIndex];
    if (!el) return;

    const section = this.sectionsArray[sectionIndex];

    el.style.height = `${vh}vh`;
    el.style.minHeight = (!section?.items || section.items.length === 0) ? '16vh' : '1px';
  }

  private readonly VIEWPORT_SCALE = {
    width: 0.8,
    height: 0.7,
    leftOffset: 10,
    topOffset: 5
  };
  getSectionArrayMaxHeight(sectionIndex: number): string {
    const section = this.sectionsArray[sectionIndex];
    if (!section?.items?.length) return '50vh';

    const viewportHeight = window.innerHeight;

    const sectionEl = document.querySelectorAll(
      '.sections-container > div'
    )[sectionIndex] as HTMLElement;

    if (!sectionEl) return '50vh';

    const sectionRect = sectionEl.getBoundingClientRect();
    let maxBottomPx = 0;

    section.items.forEach(item => {
      const el = document.getElementById('element-' + item.id);
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const bottomPx = rect.bottom - sectionRect.top;

      maxBottomPx = Math.max(maxBottomPx, bottomPx);
    });

    const finalVh = (maxBottomPx / viewportHeight) * 100;
    return `${Math.ceil(Math.max(finalVh + 5, 50))}vh`;
  }

  triggerSectionRecalc() {
    this.sectionsArray = [...this.sectionsArray];
  }

  isWindowWidthLessThan768(): boolean {
    return window.innerWidth < 768;
  }
 isWindowWidthLessThan530(): boolean {
    return window.innerWidth < 530;
  }
  @HostListener('window:resize')
  onWindowResize() {
    this.triggerSectionRecalc();
  }

  getSafeHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  getVideoUrl(item: any): string {
    let url = item.localVideoUrl || item.blobUrl || item.tempVideoUrl || item.videoUrl || '';

    if (item.isYoutubeOrVimeo && url) {
      url = this.transformYouTubeUrl(url, item.autoPlay, item.loop);
    }

    if (url && url.startsWith('blob:')) {
      console.log(`Using blob video URL: ${url} for item ID: ${item.id}`);
    }

    return url;
  }
  onVideoLoadStart(item: any): void {
    if (item.requireUserToWatch) {
      item.loadStarted = true;
      item.modified = true;
      this.changeDetectorRef.detectChanges();
      item.loadStarted = true;
      item.modified = true;
      this.changeDetectorRef.detectChanges();
    }
  }

  onVideoError(event: any, item: any): void {
    console.error('Video error:', {
      error: event,
      itemId: item.id,
      url: this.getVideoUrl(item),
      isYoutubeOrVimeo: item.isYoutubeOrVimeo,
      videoUrl: item.videoUrl
    });
    this.notificationService.errorTopRight('Failed to load video. Please check the URL or network connection.');
  }

  onAudioError(event: any, item: any): void {
    console.error('Audio error:', {
      error: event,
      itemId: item.id,
      url: this.getAudioUrl(item)
    });
    this.notificationService.errorTopRight('Failed to load audio. Please check the URL or file format.');
  }

  getAudioUrl(item: any): string {
    const validAudioExtensions = ['.mp3', '.wav', '.ogg', '.m4a'];
    const isValidUrl = (url: string) => url && validAudioExtensions.some(ext => url.toLowerCase().endsWith(ext));

    let url: string | null = null;
    if (item.audioUrl && isValidUrl(item.audioUrl)) {
      url = item.audioUrl;
    } else if (item.getAllCMSItemViews?.length) {
      const firstItem = item.getAllCMSItemViews[0];
      url = firstItem.url || firstItem.content;
    } else if (item.text && isValidUrl(item.text)) {
      url = item.text;
    }

    if (url && isValidUrl(url)) {
      console.log('Audio URL for item', item.id, ':', url, 'autoPlay:', item.autoPlay); // Debugging
      return url;
    }

    console.warn('Invalid or missing audio URL for item:', item.id, { audioUrl: item.audioUrl, content: item.content, text: item.text });
    return '';
  }
  playAudio(item: any): void {
    const audio = document.querySelector(`audio[aria-label='Audio player for ${item.id}']`) as HTMLAudioElement;
    if (audio) {
      audio.play().then(() => {
        item.isPlaying = true;
        this.changeDetectorRef.detectChanges();
        console.log('Audio started playing for item:', item.id);
      }).catch(error => {
        console.error('Failed to play audio:', error, 'Item:', item.id);
        this.notificationService.errorTopRight('Failed to play audio. Please try again.');
      });
    }
  }

  onAudioCanPlay(item: any): void {
    item.isPlaying = false; // Reset isPlaying until playback starts
    console.log('Audio can play for item:', item.id);
  }

  onAudioTimeUpdate(event: any, item: any): void {
    if (item.requireUserToWatch) {
      const audio = event.target;
      if (audio.duration > 0) {
        const progress = Math.round((audio.currentTime / audio.duration) * 100);
        if (progress > (item.listenProgress || 0)) {
          item.listenProgress = progress;
          item.modified = true;
        }
      }
    }
  }

  onAudioEnded(item: any): void {
    if (item.requireUserToWatch) {
      item.listenProgress = 100;
      item.modified = true;
    }
  }


  getDefaultHeightForType(type: string): number {
    switch (type) {
      case 'text': return 10;
      case 'image': return 30;
      case 'video': return 40;
      case 'audio': return 15;
      case 'button': return 8;
      case 'Pie Chart':
      case 'Line Chart':
      case 'Bar Chart': return 35;
      default: return 25;
    }
  }
  trackByFn(index: number, item: any): number {
    return item.id || index;
  }
  // onResize(event) {
  //   let chartWidth = event.target.innerWidth > 1100 ? 244 : event.target.innerWidth <= 1100 && event.target.innerWidth > 700 ? event.target.innerWidth - 240 : event.target.innerWidth <= 700 && event.target.innerWidth > 400 ? event.target.innerWidth - 150 : event.target.innerWidth - 80;
  //   this.view = [chartWidth, 300];
  // }


  sanitizeVideoUrl(url: string, autoPlay: boolean, loop: boolean): SafeResourceUrl {
    if (!url) {
      console.warn('No URL provided for sanitization');
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }

    // Handle YouTube URLs
    if (url.includes('youtu')) {
      url = this.transformYouTubeUrl(url, autoPlay, loop);
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  transformYouTubeUrl(url: string, autoPlay: boolean, loop: boolean): string {
    if (!url || !url.includes('youtu')) {
      console.warn('Invalid YouTube URL:', url);
      return url;
    }

    // Extract video ID from various YouTube URL formats
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    const videoId = match ? match[1] : null;

    if (videoId) {
      let embedUrl = `https://www.youtube.com/embed/${videoId}`;
      const params = [];
      if (autoPlay) {
        params.push('autoplay=1', 'mute=1'); // Mute is required for autoplay
      }
      if (loop) {
        params.push(`loop=1`, `playlist=${videoId}`); // Playlist required for looping
      }
      if (params.length) {
        embedUrl += `?${params.join('&')}`;
      }
      return embedUrl;
    }

    console.warn('Failed to parse YouTube URL:', url);
    return url;
  }
  getValidAudioUrl(item: any): string {
    const validAudioExtensions = ['.mp3', '.wav', '.ogg', '.m4a'];
    const isValidUrl = (url: string) => url && validAudioExtensions.some(ext => url.toLowerCase().endsWith(ext));
    const url = item.url || item.content;
    return isValidUrl(url) ? url : '';
  }
  startCarousel() {
    this.carouselSubscription = interval(10000).subscribe(() => {
      this.next();
    });
  }

  next() {
    this.currentCarousel = (this.currentCarousel + 1) % 3;
  }

  getPointsAndSalesSummaryCalculation() {
    this.pointsAndSummaryLoading = true;
    const payload = { userId: sessionStorage.getItem('userId') };

    this._modernService.getPointsAndSalesSummaryCalculation(payload).subscribe({
      next: (data) => {
        if (data) {
          if (data?.targetValue) {
            const targetValue = parseFloat(data?.targetValue);
            this.targetValue = targetValue.toFixed(2)?.toString();
          }
          this.remainingPoints = data?.remaining_Points ? data.remaining_Points : 0;
          this.totalSales = data.total_sales?.toFixed(2) ?? this.totalSales.toFixed(2);
          this._sharedService.setTotalPoints(data.remaining_Points);
          this._sharedService.setIsPointLocked(data?.isPointsLocked);
        }
        this.pointsAndSummaryLoading = false;
      },
      error: (error) => {
        this.pointsAndSummaryLoading = false;
        console.error('Error fetching points and sales summary:', error);
      }
    });
  }
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  formatNumberWithCommas(value): string {
    if (value == null) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  getNotificationList() {
    this.isNotificationLoading = true;
    this._homeService.getNotificationList(sessionStorage.getItem('userId'), this.notiApiRequest).subscribe({
      next: (data) => {
        this.isNotificationLoading = false;
        this.notifications = data || { results: [], customRecordCount: 0 };
        this.seeMore = new Array(data.results.length).fill(false);
        this.notifications.results = this.notifications.results.map(notification => {
          if (notification.createdDateTime) {
            notification.createdDateTime = moment.tz(
              notification.createdDateTime,
              notification.createdDateTimeZone || 'UTC'
            ).tz('America/New_York').format('MM/DD/YYYY h:mm A');
          }
          if (notification.scheduledDateTime) {
            notification.scheduledDateTime = moment.tz(
              notification.scheduledDateTime,
              notification.scheduledDateTimeZone || 'UTC'
            ).tz('America/New_York').format('MM/DD/YYYY h:mm A');
          }
          // Ensure properties are initialized
          notification.isRead = notification.isRead ?? false;
          notification.ishighlithed = notification.ishighlithed ?? false;
          notification.isAlert = notification.isAlert ?? false;
          return notification;
        });
        this._sharedService.setNotificationCount(data?.customRecordCount ?? 0);

      },
      error: (error) => {
        console.error('Error fetching notifications:', error);
        this.isNotificationLoading = false;
        this.notifications = { results: [], customRecordCount: 0 };
        this.seeMore = [];
      }
    });
  }

  toggleSeeMore(index: number) {
    this.seeMore[index] = !this.seeMore[index];
  }



  getValidUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  }


  calculateWidth(totalCourse: number, totalAttempted: number): number {
    if (totalCourse === 0) {
      return 0;
    }
    const result = (totalAttempted / totalCourse) * 100;
    return parseFloat(result.toFixed(2));
  }

  customTooltipFormatting = (data): string => {
    const percentage = `${data.value.toFixed(2)}%`;
    return `Category is ${data.name}, this will add in your sales ${percentage}`;
  }



  formatSelectedDate(value) {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = this.padZero(date.getMonth() + 1);
    const day = this.padZero(date.getDate());
    const formattedDate = `${month}/${day}/${year}`;
    return formattedDate
  }

  padZero(num: number, size: number = 2): string {
    let s = num.toString();
    while (s.length < size) s = '0' + s;
    return s;
  }



  formatToDollar(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  handleReadClick(noti) {
    if (noti.isAlert) {
      return;
    }
    if (!noti.isRead) {

      const request = [
        {
          "id": noti.notificationId
        }
      ]
      this._homeService.markRead(request).subscribe(data => {
        if (data.isSuccess)
          this.getNotificationList();
      });
    }
  }
  handleCarouselChange(value) {
    this.currentCarousel = value;
  }

  routeToProgram() {
    this.router.navigate(['/program-rules']);
  }
  routeToNotification() {
    this.router.navigate(['/notifications']);
  }
  sanitizedChartHeading(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  formatHyperlink(link: string): string {
    if (!link) return null;
    if (link.match(/^https?:\/\//)) return link;
    if (link.includes('@')) return `mailto:${link}`;
    if (link.match(/^[\d\(\)\-\s\+]+$/)) return `tel:${link}`;
    return `https://${link}`;
  }

}