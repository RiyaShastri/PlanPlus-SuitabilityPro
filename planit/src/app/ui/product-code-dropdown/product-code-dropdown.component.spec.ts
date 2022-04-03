import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCodeDropdownComponent } from './product-code-dropdown.component';

describe('ProductCodeDropdownComponent', () => {
  let component: ProductCodeDropdownComponent;
  let fixture: ComponentFixture<ProductCodeDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductCodeDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductCodeDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
