import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersRewardsRedemptionComponent } from './users-rewards-redemption.component';

describe('UsersRewardsRedemptionComponent', () => {
  let component: UsersRewardsRedemptionComponent;
  let fixture: ComponentFixture<UsersRewardsRedemptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsersRewardsRedemptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersRewardsRedemptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
