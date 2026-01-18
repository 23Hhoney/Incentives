import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/HttpService';

@Injectable()
export class RedeemNeoService {

  constructor(private httpService:HttpService) {}
  CreateOrderForNeoCurrency(req) {
    return this.httpService.post('api/NeoCurrency/CreateOrderForNeoCurrency', req);
  }
}
