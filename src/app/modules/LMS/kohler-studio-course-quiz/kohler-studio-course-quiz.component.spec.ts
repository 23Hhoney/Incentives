import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KohlerStudioCourseQuizComponent } from './kohler-studio-course-quiz.component';

describe('KohlerStudioCourseQuizComponent', () => {
  let component: KohlerStudioCourseQuizComponent;
  let fixture: ComponentFixture<KohlerStudioCourseQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KohlerStudioCourseQuizComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KohlerStudioCourseQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
