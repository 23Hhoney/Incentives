import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/HttpService';
import { environment } from 'environments/environment';

@Injectable()
export class ModernService {

  constructor(private httpService:HttpService) { }
  
  getPointsAndSalesSummaryCalculation(request) {
    return this.httpService.post('api/CreditImport/PointsAndSalesSummaryForUser', request);
  }
 
  UserSearch(request: any, type: number) {
    const url = `api/User/UserDashboardSearch/${environment.tentantcode}?type=${type}`;
    return this.httpService.post(url, request);
  }
  getAllCourseId(id) {
    return this.httpService.get('api/Course/GetCourseContentSlideQuiz/'+id)
  }
  UpdateSoftPermissionsforUser(request)
  {
    return this.httpService.post('api/Module/BulkCreateOrUpdateUserModuleSetting', request);
  }
  
}
