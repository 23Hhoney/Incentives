import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/HttpService';
import { environment } from "environments/environment";

@Injectable({
  providedIn: 'root'
})
export class TrainingCourseManagerService {

  constructor(private httpService:HttpService) { }

  GetAllCiriculum(language)
  {
    return this.httpService.get('api/Course/GetAllCurriculumMaster?language='+language)
  }
  GetAllCourses()
  {
    return this.httpService.get('api/Course/GetAllCourses')
  }
  SaveOrUpdateCourse(request)
  {
    return this.httpService.post('api/Course/SaveOrUpdateCourse',request)
  }
  DeleteQuestion(request) {
    return this.httpService.post('api/Course/DeleteQuestion',request)
  }
  Getallcourses(request, tab)
  {
    return this.httpService.post('api/Course/TrainingCoursesList?flag='+tab,request)
  }
  deleteSlide(id)
  {
    return this.httpService.post('api/Course/DeleteCourseContentSlide',{id: id})
  }
  GetCourseDetail(id)
{
  return this.httpService.get('api/Course/GetCourseById/'+id)

}   
DownloadCourseLevelImage(id){
  return this.httpService.get('api/CourseSlideMedia/GetLmsCourseLevelImageUrl/'+id)
}

SaveOrUpdateSlide(request)

{
  return this.httpService.post('api/Course/SaveOrUpdateCourseContentSlide',request)
}
UpdateCourseSlide(request) {
  return this.httpService.post('api/Course/UpdateCourseSlide',request)
}
Getallslides(id)
{
  return this.httpService.get('api/Course/GetAllSlideForCourseContent/'+id)
}
GetallslidesData(id: string, language: string) {
  return this.httpService.get(`api/LmsSlideController/GetAllLmsSlideData/${id}?language=${language}`);
}
getSlidesFromCourseId(courseId){
  return this.httpService.get('api/LmsSlide/GetAllLmsSlideByCourseId/'+courseId)
}
SaveorUpdateCourseVideo(request)
{
  return this.httpService.post('api/Course/SaveorUpdateMediaForContentSlide',request) 
}
  
CourseQuizSlideSave(request)
{
  return this.httpService.post('api/Course/SaveOrUpdateCourseContentSlideQuiz',request)

}
GetSlideMediaContent(CourseId,selectedSlideId)
{
  return this.httpService.get('api/Course/GetContentMediaDetail/'+ CourseId +'/'+ selectedSlideId)
}
GetSlideVideoUrl(ContentId)
{
  return this.httpService.get('api/CourseSlideMedia/GetMediaUrl/'+ ContentId)
}
SaveorupdateSlideQuiz(request)
{
  return this.httpService.post('api/Course/SaveOrUpdateCourseContentSlideQuiz',request)
}
SaveorupdateSlideQuizQuestions(request)
{
  return this.httpService.post('api/Course/BulkSaveCourseContentSlideQuizQuestion',request)
}

 GetQuizSlideContent(CourseId,courseContentSlideId)
 {
  return this.httpService.get('api/Course/CourseContentSlideQuiz/'+ CourseId +'/'+ courseContentSlideId)
 }

 GetSlideQuizQuestions(courseContentQuizSlideId)
 {
  return this.httpService.get('api/Course/GetCourseContentSlideQuizQuestion/'+ courseContentQuizSlideId)
 }

 CourseDelete(id,request)
 {
  return this.httpService.post('api/Course/DeleteCourse/'+id,request)

 }
 CourseArchive(id,status) {
  return this.httpService.post('api/Course/UpdateCourseStatus',{ id, status: status.toLowerCase() === 'archive' ? false : true })
 }

 GetUserListforDropdown()
 {
  return this.httpService.get('api/User/GetAllUsersByRoleUser/'+environment.tentantcode)
 }

 DownloadGradeBookData(payload) {
  return this.httpService.post('api/Course/GradeBookData', payload)
 }
 AutomaticallyPassCourseForBpNumberFun(Payload , CourseID) {
  const url = `api/Course/AutomaticallyPassCourseForUserID?CourseID=${CourseID}`;
  return this.httpService.post(url, Payload);
}

CheckDuplicateArchieveCourse(payload) {
  return this.httpService.post('api/Course/ReactivateCourse', payload)
 }
 GetAllLanguages()
 {
   return this.httpService.get('api/Course/GetAllLanguages')
 }
 
 CopyCourses(CourseCopyId)
 {
   return this.httpService.post('api/Course/CopyCourses/'+CourseCopyId,{})
 }

 GetAllLmsSlideGroupFieldsandData(SlideId)
 {
  return this.httpService.get('api/LmsSlide/GetAllLmsSlideGroupFieldsValues/'+SlideId)
 }

 GetLanguage(){
  
    return this.httpService.post('api/LmsCourse/GetAllLanguage', {})
  
 }
}