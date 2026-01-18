import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LmsEditorComponent } from './lms-editor.component';

describe('LmsEditorComponent', () => {
  let component: LmsEditorComponent;
  let fixture: ComponentFixture<LmsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LmsEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LmsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
