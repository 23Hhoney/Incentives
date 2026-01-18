import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderRedemptionComponent } from './order-redemption.component';

describe('OrderRedemptionComponent', () => {
  let component: OrderRedemptionComponent;
  let fixture: ComponentFixture<OrderRedemptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderRedemptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderRedemptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
