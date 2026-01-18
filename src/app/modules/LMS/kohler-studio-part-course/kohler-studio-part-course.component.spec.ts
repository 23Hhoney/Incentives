import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KohlerStudioPartCourseComponent } from './kohler-studio-part-course.component';

describe('KohlerStudioPartCourseComponent', () => {
  let component: KohlerStudioPartCourseComponent;
  let fixture: ComponentFixture<KohlerStudioPartCourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KohlerStudioPartCourseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KohlerStudioPartCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
