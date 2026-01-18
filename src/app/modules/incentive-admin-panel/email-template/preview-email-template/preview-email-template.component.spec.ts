import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewEmailTemplateComponent } from './preview-email-template.component';

describe('PreviewEmailTemplateComponent', () => {
  let component: PreviewEmailTemplateComponent;
  let fixture: ComponentFixture<PreviewEmailTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewEmailTemplateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewEmailTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
