import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramConfigurationComponent } from './program-configuration.component';

describe('ProgramConfigurationComponent', () => {
  let component: ProgramConfigurationComponent;
  let fixture: ComponentFixture<ProgramConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgramConfigurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
