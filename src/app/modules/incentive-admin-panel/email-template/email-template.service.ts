import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/HttpService';

@Injectable({
  providedIn: 'root'
})
export class EmailTemplateService {

  constructor(private httpService:HttpService) { }

  EmailTemplateList(request) {
    return this.httpService.post('api/EmailTemplate/List', request) 
   }
   GetEmailTemplateDetails(id){
    return this.httpService.get('api/EmailTemplate/GetEmailTemplate/'+id)
   }
   UpdateEmailTemplate(request)
   {
    return this.httpService.post('api/EmailTemplate/SaveOrUpdateEmailTemplate', request) 
   }
   GetTemplateDetails(id){
    return this.httpService.get('api/EmailTemplate/ViewEmailTemplate/'+id)
   }
   
}
