import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersRewardsCreditReportComponent } from './users-rewards-credit-report.component';

describe('UsersRewardsCreditReportComponent', () => {
  let component: UsersRewardsCreditReportComponent;
  let fixture: ComponentFixture<UsersRewardsCreditReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsersRewardsCreditReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersRewardsCreditReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
