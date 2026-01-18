import { TestBed } from '@angular/core/testing';

import { CalendarPickerViewService } from './calendar-picker-view.service';

describe('CalendarPickerViewService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CalendarPickerViewService = TestBed.get(CalendarPickerViewService);
    expect(service).toBeTruthy();
  });
});
