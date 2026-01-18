import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/HttpService';

@Injectable({
  providedIn: 'root'
})
export class KohlerStudioService {

  constructor(private _httpClient:HttpService) { }
  
  GetAllCourses(userId: string, language: string) {
    return this._httpClient.get(`api/LmsCourse/GetAllLmsCurriculumMasterForCourse/${userId}?language=${language}`);
  }
 GetAllCourseId(id) {
  return this._httpClient.get('api/Course/GetCourseContentSlideQuiz/'+id)
 
}
GetAllQuestions(courseContentQuizSlideId)
{
  return this._httpClient.get('api/Course/GetCourseContentSlideQuizQuestion/'+courseContentQuizSlideId)
}
UpdateAssignCourseStatus(request) {
  return this._httpClient.post('api/LmsCourse/UpdateAssignLmsCourseStatus',request)
}
SaveBulkQuiz(request) {

  return this._httpClient.post('api/Course/BulkUserQuizScore',request)
}
GetSubCourseDetail(id)
{
  return this._httpClient.get('api/Course/GetCourseById/'+id)
}
GetQuestionByslides(courseContentQuizSlideId)
{
  return this._httpClient.get('api/Course/GetCourseContentSlideQuizQuestion/'+courseContentQuizSlideId)
}



/// New LMS
SaveUserQuiz(request)
{
  return this._httpClient.post('api/LmsCourse/BulkLmsUserQuizScore',request)
}


GetQuizDataByCourse(courseId)
{
  return this._httpClient.get('api/LmsCourseController/GetLmsCourseQuizQuestion/'+courseId)
}
GetAllLmsSlideGroupFieldsandData(SlideId)
{
 return this._httpClient.get('api/LmsSlideController/GetAllLmsSlideGroupFieldsValues/'+SlideId)
}

AllowReTakeQuiz(userId: string, courseCopyId: string){
  return this._httpClient.get(`api/LmsCourse/AllowReTakeQuiz/${userId}/${courseCopyId}`);
}
GetLmsUserQuizScoreCheckPass(userId: string, courseCopyId: string)
{
  return this._httpClient.get(`api/LmsCourse/GetLmsUserQuizScoreCheckPass/${userId}/${courseCopyId}`);
}

GetCourseLangaugeCompletedstatus(courseCopyId: string, userId: string) {
  return this._httpClient.get(`api/LmsCourse/GetCourseLangaugeCompletedstatus/${courseCopyId}/${userId}`);  
}

}
