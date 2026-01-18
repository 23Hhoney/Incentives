import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/HttpService';

@Injectable()
export class MyAccountService {

    constructor(private httpService:HttpService) { }
    getAccountStatus(payload) {
        return this.httpService.post('api/CreditImport/GetUserStatusViaPoints', payload);
    }

    getUserCourseCompleted(payload) {
        return this.httpService.post('api/LmsCourse/GetUserLmsCourseCompleted', payload);
    }

    getNotificationList(id, payload) {
        return this.httpService.post('api/Notifications/GetNotificationsPaginated/'+id, payload)
    }

    getProfileImage(id) {
        return this.httpService.getFile('api/CourseSlideMedia/GetUserProfileImage/'+id)
    }

    setProfielImage(formdata) {
        return this.httpService.post('api/User/SaveOrUpdateUserProfilePicture', formdata)
    }

    getUserProfileInfo(userId, tenantId) {
        return this.httpService.get(`api/User/GetUserById/${userId}/${tenantId}`)
    }
    
    updateUserProfileInfo(tenantId, payload) {
        return this.httpService.post(`api/User/UpdateUserProfiles/${tenantId}`, payload);
    }

    getUserTaxInformation() {
        return this.httpService.get(`api/User/ListTaxDocument`);
    }

    saveUserTaxDocument(formData, year) {
        return this.httpService.post(`api/User/EmailTaxDocument/${year}`, formData);
    }

    deleteTaxInformation(payload) {
        return this.httpService.post('api/User/DeleteUserTaxDocument', payload)
    }

    listTaxDocumentSentByAdmin(userId, payload) {
        return this.httpService.post(`api/User/ListTaxDocumentSentByAdmin/?userId=${userId}`, payload)
    }
}

