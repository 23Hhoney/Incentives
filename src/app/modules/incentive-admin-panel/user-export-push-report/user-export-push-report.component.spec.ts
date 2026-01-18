import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserExportPushReportComponent } from './user-export-push-report.component';

describe('UserExportPushReportComponent', () => {
  let component: UserExportPushReportComponent;
  let fixture: ComponentFixture<UserExportPushReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserExportPushReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserExportPushReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
