import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/HttpService';

@Injectable()
export class SendMessageService {

  constructor(private httpService:HttpService) { }

    getUserMessageDetails(id, payload) {
      return this.httpService.post(`api/Notifications/GetMsgUserDetails/${id}`, payload);
    }
    deleteSendMessage(payload) {
      return this.httpService.post(`api/ImportHistory/DeleteMessageForSend`, payload);
    }
}
