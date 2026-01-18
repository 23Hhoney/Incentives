import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointsCreditManagerComponent } from './points-credit-manager.component';

describe('PointsCreditManagerComponent', () => {
  let component: PointsCreditManagerComponent;
  let fixture: ComponentFixture<PointsCreditManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PointsCreditManagerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointsCreditManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
