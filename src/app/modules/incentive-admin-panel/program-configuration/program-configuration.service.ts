import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/HttpService';

@Injectable()
export class ProgramConfigurationService {

  constructor(private httpService:HttpService) { }
    validateUserTaxFile(request) {
        return this.httpService.post('api/User/ValidateUserTaxFile', request) 
    }
    processExcelforEmail(formdata) {
        return this.httpService.post('api/User/ProcessExcelforEmail', formdata)
    }
    downloadImportData(fileId) {
        return this.httpService.getFile('api/ImportHistory/DownloadImportHistoryFile/'+fileId);
    }
}
