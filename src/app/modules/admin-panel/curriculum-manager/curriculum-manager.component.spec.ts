import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurriculumManagerComponent } from './curriculum-manager.component';

describe('CurriculumManagerComponent', () => {
  let component: CurriculumManagerComponent;
  let fixture: ComponentFixture<CurriculumManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CurriculumManagerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurriculumManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
