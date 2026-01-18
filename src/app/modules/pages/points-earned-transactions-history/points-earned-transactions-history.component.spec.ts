import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointsEarnedTransactionsHistoryComponent } from './points-earned-transactions-history.component';

describe('PointsEarnedTransactionsHistoryComponent', () => {
  let component: PointsEarnedTransactionsHistoryComponent;
  let fixture: ComponentFixture<PointsEarnedTransactionsHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PointsEarnedTransactionsHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointsEarnedTransactionsHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
