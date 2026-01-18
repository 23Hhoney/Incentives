import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarPickerViewComponent } from './calendar-picker-view.component';

describe('CalendarPickerViewComponent', () => {
  let component: CalendarPickerViewComponent;
  let fixture: ComponentFixture<CalendarPickerViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendarPickerViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarPickerViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
