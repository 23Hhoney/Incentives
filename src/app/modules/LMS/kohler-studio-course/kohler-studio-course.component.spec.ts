import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KohlerStudioCourseComponent } from './kohler-studio-course.component';

describe('KohlerStudioCourseComponent', () => {
  let component: KohlerStudioCourseComponent;
  let fixture: ComponentFixture<KohlerStudioCourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KohlerStudioCourseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KohlerStudioCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
