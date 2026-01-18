import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KohlerStudioTextComponent } from './kohler-studio-text.component';

describe('KohlerStudioTextComponent', () => {
  let component: KohlerStudioTextComponent;
  let fixture: ComponentFixture<KohlerStudioTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KohlerStudioTextComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KohlerStudioTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
