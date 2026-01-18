import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointsCreditFileUploadComponent } from './points-credit-file-upload.component';

describe('PointsCreditFileUploadComponent', () => {
  let component: PointsCreditFileUploadComponent;
  let fixture: ComponentFixture<PointsCreditFileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PointsCreditFileUploadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointsCreditFileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
