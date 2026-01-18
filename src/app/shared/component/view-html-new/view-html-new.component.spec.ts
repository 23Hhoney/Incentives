import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewHtmlNewComponent } from './view-html-new.component';

describe('ViewHtmlNewComponent', () => {
  let component: ViewHtmlNewComponent;
  let fixture: ComponentFixture<ViewHtmlNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewHtmlNewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewHtmlNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
