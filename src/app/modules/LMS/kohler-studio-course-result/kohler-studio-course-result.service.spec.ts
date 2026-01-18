import { TestBed } from '@angular/core/testing';

import { KohlerStudioCourseResultService } from './kohler-studio-course-result.service';

describe('KohlerStudioCourseResultService', () => {
  let service: KohlerStudioCourseResultService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KohlerStudioCourseResultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
