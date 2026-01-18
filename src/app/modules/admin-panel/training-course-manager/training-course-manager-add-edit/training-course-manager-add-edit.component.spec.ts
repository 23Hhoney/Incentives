import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingCourseManagerAddEditComponent } from './training-course-manager-add-edit.component';

describe('TrainingCourseManagerAddEditComponent', () => {
  let component: TrainingCourseManagerAddEditComponent;
  let fixture: ComponentFixture<TrainingCourseManagerAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainingCourseManagerAddEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingCourseManagerAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
