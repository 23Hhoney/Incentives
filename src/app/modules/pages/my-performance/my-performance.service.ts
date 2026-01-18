import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/HttpService';
import { Observable } from 'rxjs';

@Injectable()
export class MyPerformanceService {

    constructor(private httpService:HttpService) { }
    getLineChartData(payload) {
        return this.httpService.post('api/CreditImport/MonthlyPointsAndSalesSummaryForUser', payload);
    }
    getPieChartData(payload) {
        return this.httpService.post('api/CreditImport/SaleByCategory', payload);
    }
     monthlyPointsAndSalesSummaryForUserByYearRangFilter(body: any, userId: string | null): Observable<any> {
        const url = `api/CreditImport/MonthlyPointsAndSalesSummaryForUserByYearRangFilter?userId=${userId || ''}`;
        return this.httpService.post(url, body);
      }
      pointsAndSalesSummaryForUserByYearRangeFilter(body: any, userId: string | null): Observable<any> {
        const url = `api/CreditImport/PointsAndSalesSummaryForUserByYearRangeFilter?userId=${userId || ''}`;
        return this.httpService.post(url, body);
      }
       getChartDataForLineChart(body: any, userId: string | null): Observable<any> {
          const url = `api/CreditImport/MonthlyPointsAndSalesSummaryForUserByFilter?userId=${userId || ''}`;
          return this.httpService.post(url, body);
        }
         getdataForChartByfilter(body: any, userId: string | null): Observable<any> {
          const url = `api/CreditImport/PointsAndSalesSummaryForUserByFilter?userId=${userId || ''}`;
          return this.httpService.post(url, body);
        }
}
