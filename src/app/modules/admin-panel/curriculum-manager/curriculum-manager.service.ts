import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/HttpService';

@Injectable({
  providedIn: 'root'
})
export class CurriculumManagerService {

  constructor(private httpService:HttpService) { }
  
  // CurriculumList(request)
  // {
  //   return this.httpService.post('api/Course/CurriculumList',request)
  // }
  
  CurriculumList(request, tab)
  {
    return this.httpService.post('api/Course/CurriculumList?flag='+tab,request)
  }

  SaveOrUpdateCirriculumManager(request)
  {
    return this.httpService.post('api/Curriculum/SaveAndUpdateCurriculum',request)
  }
  DeleteCirriculum(request){
    return this.httpService.post('api/Curriculum/DeleteCurriculum',request)
  } 
  GetCirriculumById(id)
  {
    return this.httpService.get('api/Curriculum/GetCirriculumById/'+id)
  }
  GetAllLanguages()
  {
    return this.httpService.get('api/Course/GetAllLanguages')
  }
  
GetCirriculumByCurriculumCopyId(id,language)
  {
    return this.httpService.get('api/Curriculum/GetCirriculumByCurriculumCopyId/'+id+'?language='+language)
  }
}
