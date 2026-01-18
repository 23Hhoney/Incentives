import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReedemNeocurrencyLearnMoreComponent } from './reedem-neocurrency-learn-more.component';

describe('ReedemNeocurrencyLearnMoreComponent', () => {
  let component: ReedemNeocurrencyLearnMoreComponent;
  let fixture: ComponentFixture<ReedemNeocurrencyLearnMoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReedemNeocurrencyLearnMoreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReedemNeocurrencyLearnMoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
