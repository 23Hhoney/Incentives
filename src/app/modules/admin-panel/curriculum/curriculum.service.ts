import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/HttpService';

@Injectable({
  providedIn: 'root'
})
export class CurriculumService {

  constructor(private httpService:HttpService) { }

  
  CurriculumList(request, tab)
  {
    return this.httpService.post('api/LmsCourse/LmsCurriculumList?flag='+tab,request)
  }
  SaveOrUpdateCirriculumManager(request)
  {
    return this.httpService.post('api/LmsCourse/SaveAndUpdateLmsCurriculum',request)
  }
  GetAllLanguages()
  {
    return this.httpService.post('api/LmsCourse/GetAllLanguage',{})
  }
  
GetCirriculumByCurriculumCopyId(id,language)
  {
    return this.httpService.get('api/LmsCourse/GetLmsCirriculumByCurriculumCopyId/'+id+'?language='+language)
  }
  BulkSaveAndUpdateLmsCurriculum(request)
  {
    return this.httpService.post('api/LmsCourse/BulkSaveAndUpdateLmsCurriculum',request)
  }
  CheckLmsCurriculumnInactiveWithCourse(request)
  {
    return this.httpService.post('api/LmsCourse/CheckLmsCurriculumnInactiveWithCourse',request)
  }
  LmsCurriculumnInactiveWithCourse(request)
  {
    return this.httpService.post('api/LmsCourse/LmsCurriculumnInactiveWithCourse',request)
  }
}
