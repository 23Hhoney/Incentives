import { TestBed } from '@angular/core/testing';

import { CalendarPickerService } from './calendar-picker.service';

describe('CalendarPickerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CalendarPickerService = TestBed.get(CalendarPickerService);
    expect(service).toBeTruthy();
  });
});
