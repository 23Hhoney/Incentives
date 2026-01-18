import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicUsersComponent } from './public-users.component';

describe('PublicUsersComponent', () => {
  let component: PublicUsersComponent;
  let fixture: ComponentFixture<PublicUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublicUsersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
