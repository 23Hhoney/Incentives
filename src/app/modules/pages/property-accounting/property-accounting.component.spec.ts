import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyAccountingComponent } from './property-accounting.component';

describe('PropertyAccountingComponent', () => {
  let component: PropertyAccountingComponent;
  let fixture: ComponentFixture<PropertyAccountingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertyAccountingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyAccountingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
