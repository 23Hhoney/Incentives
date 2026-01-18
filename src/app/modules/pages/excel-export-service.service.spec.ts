import { TestBed } from '@angular/core/testing';

import { ExportExcelService } from './excel-export-service.service';

describe('ExcelExportServiceService', () => {
  let service: ExportExcelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportExcelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
