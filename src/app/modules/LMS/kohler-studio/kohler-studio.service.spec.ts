import { TestBed } from '@angular/core/testing';

import { KohlerStudioService } from './kohler-studio.service';

describe('KohlerStudioService', () => {
  let service: KohlerStudioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KohlerStudioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
