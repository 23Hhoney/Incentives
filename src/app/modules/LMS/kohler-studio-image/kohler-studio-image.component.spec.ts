import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KohlerStudioImageComponent } from './kohler-studio-image.component';

describe('KohlerStudioImageComponent', () => {
  let component: KohlerStudioImageComponent;
  let fixture: ComponentFixture<KohlerStudioImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KohlerStudioImageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KohlerStudioImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
