import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditNamedBeneficiaryComponent } from './edit-named-beneficiary.component';

describe('EditNamedBeneficiaryComponent', () => {
  let component: EditNamedBeneficiaryComponent;
  let fixture: ComponentFixture<EditNamedBeneficiaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditNamedBeneficiaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditNamedBeneficiaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
