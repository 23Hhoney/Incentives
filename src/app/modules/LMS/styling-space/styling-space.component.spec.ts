import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StylingSpaceComponent } from './styling-space.component';

describe('StylingSpaceComponent', () => {
  let component: StylingSpaceComponent;
  let fixture: ComponentFixture<StylingSpaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StylingSpaceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StylingSpaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
