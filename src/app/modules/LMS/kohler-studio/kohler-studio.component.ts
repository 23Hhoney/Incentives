import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from 'app/shared/notification/notification';
import { KohlerStudioService } from './kohler-studio.service';

@Component({
  selector: 'app-kohler-studio',
  templateUrl: './kohler-studio.component.html',
  styleUrls: ['./kohler-studio.component.scss']
})
export class KohlerStudioComponent {
  CourseId: any;
  courses: any[] = [];
  subCourseId: any;
  SubCourseName: any;
  CourseName: any;
  masterCourseId: any;
  constructor(
    private _formBuilder: FormBuilder,private route: ActivatedRoute,
    private router: Router,
    private _notificationService: NotificationService,
    private service:KohlerStudioService
) {
}
  ngOnInit(): void {
   
      this.route.paramMap.subscribe(params => {
        this.CourseId = params.get('SubCourseId');
      });
      
    this.GetAllCourses();
    }
 
    GetAllCourses()
  {
      this.service.GetSubCourseDetail(this.CourseId).subscribe((data: any) => {
        if (data) {
           this.SubCourseName=data.curriculumMaster;
           this.CourseName=data.name;
           this.masterCourseId = data.curriculumMasterId;
        }
      })
}
    
navigateToAnotherComponent(): void {
  this.service.UpdateAssignCourseStatus({
    "courseId": this.CourseId,
    "status": "started"
  }).subscribe((resp) => {
    if(resp.isSuccess) {
      this.router.navigate(['/kohler-studio-Image-course', this.CourseId]);
    } else {
      this._notificationService.errorTopRight('Something went wrong.')
    }
  })
}
}
