import { TestBed } from '@angular/core/testing';

import { JwModalService } from './jw-modal.service';

describe('JwModalService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: JwModalService = TestBed.get(JwModalService);
    expect(service).toBeTruthy();
  });
});
