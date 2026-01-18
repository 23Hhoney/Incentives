import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/HttpService';

@Injectable()
export class SkuImportService {

  constructor(private httpService:HttpService) { }

  /* UsersListforAdmin(request) {
    return this.httpService.post(`api/User/List/${environment.tentantcode}?IsAdmin=true`,request)
   
  }
  UsersListforUser(request) {
    return this.httpService.post(`api/User/List/${environment.tentantcode}?IsAdmin=false`,request)
   
  } */

    downloadTemplate() {
      return this.httpService.getFile('api/SKUsList/Template')
    }

    downloadTemplateforUpdate() {
      return this.httpService.getFile('api/SKUsList/UpdateTemplate')
    }
    
    validateImportFileForSKUListManager(request) {
      return this.httpService.post('api/SKUsList/ValidateSKUListFile', request) 
    }

    validateUpdateFileForSKUListManager(request) {
      return this.httpService.post('api/SKUsList/ValidateUpdateSKUListFile', request) 
    }
    uploadSKUFile(formdata) {
      return this.httpService.post('api/SKUsList/Imports', formdata)
    }

    uploadBulkUpdateSKUFile(formdata) {
      return this.httpService.post('api/SKUsList/UpdateImport', formdata)
    }

    getSKUList(payload) {
      return this.httpService.post('api/SKUsList/ListAndFilter', payload)
    }

    exportAllCurrentperiodSKU(payload) {
      return this.httpService.post('api/SKUsList/selectDatePeriodSKUList', payload);
    }

    downloadImportData(fileId) {
      return this.httpService.getFile('api/ImportHistory/DownloadImportHistoryFile/'+fileId);
    }

    downloadErrorImportData(fileId) {
      return this.httpService.getFile('api/ImportHistory/DownloadImportHistoryErrorFile/'+fileId);
    }
    
    addSaveSKU(payload) {
      return this.httpService.post('api/SKUsList/SaveOrUpdateSKUList', payload);
    }

    deleteSKU(payload) {
      return this.httpService.post('api/SKUsList/DeleteSKUList', payload);
    }

    exportSelectedSKUs(payload, isAll: boolean) {
      const url = `api/SKUsList/SelectedSKUList?IsAll=${isAll}`;
      return this.httpService.post(url, payload);
    }
  
}
