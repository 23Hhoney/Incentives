import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountNotificationComponent } from './account-notification.component';

describe('AccountNotificationComponent', () => {
  let component: AccountNotificationComponent;
  let fixture: ComponentFixture<AccountNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountNotificationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
