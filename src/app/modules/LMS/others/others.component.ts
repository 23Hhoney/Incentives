import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { LmsHomeService } from '../lms-home/lms-home.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingCourseManagerService } from 'app/modules/admin-panel/training-course-manager/training-course-manager.service';

@Component({
  selector: 'app-others',
  templateUrl: './others.component.html',
  styleUrls: ['./others.component.scss']
})
export class OthersComponent {

  items = [];
  CirriculumId:any
  curriculumName: any;
  userId: any;
  constructor(private fb: FormBuilder,private trainingCourseService: TrainingCourseManagerService , private service: LmsHomeService,private route: ActivatedRoute,
    private router: Router,) {
   
  }

  ngOnInit() {
    this.userId=window.sessionStorage.getItem('userId');
    this.route.paramMap.subscribe(params => {
      this.CirriculumId = params.get('id');
    });

    this.service.GetCoursebyCurriculum(this.CirriculumId,this.userId).subscribe(data => {
      if (data) {
        this.curriculumName=data[0].curriculumName;
        if (data&&data.length>0) {
          data.forEach(element => {
            element.isOpen = false
          });
        }
        this.items =data;
        this.getImageById()
      }
    });
  }
  togglePanel(item: any) {
    item.isOpen = !item.isOpen;
}
getImageById= async() => {
  await this.items.forEach((item) => {
    this.trainingCourseService.DownloadCourseLevelImage(item.courseId).subscribe((resp) => {
      item['imageUrl'] = resp.url
    })
  })  
}
}
