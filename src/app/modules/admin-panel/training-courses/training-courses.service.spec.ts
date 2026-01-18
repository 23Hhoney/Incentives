import { TestBed } from '@angular/core/testing';

import { TrainingCoursesService } from './training-courses.service';

describe('TrainingCoursesService', () => {
  let service: TrainingCoursesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainingCoursesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
