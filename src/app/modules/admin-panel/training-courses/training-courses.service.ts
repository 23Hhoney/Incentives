import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/HttpService';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrainingCoursesService {

  constructor(private httpService:HttpService) { }

  SaveOrUpdateCourse(request: FormData, isUpdateUser: boolean = false) {
    const url = isUpdateUser 
      ? 'api/LmsCourse/SaveOrUpdateLmsCourse?IsUpdateUser=true'
      : 'api/LmsCourse/SaveOrUpdateLmsCourse';
    
    return this.httpService.post(url, request);
  }

  GetCoursesPaginated(request, tab)
  {
    return this.httpService.post('api/LmsCourse/TrainingLmsCoursesList?flag='+tab,request)
  }

   CourseArchive(apiRequest) {
    return this.httpService.post('api/LmsCourse/UpdateLmsCourseStatus', apiRequest);
   }
  
   GetUserListforDropdown()
   {
    return this.httpService.get('api/User/GetAllUsersByRoleUser/'+environment.tentantcode)
   }
  
   DownloadGradeBookData(payload) {
    return this.httpService.post('api/LmsCourse/LmsGradeBookData', payload)
   }

   /// New API needed
   AutomaticallyPassCourseForBpNumberFun(Payload , CourseID) {
    const url = `api/Course/AutomaticallyPassCourseForUserID?CourseID=${CourseID}`;
    return this.httpService.post(url, Payload);
  }
  GetAllCourses()
  {
    return this.httpService.get('api/Course/GetAllCourses')
  }
  GetAllActiveCourse()
  {
    return this.httpService.get('api/LmsCourse/GetAllActiveCourse')
  }
  CourseCheckForLanguageForDropDown(payload)
  {
    return this.httpService.post('api/LmsCourse/GetAllLmsCurriculumMasterAssigned', payload)
  }

  CheckQuetionsForQuiz(CourseId,request){
    return this.httpService.post('api/LmsCourse/CheckNumberOfQuiz/'+CourseId,request)
  }
  DeletequestionOption(request)
  {
    return this.httpService.post('api/LmsCourse/DeleteLmsQuizQuestionOption',request)
  }
  
  ////New API needed

  
   GetAllLanguages()
   {
     return this.httpService.post('api/LmsCourse/GetAllLanguage',{})
   }
   CopyCourses(CourseCopyId)
   {
     return this.httpService.post('api/LmsCourse/CopyLmsCourses',CourseCopyId)
   }
   GetallCurriculum(language)
   {
    return this.httpService.get('api/LmsCourse/GetAllLmsCurriculumMaster?language='+language)
  }

  GetAllCiriculum(language)
  {
    return this.httpService.get('api/LmsCourse/GetAllLmsCurriculumMaster?language='+language)
  }
  GetCourseDetail(id: string, selectedLanguage: string) {
    return this.httpService.get('api/LmsCourse/GetLmsCourseByCourseCopyId/' + id + '?language=' + selectedLanguage);
  }
    
  DownloadCourseLevelImage(id){
    return this.httpService.get('api/CourseSlideMedia/GetLmsCourseLevelImageUrl/'+id)
  }
  GetQuizDataByCourseId(courseId){
    return this.httpService.get('api/LmsCourse/GetLmsCourseQuizQuestion/'+courseId)
  }
  saveQuizData(request)
  {
    return this.httpService.post('api/LmsCourse/BulkSaveLmsCourseQuizQuestion',request)
  }
  CheckDuplicateArchieveCourse(payload) {
    return this.httpService.post('api/LmsCourse/ReactivateLmsCourse', payload)
   }

   // Slides

   SaveOrUpdateSlides(request: any, isEdit: boolean = false) {
    const url = `api/LmsSlide/SaveOrUpdateLmsSlide?IsEdit=${isEdit}`;
    return this.httpService.post(url, request);
  }
  
   getSlidesFromCourseId(courseId){
    return this.httpService.get('api/LmsSlide/GetAllLmsSlideByCourseId/'+courseId)
  }
  DeleteSlides(request,id)
  {
    return this.httpService.post('api/LmsSlide/DeleteLmsSlide/'+id,request)
  }
  reorderSlides(request)
  {
    return this.httpService.post('api/LmsSlide/UpdateLmsSlideForReArrange',request)
  }
  reorderBulkSlides(request)
  {
    return this.httpService.post('api/LmsSlide/BulkUpdateLmsSlideForReArrange',request)
  }
  // Dynamic Field//
  AddDynamicField(request)
  {
    return this.httpService.post('api/LmsSlide/AddLmsSlideGroupFields',request)
  }

  //Dynamic Field New API 
  AddDynamicFieldWithValue(request, isEdit: boolean = false) {
    return this.httpService.post(`api/LmsSlide/AddLmsSlideGroupFieldsWithValues?IsEdit=${isEdit}`, request)
}

  DeleteDynamicField(request){
    return this.httpService.post('api/LmsSlide/DeleteLmsSlideField',request)
  }
  
  UploadVideoAndAudioInSlide(request, isEdit: boolean = false) {
    return this.httpService.post(`api/LmsSlide/UploadLmsSlideFile?IsEdit=${isEdit}`, request)
}

  GetSlideGroupField(SlideId,request)
  {
    return this.httpService.post('api/LmsSlide/GetAllSlideGroupFields/'+SlideId,request)
  }
  DeleteVideoOrAudiofromSlide(request)
  {
    return this.httpService.post('api/LmsSlide/DeleteLmsSlideFile',request)
  }
  ValidateAutoPassTrainingCoursesFile(request) {
    return this.httpService.post('api/LmsCourse/ValidateAutoPassTrainingCoursesFile',request) 
  }
  ImportAutoPassTrainingCoursesFile(request) {
    return this.httpService.post('api/LmsCourse/ImportAutoPassTrainingCoursesFile',request) 
  }
   GetAllLmsSlideGroupFieldsandData(SlideId)
   {
    return this.httpService.get('api/LmsSlide/GetAllLmsSlideGroupFieldsValues/'+SlideId)
   }
   DownloadBulkUpdateData(FileId){
    return this.httpService.getFile('api/ImportHistory/DownloadImportHistoryFile/'+FileId)
  }
  AddFieldValues(request, isEdit: boolean = false) {
    return this.httpService.post(`api/LmsSlide/AddLmsSlideGroupFieldsValues?IsEdit=${isEdit}`, request)
}
   GetLmsCourseQuizQuestionBy(copycourseId,language)
   {
    return this.httpService.get('api/LmsCourse/GetLmsCourseQuizQuestionBy/'+copycourseId+"?langauge="+language)
   }
   GetAllLmsSlideDataByLanguage(copycourseId,language)
   {
    return this.httpService.get('api/LmsSlide/GetAllLmsSlideDataByLanguage/'+copycourseId+"?language="+language)
   }
   ImportHistoryPaginated(request)
{
  return this.httpService.post('api/ImportHistory/List',request)
}

