import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/HttpService';
import { environment } from "environments/environment";
@Injectable({
  providedIn: 'root'
})
export class IncentiveAdminPanelService {

  constructor(private httpService:HttpService) { }

  UsersListforAdmin(request) {
    return this.httpService.post(`api/User/List/${environment.tentantcode}?IsAdmin=true`,request)
  }
  pointsAndSalesData(payload) {
    return this.httpService.post('api/CreditImport/MonthlyPointsAndSalesSummaryForUser', payload);
  }
  DeleteSKUFromInvoice(payload) {
    return this.httpService.post('api/CreditImport/DeleteSKUFromInvoice', payload);
  }
  SaveTaxDocumentSentByAdmin(payload) {
    return this.httpService.post('api/User/SaveTaxDocumentSentByAdmin', payload);
  }
  UsersListforUser(request) {
    return this.httpService.post(`api/User/List/${environment.tentantcode}?IsAdmin=false`,request)
  }
  GetUserByIdForExport(request)
  {
    return this.httpService.post(`api/User/GetAllUserById/${environment.tentantcode}`,request)
  }
  GetUserSession(req){
    return this.httpService.post(`GetUserSession/${environment.tentantcode}`,req)
  }
  SaveorUpdateusers(request)
  {
    return this.httpService.post('api/User/CreateOrUpdateUser/'+environment.tentantcode,request)
  }
  UpdateUser(request)
  {
    return this.httpService.post('api/User/UpdateUser/'+environment.tentantcode,request)
  }
  
  GetAllroles(isUser: boolean) {
    const url = `api/Role/GetAllRoles/${environment.tentantcode}?isUser=${isUser}`;
    return this.httpService.get(url);
  }

  getAllStates(id)
  {
    return this.httpService.get('api/Master/GetAllStateByCountryName/'+'United States')
  }

  getUserDataById(id)
  {
    return this.httpService.get('api/User/GetUserDataById/'+id+'/'+environment.tentantcode)
  }
  
  DeleteUser(request)
  {
    return this.httpService.post('api/User/DeleteUser/'+environment.tentantcode,request)
  } 

  SendNotificationsandEmail(request)
  {
    return this.httpService.post('api/Notifications/SaveOrUpdateNotifications',request)
  }

  UserCreditRewardsList(request)
  {
    return this.httpService.post(`api/Transactions/UserRewordList?type=credit`,request)
  }
  UserRedemptionRewardsList(request)
  {
    return this.httpService.post(`api/Transactions/UserRewordList?type=redemption`,request)
  }
  UserReprotLoginReport(request)
  {
    return this.httpService.post('api/Transactions/UserLoginReportList',request)
  }

  GetUserForExportall(request)
  {
   return this.httpService.post('api/User/GetAllUser/'+environment.tentantcode,request)
  }
  
  GetTransactionByTest(request)
  {
    return this.httpService.post('api/Transactions/GetReportByTranscationId',request)
  }
  BulkUploadTaxInfo(request)
  {
    return this.httpService.post('api/User/BulkSaveTaxDocumentSentByAdmin',request) 
  }
  TaxInfoFiles(id,request){
    return this.httpService.post('api/User/ListProgressTaxDocument1099Log/'+id,request)
  }

 GetUserRewardsByTypeforExport(request)
 {
  return this.httpService.post('api/Transactions/GetAllUserRewordByUserId?type=credit',request)

 } 
 GetUserReedeemByTypeforExport(request)
 {
  return this.httpService.post('api/Transactions/GetAllUserRewordByUserId?type=redemption',request)

 } 
 GetUserLoginReportByuserExport(request)
 {
  return this.httpService.post('api/Transactions/GetAllUserLoginReportByUserId',request)

 } 

 SaveBulkCustomFields(request)
 {
  return this.httpService.post('api/DynamicField/BulkSaveDynamicFields',request)
 }
 
 GetAllDynamicFields(){
  return this.httpService.get('api/DynamicField/GetAllDynamicFields')
}
DownloadCourseLevelImage(id){
  return this.httpService.get('api/Course/DownloadCourseLevelImage/'+id)
}

BulkSaveOrUpdateDynamicFieldWithValue(request)
 {
  return this.httpService.post('api/DynamicField/BulkSaveOrUpdateDynamicFieldWithValue',request)
 }
 
