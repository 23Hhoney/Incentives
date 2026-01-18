import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingCoursesEditAddComponent } from './training-courses-edit-add.component';

describe('TrainingCoursesEditAddComponent', () => {
  let component: TrainingCoursesEditAddComponent;
  let fixture: ComponentFixture<TrainingCoursesEditAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainingCoursesEditAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingCoursesEditAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
