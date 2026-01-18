import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LemsTimelineComponent } from './lems-timeline.component';

describe('LemsTimelineComponent', () => {
  let component: LemsTimelineComponent;
  let fixture: ComponentFixture<LemsTimelineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LemsTimelineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LemsTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
