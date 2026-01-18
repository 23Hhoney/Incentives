import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/HttpService';

@Injectable()
export class OrderRedemptionService {

  constructor(private httpService:HttpService) { }
    addNewOrder(payload) {
      return this.httpService.post('api/OrderRedemption/SaveOrUpdate', payload);
    }
    listAndFilter(payload) {
      return this.httpService.post('api/OrderRedemption/ListAndFilter', payload);
    }
    ValidateBulkRedemptionFile(request) {
      return this.httpService.post('api/OrderRedemption/ValidateOrderRedeemptionFile',request) 
    }
    ValidateUpdateOrderRedeemptionFile(request) {
      return this.httpService.post('api/OrderRedemption/ValidateUpdateOrderRedeemptionFile',request) 
    }
    ImportOrderRedeemptionFile(request) {
      return this.httpService.post('api/OrderRedemption/ImportOrderRedeemptionFile',request) 
    }
    UpdateOrderRedeemptionFile(request) {
      return this.httpService.post('api/OrderRedemption/UpdateOrderRedeemptionFile',request) 
    }
    SaveOrUpdate(request) {
      return this.httpService.post('api/OrderRedemption/SaveOrUpdate',request) 
    }
    getAllStates(id) {
      return this.httpService.get('api/Master/GetAllStateByCountryName/'+'United States')
    }
    checkPointsBalance(request)
    {
      return this.httpService.post('api/OrderRedemption/CheckPointBalance',request) 
    }
   
}
