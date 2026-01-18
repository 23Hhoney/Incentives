import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserExportComponent } from './user-export.component';

describe('UserExportComponent', () => {
  let component: UserExportComponent;
  let fixture: ComponentFixture<UserExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserExportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
