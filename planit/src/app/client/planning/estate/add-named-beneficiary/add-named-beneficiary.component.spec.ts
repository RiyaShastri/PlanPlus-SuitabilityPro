import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNamedBeneficiaryComponent } from './add-named-beneficiary.component';

describe('AddNamedBeneficiaryComponent', () => {
  let component: AddNamedBeneficiaryComponent;
  let fixture: ComponentFixture<AddNamedBeneficiaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNamedBeneficiaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNamedBeneficiaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
