import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewHtmlComponent } from './view-html.component';

describe('ViewHtmlComponent', () => {
  let component: ViewHtmlComponent;
  let fixture: ComponentFixture<ViewHtmlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewHtmlComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewHtmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
