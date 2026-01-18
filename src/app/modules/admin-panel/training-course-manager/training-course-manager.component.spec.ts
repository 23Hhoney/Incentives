import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingCourseManagerComponent } from './training-course-manager.component';

describe('TrainingCourseManagerComponent', () => {
  let component: TrainingCourseManagerComponent;
  let fixture: ComponentFixture<TrainingCourseManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainingCourseManagerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingCourseManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
