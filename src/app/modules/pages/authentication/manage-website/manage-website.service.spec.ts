import { TestBed } from '@angular/core/testing';

import { ManageWebsiteService } from './manage-website.service';

describe('ManageWebsiteService', () => {
  let service: ManageWebsiteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageWebsiteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
