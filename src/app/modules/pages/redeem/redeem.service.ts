import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/HttpService';

@Injectable()
export class RedeemService {

  constructor(private httpService:HttpService) { }


  PaymentRequestForSandBox(req) {
    return this.httpService.post('api/OnbeThirdParty/PaymentRequestForSandBox', req);
  }
  PaymentRequestForOnBe(req) {
    return this.httpService.post('api/OnbeThirdParty/PaymentRequestForOnBe', req);
  }
  SaveOrUpdateUserCardDetails(req) {
    return this.httpService.post('api/OnbeThirdParty/SaveOrUpdateUserCardDetails', req);
  }
  GetUserCardDetailsByUser(req) {
    return this.httpService.post('api/OnbeThirdParty/GetUserCardDetailsByUser', req);
  }
  GetPaymentByUser(req) {
    return this.httpService.post('api/OnbeThirdParty/GetPaymentByUser', req);
  }
}
