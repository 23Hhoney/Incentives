import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailTemplateAddEditComponent } from './email-template-add-edit.component';

describe('EmailTemplateAddEditComponent', () => {
  let component: EmailTemplateAddEditComponent;
  let fixture: ComponentFixture<EmailTemplateAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmailTemplateAddEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailTemplateAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
