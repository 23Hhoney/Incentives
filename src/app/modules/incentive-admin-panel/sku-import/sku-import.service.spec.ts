import { TestBed } from '@angular/core/testing';

import { SkuImportService } from './sku-import.service';

describe('SkuImportService', () => {
  let service: SkuImportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SkuImportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
