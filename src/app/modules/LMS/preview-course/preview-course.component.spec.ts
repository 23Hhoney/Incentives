import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewCourseComponent } from './preview-course.component';

describe('PreviewCourseComponent', () => {
  let component: PreviewCourseComponent;
  let fixture: ComponentFixture<PreviewCourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewCourseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