 GetDynamicFieldWithValueByObjectId(id){
  return this.httpService.post('api/DynamicField/GetDynamicFieldWithValueByObjectId/'+id, {})
}

ImportFileForCreditStep2(request){
  return this.httpService.post('api/CreditImport/ImportCreditFile',request)
}
SaveInvoice(request){
  return this.httpService.post('api/CreditImport/SaveOrUpdateManually',request)
}
UpdateInvoice(request){
  return this.httpService.post('api/CreditImport/UpdateManually',request)
}

CheckDuplicateSku(request)
{
  return this.httpService.post('api/SKUsList/CheckDuplicatSKU',request)
}


ImportHistoryPaginated(request)
{
  return this.httpService.post('api/ImportHistory/List',request)
}
UpdateNotificationMsg(request)
{
  return this.httpService.post('api/Notifications/UpdateNotificationMsg',request)
}
ExportRequestList(request) {
  return this.httpService.post('api/Export/ExportRequestList',request)
}

ValidateImportFileForCredit(request) {
  return this.httpService.post('api/CreditImport/ValidateCreditFile',request) 
}
ValidateUserEmails(request) {
  return this.httpService.post('api/Notifications/ValidateUserEmails',request) 
}
exportUser(request) {
  return this.httpService.post('api/Export/ExportUserObject',request) 
}
UserPushReports(request) {
  return this.httpService.post('api/Export/UserPushReports',request) 
}
SaveOrUpdateProgramConfiguration(request) {
  return this.httpService.post('api/ProgramConfiguration/SaveOrUpdateProgramConfiguration', request)
}
ProgramConfigurationList(request) {
  return this.httpService.post('api/ProgramConfiguration/List', request)
}
SaveOrUpdateMilestone(request) {
  return this.httpService.post('api/ProgramConfiguration/SaveOrUpdateMilestone', request)
}
ListPointCreditManager(request) {
  return this.httpService.post('api/CreditImport/ListPointCreditManager', request)
}
SaveOrUpdateBulkNotifications(request) {
  return this.httpService.post('api/Notifications/SaveOrUpdateBulkNotifications',request) 
}
GetAllUserColumn() {
  return this.httpService.get('api/User/GetAllUserColumn/'+environment.tentantcode)
}

DownloadImportData(FileId){
  return this.httpService.getFile('api/ImportHistory/DownloadImportHistoryFile/'+FileId)
}
DownloadQueueData(FileId){
  return this.httpService.getFile('api/ImportHistory/DownloadExportHistoryFile/'+FileId)
}
DownloadBulkUpdateData(FileId){
  return this.httpService.getFile('api/ImportHistory/DownloadImportHistoryFile/'+FileId)
}

resetLinkPassword(request){
  return this.httpService.post('ForgotPassword',request)
}
DeleteDynamicField(id,request){
  return this.httpService.post('api/DynamicField/DeleteDynamicField/'+id,request)
}
GetProgramConfiguration() {
  return this.httpService.get('api/ProgramConfiguration/GetProgramConfiguration')
}
GetUserExportById(request)
{
  return this.httpService.post('api/User/GetAllUserById/'+environment.tentantcode,request)
}

DynamicFieldShowHide(request){
  return this.httpService.post('api/DynamicField/SoftDeleteDynamicField',request)
}

SetTemporaryPassword(request){
  return this.httpService.post('SetTemporaryPassword',request)
}
BulkUpdate(request, isAll: boolean) {
  const url = `api/Notifications/BulkSaveOrUpdateNotifications?IsAll=${isAll}`;
  return this.httpService.post(url, request);
}

exportLoginReport(request){
  return this.httpService.post('api/Export/ExportUserLoginObject',request)
}
exportPointCreditReport(request)
{
  return this.httpService.post('api/Export/ExportPointCreditObject',request)
}

GetUserById(request)
{
  return this.httpService.post('api/User/GetUserByUserId/'+environment.tentantcode,request)
}

GetAllModules()
{
  return this.httpService.get('api/Module/GetAllModuleMaster')
}
GetModulerPermissionAccessByRoleId(roleId) {
  return this.httpService.get('api/Module/GetModulerPermissionAccessByRoleId/'+roleId)
}
getPermissionsByUserId(request){ 
  return this.httpService.post('api/Module/GetUserModulePermissionByUserId',request);
}
BulkCreateOrUpdateModulerPermissionAccess(requestObj) {
  return this.httpService.post('api/Module/BulkCreateOrUpdateModulerPermissionAccess', requestObj)
}
DownloadReportforOldRoles(id,request)
{
  return this.httpService.post('api/Module/GetAllRolesByRoleId/'+id,request)
}

PermissionsForRoleandUser(id) {
  return this.httpService.get('api/Module/GetAlreadyModulerPermissionAccessByRoleId/'+id)
}

exportOrderRedemption(request)
{
  return this.httpService.post('api/Export/ExportOrderRedemptionObject',request)
}

getSkuDetailsViaInvoiceNumber(request)
{
  return this.httpService.post('api/CreditImport/SKUsListViaInvoice',request)
}

getDetailsViaSku(request){
  return this.httpService.post('api/SKUsList/SelectedSKUListDateInterval',request)
}

getAllSku()
{
  return this.httpService.get('api/CreditImport/AllSKUsData')
}
getProgramConfigruationdata()
{
  return this.httpService.get('api/CourseSlideMedia/GetProgramConfigurationByTenantCode/'+environment.tentantcode)
}
getSkuListWithPagination(request)
{
  return this.httpService.post('api/CreditImport/GetAllSKUsData',request)
}
DeleteSku(request)
{
  return this.httpService.post('api/CreditImport/DeleteInvoiceCascadeBySKU',request)

}
UpdateSoftPermissionsforUser(request)
{
  return this.httpService.post('api/Module/BulkCreateOrUpdateUserModuleSetting', request);
}


GetRoleIdbyName(role: string) {
  const tenantCode = environment.tentantcode;
  const url = `api/Role/GetRoleByName/${tenantCode}?role=${role}`;
  return this.httpService.get(url);
}

SaveGoogleAnalytics(request)
{
  return this.httpService.post('api/ProgramConfiguration/UpdateProgramConfiguration',request)
}

SendNotificationforCollectTax(request)
{
  return this.httpService.post('api/Notifications/BulkSaveNotificationsCollectTaxForms',request)
}

getUserCourseReport(userId) {
  return this.httpService.post(`api/Course/GetCourseReport/${userId}`, {});
}

getUserTaxFileByYear(payload) {
  return this.httpService.post(`api/User/UserTaxFilesByYearDropDown`, payload);
}

GetUserNotificationRequiredCourses(userId) {
  return this.httpService.get(`api/Notifications/RequiredCoursesNotifications/${userId}`);
}

VerifyDocumentwithoutFile(userId)
{
  return this.httpService.get(`api/User/VerifyDocumentwithoutFile/${userId}`)
}

DeletePointsCreditData(request)
{
  return this.httpService.post('api/CreditImport/DeleteInvoiceCascade',request)
}
GetProgressTaxDocument1099(request)
  {
    return this.httpService.post('api/User/ListProgressTaxDocument1099',request)
  }
getUserFilterSettings() {
  return [
    {
      label: 'Name',
      type: "text",
      oid: "name"
    },
    {
      label: 'Email',
      type: "text",
      oid: "email"
    },
    {
      label: "City",
      type: "text",
      oid: "city"
    },
    {
      label: 'Organization',
      type: "text",
      oid: "organization"
    },
    {
      label: 'Status',
      type: "dropdown",  // Changed from 'text' to 'dropdown'
      oid: "eligibleStatus",
      fieldOptions: [    // Added available status options
        { id: 'Active', value: 'Active' },
        { id: 'Inactive', value: 'Inactive' },
        { id: 'Suspended', value: 'Suspended' }
      ]
    },
    {
      label: "W9 Status",
      type: "text",
      oid: "w9status"
    },
    {
      label: "Total List Price",
      type: "range",
      oid: "salestotal",
    },
    {
      label: "Point Balance",
      type: "range",
      oid: "pointbalance",
    }
  ];

}
getUserFilterSettingsForAdmin() {
  return [
    {
      label: 'Name',
      type: "text",
      oid: "name"
    },
    {
      label: 'Email',
      type: "text",
      oid: "email"
    },

    {
      label: 'Status',
      type: "dropdown",  // Changed from 'text' to 'dropdown'
      oid: "eligibleStatus",
      fieldOptions: [    // Added available status options
        { id: 'Active', value: 'Active' },
        { id: 'Inactive', value: 'Inactive' },
        { id: 'Suspended', value: 'Suspended' }
      ]
    },
   
  ];

}
}
