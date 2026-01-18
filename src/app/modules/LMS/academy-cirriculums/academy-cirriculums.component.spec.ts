import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademyCirriculumsComponent } from './academy-cirriculums.component';

describe('AcademyCirriculumsComponent', () => {
  let component: AcademyCirriculumsComponent;
  let fixture: ComponentFixture<AcademyCirriculumsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcademyCirriculumsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcademyCirriculumsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
