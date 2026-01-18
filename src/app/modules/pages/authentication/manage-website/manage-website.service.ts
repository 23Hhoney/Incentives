import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/HttpService';
import { ExportExcelService } from '../../excel-export-service.service';
import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ManageWebsiteService {

  constructor(private _httpClient:HttpService, private exportExcelService:ExportExcelService,private _httpservice: HttpClient,) { }

  GetAllCMSMenu(flag) {
    return this._httpClient.get('api/CMS/GetAllCMSMenu/'+environment.tentantcode+'?flag='+!flag)
  }
  GetAllCMSContainer(id, flag) {
    return this._httpClient.get('api/CMS/GetAllCMSContainer/'+environment.tentantcode+'/'+id+'?flag='+flag)
  }
  GetAllCMSHeader(flag) {
    return this._httpClient.get('api/CMS/GetAllCMSHeader/'+environment.tentantcode+'?flag='+flag)
  }
  SaveOrUpdateCMSMenu(req,flag) {
    return this._httpClient.post('api/CMS/SaveOrUpdateCMSMenu?flag='+!flag,req)
  }
  SaveOrUpdateCMSMenuName(req) {
    return this._httpClient.post('api/CMS/SaveOrUpdateCMSMenu?flag=false',req)
  }
  BulkSaveOrUpdateHeaderCMSMenu(req, flag) {
    return this._httpClient.post('api/CMS/BulkSaveOrUpdateHeaderCMSMenu?flag='+!flag,req)
  }
  BulkSaveOrUpdateCMSMenu(req, flag) {
    return this._httpClient.post('api/CMS/BulkSaveOrUpdateCMSMenu?flag='+!flag,req)
  }
  SaveOrUpdateCMSContainer(req) {
    return this._httpClient.post('api/CMS/SaveOrUpdateCMSContainer',req)
  }
  DeleteCMSMenu(req, id) {
    return this._httpClient.post('api/CMS/DeleteCMSPublishMenu/'+id+'/'+environment.tentantcode,req)
  }
  DraftDeleteSoft(req) {
    return this._httpClient.post('api/CMS/DraftDeleteSoft/'+environment.tentantcode,req)
  }
  RecallPublishDataInDraft(req, id, parentMenuId,isEmpty) {
    return this._httpClient.post('api/CMS/RecallPublishDataInDraft/'+environment.tentantcode+'/'+id+'/'+parentMenuId+"/"+isEmpty,req)
  }
  BulkSaveOrUpdateCMSPublishContainer(id, req, parentMenuId, isRestoreDraft = false) {
      const queryParam = isRestoreDraft ? '?IsRestoreDraft=false' : '?IsRestoreDraft=true';
      return this._httpClient.post(
          `api/CMS/BulkSaveOrUpdateCMSPublishContainer/${environment.tentantcode}/${id}/${parentMenuId}${queryParam}`,
          req
      );
  }
   ScheduleJob(id, req,parentMenuId,isRestoreDraft = false) {
          const queryParam = isRestoreDraft ? '?IsRestoreDraft=false' : '?IsRestoreDraft=true';

    return this._httpClient.post(`api/CMS/ScheduleJob/${environment.tentantcode}/${id}/${parentMenuId}${queryParam}`, req)
  }
  SaveOrUpdateCMSHeader(flag,req) {
    return this._httpClient.post('api/CMS/SaveOrUpdateCMSHeader?flag='+flag,req)
  }
  BulkSaveOrUpdateCMSContainer(req, id) {
    return this._httpClient.post('api/CMS/BulkSaveOrUpdateCMSContainer/'+environment.tentantcode+'/'+id,req)
  }
  UploadCMSContainerFile(req) {
    return this._httpClient.post('api/CMS/UploadCMSContainerFile/'+environment.tentantcode,req)
  }
  DeleteCMSContainerFile(id, containerId, req) {
    return this._httpClient.post('api/CMS/DeleteCMSContainerFile/'+environment.tentantcode+'/'+id+'/'+containerId, req)
  }
  UploadCMSTempalteFile(req) {
    return this._httpClient.post('api/CMS/UploadCMSTempalteFile/'+environment.tentantcode, req)
  }
  DeleteCMSTempalteFile(id) {
    return this._httpClient.post('api/CMS/DeleteCMSTempalteFile/'+id, {})
  }
  LikeCMSTempalteFile(req) {
    return this._httpClient.post('api/CMS/LikeCMSTempalteFile', req)
  }
  GetAllCMTempalteFile() {
    return this._httpClient.get('api/CMS/GetAllCMTempalteFile/'+environment.tentantcode)
  }
  CloneCMSMenu(flag) {
    return this._httpClient.get('api/CMS/CloneCMSMenu/'+environment.tentantcode+'?isDelete='+flag)
  }
  CheckSecretKeyValidation(id, key, status) {
    return this._httpClient.get('api/CMS/CheckSecretKeyValidation/'+id+'/'+key+'?Status='+status)
  }
  SaveOrUpdateShareLink(id, status) {
    return this._httpClient.post('api/CMS/SaveOrUpdateShareLink/'+id+'?Status='+status, {})
  }
 
  DraftDelete(req) {
    return this._httpClient.post('api/CMS/DraftDelete/'+environment.tentantcode, req)
  }
  CancelledScheduleJob(req) {
    return this._httpClient.post('api/CMS/CancelledScheduleJob', req)
  }
  GetKeyValidation(id, status) {
    return this._httpClient.get('api/CMS/GetKeyValidation/'+id+'?status='+status)
  }
  Save5drafts(value) {
    return this._httpClient.post('api/CMS/SaveAutoCMSMenu?tenantCode=flatworld&parentMenuId='+value,{})
  }
  getUseLoggedinList(){
    return this._httpClient.get('api/User/ListAdminUserLogin/'+environment.tentantcode)
  }

  SaveAutoRestoreCMSMenu() {
    return this._httpClient.post('api/CMS/SaveAutoRestoreCMSMenu?tenantCode='+environment.tentantcode, {})
  }
  CheckScheduledDraftAlreadyExists() {
    return this._httpClient.get('api/CMS/CheckScheduledDraftAlreadyExists/'+environment.tentantcode)
  }
  DeleteCMSMenuforNewMenu(menuName: string) {
    const url = `api/CMS/DeleteCMSPublishMenu/${environment.tentantcode}?menu=${menuName}`;
    return this._httpClient.post(url, {});
  }
  DownloadCourseLevelImage(id){
    return this._httpClient.get('api/CourseSlideMedia/GetLmsCourseLevelImageUrl/'+id)
  }
  getCourseAssigned(couseId, userId) {
    return this._httpClient.get(`api/LmsCourse/GetCourseAssigned/${couseId}/${userId}`);
  }

  SaveprogramrulesSection(request)
  {
    return this._httpClient.post('api/CMS/SaveSection',request)
  }

  SaveProgramrulesContainer(request)
  {
  return this._httpClient.post('api/CMS/SaveContainer',request)
  }
  SaveProgramRulesItem(request)
  {
  return this._httpClient.post('api/CMS/BulkSaveItem',request) 

  }

  DeleteContainer(request)
  {
   return this._httpClient.post('api/CMS/DeleteContainer',request) 
  }


  SaveorUpdateLockDraftPage(req)
  {
    return this._httpClient.post('api/CMS/SaveOrUpdateLockMenu',req)
  }
   SaveorUpdateLockDraftPaged(req)
  {
    return this._httpservice.post('api/CMS/SaveOrUpdateLockMenu',req)
  }

  GetLockDraftPage(id)
  {
    return this._httpClient.get('api/CMS/GetAllLockMenu/'+id)
  }
  // GetAllCMSContainer(id) {
  //   return this._httpClient.get('api/CMS/GetAllCMSContainer/Flatworld/'+id)
  // }
}
