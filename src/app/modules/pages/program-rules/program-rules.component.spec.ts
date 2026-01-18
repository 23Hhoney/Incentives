import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramRulesComponent } from './program-rules.component';

describe('ProgramRulesComponent', () => {
  let component: ProgramRulesComponent;
  let fixture: ComponentFixture<ProgramRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgramRulesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
