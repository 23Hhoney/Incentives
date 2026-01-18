import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpService } from 'app/shared/HttpService';

@Injectable()
export class HomeService {
  private _data: BehaviorSubject<any> = new BehaviorSubject(null);
  
  get data$(): Observable<any>
  {
      return this._data.asObservable();
  }
  constructor(private httpService:HttpService) { }

 getChartDataForLineChart(body: any, userId: string | null, chartDataType: string | null): Observable<any> {
    const url = `api/CreditImport/MonthlyPointsAndSalesSummaryForUserByFilter?userId=${userId || ''}&chartDataType=${chartDataType}`;
    return this.httpService.post(url, body);
}
   getdataForChartByfilter(body: any, userId: string | null,chartDataType: string = 'sales'): Observable<any> {
    const url = `api/CreditImport/PointsAndSalesSummaryForUserByFilter?userId=${userId || ''}&chartDataType=${chartDataType}`;
    return this.httpService.post(url, body);
  }
   getdataForPieChartByfilter(body: any, userId: string | null, chartDataType: string | null): Observable<any> {
    const url = `api/CreditImport/SaleByCategoryByFilter?userId=${userId || ''}&chartDataType=${chartDataType}`;
    return this.httpService.post(url, body);
  }
  getLineChartData(payload) {
    return this.httpService.post('api/CreditImport/MonthlyPointsAndSalesSummaryForUser', payload);
  }
  getPieChartData(payload) {
      return this.httpService.post('api/CreditImport/SaleByCategory', payload);
  }
  getAllCurriculum(userId) {
    return this.httpService.get('api/Course/GetAllCurriculumMasterForCourse/'+userId)
  }

  TransactionsPagination(id, typename ,request) {
    return this.httpService.post('api/Transactions/TranscationListFor/'+id +'?type='+typename,request)
   }
   
  getNotificationList(id, request) {
    return this.httpService.post('api/Notifications/GetNotificationsPaginated/'+id, request)
  }
  markRead(request) {
    return this.httpService.post('api/Notifications/BulkUpdateUnReadNotifications', request)
  }
  downloadCourseLevelImage(id){
    return this.httpService.get('api/CourseSlideMedia/GetCourseLevelImageUrl/'+id)
  }
  getAllCourseId(id) {
    return this.httpService.get('api/Course/GetCourseContentSlideQuiz/'+id)
  }

  UpdateAssignCourseStatus(request) {
    return this.httpService.post('api/LmsCourse/UpdateAssignLmsCourseStatus',request)
  }
  GetAllCourses(userId: string, language: string) {
    return this.httpService.get(`api/LmsCourse/GetAllLmsCurriculumMasterForCourse/${userId}?language=${language}`);
  }
 GetAllCourseId(id) {
  return this.httpService.get('api/Course/GetCourseContentSlideQuiz/'+id)
 
}
GetQuizDataByCourse(courseId)
{
  return this.httpService.get('api/LmsCourse/GetLmsCourseQuizQuestion/'+courseId)
}
 getCourseAssigned(couseId, userId) {
    return this.httpService.get(`api/LmsCourse/GetCourseAssigned/${couseId}/${userId}`);
  }

monthlyPointsAndSalesSummaryForUserByYearRangFilter(body: any, userId: string | null, chartDataType: string = 'sales'): Observable<any> {
    const url = `api/CreditImport/MonthlyPointsAndSalesSummaryForUserByYearRangFilter?userId=${userId || ''}&chartDataType=${chartDataType}`;
    return this.httpService.post(url, body);
}
  pointsAndSalesSummaryForUserByYearRangeFilter(body: any, userId: string | null,chartDataType: string = 'sales'): Observable<any> {
    const url = `api/CreditImport/PointsAndSalesSummaryForUserByYearRangeFilter?userId=${userId || ''}&chartDataType=${chartDataType}`;
    return this.httpService.post(url, body);
  }
  
}
