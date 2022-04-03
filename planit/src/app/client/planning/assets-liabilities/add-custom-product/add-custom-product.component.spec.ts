import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCustomProductComponent } from './add-custom-product.component';

describe('AddCustomProductComponent', () => {
  let component: AddCustomProductComponent;
  let fixture: ComponentFixture<AddCustomProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCustomProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCustomProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
