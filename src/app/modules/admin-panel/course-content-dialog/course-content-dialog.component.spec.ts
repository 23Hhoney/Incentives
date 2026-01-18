import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseContentDialogComponent } from './course-content-dialog.component';

describe('CourseContentDialogComponent', () => {
  let component: CourseContentDialogComponent;
  let fixture: ComponentFixture<CourseContentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CourseContentDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseContentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
