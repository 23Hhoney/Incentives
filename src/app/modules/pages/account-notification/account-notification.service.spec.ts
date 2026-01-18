import { TestBed } from '@angular/core/testing';

import { AccountNotificationService } from './account-notification.service';

describe('AccountNotificationService', () => {
  let service: AccountNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
