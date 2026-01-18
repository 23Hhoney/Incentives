import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/HttpService';

@Injectable()
export class ContactUsService {

  constructor(private httpService:HttpService) { }

    contactUs(payload) {
      return this.httpService.post('FeedbackEmailwithFile', payload);
    }
}
