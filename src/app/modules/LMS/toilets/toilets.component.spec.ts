import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToiletsComponent } from './toilets.component';

describe('ToiletsComponent', () => {
  let component: ToiletsComponent;
  let fixture: ComponentFixture<ToiletsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ToiletsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToiletsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
