import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NamedBeneficiaryComponent } from './named-beneficiary.component';

describe('NamedBeneficiaryComponent', () => {
  let component: NamedBeneficiaryComponent;
  let fixture: ComponentFixture<NamedBeneficiaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NamedBeneficiaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NamedBeneficiaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
