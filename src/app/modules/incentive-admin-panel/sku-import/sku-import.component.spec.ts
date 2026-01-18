import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkuImportComponent } from './sku-import.component';

describe('SkuImportComponent', () => {
  let component: SkuImportComponent;
  let fixture: ComponentFixture<SkuImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SkuImportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkuImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
