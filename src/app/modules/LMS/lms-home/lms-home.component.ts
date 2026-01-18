import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { LmsHomeService } from './lms-home.service';

@Component({
  selector: 'app-lms-home',
  templateUrl: './lms-home.component.html',
  styleUrls: ['./lms-home.component.scss']
})
export class LmsHomeComponent {
  slides = [
    {'image': 'assets/images/hero_slide.jpg'}, 
    {'image': 'assets/images/hero_slide.jpg'},
    {'image': 'assets/images/hero_slide.jpg'}, 
  ];
  images = [
    'assets/images/hero_slide.jpg',
    'assets/images/hero_slide.jpg',
    'assets/images/hero_slide.jpg'
  ];
  curriculums: any[] = [];
  currentIndex = 0;
  userId = '';
  apiRequest = {
    itemCount:7,
    pageIndex: 1,
    pageLimit: 6,
    sortBy: "name",
    search: "",
    sortDirection: "desc",
    filter: []
  };
  loading=false;
  constructor(private fb: FormBuilder, private service: LmsHomeService) { // Inject your service here
   
  }

  ngOnInit() {
    this.userId = window.sessionStorage.getItem('userId');
    this.service.GetAllCiriculum(this.apiRequest, this.userId).subscribe(data => {
      if (data && data.results) {
        this.curriculums = data.results;
      }
    });
  }

  getTransform() {
    return `translateX(-${this.currentIndex * 100}%)`;
  }

  GetCiriculumdata(){
    this.curriculums=[];
    this.loading=true;
    this.service.GetAllCiriculum(this.apiRequest, this.userId).subscribe(data => {
      if (data && data.results) {
        this.curriculums = data.results;
      }
    });
    this.loading=false;
  }
  
  // RoutetoNavigate()
  // {
  //   this.router.navigate(['/others']);
  // }

}
