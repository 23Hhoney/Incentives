import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyTrainingComponent } from './monthly-training.component';

describe('MonthlyTrainingComponent', () => {
  let component: MonthlyTrainingComponent;
  let fixture: ComponentFixture<MonthlyTrainingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonthlyTrainingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyTrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
