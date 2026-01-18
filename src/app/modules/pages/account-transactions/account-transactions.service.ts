import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/HttpService';
import { ExportExcelService } from '../excel-export-service.service';

@Injectable({
  providedIn: 'root'
})
export class AccountTransactionsService {

  constructor(private _httpClient:HttpService,private exportExcelService:ExportExcelService) { }
  TransactionsPagination(id, typename ,request) {
   return this._httpClient.post('api/Transactions/TranscationListFor/'+id +'?type='+typename,request)
  }
  TransactionsView(id, typename ,request) {
    return this._httpClient.post('api/Transactions/TranscationListFor/'+id +'?type='+typename,request)
   }
  
  exportTransactionDetailsToExcel(request,flag) {
     return this._httpClient.post('api/Transactions/GetAllTranscations?flag='+flag,request)
    
  }
  CheckToLargeAllTranscations(request){
    return this._httpClient.post('api/Transactions/CheckToLargeAllTranscations',request)
  }
}
