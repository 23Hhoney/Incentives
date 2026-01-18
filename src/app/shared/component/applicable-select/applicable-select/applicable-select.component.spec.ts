import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicableSelectComponent } from './applicable-select.component';

describe('ApplicableSelectComponent', () => {
  let component: ApplicableSelectComponent;
  let fixture: ComponentFixture<ApplicableSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicableSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicableSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
