import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KohlerStudioComponent } from './kohler-studio.component';

describe('KohlerStudioComponent', () => {
  let component: KohlerStudioComponent;
  let fixture: ComponentFixture<KohlerStudioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KohlerStudioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KohlerStudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
