import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BathroomFaucetsComponent } from './bathroom-faucets.component';

describe('BathroomFaucetsComponent', () => {
  let component: BathroomFaucetsComponent;
  let fixture: ComponentFixture<BathroomFaucetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BathroomFaucetsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BathroomFaucetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
