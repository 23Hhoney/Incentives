import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/HttpService';

@Injectable({
  providedIn: 'root'
})
export class LmsHomeService {

  constructor(private httpService:HttpService) { }

  GetAllCiriculum(request, userId)
  {
    return this.httpService.post('api/Course/CurriculumListByUserId/'+userId,request)
  }
  GetCoursebyCurriculum(curriculumId,userId)
  {
   return this.httpService.get('api/Course/GetCourseForCurriculum/'+curriculumId +'/'+ userId)
  }
 
}
