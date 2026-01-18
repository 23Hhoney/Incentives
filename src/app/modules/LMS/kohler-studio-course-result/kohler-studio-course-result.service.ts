import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/HttpService';

@Injectable({
  providedIn: 'root'
})
export class KohlerStudioCourseResultService {

  constructor(private _httpClient:HttpService) { }

  GetUserQuizScore(userId,CourseContentSlideQuizId) {
    return this._httpClient.get('api/Course/GetUserQuizScore/'+userId +'/' + CourseContentSlideQuizId )
   
 }

 /// New LMS

 GetQuizScore(userId,CourseId) {
  return this._httpClient.get('api/LmsCourseController/GetLmsUserQuizScore/'+userId +'/' + CourseId )
 
}
AllowReTakeQuiz(userId: string, courseCopyId: string){
  return this._httpClient.get(`api/LmsCourse/AllowReTakeQuiz/${userId}/${courseCopyId}`);
}
GetLmsUserQuizScoreCheckPass(userId: string, courseCopyId: string)
{
  return this._httpClient.get(`api/LmsCourse/GetLmsUserQuizScoreCheckPass/${userId}/${courseCopyId}`);
}
GetQuizDataByCourse(courseId)
{
  return this._httpClient.get('api/LmsCourseController/GetLmsCourseQuizQuestion/'+courseId)
}
  
}
