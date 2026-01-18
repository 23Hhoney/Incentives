import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KohlerStudioCourseResultComponent } from './kohler-studio-course-result.component';

describe('KohlerStudioCourseResultComponent', () => {
  let component: KohlerStudioCourseResultComponent;
  let fixture: ComponentFixture<KohlerStudioCourseResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KohlerStudioCourseResultComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KohlerStudioCourseResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