DeleteFromAlternateLanguageSlides(slideId: string, language: string) {
  const request = {
    slideId: slideId,
    language: language
  };
  return this.httpService.post(`api/LmsSlide/DeleteLmsSlideByIgnoreLang/${slideId}?language=${language}`, request);
}
DeleteLmsSlideAll(languageSlideId: string) {
  return this.httpService.post(`api/LmsSlide/DeleteLmsSlideAll/${languageSlideId}`, {});
}

SaveorUpdateImage(request, isEdit: boolean = false) {
  return this.httpService.post(`api/LmsSlide/UploadLmsSlideContentFiles?IsEdit=${isEdit}`, request)
}

// Quiz Validations

QuizQuestionsChecking(request,CourseId)
{
  this.httpService.post('api/LmsCourse/CheckNumberOfQuiz/'+ CourseId ,request)
}
deleteQuizQuestion(request)
{
  return this.httpService.post('api/LmsCourse/DeleteLmsQuizQuestion',request)
}
DeleteMultipleQuestion(request)
{
  return this.httpService.post('api/LmsCourse/DeleteLmsQuizQuestionForLanguage',request)
}

Deleteoption(request)
{
  return this.httpService.post('api/LmsCourse/DeleteLmsQuizQuestionOption',request)
}

GetQuizDataByCourse(courseId)
{
  return this.httpService.get('api/LmsCourse/GetLmsCourseQuizQuestion/'+courseId)
}
GetallslidesData(id: string, language: string) {
  return this.httpService.get(`api/LmsSlideController/GetAllLmsSlideData/${id}?language=${language}`);
}
DeleteImage(request)
{
  return this.httpService.post('api/LmsSlide/DeleteLmsSlideContentFiles',request)
}
GetAllLmsCurriculumMasterAssigned(request)
  {
    return this.httpService.post('api/LmsCourse/GetAllLmsCurriculumMasterAssignedWarning',request)
  }
  getAllCourseLanguages(couseCopyId: string) {
    return this.httpService.get(`api/LmsCourse/GetAllCourseLanguages/${couseCopyId}`);
  }

getUserFilterSettingsForAdmin() {
  return [
    {
      label: 'Curriculum',
      type: "texts",
      oid: "curriculum"
    },
    {
      label: 'Required',
      type: "toggle", 
      oid: "requiredStr",
      fieldOptions: [
        { value: 'Yes', id: 'Yes' },
        { value: 'No', id: 'No' }
      ]
    }
  ];
}

helper =  {
  tab :"Active"
}
updateTab(value: string) {
      this.helper.tab = value;
  }
}
