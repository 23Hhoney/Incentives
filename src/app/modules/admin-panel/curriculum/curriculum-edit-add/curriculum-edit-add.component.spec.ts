import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurriculumEditAddComponent } from './curriculum-edit-add.component';

describe('CurriculumEditAddComponent', () => {
  let component: CurriculumEditAddComponent;
  let fixture: ComponentFixture<CurriculumEditAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CurriculumEditAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurriculumEditAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
