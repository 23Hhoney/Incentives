import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurriculumManagerAddEditComponent } from './curriculum-manager-add-edit.component';

describe('CurriculumManagerAddEditComponent', () => {
  let component: CurriculumManagerAddEditComponent;
  let fixture: ComponentFixture<CurriculumManagerAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CurriculumManagerAddEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurriculumManagerAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
