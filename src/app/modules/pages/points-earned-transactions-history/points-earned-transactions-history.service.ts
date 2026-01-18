import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/HttpService';

@Injectable({
  providedIn: 'root'
})
export class PointsEarnedTransactionsHistoryService {

  constructor(private _httpService: HttpService) { }
  getTransactionListByUser(payload, bpNumber) {
    return this._httpService.post(`api/Transactions/TranscationListByUser/${bpNumber}`, payload);
  }
  getRedeemTransactionListByUser(payload, bpNumber) {
    return this._httpService.post(`api/Transactions/TranscationListRedeemByUser/${bpNumber}`, payload);
  }
}
