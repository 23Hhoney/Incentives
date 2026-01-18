import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingCoursesEditorComponent } from './training-courses-editor.component';

describe('TrainingCoursesEditorComponent', () => {
  let component: TrainingCoursesEditorComponent;
  let fixture: ComponentFixture<TrainingCoursesEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainingCoursesEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingCoursesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
