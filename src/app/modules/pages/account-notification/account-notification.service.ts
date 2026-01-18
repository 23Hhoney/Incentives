import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/HttpService';

@Injectable()
export class AccountNotificationService {

  constructor(
    private _httpClient:HttpService
  ) { }

  getNotificationList(id, request) {
    return this._httpClient.post('api/Notifications/GetNotificationsPaginated/'+id, request)
  } 

  markRead(request) {
    return this._httpClient.post('api/Notifications/BulkUpdateUnReadNotifications', request)
  }
}
