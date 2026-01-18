import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportQueueComponent } from './export-queue.component';

describe('ExportQueueComponent', () => {
  let component: ExportQueueComponent;
  let fixture: ComponentFixture<ExportQueueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExportQueueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportQueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
